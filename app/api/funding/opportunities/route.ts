import { NextRequest, NextResponse } from 'next/server';
import { NARRATIVE_STATES, isNarrativeState } from '@/lib/funding-rules'
import { screenPath } from '@/lib/funding-eligibility';
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

  // A state nobody can render is worse than a rejected request.
  if (body.narrativeStatus && !isNarrativeState(body.narrativeStatus)) {
    return NextResponse.json(
      { error: `'${body.narrativeStatus}' is not a narrative state.`, valid: NARRATIVE_STATES },
      { status: 400 },
    );
  }

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

  let updatesOverrideFlag = false;
  // ── The stop rule ──
  //
  // Runs at the moment a draft is requested, which is the last point before
  // real work begins and the first point where we know enough to judge.
  //
  // Blocking is on deliberately. A path that cannot win is refused rather than
  // logged, because the alternative is what already happened: Saunemin spent
  // nine drafting cycles and nine reviews learning three facts knowable on day
  // one, and St. Peter Chanel was seeded two federal paths a private school can
  // never apply for at any score.
  //
  // Two safeguards, because a wrong rule now removes real funding from a real
  // school. Every refusal carries its reason in plain words, and every refusal
  // appears in Bella's morning message, so a bad rule surfaces in a day rather
  // than in weeks. An override exists and is recorded rather than silent.
  if (
    body.narrative_status === 'requested' &&
    before?.narrative_status !== 'requested' &&
    body.eligibility_override !== true
  ) {
    const { data: oppNow } = await supabase
      .from('funding_opportunities')
      .select('name, window_status, pursuit_id')
      .eq('id', body.id)
      .single();

    const { data: pursuitNow } = oppNow?.pursuit_id
      ? await supabase
          .from('funding_pursuits')
          .select('sector, county, state_code, school_profile')
          .eq('id', oppNow.pursuit_id)
          .single()
      : { data: null };

    const profile = (() => {
      try {
        const raw = pursuitNow?.school_profile;
        if (!raw) return {} as Record<string, unknown>;
        const once = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>;
      } catch { return {} as Record<string, unknown>; }
    })();

    const result = screenPath(
      {
        name: oppNow?.name ?? '',
        windowStatus: body.window_status ?? oppNow?.window_status ?? null,
        namedApplicant: (profile.nea_member_name as string) ?? null,
      },
      {
        sector: pursuitNow?.sector ?? null,
        county: pursuitNow?.county ?? null,
        stateCode: pursuitNow?.state_code ?? null,
        titleIStatus: (profile.title_i_status as string) ?? null,
        designation: (profile.designation as string) ?? null,
      },
    );

    const { error: verdictErr } = await supabase.from('funding_opportunities').update({
      eligibility_verdict: result.verdict,
      eligibility_reason: result.reason,
      eligibility_rule: result.rule,
      eligibility_checked_at: new Date().toISOString(),
    }).eq('id', body.id);

    if (verdictErr) console.error('[funding/opportunities] Eligibility verdict not saved:', verdictErr.message);

    if (result.verdict !== 'clear') {
      return NextResponse.json({
        error: result.reason,
        eligibility: {
          verdict: result.verdict,
          rule: result.rule,
          unblockedBy: result.unblockedBy ?? null,
          // Deliberately explicit. If this rule is wrong, whoever meets it
          // should be able to disagree and proceed without hunting for how.
          override: 'Send eligibility_override: true to request the draft anyway. The override is recorded.',
        },
      }, { status: 409 });
    }
  }

  // A human pushed a blocked path through. Recorded, never silent.
  if (body.eligibility_override === true) {
    updatesOverrideFlag = true;
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = [
    'name', 'amount', 'status', 'contact_name', 'contact_email',
    'last_action', 'last_action_date', 'next_action', 'next_action_due',
    // New fields from migration 093
    'application_opens', 'application_closes', 'plan_category',
    'waiting_on', 'narrative_status', 'narrative_url', 'narrative_content',
    // qa_reviewer / qa_notes / qa_passed are deliberately NOT patchable here.
    // QA verdicts are Julie's alone and arrive through the sync route's
    // submit_qa_verdict action, which enforces the attempt bound, writes the
    // funding_narrative_qa_reviews history row and requires a usable escalation
    // once she runs out of attempts. Letting the admin PATCH set them let a
    // person record a verdict with none of that, and under Julie's name.
    'forwarding_email_status',
    'client_submitted', 'client_submitted_proof',
    'routed_through_district', 'district_routing_confirmed',
    'decision_date', 'awarded_amount', 'denial_reason',
    'window_status', 'window_opens', 'window_closes',
    'internal_deadline', 'award_needed_by',
    'assigned_agent', 'research_status',
    // Bella's note when she sends a narrative back from approval. It is
    // guidance for the writer, not a verdict, so it belongs here rather than
    // with the QA fields below.
    'redraft_guidance',
  ];
  // narrative_status rides in this allow-list, so the list decides which
  // fields may be written and nothing decided what a legal value was. The two
  // states retired in #336 are still permitted by the column, so a stale
  // caller could park a row in a state no screen renders any more.
  if (body.narrative_status !== undefined && !isNarrativeState(body.narrative_status)) {
    return NextResponse.json(
      { error: `'${body.narrative_status}' is not a narrative state.`, valid: NARRATIVE_STATES },
      { status: 400 },
    );
  }

  fields.forEach(f => { if (body[f] !== undefined) updates[f] = body[f]; });
  if (updatesOverrideFlag) updates.eligibility_overridden = true;

  // State clock: stamped only when narrative_status genuinely changes, so
  // "how long has this been in this state" stays answerable. See migration 116.
  if (body.narrative_status !== undefined && body.narrative_status !== before?.narrative_status) {
    updates.narrative_status_changed_at = new Date().toISOString();

    // A new draft invalidates the verdict on the old one. This is now
    // unconditional: qa_passed is no longer patchable here, so this write can
    // never also be recording a verdict. Without the reset, a redraft returning
    // to QA would carry the previous attempt's stale pass or fail.
    if (body.narrative_status === 'qa_review') {
      updates.qa_passed = null;
    }

    // Sending a narrative back from approval retires the pass that got it
    // there. Done here rather than trusting the caller, because qa_passed is
    // deliberately not patchable: a verdict is Julie's alone. Without this the
    // row would sit in 'requested' still claiming it had passed QA.
    if (before?.narrative_status === 'approval' && body.narrative_status === 'requested') {
      updates.qa_passed = null;
    }
  }

  // When client_submitted flips to true, set timestamp and update activity
  if (body.client_submitted === true && !before?.client_submitted) {
    updates.client_submitted_at = new Date().toISOString();
    updates.last_activity_at = new Date().toISOString();
    updates.waiting_on = 'funder';
  }

  // A grant that is over is nobody's next move.
  //
  // Closing one left waiting_on untouched, so six dead opportunities sat in the
  // portal still badged "Waiting on TDI", including two Walmart applications
  // whose window shut on 31 August. Bella asked why closed grants still look
  // like they need something from her. This is why.
  //
  // Written here rather than guarded in the badge, because every screen that
  // reads waiting_on would otherwise need to remember, and the read-side
  // version of this bug is the one we keep fixing.
  const FINISHED_STATUSES = ['closed', 'denied', 'awarded'];
  if (body.status && FINISHED_STATUSES.includes(body.status) && body.status !== before?.status) {
    updates.waiting_on = 'none';
  }

  // Any status change updates last_activity_at
  if (body.status && body.status !== before?.status) {
    updates.last_activity_at = new Date().toISOString();
  }

  const { error } = await supabase.from('funding_opportunities').update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If adding a note
  if (body.note) {
    const { error: noteErr } = await supabase.from('funding_opportunity_notes').insert({
      opportunity_id: body.id,
      content: body.note,
      author: auth.member.email || auth.user.email,
    });
    if (noteErr) {
      // The note is the thing the person came here to write. Losing it silently
      // is the failure this gate exists to stop.
      return NextResponse.json(
        { error: `The opportunity was updated but your note was not saved. ${noteErr.message}` },
        { status: 500 },
      );
    }

    // Cross-reference to partnership notes if linked
    const { data: opp } = await supabase.from('funding_opportunities').select('partnership_id, name').eq('id', body.id).single();
    if (opp?.partnership_id) {
      const { error: xrefErr } = await supabase.from('partnership_notes').insert({
        partnership_id: opp.partnership_id,
        content: `Funding (${opp.name}): ${body.note}`,
        author: auth.member.email || auth.user.email,
        note_type: 'general',
        visible_to_partner: false,
      });
      if (xrefErr) console.error('[funding/opportunities] Partnership cross-reference note failed:', xrefErr.message);
    }
  }

  // Auto-create timeline event when client submits
  if (body.client_submitted === true && !before?.client_submitted && before?.pursuit_id) {
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('name')
      .eq('id', body.id)
      .single();

    const { error: submitTimelineErr } = await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: before.pursuit_id,
      event_date: new Date().toISOString().split('T')[0],
      event_title: `Client submitted: ${opp?.name || 'Unknown'}`,
      event_detail: body.client_submitted_proof || 'Submission confirmed',
      status: 'complete',
    });
    if (submitTimelineErr) console.error('[funding/opportunities] Submission timeline entry failed:', submitTimelineErr.message);
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
      postFundingEvent(narrativeEvent(pId, pName, oName, fromNs, body.narrative_status, oppNow?.assigned_agent, body.id)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))

      // Push notification to agents when a draft is requested
      if (body.narrative_status === 'requested') {
        const agentName = oppNow?.assigned_agent || 'Unassigned agent'
        const slackWebhook = process.env.SLACK_WEBHOOK_INTERNAL
        if (slackWebhook) {
          fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `New draft requested: "${oName}" for ${pName}. Assigned to ${agentName}. 72-hour deadline.`,
            }),
          }).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
        }
      }
    }
    // Window status change
    if (body.window_status) {
      postFundingEvent(windowEvent(pId, pName, oName, body.window_status)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
    }
    // Client submitted
    if (body.client_submitted === true && !before.client_submitted) {
      postFundingEvent(submittedEvent(pId, pName, oName, body.client_submitted_proof)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
    }
    // Award recorded
    if (body.status === 'awarded' && before.status !== 'awarded') {
      postFundingEvent(awardEvent(pId, pName, oName, oppNow?.awarded_amount || oppNow?.amount || 0)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
    }
    // Denial recorded
    if (body.status === 'denied' && before.status !== 'denied') {
      postFundingEvent(denialEvent(pId, pName, oName, body.denial_reason)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
    }
    // Research status change
    if (body.research_status) {
      postFundingEvent(researchEvent(pId, pName, oName, body.research_status, oppNow?.assigned_agent)).catch(err => console.error('[opportunities] non-blocking side effect failed:', err))
    }

    // Auto-compute and update pursuit phase based on opportunity states
    try {
      const { data: allOpps } = await supabase
        .from('funding_opportunities')
        .select('status, narrative_status, client_submitted, forwarding_email_status')
        .eq('pursuit_id', pId)

      if (allOpps && allOpps.length > 0) {
        // Allowed phases: intake, researching, strategy, writing, in_review, delivered, submitted, awaiting_decision, awarded, denied, on_hold
        let computedPhase = 'intake'
        const hasDrafting = allOpps.some((o: { narrative_status: string }) => ['requested'].includes(o.narrative_status))
        const hasReview = allOpps.some((o: { narrative_status: string }) => ['review', 'qa_review'].includes(o.narrative_status))
        const hasReady = allOpps.some((o: { narrative_status: string }) => o.narrative_status === 'ready')
        const hasSent = allOpps.some((o: { forwarding_email_status: string }) => o.forwarding_email_status === 'sent')
        const hasSubmitted = allOpps.some((o: { client_submitted: boolean }) => o.client_submitted === true)
        const hasAwarded = allOpps.some((o: { status: string }) => o.status === 'awarded')
        const allDecided = allOpps.every((o: { status: string }) => ['awarded', 'denied', 'closed'].includes(o.status))

        if (allDecided) computedPhase = hasAwarded ? 'awarded' : 'denied'
        else if (hasSubmitted) computedPhase = 'submitted'
        else if (hasSent) computedPhase = 'delivered'
        else if (hasReview) computedPhase = 'in_review'
        else if (hasReady) computedPhase = 'in_review'
        else if (hasDrafting) computedPhase = 'writing'
        else computedPhase = 'intake'

        const { error: phaseUpdErr } = await supabase
          .from('funding_pursuits')
          .update({ current_phase: computedPhase, updated_at: new Date().toISOString() })
          .eq('id', pId)
        if (phaseUpdErr) console.error('[funding/opportunities] Phase not updated:', phaseUpdErr.message)
      }
    } catch (phaseErr) {
      console.error('[funding-opportunities] Phase auto-update failed:', phaseErr)
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
  // A delete that reports success without deleting is worse than one that
  // fails loudly: the row stays in every report while the person who removed it
  // believes it is gone.
  const { error: notesDelErr } = await supabase
    .from('funding_opportunity_notes').delete().eq('opportunity_id', id);
  if (notesDelErr) {
    return NextResponse.json(
      { error: `Could not remove this opportunity's notes, so nothing was deleted. ${notesDelErr.message}` },
      { status: 500 },
    );
  }

  const { error: oppDelErr } = await supabase
    .from('funding_opportunities').delete().eq('id', id);
  if (oppDelErr) {
    return NextResponse.json(
      { error: `Notes were removed but the opportunity was not. ${oppDelErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
