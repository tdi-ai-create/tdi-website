/**
 * Standalone dry-run test for the funding-followup cron logic.
 * Reads .env.local, runs the same logic as the route handler, prints JSON summary.
 * READ-ONLY — no DB writes, no emails.
 * Usage: node scripts/test-funding-followup.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const DRY_RUN = true

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

// Load .env.local manually
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Constants ──

const LEAD_WINDOWS = { light: 2, standard: 3, heavy: 5 }
const RUNG_ORDER = ['none', 'submitter', 'backup', 'admin_sponsor', 'rae']

function rungIndex(rung) {
  const idx = RUNG_ORDER.indexOf(rung ?? 'none')
  return idx === -1 ? 0 : idx
}

function bizDaysBetween(from, to) {
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

function subtractBizDays(date, bizDays) {
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

function escalationWindow(runwayCalDays) {
  if (runwayCalDays > 14) return 5
  if (runwayCalDays >= 7) return 3
  return 1
}

// ── Effective ladder (deduped, nulls collapsed) ──

function buildEffectiveLadder(gate, ownerEmail) {
  const steps = []
  const seen = new Set()

  const tryAdd = (rung, email) => {
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

function findNextStep(ladder, currentRung) {
  if (currentRung === 'none') return ladder[0] ?? null

  const currentOrdinal = rungIndex(currentRung)
  const currentIdx = ladder.findIndex(s => s.rung === currentRung)
  if (currentIdx !== -1) return ladder[currentIdx + 1] ?? null

  // Current rung was collapsed out — find the next higher
  return ladder.find(s => rungIndex(s.rung) > currentOrdinal) ?? null
}

// ── Main ──

async function main() {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  console.log(`\n=== Funding Follow-Up Dry Run ===`)
  console.log(`DRY_RUN: ${DRY_RUN}`)
  console.log(`Today: ${today.toISOString().slice(0, 10)} (${today.toLocaleDateString('en-US', { weekday: 'long' })})\n`)

  const summary = {
    items_processed: 0,
    colors: { green: 0, yellow: 0, red: 0 },
    reminders_fired: 0,
    nudges_fired: 0,
    escalations_advanced: 0,
    dry_run: DRY_RUN,
    details: [],
  }

  // 1. Fetch pending items
  const { data: items, error: itemsErr } = await supabase
    .from('funding_action_items')
    .select('*')
    .eq('status', 'pending')

  if (itemsErr) {
    console.error('Failed to fetch action items:', itemsErr)
    process.exit(1)
  }

  console.log(`Found ${items?.length ?? 0} pending action items\n`)

  if (!items || items.length === 0) {
    console.log(JSON.stringify({ success: true, message: 'No pending items', ...summary }, null, 2))
    return
  }

  // 2. Batch-fetch pursuit gates
  const pursuitIds = Array.from(new Set(items.map(i => i.pursuit_id).filter(Boolean)))

  const { data: gates, error: gatesErr } = pursuitIds.length > 0
    ? await supabase
        .from('pursuit_gate')
        .select('pursuit_id, submitter_email, backup_email, admin_sponsor_email')
        .in('pursuit_id', pursuitIds)
    : { data: [], error: null }

  if (gatesErr) {
    console.warn('Warning: Could not fetch pursuit_gate:', gatesErr.message)
    console.warn('(Table may not exist yet — escalation contacts will be null)\n')
  }

  const gateByPursuit = new Map((gates ?? []).map(g => [g.pursuit_id, g]))
  console.log(`Loaded ${gates?.length ?? 0} pursuit gates`)

  // 3. Batch-fetch pursuits
  const { data: pursuits } = pursuitIds.length > 0
    ? await supabase
        .from('funding_pursuits')
        .select('id, next_action_owner_email')
        .in('id', pursuitIds)
    : { data: [] }

  const pursuitById = new Map((pursuits ?? []).map(p => [p.id, p]))
  console.log(`Loaded ${pursuits?.length ?? 0} pursuits\n`)

  // 4. Process (READ-ONLY)
  for (const item of items) {
    summary.items_processed++

    if (!item.due_date) continue

    const dueDate = new Date(item.due_date + 'T00:00:00')
    const actionSize = item.action_size || 'standard'
    const leadBizDays = LEAD_WINDOWS[actionSize] ?? LEAD_WINDOWS.standard
    const leadStartDate = subtractBizDays(dueDate, leadBizDays)

    const ownerEmail =
      item.owner_email ??
      pursuitById.get(item.pursuit_id)?.next_action_owner_email ??
      null

    const gate = gateByPursuit.get(item.pursuit_id)
    const effectiveLadder = buildEffectiveLadder(gate, ownerEmail)

    // Color
    let color
    if (dueDate.getTime() < today.getTime()) {
      color = 'red'
    } else if (today >= leadStartDate) {
      color = 'yellow'
    } else {
      color = 'green'
    }

    summary.colors[color]++

    // Reminders
    if (color === 'yellow' && !item.reminder_first_at) {
      summary.reminders_fired++
      summary.details.push({
        item_id: item.id,
        pursuit_id: item.pursuit_id,
        title: item.title,
        owner_email: ownerEmail,
        color,
        due_date: item.due_date,
        action: 'first_reminder',
        target_email: ownerEmail ?? undefined,
      })
    }

    if (color === 'red') {
      const bizDaysOverdue = bizDaysBetween(dueDate, today)

      // Nudge
      const lastNudge = item.last_nudge_sent_at ? new Date(item.last_nudge_sent_at) : null
      const nudgedToday = lastNudge !== null && lastNudge.toDateString() === today.toDateString()

      if (!nudgedToday) {
        summary.nudges_fired++
        summary.details.push({
          item_id: item.id,
          pursuit_id: item.pursuit_id,
          title: item.title,
          owner_email: ownerEmail,
          color,
          due_date: item.due_date,
          action: 'nudge',
          target_email: ownerEmail ?? undefined,
          biz_days_overdue: bizDaysOverdue,
        })
      }

      // Escalation (non-response based)
      const createdAt = item.created_at ? new Date(item.created_at) : dueDate
      const rawRunway = Math.round((dueDate.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
      const runwayCalDays = Math.max(7, rawRunway)
      const windowSize = escalationWindow(runwayCalDays)

      const currentRung = item.escalation_rung ?? 'none'

      if (currentRung === 'none') {
        // First overdue — escalate to first rung
        const nextStep = effectiveLadder[0]
        if (nextStep) {
          summary.escalations_advanced++
          summary.details.push({
            item_id: item.id,
            pursuit_id: item.pursuit_id,
            title: item.title,
            owner_email: ownerEmail,
            color,
            due_date: item.due_date,
            action: `escalate_to_${nextStep.rung}`,
            target_email: nextStep.email,
            escalation_rung: nextStep.rung,
            current_rung: currentRung,
            biz_days_overdue: bizDaysOverdue,
            window_size: windowSize,
            effective_ladder: effectiveLadder.map(s => `${s.rung}:${s.email}`),
          })
        }
      } else {
        // Already at a rung — check non-response window
        const lastEscalatedAt = item.last_escalated_at ? new Date(item.last_escalated_at) : null

        if (!lastEscalatedAt) {
          // Legacy: would seed last_escalated_at, no advance yet
          summary.details.push({
            item_id: item.id,
            pursuit_id: item.pursuit_id,
            title: item.title,
            owner_email: ownerEmail,
            color,
            due_date: item.due_date,
            action: 'seed_last_escalated_at',
            escalation_rung: currentRung,
            biz_days_overdue: bizDaysOverdue,
          })
        } else {
          const bizDaysSinceEscalation = bizDaysBetween(lastEscalatedAt, today)

          if (bizDaysSinceEscalation >= windowSize) {
            const nextStep = findNextStep(effectiveLadder, currentRung)
            if (nextStep) {
              summary.escalations_advanced++
              summary.details.push({
                item_id: item.id,
                pursuit_id: item.pursuit_id,
                title: item.title,
                owner_email: ownerEmail,
                color,
                due_date: item.due_date,
                action: `escalate_${currentRung}_to_${nextStep.rung}`,
                target_email: nextStep.email,
                escalation_rung: nextStep.rung,
                current_rung: currentRung,
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
  }

  console.log('=== FULL SUMMARY (read-only, no DB writes) ===\n')
  console.log(JSON.stringify({ success: true, ...summary }, null, 2))
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
