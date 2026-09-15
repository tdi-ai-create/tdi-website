import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { fundingClientSendBlockReason } from '@/lib/funding-client-send-pause'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET -- list email log for a pursuit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const supabase = db()

  const { data, error } = await supabase
    .from('funding_email_log')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ emails: data || [] })
}

// POST -- create a draft email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const body = await request.json()
  const actorEmail = auth.member?.email || auth.user?.email

  const supabase = db()

  const { data, error } = await supabase
    .from('funding_email_log')
    .insert({
      pursuit_id: pursuitId,
      opportunity_id: body.opportunityId || null,
      template_id: body.templateId || null,
      subject: body.subject,
      body: body.body,
      to_email: body.toEmail,
      to_name: body.toName || null,
      from_email: body.fromEmail || 'rae@teachersdeserveit.com',
      status: 'draft',
      sent_by: actorEmail,
      email_type: body.emailType || 'custom',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, email: data })
}

// PATCH -- update a draft or send it
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const body = await request.json()
  if (!body.emailId) return NextResponse.json({ error: 'emailId required' }, { status: 400 })

  const supabase = db()

  // If sending the email
  if (body.send) {
    // Get the draft
    const { data: draft } = await supabase
      .from('funding_email_log')
      .select('*')
      .eq('id', body.emailId)
      .single()

    if (!draft) return NextResponse.json({ error: 'Email not found' }, { status: 404 })

    // ── Paused. This was the widest door in the system. ──
    //
    // The Emails tab renders a Send button on every row whose status is
    // 'draft'. That set includes the drafts the hourly follow-up cron writes,
    // which are addressed to a school and queued specifically so that Bella
    // reviews them. Pressing Send here ran no allowlist, no internal-wording
    // check and no client-label check, so the exact draft the Outreach Queue
    // would have refused went out clean from the pursuit page.
    //
    // 423 rather than 400: the request is well formed and the caller did
    // nothing wrong. The resource is locked, and it will unlock.
    const pausedReason = fundingClientSendBlockReason(draft.to_email)
    if (pausedReason) {
      return NextResponse.json({ error: pausedReason, paused: true, sent: false }, { status: 423 })
    }

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Rae Hughart <${draft.from_email}>`,
          to: [draft.to_email],
          subject: draft.subject,
          html: draft.body,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        const { error: failErr } = await supabase
          .from('funding_email_log')
          .update({ status: 'failed' })
          .eq('id', body.emailId)
        if (failErr) console.error('[funding/emails] send failed and the draft could not be marked failed:', failErr.message)
        return NextResponse.json({ error: result.message || 'Send failed' }, { status: 500 })
      }

      // Past this line the email has gone. Nothing below can be reported as a
      // failed send, and nothing below may fail quietly either: a draft that
      // still reads as a draft is the shape that gets sent twice.
      const bookkeeping: string[] = []

      // Mark as sent
      const { error: sentErr } = await supabase
        .from('funding_email_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: result.id || null,
        })
        .eq('id', body.emailId)
      if (sentErr) bookkeeping.push(`The email went to ${draft.to_email} but still reads as a draft: ${sentErr.message}. Do not resend.`)

      // Auto-create timeline event on the pursuit
      const { error: timelineErr } = await supabase.from('funding_pursuit_timeline').insert({
        pursuit_id: pursuitId,
        event_date: new Date().toISOString().split('T')[0],
        event_title: `Email sent: ${draft.subject}`,
        event_detail: `Sent to ${draft.to_name || draft.to_email}`,
        status: 'complete',
      })
      if (timelineErr) bookkeeping.push(`The timeline does not show this email: ${timelineErr.message}.`)

      // If linked to an opportunity, update last_activity_at and nudge count on related actions
      if (draft.opportunity_id) {
        const { error: oppErr } = await supabase
          .from('funding_opportunities')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', draft.opportunity_id)
        if (oppErr) bookkeeping.push(`The grant's last activity date did not update: ${oppErr.message}.`)

        // Increment nudge count on pending client actions for this opportunity
        if (draft.email_type === 'nudge' || draft.email_type === 'deadline_reminder') {
          const { data: actions, error: readErr } = await supabase
            .from('funding_action_items')
            .select('id, nudge_count')
            .eq('opportunity_id', draft.opportunity_id)
            .eq('owner_type', 'client')
            .in('status', ['pending', 'in_progress'])
          if (readErr) bookkeeping.push(`Could not read the tasks to stamp: ${readErr.message}. This chase is not counted against any of them.`)

          for (const action of (actions || [])) {
            const { error: countErr } = await supabase
              .from('funding_action_items')
              .update({
                nudge_count: (action.nudge_count || 0) + 1,
                last_nudge_sent_at: new Date().toISOString(),
              })
              .eq('id', action.id)
            if (countErr) bookkeeping.push(`Task ${action.id} was not stamped: ${countErr.message}.`)
          }
        }
      }

      if (bookkeeping.length > 0) console.error('[funding/emails] sent but not fully recorded:', bookkeeping)

      return NextResponse.json({
        success: true,
        resendId: result.id,
        warnings: bookkeeping.length > 0 ? bookkeeping : undefined,
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  // Otherwise, update draft fields
  const updates: Record<string, unknown> = {}
  if (body.subject !== undefined) updates.subject = body.subject
  if (body.body !== undefined) updates.body = body.body
  if (body.toEmail !== undefined) updates.to_email = body.toEmail
  if (body.toName !== undefined) updates.to_name = body.toName
  if (body.emailType !== undefined) updates.email_type = body.emailType

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('funding_email_log')
    .update(updates)
    .eq('id', body.emailId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
