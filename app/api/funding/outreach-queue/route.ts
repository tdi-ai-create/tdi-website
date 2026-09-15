import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { isOnAllowlist, ALLOWLIST_ENABLED } from '@/lib/funding-followup-email'
import { buildFundingEmailHtml } from '@/lib/funding-email-html'
import { findInternalText } from '@/lib/funding-draft-warnings'
import { NEUTRAL_TASK_LABEL } from '@/lib/funding-followup-email'
import { matchActionItem, usesPlaceholder, type LabelCandidate } from '@/lib/funding-client-label'
import { createSendFollowUps, type FollowUpResult } from '@/lib/funding-followups'
import { isCloseDateRequiredToSend } from '@/lib/funding-qa'
import { evaluateSendGate, describeVerdict, fetchProbe, type GateVerdict } from '@/lib/funding-send-gate'
import { isSendGateEnforced } from '@/lib/funding-send-gate-flag'

/**
 * Funding outreach approval queue.
 *
 * Agents draft client emails into funding_email_log with status = 'draft'.
 * Before this route existed there was no way to act on them from the portal,
 * so drafts accumulated silently and nothing ever went out.
 *
 * This is the approval step, not a QA step. The human answers "is this true
 * about this school, and does it sound like us" — never "is this good enough".
 * Narrative quality stays with Julie.
 *
 * GET  -> the queue, oldest first, with an age flag at 48 hours
 * POST -> { action: 'approve' | 'reject', id, subject?, body?, reason? }
 */

const STALE_AFTER_HOURS = 48

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const supabase = admin()

  const { data: drafts, error } = await supabase
    .from('funding_email_log')
    .select('id, pursuit_id, opportunity_id, subject, body, to_email, to_name, email_type, created_at, source_item_key')
    .eq('status', 'draft')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!drafts?.length) {
    return NextResponse.json({ drafts: [], counts: { total: 0, stale: 0, unsendable: 0 } })
  }

  // Pull school context in two batched reads rather than per-row.
  const pursuitIds = [...new Set(drafts.map(d => d.pursuit_id).filter(Boolean))]
  const oppIds = [...new Set(drafts.map(d => d.opportunity_id).filter(Boolean))]

  type PursuitRow = { id: string; district_name: string | null; funder_label: string | null }
  type OppRow = { id: string; name: string | null; amount: number | string | null; application_closes: string | null }

  // Live items only. A cancelled item is not work, and the follow-up cron
  // already refuses to chase one, so offering to rewrite its client wording
  // here would invite effort on something nobody is going to send.
  const [{ data: pursuits }, { data: opps }, { data: items }] = await Promise.all([
    pursuitIds.length
      ? supabase.from('funding_pursuits').select('id, district_name, funder_label').in('id', pursuitIds)
      : Promise.resolve({ data: [] as PursuitRow[] }),
    oppIds.length
      ? supabase
          .from('funding_opportunities')
          .select('id, name, amount, application_closes')
          .in('id', oppIds)
      : Promise.resolve({ data: [] as OppRow[] }),
    supabase
      .from('funding_action_items')
      .select('id, title, client_label, status')
      .in('status', ['pending', 'blocked']),
  ])
  const liveItems = (items ?? []) as LabelCandidate[]

  const pursuitById = new Map((pursuits ?? []).map(p => [p.id, p]))
  const oppById = new Map((opps ?? []).map(o => [o.id, o]))
  const now = Date.now()

  const rows = drafts.map(d => {
    const ageHours = (now - new Date(d.created_at).getTime()) / 36e5
    const pursuit = d.pursuit_id ? pursuitById.get(d.pursuit_id) : null
    const opp = d.opportunity_id ? oppById.get(d.opportunity_id) : null

    // A draft with no recipient can never be sent. Surface it rather than
    // letting it sit in the queue looking actionable.
    const blockedReason = !d.to_email
      ? 'No recipient address on this grant route'
      : ALLOWLIST_ENABLED && !isOnAllowlist(d.to_email)
        ? `${d.to_email} is not on the send allowlist`
        : null

    // Our own task text leaking into client copy. Fifty two of these reached
    // four people before anyone noticed, so it is surfaced on the draft rather
    // than left for the reviewer to spot in a wall of text.
    const warnings = findInternalText(d.subject, d.body)

    // Two different ways a draft fails to describe its task in the school's
    // language, and they need the same fix, so they are reported as one thing.
    //
    //   The placeholder. No client_label exists, so the generator substituted
    //   neutral filler and the school reads "this funding step".
    //
    //   Our own words. The draft predates that substitution and carries the
    //   raw internal title instead, which is what findInternalText catches.
    //
    // Either way the item needs client wording written before this can go, and
    // writing it is the same action. Older drafts show the second shape and
    // newer ones the first, so a check for only one of them would sit silent
    // on exactly the drafts already sitting in the queue.
    const placeholder = usesPlaceholder(d.body)
    const item = (placeholder || warnings.length > 0)
      ? matchActionItem(d, liveItems)
      : null
    const needsClientLabel = !!item && (placeholder || warnings.length > 0)

    return {
      id: d.id,
      subject: d.subject,
      body: d.body,
      warnings,
      toEmail: d.to_email,
      toName: d.to_name,
      emailType: d.email_type,
      createdAt: d.created_at,
      ageHours: Math.floor(ageHours),
      isStale: ageHours >= STALE_AFTER_HOURS,
      blockedReason,
      school: pursuit?.district_name ?? null,
      funder: pursuit?.funder_label ?? null,
      grant: opp?.name ?? null,
      amount: opp?.amount ?? null,
      closesOn: opp?.application_closes ?? null,
      pursuitId: d.pursuit_id,
      opportunityId: d.opportunity_id,
      needsClientLabel,
      usesPlaceholder: placeholder,
      placeholderText: placeholder ? NEUTRAL_TASK_LABEL : null,
      actionItemId: item?.id ?? null,
      actionItemTitle: item?.title ?? null,
      currentClientLabel: item?.client_label ?? null,
    }
  })

  return NextResponse.json({
    drafts: rows,
    counts: {
      total: rows.length,
      stale: rows.filter(r => r.isStale).length,
      unsendable: rows.filter(r => r.blockedReason).length,
      needsRewrite: rows.filter(r => r.warnings.length > 0).length,
      needsClientLabel: rows.filter(r => r.needsClientLabel).length,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const actor = auth.user?.email || 'unknown'

  // ?dryRun=1 walks every check and reports exactly what would be sent and
  // written, without calling Resend or touching a row. This is the only way to
  // exercise the approve path without mailing a real school.
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  const { action, id, subject, body, reason, clientLabel } = await request.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action are required' }, { status: 400 })
  }

  const supabase = admin()

  const { data: draft, error: readErr } = await supabase
    .from('funding_email_log')
    .select('id, status, subject, body, to_email, to_name, pursuit_id, opportunity_id, source_item_key')
    .eq('id', id)
    .maybeSingle()

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })

  // Guard against two people acting on the same draft.
  if (draft.status !== 'draft') {
    return NextResponse.json(
      { error: `This draft is already ${draft.status}. Refresh the queue.` },
      { status: 409 }
    )
  }

  // Write the wording a school should read for this task, then correct the
  // draft in front of the reviewer rather than making them wait for the next
  // cron run to see whether it worked.
  //
  // The label belongs to the action item, not to this draft, so every future
  // email about the same task inherits it. That is the point: fixing it here
  // fixes it once.
  if (action === 'set_label') {
    const label = (clientLabel ?? '').trim()
    if (label.length < 4) {
      return NextResponse.json(
        { error: 'Write what the school should read, at least a few words.' },
        { status: 400 }
      )
    }

    // Our own language must not survive being pasted into the label field.
    // Without this the control would become a new way to do the exact thing
    // the warnings exist to prevent.
    const labelWarnings = findInternalText('', label)
    if (labelWarnings.length > 0) {
      return NextResponse.json(
        { error: 'That wording is for us, not for them.', warnings: labelWarnings },
        { status: 400 }
      )
    }

    const { data: liveItems, error: itemsErr } = await supabase
      .from('funding_action_items')
      .select('id, title, client_label, status')
      .in('status', ['pending', 'blocked'])
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

    const item = matchActionItem(draft, (liveItems ?? []) as LabelCandidate[])
    if (!item) {
      return NextResponse.json(
        { error: 'Could not tell which task this draft belongs to, so there is nothing to label.' },
        { status: 409 }
      )
    }

    // Rebuild the sentence that names the task, replacing whichever wording
    // actually reached this draft.
    //
    // Three candidates, and the one that matters most is the easiest to miss:
    // the OLD client_label. That is what the generator returned unchecked, so
    // it is what sits in the body of every leaking draft. A first version of
    // this replaced only the placeholder and the title, which meant a save
    // reported success, wrote the new label, and left the pricing ladder
    // sitting in the draft untouched.
    //
    // Longest first, so replacing a short string cannot destroy a longer one
    // that contains it.
    const replaceable = [item.client_label, item.title, NEUTRAL_TASK_LABEL]
      .filter((v): v is string => !!v && v.trim().length > 0)
      .sort((a, b) => b.length - a.length)

    const applyAll = (input: string) =>
      replaceable.reduce((acc, needle) => acc.split(needle).join(label), input)

    const newBody = applyAll(draft.body ?? '')
    const newSubject = applyAll(draft.subject ?? '')

    const stillLeaking = findInternalText(newSubject, newBody)

    // Every open draft for this task, not just the one being looked at.
    //
    // A task can have several drafts waiting, one per escalation rung, and they
    // all describe it with the same wrong wording. Correcting only the visible
    // one meant fixing a draft and finding two more identical problems directly
    // beneath it, which reads as the fix not having worked.
    const { data: allDrafts, error: siblingErr } = await supabase
      .from('funding_email_log')
      .select('id, subject, body, to_email, source_item_key')
      .eq('status', 'draft')
    if (siblingErr) return NextResponse.json({ error: siblingErr.message }, { status: 500 })

    const siblings = (allDrafts ?? []).filter(
      d => matchActionItem(d, (liveItems ?? []) as LabelCandidate[])?.id === item.id
    )

    if (dryRun) {
      return NextResponse.json({
        ok: true, dryRun: true, action: 'would set label',
        wouldWrite: { actionItemId: item.id, client_label: label },
        wouldRewriteDrafts: siblings.length,
        newSubject, newBody,
        remainingWarnings: stillLeaking,
      })
    }

    const { error: labelErr } = await supabase
      .from('funding_action_items')
      .update({ client_label: label })
      .eq('id', item.id)
    if (labelErr) return NextResponse.json({ error: labelErr.message }, { status: 500 })

    let rewritten = 0
    for (const sib of siblings) {
      const { error: sibErr } = await supabase
        .from('funding_email_log')
        .update({ subject: applyAll(sib.subject ?? ''), body: applyAll(sib.body ?? '') })
        .eq('id', sib.id)
        .eq('status', 'draft')
      if (sibErr) {
        // Loud, and reported. A partial rewrite that claims success leaves our
        // wording in a draft that now looks reviewed.
        console.error('[outreach-queue] Failed rewriting draft', sib.id, sibErr)
        return NextResponse.json(
          { error: `Label saved, but ${siblings.length - rewritten} draft(s) could not be rewritten: ${sibErr.message}` },
          { status: 500 }
        )
      }
      rewritten++
    }

    return NextResponse.json({
      ok: true,
      action: 'label set',
      actionItemId: item.id,
      draftsRewritten: rewritten,
      subject: newSubject,
      body: newBody,
      // Honest about the outcome. Replacing the task wording does not
      // guarantee the rest of the draft is clean, and saying "done" when
      // warnings remain is how a reviewer stops trusting the warnings.
      remainingWarnings: stillLeaking,
    })
  }

  if (action === 'reject') {
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'A reason is required so the agent can redraft' }, { status: 400 })
    }
    if (dryRun) {
      return NextResponse.json({
        ok: true, dryRun: true, action: 'would reject',
        wouldWrite: { status: 'rejected', rejected_reason: reason.trim(), rejected_by: actor },
      })
    }

    const { error } = await supabase
      .from('funding_email_log')
      .update({
        status: 'rejected',
        rejected_reason: reason.trim(),
        rejected_by: actor,
        rejected_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'draft')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'rejected' })
  }

  if (action !== 'approve') {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  // Approve. Edits from the queue win over what the agent wrote.
  const finalSubject = (subject ?? draft.subject ?? '').trim()
  const finalBody = (body ?? draft.body ?? '').trim()
  const to = draft.to_email

  // Re-checked here, not just on the way out to the screen. The reviewer can
  // edit, so the text that matters is the text being sent, and a warning that
  // only rendered in the browser would be advisory. Editing is the way past
  // this: rewrite the line in our own words and it clears.
  const leaks = findInternalText(finalSubject, finalBody)
  if (leaks.length > 0) {
    return NextResponse.json(
      {
        error: 'This still contains text written for us, not for them. Edit it first.',
        warnings: leaks,
      },
      { status: 400 }
    )
  }

  if (!to) {
    return NextResponse.json(
      { error: 'This grant route has no recipient address. Add one before sending.' },
      { status: 400 }
    )
  }
  if (!finalSubject || !finalBody) {
    return NextResponse.json({ error: 'Subject and body cannot be empty' }, { status: 400 })
  }
  if (ALLOWLIST_ENABLED && !isOnAllowlist(to)) {
    return NextResponse.json(
      { error: `${to} is not on the send allowlist. Contact Rae to add them.` },
      { status: 400 }
    )
  }

  // A package email promises a reminder on the day the window opens, and that
  // reminder is built from the closing date. With no date the email prints a
  // placeholder where the date belongs and no reminder is scheduled at all, so
  // we commit in writing to something nothing exists to deliver. One
  // superintendent quoted that placeholder back to us on 14 Sep 2026.
  //
  // Reported even when the flag is off, so the dry run and the queue response
  // show what the block would catch before it is switched on.
  let closeDateGap: { opportunity: string; windowStatus: string | null } | null = null
  let gate: GateVerdict | null = null

  if (draft.opportunity_id) {
    const { data: gateOpp, error: gateErr } = await supabase
      .from('funding_opportunities')
      .select('name, window_status, application_closes, narrative_url, qa_passed, qa_escalation, funder_id')
      .eq('id', draft.opportunity_id)
      .single()

    // A read failure is not proof anything is fine, so it blocks rather than
    // passing quietly. The whole point of this gate is that silence stopped
    // being treated as a pass.
    if (gateErr) {
      console.error('[outreach-queue] Could not evaluate the send gate:', gateErr.message)
      return NextResponse.json(
        { error: `Could not check whether this package is ready to send: ${gateErr.message}` },
        { status: 500 }
      )
    }

    if (gateOpp) {
      const { count: passingReviews, error: revErr } = await supabase
        .from('funding_narrative_qa_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('opportunity_id', draft.opportunity_id)
        .eq('passed', true)

      if (revErr) {
        console.error('[outreach-queue] Could not count passing reviews:', revErr.message)
        return NextResponse.json(
          { error: `Could not check the quality review for this package: ${revErr.message}` },
          { status: 500 }
        )
      }

      // The funder's spend rules, where the catalogue has an opinion. Absent is
      // not a failure: most funders have never been asked.
      let funderCanFundUs: boolean | null = null
      if (gateOpp.funder_id) {
        const { data: funder } = await supabase
          .from('funders')
          .select('allowable_uses')
          .eq('id', gateOpp.funder_id)
          .maybeSingle()
        const uses = (funder?.allowable_uses ?? '').toString().toLowerCase()
        if (uses && /classroom materials only|not for (vendor|provider|services)|materials only/.test(uses)) {
          funderCanFundUs = false
        }
      }

      gate = await evaluateSendGate(
        {
          name: gateOpp.name,
          narrative_url: gateOpp.narrative_url,
          application_closes: gateOpp.application_closes,
          qa_passed: gateOpp.qa_passed,
          qa_escalation: gateOpp.qa_escalation,
          passingReviewCount: passingReviews ?? 0,
          funderCanFundUs,
        },
        fetchProbe(),
      )

      // Kept for the existing response shape and the close-date flag, which
      // predates this gate and is switched independently of it.
      if (!gateOpp.application_closes) {
        closeDateGap = { opportunity: gateOpp.name, windowStatus: gateOpp.window_status ?? null }
      }
    }
  }

  // The hard checks. A missing or unopenable document is not a judgement call
  // and no override covers it: two packages went out on an override with no
  // document at all, and the client told us so.
  if (gate && !gate.sendable && isSendGateEnforced()) {
    return NextResponse.json(
      {
        error: gate.blocking.map(c => c.reason).filter(Boolean).join(' '),
        gateBlocking: gate.blocking.map(c => ({ check: c.id, reason: c.reason })),
        gateNotes: describeVerdict(gate),
      },
      { status: 400 }
    )
  }

  if (closeDateGap && isCloseDateRequiredToSend()) {
    return NextResponse.json(
      {
        error:
          `${closeDateGap.opportunity} has no closing date on record, so this email would promise a reminder that nothing is scheduled to send. ` +
          `Establish the window first, then approve this.`,
        closeDateGap,
      },
      { status: 400 }
    )
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      action: 'would send',
      to,
      subject: finalSubject,
      bodyPreview: finalBody.slice(0, 200),
      htmlBytes: buildFundingEmailHtml(finalBody).length,
      wouldUpdateOpportunity: draft.opportunity_id ?? null,
      closeDateGap,
      wouldBlockOnCloseDate: Boolean(closeDateGap) && isCloseDateRequiredToSend(),
      closeDateEnforcementOn: isCloseDateRequiredToSend(),
      // Reported whether or not enforcement is on, so the blast radius is
      // visible before anybody switches it.
      gate: gate ? { sendable: gate.sendable, notes: describeVerdict(gate) } : null,
      wouldBlockOnGate: Boolean(gate && !gate.sendable),
      gateEnforcementOn: isSendGateEnforced(),
    })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Email service not configured (RESEND_API_KEY missing)' }, { status: 500 })
  }

  let resendId: string | null = null
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bella — Teachers Deserve It <noreply@teachersdeserveit.com>',
        reply_to: 'hello@teachersdeserveit.com',
        to: [to],
        subject: finalSubject,
        html: buildFundingEmailHtml(finalBody),
      }),
    })
    const resData = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: `Send failed: ${JSON.stringify(resData)}`, sent: false },
        { status: 502 }
      )
    }
    resendId = resData?.id ?? null
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Send failed'
    return NextResponse.json({ error: message, sent: false }, { status: 502 })
  }

  // Only mark sent once Resend has accepted it, so a failed send never looks
  // like a delivered one.
  const { error: updErr } = await supabase
    .from('funding_email_log')
    .update({
      status: 'sent',
      subject: finalSubject,
      body: finalBody,
      sent_at: new Date().toISOString(),
      sent_by: actor,
      resend_id: resendId,
    })
    .eq('id', id)

  if (updErr) {
    // The email is genuinely out. Say so rather than reporting a clean failure.
    return NextResponse.json({
      ok: true,
      action: 'sent',
      warning: `Email sent but the log could not be updated: ${updErr.message}`,
    })
  }

  if (draft.opportunity_id) {
    // Same rule as the log write above: the email is already out, so this
    // failing cannot undo it. Report it rather than let the grant route keep
    // reading as 'drafted' and invite a second send.
    const { error: oppErr } = await supabase
      .from('funding_opportunities')
      .update({
        forwarding_email_status: 'sent',
        last_action: 'Outreach email approved and sent',
        last_action_date: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', draft.opportunity_id)

    if (oppErr) {
      console.error('[funding/outreach-queue] sent but grant route not updated', oppErr)
      return NextResponse.json({
        ok: true,
        action: 'sent',
        resendId,
        warning: `Email sent, but the grant route still reads as drafted: ${oppErr.message}. Do not resend.`,
      })
    }
  }

  // Schedule the chases we owe ourselves.
  //
  // This route sent the email and stopped. send-to-client does the same send
  // and creates the follow-ups, so a grant approved from this queue was never
  // chased, and funding-next-actions skips an opportunity once it reads 'sent'.
  // It went quiet and looked finished. Bella asked why there was no next step
  // beside "approved", and there genuinely was not one.
  let followUps: FollowUpResult | null = null
  if (draft.opportunity_id && draft.pursuit_id) {
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('name, window_opens')
      .eq('id', draft.opportunity_id)
      .maybeSingle()

    const { data: pursuit } = await supabase
      .from('funding_pursuits')
      .select('client_contact_name')
      .eq('id', draft.pursuit_id)
      .maybeSingle()

    followUps = await createSendFollowUps(supabase, {
      pursuitId: draft.pursuit_id,
      opportunityId: draft.opportunity_id,
      grantName: opp?.name || 'grant',
      contactName: pursuit?.client_contact_name ?? null,
      windowOpens: opp?.window_opens ?? null,
    })

    if (followUps.error) {
      // The email is gone. Say what did not happen rather than report success.
      return NextResponse.json({
        ok: true,
        action: 'sent',
        resendId,
        warning: `${followUps.error} Nothing will chase this grant, so add a follow-up by hand.`,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    action: 'sent',
    resendId,
    // So the queue can tell the reviewer what happens next instead of the row
    // simply vanishing.
    followUps: followUps
      ? { created: followUps.created, skipped: followUps.skipped, titles: followUps.titles }
      : null,
  })
}
