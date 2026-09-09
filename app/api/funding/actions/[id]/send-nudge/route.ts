import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import {
  generateFollowUpEmail,
  sendFollowUpEmail,
  isOnAllowlist,
  ALLOWLIST_ENABLED,
  toneForRung,
  type EmailType,
} from '@/lib/funding-followup-email'
import { postFundingEvent, nudgeSentEvent } from '@/lib/funding-slack'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Manual nudge send for a funding action item.
 *
 * POST with { preview: true }  → returns the email preview (to, subject, html) without sending
 * POST with { send: true }     → checks allowlist + window gate, sends if clear, updates DB
 *
 * IMPORTANT: This bypasses DRY_RUN (it's an explicit human action with a preview step),
 * but still enforces the recipient ALLOWLIST and the WINDOW GATE.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: actionId } = await params
  const body = await request.json()
  const isPreview = body.preview === true
  const isSend = body.send === true

  if (!isPreview && !isSend) {
    return NextResponse.json({ error: 'Must specify preview: true or send: true' }, { status: 400 })
  }

  const supabase = db()

  // Fetch the action item
  const { data: item, error: itemErr } = await supabase
    .from('funding_action_items')
    .select('*')
    .eq('id', actionId)
    .single()

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Action item not found' }, { status: 404 })
  }

  // Fetch the pursuit for school name + owner email fallback
  const { data: pursuit } = await supabase
    .from('funding_pursuits')
    .select('id, pursuit_name, district_name, next_action_owner_email, client_contact_name, client_contact_email')
    .eq('id', item.pursuit_id)
    .single()

  const schoolName = pursuit?.pursuit_name ?? pursuit?.district_name ?? 'your school'

  // Fetch the gate for contact resolution
  const { data: gate } = await supabase
    .from('pursuit_gate')
    .select('*')
    .eq('pursuit_id', item.pursuit_id)
    .maybeSingle()

  // The grant's public name, so the email can say which one. Without it the
  // label gates fall through to "this funding step", which is safe and tells
  // the school nothing. Bella caught that before sending one to Teri.
  let opportunityName: string | null = null
  if (item.opportunity_id) {
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('name')
      .eq('id', item.opportunity_id)
      .maybeSingle()
    opportunityName = opp?.name ?? null
  }

  // Resolve the recipient.
  //
  // Two shapes of task share this one control, and they point in opposite
  // directions. On a client-owned task the owner IS the school, so nudging the
  // owner is the whole point. On a person-owned task the owner is a colleague
  // and the work is "go and contact the school", so nudging the owner would
  // email Bella about her own task.
  //
  // Bella reported exactly that on 8 and 9 September. Measured at the time: of
  // 15 open person-owned tasks, 8 had no owner_email so no button appeared at
  // all, and 3 carried her own address.
  const isClientOwned = String(item.owner_type ?? '').toLowerCase() === 'client'

  const recipientEmail = isClientOwned
    ? item.owner_email ?? pursuit?.next_action_owner_email ?? null
    : pursuit?.client_contact_email ?? gate?.submitter_email ?? null

  if (!recipientEmail) {
    return NextResponse.json({
      blocked: true,
      blockReasons: [
        isClientOwned
          ? 'This task has no contact email, and neither does its pursuit.'
          : 'There is no school contact on this pursuit, so there is nobody to write to. ' +
            'Add a client contact to the pursuit first, then come back here.',
      ],
      to: '',
      from: '',
      subject: '',
      html: '',
      tone: 'client',
      emailType: 'nudge',
    })
  }

  // Determine tone
  const ownerIsRae = recipientEmail.toLowerCase() === 'rae@teachersdeserveit.com'
  const tone = ownerIsRae ? 'internal' : 'client' as const

  // Compute days overdue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let bizDaysOverdue = 0
  if (item.due_date) {
    const dueDate = new Date(item.due_date + 'T00:00:00')
    if (dueDate < today) {
      const cursor = new Date(dueDate)
      cursor.setDate(cursor.getDate() + 1)
      while (cursor <= today) {
        const d = cursor.getDay()
        if (d !== 0 && d !== 6) bizDaysOverdue++
        cursor.setDate(cursor.getDate() + 1)
      }
    }
  }

  // Resolve contact name — for client emails, use the RECIPIENT's name (not the TDI owner)
  let contactName = 'there'
  if (tone === 'internal') {
    contactName = 'Rae'
  } else {
    // For client emails: try gate submitter name, then pursuit contact, then parse from email
    const gateSubmitterName = gate?.submitter_name
    const pursuitContactName = pursuit?.client_contact_name
    const emailLocalPart = recipientEmail.split('@')[0].split('.').map(
      (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    ).join(' ')
    contactName = (gateSubmitterName ?? pursuitContactName ?? emailLocalPart ?? 'there').split(' ')[0]
  }

  // Build the email type — nudge for overdue, reminder for upcoming
  const emailType: EmailType = bizDaysOverdue > 0 ? 'nudge' : 'reminder'

  // Generate the email
  const email = generateFollowUpEmail({
    to: recipientEmail,
    itemTitle: item.title,
    dueDate: item.due_date ?? 'TBD',
    bizDaysOverdue,
    rungLabel: tone === 'internal' ? 'rae' : 'submitter',
    type: emailType,
    tone,
    contactName,
    schoolName,
    clientLabel: item.client_label,
    opportunityName,
    // The person who owes the application, which on a person-owned task is the
    // school contact and never the colleague whose task it is.
    submitterName: isClientOwned
      ? item.owner_name ?? recipientEmail
      : pursuit?.client_contact_name ?? recipientEmail,
  })

  // ── Check safety gates ──

  // Window gate: check if the funding opportunity's window is open
  let windowBlocked = false
  let windowReason = ''
  if (item.opportunity_id) {
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('window_status, window_closes')
      .eq('id', item.opportunity_id)
      .single()

    if (opp) {
      const status = opp.window_status ?? 'unknown'
      if (status !== 'open') {
        windowBlocked = true
        windowReason = `This opportunity's funding window is not verified open (status: ${status})`
      } else if (opp.window_closes) {
        const closes = new Date(opp.window_closes + 'T00:00:00')
        if (closes < today) {
          windowBlocked = true
          windowReason = `This opportunity's funding window has passed (closed ${opp.window_closes})`
        }
      }
    }
  } else {
    // No direct opportunity — check all opportunities on the pursuit
    const { data: opps } = await supabase
      .from('funding_opportunities')
      .select('window_status, window_closes')
      .eq('pursuit_id', item.pursuit_id)

    const anyOpen = (opps ?? []).some(o => {
      if ((o.window_status ?? 'unknown') !== 'open') return false
      if (o.window_closes) {
        const closes = new Date(o.window_closes + 'T00:00:00')
        if (closes < today) return false
      }
      return true
    })

    if (!anyOpen) {
      windowBlocked = true
      windowReason = (opps ?? []).length === 0
        ? 'No funding opportunities found for this pursuit'
        : `No funding opportunities with window_status='open' found (all are unknown or closed)`
    }
  }

  // Allowlist gate
  let allowlistBlocked = false
  let allowlistReason = ''
  if (ALLOWLIST_ENABLED && !isOnAllowlist(recipientEmail)) {
    allowlistBlocked = true
    allowlistReason = `Recipient ${recipientEmail} is not on the send allowlist. Currently only Allenwood contacts + rae@ are permitted.`
  }

  // For preview: return the email + any blocking info
  if (isPreview) {
    return NextResponse.json({
      preview: true,
      to: email.to,
      from: email.from,
      replyTo: email.replyTo,
      subject: email.subject,
      html: email.html,
      tone: email.tone,
      emailType,
      blocked: windowBlocked || allowlistBlocked,
      blockReasons: [
        ...(windowBlocked ? [windowReason] : []),
        ...(allowlistBlocked ? [allowlistReason] : []),
      ],
    })
  }

  // For send: enforce gates
  if (windowBlocked) {
    return NextResponse.json({ sent: false, blocked: true, blockReason: windowReason })
  }
  if (allowlistBlocked) {
    return NextResponse.json({ sent: false, blocked: true, blockReason: allowlistReason })
  }

  // Send
  const result = await sendFollowUpEmail(email)
  if (!result.ok) {
    return NextResponse.json({ sent: false, error: result.error }, { status: 500 })
  }

  // Everything below this line happens after the email has already gone, so a
  // failure must never be reported as a failed send. It must not be silent
  // either: a lost log row means the Emails tab denies an email that reached a
  // client, and a lost stamp means we nudge the same school again next week.
  const bookkeeping: string[] = []

  // Log to funding_email_log so it appears in the Emails tab
  const { error: logError } = await supabase
    .from('funding_email_log')
    .insert({
      pursuit_id: item.pursuit_id,
      opportunity_id: item.opportunity_id || null,
      subject: email.subject,
      body: email.html,
      to_email: recipientEmail,
      to_name: contactName,
      from_email: 'noreply@teachersdeserveit.com',
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_by: auth.user?.email || auth.member?.email || 'bella@teachersdeserveit.com',
      resend_id: result.id || null,
      email_type: emailType === 'nudge' ? 'nudge' : 'deadline_reminder',
    })

  if (logError) {
    console.error('[send-nudge] email sent but not logged:', logError.message)
    bookkeeping.push(`The email went to ${recipientEmail} but could not be recorded in the Emails tab, so it will not appear there.`)
  }

  // Update the action item + auto-log to notes
  const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const noteEntry = `[${timestamp}] Nudge sent to ${recipientEmail}`
  const existingNotes = item.notes || ''
  const updatedNotes = existingNotes ? `${existingNotes}\n${noteEntry}` : noteEntry

  const { error: stampError } = await supabase
    .from('funding_action_items')
    .update({
      nudge_count: (item.nudge_count ?? 0) + 1,
      last_nudge_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: updatedNotes,
    })
    .eq('id', actionId)

  if (stampError) {
    console.error('[send-nudge] email sent but not stamped:', stampError.message)
    bookkeeping.push('This send was not recorded against the task, so it still looks unsent. Do not send it a second time.')
  }

  // Slack narration
  postFundingEvent(nudgeSentEvent(item.pursuit_id, schoolName, item.title, recipientEmail)).catch(err => console.error('[send-nudge] non-blocking side effect failed:', err))

  return NextResponse.json({
    sent: true,
    to: email.to,
    subject: email.subject,
    tone: email.tone,
    warnings: bookkeeping.length > 0 ? bookkeeping : undefined,
  })
}
