import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { postFundingEvent, narrativeEvent, windowEvent, submittedEvent, awardEvent, denialEvent, researchEvent } from '@/lib/funding-slack';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET -- list opportunities for a pursuit
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const pursuitId = request.nextUrl.searchParams.get('pursuitId');
  if (!pursuitId) return NextResponse.json({ error: 'pursuitId required' }, { status: 400 });

  const supabase = db();

  const { data: opps } = await supabase
    .from('funding_opportunities')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .order('created_at');

  // Get notes for each opportunity
  const oppIds = (opps || []).map(o => o.id);
  const { data: allNotes } = oppIds.length > 0
    ? await supabase.from('funding_opportunity_notes').select('*').in('opportunity_id', oppIds).order('created_at', { ascending: false })
    : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notesByOpp: Record<string, any[]> = {};
  (allNotes || []).forEach((n: any) => {
    if (!notesByOpp[n.opportunity_id]) notesByOpp[n.opportunity_id] = [];
    notesByOpp[n.opportunity_id].push(n);
  });

  const result = (opps || []).map(o => ({ ...o, notes: notesByOpp[o.id] || [] }));

  return NextResponse.json({ opportunities: result });
}

// POST -- create a new opportunity
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const supabase = db();

  const { data, error } = await supabase
    .from('funding_opportunities')
    .insert({
      pursuit_id: body.pursuitId,
      partnership_id: body.partnershipId || null,
      name: body.name,
      amount: body.amount || null,
      status: body.status || 'researching',
      contact_name: body.contactName || null,
      contact_email: body.contactEmail || null,
      next_action: body.nextAction || null,
      next_action_due: body.nextActionDue || null,
      // New fields
      application_opens: body.applicationOpens || null,
      application_closes: body.applicationCloses || null,
      plan_category: body.planCategory || null,
      waiting_on: body.waitingOn || 'tdi',
      narrative_status: body.narrativeStatus || 'not_started',
      window_status: body.windowStatus || 'unknown',
      window_opens: body.windowOpens || null,
      window_closes: body.windowCloses || null,
      internal_deadline: body.internalDeadline || null,
      award_needed_by: body.awardNeededBy || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, opportunity: data });
}

// PATCH -- update an opportunity
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = db();

  // Get current state for change detection
  const { data: before } = await supabase
    .from('funding_opportunities')
    .select('status, waiting_on, client_submitted, pursuit_id, narrative_status')
    .eq('id', body.id)
    .single();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = [
    'name', 'amount', 'status', 'contact_name', 'contact_email',
    'last_action', 'last_action_date', 'next_action', 'next_action_due',
    // New fields from migration 093
    'application_opens', 'application_closes', 'plan_category',
    'waiting_on', 'narrative_status', 'narrative_url', 'narrative_content',
    'qa_reviewer', 'qa_notes', 'qa_passed', 'forwarding_email_status',
    'client_submitted', 'client_submitted_proof',
    'routed_through_district', 'district_routing_confirmed',
    'decision_date', 'awarded_amount', 'denial_reason',
    'window_status', 'window_opens', 'window_closes',
    'internal_deadline', 'award_needed_by',
    'assigned_agent', 'research_status',
  ];
  fields.forEach(f => { if (body[f] !== undefined) updates[f] = body[f]; });

  // When client_submitted flips to true, set timestamp and update activity
  if (body.client_submitted === true && !before?.client_submitted) {
    updates.client_submitted_at = new Date().toISOString();
    updates.last_activity_at = new Date().toISOString();
    updates.waiting_on = 'funder';
  }

  // Any status change updates last_activity_at
  if (body.status && body.status !== before?.status) {
    updates.last_activity_at = new Date().toISOString();
  }

  const { error } = await supabase.from('funding_opportunities').update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If adding a note
  if (body.note) {
    await supabase.from('funding_opportunity_notes').insert({
      opportunity_id: body.id,
      content: body.note,
      author: auth.member.email || auth.user.email,
    });

    // Cross-reference to partnership notes if linked
    const { data: opp } = await supabase.from('funding_opportunities').select('partnership_id, name').eq('id', body.id).single();
    if (opp?.partnership_id) {
      await supabase.from('partnership_notes').insert({
        partnership_id: opp.partnership_id,
        content: `Funding (${opp.name}): ${body.note}`,
        author: auth.member.email || auth.user.email,
        note_type: 'general',
        visible_to_partner: false,
      });
    }
  }

  // Auto-create timeline event when client submits
  if (body.client_submitted === true && !before?.client_submitted && before?.pursuit_id) {
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('name')
      .eq('id', body.id)
      .single();

    await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: before.pursuit_id,
      event_date: new Date().toISOString().split('T')[0],
      event_title: `Client submitted: ${opp?.name || 'Unknown'}`,
      event_detail: body.client_submitted_proof || 'Submission confirmed',
      status: 'complete',
    });
  }

  // ── Slack narration for state changes ──
  // Fire-and-forget — don't block the response
  if (before?.pursuit_id) {
    const { data: oppNow } = await supabase.from('funding_opportunities').select('name, assigned_agent, awarded_amount, amount').eq('id', body.id).single()
    const { data: pursuitNow } = await supabase.from('funding_pursuits').select('pursuit_name').eq('id', before.pursuit_id).single()
    const pName = pursuitNow?.pursuit_name || 'Unknown'
    const oName = oppNow?.name || 'Unknown'
    const pId = before.pursuit_id

    // Narrative status change
    if (body.narrative_status && body.narrative_status !== before.narrative_status) {
      const fromNs = before.narrative_status || 'not_started'
      postFundingEvent(narrativeEvent(pId, pName, oName, fromNs, body.narrative_status, oppNow?.assigned_agent)).catch(() => {})
    }
    // Window status change
    if (body.window_status) {
      postFundingEvent(windowEvent(pId, pName, oName, body.window_status)).catch(() => {})
    }
    // Client submitted
    if (body.client_submitted === true && !before.client_submitted) {
      postFundingEvent(submittedEvent(pId, pName, oName, body.client_submitted_proof)).catch(() => {})
    }
    // Award recorded
    if (body.status === 'awarded' && before.status !== 'awarded') {
      postFundingEvent(awardEvent(pId, pName, oName, oppNow?.awarded_amount || oppNow?.amount || 0)).catch(() => {})
    }
    // Denial recorded
    if (body.status === 'denied' && before.status !== 'denied') {
      postFundingEvent(denialEvent(pId, pName, oName, body.denial_reason)).catch(() => {})
    }
    // Research status change
    if (body.research_status) {
      postFundingEvent(researchEvent(pId, pName, oName, body.research_status, oppNow?.assigned_agent)).catch(() => {})
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = db();
  await supabase.from('funding_opportunity_notes').delete().eq('opportunity_id', id);
  await supabase.from('funding_opportunities').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
