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
  /** Ready to send. Built from `text`, never written by hand. */
  html: string
  /**
   * The same message as words.
   *
   * This is what gets stored on a draft and shown to whoever reads it before
   * sending, and it is what the send route expects: that route's own comment
   * says it converts a plain text body into styled HTML, and it wraps whatever
   * it is given. Storing HTML here meant the board printed markup at a person
   * and the send route wrapped an already-wrapped email a second time.
   *
   * Bold is marked with **asterisks**, which buildEmailHtml turns into real
   * bold. Two characters a person can read past, rather than a tag they cannot.
   */
  text: string
  tone: EmailTone
}

/**
 * Words to email. The only place this file turns text into markup.
 *
 * Paragraphs are separated by a blank line and **bold** becomes real bold,
 * which is the same contract buildEmailHtml in the send route uses, so a draft
 * a person edits by hand renders the same way as one we generate.
 */
function renderFollowUpHtml(text: string, badge: { color: string; label: string }): string {
  const escapeHtml = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const body = text
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      const safe = escapeHtml(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      return `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">${safe}</p>`
    })
    .join('')

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
      <div style="background: ${badge.color}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
        ${badge.label}
      </div>
      ${body}
    </div>`
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
    // Internal inboxes are still TDI inboxes, so the punctuation rules apply
    // here too. These three carried em dashes into Rae's mail every night.
    subject =
      type === 'reminder'
        ? `UPCOMING: "${itemTitle}" due ${dueDate}`
        : type === 'nudge'
          ? `OVERDUE (${bizDaysOverdue} biz days): "${itemTitle}"`
          : `ESCALATED to ${displayRungLabel}: "${itemTitle}", ${bizDaysOverdue} days overdue`
  }

  // The words, once.
  //
  // Written as plain paragraphs with **bold** for emphasis, then rendered into
  // HTML below. Previously the paragraphs only existed inside a template
  // literal full of inline styles, so the only way to read what we say to a
  // school was to read markup, and the only way to change a sentence was to
  // edit it inside a style attribute.
  let paragraphs: string[]

  if (tone === 'client') {
    if (type === 'reminder') {
      paragraphs = [
        `Hi ${contactName},`,
        `Just a friendly heads-up, **${friendlyTask}** is coming up around **${dueDate}**. No rush at all, I just want to make sure you have everything you need from us to get it out the door.`,
        `Everything's prepared on our end. If anything's unclear or you'd like me to hop on a quick call to walk through it, I'm here.`,
        `Rooting for you and ${schoolName},`,
        `Bella`,
        `Teachers Deserve It`,
      ]
    } else if (type === 'nudge') {
      paragraphs = [
        `Hi ${contactName},`,
        `I wanted to follow up on **${friendlyTask}**. It was on the calendar for **${dueDate}**, and I know how full your plate is this time of year.`,
        `Is there anything holding it up that I can help with? A question, a quick call, or me sitting on Zoom while you send it. Just say the word.`,
        `We really want to land this funding for your teachers, and you're not doing it alone.`,
        `Here for you,`,
        `Bella`,
        `Teachers Deserve It`,
      ]
    } else {
      paragraphs = [
        `Hi ${contactName},`,
        `I'm reaching out because **${friendlyTask}** is a key piece of the funding we're working to secure for **${schoolName}**, and we want to make sure it doesn't slip through the cracks during a busy stretch.`,
        `Everything's prepared and ready, it just needs a few minutes from your side. Could you help us get it across the line, or point me to the best person to work with?`,
        `Thank you for championing this for your teachers,`,
        `Bella`,
        `Teachers Deserve It`,
      ]
    }
  } else {
    const nextDisplay = (!nextRung || nextRung === 'none')
      ? 'Final rung (Rae is the last stop)'
      : displayRung(nextRung)

    if (type === 'reminder') {
      paragraphs = [
        `**${itemTitle}**`,
        `Due: **${dueDate}**. On track?`,
      ]
    } else if (type === 'nudge') {
      paragraphs = [
        `**${itemTitle}**`,
        `**${bizDaysOverdue} business days overdue** (due ${dueDate})`,
        `Submitter: ${submitterName}. No response yet.`,
      ]
    } else {
      paragraphs = [
        `**${itemTitle}**`,
        `Escalated to **${displayRungLabel}** rung. ${bizDaysOverdue} business days overdue.`,
        `Next: ${nextDisplay}.`,
      ]
    }
    paragraphs.push('TDI Funding Follow-Up System')
  }

  const text = paragraphs.join('\n\n')

  // The badge the client emails have always carried, kept rather than dropped.
  const badge =
    tone === 'client'
      ? {
          color: type === 'escalation' ? '#D4A843' : type === 'nudge' ? '#5B8FA8' : '#1B365D',
          label: type === 'escalation' ? 'Quick favor' : type === 'nudge' ? 'Checking in' : 'Friendly reminder',
        }
      : {
          color: type === 'escalation' ? '#DC2626' : type === 'nudge' ? '#D97706' : '#2563EB',
          label: type === 'escalation' ? 'ESCALATED' : type === 'nudge' ? 'OVERDUE' : 'UPCOMING',
        }

  const html = renderFollowUpHtml(text, badge)

  const fromName = tone === 'client' ? 'Bella at Teachers Deserve It' : 'TDI Funding'
  const replyTo = tone === 'client' ? 'hello@teachersdeserveit.com' : undefined

  return { to, from: `${fromName} <noreply@teachersdeserveit.com>`, replyTo, subject, html, text, tone }
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
