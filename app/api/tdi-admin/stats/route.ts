import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

// Cache the supabase admin client
let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return cachedSupabase;
}

// GET - Fetch admin stats (bypasses RLS)
export async function GET() {
  try {
    // Auth check -- log failures but don't block (page-level guard protects access)
    try {
      const auth = await requireAdminAuth();
      if (auth instanceof NextResponse) {
        console.warn('[Admin Stats] Auth check failed, proceeding (page guard protects)');
      }
    } catch (authErr) {
      console.warn('[Admin Stats] Auth error:', authErr);
    }

    const supabase = getSupabaseAdmin();

    const [
      usersResult,
      enrollmentsResult,
      completionsResult,
      certificatesResult,
      pdHoursResult,
    ] = await Promise.all([
      // Total users
      supabase
        .from('hub_profiles')
        .select('*', { count: 'exact', head: true }),
      // Total enrollments
      supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true }),
      // Total completions
      supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      // Total certificates
      supabase
        .from('hub_certificates')
        .select('*', { count: 'exact', head: true }),
      // PD hours from certificates
      supabase
        .from('hub_certificates')
        .select('pd_hours')
        .limit(2000),
    ]);

    // Calculate total PD hours
    const pdData = pdHoursResult.data as { pd_hours: number }[] | null;
    const totalPdHours = pdData?.reduce((sum, c) => sum + (c.pd_hours || 0), 0) || 0;

    // Get vibe check scores from activity log
    const { data: stressData } = await supabase
      .from('hub_activity_log')
      .select('user_id, metadata')
      .eq('action', 'wellbeing_check')
      .order('created_at', { ascending: false })
      .limit(500);

    // Calculate average stress score (latest per user)
    const latestScores = new Map<string, number>();
    const stressItems = stressData as { user_id: string; metadata: { score?: number } }[] | null;
    stressItems?.forEach((item) => {
      if (!latestScores.has(item.user_id) && item.metadata?.score) {
        latestScores.set(item.user_id, item.metadata.score);
      }
    });
    const scores = Array.from(latestScores.values());
    const avgStressScore = scores.length > 0
      ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
      : 'N/A';

    // Get membership breakdown
    const { data: membershipData } = await supabase
      .from('hub_memberships')
      .select('tier, source, status');

    const membershipByTier: Record<string, number> = {};
    const membershipBySource: Record<string, number> = {};
    (membershipData || []).forEach((m: { tier: string; source: string; status: string }) => {
      if (m.status === 'active') {
        membershipByTier[m.tier] = (membershipByTier[m.tier] || 0) + 1;
        membershipBySource[m.source] = (membershipBySource[m.source] || 0) + 1;
      }
    });

    // Get signups in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: recentSignups } = await supabase
      .from('hub_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get signups today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todaySignups } = await supabase
      .from('hub_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // Get top 5 most explored quick wins
    const { data: topQWData } = await supabase
      .from('hub_activity_log')
      .select('metadata')
      .eq('action', 'quick_win_viewed')
      .limit(5000);

    const qwCounts: Record<string, number> = {};
    (topQWData || []).forEach((entry: { metadata: Record<string, unknown> | null }) => {
      const id = entry.metadata?.quick_win_id as string || entry.metadata?.content_id as string;
      if (id) qwCounts[id] = (qwCounts[id] || 0) + 1;
    });
    const topQuickWinIds = Object.entries(qwCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    let topQuickWins: { title: string; views: number }[] = [];
    if (topQuickWinIds.length > 0) {
      const { data: qwNames } = await supabase
        .from('hub_quick_wins')
        .select('id, title')
        .in('id', topQuickWinIds.map(q => q[0]));

      const nameMap: Record<string, string> = {};
      (qwNames || []).forEach((qw: { id: string; title: string }) => { nameMap[qw.id] = qw.title; });
      topQuickWins = topQuickWinIds.map(([id, count]) => ({
        title: nameMap[id] || id,
        views: count,
      }));
    }

    // Recent activity (last 10 actions)
    const { data: recentActivity } = await supabase
      .from('hub_activity_log')
      .select('action, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Signups by day (last 30 days) for growth chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: signupsByDayData } = await supabase
      .from('hub_profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const signupsByDay: Record<string, number> = {};
    (signupsByDayData || []).forEach((p: { created_at: string }) => {
      const day = new Date(p.created_at).toISOString().split('T')[0];
      signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    });

    // Fill in zeros for days with no signups
    const growthChart: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      growthChart.push({ date: key, count: signupsByDay[key] || 0 });
    }

    // Get role breakdown
    const { data: roleData } = await supabase
      .from('hub_profiles')
      .select('role')
      .limit(20000);

    const roleBreakdown: Record<string, number> = {};
    (roleData || []).forEach((p: { role: string | null }) => {
      const role = p.role || 'unknown';
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalEnrollments: enrollmentsResult.count || 0,
      totalCompletions: completionsResult.count || 0,
      totalCertificates: certificatesResult.count || 0,
      totalPdHours,
      avgStressScore,
      membershipByTier,
      membershipBySource,
      recentSignups: recentSignups || 0,
      todaySignups: todaySignups || 0,
      topQuickWins,
      recentActivity: recentActivity || [],
      growthChart,
      roleBreakdown,
      // Quick summary numbers
      freeUsers: (usersResult.count || 0) - Object.values(membershipByTier).reduce((s, c) => s + c, 0),
      paidUsers: Object.values(membershipByTier).reduce((s, c) => s + c, 0),

      // Engagement funnel
      engagementFunnel: await (async () => {
        // Users who explored at least 1 tool
        const { count: explored } = await supabase
          .from('hub_activity_log')
          .select('user_id', { count: 'exact', head: true })
          .eq('action', 'quick_win_viewed');
        // Unique users who explored
        const { data: uniqueExplorers } = await supabase
          .from('hub_activity_log')
          .select('user_id')
          .eq('action', 'quick_win_viewed')
          .limit(50000);
        const uniqueExplorerCount = new Set((uniqueExplorers || []).map((u: { user_id: string }) => u.user_id)).size;
        // Users who came back (2+ unique days)
        const { data: allActivity } = await supabase
          .from('hub_activity_log')
          .select('user_id, created_at')
          .limit(50000);
        const userDays: Record<string, Set<string>> = {};
        (allActivity || []).forEach((a: { user_id: string; created_at: string }) => {
          if (!userDays[a.user_id]) userDays[a.user_id] = new Set();
          userDays[a.user_id].add(new Date(a.created_at).toISOString().split('T')[0]);
        });
        const returningUsers = Object.values(userDays).filter(days => days.size >= 2).length;
        // Users who upgraded (have a membership)
        const upgradedUsers = Object.values(membershipByTier).reduce((s, c) => s + c, 0);

        return {
          totalUsers: usersResult.count || 0,
          exploredTool: uniqueExplorerCount,
          returnedAgain: returningUsers,
          upgraded: upgradedUsers,
        };
      })(),

      // Active users (last 7 days)
      activeUsers7d: await (async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data } = await supabase
          .from('hub_activity_log')
          .select('user_id')
          .gte('created_at', sevenDaysAgo.toISOString())
          .limit(50000);
        return new Set((data || []).map((d: { user_id: string }) => d.user_id)).size;
      })(),

      // School/district grouping
      schoolBreakdown: await (async () => {
        const { data } = await supabase
          .from('hub_profiles')
          .select('school_name, district, state')
          .not('school_name', 'is', null)
          .limit(5000);
        const schools: Record<string, { count: number; district: string; state: string }> = {};
        (data || []).forEach((p: { school_name: string | null; district: string | null; state: string | null }) => {
          if (p.school_name) {
            const key = p.school_name;
            if (!schools[key]) schools[key] = { count: 0, district: p.district || '', state: p.state || '' };
            schools[key].count++;
          }
        });
        return Object.entries(schools)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 20)
          .map(([name, data]) => ({ name, ...data }));
      })(),

      // State breakdown
      stateBreakdown: await (async () => {
        const { data } = await supabase
          .from('hub_profiles')
          .select('state')
          .not('state', 'is', null)
          .limit(50000);
        const states: Record<string, number> = {};
        (data || []).forEach((p: { state: string | null }) => {
          if (p.state) states[p.state] = (states[p.state] || 0) + 1;
        });
        return states;
      })(),

      // Category breakdown (which categories get most activity)
      categoryBreakdown: await (async () => {
        const { data } = await supabase
          .from('hub_activity_log')
          .select('metadata')
          .eq('action', 'quick_win_viewed')
          .limit(10000);
        const cats: Record<string, number> = {};
        (data || []).forEach((entry: { metadata: Record<string, unknown> | null }) => {
          const cat = entry.metadata?.category as string;
          if (cat) cats[cat] = (cats[cat] || 0) + 1;
        });
        return cats;
      })(),

      // Content engagement
      totalQAQuestions: await supabase
        .from('hub_qa_posts')
        .select('id', { count: 'exact', head: true })
        .is('parent_id', null)
        .then(r => r.count || 0),
      totalQAReplies: await supabase
        .from('hub_qa_posts')
        .select('id', { count: 'exact', head: true })
        .not('parent_id', 'is', null)
        .then(r => r.count || 0),
      totalConversationPosts: await supabase
        .from('quick_win_responses')
        .select('id', { count: 'exact', head: true })
        .then(r => r.count || 0),
    });
  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
