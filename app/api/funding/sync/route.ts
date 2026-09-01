import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { MAX_QA_ATTEMPTS, ESCALATION_OPTIONS, validateEscalation } from '@/lib/funding-qa'
import { postFundingEvent, narrativeEvent } from '@/lib/funding-slack'
import { screenPath } from '@/lib/funding-eligibility'

/**
 * Funding Sync API -- Bridge between Paperclip and the Admin Funding Portal
 *
 * Paperclip agents call this endpoint to push updates into the funding system:
 * - New opportunities discovered by the Grant Discovery Assistant
 * - Narrative status changes (drafted, reviewed, approved)
 * - Action item updates (completed, blocked)
 * - Timeline events (emails sent, calls made, decisions reached)
 * - Email drafts ready for review
 * - Pursuit lookups (find pursuit by school name)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${syncKey}`
}

type SyncAction =
  | 'find_pursuit'
  | 'get_pursuit'
  | 'find_work'
  | 'create_opportunity'
  | 'update_opportunity'
  | 'create_action'
  | 'update_action'
  | 'add_timeline_event'
  | 'draft_email'
  | 'update_narrative'
  | 'submit_qa_verdict'
  | 'get_status'

// GET -- Paperclip can look up pursuits and status
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl
  const action = url.searchParams.get('action') as string
  const supabase = db()

  // Find pursuit by school name (fuzzy match)
  if (action === 'find_pursuit') {
    const schoolName = url.searchParams.get('school')
    if (!schoolName) return NextResponse.json({ error: 'school param required' }, { status: 400 })

    const { data } = await supabase
      .from('funding_pursuits')
      .select('id, pursuit_name, district_name, total_amount, contract_gap, current_phase, client_contact_name, client_contact_email, implementation_date')
      .or(`pursuit_name.ilike.%${schoolName}%,district_name.ilike.%${schoolName}%`)

    return NextResponse.json({ pursuits: data || [] })
  }

  // Get full pursuit status with opportunities and actions
  if (action === 'get_pursuit') {
    const pursuitId = url.searchParams.get('pursuitId')
    if (!pursuitId) return NextResponse.json({ error: 'pursuitId param required' }, { status: 400 })

    const [pursuitRes, oppsRes, actionsRes] = await Promise.all([
      supabase.from('funding_pursuits').select('*').eq('id', pursuitId).single(),
      supabase.from('funding_opportunities').select('*').eq('pursuit_id', pursuitId).order('created_at'),
      supabase.from('funding_action_items').select('*').eq('pursuit_id', pursuitId).order('sort_order'),
    ])

    return NextResponse.json({
      pursuit: pursuitRes.data,
      opportunities: oppsRes.data || [],
      actions: actionsRes.data || [],
    })
  }

  // Find actionable work for an agent
  if (action === 'find_work') {
    const agent = url.searchParams.get('agent') // optional: filter by assigned_agent

    // 1. Draft narrative work — requires BOTH window_status='open' AND gate_open=true
    let narrativeQuery = supabase
      .from('funding_opportunities')
      .select(`
        id, pursuit_id, name, plan_category, amount,
        narrative_status, narrative_url, assigned_agent,
        window_status, window_opens, window_closes,
        application_opens, application_closes,
        contact_name, contact_email, waiting_on,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name, client_contact_name)
      `)
      .eq('narrative_status', 'requested')
      .eq('window_status', 'open')

    if (agent) {
      narrativeQuery = narrativeQuery.eq('assigned_agent', agent)
    }

    const { data: rawNarrativeWork } = await narrativeQuery

    // Gate enforcement: only include draft work for pursuits whose gate_open = true
    // AND which are still live.
    //
    // The archive check is new. Without it, a school that has declined grant
    // work can still have narratives handed to an agent, because nothing else
    // here looks at the archive flag. Archived pursuits were excluded only
    // incidentally, since a declined school's gate is usually shut, and that is
    // luck rather than logic. Glen Ellyn sat archived with five narratives
    // stuck at 'requested' for 431 hours; the only reason no agent picked them
    // up is that their gate happened to be closed.
    const narrativePursuitIds = [...new Set((rawNarrativeWork ?? []).map((o: any) => o.pursuit_id))]
    let servablePursuitIds: Set<string> = new Set()
    let pursuitContext: Map<string, any> = new Map()
    if (narrativePursuitIds.length > 0) {
      const [gateRes, pursuitRes] = await Promise.all([
        supabase
          .from('pursuit_gate')
          .select('pursuit_id')
          .in('pursuit_id', narrativePursuitIds)
          .eq('gate_open', true),
        supabase
          .from('funding_pursuits')
          .select('id, archived, sector, county, state_code, school_profile')
          .in('id', narrativePursuitIds),
      ])
      const gateOpen = new Set((gateRes.data ?? []).map(g => g.pursuit_id))
      const live = new Set((pursuitRes.data ?? []).filter(p => !p.archived).map(p => p.id))
      servablePursuitIds = new Set(
        narrativePursuitIds.filter((id: string) => gateOpen.has(id) && live.has(id)),
      )
      pursuitContext = new Map((pursuitRes.data ?? []).map(p => [p.id, p]))
    }
    let narrativeWork = (rawNarrativeWork ?? []).filter((o: any) => servablePursuitIds.has(o.pursuit_id))

    // The stop rule, enforced where it actually cannot be walked around.
    //
    // screenPath also runs in the opportunities PATCH route, which is where
    // Bella requests a draft from the portal. That covers the human path and
    // nothing else. Three other writes can set narrative_status to 'requested'
    // without ever passing it: the opportunities POST, the agent's
    // create_opportunity call, and the agent's generic field update.
    //
    // That gap lands hardest on precisely the work we least want unscreened.
    // When Amara researches local funders and creates opportunities for a
    // Rotary club or a community foundation, those are the paths whose
    // eligibility is least certain, and every one of them would have arrived at
    // an agent unchecked.
    //
    // Screening here closes all four doors at once, because find_work is the
    // single point every agent passes through to receive drafting work. However
    // a row reached 'requested', it is screened before anyone writes a word.
    const blockedByScreen: Array<{ id: string; name: string; reason: string; rule: string }> = []
    if (narrativeWork.length > 0) {
      const cleared: any[] = []
      for (const o of narrativeWork) {
        const p = pursuitContext.get(o.pursuit_id)
        const profile = (() => {
          try {
            const raw = p?.school_profile
            if (!raw) return {} as Record<string, unknown>
            const once = typeof raw === 'string' ? JSON.parse(raw) : raw
            return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>
          } catch { return {} as Record<string, unknown> }
        })()

        const result = screenPath(
          {
            name: o.name ?? '',
            windowStatus: o.window_status ?? null,
            namedApplicant: (profile.nea_member_name as string) ?? null,
          },
          {
            sector: p?.sector ?? null,
            county: p?.county ?? null,
            stateCode: p?.state_code ?? null,
            titleIStatus: (profile.title_i_status as string) ?? null,
            designation: (profile.designation as string) ?? null,
          },
        )

        if (result.verdict === 'clear') {
          cleared.push(o)
          continue
        }

        // Recorded, not just withheld. A path that silently fails to reach an
        // agent is the same failure as a path that silently stalls: the portal
        // has to be able to say why nothing is happening.
        blockedByScreen.push({
          id: o.id, name: o.name, reason: result.reason, rule: result.rule,
        })
        // Best effort: the verdict is already being returned to the caller in
        // blockedByScreen, so a failure here loses a cached value, not a decision.
        const { error: verdictErr } = await supabase.from('funding_opportunities').update({
          eligibility_verdict: result.verdict,
          eligibility_reason: result.reason,
          eligibility_rule: result.rule,
          eligibility_checked_at: new Date().toISOString(),
        }).eq('id', o.id)
        if (verdictErr) console.error('[sync] Could not cache eligibility verdict:', verdictErr)
      }
      narrativeWork = cleared
    }

    // 2. Research work — NOT window-gated, NOT gate-gated (finding new funders is always allowed)
    //
    // No longer dormant. This branch returned nothing for the whole life of the
    // system, because research_status read 'none' on every row and the only
    // thing that set it was a button on an opportunity that already existed.
    //
    // The daily reminders cron now creates a "Local funder discovery"
    // placeholder for any pursuit with no local source, already marked
    // requested, so this branch has real work to hand out.
    let researchQuery = supabase
      .from('funding_opportunities')
      .select(`
        id, pursuit_id, name, plan_category, amount,
        research_status, assigned_agent,
        window_status, contact_name,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name)
      `)
      .eq('research_status', 'requested')
      // Belt and braces. A closed opportunity is finished regardless of what its
      // research_status says, and handing an agent work she has already done is
      // how a queue becomes noise she learns to ignore.
      .not('status', 'in', '("closed","awarded","denied")')

    if (agent) {
      // Unassigned research is offered to whoever asks, not hidden from
      // everyone.
      //
      // Drafting is assigned deliberately: a narrative belongs to Vanessa and
      // filtering it by name is correct. Research is not assigned to anybody,
      // so applying the same filter meant an agent asking "what is my work"
      // matched zero rows, while the same call without a name returned nine.
      //
      // Amara is the research agent. She has been asking and being told there
      // is nothing, for ten days, while nine funders discovered on 19 August
      // sat with research_status 'requested'. That is why the catalogue holds
      // eighteen funders and not one of them has ever been researched.
      //
      // Named assignment still wins where it exists, so work can be pointed at
      // a specific agent when that matters.
      researchQuery = researchQuery.or(`assigned_agent.eq.${agent},assigned_agent.is.null`)
    }

    const { data: rawResearchWork } = await researchQuery

    // Research is deliberately not gate-gated: finding funders for a school
    // costs nothing and touches nobody, so it is allowed to run before the
    // school has cleared anything.
    //
    // Archived is different, and was missed. Drafting gained an archive check
    // and this branch did not, so a school that declined grant work would still
    // generate research assignments. That was harmless only while the branch
    // was dormant. Now that the daily cron seeds a discovery placeholder for
    // every pursuit lacking a local source, a declined school would start
    // producing real work for Amara on the next sync.
    const researchPursuitIds = [...new Set((rawResearchWork ?? []).map((o: any) => o.pursuit_id))]
    let liveResearchIds: Set<string> = new Set()
    if (researchPursuitIds.length > 0) {
      const { data: researchPursuits } = await supabase
        .from('funding_pursuits')
        .select('id, archived')
        .in('id', researchPursuitIds)
      liveResearchIds = new Set(
        (researchPursuits ?? []).filter(p => !p.archived).map(p => p.id))
    }
    const researchWork = (rawResearchWork ?? []).filter((o: any) =>
      liveResearchIds.has(o.pursuit_id))

    // 3. QA work — narratives waiting on a verdict.
    //
    // Deliberately NOT window-gated and NOT gate-gated, unlike drafting. The
    // narrative already exists; reviewing it costs nothing if the window later
    // closes, and holding a finished draft behind a gate the school has not
    // cleared just recreates the stall this pipeline had before.
    const { data: rawQaWork } = await supabase
      .from('funding_opportunities')
      .select(`
        id, pursuit_id, name, plan_category, amount,
        narrative_status, narrative_url, narrative_content, qa_passed,
        qa_attempt_count, redraft_guidance, assigned_agent,
        window_status, application_closes,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name)
      `)
      .eq('narrative_status', 'qa_review')

    // Being in qa_review IS the signal that a verdict is needed. Do not filter
    // on qa_passed here: after a fail it stays false, so a redrafted narrative
    // returning to qa_review would be invisible to QA forever. That is exactly
    // what happened to five Saunemin narratives for two days.
    const qaWork = rawQaWork ?? []

    // Tag each item with its request type
    const work = [
      ...narrativeWork.map((item: any) => ({
        request_type: 'draft_narrative' as const,
        ...item,
      })),
      ...researchWork.map((item: any) => ({
        request_type: 'research_funders' as const,
        ...item,
      })),
      ...qaWork.map((item: any) => ({
        request_type: 'qa_narrative' as const,
        attempt: (item.qa_attempt_count ?? 0) + 1,
        escalates_if_failed: (item.qa_attempt_count ?? 0) + 1 > MAX_QA_ATTEMPTS,
        ...item,
      })),
    ]

    return NextResponse.json({
      work,
      count: work.length,
      filters: {
        agent: agent || 'all',
        draft_narrative_count: narrativeWork.length,
        research_funders_count: researchWork.length,
        qa_narrative_count: qaWork.length,
      },
      // Returned so an agent finding no work can say why, rather than
      // reporting an empty queue as though nothing had been asked for.
      withheld: blockedByScreen,
    })
  }

  // Get overall status across all pursuits
  if (action === 'get_status') {
    const { data: pursuits } = await supabase
      .from('funding_pursuits')
      .select('id, pursuit_name, district_name, current_phase, client_contact_name')
      .order('created_at', { ascending: false })

    const { data: opps } = await supabase
      .from('funding_opportunities')
      .select('id, pursuit_id, name, status, waiting_on, narrative_status, client_submitted, application_closes')
      .not('status', 'in', '("awarded","denied")')

    const { data: actions } = await supabase
      .from('funding_action_items')
      .select('id, pursuit_id, title, owner_type, status, due_date')
      .in('status', ['pending', 'in_progress'])

    return NextResponse.json({
      pursuits: pursuits || [],
      active_opportunities: opps || [],
      open_actions: actions || [],
    })
  }

  return NextResponse.json({ error: 'Unknown action. Use: find_pursuit, get_pursuit, find_work, get_status' }, { status: 400 })
}

// POST -- Paperclip pushes updates
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const action = body.action as SyncAction
  const supabase = db()

  // ---- CREATE OPPORTUNITY ----
  // When Grant Discovery Assistant finds a new funding source
  if (action === 'create_opportunity') {
    const { pursuitId, name, amount, planCategory, status, contactName, contactEmail,
      applicationOpens, applicationCloses, waitingOn, narrativeStatus, notes,
      windowStatus, sourceUrl } = body

    if (!pursuitId || !name) {
      return NextResponse.json({ error: 'pursuitId and name required' }, { status: 400 })
    }

    // A funder must arrive with a window status and a source.
    //
    // This refusal is the point of the skill layer. Agents build these calls by
    // hand from a URL in a markdown table, with nothing requiring the fields to
    // be right, and the result was thirteen grants at window_status 'unknown'
    // where find_work could never return them. All nine funders discovered on
    // 19 Aug were among them: a community foundation twelve miles from
    // Saunemin, a Catholic education trust in St. Peter Chanel's own diocese.
    // Good research that reached nobody.
    //
    // 'unknown' is a legitimate answer. Not saying is not.
    const VALID_WINDOW = ['open', 'closed_missed', 'closed_awarded', 'closed_denied', 'unknown']
    if (!windowStatus || !VALID_WINDOW.includes(windowStatus)) {
      return NextResponse.json({
        error:
          `windowStatus is required and must be one of: ${VALID_WINDOW.join(', ')}. ` +
          `If you could not determine whether applications are open, send 'unknown' ` +
          `deliberately. Leaving it out is how nine discovered funders became ` +
          `invisible to every agent for a week.`,
      }, { status: 400 })
    }
    if (!sourceUrl || typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
      return NextResponse.json({
        error:
          'sourceUrl is required. A funder nobody can trace back to a page is a ' +
          'funder the next person has to research again from nothing.',
      }, { status: 400 })
    }

    // Check for duplicates (same name on same pursuit)
    const { data: existing } = await supabase
      .from('funding_opportunities')
      .select('id')
      .eq('pursuit_id', pursuitId)
      .ilike('name', name)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Opportunity with this name already exists on this pursuit',
        existing_id: existing[0].id,
      }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('funding_opportunities')
      .insert({
        pursuit_id: pursuitId,
        name,
        amount: amount || null,
        plan_category: planCategory || null,
        status: status || 'researching',
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        application_opens: applicationOpens || null,
        application_closes: applicationCloses || null,
        waiting_on: waitingOn || 'tdi',
        narrative_status: narrativeStatus || 'not_started',
        window_status: windowStatus,
        // A newly discovered funder is by definition not yet understood. We
        // rarely know its dates, its focus or whether the school qualifies at
        // the moment it is found.
        //
        // This was never set, so it defaulted to 'none', and the research
        // branch of find_work matches only 'requested'. Discovery therefore
        // created work that nothing could ever pick up. All nine funders found
        // on 19 Aug, including a community foundation twelve miles from
        // Saunemin and a Catholic education trust in St. Peter Chanel's own
        // diocese, have sat untouched since.
        research_status: 'requested',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-create timeline event. Best effort: losing the timeline entry must
    // not fail the opportunity that was just created successfully.
    const { error: timelineErr } = await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: pursuitId,
      event_date: new Date().toISOString().split('T')[0],
      event_title: `New opportunity discovered: ${name}`,
      event_detail: notes || `Added by Paperclip Grant Discovery. ${amount ? '$' + Number(amount).toLocaleString() : 'Amount TBD'}.`,
      status: 'complete',
    })
    if (timelineErr) console.error('[sync] Opportunity created but timeline entry failed:', timelineErr)

    return NextResponse.json({ success: true, opportunity: data })
  }

  // ---- UPDATE OPPORTUNITY ----
  // When agents change status, narrative, submission tracking, etc.
  if (action === 'update_opportunity') {
    const { opportunityId, ...updates } = body
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })

    const fields = [
      'name', 'amount', 'status', 'plan_category', 'waiting_on',
      'contact_name', 'contact_email', 'application_opens', 'application_closes',
      'narrative_status', 'narrative_url', 'forwarding_email_status',
      'client_submitted', 'client_submitted_proof',
      'decision_date', 'awarded_amount', 'denial_reason',
      'next_action', 'next_action_due',
      // research_status was missing from this list, and the omission cost the
      // system its entire local-funder capability for two days.
      //
      // Amara's instructions tell her to set research_status='researching' when
      // she starts and 'found' when she finishes. Both calls were silently
      // dropped here, because a field absent from this array is skipped without
      // comment and the response still says success.
      //
      // So she did the research, created nine real local funders, could not mark
      // the placeholder done, fell back to status='closed', and find_work kept
      // handing her the same three items every hour. Forty-plus heartbeats
      // reporting "the same 3 stuck placeholders". She was right; it was stuck.
      'research_status',
      'window_status', 'window_opens', 'window_closes',
    ]

    const { data: beforeRow } = await supabase
      .from('funding_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()
    const before = beforeRow as Record<string, unknown> | null

    const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() }
    let changed = false
    fields.forEach(f => {
      if (updates[f] === undefined) return
      allowed[f] = updates[f]
      if (!before || before[f] !== updates[f]) changed = true
    })

    // Only a real change counts as activity. Stamping this on every write is how
    // stalled narratives used to report zero days idle while sitting untouched
    // for a week — the stall detector reads this field.
    if (changed) allowed.last_activity_at = new Date().toISOString()

    // State clock (migration 113): narrative_status transitions only
    if (updates.narrative_status !== undefined &&
        before?.narrative_status !== updates.narrative_status) {
      allowed.narrative_status_changed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('funding_opportunities')
      .update(allowed)
      .eq('id', opportunityId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- UPDATE NARRATIVE ----
  // Shortcut for the common case: agent drafted/reviewed a narrative
  if (action === 'update_narrative') {
    const { opportunityId, narrativeStatus, narrativeUrl, narrativeContent, note,
      factsCited } = body
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })

    // A draft submitted for QA must declare the facts it used.
    //
    // Two applications cited a 48% reading figure nobody could reproduce. Julie
    // caught it by reading carefully, twice. That is a person doing a check a
    // machine should do, and it only worked because she happened to look.
    //
    // Every fact about a school now carries a source and a date, so a draft can
    // name what it leaned on and the claim becomes checkable. Of 42 facts across
    // the three live schools, 9 currently have a source, so this will refuse a
    // lot at first. That refusal is the accurate state of the evidence, not an
    // obstacle to route around.
    const submittingForReview =
      narrativeStatus === 'qa_review' || narrativeStatus === 'review'
    if (submittingForReview && (!Array.isArray(factsCited) || factsCited.length === 0)) {
      return NextResponse.json({
        error:
          'factsCited is required when submitting a narrative for QA. List the ' +
          'school facts this draft relies on, by key, so each one can be checked ' +
          'against its source. If the draft genuinely cites no facts about the ' +
          'school, say so with an empty reason rather than omitting the field.',
      }, { status: 400 })
    }

    const { data: prior } = await supabase
      .from('funding_opportunities')
      .select('narrative_status, narrative_url, narrative_content')
      .eq('id', opportunityId)
      .single()

    // A narrative cannot re-enter QA unchanged.
    //
    // Julie gets two attempts before a narrative escalates to a person. Nothing
    // checked that a resubmission differed from the draft she had already
    // reviewed, so a writer could send the identical text back and burn an
    // attempt without editing a word.
    //
    // It happened repeatedly. Five of the fifteen reviews on Saunemin say some
    // version of "no changes were made since the last review" — a third of all
    // QA effort spent re-reading text Julie had already read, and on two
    // narratives it consumed the attempt budget and forced an escalation that
    // need never have happened.
    //
    // Refused rather than silently ignored, so the writer is told why and can
    // act, instead of believing the work was submitted.
    if (
      narrativeStatus === 'qa_review' &&
      prior?.narrative_status === 'requested' &&
      narrativeContent !== undefined &&
      narrativeContent === prior?.narrative_content
    ) {
      return NextResponse.json({
        error:
          'This narrative is identical to the version QA already reviewed. ' +
          'Address the redraft guidance and resubmit, or escalate it if the ' +
          'blocker cannot be fixed by rewriting.',
        unchanged: true,
      }, { status: 409 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (narrativeStatus) updates.narrative_status = narrativeStatus
    if (narrativeUrl) updates.narrative_url = narrativeUrl
    if (narrativeContent !== undefined) updates.narrative_content = narrativeContent

    const changed =
      (narrativeStatus && narrativeStatus !== prior?.narrative_status) ||
      (narrativeUrl && narrativeUrl !== prior?.narrative_url) ||
      (narrativeContent !== undefined && narrativeContent !== prior?.narrative_content)

    // See the note in update_opportunity: activity means a change, not a touch.
    if (changed) updates.last_activity_at = new Date().toISOString()

    // State clock (migration 116)
    if (narrativeStatus && narrativeStatus !== prior?.narrative_status) {
      updates.narrative_status_changed_at = new Date().toISOString()
    }

    // A new draft invalidates the verdict on the old one. Without this,
    // qa_passed keeps the stale 'false' from the previous attempt and the
    // record claims a narrative failed a review it has never had.
    if (narrativeStatus === 'qa_review' && prior?.narrative_status !== 'qa_review') {
      updates.qa_passed = null
    }

    const { error } = await supabase
      .from('funding_opportunities')
      .update(updates)
      .eq('id', opportunityId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get pursuit ID for timeline
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('pursuit_id, name')
      .eq('id', opportunityId)
      .single()

    if (opp) {
      const statusLabels: Record<string, string> = {
        drafting: 'Narrative draft started',
        review: 'Narrative ready for review',
        qa_review: 'Narrative in QA review',
        ready: 'Narrative approved and ready',
      }
      const { error: narrTimelineErr } = await supabase.from('funding_pursuit_timeline').insert({
        pursuit_id: opp.pursuit_id,
        event_date: new Date().toISOString().split('T')[0],
        event_title: `${statusLabels[narrativeStatus] || 'Narrative updated'}: ${opp.name}`,
        event_detail: note || (narrativeUrl ? `Document: ${narrativeUrl}` : ''),
        status: narrativeStatus === 'ready' ? 'complete' : 'active',
      })
      if (narrTimelineErr) console.error('[sync] Narrative updated but timeline entry failed:', narrTimelineErr)

      // Tell people, not just the timeline.
      //
      // This route wrote a timeline row and returned. Nothing reached Slack, so
      // a draft arriving for QA was invisible outside the portal. The timeline
      // is a record you go and look at; this is the part that reaches someone.
      if (narrativeStatus && narrativeStatus !== prior?.narrative_status) {
        postFundingEvent(
          narrativeEvent(
            opp.pursuit_id,
            '',
            opp.name,
            String(prior?.narrative_status ?? 'unknown'),
            String(narrativeStatus),
          )
        ).catch(err => console.error('[sync] non-blocking side effect failed:', err))
      }
    }

    return NextResponse.json({ success: true })
  }

  // ---- SUBMIT QA VERDICT ----
  // The only way a QA decision enters the system. Deliberately not part of
  // update_opportunity: the verdict carries rules (notes required on a fail,
  // the attempt bound, a usable escalation) that a generic field write would
  // not enforce.
  if (action === 'submit_qa_verdict') {
    const { opportunityId, passed, reviewer, score, summary, issues, escalation } = body

    if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })
    if (typeof passed !== 'boolean') return NextResponse.json({ error: 'passed (boolean) required' }, { status: 400 })
    if (!reviewer) return NextResponse.json({ error: 'reviewer required' }, { status: 400 })

    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('id, pursuit_id, name, narrative_status, qa_attempt_count, assigned_agent')
      .eq('id', opportunityId)
      .single()

    if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    if (opp.narrative_status !== 'qa_review') {
      return NextResponse.json({
        error: `Narrative is '${opp.narrative_status}', not 'qa_review'. Nothing to review.`,
      }, { status: 409 })
    }

    // A fail with no explanation is useless to whoever picks it up next
    if (!passed && (!summary || String(summary).trim().length < 15)) {
      return NextResponse.json({
        error: 'summary required on a fail — the writer needs to know what to change',
      }, { status: 400 })
    }

    const attempt = (opp.qa_attempt_count ?? 0) + 1
    const now = new Date().toISOString()

    // Not best effort. This row IS the QA review. If it does not land, the
    // opportunity must not be advanced on the strength of a review that was
    // never recorded, so this fails the request rather than continuing.
    const { error: qaErr } = await supabase.from('funding_narrative_qa_reviews').insert({
      opportunity_id: opportunityId,
      attempt,
      passed,
      reviewer,
      score: typeof score === 'number' ? score : null,
      summary: summary || null,
      issues: issues ?? null,
    })

    if (qaErr) {
      console.error('[sync] QA review not recorded, refusing to advance:', qaErr)
      return NextResponse.json(
        { error: `QA review was not recorded, so nothing was advanced. ${qaErr.message}` },
        { status: 500 },
      )
    }

    const updates: Record<string, unknown> = {
      qa_passed: passed,
      qa_reviewer: reviewer,
      qa_notes: summary || null,
      qa_attempt_count: attempt,
      updated_at: now,
      last_activity_at: now,
      narrative_status_changed_at: now,
    }

    let outcome: string

    if (passed) {
      // Julie's pass never reaches a school. It reaches Bella.
      updates.narrative_status = 'approval'
      updates.redraft_guidance = null
      outcome = 'approval'
    } else if (attempt > MAX_QA_ATTEMPTS) {
      // Escalating to someone who is not a grant expert, so it has to arrive as
      // a diagnosis with a recommended path, never as an open problem.
      const check = validateEscalation(escalation)
      if (!check.ok) {
        return NextResponse.json({
          error: `Attempt ${attempt} exceeds the ${MAX_QA_ATTEMPTS}-attempt limit, so this escalates to a person. ${check.error}`,
          escalation_required: true,
          options: ESCALATION_OPTIONS.map(o => ({ key: o.key, label: o.label, useWhen: o.useWhen })),
        }, { status: 400 })
      }
      updates.narrative_status = 'escalated'
      updates.qa_escalation = check.value
      outcome = 'escalated'
    } else {
      // Back to the writer for another attempt
      updates.narrative_status = 'requested'
      updates.redraft_guidance = summary
      outcome = 'requested'
    }

    const { error } = await supabase
      .from('funding_opportunities')
      .update(updates)
      .eq('id', opportunityId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const labels: Record<string, string> = {
      approval: `QA passed (${reviewer}) — ready for Bella's approval`,
      requested: `QA failed attempt ${attempt}, returned to writer`,
      escalated: `QA failed ${attempt} times, escalated to Bella with a recommendation`,
    }
    const { error: qaTimelineErr } = await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: opp.pursuit_id,
      event_date: now.split('T')[0],
      event_title: `${labels[outcome]}: ${opp.name}`,
      event_detail: summary || '',
      status: outcome === 'approval' ? 'complete' : 'active',
    })
    if (qaTimelineErr) console.error('[sync] QA recorded but timeline entry failed:', qaTimelineErr)

    postFundingEvent(
      narrativeEvent(opp.pursuit_id, '', opp.name, 'qa_review', outcome, reviewer)
    ).catch(err => console.error('[sync] non-blocking side effect failed:', err))

    return NextResponse.json({
      success: true,
      outcome,
      attempt,
      attempts_remaining: Math.max(0, MAX_QA_ATTEMPTS - attempt),
    })
  }

  // ---- CREATE ACTION ITEM ----
  if (action === 'create_action') {
    const { pursuitId, opportunityId, ownerType, ownerEmail, ownerName,
      title, description, dueDate, category, preparedMaterials, preparedDocumentUrl } = body

    if (!pursuitId || !title) {
      return NextResponse.json({ error: 'pursuitId and title required' }, { status: 400 })
    }

    // An agent cannot aim a task at a school.
    //
    // A client-owned item resolves its address to the school itself, and the
    // reminder engine used to mail it. Three internally worded titles reached a
    // principal at Prince George's County on 13 July, including "Get Dr. Porter
    // to send ATSI email to Dr. Gloster", written about her and sent to her. An
    // earlier run sent 41 such messages to two principals, and St. Peter Chanel
    // was chased fourteen times about submitting an application nobody was
    // writing.
    //
    // Only a person contacts a school. An agent that needs something from one
    // creates work for Bella, with the wording ready, and she sends it.
    if (ownerType === 'client') {
      return NextResponse.json({
        error:
          'Agents cannot create client-owned tasks. Create it as TDI-owned and put ' +
          'the client-facing wording in preparedMaterials, so Bella sends it. The ' +
          'system does not email schools.',
      }, { status: 400 })
    }

    // A task with no due date is invisible. The follow-up engine skips anything
    // without one, so two Saunemin grants sat unchaseable for nine days with
    // Gary's address on the pursuit the whole time.
    if (!dueDate) {
      return NextResponse.json({
        error:
          'dueDate is required. The follow-up engine skips items without one, so ' +
          'a task with no date is created and then never chased by anything.',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_action_items')
      .insert({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId || null,
        owner_type: ownerType || 'tdi',
        owner_email: ownerEmail || 'hello@teachersdeserveit.com',
        owner_name: ownerName || (ownerType === 'tdi' ? 'Bella' : null),
        title,
        description: description || null,
        status: 'pending',
        due_date: dueDate || null,
        category: category || null,
        prepared_materials: preparedMaterials || null,
        prepared_document_url: preparedDocumentUrl || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, action: data })
  }

  // ---- UPDATE ACTION ITEM ----
  if (action === 'update_action') {
    const { actionId, status, completedBy, note } = body
    if (!actionId) return NextResponse.json({ error: 'actionId required' }, { status: 400 })

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (status === 'done') {
      updates.completed_at = new Date().toISOString()
      updates.completed_by = completedBy || 'paperclip'
    }

    const { error } = await supabase
      .from('funding_action_items')
      .update(updates)
      .eq('id', actionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- ADD TIMELINE EVENT ----
  if (action === 'add_timeline_event') {
    const { pursuitId, title, detail, eventStatus } = body
    if (!pursuitId || !title) {
      return NextResponse.json({ error: 'pursuitId and title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_pursuit_timeline')
      .insert({
        pursuit_id: pursuitId,
        event_date: new Date().toISOString().split('T')[0],
        event_title: title,
        event_detail: detail || '',
        status: eventStatus || 'complete',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, event: data })
  }

  // ---- DRAFT EMAIL ----
  if (action === 'draft_email') {
    const { pursuitId, opportunityId, subject, emailBody, toEmail, toName, emailType } = body
    if (!pursuitId || !subject || !emailBody || !toEmail) {
      return NextResponse.json({ error: 'pursuitId, subject, body, toEmail required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_email_log')
      .insert({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId || null,
        subject,
        body: emailBody,
        to_email: toEmail,
        to_name: toName || null,
        status: 'draft',
        sent_by: 'paperclip',
        email_type: emailType || 'custom',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, email: data })
  }

  return NextResponse.json({
    error: 'Unknown action',
    available_actions: [
      'create_opportunity', 'update_opportunity', 'update_narrative',
      'create_action', 'update_action',
      'add_timeline_event', 'draft_email',
    ],
  }, { status: 400 })
}
