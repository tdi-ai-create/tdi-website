import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * GET /api/tdi-admin/leadership/[id]/briefing
 *
 * Generates a one-page "Prepare for Call" briefing with:
 * - Partnership overview (phase, staff, contract dates)
 * - KPI progress with talking points
 * - Recent notes and meetings
 * - Hub engagement highlights
 * - Suggested agenda items
 * - Open action items
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: partnershipId } = await params;
  const supabase = getSupabaseAdmin();

  // Gather all data
  const [
    { data: partnership },
    { data: org },
    { data: kpis },
    { data: notes },
    { data: meetings },
    { data: staff },
    { data: actionItems },
  ] = await Promise.all([
    supabase.from('partnerships').select('*').eq('id', partnershipId).single(),
    supabase.from('organizations').select('name, address_city, address_state').eq('partnership_id', partnershipId).limit(1).single(),
    supabase.from('partnership_kpis').select('*').eq('partnership_id', partnershipId).eq('status', 'active').order('sort_order'),
    supabase.from('partnership_notes').select('*').eq('partnership_id', partnershipId).order('created_at', { ascending: false }).limit(5),
    supabase.from('partnership_meetings').select('*').eq('partnership_id', partnershipId).order('meeting_date', { ascending: false }).limit(3),
    supabase.from('staff_members').select('hub_enrolled, hub_login_date').eq('partnership_id', partnershipId),
    supabase.from('action_items').select('title, status, priority').eq('partnership_id', partnershipId).eq('status', 'pending').order('sort_order'),
  ]);

  if (!partnership) {
    return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
  }

  const orgName = org?.name || partnership.contact_name;
  const totalStaff = staff?.length || partnership.staff_enrolled || 0;
  const loggedIn = staff?.filter(s => s.hub_login_date).length || 0;
  const loginPct = totalStaff > 0 ? Math.round((loggedIn / totalStaff) * 100) : 0;
  const daysSinceStart = partnership.contract_start
    ? Math.floor((Date.now() - new Date(partnership.contract_start).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Build suggested talking points from data
  const talkingPoints: string[] = [];

  if (loginPct >= 70) {
    talkingPoints.push(`Strong Hub engagement at ${loginPct}%. Celebrate this with the principal.`);
  } else if (loginPct > 0) {
    talkingPoints.push(`Hub engagement at ${loginPct}%. Discuss re-engagement strategy for staff who haven't logged in.`);
  }

  if (kpis && kpis.length > 0) {
    const atRisk = kpis.filter(k => k.status === 'at_risk');
    const onTrack = kpis.filter(k => k.current_value >= k.target_value * 0.7);
    if (atRisk.length > 0) {
      talkingPoints.push(`${atRisk.length} KPI${atRisk.length > 1 ? 's' : ''} at risk: ${atRisk.map(k => k.kpi_label).join(', ')}. Discuss support plan.`);
    }
    if (onTrack.length > 0) {
      talkingPoints.push(`${onTrack.length} KPI${onTrack.length > 1 ? 's' : ''} on track. Use as evidence of partnership value.`);
    }
  }

  const concerns = (notes || []).filter(n => n.note_type === 'concern');
  if (concerns.length > 0) {
    talkingPoints.push(`${concerns.length} recent concern${concerns.length > 1 ? 's' : ''} flagged. Review before the call.`);
  }

  const pendingHigh = (actionItems || []).filter(a => a.priority === 'high');
  if (pendingHigh.length > 0) {
    talkingPoints.push(`${pendingHigh.length} high-priority item${pendingHigh.length > 1 ? 's' : ''} pending. Discuss timeline.`);
  }

  if (daysSinceStart !== null && daysSinceStart >= 40 && daysSinceStart <= 50) {
    talkingPoints.push('Day 45 window: Plant the Year 2 vision. "Here\'s what growth looks like from here."');
  }

  if (daysSinceStart !== null && daysSinceStart >= 75 && daysSinceStart <= 85) {
    talkingPoints.push('Day 80 window: Partnership continuation check-in. Confirm budget and Year 2 priorities.');
  }

  return NextResponse.json({
    briefing: {
      orgName,
      location: org?.address_city && org?.address_state ? `${org.address_city}, ${org.address_state}` : null,
      phase: partnership.contract_phase,
      contractStart: partnership.contract_start,
      contractEnd: partnership.contract_end,
      daysSinceStart,
      totalStaff,
      loggedIn,
      loginPct,
      observationsUsed: partnership.observation_days_used || 0,
      observationsTotal: partnership.observation_days_total || 0,
      virtualSessionsUsed: partnership.virtual_sessions_used || 0,
      virtualSessionsTotal: partnership.virtual_sessions_total || 0,
    },
    kpis: (kpis || []).map(k => ({
      label: k.kpi_label,
      target: `${k.target_value}${k.target_unit}`,
      current: `${k.current_value}${k.target_unit}`,
      pct: k.target_value > 0 ? Math.round((k.current_value / k.target_value) * 100) : 0,
      status: k.status,
      howTdiDelivers: k.how_tdi_delivers,
    })),
    recentNotes: (notes || []).map(n => ({
      type: n.note_type,
      content: n.content,
      date: n.created_at,
      author: n.author,
    })),
    recentMeetings: (meetings || []).map(m => ({
      type: m.meeting_type,
      date: m.meeting_date,
      summary: m.summary,
      actionItems: m.action_items,
    })),
    pendingItems: (actionItems || []).map(a => a.title),
    talkingPoints,
    generatedAt: new Date().toISOString(),
  });
}
