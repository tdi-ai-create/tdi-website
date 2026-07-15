import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// ══════════════════════════════════════════════════════════════
// DRY_RUN — flip to false ONLY after verifying logic against
// real data and confirming email templates with the team.
// While true: all sends are console.log'd and recorded in DB
// fields, but no actual emails leave the system.
// ══════════════════════════════════════════════════════════════
const DRY_RUN = true

// ══════════════════════════════════════════════════════════════
// SEND_ALLOWLIST — go-live safety rail (independent of DRY_RUN).
//
// Bella is onboarded. TDI staff can receive emails now.
// Client addresses still excluded until go-live (Day 3 of launch plan).
//
// To arm school contacts (go-live step):
//   'teri.gordonhernandez@pgcps.org',   // Allenwood
//   'sharonh.porter@pgcps.org',          // Allenwood backup
//   'ppoche@stpchanel.org',              // St. Peter Chanel
//   'jsuarez@d94.org',                   // WeGo
//   'zwemke@ogschool.com',               // Oak Grove
//   'dneukirch@d41.org',                 // Glen Ellyn
//   'mandy.johnson@gcafbcd.org',         // Go Christian
//   'doughang@saunemin.org',             // Saunemin
//
// Order of checks: DRY_RUN → WINDOW GATE → ALLOWLIST → send.
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
}

type LadderStep = { rung: Rung; email: string }

/**
 * Build the effective escalation ladder for an item, collapsing out
 * null emails and deduplicating so the same person is never notified
 * at two different rungs.
 */
function buildEffectiveLadder(
  gate: Gate | undefined,
  ownerEmail: string | null,
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

  tryAdd('submitter', gate?.submitter_email ?? ownerEmail)
  tryAdd('backup', gate?.backup_email)
  tryAdd('admin_sponsor', gate?.admin_sponsor_email)
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

// ── Tone routing: client (submitter/backup) vs internal (rae) ──

type EmailTone = 'client' | 'internal'

function toneForRung(rung: string): EmailTone {
  return rung === 'rae' ? 'internal' : 'client'
}

// ── Client-facing task label ──
// Strips internal verb prefixes so clients see natural language.
// If a client_label field exists on the item, use that instead.

function clientTaskLabel(rawTitle: string, clientLabel?: string | null): string {
  if (clientLabel) return clientLabel
  // Strip leading internal verbs: "Get X to send ...", "Confirm: ...", "Follow up on ...", "Track ..."
  const stripped = rawTitle
    .replace(/^(Get\s+\S+\s+to\s+)/i, '')
    .replace(/^(Confirm:\s*)/i, '')
    .replace(/^(Follow\s+up\s+(on|with)\s+\S+[:/]?\s*)/i, '')
    .replace(/^(Track\s+)/i, '')
    .trim()
  // If stripping left something meaningful, use it; otherwise fall back gracefully
  return stripped.length > 5 ? stripped : 'this funding step'
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
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn(LOG, 'RESEND_API_KEY not set — skipping send')
    return false
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
  }

  return res.ok
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
      dry_run_skipped: 0,
      window_skipped: 0,
      allowlist_skipped: 0,
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
          .select('pursuit_id, submitter_email, submitter_name, backup_email, backup_name, admin_sponsor_email, admin_sponsor_name')
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
    }

    const { data: pursuits } = pursuitIds.length > 0
      ? await supabase
          .from('funding_pursuits')
          .select('id, next_action_owner_email, pursuit_name, district_name')
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

      const dueDate = new Date(item.due_date + 'T00:00:00')
      const actionSize: string = item.action_size || 'standard'
      const leadBizDays = LEAD_WINDOWS[actionSize] ?? LEAD_WINDOWS.standard
      const leadStartDate = subtractBizDays(dueDate, leadBizDays)

      const pursuit = pursuitById.get(item.pursuit_id)
      const ownerEmail =
        item.owner_email ??
        pursuit?.next_action_owner_email ??
        null
      const schoolName =
        pursuit?.pursuit_name ?? pursuit?.district_name ?? 'your school'
      const ownerFirstName = (item.owner_name ?? '').split(' ')[0] || 'there'

      const gate = gateByPursuit.get(item.pursuit_id)
      const effectiveLadder = buildEffectiveLadder(gate, ownerEmail)

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
        } else if (targetEmail && ALLOWLIST_ENABLED && !isOnAllowlist(targetEmail)) {
          console.log(LOG, `[ALLOWLIST] Skipped ${targetEmail} — not on allowlist`)
          summary.allowlist_skipped++
        } else if (targetEmail) {
          await sendFollowUpEmail({
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
          })
          summary.sent++
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

        // Nudge: at most once per calendar day
        const lastNudge = item.last_nudge_sent_at
          ? new Date(item.last_nudge_sent_at)
          : null
        const nudgedToday =
          lastNudge !== null &&
          lastNudge.toDateString() === today.toDateString()

        if (!nudgedToday) {
          updates.nudge_count = (item.nudge_count ?? 0) + 1
          updates.last_nudge_sent_at = now.toISOString()
          summary.nudges_fired++

          const targetEmail = ownerEmail ?? undefined

          if (DRY_RUN) {
            console.log(LOG, `[DRY RUN] Would send nudge to ${targetEmail} for overdue "${item.title}"`)
            summary.dry_run_skipped++
          } else if (targetEmail && ALLOWLIST_ENABLED && !isOnAllowlist(targetEmail)) {
            console.log(LOG, `[ALLOWLIST] Skipped ${targetEmail} — not on allowlist`)
            summary.allowlist_skipped++
          } else if (targetEmail) {
            await sendFollowUpEmail({
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
            })
            summary.sent++
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
            updates.escalation_rung = nextStep.rung
            updates.last_escalated_at = now.toISOString()

            summary.escalations_advanced++

            const nextNextStep = effectiveLadder[1] ?? null
            if (DRY_RUN) {
              console.log(
                LOG,
                `[DRY RUN] Would escalate "${item.title}" → ${nextStep.rung} (${nextStep.email}), ` +
                  `${bizDaysOverdue} biz days overdue, window=${windowSize}`,
              )
              summary.dry_run_skipped++
            } else if (ALLOWLIST_ENABLED && !isOnAllowlist(nextStep.email)) {
              console.log(LOG, `[ALLOWLIST] Skipped ${nextStep.email} — not on allowlist`)
              summary.allowlist_skipped++
            } else {
              await sendFollowUpEmail({
                to: nextStep.email,
                itemTitle: item.title,
                dueDate: item.due_date,
                bizDaysOverdue,
                rungLabel: nextStep.rung,
                type: 'escalation',
                tone: toneForRung(nextStep.rung),
                contactName: resolveContactName(nextStep, gate, item, ownerFirstName),
                schoolName,
                clientLabel: item.client_label,
                submitterName: item.owner_name ?? ownerEmail ?? 'unknown',
                nextRung: nextNextStep?.rung ?? 'none',
              })
              summary.sent++
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
                updates.escalation_rung = nextStep.rung
                updates.last_escalated_at = now.toISOString()

                summary.escalations_advanced++

                const advNextStep = findNextStep(effectiveLadder, nextStep.rung)
                if (DRY_RUN) {
                  console.log(
                    LOG,
                    `[DRY RUN] Would escalate "${item.title}" ${currentRung} → ${nextStep.rung} ` +
                      `(${nextStep.email}), ${bizDaysSinceEscalation} biz days since last escalation, ` +
                      `window=${windowSize}`,
                  )
                  summary.dry_run_skipped++
                } else if (ALLOWLIST_ENABLED && !isOnAllowlist(nextStep.email)) {
                  console.log(LOG, `[ALLOWLIST] Skipped ${nextStep.email} — not on allowlist`)
                  summary.allowlist_skipped++
                } else {
                  await sendFollowUpEmail({
                    to: nextStep.email,
                    itemTitle: item.title,
                    dueDate: item.due_date,
                    bizDaysOverdue,
                    rungLabel: nextStep.rung,
                    type: 'escalation',
                    tone: toneForRung(nextStep.rung),
                    contactName: resolveContactName(nextStep, gate, item, ownerFirstName),
                    schoolName,
                    clientLabel: item.client_label,
                    submitterName: item.owner_name ?? ownerEmail ?? 'unknown',
                    nextRung: advNextStep?.rung ?? 'none',
                  })
                  summary.sent++
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

    console.log(LOG, 'Run complete:', JSON.stringify(summary))

    return NextResponse.json({ success: true, ...summary })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error(LOG, 'Fatal:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
