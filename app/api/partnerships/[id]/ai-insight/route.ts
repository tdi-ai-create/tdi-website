import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const portalSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params;

  try {
    // Get partnership details
    const { data: partnership } = await portalSupabase
      .from('partnerships')
      .select('contact_name, contract_phase, staff_enrolled, observation_days_used, observation_days_total, virtual_sessions_used, virtual_sessions_total, momentum_status')
      .eq('id', partnershipId)
      .single();

    const { data: org } = await portalSupabase
      .from('organizations')
      .select('name')
      .eq('partnership_id', partnershipId)
      .single();

    const orgName = org?.name || partnership?.contact_name || 'Unknown';

    // Get Hub stats for this school
    const hubStatsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'}/api/partnerships/${partnershipId}/hub-stats`
    );
    const hubStats = await hubStatsRes.json();

    // Get recent action items
    const { data: actionItems } = await portalSupabase
      .from('partnership_action_items')
      .select('title, status, priority')
      .eq('partnership_id', partnershipId)
      .neq('status', 'completed')
      .limit(5);

    const pendingActions = (actionItems || []).filter(a => a.status !== 'completed').length;

    // Build template-based insight
    const phase = partnership?.contract_phase || 'IGNITE';
    const staffEnrolled = partnership?.staff_enrolled || 0;
    const momentum = partnership?.momentum_status || 'Building';
    const loginPct = hubStats.hub_login_pct;
    const activeUsers7d = hubStats.active_users_7d ?? 0;
    const quickWinsCompleted = hubStats.quick_wins_completed ?? 0;
    const obsUsed = partnership?.observation_days_used || 0;
    const obsTotal = partnership?.observation_days_total || 6;

    // First sentence: engagement snapshot
    let engagementLine: string;
    if (loginPct !== null && loginPct !== undefined && loginPct !== 'N/A') {
      if (loginPct >= 60) {
        engagementLine = `${orgName} is showing strong engagement in the ${phase} phase, with ${loginPct}% of ${staffEnrolled} enrolled staff logging into the Hub this month.`;
      } else if (loginPct > 0) {
        engagementLine = `${orgName} has ${loginPct}% of ${staffEnrolled} enrolled staff logging in this month during the ${phase} phase, which gives us room to grow.`;
      } else {
        engagementLine = `${orgName} has ${staffEnrolled} staff enrolled in the ${phase} phase, but we have not seen Hub logins this month yet.`;
      }
    } else {
      engagementLine = `${orgName} is in the ${phase} phase with ${staffEnrolled} staff enrolled. Hub login data is not yet available.`;
    }

    // Second sentence: activity highlights
    const highlights: string[] = [];
    if (activeUsers7d > 0) highlights.push(`${activeUsers7d} active in the last 7 days`);
    if (quickWinsCompleted > 0) highlights.push(`${quickWinsCompleted} quick wins completed`);
    if (obsUsed > 0) highlights.push(`${obsUsed} of ${obsTotal} observation days used`);

    let activityLine = '';
    if (highlights.length > 0) {
      activityLine = ` Activity highlights: ${highlights.join(', ')}.`;
    }

    // Third sentence: suggested focus
    let actionLine: string;
    if (pendingActions > 0) {
      actionLine = ` We have ${pendingActions} pending action item${pendingActions > 1 ? 's' : ''} to address before our next check-in.`;
    } else if (loginPct !== null && loginPct !== undefined && loginPct !== 'N/A' && loginPct < 30) {
      actionLine = ` Consider a targeted outreach to boost staff adoption.`;
    } else if (momentum === 'Stalled') {
      actionLine = ` Momentum has stalled. A quick touchpoint with the principal could help re-energize the team.`;
    } else {
      actionLine = ` Momentum is ${momentum.toLowerCase()}. Keep the current rhythm going.`;
    }

    const insight = `${engagementLine}${activityLine}${actionLine}`;

    return NextResponse.json({ insight, orgName });
  } catch (error) {
    console.error('[Partnership AI Insight]', error);
    return NextResponse.json({ insight: '' });
  }
}
