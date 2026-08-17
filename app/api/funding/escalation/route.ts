import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getEscalationOption, ESCALATION_OPTIONS } from '@/lib/funding-qa'
import { postFundingEvent, narrativeEvent } from '@/lib/funding-slack'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Carries out the choice Bella made on an escalated narrative.
 *
 * Every branch here leaves the narrative in a state that has an owner and a way
 * out. That is the rule the old pipeline broke in three places, and the reason
 * ten opportunities sat still for weeks.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { opportunityId, option, detail } = await request.json()
  if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })

  const supabase = db()
  const actor = auth.member.email || auth.user.email || 'unknown'
  const now = new Date().toISOString()

  const { data: opp } = await supabase
    .from('funding_opportunities')
    .select('id, pursuit_id, name, narrative_status, qa_escalation, assigned_agent, contact_name')
    .eq('id', opportunityId)
    .single()

  if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
  if (opp.narrative_status !== 'escalated') {
    return NextResponse.json({
      error: `Narrative is '${opp.narrative_status}', not 'escalated'. Nothing to decide.`,
    }, { status: 409 })
  }

  // 'resume_drafting' is not one of Bella's escalation choices — it is how a
  // narrative parked on request_info gets going again once the school replies.
  const isResume = option === 'resume_drafting'
  const chosen = isResume ? null : getEscalationOption(option)

  if (!isResume && !chosen) {
    return NextResponse.json({
      error: 'Unknown option',
      options: ESCALATION_OPTIONS.map(o => ({ key: o.key, label: o.label })),
    }, { status: 400 })
  }

  if (chosen?.requires && (!detail || String(detail).trim().length < 3)) {
    return NextResponse.json({
      error: `${chosen.requires.label} is required for "${chosen.label}"`,
      requires: chosen.requires,
    }, { status: 400 })
  }

  const escalation = (opp.qa_escalation ?? {}) as Record<string, unknown>
  const updates: Record<string, unknown> = {
    updated_at: now,
    last_activity_at: now,
  }
  let message = ''
  let emailDraft: { ask: string; contactName: string | null } | null = null

  switch (option) {
    case 'approve_anyway':
      updates.narrative_status = 'approval'
      updates.narrative_status_changed_at = now
      updates.qa_passed = true
      updates.qa_escalation = { ...escalation, resolved_option: option, resolved_reason: detail, resolved_by: actor, resolved_at: now }
      message = 'Moved to your approval step. The QA objections stay on the record as reviewed and overridden.'
      break

    case 'redraft_with_guidance':
      updates.narrative_status = 'requested'
      updates.narrative_status_changed_at = now
      updates.qa_passed = null
      updates.qa_attempt_count = 0
      updates.redraft_guidance = detail
      updates.qa_escalation = { ...escalation, resolved_option: option, resolved_reason: detail, resolved_by: actor, resolved_at: now }
      message = 'Sent back to the writer with your direction. QA will review the new version fresh.'
      break

    case 'reassign':
      updates.narrative_status = 'requested'
      updates.narrative_status_changed_at = now
      updates.qa_passed = null
      updates.qa_attempt_count = 0
      updates.assigned_agent = String(detail).trim()
      updates.redraft_guidance = `Reassigned from ${opp.assigned_agent || 'the previous writer'} after two failed QA reviews. Earlier attempts are on file.`
      updates.qa_escalation = { ...escalation, resolved_option: option, resolved_reason: `Reassigned to ${detail}`, resolved_by: actor, resolved_at: now }
      message = `Reassigned to ${String(detail).trim()} and returned to drafting.`
      break

    case 'request_info': {
      // Stays escalated, but ownership moves to the school and Bella gets an
      // explicit way to restart once the answer arrives.
      updates.waiting_on = 'client'
      updates.qa_escalation = { ...escalation, awaiting_client: true, client_ask: detail, requested_by: actor, requested_at: now }

      // Two things were missing here, and together they meant the loop never
      // closed.
      //
      // The item had no due date, and the follow-up engine skips anything
      // without one, so the school was never reminded about a question that is
      // blocking their own application. Two of these were created for Saunemin
      // and both were silent.
      //
      // And the drafted email below was built, returned in the API response,
      // and then discarded, because no screen reads it. Bella had to write the
      // message herself every time, from a question the system had already
      // phrased for her. prepared_materials exists on this table for exactly
      // this and was left empty.
      const askText = String(detail).trim()
      const greeting = opp.contact_name ? `Hi ${String(opp.contact_name).split(' ')[0]},` : 'Hi,'
      const preparedEmail = [
        greeting,
        '',
        `We are finishing the ${opp.name} application for you and there is one thing we need from your side before we can complete it:`,
        '',
        askText,
        '',
        'As soon as we have that we will pick it straight back up. Happy to jump on a quick call if that is easier than writing it out.',
        '',
        'Thank you,',
        'Bella',
      ].join('\n')

      const infoDue = new Date()
      infoDue.setDate(infoDue.getDate() + 7)

      await supabase.from('funding_action_items').insert({
        pursuit_id: opp.pursuit_id,
        opportunity_id: opp.id,
        owner_type: 'client',
        title: `Information needed for ${opp.name}`,
        client_label: askText,
        description: `We need this to finish the ${opp.name} application.`,
        status: 'pending',
        due_date: infoDue.toISOString().split('T')[0],
        category: 'documentation',
        action_size: 'light',
        prepared_materials: preparedEmail,
      })

      emailDraft = { ask: askText, contactName: opp.contact_name ?? null }
      message = 'Action item created for the school. Review and send the email, and the narrative resumes when they reply.'
      break
    }

    case 'stop_pursuing':
      updates.status = 'closed'
      updates.waiting_on = 'none'
      updates.qa_escalation = { ...escalation, resolved_option: option, resolved_reason: detail, resolved_by: actor, resolved_at: now }
      message = 'Closed. It leaves your queue and the school\'s.'
      break

    case 'resume_drafting':
      updates.narrative_status = 'requested'
      updates.narrative_status_changed_at = now
      updates.qa_passed = null
      updates.qa_attempt_count = 0
      updates.waiting_on = 'tdi'
      updates.redraft_guidance = detail || (escalation.client_ask ? `The school provided: ${escalation.client_ask}` : null)
      updates.qa_escalation = { ...escalation, resolved_option: option, resolved_by: actor, resolved_at: now }
      message = 'Back with the writer, with what the school sent through.'
      break

    default:
      return NextResponse.json({ error: 'Unhandled option' }, { status: 400 })
  }

  const { error } = await supabase
    .from('funding_opportunities')
    .update(updates)
    .eq('id', opportunityId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('funding_pursuit_timeline').insert({
    pursuit_id: opp.pursuit_id,
    event_date: now.split('T')[0],
    event_title: `Escalation resolved (${chosen?.label ?? 'Resume drafting'}): ${opp.name}`,
    event_detail: `${actor}${detail ? ` — ${detail}` : ''}`,
    status: 'complete',
  })

  postFundingEvent(
    narrativeEvent(opp.pursuit_id, '', opp.name, 'escalated', String(updates.narrative_status ?? 'escalated'), actor)
  ).catch(() => {})

  return NextResponse.json({ success: true, message, emailDraft })
}
