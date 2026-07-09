import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// ══════════════════════════════════════════════════════════════
// DRY_RUN — flip to false ONLY after verifying logic against
// real data and confirming email templates with the team.
// While true: all sends are console.log'd and recorded in DB
// fields, but no actual emails leave the system.
// ══════════════════════════════════════════════════════════════
const DRY_RUN = true

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
  backup_email: string | null
  admin_sponsor_email: string | null
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

// ── Email sending (wired but gated by DRY_RUN) ──

async function sendFollowUpEmail(params: {
  to: string
  itemTitle: string
  dueDate: string
  bizDaysOverdue: number
  rungLabel: string
  type: 'reminder' | 'nudge' | 'escalation'
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn(LOG, 'RESEND_API_KEY not set — skipping send')
    return false
  }

  const { to, itemTitle, dueDate, bizDaysOverdue, rungLabel, type } = params

  const subject =
    type === 'reminder'
      ? `Upcoming: "${itemTitle}" is due ${dueDate}`
      : type === 'nudge'
        ? `Overdue: "${itemTitle}" was due ${dueDate} (${bizDaysOverdue} business days ago)`
        : `Escalation: "${itemTitle}" needs attention — ${bizDaysOverdue} business days overdue`

  const urgencyColor =
    type === 'escalation' ? '#DC2626' : type === 'nudge' ? '#D97706' : '#2563EB'
  const urgencyLabel =
    type === 'escalation' ? 'ESCALATED' : type === 'nudge' ? 'OVERDUE' : 'UPCOMING'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
      <div style="background: ${urgencyColor}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
        ${urgencyLabel}
      </div>
      <h2 style="color: #1e2749; font-size: 18px; margin: 0 0 8px;">${itemTitle}</h2>
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">
        Due: <strong>${dueDate}</strong>${bizDaysOverdue > 0 ? ` — ${bizDaysOverdue} business days overdue` : ''}
      </p>
      ${type === 'escalation' ? `<p style="color: #374151; font-size: 14px; line-height: 1.6;">This action item has been escalated to you (${rungLabel}) because the previous contact hasn't responded within the expected window. Please take action or reply to let us know the status.</p>` : ''}
      ${type === 'nudge' ? `<p style="color: #374151; font-size: 14px; line-height: 1.6;">This action item is past its due date. Please complete it or reply with an update so we can adjust the timeline.</p>` : ''}
      ${type === 'reminder' ? `<p style="color: #374151; font-size: 14px; line-height: 1.6;">Heads up — this action item is coming due soon. Please make sure it's on track.</p>` : ''}
      <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
        TDI Funding Follow-Up System
      </p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TDI Funding <noreply@teachersdeserveit.com>',
      to: [to],
      bcc: ['rae@teachersdeserveit.com'],
      subject,
      html,
    }),
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
      dry_run: DRY_RUN,
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
          .select('pursuit_id, submitter_email, backup_email, admin_sponsor_email')
          .in('pursuit_id', pursuitIds)
      : { data: [] as Gate[] }

    const gateByPursuit = new Map<string, Gate>(
      (gates ?? []).map((g: Gate) => [g.pursuit_id, g]),
    )

    // ── 3. Batch-fetch pursuits for owner email ──

    type Pursuit = { id: string; next_action_owner_email: string | null }

    const { data: pursuits } = pursuitIds.length > 0
      ? await supabase
          .from('funding_pursuits')
          .select('id, next_action_owner_email')
          .in('id', pursuitIds)
      : { data: [] as Pursuit[] }

    const pursuitById = new Map<string, Pursuit>(
      (pursuits ?? []).map((p: Pursuit) => [p.id, p]),
    )

    // ── 4. Process each item ──

    for (const item of items) {
      summary.items_processed++

      if (!item.due_date) continue

      const dueDate = new Date(item.due_date + 'T00:00:00')
      const actionSize: string = item.action_size || 'standard'
      const leadBizDays = LEAD_WINDOWS[actionSize] ?? LEAD_WINDOWS.standard
      const leadStartDate = subtractBizDays(dueDate, leadBizDays)

      const ownerEmail =
        item.owner_email ??
        pursuitById.get(item.pursuit_id)?.next_action_owner_email ??
        null

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

      // ── REMINDERS (entering lead window, not yet reminded) ──

      if (color === 'yellow' && !item.reminder_first_at) {
        updates.reminder_first_at = now.toISOString()
        updates.reminder_count = (item.reminder_count ?? 0) + 1

        summary.reminders_fired++

        const targetEmail = ownerEmail ?? undefined
        const dueDateStr = item.due_date

        if (DRY_RUN) {
          console.log(LOG, `[DRY RUN] Would send reminder to ${targetEmail} for "${item.title}" (due ${dueDateStr})`)
        } else if (targetEmail) {
          await sendFollowUpEmail({
            to: targetEmail,
            itemTitle: item.title,
            dueDate: dueDateStr,
            bizDaysOverdue: 0,
            rungLabel: 'owner',
            type: 'reminder',
          })
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
          } else if (targetEmail) {
            await sendFollowUpEmail({
              to: targetEmail,
              itemTitle: item.title,
              dueDate: item.due_date,
              bizDaysOverdue,
              rungLabel: 'owner',
              type: 'nudge',
            })
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

            if (DRY_RUN) {
              console.log(
                LOG,
                `[DRY RUN] Would escalate "${item.title}" → ${nextStep.rung} (${nextStep.email}), ` +
                  `${bizDaysOverdue} biz days overdue, window=${windowSize}`,
              )
            } else {
              await sendFollowUpEmail({
                to: nextStep.email,
                itemTitle: item.title,
                dueDate: item.due_date,
                bizDaysOverdue,
                rungLabel: nextStep.rung,
                type: 'escalation',
              })
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

                if (DRY_RUN) {
                  console.log(
                    LOG,
                    `[DRY RUN] Would escalate "${item.title}" ${currentRung} → ${nextStep.rung} ` +
                      `(${nextStep.email}), ${bizDaysSinceEscalation} biz days since last escalation, ` +
                      `window=${windowSize}`,
                  )
                } else {
                  await sendFollowUpEmail({
                    to: nextStep.email,
                    itemTitle: item.title,
                    dueDate: item.due_date,
                    bizDaysOverdue,
                    rungLabel: nextStep.rung,
                    type: 'escalation',
                  })
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
