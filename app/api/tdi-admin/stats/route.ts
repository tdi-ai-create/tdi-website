import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    });
  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
