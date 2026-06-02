import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Hub Supabase client (read-only for admin portal connections)
let cachedHubClient: ReturnType<typeof createClient> | null = null;

function getHubClient() {
  if (cachedHubClient) return cachedHubClient;
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  cachedHubClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedHubClient;
}

type Section = 'leadership' | 'sales' | 'cmo' | 'creators' | 'funding' | 'operations';

// ── Leadership: educator engagement per school/district ──
async function getLeadershipData(hub: ReturnType<typeof createClient>) {
  // Get all profiles with school info
  const { data: profiles } = await hub
    .from('hub_profiles')
    .select('id, school_name, district, state, role, created_at')
    .not('school_name', 'is', null)
    .limit(10000);

  // Get activity counts per user (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: activity } = await hub
    .from('hub_activity_log')
    .select('user_id, action, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(50000);

  // Get enrollments and completions
  const { data: enrollments } = await hub
    .from('hub_enrollments')
    .select('user_id, status')
    .limit(10000);

  // Get certificates (PD hours)
  const { data: certs } = await hub
    .from('hub_certificates')
    .select('user_id, pd_hours')
    .limit(10000);

  // Get latest vibe check per user
  const { data: vibeChecks } = await hub
    .from('hub_activity_log')
    .select('user_id, metadata')
    .eq('action', 'wellbeing_check')
    .order('created_at', { ascending: false })
    .limit(5000);

  // Get memberships to know who has access
  const { data: memberships } = await hub
    .from('hub_memberships')
    .select('user_id, tier, source, status')
    .eq('status', 'active')
    .limit(10000);

  // Build per-user activity map
  const userActivity: Record<string, { logins: number; toolsViewed: number; days: Set<string> }> = {};
  (activity || []).forEach((a: { user_id: string; action: string; created_at: string }) => {
    if (!userActivity[a.user_id]) userActivity[a.user_id] = { logins: 0, toolsViewed: 0, days: new Set() };
    userActivity[a.user_id].days.add(new Date(a.created_at).toISOString().split('T')[0]);
    if (a.action === 'hub_login') userActivity[a.user_id].logins++;
    if (a.action === 'quick_win_viewed') userActivity[a.user_id].toolsViewed++;
  });

  // Build per-user PD hours
  const userPdHours: Record<string, number> = {};
  (certs || []).forEach((c: { user_id: string; pd_hours: number }) => {
    userPdHours[c.user_id] = (userPdHours[c.user_id] || 0) + (c.pd_hours || 0);
  });

  // Build per-user vibe scores (latest only)
  const userVibeScore: Record<string, number> = {};
  (vibeChecks || []).forEach((v: { user_id: string; metadata: { score?: number } }) => {
    if (!userVibeScore[v.user_id] && v.metadata?.score) {
      userVibeScore[v.user_id] = v.metadata.score;
    }
  });

  // Build per-user completion count
  const userCompletions: Record<string, number> = {};
  (enrollments || []).forEach((e: { user_id: string; status: string }) => {
    if (e.status === 'completed') userCompletions[e.user_id] = (userCompletions[e.user_id] || 0) + 1;
  });

  // Membership map
  const userMembership: Record<string, { tier: string; source: string }> = {};
  (memberships || []).forEach((m: { user_id: string; tier: string; source: string }) => {
    userMembership[m.user_id] = { tier: m.tier, source: m.source };
  });

  // Group by school
  const schoolMap: Record<string, {
    name: string;
    district: string;
    state: string;
    educators: { id: string; role: string; logins: number; toolsViewed: number; activeDays: number; pdHours: number; vibeScore: number | null; completions: number; tier: string; source: string }[];
  }> = {};

  (profiles || []).forEach((p: { id: string; school_name: string | null; district: string | null; state: string | null; role: string | null }) => {
    if (!p.school_name) return;
    const key = p.school_name;
    if (!schoolMap[key]) schoolMap[key] = { name: p.school_name, district: p.district || '', state: p.state || '', educators: [] };

    const ua = userActivity[p.id];
    const membership = userMembership[p.id];

    schoolMap[key].educators.push({
      id: p.id,
      role: p.role || 'unknown',
      logins: ua?.logins || 0,
      toolsViewed: ua?.toolsViewed || 0,
      activeDays: ua?.days.size || 0,
      pdHours: userPdHours[p.id] || 0,
      vibeScore: userVibeScore[p.id] ?? null,
      completions: userCompletions[p.id] || 0,
      tier: membership?.tier || 'free',
      source: membership?.source || 'organic',
    });
  });

  // Build school summaries
  const schools = Object.values(schoolMap)
    .map(school => {
      const total = school.educators.length;
      const active = school.educators.filter(e => e.activeDays > 0).length;
      const vibeScores = school.educators.filter(e => e.vibeScore !== null).map(e => e.vibeScore as number);
      const avgVibe = vibeScores.length > 0 ? +(vibeScores.reduce((s, v) => s + v, 0) / vibeScores.length).toFixed(1) : null;
      const totalPdHours = school.educators.reduce((s, e) => s + e.pdHours, 0);
      const totalToolsViewed = school.educators.reduce((s, e) => s + e.toolsViewed, 0);
      const totalCompletions = school.educators.reduce((s, e) => s + e.completions, 0);

      return {
        name: school.name,
        district: school.district,
        state: school.state,
        totalEducators: total,
        activeEducators: active,
        activeRate: total > 0 ? +((active / total) * 100).toFixed(0) : 0,
        avgVibeScore: avgVibe,
        totalPdHours,
        totalToolsViewed,
        totalCompletions,
        educators: school.educators,
      };
    })
    .sort((a, b) => b.totalEducators - a.totalEducators)
    .slice(0, 50);

  return { schools };
}

// ── Sales: warm leads from Hub signups ──
async function getSalesData(hub: ReturnType<typeof createClient>) {
  // Get all profiles with email domains
  const { data: profiles } = await hub
    .from('hub_profiles')
    .select('id, email, school_name, district, state, role, created_at')
    .limit(50000);

  // Get memberships
  const { data: memberships } = await hub
    .from('hub_memberships')
    .select('user_id, tier, source, status')
    .eq('status', 'active')
    .limit(10000);

  const memberSet = new Set((memberships || []).map((m: { user_id: string }) => m.user_id));

  // Group free users by email domain (school domains = warm leads)
  const domainMap: Record<string, { count: number; school: string; district: string; state: string; emails: string[] }> = {};
  const eduDomains = new Set<string>();

  (profiles || []).forEach((p: { id: string; email: string | null; school_name: string | null; district: string | null; state: string | null }) => {
    if (!p.email || memberSet.has(p.id)) return; // Skip paid users
    const domain = p.email.split('@')[1]?.toLowerCase();
    if (!domain) return;

    // Identify education domains (k12, edu, school patterns)
    const isEdu = domain.endsWith('.edu') || domain.includes('k12') || domain.includes('school') || domain.includes('isd.') || domain.includes('cusd.') || domain.includes('usd.');
    if (isEdu) eduDomains.add(domain);

    if (!domainMap[domain]) domainMap[domain] = { count: 0, school: '', district: '', state: '', emails: [] };
    domainMap[domain].count++;
    if (p.school_name && !domainMap[domain].school) domainMap[domain].school = p.school_name;
    if (p.district && !domainMap[domain].district) domainMap[domain].district = p.district;
    if (p.state && !domainMap[domain].state) domainMap[domain].state = p.state;
    if (domainMap[domain].emails.length < 5) domainMap[domain].emails.push(p.email);
  });

  // Warm leads: edu domains with 2+ free users
  const warmLeads = Object.entries(domainMap)
    .filter(([domain, data]) => eduDomains.has(domain) && data.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 30)
    .map(([domain, data]) => ({
      domain,
      freeUsers: data.count,
      school: data.school,
      district: data.district,
      state: data.state,
      sampleEmails: data.emails,
    }));

  // District adoption: paid users per district
  const districtAdoption: Record<string, { paid: number; free: number; total: number; state: string }> = {};
  (profiles || []).forEach((p: { id: string; district: string | null; state: string | null }) => {
    if (!p.district) return;
    if (!districtAdoption[p.district]) districtAdoption[p.district] = { paid: 0, free: 0, total: 0, state: p.state || '' };
    districtAdoption[p.district].total++;
    if (memberSet.has(p.id)) districtAdoption[p.district].paid++;
    else districtAdoption[p.district].free++;
  });

  const topDistricts = Object.entries(districtAdoption)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20)
    .map(([name, data]) => ({ name, ...data }));

  // Signups this week (momentum indicator for sales)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentSignups = (profiles || []).filter((p: { created_at: string }) => new Date(p.created_at) >= weekAgo).length;

  return { warmLeads, topDistricts, recentSignups, totalFreeUsers: (profiles || []).length - memberSet.size };
}

// ── CMO: signup sources and content performance ──
async function getCmoData(hub: ReturnType<typeof createClient>) {
  // Signup sources (from memberships)
  const { data: memberships } = await hub
    .from('hub_memberships')
    .select('source, tier, created_at')
    .eq('status', 'active')
    .limit(10000);

  const sourceBreakdown: Record<string, number> = {};
  (memberships || []).forEach((m: { source: string }) => {
    sourceBreakdown[m.source] = (sourceBreakdown[m.source] || 0) + 1;
  });

  // Signups over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentProfiles } = await hub
    .from('hub_profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(50000);

  const signupsByDay: Record<string, number> = {};
  (recentProfiles || []).forEach((p: { created_at: string }) => {
    const day = new Date(p.created_at).toISOString().split('T')[0];
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  });

  // Most viewed quick wins (content performance for marketing)
  const { data: qwViews } = await hub
    .from('hub_activity_log')
    .select('metadata')
    .eq('action', 'quick_win_viewed')
    .limit(10000);

  const qwCounts: Record<string, number> = {};
  (qwViews || []).forEach((entry: { metadata: Record<string, unknown> | null }) => {
    const id = entry.metadata?.quick_win_id as string || entry.metadata?.content_id as string;
    if (id) qwCounts[id] = (qwCounts[id] || 0) + 1;
  });

  const topContentIds = Object.entries(qwCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  let topContent: { title: string; views: number }[] = [];
  if (topContentIds.length > 0) {
    const { data: qwNames } = await hub
      .from('hub_quick_wins')
      .select('id, title')
      .in('id', topContentIds.map(q => q[0]));
    const nameMap: Record<string, string> = {};
    (qwNames || []).forEach((qw: { id: string; title: string }) => { nameMap[qw.id] = qw.title; });
    topContent = topContentIds.map(([id, count]) => ({ title: nameMap[id] || id, views: count }));
  }

  // Community engagement (shareable content)
  const { count: totalResponses } = await hub
    .from('quick_win_responses')
    .select('id', { count: 'exact', head: true });
  const { count: totalQA } = await hub
    .from('hub_qa_posts')
    .select('id', { count: 'exact', head: true });

  // State distribution (geographic reach for marketing)
  const { data: stateData } = await hub
    .from('hub_profiles')
    .select('state')
    .not('state', 'is', null)
    .limit(50000);

  const stateBreakdown: Record<string, number> = {};
  (stateData || []).forEach((p: { state: string | null }) => {
    if (p.state) stateBreakdown[p.state] = (stateBreakdown[p.state] || 0) + 1;
  });

  return {
    membershipSources: sourceBreakdown,
    signupsByDay,
    topContent,
    communityEngagement: { responses: totalResponses || 0, qaThreads: totalQA || 0 },
    stateReach: stateBreakdown,
    totalStates: Object.keys(stateBreakdown).length,
  };
}

// ── Creators: content impact scores ──
async function getCreatorsData(hub: ReturnType<typeof createClient>) {
  // Get all quick wins with their categories
  const { data: quickWins } = await hub
    .from('hub_quick_wins')
    .select('id, title, category, creator_name')
    .limit(500);

  // Get view counts
  const { data: views } = await hub
    .from('hub_activity_log')
    .select('metadata')
    .eq('action', 'quick_win_viewed')
    .limit(50000);

  const viewCounts: Record<string, number> = {};
  (views || []).forEach((entry: { metadata: Record<string, unknown> | null }) => {
    const id = entry.metadata?.quick_win_id as string || entry.metadata?.content_id as string;
    if (id) viewCounts[id] = (viewCounts[id] || 0) + 1;
  });

  // Get community responses per content
  const { data: responses } = await hub
    .from('quick_win_responses')
    .select('quick_win_id')
    .limit(10000);

  const responseCounts: Record<string, number> = {};
  (responses || []).forEach((r: { quick_win_id: string }) => {
    responseCounts[r.quick_win_id] = (responseCounts[r.quick_win_id] || 0) + 1;
  });

  // Get Q&A counts per content
  const { data: qaData } = await hub
    .from('hub_qa_posts')
    .select('content_id')
    .eq('content_type', 'quick_win')
    .limit(10000);

  const qaCounts: Record<string, number> = {};
  (qaData || []).forEach((q: { content_id: string }) => {
    qaCounts[q.content_id] = (qaCounts[q.content_id] || 0) + 1;
  });

  // Build content impact scores
  const contentScores = (quickWins || []).map((qw: { id: string; title: string; category: string | null; creator_name: string | null }) => ({
    id: qw.id,
    title: qw.title,
    category: qw.category || 'uncategorized',
    creator: qw.creator_name || 'TDI',
    views: viewCounts[qw.id] || 0,
    communityResponses: responseCounts[qw.id] || 0,
    qaThreads: qaCounts[qw.id] || 0,
    impactScore: (viewCounts[qw.id] || 0) + ((responseCounts[qw.id] || 0) * 5) + ((qaCounts[qw.id] || 0) * 3),
  })).sort((a: { impactScore: number }, b: { impactScore: number }) => b.impactScore - a.impactScore);

  // Category performance
  const categoryPerformance: Record<string, { views: number; responses: number; qaThreads: number; contentCount: number }> = {};
  contentScores.forEach((c: { category: string; views: number; communityResponses: number; qaThreads: number }) => {
    if (!categoryPerformance[c.category]) categoryPerformance[c.category] = { views: 0, responses: 0, qaThreads: 0, contentCount: 0 };
    categoryPerformance[c.category].views += c.views;
    categoryPerformance[c.category].responses += c.communityResponses;
    categoryPerformance[c.category].qaThreads += c.qaThreads;
    categoryPerformance[c.category].contentCount++;
  });

  // Content requests from educators
  const { data: contentRequests } = await hub
    .from('hub_activity_log')
    .select('metadata, created_at')
    .eq('action', 'content_request')
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    topContent: contentScores.slice(0, 20),
    categoryPerformance,
    contentRequests: (contentRequests || []).map((r: { metadata: Record<string, unknown> | null; created_at: string }) => ({
      request: r.metadata?.request || r.metadata?.description || 'Unknown',
      date: r.created_at,
    })),
    totalContent: contentScores.length,
  };
}

// ── Funding: impact metrics for grants ──
async function getFundingData(hub: ReturnType<typeof createClient>) {
  const [
    { count: totalUsers },
    { count: totalCerts },
    { count: totalEnrollments },
    { count: totalCompletions },
  ] = await Promise.all([
    hub.from('hub_profiles').select('id', { count: 'exact', head: true }),
    hub.from('hub_certificates').select('id', { count: 'exact', head: true }),
    hub.from('hub_enrollments').select('id', { count: 'exact', head: true }),
    hub.from('hub_enrollments').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
  ]);

  // PD hours
  const { data: pdData } = await hub.from('hub_certificates').select('pd_hours').limit(5000);
  const totalPdHours = (pdData || []).reduce((sum: number, c: { pd_hours: number }) => sum + (c.pd_hours || 0), 0);

  // State reach
  const { data: stateData } = await hub
    .from('hub_profiles')
    .select('state')
    .not('state', 'is', null)
    .limit(50000);
  const states = new Set((stateData || []).map((p: { state: string }) => p.state));

  // Role breakdown (for "who we serve")
  const { data: roleData } = await hub.from('hub_profiles').select('role').limit(50000);
  const roleBreakdown: Record<string, number> = {};
  (roleData || []).forEach((p: { role: string | null }) => {
    const role = p.role || 'educator';
    roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
  });

  // Community engagement
  const { count: qaCount } = await hub.from('hub_qa_posts').select('id', { count: 'exact', head: true });
  const { count: responseCount } = await hub.from('quick_win_responses').select('id', { count: 'exact', head: true });

  // Quick wins available
  const { count: qwCount } = await hub.from('hub_quick_wins').select('id', { count: 'exact', head: true });

  return {
    impactMetrics: {
      totalEducators: totalUsers || 0,
      statesReached: states.size,
      pdHoursDelivered: totalPdHours,
      certificatesEarned: totalCerts || 0,
      totalEnrollments: totalEnrollments || 0,
      courseCompletions: totalCompletions || 0,
      communityContributions: (qaCount || 0) + (responseCount || 0),
      toolsAvailable: qwCount || 0,
    },
    roleBreakdown,
    statesServed: Array.from(states).sort(),
  };
}

// ── Operations: contract fulfillment ──
async function getOperationsData(hub: ReturnType<typeof createClient>) {
  // Get all partner memberships (source = district_partner or admin_assigned)
  const { data: partnerMembers } = await hub
    .from('hub_memberships')
    .select('user_id, tier, source, status, created_at')
    .in('source', ['district_partner', 'admin_assigned'])
    .limit(10000);

  // Get profiles for these users
  const partnerUserIds = (partnerMembers || []).map((m: { user_id: string }) => m.user_id);
  let partnerProfiles: { id: string; school_name: string | null; district: string | null; state: string | null }[] = [];
  if (partnerUserIds.length > 0) {
    const { data } = await hub
      .from('hub_profiles')
      .select('id, school_name, district, state')
      .in('id', partnerUserIds.slice(0, 500));
    partnerProfiles = data || [];
  }

  // Get activity for partner users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  let partnerActivity: { user_id: string; action: string }[] = [];
  if (partnerUserIds.length > 0) {
    const { data } = await hub
      .from('hub_activity_log')
      .select('user_id, action')
      .in('user_id', partnerUserIds.slice(0, 500))
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(50000);
    partnerActivity = data || [];
  }

  // Build per-district fulfillment
  const profileMap: Record<string, { school: string; district: string; state: string }> = {};
  partnerProfiles.forEach(p => {
    profileMap[p.id] = { school: p.school_name || '', district: p.district || 'Unknown', state: p.state || '' };
  });

  const activePartnerUsers = new Set(partnerActivity.map(a => a.user_id));
  const districtFulfillment: Record<string, { provisioned: number; active: number; district: string; state: string }> = {};

  (partnerMembers || []).forEach((m: { user_id: string; status: string }) => {
    const profile = profileMap[m.user_id];
    const district = profile?.district || 'Unknown';
    if (!districtFulfillment[district]) districtFulfillment[district] = { provisioned: 0, active: 0, district, state: profile?.state || '' };
    if (m.status === 'active') districtFulfillment[district].provisioned++;
    if (activePartnerUsers.has(m.user_id)) districtFulfillment[district].active++;
  });

  const fulfillment = Object.values(districtFulfillment)
    .map(d => ({
      ...d,
      usageRate: d.provisioned > 0 ? +((d.active / d.provisioned) * 100).toFixed(0) : 0,
    }))
    .sort((a, b) => b.provisioned - a.provisioned);

  const totalProvisioned = fulfillment.reduce((s, d) => s + d.provisioned, 0);
  const totalActive = fulfillment.reduce((s, d) => s + d.active, 0);

  return {
    partnerFulfillment: fulfillment,
    summary: {
      totalPartnerUsers: totalProvisioned,
      activePartnerUsers: totalActive,
      overallUsageRate: totalProvisioned > 0 ? +((totalActive / totalProvisioned) * 100).toFixed(0) : 0,
      totalDistricts: fulfillment.length,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get('section') as Section;
    if (!section) {
      return NextResponse.json({ error: 'Missing section parameter' }, { status: 400 });
    }

    const hub = getHubClient();

    switch (section) {
      case 'leadership':
        return NextResponse.json(await getLeadershipData(hub));
      case 'sales':
        return NextResponse.json(await getSalesData(hub));
      case 'cmo':
        return NextResponse.json(await getCmoData(hub));
      case 'creators':
        return NextResponse.json(await getCreatorsData(hub));
      case 'funding':
        return NextResponse.json(await getFundingData(hub));
      case 'operations':
        return NextResponse.json(await getOperationsData(hub));
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Hub Connections API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
