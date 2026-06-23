// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/olivia-daily-briefing
 *
 * Weekdays at 7 AM CT. Olivia sends Rae a concise daily briefing covering:
 * 1. Hub activity (signups, enrollments, completions, certificates)
 * 2. Sales pipeline health (stage counts, movement, stale leads)
 * 3. Partnership flags & KPI risks
 * 4. Paperclip agent health
 *
 * Uses the existing send-report skill endpoint so the email comes from Olivia
 * with proper TDI branding and What/So What/Now What callout formatting.
 */

const PAPERCLIP_URL = 'https://paperclip-production-014f.up.railway.app';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // Auth: Vercel cron or CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Initialize clients ---
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
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayISO = yesterday.toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // --- 1. Hub Activity ---
    const hub = await gatherHubData(hubSupabase, yesterdayISO);

    // --- 2. Sales Pipeline ---
    const sales = await gatherSalesData(supabase, yesterdayISO, sevenDaysAgo);

    // --- 3. Partnership Health ---
    const partnerships = await gatherPartnershipData(supabase);

    // --- 4. Paperclip Health ---
    const paperclip = await checkPaperclipHealth();

    // --- Build the report ---
    const dateLabel = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = `Daily Briefing -- ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const content = buildDailyReport(dateLabel, hub, sales, partnerships, paperclip);

    // --- Send via Olivia's send-report skill ---
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';
    const reportSecret = process.env.PAPERCLIP_REPORT_SECRET;

    if (!reportSecret) {
      console.error('[olivia-daily-briefing] PAPERCLIP_REPORT_SECRET not set');
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
      console.error('[olivia-daily-briefing] Send failed:', err);
      return NextResponse.json({ error: 'Failed to send briefing', details: err }, { status: 502 });
    }

    console.log('[olivia-daily-briefing] Sent:', subject);
    return NextResponse.json({ success: true, subject, timestamp });
  } catch (error) {
    console.error('[olivia-daily-briefing] Error:', error);
    return NextResponse.json({ error: String(error), timestamp }, { status: 500 });
  }
}

// ============================================================
// Data Gathering
// ============================================================

interface HubData {
  newSignups: number;
  totalUsers: number;
  newEnrollments: number;
  totalEnrollments: number;
  completionsYesterday: number;
  certificatesYesterday: number;
  pdHoursYesterday: number;
  totalCertificates: number;
  totalPdHours: number;
  spanishUsers: number;
  sevenDaySignups: number;
}

async function gatherHubData(
  hubSupabase: any,
  yesterdayISO: string,
): Promise<HubData> {
  const empty: HubData = {
    newSignups: 0, totalUsers: 0, newEnrollments: 0, totalEnrollments: 0,
    completionsYesterday: 0, certificatesYesterday: 0, pdHoursYesterday: 0,
    totalCertificates: 0, totalPdHours: 0, spanishUsers: 0, sevenDaySignups: 0,
  };

  if (!hubSupabase) return empty;

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [profilesRes, enrollmentsRes, certsRes, recentCertsRes, recentEnrollmentsRes, recentProfilesRes, weekProfilesRes] = await Promise.all([
      hubSupabase.from('hub_profiles').select('id, preferences', { count: 'exact', head: false }).limit(5000),
      hubSupabase.from('hub_enrollments').select('*', { count: 'exact', head: true }),
      hubSupabase.from('hub_certificates').select('pd_hours', { count: 'exact', head: false }),
      hubSupabase.from('hub_certificates').select('pd_hours').gte('issued_at', yesterdayISO),
      hubSupabase.from('hub_enrollments').select('id, status').gte('created_at', yesterdayISO),
      hubSupabase.from('hub_profiles').select('id').gte('created_at', yesterdayISO),
      hubSupabase.from('hub_profiles').select('id').gte('created_at', sevenDaysAgo),
    ]);

    const profiles = profilesRes.data || [];
    const spanishUsers = profiles.filter(
      (p: { preferences?: { preferred_language?: string } | null }) =>
        (p.preferences as { preferred_language?: string } | null)?.preferred_language === 'spanish'
    ).length;

    const recentEnrollments = recentEnrollmentsRes.data || [];
    const recentCerts = recentCertsRes.data || [];
    const allCerts = certsRes.data || [];

    return {
      newSignups: recentProfilesRes.data?.length || 0,
      totalUsers: profiles.length,
      newEnrollments: recentEnrollments.length,
      totalEnrollments: enrollmentsRes.count || 0,
      completionsYesterday: recentEnrollments.filter((e: { status: string }) => e.status === 'completed').length,
      certificatesYesterday: recentCerts.length,
      pdHoursYesterday: recentCerts.reduce((sum: number, c: { pd_hours?: number }) => sum + (c.pd_hours || 0), 0),
      totalCertificates: certsRes.count || allCerts.length,
      totalPdHours: allCerts.reduce((sum: number, c: { pd_hours?: number }) => sum + (c.pd_hours || 0), 0),
      spanishUsers,
      sevenDaySignups: weekProfilesRes.data?.length || 0,
    };
  } catch (err) {
    console.error('[olivia-daily-briefing] Hub query error:', err);
    return empty;
  }
}

interface SalesData {
  totalActive: number;
  totalPipelineValue: number;
  factoredValue: number;
  wonCount: number;
  wonValue: number;
  hotCount: number;
  staleCount: number;
  newLeadsYesterday: number;
  stageMovesYesterday: number;
  byStage: Record<string, { count: number; value: number }>;
  topStaleLeads: { name: string; daysSinceActivity: number; stage: string; value: number }[];
}

async function gatherSalesData(
  supabase: any,
  yesterdayISO: string,
  _sevenDaysAgoISO: string,
): Promise<SalesData> {
  const empty: SalesData = {
    totalActive: 0, totalPipelineValue: 0, factoredValue: 0, wonCount: 0, wonValue: 0,
    hotCount: 0, staleCount: 0, newLeadsYesterday: 0, stageMovesYesterday: 0,
    byStage: {}, topStaleLeads: [],
  };

  try {
    const { data: opps } = await supabase
      .from('sales_opportunities')
      .select('id, name, stage, value, probability, heat, last_activity_at, created_at, updated_at')
      .is('deleted_at', null) as { data: Array<{ id: string; name: string; stage: string; value: number | null; probability: number | null; heat: string | null; last_activity_at: string | null; created_at: string; updated_at: string }> | null };

    if (!opps) return empty;

    const active = opps.filter(o => !['lost', 'paid'].includes(o.stage));
    const won = opps.filter(o => o.stage === 'paid');
    const newYesterday = opps.filter(o => o.created_at >= yesterdayISO && o.stage !== 'lost');

    // Stage moves: opportunities updated yesterday that aren't new
    const movedYesterday = active.filter(o =>
      o.updated_at >= yesterdayISO && o.created_at < yesterdayISO
    ).length;

    const staleThreshold = 14;
    const staleOpps = active
      .map(o => ({
        name: o.name,
        daysSinceActivity: o.last_activity_at
          ? Math.floor((Date.now() - new Date(o.last_activity_at).getTime()) / 86400000)
          : 999,
        stage: o.stage,
        value: o.value || 0,
      }))
      .filter(o => o.daysSinceActivity > staleThreshold)
      .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);

    const stages = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid'];
    const byStage: Record<string, { count: number; value: number }> = {};
    stages.forEach(s => {
      const stageOpps = opps.filter(o => o.stage === s);
      byStage[s] = {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + (o.value || 0), 0),
      };
    });

    return {
      totalActive: active.length,
      totalPipelineValue: active.reduce((s, o) => s + (o.value || 0), 0),
      factoredValue: active.reduce((s, o) => s + (o.value || 0) * (o.probability || 0) / 100, 0),
      wonCount: won.length,
      wonValue: won.reduce((s, o) => s + (o.value || 0), 0),
      hotCount: active.filter(o => o.heat === 'hot').length,
      staleCount: staleOpps.length,
      newLeadsYesterday: newYesterday.length,
      stageMovesYesterday: movedYesterday,
      byStage,
      topStaleLeads: staleOpps.slice(0, 5),
    };
  } catch (err) {
    console.error('[olivia-daily-briefing] Sales query error:', err);
    return empty;
  }
}

interface PartnershipData {
  totalActive: number;
  strongCount: number;
  buildingCount: number;
  needsAttentionCount: number;
  atRiskKpis: number;
  recentFlags: number;
}

async function gatherPartnershipData(
  supabase: any,
): Promise<PartnershipData> {
  const empty: PartnershipData = {
    totalActive: 0, strongCount: 0, buildingCount: 0, needsAttentionCount: 0,
    atRiskKpis: 0, recentFlags: 0,
  };

  try {
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, staff_enrolled')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) return empty;

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    let strong = 0, building = 0, needsAttention = 0, totalFlags = 0, riskKpis = 0;

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

      if (loginPct >= 60 && (flags || 0) === 0) strong++;
      else if (loginPct >= 30) building++;
      else needsAttention++;
    }

    return {
      totalActive: partnerships.length,
      strongCount: strong,
      buildingCount: building,
      needsAttentionCount: needsAttention,
      atRiskKpis: riskKpis,
      recentFlags: totalFlags,
    };
  } catch (err) {
    console.error('[olivia-daily-briefing] Partnership query error:', err);
    return empty;
  }
}

interface PaperclipHealth {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  detail: string;
}

async function checkPaperclipHealth(): Promise<PaperclipHealth> {
  try {
    const start = Date.now();
    const res = await fetch(`${PAPERCLIP_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok && latencyMs < 5000) {
      return { status: 'healthy', latencyMs, detail: `${latencyMs}ms` };
    }
    return { status: 'degraded', latencyMs, detail: `${res.status} (${latencyMs}ms)` };
  } catch (err) {
    return { status: 'down', latencyMs: 0, detail: String(err) };
  }
}

// ============================================================
// Report Builder
// ============================================================

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function buildDailyReport(
  dateLabel: string,
  hub: HubData,
  sales: SalesData,
  partnerships: PartnershipData,
  paperclip: PaperclipHealth,
): string {
  const sections: string[] = [];

  sections.push(`# Daily Briefing`);
  sections.push(`*${dateLabel}*`);
  sections.push('');

  // --- Quick Pulse ---
  sections.push(`## Quick Pulse`);
  sections.push('');
  sections.push(`| Metric | Value |`);
  sections.push(`| --- | --- |`);
  sections.push(`| Hub Users (total) | ${hub.totalUsers.toLocaleString()} |`);
  sections.push(`| New Signups (24h) | ${hub.newSignups} |`);
  sections.push(`| Pipeline Value | ${formatCurrency(sales.totalPipelineValue)} |`);
  sections.push(`| Active Deals | ${sales.totalActive} |`);
  sections.push(`| Partnerships | ${partnerships.totalActive} |`);
  sections.push(`| Paperclip | ${paperclip.status === 'healthy' ? 'Healthy' : paperclip.status === 'degraded' ? 'Degraded' : 'Down'} (${paperclip.detail}) |`);
  sections.push('');

  // --- Hub ---
  sections.push(`## 1. Learning Hub`);
  sections.push('');

  const avgDailySignups = hub.sevenDaySignups > 0 ? Math.round(hub.sevenDaySignups / 7 * 10) / 10 : 0;
  const signupTrend = hub.newSignups > avgDailySignups * 1.3 ? 'above' : hub.newSignups < avgDailySignups * 0.7 ? 'below' : 'in line with';

  sections.push(`> **What:** ${hub.newSignups} new signup${hub.newSignups !== 1 ? 's' : ''}, ${hub.newEnrollments} enrollment${hub.newEnrollments !== 1 ? 's' : ''}, ${hub.completionsYesterday} completion${hub.completionsYesterday !== 1 ? 's' : ''}, ${hub.certificatesYesterday} certificate${hub.certificatesYesterday !== 1 ? 's' : ''} issued (${hub.pdHoursYesterday} PD hours). Total users: ${hub.totalUsers.toLocaleString()}. Spanish speakers: ${hub.spanishUsers}.`);
  sections.push('');
  sections.push(`> **So What:** Signups are ${signupTrend} the 7-day average (${avgDailySignups}/day). Lifetime: ${hub.totalCertificates.toLocaleString()} certificates, ${hub.totalPdHours.toLocaleString()} PD hours delivered.`);
  sections.push('');

  if (hub.newSignups === 0 && hub.newEnrollments === 0) {
    sections.push(`> **Now What:** Zero activity day -- check if this is a weekend/holiday lull or if something is broken. Verify the signup flow is working.`);
  } else if (hub.newSignups > avgDailySignups * 1.5) {
    sections.push(`> **Now What:** Signup spike detected. Check if a campaign or partner launch is driving traffic. Good time to ensure onboarding emails are firing.`);
  } else {
    sections.push(`> **Now What:** Normal activity. No action needed.`);
  }
  sections.push('');

  // --- Sales ---
  sections.push(`## 2. Sales Pipeline`);
  sections.push('');

  const closerStages = ['qualified', 'likely_yes', 'proposal_sent', 'signed'];
  const closerValue = closerStages.reduce((s, st) => s + (sales.byStage[st]?.value || 0), 0);
  const closerCount = closerStages.reduce((s, st) => s + (sales.byStage[st]?.count || 0), 0);

  sections.push(`> **What:** ${sales.totalActive} active deals, ${formatCurrency(sales.totalPipelineValue)} total pipeline (${formatCurrency(sales.factoredValue)} factored). ${sales.newLeadsYesterday} new lead${sales.newLeadsYesterday !== 1 ? 's' : ''} yesterday, ${sales.stageMovesYesterday} stage move${sales.stageMovesYesterday !== 1 ? 's' : ''}. ${sales.hotCount} hot, ${sales.staleCount} stale (14+ days no activity).`);
  sections.push('');
  sections.push(`> **So What:** ${closerCount} deal${closerCount !== 1 ? 's' : ''} in closer stages (qualified+) worth ${formatCurrency(closerValue)}. Won to date: ${sales.wonCount} deals, ${formatCurrency(sales.wonValue)}.`);
  sections.push('');

  if (sales.staleCount > 0) {
    const staleNames = sales.topStaleLeads.slice(0, 3).map(l => `${l.name} (${l.daysSinceActivity}d)`).join(', ');
    sections.push(`> **Now What:** ${sales.staleCount} stale deal${sales.staleCount !== 1 ? 's' : ''} need attention. Top stale: ${staleNames}. Decide: re-engage or close out.`);
  } else {
    sections.push(`> **Now What:** Pipeline is active -- no stale deals. Keep momentum.`);
  }
  sections.push('');

  // Stage breakdown table
  sections.push(`| Stage | Deals | Value |`);
  sections.push(`| --- | --- | --- |`);
  const displayStages = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed'];
  displayStages.forEach(s => {
    const d = sales.byStage[s];
    if (d && d.count > 0) {
      const label = s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      sections.push(`| ${label} | ${d.count} | ${formatCurrency(d.value)} |`);
    }
  });
  sections.push('');

  // --- Partnerships ---
  if (partnerships.totalActive > 0) {
    sections.push(`## 3. Partnerships`);
    sections.push('');
    sections.push(`> **What:** ${partnerships.totalActive} active partnership${partnerships.totalActive !== 1 ? 's' : ''}. Health: ${partnerships.strongCount} strong, ${partnerships.buildingCount} building, ${partnerships.needsAttentionCount} needs attention. ${partnerships.recentFlags} flag${partnerships.recentFlags !== 1 ? 's' : ''} this week, ${partnerships.atRiskKpis} KPI${partnerships.atRiskKpis !== 1 ? 's' : ''} at risk.`);
    sections.push('');

    if (partnerships.needsAttentionCount > 0 || partnerships.atRiskKpis > 0) {
      sections.push(`> **So What:** ${partnerships.needsAttentionCount > 0 ? `${partnerships.needsAttentionCount} partnership${partnerships.needsAttentionCount !== 1 ? 's' : ''} with low engagement.` : ''} ${partnerships.atRiskKpis > 0 ? `${partnerships.atRiskKpis} KPI${partnerships.atRiskKpis !== 1 ? 's' : ''} tracking below 50% of target.` : ''}`);
      sections.push('');
      sections.push(`> **Now What:** Check the Leadership dashboard for specifics. Prioritize outreach to low-engagement partners this week.`);
    } else {
      sections.push(`> **So What:** All partnerships tracking healthy. No flags or at-risk KPIs.`);
      sections.push('');
      sections.push(`> **Now What:** No action needed. Keep monitoring weekly.`);
    }
    sections.push('');
  }

  // --- Paperclip ---
  if (paperclip.status !== 'healthy') {
    sections.push(`## 4. Paperclip Agent Health`);
    sections.push('');
    sections.push(`> **What:** Paperclip is ${paperclip.status}: ${paperclip.detail}.`);
    sections.push('');
    sections.push(`> **So What:** Agent tasks (outreach drafts, social engagement, routine operations) may be delayed or failing.`);
    sections.push('');
    sections.push(`> **Now What:** The watchdog should auto-restart within 30 minutes. If this persists, check Railway logs.`);
    sections.push('');
  }

  // --- Footer ---
  sections.push('---');
  sections.push('');
  sections.push(`*Report generated ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })}. Data window: previous 24 hours.*`);

  return sections.join('\n');
}
