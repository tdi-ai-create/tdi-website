import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { postFundingEvent } from '@/lib/funding-slack'
import { isGateOpen } from '@/lib/funding-gate-gaps'

// ══════════════════════════════════════════════════════════════
// DRY_RUN — flip to false ONLY after verifying logic against
// real data and confirming email templates with the team.
// While true: all sends are console.log'd and recorded in DB
// fields, but no actual emails leave the system.
// ══════════════════════════════════════════════════════════════
const DRY_RUN = false

// ══════════════════════════════════════════════════════════════
// SEND_ALLOWLIST — which TDI addresses this cron may email.
//
// It only governs internal recipients now. A school address never reaches the
// allowlist at all: sendFollowUpEmail queues a draft for Bella instead of
// sending, so the decision is made before this list is consulted.
//
// The previous comment claimed client addresses were "still excluded until
// go-live" while the list immediately below it contained every one of them.
// Anyone reading this file to answer "can we accidentally email a school" got
// the wrong answer. They were removed with the drafting rule, not before it:
// removing them while the allowlist still gated the client path would have made
// those sends vanish silently instead of becoming drafts, which is worse.
//
// Order of checks: DRY_RUN → WINDOW GATE → TDI? → ALLOWLIST → send.
//                                            └→ not TDI: draft for Bella.
// ══════════════════════════════════════════════════════════════
const ALLOWLIST_ENABLED = true
const SEND_ALLOWLIST: string[] = [
  'rae@teachersdeserveit.com',
  'hello@teachersdeserveit.com',
  'bella@teachersdeserveit.com',
]

function isOnAllowlist(email: string): boolean {
  return SEND_ALLOWLIST.some(a => a.toLowerCase() === email.toLowerCase())
}

const LOG = '[funding-followup]'

// ── Lead windows (business days before due_date) by action_size ──

const LEAD_WINDOWS: Record<string, number> = {
  light: 2,
  standard: 3,
  heavy: 5,
}

// ── Nudge cadence and ceiling ──
//
// How long an overdue item waits between reminders. Weekly, not daily: a
// principal reminded about the same item every morning stops reading any of
// them. Escalation is unaffected and still advances on its own window, so a
// genuinely stuck item still climbs the ladder at the same speed.
const NUDGE_INTERVAL_DAYS = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

// How many automated reminders an item gets before the machine stops and a
// person takes over.
//
// There was no ceiling at all. nudge_count was incremented on every send and
// compared against nothing, so an item nobody closed emailed its owner forever.
// Two principals received 41 between them and one item alone sent 18.
//
// Three weekly reminders is three weeks of asking. If that has not worked, more
// of the same will not work either, and continuing to send is actively harmful:
// it trains the recipient to ignore us, and it replaces a conversation somebody
// should be having with a robot that cannot have one.
const MAX_NUDGES = 3

// ── Escalation ladder ──

const RUNG_ORDER = ['none', 'submitter', 'backup', 'admin_sponsor', 'rae'] as const
type Rung = (typeof RUNG_ORDER)[number]

function rungIndex(rung: string | null): number {
  const idx = RUNG_ORDER.indexOf((rung ?? 'none') as Rung)
  return idx === -1 ? 0 : idx
}

type Gate = {
  pursuit_id: string
  submitter_email: string | null
  submitter_name: string | null
  backup_email: string | null
  backup_name: string | null
  admin_sponsor_email: string | null
  admin_sponsor_name: string | null
  // Fetched so isGateOpen can apply the same five conditions the gate route
  // does. Without these the check silently degrades to "three contacts named",
  // which is how a school with unsigned contracts got treated as ready.
  contract1_signed: boolean | null
  contract2_signed: boolean | null
}

type LadderStep = { rung: Rung; email: string }

/**
 * Build the effective escalation ladder for an item, collapsing out
 * null emails and deduplicating so the same person is never notified
 * at two different rungs.
 *
 * The ladder depends on WHO OWNS THE ITEM, which it previously did not.
 *
 * Every ladder was assembled from the pursuit gate, meaning the school's
 * submitter, backup and administrator. That is correct for work the school owes
 * us. It is wrong for our own internal work: a task assigned to Bella would,
 * on non-response, escalate into a principal's inbox carrying a title written
 * about them rather than to them.
 *
 * This is not hypothetical. Five TDI-owned items had already climbed to the
 * submitter rung and one reached backup. Only the send allowlist stopped those
 * from landing, and an allowlist is a config file somebody can edit without
 * knowing what it is holding back.
 *
 * So: client-owned work climbs the school ladder. TDI-owned work climbs from
 * the TDI owner straight to Rae and never touches a school contact.
 *
 * Rung names are deliberately unchanged. They are persisted on every item and
 * RUNG_ORDER compares against them, so renaming would invalidate stored state.
 * For a TDI-owned item, read the 'submitter' rung as "the TDI person who owns
 * this", which is what item.owner_email already holds.
 */
function buildEffectiveLadder(
  gate: Gate | undefined,
  ownerEmail: string | null,
  ownerType: string | null | undefined,
): LadderStep[] {
  const steps: LadderStep[] = []
  const seen = new Set<string>()

  const tryAdd = (rung: Rung, email: string | null | undefined) => {
    if (!email) return
    const key = email.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    steps.push({ rung, email })
  }

  if (ownerType === 'client') {
    tryAdd('submitter', gate?.submitter_email ?? ownerEmail)
    tryAdd('backup', gate?.backup_email)
    tryAdd('admin_sponsor', gate?.admin_sponsor_email)
  } else {
    // TDI-owned work. The school is not in this ladder at all.
    tryAdd('submitter', ownerEmail)
  }

  tryAdd('rae', 'rae@teachersdeserveit.com')

  return steps
}

/**
 * Find the next step in the effective ladder above the current rung.
 * Handles the case where the current rung was collapsed out of the ladder.
 */
function findNextStep(
  ladder: LadderStep[],
  currentRung: string,
): LadderStep | null {
  if (currentRung === 'none') return ladder[0] ?? null

  const currentOrdinal = rungIndex(currentRung)

  // Find current position in the effective ladder
  const currentIdx = ladder.findIndex(s => s.rung === currentRung)
  if (currentIdx !== -1) {
    // Current rung exists in ladder — return the next one
    return ladder[currentIdx + 1] ?? null
  }

  // Current rung was collapsed out — find the next higher rung
  return ladder.find(s => rungIndex(s.rung) > currentOrdinal) ?? null
}

// ── Business-day helpers ──

function bizDaysBetween(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0)
  const b = new Date(to);   b.setHours(0, 0, 0, 0)

  if (a.getTime() === b.getTime()) return 0

  const forward = b > a
  const [start, end] = forward ? [a, b] : [b, a]

  let count = 0
  const cursor = new Date(start)
  cursor.setDate(cursor.getDate() + 1)
  while (cursor <= end) {
    const d = cursor.getDay()
    if (d !== 0 && d !== 6) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return forward ? count : -count
}

function subtractBizDays(date: Date, bizDays: number): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  let remaining = bizDays
  while (remaining > 0) {
    result.setDate(result.getDate() - 1)
    const d = result.getDay()
    if (d !== 0 && d !== 6) remaining--
  }
  return result
}

function escalationWindow(runwayCalDays: number): number {
  if (runwayCalDays > 14) return 5
  if (runwayCalDays >= 7) return 3
  return 1
}

// ── Tone routing ──
//
// Decided by who is actually receiving the email, not by which rung of the
// ladder it came from.
//
// Rung-based routing assumed rung implied audience: everything below 'rae' was
// treated as client-facing. That assumption broke the moment an internal item
// climbed the ladder, and it is the same class of mistake as the ladder itself.
// A recipient's address is the fact; the rung is an inference about it.
//
// Practically: anyone at teachersdeserveit.com gets internal phrasing, everyone
// else gets client phrasing, whatever rung they occupy.

type EmailTone = 'client' | 'internal'

function isTdiAddress(email: string): boolean {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

function toneForRecipient(email: string): EmailTone {
  return isTdiAddress(email) ? 'internal' : 'client'
}

// ── Client-facing task label ──
//
// What a school is told an item is about. If client_label is set, that is the
// wording a person chose and it is used verbatim.
//
// Without one, this used to strip four known internal prefixes off the raw
// title and send whatever remained. A denylist of four patterns is the wrong
// shape for this: it passes everything it does not recognise, and the titles
// that caused real damage matched none of them. "Check if Paula set up her Deed
// account" and "Remind Paula: window is open" both sailed straight through and
// were mailed to Paula, written about her in the third person.
//
// Inverted to a safelist. A title is only shown to a school if it reads like
// something addressed to them. Anything phrased as an internal instruction
// falls back to neutral wording, and logs, because an item reaching a school
// without a client_label is a gap someone should close rather than something to
// paper over silently.

const INTERNAL_TITLE_SHAPES = [
  /^(check|confirm|verify)\b/i,   // "Check if X set up their account"
  /^(remind|nudge|chase)\b/i,     // "Remind X: window is open"
  /^(ask|email|call|contact)\b/i, // "Ask X if the school has..."
  /^(track|follow\s+up|get)\b/i,  // "Track X", "Get X to send Y"
  /^(gate|internal|todo)\b/i,     // machine-generated prefixes
  /\b(bella|rae|julie|vanessa|amara)\b/i, // names of ours have no business here
]

function clientTaskLabel(rawTitle: string, clientLabel?: string | null): string {
  if (clientLabel && clientLabel.trim()) return clientLabel.trim()

  const title = (rawTitle || '').trim()
  const looksInternal =
    !title || INTERNAL_TITLE_SHAPES.some(shape => shape.test(title))

  if (looksInternal) {
    console.warn(
      LOG,
      `[LABEL] "${title}" has no client_label and reads as internal — ` +
        `using neutral wording. Set a client_label on this item.`,
    )
    return 'this funding step'
  }

  return title
}

// Capitalize a rung label for display
function displayRung(rung: string): string {
  if (rung === 'rae') return 'Rae'
  if (rung === 'admin_sponsor') return 'Admin Sponsor'
  return rung.charAt(0).toUpperCase() + rung.slice(1)
}

/**
 * Resolve the best contact name for an escalation email greeting.
 * For backup/admin_sponsor: use full stored name (e.g. "Dr. Porter") — formal.
 * For submitter reminders/nudges: first name is fine (handled at call site).
 * Fallback: parse from email prefix.
 */
function resolveContactName(
  step: LadderStep,
  gate: Gate | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  ownerFirstName: string,
): string {
  if (step.rung === 'rae') return 'Rae'
  if (step.rung === 'submitter') {
    return item.owner_name ?? ownerFirstName
  }
  if (step.rung === 'backup' && gate?.backup_name) return gate.backup_name
  if (step.rung === 'admin_sponsor' && gate?.admin_sponsor_name) return gate.admin_sponsor_name
  // Fallback: capitalize email prefix
  const prefix = (step.email.split('@')[0] ?? '').split('.')[0] ?? 'there'
  return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

// ── Email sending (wired but gated by DRY_RUN) ──

async function sendFollowUpEmail(params: {
  to: string
  itemTitle: string
  dueDate: string
  bizDaysOverdue: number
  rungLabel: string
  type: 'reminder' | 'nudge' | 'escalation'
  tone: EmailTone
  // Client tone fields
  contactName?: string   // full stored name for greeting (e.g. "Dr. Porter", "Teri")
  schoolName?: string
  clientLabel?: string   // optional client-friendly task label from DB
  // Internal tone fields
  submitterName?: string
  nextRung?: string
  // For email log tracking
  pursuitId?: string
  opportunityId?: string | null
}): Promise<'sent' | 'drafted' | 'failed'> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn(LOG, 'RESEND_API_KEY not set — skipping send')
    return 'failed'
  }

  const {
    to, itemTitle, dueDate, bizDaysOverdue, rungLabel, type, tone,
    contactName = 'there', schoolName = 'your school', clientLabel,
    submitterName = 'unknown', nextRung = 'none',
  } = params

  const friendlyTask = clientTaskLabel(itemTitle, clientLabel)
  const displayRungLabel = displayRung(rungLabel)

  // ── Subject lines ──

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

  // ── HTML body ──

  let html: string
  if (tone === 'client') {
    // Soft badge colors + warm labels for client emails
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
    // Internal tone — crisp, scannable, sharp badges unchanged
    const urgencyColor =
      type === 'escalation' ? '#DC2626' : type === 'nudge' ? '#D97706' : '#2563EB'
    const urgencyLabel =
      type === 'escalation' ? 'ESCALATED' : type === 'nudge' ? 'OVERDUE' : 'UPCOMING'

    // Format "Next:" line — replace bare "none" with a human-readable final-rung message
    const nextDisplay = (!nextRung || nextRung === 'none')
      ? 'Final rung (escalated to Rae for resolution)'
      : displayRung(nextRung)

    let internalBody: string
    if (type === 'reminder') {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">
          Due: <strong>${dueDate}</strong>. On track?
        </p>`
    } else if (type === 'nudge') {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px;">
          <strong>${bizDaysOverdue} business days overdue</strong> (due ${dueDate})
        </p>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">
          Submitter: ${submitterName}. No response yet.
        </p>`
    } else {
      internalBody = `
        <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px;">
          Escalated to <strong>${displayRungLabel}</strong> rung. ${bizDaysOverdue} business days overdue.
        </p>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">
          Next: ${nextDisplay}.
        </p>`
    }

    html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
      <div style="background: ${urgencyColor}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
        ${urgencyLabel}
      </div>
      ${internalBody}
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
        TDI Funding Follow-Up System
      </p>
    </div>`
  }

  // ── Send via Resend ──

  const fromName = tone === 'client'
    ? 'Bella — Teachers Deserve It'
    : 'TDI Funding'
  const replyTo = tone === 'client'
    ? 'hello@teachersdeserveit.com'
    : undefined

  // ── Automation never emails a school. It drafts, and Bella sends. ──
  //
  // This is the rule, and this is the only place it needs to hold, because
  // every automated send in this file passes through here. The manual "Send
  // nudge" button uses lib/funding-followup-email.ts and is unaffected: that is
  // a person choosing to send, which is exactly what we want to stay possible.
  //
  // Why the rule exists. Every serious failure this system has had came from a
  // machine deciding to contact a principal: 41 emails to two of them, internal
  // wording sent in the third person, and a school chased about submitting an
  // application nobody was writing. Capping and relabelling reduce that. Only
  // this removes it.
  //
  // The cost is real and worth naming: nothing reaches a school while Bella is
  // away. That is a deliberate trade, and the drafts wait rather than vanish.
  if (!isTdiAddress(to)) {
    const supabase = getServiceSupabase()

    // One draft per item per day, not one per hourly run.
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    const { data: alreadyDrafted } = await supabase
      .from('funding_email_log')
      .select('id')
      .eq('to_email', to)
      .eq('subject', subject)
      .eq('status', 'draft')
      .gte('created_at', since.toISOString())
      .limit(1)

    if (alreadyDrafted && alreadyDrafted.length > 0) {
      console.log(LOG, `[DRAFT] Already queued today for ${to}: "${subject}"`)
      return 'drafted'
    }

    const { error: draftError } = await supabase.from('funding_email_log').insert({
      pursuit_id: params.pursuitId || null,
      opportunity_id: params.opportunityId || null,
      subject,
      body: html,
      to_email: to,
      to_name: params.contactName || null,
      from_email: 'noreply@teachersdeserveit.com',
      status: 'draft',
      sent_by: 'system (queued for Bella)',
      email_type: type === 'nudge' || type === 'escalation' ? 'nudge' : 'deadline_reminder',
    })
    if (draftError) {
      // Loud on purpose. A swallowed failure here means the school is never
      // contacted and nobody knows, which is worse than the email problem.
      console.error(LOG, `Failed to queue draft for ${to}:`, draftError)
      return 'failed'
    }

    console.log(LOG, `[DRAFT] Queued for Bella instead of sending to ${to}: "${subject}"`)
    return 'drafted'
  }

  const payload: Record<string, unknown> = {
    from: `${fromName} <noreply@teachersdeserveit.com>`,
    to: [to],
    subject,
    html,
  }
  if (replyTo) payload.reply_to = replyTo
  if (tone === 'internal') payload.bcc = ['rae@teachersdeserveit.com']

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
    console.error(LOG, `Resend error sending to ${to}:`, err)
    return 'failed'
  }

  // Log to funding_email_log for the Emails tab
  if (params.pursuitId) {
    const resData = await res.json().catch(() => ({}))
    const supabase = getServiceSupabase()
    const { error: logError } = await supabase.from('funding_email_log').insert({
      pursuit_id: params.pursuitId,
      opportunity_id: params.opportunityId || null,
      subject,
      body: html,
      to_email: to,
      to_name: params.contactName || null,
      from_email: 'noreply@teachersdeserveit.com',
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_by: 'system (cron)',
      resend_id: resData?.id || null,
      email_type: type === 'nudge' ? 'nudge' : type === 'escalation' ? 'nudge' : 'deadline_reminder',
    })
    if (logError) console.error(LOG, 'Failed to log email:', logError)
  }

  return 'sent'
}

// ── Route handler ──

export async function GET(request: NextRequest) {
  // Auth — matches funding-reminders / quote-expiry pattern
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceSupabase()
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const summary = {
      items_processed: 0,
      colors: { green: 0, yellow: 0, red: 0 },
      reminders_fired: 0,
      nudges_fired: 0,
      escalations_advanced: 0,
      sent: 0,
      drafted_for_bella: 0,
      send_failed: 0,
      dry_run_skipped: 0,
      window_skipped: 0,
      allowlist_skipped: 0,
      agentOverdue: 0,
      dry_run: DRY_RUN,
      allowlist_enabled: ALLOWLIST_ENABLED,
      allowlist: SEND_ALLOWLIST,
      details: [] as Array<{
        item_id: string
        pursuit_id: string
        title: string
        owner_email: string | null
        color: string
        action: string
        target_email?: string
        escalation_rung?: string
        biz_days_overdue?: number
        biz_days_since_escalation?: number
        window_size?: number
        effective_ladder?: string[]
      }>,
    }

    // ── 1. Fetch pending action items ──

    const { data: items, error: itemsErr } = await supabase
      .from('funding_action_items')
      .select('*')
      .eq('status', 'pending')

    if (itemsErr) {
      console.error(LOG, 'Failed to fetch action items:', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending items', ...summary })
    }

    // ── 2. Batch-fetch pursuit gates for escalation contacts ──

    const pursuitIds = Array.from(new Set(items.map(i => i.pursuit_id).filter(Boolean)))

    const { data: gates } = pursuitIds.length > 0
      ? await supabase
          .from('pursuit_gate')
          .select('pursuit_id, submitter_email, submitter_name, backup_email, backup_name, admin_sponsor_email, admin_sponsor_name, contract1_signed, contract2_signed')
          .in('pursuit_id', pursuitIds)
      : { data: [] as Gate[] }

    const gateByPursuit = new Map<string, Gate>(
      (gates ?? []).map((g: Gate) => [g.pursuit_id, g]),
    )

    // ── 3. Batch-fetch pursuits for owner email ──

    type Pursuit = {
      id: string
      next_action_owner_email: string | null
      pursuit_name: string | null
      district_name: string | null
      current_phase: string | null
      archived: boolean | null
    }

    const { data: pursuits } = pursuitIds.length > 0
      ? await supabase
          .from('funding_pursuits')
          .select('id, next_action_owner_email, pursuit_name, district_name, current_phase, archived')
          .in('id', pursuitIds)
      : { data: [] as Pursuit[] }

    const pursuitById = new Map<string, Pursuit>(
      (pursuits ?? []).map((p: Pursuit) => [p.id, p]),
    )

    // ── 4. Batch-fetch funding opportunities for window gate ──

    type Opportunity = {
      id: string
      pursuit_id: string
      window_status: string | null
      window_closes: string | null
    }

    const { data: opportunities } = pursuitIds.length > 0
      ? await supabase
          .from('funding_opportunities')
          .select('id, pursuit_id, window_status, window_closes')
          .in('pursuit_id', pursuitIds)
      : { data: [] as Opportunity[] }

    // Index by opportunity id AND group by pursuit_id
    const oppById = new Map<string, Opportunity>(
      (opportunities ?? []).map((o: Opportunity) => [o.id, o]),
    )
    const oppsByPursuit = new Map<string, Opportunity[]>()
    for (const o of opportunities ?? []) {
      const list = oppsByPursuit.get(o.pursuit_id) ?? []
      list.push(o)
      oppsByPursuit.set(o.pursuit_id, list)
    }

    /**
     * Window gate: returns { open: true } if the item is eligible to nudge/escalate,
     * or { open: false, reason } if it should be skipped.
     */
    function checkWindowGate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actionItem: any,
      currentDate: Date,
    ): { open: boolean; status: string; closes: string | null } {
      // If the item has a direct opportunity_id, check that one
      if (actionItem.opportunity_id) {
        const opp = oppById.get(actionItem.opportunity_id)
        if (!opp) return { open: false, status: 'unknown', closes: null }
        const status = opp.window_status ?? 'unknown'
        const closes = opp.window_closes
        if (status !== 'open') return { open: false, status, closes }
        if (closes) {
          const closesDate = new Date(closes + 'T00:00:00')
          if (closesDate < currentDate) return { open: false, status: 'open_but_past_close', closes }
        }
        return { open: true, status, closes }
      }

      // No direct opportunity — check all opportunities for this pursuit
      const pursuitOpps = oppsByPursuit.get(actionItem.pursuit_id) ?? []
      if (pursuitOpps.length === 0) return { open: false, status: 'unknown', closes: null }

      // If ANY opportunity on this pursuit is open with a valid window, the item is eligible
      for (const opp of pursuitOpps) {
        const status = opp.window_status ?? 'unknown'
        if (status !== 'open') continue
        const closes = opp.window_closes
        if (closes) {
          const closesDate = new Date(closes + 'T00:00:00')
          if (closesDate < currentDate) continue
        }
        return { open: true, status: 'open', closes }
      }

      // None were open — report the first one's status for logging
      const firstStatus = pursuitOpps[0].window_status ?? 'unknown'
      return { open: false, status: firstStatus, closes: pursuitOpps[0].window_closes }
    }

    // ── 5. Process each item ──

    for (const item of items) {
      summary.items_processed++

      if (!item.due_date) continue

      const pursuit = pursuitById.get(item.pursuit_id)

      // ── PREREQUISITE CHECK — skip items whose pursuit isn't ready ──
      // Don't send reminders for archived pursuits
      if (pursuit?.archived) continue

      // Don't send reminders if the gate isn't open and this is a client-facing action
      // (gate must be satisfied before any school outreach)
      if (item.owner_type === 'client') {
        const gate = gateByPursuit.get(item.pursuit_id)
        // One definition of an open gate, shared with the gate route and the
        // gap sync, rather than a private approximation of it.
        //
        // This used to check three email addresses and stop there, ignoring
        // both signed contracts and gate_open entirely. So a school whose gate
        // was shut, for whom no agent could draft a single word, was still
        // treated as ready and chased about submitting.
        //
        // That is the St. Peter Chanel episode in one line. Her gate sat shut
        // for eighteen days because two signed contracts were never linked to
        // it, nothing was drafted the whole time, and she was emailed fourteen
        // times about submitting an application nobody was writing.
        //
        // isGateOpen recomputes from the fields rather than trusting the stored
        // gate_open flag, which is what a record disagreeing with reality looks
        // like and is the most common bug in this codebase.
        if (!isGateOpen(gate)) continue
      }

      // Don't send reminders for actions in phases ahead of the pursuit's current phase
      const PHASE_ORDER = ['intake', 'researching', 'strategy', 'writing', 'in_review', 'delivered', 'submitted', 'awaiting_decision', 'awarded']
      const currentPhaseIdx = PHASE_ORDER.indexOf(pursuit?.current_phase || 'intake')
      const categoryToPhase: Record<string, string> = {
        research: 'researching',
        writing: 'writing',
        submission: 'submitted',
        follow_up: 'intake', // follow-ups are always valid
        approval: 'in_review',
        documentation: 'intake', // documentation is always valid
      }
      const itemPhase = categoryToPhase[item.category || ''] || 'intake'
      const itemPhaseIdx = PHASE_ORDER.indexOf(itemPhase)
      if (itemPhaseIdx > currentPhaseIdx + 1) continue // allow one phase ahead but not more

      const dueDate = new Date(item.due_date + 'T00:00:00')
      const actionSize: string = item.action_size || 'standard'
      const leadBizDays = LEAD_WINDOWS[actionSize] ?? LEAD_WINDOWS.standard
      const leadStartDate = subtractBizDays(dueDate, leadBizDays)

      const ownerEmail =
        item.owner_email ??
        pursuit?.next_action_owner_email ??
        null
      const schoolName =
        pursuit?.pursuit_name ?? pursuit?.district_name ?? 'your school'
      const ownerFirstName = (item.owner_name ?? '').split(' ')[0] || 'there'

      const gate = gateByPursuit.get(item.pursuit_id)
      const effectiveLadder = buildEffectiveLadder(gate, ownerEmail, item.owner_type)

      // ── COLOR STATE ──

      let color: 'green' | 'yellow' | 'red'
      if (dueDate.getTime() < today.getTime()) {
        color = 'red'
      } else if (today >= leadStartDate) {
        color = 'yellow'
      } else {
        color = 'green'
      }

      summary.colors[color]++

      const updates: Record<string, unknown> = { color_state: color }

      // ── WINDOW GATE — skip nudges/escalation if funding window is not confirmed open ──

      const windowCheck = checkWindowGate(item, today)
      if (!windowCheck.open) {
        console.log(
          LOG,
          `[WINDOW] Skipped "${item.title}" — funding window not open ` +
            `(status=${windowCheck.status}, closes=${windowCheck.closes ?? 'n/a'})`,
        )
        summary.window_skipped++

        // Still write color_state, but skip all sending actions
        const { error: updateErr } = await supabase
          .from('funding_action_items')
          .update(updates)
          .eq('id', item.id)
        if (updateErr) {
          console.error(LOG, `Failed to update item ${item.id}:`, updateErr)
        }
        continue
      }

      // ── REMINDERS (entering lead window, not yet reminded) ──

      if (color === 'yellow' && !item.reminder_first_at) {
        updates.reminder_first_at = now.toISOString()
        updates.reminder_count = (item.reminder_count ?? 0) + 1

        summary.reminders_fired++

        const targetEmail = ownerEmail ?? undefined
        const dueDateStr = item.due_date

        if (DRY_RUN) {
          console.log(LOG, `[DRY RUN] Would send reminder to ${targetEmail} for "${item.title}" (due ${dueDateStr})`)
          summary.dry_run_skipped++
        } else if (targetEmail && ALLOWLIST_ENABLED && isTdiAddress(targetEmail) && !isOnAllowlist(targetEmail)) {
          console.log(LOG, `[ALLOWLIST] Skipped ${targetEmail} — not on allowlist`)
          summary.allowlist_skipped++
        } else if (targetEmail) {
          const outcome = await sendFollowUpEmail({
            to: targetEmail,
            itemTitle: item.title,
            dueDate: dueDateStr,
            bizDaysOverdue: 0,
            rungLabel: 'owner',
            type: 'reminder',
            tone: 'client',
            contactName: ownerFirstName,
            schoolName,
            clientLabel: item.client_label,
            pursuitId: item.pursuit_id,
            opportunityId: item.opportunity_id,
          })
          if (outcome === 'sent') summary.sent++
          else if (outcome === 'drafted') summary.drafted_for_bella++
          else summary.send_failed++
        }

        summary.details.push({
          item_id: item.id,
          pursuit_id: item.pursuit_id,
          title: item.title,
          owner_email: ownerEmail,
          color,
          action: 'first_reminder',
          target_email: targetEmail,
        })
      }

      // ── NUDGES + ESCALATION (overdue / red) ──

      if (color === 'red') {
        const bizDaysOverdue = bizDaysBetween(dueDate, today)

        // Ensure reminder_first_at is set even if the item jumped straight to red
        if (!item.reminder_first_at && !updates.reminder_first_at) {
          updates.reminder_first_at = now.toISOString()
          updates.reminder_count = (item.reminder_count ?? 0) + 1
        }

        // Nudge: at most once every NUDGE_INTERVAL_DAYS.
        //
        // This was once per calendar day, which reads as nagging to a principal
        // who is being reminded about the same thing every morning. There is
        // also no upper bound on nudge_count anywhere in this file, so a daily
        // cadence on an item nobody closes never stops: two overdue items sent
        // one contact 27 emails, and a second contact got three a night for
        // four consecutive nights.
        //
        // Weekly does not fix the missing ceiling, it reduces the blast radius
        // while that is designed properly. Modelled against the actual incident:
        // those 41 emails would have been 13, and the worst single item drops
        // from 18 to 3. The ratio is well short of 7x because these items only
        // ran 9 to 19 days past due; it approaches 7x the longer one sits open,
        // which is exactly the case a ceiling still needs to handle.
        const lastNudge = item.last_nudge_sent_at
          ? new Date(item.last_nudge_sent_at)
          : null
        const daysSinceNudge =
          lastNudge === null
            ? Infinity
            : Math.floor(
                (today.getTime() - new Date(lastNudge).setHours(0, 0, 0, 0)) /
                  MS_PER_DAY,
              )
        const nudgedRecently = daysSinceNudge < NUDGE_INTERVAL_DAYS

        const nudgesSoFar = item.nudge_count ?? 0
        const atCeiling = nudgesSoFar >= MAX_NUDGES

        // ── CEILING REACHED — hand to a person, exactly once ──
        //
        // Stopping silently would swap one failure for another: the item goes
        // quiet and is forgotten, which is the thing this pipeline exists to
        // prevent. So the last automated act is to tell a human it is now
        // theirs. nudge_ceiling_notified_at guarantees that fires once rather
        // than every hour, since this cron runs hourly.
        if (atCeiling && !item.nudge_ceiling_notified_at) {
          updates.nudge_ceiling_notified_at = now.toISOString()

          const handTo = item.owner_type === 'client' ? 'bella' : 'rae'
          const who = item.client_label || item.title

          postFundingEvent({
            pursuitId: item.pursuit_id,
            pursuitName: schoolName,
            message:
              `Automated reminders have stopped for "${who}". ` +
              `${nudgesSoFar} sent, no response, still open. This needs a person now.`,
            level: 'critical',
            owner: handTo,
            timelineTitle: `Automated reminders stopped: ${item.title}`,
            timelineDetail:
              `${nudgesSoFar} reminders sent to ${ownerEmail ?? 'unknown'} with no resolution. ` +
              `Ceiling is ${MAX_NUDGES}. Handed to ${handTo}. ` +
              `The item stays open and keeps its due date; only the automated sending stops.`,
          }).catch(err => console.error('[funding-followup] non-blocking side effect failed:', err))

          summary.details.push({
            item_id: item.id,
            pursuit_id: item.pursuit_id,
            title: item.title,
            owner_email: ownerEmail,
            color,
            action: 'nudge_ceiling_reached',
            target_email: ownerEmail ?? undefined,
            biz_days_overdue: bizDaysOverdue,
          })
        }

        if (!nudgedRecently && !atCeiling) {
          updates.nudge_count = (item.nudge_count ?? 0) + 1
          updates.last_nudge_sent_at = now.toISOString()
          summary.nudges_fired++

          const targetEmail = ownerEmail ?? undefined

          if (DRY_RUN) {
            console.log(LOG, `[DRY RUN] Would send nudge to ${targetEmail} for overdue "${item.title}"`)
            summary.dry_run_skipped++
          } else if (targetEmail && ALLOWLIST_ENABLED && isTdiAddress(targetEmail) && !isOnAllowlist(targetEmail)) {
            console.log(LOG, `[ALLOWLIST] Skipped ${targetEmail} — not on allowlist`)
            summary.allowlist_skipped++
          } else if (targetEmail) {
            const outcome = await sendFollowUpEmail({
              to: targetEmail,
              itemTitle: item.title,
              dueDate: item.due_date,
              bizDaysOverdue,
              rungLabel: 'owner',
              type: 'nudge',
              tone: 'client',
              contactName: ownerFirstName,
              schoolName,
              clientLabel: item.client_label,
              pursuitId: item.pursuit_id,
              opportunityId: item.opportunity_id,
            })
            if (outcome === 'sent') summary.sent++
            else if (outcome === 'drafted') summary.drafted_for_bella++
            else summary.send_failed++
          }

          summary.details.push({
            item_id: item.id,
            pursuit_id: item.pursuit_id,
            title: item.title,
            owner_email: ownerEmail,
            color,
            action: 'nudge',
            target_email: targetEmail,
            biz_days_overdue: bizDaysOverdue,
          })
        }

        // ── ESCALATION LADDER (non-response based) ──

        // Runway for window sizing
        const createdAt = item.created_at ? new Date(item.created_at) : dueDate
        const rawRunway = Math.round(
          (dueDate.getTime() - new Date(createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        const runwayCalDays = Math.max(7, rawRunway)
        const windowSize = escalationWindow(runwayCalDays)

        const currentRung: string = item.escalation_rung ?? 'none'

        if (currentRung === 'none') {
          // Item just became overdue — escalate to first rung in effective ladder
          const nextStep = effectiveLadder[0]
          if (nextStep) {
            // Advance the rung only once the escalation has actually reached
            // someone, either as a sent email or a draft queued for Bella.
            //
            // It used to advance before the send was attempted. So a failed
            // send, or an allowlist skip, silently consumed a rung: the ladder
            // moved on while nobody had been contacted, and the person at that
            // rung went on record as having been asked and not answered. The
            // next cycle then escalated past them.
            let reached = false

            const nextNextStep = effectiveLadder[1] ?? null
            if (DRY_RUN) {
              console.log(
                LOG,
                `[DRY RUN] Would escalate "${item.title}" → ${nextStep.rung} (${nextStep.email}), ` +
                  `${bizDaysOverdue} biz days overdue, window=${windowSize}`,
              )
              summary.dry_run_skipped++
            } else if (ALLOWLIST_ENABLED && isTdiAddress(nextStep.email) && !isOnAllowlist(nextStep.email)) {
              console.log(LOG, `[ALLOWLIST] Skipped ${nextStep.email} — not on allowlist`)
              summary.allowlist_skipped++
            } else {
              const outcome = await sendFollowUpEmail({
                to: nextStep.email,
                itemTitle: item.title,
                dueDate: item.due_date,
                bizDaysOverdue,
                rungLabel: nextStep.rung,
                type: 'escalation',
                tone: toneForRecipient(nextStep.email),
                contactName: resolveContactName(nextStep, gate, item, ownerFirstName),
                schoolName,
                clientLabel: item.client_label,
                submitterName: item.owner_name ?? ownerEmail ?? 'unknown',
                nextRung: nextNextStep?.rung ?? 'none',
                pursuitId: item.pursuit_id,
                opportunityId: item.opportunity_id,
              })
              if (outcome === 'sent') { summary.sent++; reached = true }
              else if (outcome === 'drafted') { summary.drafted_for_bella++; reached = true }
              else summary.send_failed++
            }

            if (reached) {
              updates.escalation_rung = nextStep.rung
              updates.last_escalated_at = now.toISOString()
              summary.escalations_advanced++
            }

            summary.details.push({
              item_id: item.id,
              pursuit_id: item.pursuit_id,
              title: item.title,
              owner_email: ownerEmail,
              color,
              action: `escalate_to_${nextStep.rung}`,
              target_email: nextStep.email,
              escalation_rung: nextStep.rung,
              biz_days_overdue: bizDaysOverdue,
              window_size: windowSize,
              effective_ladder: effectiveLadder.map(s => `${s.rung}:${s.email}`),
            })
          }
        } else {
          // Already at a rung — advance only if the current rung hasn't responded
          // within their window (measured from last_escalated_at)
          const lastEscalatedAt = item.last_escalated_at
            ? new Date(item.last_escalated_at)
            : null

          if (!lastEscalatedAt) {
            // Legacy item: rung was set before we tracked last_escalated_at.
            // Seed the timestamp now; give them their full window before advancing.
            updates.last_escalated_at = now.toISOString()
          } else {
            const bizDaysSinceEscalation = bizDaysBetween(lastEscalatedAt, today)

            if (bizDaysSinceEscalation >= windowSize) {
              // Current rung didn't respond — advance to the next step
              const nextStep = findNextStep(effectiveLadder, currentRung)

              if (nextStep) {
                // Same rule as the first rung: advance only once the escalation
                // has actually reached someone. See the comment there.
                let reached = false

                const advNextStep = findNextStep(effectiveLadder, nextStep.rung)
                if (DRY_RUN) {
                  console.log(
                    LOG,
                    `[DRY RUN] Would escalate "${item.title}" ${currentRung} → ${nextStep.rung} ` +
                      `(${nextStep.email}), ${bizDaysSinceEscalation} biz days since last escalation, ` +
                      `window=${windowSize}`,
                  )
                  summary.dry_run_skipped++
                } else if (ALLOWLIST_ENABLED && isTdiAddress(nextStep.email) && !isOnAllowlist(nextStep.email)) {
                  console.log(LOG, `[ALLOWLIST] Skipped ${nextStep.email} — not on allowlist`)
                  summary.allowlist_skipped++
                } else {
                  const outcome = await sendFollowUpEmail({
                    to: nextStep.email,
                    itemTitle: item.title,
                    dueDate: item.due_date,
                    bizDaysOverdue,
                    rungLabel: nextStep.rung,
                    type: 'escalation',
                    tone: toneForRecipient(nextStep.email),
                    contactName: resolveContactName(nextStep, gate, item, ownerFirstName),
                    schoolName,
                    clientLabel: item.client_label,
                    submitterName: item.owner_name ?? ownerEmail ?? 'unknown',
                    nextRung: advNextStep?.rung ?? 'none',
                    pursuitId: item.pursuit_id,
                    opportunityId: item.opportunity_id,
                  })
                  if (outcome === 'sent') { summary.sent++; reached = true }
                  else if (outcome === 'drafted') { summary.drafted_for_bella++; reached = true }
                  else summary.send_failed++
                }

                if (reached) {
                  updates.escalation_rung = nextStep.rung
                  updates.last_escalated_at = now.toISOString()
                  summary.escalations_advanced++
                }

                summary.details.push({
                  item_id: item.id,
                  pursuit_id: item.pursuit_id,
                  title: item.title,
                  owner_email: ownerEmail,
                  color,
                  action: `escalate_${currentRung}_to_${nextStep.rung}`,
                  target_email: nextStep.email,
                  escalation_rung: nextStep.rung,
                  biz_days_overdue: bizDaysOverdue,
                  biz_days_since_escalation: bizDaysSinceEscalation,
                  window_size: windowSize,
                  effective_ladder: effectiveLadder.map(s => `${s.rung}:${s.email}`),
                })
              }
            }
          }
        }
      }

      // ── Write updates ──

      const { error: updateErr } = await supabase
        .from('funding_action_items')
        .update(updates)
        .eq('id', item.id)

      if (updateErr) {
        console.error(LOG, `Failed to update item ${item.id}:`, updateErr)
      }
    }

    // ── Agent timeout check (Layer 3) ──
    // If a narrative was requested > 72 hours ago and never completed, alert Rae
    // Only send ONE alert per opportunity per day (check if we already alerted today)
    // This must match what find_work actually hands to an agent, or it reports
    // people as unresponsive for work they were never offered.
    //
    // It previously matched on 'requested' plus 72 hours and nothing else,
    // while find_work also requires an open window and an open gate. The result
    // was a daily email to Rae naming vanessa and amara as overdue on drafts
    // the system was deliberately hiding from them. Five of the seven it listed
    // on 17 Aug belonged to a school that had declined grant work in August and
    // been archived; they had been "overdue" for 431 hours and would have gone
    // on forever.
    //
    // Archived is checked here too. find_work does not check it and excludes
    // archived pursuits only incidentally, because a declined school's gate is
    // usually shut. That is luck rather than logic, so it is closed properly in
    // the sync route as part of this change.
    // One more thing this never checked: whether the narrative was actually written.
    // On 24 Aug it reported vanessa overdue by 596 hours on Title II-A and IDEA/CEIS
    // for St. Peter Chanel. Both narratives existed, 5367 and 5185 characters, and
    // every record read waiting_on: 'tdi'. She had done the work and it was sitting
    // with us. An agent that produced 5000 characters has responded, whatever the
    // status field says. Status is workflow metadata; the narrative is the artifact.
    const MIN_NARRATIVE_CHARS = 200

    const { data: staleAgentWork } = await supabase
      .from('funding_opportunities')
      .select('id, name, pursuit_id, narrative_status, assigned_agent, updated_at, narrative_content, waiting_on')
      .eq('narrative_status', 'requested')
      .eq('window_status', 'open')
      .lt('updated_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())

    // Keep only work an agent can genuinely see: gate open, pursuit not archived.
    let agentVisible: typeof staleAgentWork = []
    const stalePursuitIds = [
      ...new Set((staleAgentWork ?? []).map(o => o.pursuit_id).filter(Boolean)),
    ]
    if (stalePursuitIds.length > 0) {
      const [gateRes, pursuitRes] = await Promise.all([
        supabase
          .from('pursuit_gate')
          .select('pursuit_id')
          .in('pursuit_id', stalePursuitIds)
          .eq('gate_open', true),
        supabase
          .from('funding_pursuits')
          .select('id, archived')
          .in('id', stalePursuitIds),
      ])
      const gateOpen = new Set((gateRes.data ?? []).map(g => g.pursuit_id))
      const live = new Set(
        (pursuitRes.data ?? []).filter(p => !p.archived).map(p => p.id),
      )
      agentVisible = (staleAgentWork ?? []).filter(
        o => gateOpen.has(o.pursuit_id) && live.has(o.pursuit_id),
      )
    }

    // The agent already delivered. Do not call this overdue.
    const delivered = agentVisible.filter(
      o => (o.narrative_content ?? '').trim().length >= MIN_NARRATIVE_CHARS,
    )
    agentVisible = agentVisible.filter(
      o => (o.narrative_content ?? '').trim().length < MIN_NARRATIVE_CHARS,
    )

    if (delivered.length > 0) {
      console.log(
        LOG,
        `[AGENT OVERDUE] ${delivered.length} narrative(s) suppressed: content already written. ` +
          delivered
            .map(
              o =>
                `${o.name} (${o.assigned_agent ?? 'unassigned'}, ` +
                `${(o.narrative_content ?? '').trim().length} chars, waiting_on=${o.waiting_on ?? 'unset'})`,
            )
            .join('; '),
      )
    }

    const hiddenFromAgents = (staleAgentWork ?? []).length - agentVisible.length - delivered.length
    if (hiddenFromAgents > 0) {
      console.log(
        LOG,
        `[AGENT OVERDUE] ${hiddenFromAgents} stale narrative(s) suppressed: ` +
          `not visible to any agent (gate shut, or pursuit archived)`,
      )
    }

    if (agentVisible.length > 0) {
      // Collect all overdue items into a single daily digest instead of individual emails
      const overdueItems: { name: string; schoolName: string; agentName: string; hoursAgo: number }[] = []

      for (const opp of agentVisible) {
        const { data: pursuit } = await supabase
          .from('funding_pursuits')
          .select('district_name')
          .eq('id', opp.pursuit_id)
          .single()

        const schoolName = pursuit?.district_name || 'Unknown school'
        const agentName = opp.assigned_agent || 'Unassigned'
        const hoursAgo = Math.round((Date.now() - new Date(opp.updated_at).getTime()) / (1000 * 60 * 60))

        console.warn(LOG, `AGENT OVERDUE: "${opp.name}" for ${schoolName} assigned to ${agentName}, requested ${hoursAgo}h ago`)
        overdueItems.push({ name: opp.name, schoolName, agentName, hoursAgo })
        summary.agentOverdue = (summary.agentOverdue || 0) + 1
      }

      // Send ONE daily digest email (only at the 9 AM CT / 14:00 UTC run)
      const currentHourUTC = new Date().getUTCHours()
      if (overdueItems.length > 0 && currentHourUTC === 14) {
        const itemRows = overdueItems.map(i =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;">${i.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;">${i.schoolName}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;">${i.agentName}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;">${i.hoursAgo}h</td></tr>`
        ).join('')

        const resendKey = process.env.RESEND_API_KEY
        if (resendKey && !DRY_RUN) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'TDI System <hello@teachersdeserveit.com>',
              to: 'rae@teachersdeserveit.com',
              subject: `[Agent Overdue] ${overdueItems.length} narrative${overdueItems.length > 1 ? 's' : ''} past deadline`,
              html: `<div style="font-family:sans-serif;max-width:600px;"><p>${overdueItems.length} narrative draft${overdueItems.length > 1 ? 's have' : ' has'} been requested for over 72 hours with no agent response.</p><table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;">Grant</th><th style="padding:8px 12px;text-align:left;">School</th><th style="padding:8px 12px;text-align:left;">Agent</th><th style="padding:8px 12px;text-align:left;">Overdue</th></tr></thead><tbody>${itemRows}</tbody></table><p style="margin-top:16px;color:#6b7280;font-size:13px;">This digest is sent once daily. Either re-trigger through Paperclip or draft manually.</p></div>`,
            }),
          }).catch(err => console.error('[funding-followup] non-blocking side effect failed:', err))
        }

        const slackWebhook = process.env.SLACK_WEBHOOK_INTERNAL
        if (slackWebhook) {
          await fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `Agent overdue daily digest: ${overdueItems.length} narratives past 72-hour deadline.\n${overdueItems.map(i => `  ${i.name} (${i.schoolName}) - ${i.agentName} - ${i.hoursAgo}h`).join('\n')}`,
            }),
          }).catch(err => console.error('[funding-followup] non-blocking side effect failed:', err))
        }
      }
    }

    console.log(LOG, 'Run complete:', JSON.stringify(summary))

    return NextResponse.json({ success: true, ...summary })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error(LOG, 'Fatal:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
