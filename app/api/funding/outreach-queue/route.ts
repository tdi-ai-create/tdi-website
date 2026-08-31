import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { isOnAllowlist, ALLOWLIST_ENABLED } from '@/lib/funding-followup-email'
import { buildFundingEmailHtml } from '@/lib/funding-email-html'

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
    .select('id, pursuit_id, opportunity_id, subject, body, to_email, to_name, email_type, created_at')
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

  const [{ data: pursuits }, { data: opps }] = await Promise.all([
    pursuitIds.length
      ? supabase.from('funding_pursuits').select('id, district_name, funder_label').in('id', pursuitIds)
      : Promise.resolve({ data: [] as PursuitRow[] }),
    oppIds.length
      ? supabase
          .from('funding_opportunities')
          .select('id, name, amount, application_closes')
          .in('id', oppIds)
      : Promise.resolve({ data: [] as OppRow[] }),
  ])

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

    return {
      id: d.id,
      subject: d.subject,
      body: d.body,
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
    }
  })

  return NextResponse.json({
    drafts: rows,
    counts: {
      total: rows.length,
      stale: rows.filter(r => r.isStale).length,
      unsendable: rows.filter(r => r.blockedReason).length,
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

  const { action, id, subject, body, reason } = await request.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action are required' }, { status: 400 })
  }

  const supabase = admin()

  const { data: draft, error: readErr } = await supabase
    .from('funding_email_log')
    .select('id, status, subject, body, to_email, to_name, pursuit_id, opportunity_id')
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

  return NextResponse.json({ ok: true, action: 'sent', resendId })
}
