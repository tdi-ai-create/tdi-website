// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/olivia-weekly-briefing
 *
 * Monday 7 AM CT. Olivia sends Rae a strategic weekly briefing with:
 * 1. Hub growth trends (week-over-week, course performance, top content)
 * 2. Sales pipeline velocity & conversion (stage movement, win rate, forecast)
 * 3. Partnership portfolio health summary
 * 4. Paperclip ops summary (restarts, issues)
 * 5. Key actions for the week ahead
 *
 * Complements the daily briefing with trend data, not just snapshots.
 */

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // Auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    const hubSupabase = hubUrl && hubKey
      ? createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const lastWeekStart = new Date(now.getTime() - 14 * 86400000).toISOString();
    const thisWeekEnd = now.toISOString();

    // --- Gather all data ---
    const [hub, sales, partnerships] = await Promise.all([
      gatherWeeklyHubData(hubSupabase, thisWeekStart, lastWeekStart, thisWeekEnd),
      gatherWeeklySalesData(supabase, thisWeekStart, lastWeekStart),
      gatherWeeklyPartnershipData(supabase),
    ]);

    // --- Build report ---
    const weekLabel = `Week of ${new Date(now.getTime() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -- ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const subject = `Weekly Briefing -- ${weekLabel}`;
    const content = buildWeeklyReport(weekLabel, hub, sales, partnerships);

    // Send via Olivia
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';
    const reportSecret = process.env.PAPERCLIP_REPORT_SECRET;

    if (!reportSecret) {
      return NextResponse.json({ error: 'Missing report secret' }, { status: 500 });
    }

    const sendRes = await fetch(`${siteUrl}/api/paperclip/send-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${reportSecret}`,
      },
      body: JSON.stringify({ subject, content }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json().catch(() => ({}));
      console.error('[olivia-weekly-briefing] Send failed:', err);
      return NextResponse.json({ error: 'Failed to send briefing', details: err }, { status: 502 });
    }

    console.log('[olivia-weekly-briefing] Sent:', subject);
    return NextResponse.json({ success: true, subject, timestamp });
  } catch (error) {
    console.error('[olivia-weekly-briefing] Error:', error);
    return NextResponse.json({ error: String(error), timestamp }, { status: 500 });
  }
}

// ============================================================
// Data Gathering
// ============================================================

interface WeeklyHubData {
  // This week
  signupsThisWeek: number;
  enrollmentsThisWeek: number;
  completionsThisWeek: number;
  certificatesThisWeek: number;
  pdHoursThisWeek: number;
  // Last week (for comparison)
  signupsLastWeek: number;
  enrollmentsLastWeek: number;
  completionsLastWeek: number;
  // Totals
  totalUsers: number;
  totalPdHours: number;
  // Course performance
  topCourses: { title: string; enrollments: number; completions: number; rate: number }[];
  // Demographics
  spanishUsers: number;
  topStates: { state: string; count: number }[];
  topRoles: { role: string; count: number }[];
}

async function gatherWeeklyHubData(
  hubSupabase: any,
  thisWeekStart: string,
  lastWeekStart: string,
  _thisWeekEnd: string,
): Promise<WeeklyHubData> {
  const empty: WeeklyHubData = {
    signupsThisWeek: 0, enrollmentsThisWeek: 0, completionsThisWeek: 0,
    certificatesThisWeek: 0, pdHoursThisWeek: 0,
    signupsLastWeek: 0, enrollmentsLastWeek: 0, completionsLastWeek: 0,
    totalUsers: 0, totalPdHours: 0,
    topCourses: [], spanishUsers: 0, topStates: [], topRoles: [],
  };

  if (!hubSupabase) return empty;

  try {
    // Profiles
    const { data: allProfiles } = await hubSupabase
      .from('hub_profiles')
      .select('id, role, preferences, onboarding_data, created_at')
      .limit(5000);
    const profiles = allProfiles || [];

    const signupsThisWeek = profiles.filter(p => p.created_at >= thisWeekStart).length;
    const signupsLastWeek = profiles.filter(p => p.created_at >= lastWeekStart && p.created_at < thisWeekStart).length;

    // Enrollments
    const { data: allEnrollments } = await hubSupabase
      .from('hub_enrollments')
      .select('id, course_id, status, created_at, completed_at')
      .limit(5000);
    const enrollments = allEnrollments || [];

    const enrollThisWeek = enrollments.filter(e => e.created_at >= thisWeekStart);
    const enrollLastWeek = enrollments.filter(e => e.created_at >= lastWeekStart && e.created_at < thisWeekStart);
    const completionsThisWeek = enrollments.filter(e => e.completed_at && e.completed_at >= thisWeekStart).length;
    const completionsLastWeek = enrollments.filter(e => e.completed_at && e.completed_at >= lastWeekStart && e.completed_at < thisWeekStart).length;

    // Certificates
    const { data: allCerts } = await hubSupabase
      .from('hub_certificates')
      .select('pd_hours, issued_at');
    const certs = allCerts || [];
    const certsThisWeek = certs.filter(c => c.issued_at >= thisWeekStart);

    // Courses
    const { data: courses } = await hubSupabase
      .from('hub_courses')
      .select('id, title')
      .eq('is_published', true);
    const courseMap = new Map((courses || []).map(c => [c.id, c.title]));

    // Course performance
    const courseStats: Record<string, { enrolled: number; completed: number }> = {};
    enrollments.forEach(e => {
      if (!courseStats[e.course_id]) courseStats[e.course_id] = { enrolled: 0, completed: 0 };
      courseStats[e.course_id].enrolled++;
      if (e.status === 'completed') courseStats[e.course_id].completed++;
    });

    const topCourses = Object.entries(courseStats)
      .map(([id, s]) => ({
        title: (courseMap.get(id) as string) || 'Unknown',
        enrollments: s.enrolled,
        completions: s.completed,
        rate: s.enrolled > 0 ? Math.round((s.completed / s.enrolled) * 100) : 0,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Demographics
    const spanishUsers = profiles.filter(
      p => (p.preferences as { preferred_language?: string } | null)?.preferred_language === 'spanish'
    ).length;

    const stateCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = {};
    profiles.forEach(p => {
      const state = (p.onboarding_data as { state?: string } | null)?.state;
      if (state) stateCounts[state] = (stateCounts[state] || 0) + 1;
      const role = p.role || 'teacher';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));

    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({
        role: role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        count,
      }));

    return {
      signupsThisWeek,
      enrollmentsThisWeek: enrollThisWeek.length,
      completionsThisWeek,
      certificatesThisWeek: certsThisWeek.length,
      pdHoursThisWeek: certsThisWeek.reduce((s, c) => s + (c.pd_hours || 0), 0),
      signupsLastWeek,
      enrollmentsLastWeek: enrollLastWeek.length,
      completionsLastWeek,
      totalUsers: profiles.length,
      totalPdHours: certs.reduce((s, c) => s + (c.pd_hours || 0), 0),
      topCourses,
      spanishUsers,
      topStates,
      topRoles,
    };
  } catch (err) {
    console.error('[olivia-weekly-briefing] Hub query error:', err);
    return empty;
  }
}

interface WeeklySalesData {
  totalActive: number;
  totalPipelineValue: number;
  factoredValue: number;
  wonThisWeek: number;
  wonValueThisWeek: number;
  lostThisWeek: number;
  newLeadsThisWeek: number;
  newLeadsLastWeek: number;
  hotCount: number;
  staleCount: number;
  winRate: number;
  byStage: Record<string, { count: number; value: number }>;
  topNewLeads: { name: string; value: number; stage: string }[];
}

async function gatherWeeklySalesData(
  supabase: any,
  thisWeekStart: string,
  lastWeekStart: string,
): Promise<WeeklySalesData> {
  const empty: WeeklySalesData = {
    totalActive: 0, totalPipelineValue: 0, factoredValue: 0,
    wonThisWeek: 0, wonValueThisWeek: 0, lostThisWeek: 0,
    newLeadsThisWeek: 0, newLeadsLastWeek: 0,
    hotCount: 0, staleCount: 0, winRate: 0,
    byStage: {}, topNewLeads: [],
  };

  try {
    const { data: opps } = await supabase
      .from('sales_opportunities')
      .select('id, name, stage, value, probability, heat, last_activity_at, created_at, updated_at')
      .is('deleted_at', null);

    if (!opps) return empty;

    const active = opps.filter(o => !['lost', 'paid'].includes(o.stage));
    const won = opps.filter(o => o.stage === 'paid');
    const lost = opps.filter(o => o.stage === 'lost');

    const wonThisWeek = won.filter(o => o.updated_at >= thisWeekStart);
    const lostThisWeek = lost.filter(o => o.updated_at >= thisWeekStart);
    const newThisWeek = opps.filter(o => o.created_at >= thisWeekStart && o.stage !== 'lost');
    const newLastWeek = opps.filter(o => o.created_at >= lastWeekStart && o.created_at < thisWeekStart && o.stage !== 'lost');

    const reachedQualified = opps.filter(o =>
      ['qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid', 'lost'].includes(o.stage)
    ).length;
    const winRate = reachedQualified > 0 ? Math.round((won.length / reachedQualified) * 100) : 0;

    const staleThreshold = 14;
    const staleCount = active.filter(o => {
      const days = o.last_activity_at
        ? Math.floor((Date.now() - new Date(o.last_activity_at).getTime()) / 86400000)
        : 999;
      return days > staleThreshold;
    }).length;

    const stages = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid'];
    const byStage: Record<string, { count: number; value: number }> = {};
    stages.forEach(s => {
      const stageOpps = opps.filter(o => o.stage === s);
      byStage[s] = {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + (o.value || 0), 0),
      };
    });

    const topNewLeads = newThisWeek
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(o => ({ name: o.name, value: o.value || 0, stage: o.stage }));

    return {
      totalActive: active.length,
      totalPipelineValue: active.reduce((s, o) => s + (o.value || 0), 0),
      factoredValue: active.reduce((s, o) => s + (o.value || 0) * (o.probability || 0) / 100, 0),
      wonThisWeek: wonThisWeek.length,
      wonValueThisWeek: wonThisWeek.reduce((s, o) => s + (o.value || 0), 0),
      lostThisWeek: lostThisWeek.length,
      newLeadsThisWeek: newThisWeek.length,
      newLeadsLastWeek: newLastWeek.length,
      hotCount: active.filter(o => o.heat === 'hot').length,
      staleCount,
      winRate,
      byStage,
      topNewLeads,
    };
  } catch (err) {
    console.error('[olivia-weekly-briefing] Sales query error:', err);
    return empty;
  }
}

interface WeeklyPartnershipData {
  totalActive: number;
  strongCount: number;
  buildingCount: number;
  needsAttentionCount: number;
  atRiskKpis: number;
  recentFlags: number;
  partnerDetails: { name: string; health: string; loginPct: number; flags: number }[];
}

async function gatherWeeklyPartnershipData(
  supabase: any,
): Promise<WeeklyPartnershipData> {
  const empty: WeeklyPartnershipData = {
    totalActive: 0, strongCount: 0, buildingCount: 0, needsAttentionCount: 0,
    atRiskKpis: 0, recentFlags: 0, partnerDetails: [],
  };

  try {
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, staff_enrolled')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) return empty;

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    let strong = 0, building = 0, needsAttention = 0, totalFlags = 0, riskKpis = 0;
    const details: WeeklyPartnershipData['partnerDetails'] = [];

    for (const p of partnerships) {
      const { data: staff } = await supabase
        .from('staff_members')
        .select('hub_login_date')
        .eq('partnership_id', p.id);

      const totalStaff = staff?.length || p.staff_enrolled || 0;
      const loggedIn = staff?.filter((s: { hub_login_date: string | null }) => s.hub_login_date).length || 0;
      const loginPct = totalStaff > 0 ? Math.round((loggedIn / totalStaff) * 100) : 0;

      const { count: flags } = await supabase
        .from('partnership_notes')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_id', p.id)
        .eq('note_type', 'concern')
        .gte('created_at', weekAgo);

      const { data: kpis } = await supabase
        .from('partnership_kpis')
        .select('status')
        .eq('partnership_id', p.id)
        .eq('status', 'at_risk');

      totalFlags += flags || 0;
      riskKpis += kpis?.length || 0;

      let health = 'Building';
      if (loginPct >= 60 && (flags || 0) === 0) { strong++; health = 'Strong'; }
      else if (loginPct >= 30) { building++; }
      else { needsAttention++; health = 'Needs Attention'; }

      details.push({ name: p.contact_name, health, loginPct, flags: flags || 0 });
    }

    return {
      totalActive: partnerships.length,
      strongCount: strong,
      buildingCount: building,
      needsAttentionCount: needsAttention,
      atRiskKpis: riskKpis,
      recentFlags: totalFlags,
      partnerDetails: details.sort((a, b) => a.loginPct - b.loginPct),
    };
  } catch (err) {
    console.error('[olivia-weekly-briefing] Partnership query error:', err);
    return empty;
  }
}

// ============================================================
// Report Builder
// ============================================================

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function trend(current: number, previous: number): string {
  if (previous === 0 && current === 0) return 'flat';
  if (previous === 0) return `+${current} (new)`;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return 'flat';
}

function buildWeeklyReport(
  weekLabel: string,
  hub: WeeklyHubData,
  sales: WeeklySalesData,
  partnerships: WeeklyPartnershipData,
): string {
  const s: string[] = [];

  s.push(`# Weekly Strategic Briefing`);
  s.push(`*${weekLabel}*`);
  s.push('');

  // --- Executive Summary ---
  s.push(`## Executive Summary`);
  s.push('');
  s.push(`| Area | This Week | vs Last Week |`);
  s.push(`| --- | --- | --- |`);
  s.push(`| Hub Signups | ${hub.signupsThisWeek} | ${trend(hub.signupsThisWeek, hub.signupsLastWeek)} |`);
  s.push(`| Hub Enrollments | ${hub.enrollmentsThisWeek} | ${trend(hub.enrollmentsThisWeek, hub.enrollmentsLastWeek)} |`);
  s.push(`| Course Completions | ${hub.completionsThisWeek} | ${trend(hub.completionsThisWeek, hub.completionsLastWeek)} |`);
  s.push(`| New Sales Leads | ${sales.newLeadsThisWeek} | ${trend(sales.newLeadsThisWeek, sales.newLeadsLastWeek)} |`);
  s.push(`| Deals Won | ${sales.wonThisWeek} (${formatCurrency(sales.wonValueThisWeek)}) | |`);
  s.push(`| Deals Lost | ${sales.lostThisWeek} | |`);
  s.push('');

  // --- Hub Deep Dive ---
  s.push(`## 1. Learning Hub`);
  s.push('');
  s.push(`> **What:** ${hub.signupsThisWeek} signups (${trend(hub.signupsThisWeek, hub.signupsLastWeek)} WoW), ${hub.enrollmentsThisWeek} enrollments, ${hub.completionsThisWeek} completions, ${hub.certificatesThisWeek} certificates (${hub.pdHoursThisWeek} PD hours). Total platform: ${hub.totalUsers.toLocaleString()} users, ${hub.totalPdHours.toLocaleString()} PD hours delivered. ${hub.spanishUsers} Spanish-language users.`);
  s.push('');

  if (hub.signupsThisWeek > hub.signupsLastWeek * 1.2) {
    s.push(`> **So What:** Signup growth is accelerating. Check what's driving it -- partner launch, campaign, or organic.`);
  } else if (hub.signupsThisWeek < hub.signupsLastWeek * 0.8 && hub.signupsLastWeek > 0) {
    s.push(`> **So What:** Signups dropped this week. May be seasonal or campaign gap. Worth monitoring.`);
  } else {
    s.push(`> **So What:** Growth is steady week-over-week. Platform engagement is stable.`);
  }
  s.push('');

  const lowCompletionCourses = hub.topCourses.filter(c => c.enrollments >= 5 && c.rate < 30);
  if (lowCompletionCourses.length > 0) {
    s.push(`> **Now What:** ${lowCompletionCourses.length} course${lowCompletionCourses.length !== 1 ? 's' : ''} with <30% completion rate (${lowCompletionCourses.map(c => c.title).join(', ')}). Consider reviewing content length or difficulty.`);
  } else {
    s.push(`> **Now What:** Course completion rates are healthy. Continue monitoring.`);
  }
  s.push('');

  // Course performance table
  if (hub.topCourses.length > 0) {
    s.push(`### Top Courses`);
    s.push('');
    s.push(`| Course | Enrolled | Completed | Rate |`);
    s.push(`| --- | --- | --- | --- |`);
    hub.topCourses.forEach(c => {
      s.push(`| ${c.title} | ${c.enrollments} | ${c.completions} | ${c.rate}% |`);
    });
    s.push('');
  }

  // Demographics snapshot
  if (hub.topStates.length > 0) {
    s.push(`### User Demographics`);
    s.push('');
    s.push(`**Top states:** ${hub.topStates.map(st => `${st.state} (${st.count})`).join(', ')}`);
    s.push('');
    s.push(`**Top roles:** ${hub.topRoles.map(r => `${r.role} (${r.count})`).join(', ')}`);
    s.push('');
  }

  // --- Sales Deep Dive ---
  s.push(`## 2. Sales Pipeline`);
  s.push('');
  s.push(`> **What:** ${sales.totalActive} active deals, ${formatCurrency(sales.totalPipelineValue)} total (${formatCurrency(sales.factoredValue)} factored). ${sales.newLeadsThisWeek} new leads this week (${trend(sales.newLeadsThisWeek, sales.newLeadsLastWeek)} WoW). Win rate: ${sales.winRate}%. ${sales.hotCount} hot, ${sales.staleCount} stale.`);
  s.push('');

  if (sales.wonThisWeek > 0) {
    s.push(`> **So What:** ${sales.wonThisWeek} deal${sales.wonThisWeek !== 1 ? 's' : ''} closed this week for ${formatCurrency(sales.wonValueThisWeek)}. Pipeline remains ${sales.staleCount > sales.totalActive * 0.3 ? 'congested with stale deals' : 'healthy'}.`);
  } else {
    s.push(`> **So What:** No deals closed this week. ${sales.staleCount > 0 ? `${sales.staleCount} stale deals may need cleanup or re-engagement.` : 'Pipeline is moving.'}`);
  }
  s.push('');

  if (sales.staleCount > 3) {
    s.push(`> **Now What:** ${sales.staleCount} deals stale 14+ days. Schedule a pipeline cleanup session this week. Move or close dead deals to keep the board accurate.`);
  } else if (sales.newLeadsThisWeek === 0) {
    s.push(`> **Now What:** No new leads this week. Consider whether outreach or marketing needs a push.`);
  } else {
    s.push(`> **Now What:** Pipeline velocity is healthy. Focus on advancing deals in closer stages.`);
  }
  s.push('');

  // Stage breakdown
  s.push(`### Pipeline by Stage`);
  s.push('');
  s.push(`| Stage | Deals | Value |`);
  s.push(`| --- | --- | --- |`);
  const displayStages = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed'];
  displayStages.forEach(st => {
    const d = sales.byStage[st];
    if (d && d.count > 0) {
      const label = st.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      s.push(`| ${label} | ${d.count} | ${formatCurrency(d.value)} |`);
    }
  });
  s.push('');

  // New leads this week
  if (sales.topNewLeads.length > 0) {
    s.push(`### New Leads This Week`);
    s.push('');
    sales.topNewLeads.forEach(l => {
      s.push(`- **${l.name}** -- ${formatCurrency(l.value)} (${l.stage.replace('_', ' ')})`);
    });
    s.push('');
  }

  // --- Partnerships ---
  if (partnerships.totalActive > 0) {
    s.push(`## 3. Partnerships`);
    s.push('');
    s.push(`> **What:** ${partnerships.totalActive} active. ${partnerships.strongCount} strong, ${partnerships.buildingCount} building, ${partnerships.needsAttentionCount} needs attention. ${partnerships.recentFlags} flags, ${partnerships.atRiskKpis} at-risk KPIs.`);
    s.push('');

    if (partnerships.needsAttentionCount > 0) {
      s.push(`> **So What:** ${partnerships.needsAttentionCount} partnership${partnerships.needsAttentionCount !== 1 ? 's' : ''} with low Hub engagement. These need proactive outreach before they go cold.`);
      s.push('');
      s.push(`> **Now What:** Prioritize check-ins with low-engagement partners. Consider scheduling a virtual coaching session or sending personalized Hub content recommendations.`);
    } else {
      s.push(`> **So What:** Portfolio health is strong across the board.`);
      s.push('');
      s.push(`> **Now What:** Maintain current cadence. Look for upsell/renewal opportunities with strong partners.`);
    }
    s.push('');

    // Partner table
    s.push(`| Partner | Hub % | Health | Flags |`);
    s.push(`| --- | --- | --- | --- |`);
    partnerships.partnerDetails.forEach(p => {
      s.push(`| ${p.name} | ${p.loginPct}% | ${p.health} | ${p.flags} |`);
    });
    s.push('');
  }

  // --- Footer ---
  s.push('---');
  s.push('');
  s.push(`*Weekly briefing generated ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })}.*`);

  return s.join('\n');
}
