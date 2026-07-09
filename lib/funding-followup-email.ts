/**
 * Shared email template + send logic for the funding follow-up system.
 * Used by both the automated cron engine and the manual "Send nudge" button.
 *
 * IMPORTANT: The SEND_ALLOWLIST controls which recipients can receive emails.
 * Currently seeded with Allenwood contacts + rae@ only. Do NOT add client
 * addresses until Bella is fully onboarded and ready to own the relationship.
 */

// ── Recipient allowlist ──

export const ALLOWLIST_ENABLED = true
export const SEND_ALLOWLIST: string[] = [
  'teri.gordonhernandez@pgcps.org',
  'sharonh.porter@pgcps.org',
  'rae@teachersdeserveit.com',
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

export function clientTaskLabel(rawTitle: string, clientLabel?: string | null): string {
  if (clientLabel) return clientLabel
  const stripped = rawTitle
    .replace(/^(Get\s+\S+\s+to\s+)/i, '')
    .replace(/^(Confirm:\s*)/i, '')
    .replace(/^(Follow\s+up\s+(on|with)\s+\S+[:/]?\s*)/i, '')
    .replace(/^(Track\s+)/i, '')
    .trim()
  return stripped.length > 5 ? stripped : 'this funding step'
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

export async function sendFollowUpEmail(email: GeneratedEmail): Promise<{ ok: boolean; error?: string }> {
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

  return { ok: true }
}
