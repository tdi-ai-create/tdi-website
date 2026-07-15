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
    .select('id, pursuit_name, district_name, next_action_owner_email, client_contact_name')
    .eq('id', item.pursuit_id)
    .single()

  const schoolName = pursuit?.pursuit_name ?? pursuit?.district_name ?? 'your school'

  // Fetch the gate for contact resolution
  const { data: gate } = await supabase
    .from('pursuit_gate')
    .select('*')
    .eq('pursuit_id', item.pursuit_id)
    .maybeSingle()

  // Resolve the recipient
  const recipientEmail = item.owner_email ?? pursuit?.next_action_owner_email ?? null
  if (!recipientEmail) {
    return NextResponse.json({
      blocked: true,
      blockReason: 'No recipient email found on this action item or its pursuit',
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
    submitterName: item.owner_name ?? recipientEmail,
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

  // Update the action item
  await supabase
    .from('funding_action_items')
    .update({
      nudge_count: (item.nudge_count ?? 0) + 1,
      last_nudge_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', actionId)

  // Slack narration
  postFundingEvent(nudgeSentEvent(item.pursuit_id, schoolName, item.title, recipientEmail)).catch(() => {})

  return NextResponse.json({
    sent: true,
    to: email.to,
    subject: email.subject,
    tone: email.tone,
  })
}
