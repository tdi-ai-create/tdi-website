import { findInternalText } from '@/lib/funding-draft-warnings'

/**
 * Email template + send logic for messages a PERSON chooses to send.
 *
 * Used by the manual "Send nudge" button and the send-email route. It is no
 * longer shared with the follow-up cron: automation never emails a school at
 * all, it writes a draft and stops, and that rule is enforced inside the cron's
 * own send function.
 */

// ── Recipient allowlist ──
//
// Who a person may send to from the portal. Client addresses ARE included, on
// purpose: a human clicked send, reviewed the message, and decided to contact
// that school. That is the behaviour we want to keep possible.
//
// This is a different list from the one in the follow-up cron, and the two
// differ deliberately rather than by neglect. The cron's list holds TDI
// addresses only, because automation must never reach a school. This one holds
// clients too, because a person may.
//
// The comment that used to sit here read "CLIENT ADDRESSES INTENTIONALLY
// EXCLUDED until go-live" while the list immediately below it contained every
// client address in the system. Anyone reading this file to answer "can we
// accidentally email a school" got the opposite of the truth. Worth saying
// plainly: a comment that contradicts its own code is worse than no comment,
// because it is trusted.

export const ALLOWLIST_ENABLED = true
export const SEND_ALLOWLIST: string[] = [
  // TDI staff
  'rae@teachersdeserveit.com',
  'hello@teachersdeserveit.com',
  'bella@teachersdeserveit.com',
  // School contacts (go-live July 15, 2026)
  'teri.gordonhernandez@pgcps.org',
  'sharonh.porter@pgcps.org',
  'ppoche@stpchanel.org',
  'jsuarez@d94.org',
  'zwemke@ogschool.com',
  'dneukirch@d41.org',
  'mandy.johnson@gcafbcd.org',
  'doughang@saunemin.org',
]

export function isOnAllowlist(email: string): boolean {
  return SEND_ALLOWLIST.some(a => a.toLowerCase() === email.toLowerCase())
}

// ── Tone routing ──

export type EmailTone = 'client' | 'internal'
export type EmailType = 'reminder' | 'nudge' | 'escalation'

export function toneForRung(rung: string): EmailTone {
  return rung === 'rae' ? 'internal' : 'client'
}

// ── Client-facing task label ──
//
// What a school is told an item is about. This is the only place that decides
// it, for the whole codebase.
//
// There used to be two implementations. This one stripped four known prefixes
// and sent whatever remained. The cron had its own safelist, added 17 Aug after
// the first leak, which caught three of the four titles that had gone out and
// missed the worst: a "Re-send..." item carrying our pricing ladder and the
// words "mark this opportunity not applicable" about a live district. Neither
// copy knew what the other had learned, so a title blocked in one path sailed
// through the other on the same day.
//
// Three gates now, cheapest first, and a title has to clear all of them:
//
//   1. Shape. Does it open like an instruction to a colleague.
//   2. Content. Does findInternalText spot our pricing, our decision logic, or
//      the recipient discussed in the third person. Same rules the approval
//      queue shows the reviewer, so the two can never disagree.
//   3. Length. A client-facing label is a phrase. Anything past 90 characters
//      is a sentence someone wrote for themselves.
//
// Failing any gate means neutral wording, and a log line, because an item
// without a client_label is a gap to close rather than something to paper over.
// Neutral is vague, and vague is survivable. The alternative is not.

export const NEUTRAL_TASK_LABEL = 'this funding step'

/** A client-facing label is a phrase, not a paragraph. */
const MAX_LABEL_LENGTH = 90

const INTERNAL_TITLE_SHAPES = [
  /^(check|confirm|verify|review)\b/i,
  /^(remind|nudge|chase|ping)\b/i,
  /^(ask|email|call|contact|reach\s+out)\b/i,
  /^(track|follow\s+up|get|obtain|collect)\b/i,
  /^(re-?send|re-?ask|send|resend)\b/i,        // missed before, and it mattered
  /^(determine|find\s+out|decide|escalate)\b/i,
  /^(draft|write|prepare|set\s+up|update|log|mark|create|add)\b/i,
  /^(gate|internal|todo)\b/i,
  /\b(bella|rae|julie|vanessa|amara)\b/i,      // names of ours have no business here
]

export function clientTaskLabel(rawTitle: string, clientLabel?: string | null): string {
  if (clientLabel && clientLabel.trim()) return clientLabel.trim()

  const title = (rawTitle || '').trim()
  if (!title) return NEUTRAL_TASK_LABEL

  const reason =
    INTERNAL_TITLE_SHAPES.some(shape => shape.test(title))
      ? 'reads as an instruction to a colleague'
      : findInternalText(title, '').length > 0
        ? 'contains wording meant for us'
        : title.length > MAX_LABEL_LENGTH
          ? `is ${title.length} characters, which is a sentence rather than a label`
          : null

  if (reason) {
    console.warn(
      `[funding-label] "${title.slice(0, 80)}" has no client_label and ${reason}. ` +
        'Using neutral wording. Set a client_label on this item.'
    )
    return NEUTRAL_TASK_LABEL
  }

  return title
}

export function displayRung(rung: string): string {
  if (rung === 'rae') return 'Rae'
  if (rung === 'admin_sponsor') return 'Admin Sponsor'
  return rung.charAt(0).toUpperCase() + rung.slice(1)
}

// ── Email generation (returns subject + html without sending) ──

export interface FollowUpEmailParams {
  to: string
  itemTitle: string
  dueDate: string
  bizDaysOverdue: number
  rungLabel: string
  type: EmailType
  tone: EmailTone
  contactName?: string
  schoolName?: string
  clientLabel?: string | null
  submitterName?: string
  nextRung?: string
}

export interface GeneratedEmail {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  tone: EmailTone
}

export function generateFollowUpEmail(params: FollowUpEmailParams): GeneratedEmail {
  const {
    to, itemTitle, dueDate, bizDaysOverdue, rungLabel, type, tone,
    contactName = 'there', schoolName = 'your school', clientLabel,
    submitterName = 'unknown', nextRung = 'none',
  } = params

  const friendlyTask = clientTaskLabel(itemTitle, clientLabel)
  const displayRungLabel = displayRung(rungLabel)

  // Subject lines
  let subject: string
  if (tone === 'client') {
    subject =
      type === 'reminder'
        ? `Heads up on ${friendlyTask} for ${schoolName}`
        : type === 'nudge'
          ? `Following up: ${friendlyTask}`
          : `Can you help with ${friendlyTask} for ${schoolName}?`
  } else {
    subject =
      type === 'reminder'
        ? `UPCOMING — "${itemTitle}" due ${dueDate}`
        : type === 'nudge'
          ? `OVERDUE (${bizDaysOverdue} biz days) — "${itemTitle}"`
          : `ESCALATED to ${displayRungLabel} — "${itemTitle}" ${bizDaysOverdue} days overdue`
  }

  // HTML body
  let html: string
  if (tone === 'client') {
    const badgeColor =
      type === 'escalation' ? '#D4A843' : type === 'nudge' ? '#5B8FA8' : '#1B365D'
    const badgeText =
      type === 'escalation' ? 'Quick favor' : type === 'nudge' ? 'Checking in' : 'Friendly reminder'

    let bodyParagraphs: string
    if (type === 'reminder') {
      bodyParagraphs = `
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Just a friendly heads-up — <strong>${friendlyTask}</strong> is coming up around <strong>${dueDate}</strong>. No rush at all, I just want to make sure you have everything you need from us to get it out the door.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Everything's prepared on our end — if anything's unclear or you'd like me to hop on a quick call to walk through it, I'm here.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Rooting for you and ${schoolName},</p>
        <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
        <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
    } else if (type === 'nudge') {
      bodyParagraphs = `
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">I wanted to follow up on <strong>${friendlyTask}</strong> — it was on the calendar for <strong>${dueDate}</strong>, and I know how full your plate is this time of year.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Is there anything holding it up that I can help with? A question, a quick call, or me sitting on Zoom while you send it — just say the word.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">We really want to land this funding for your teachers, and you're not doing it alone.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Here for you,</p>
        <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
        <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
    } else {
      bodyParagraphs = `
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">I'm reaching out because <strong>${friendlyTask}</strong> is a key piece of the funding we're working to secure for <strong>${schoolName}</strong>, and we want to make sure it doesn't slip through the cracks during a busy stretch.</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Everything's prepared and ready — it just needs a few minutes from your side. Could you help us get it across the line, or point me to the best person to work with?</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.7;">Thank you for championing this for your teachers,</p>
        <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
        <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
    }

    html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
      <div style="background: ${badgeColor}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
        ${badgeText}
      </div>
      ${bodyParagraphs}
    </div>`
  } else {
    const urgencyColor =
      type === 'escalation' ? '#DC2626' : type === 'nudge' ? '#D97706' : '#2563EB'
    const urgencyLabel =
      type === 'escalation' ? 'ESCALATED' : type === 'nudge' ? 'OVERDUE' : 'UPCOMING'

    const nextDisplay = (!nextRung || nextRung === 'none')
      ? 'Final rung (Rae is the last stop)'
      : displayRung(nextRung)

    let internalBody: string
    if (type === 'reminder') {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">Due: <strong>${dueDate}</strong>. On track?</p>`
    } else if (type === 'nudge') {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px;"><strong>${bizDaysOverdue} business days overdue</strong> (due ${dueDate})</p>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">Submitter: ${submitterName}. No response yet.</p>`
    } else {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px;">Escalated to <strong>${displayRungLabel}</strong> rung. ${bizDaysOverdue} business days overdue.</p>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">Next: ${nextDisplay}.</p>`
    }

    html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
      <div style="background: ${urgencyColor}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
        ${urgencyLabel}
      </div>
      ${internalBody}
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">TDI Funding Follow-Up System</p>
    </div>`
  }

  const fromName = tone === 'client' ? 'Bella — Teachers Deserve It' : 'TDI Funding'
  const replyTo = tone === 'client' ? 'hello@teachersdeserveit.com' : undefined

  return { to, from: `${fromName} <noreply@teachersdeserveit.com>`, replyTo, subject, html, tone }
}

// ── Send via Resend ──

export async function sendFollowUpEmail(email: GeneratedEmail): Promise<{ ok: boolean; error?: string; id?: string | null }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: 'RESEND_API_KEY not set' }

  const payload: Record<string, unknown> = {
    from: email.from,
    to: [email.to],
    subject: email.subject,
    html: email.html,
  }
  if (email.replyTo) payload.reply_to = email.replyTo
  if (email.tone === 'internal') payload.bcc = ['rae@teachersdeserveit.com']

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: JSON.stringify(err) }
  }

  const data = await res.json().catch(() => ({}))
  return { ok: true, id: data?.id || null }
}
