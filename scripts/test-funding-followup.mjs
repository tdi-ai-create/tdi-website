/**
 * Standalone dry-run test for the funding-followup cron logic.
 * Mirrors route.ts: DRY_RUN + WINDOW GATE + ALLOWLIST safety layers.
 * READ-ONLY — no DB writes, no emails.
 * Usage: node scripts/test-funding-followup.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const DRY_RUN = true
const ALLOWLIST_ENABLED = true
const SEND_ALLOWLIST = [
  'teri.gordonhernandez@pgcps.org',
  'sharonh.porter@pgcps.org',
  'rae@teachersdeserveit.com',
]

function isOnAllowlist(email) {
  return SEND_ALLOWLIST.some(a => a.toLowerCase() === email.toLowerCase())
}

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile(path) {
  let content
  try { content = readFileSync(path, 'utf-8') } catch { return }
  for (const line of content.split('\n')) {
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
}

loadEnvFile(resolve(__dirname, '..', '.env.local'))
loadEnvFile(resolve(__dirname, '..', '.env.vercel'))

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
  return ladder.find(s => rungIndex(s.rung) > currentOrdinal) ?? null
}

function clientTaskLabel(rawTitle, clientLabel) {
  if (clientLabel) return clientLabel
  const stripped = rawTitle
    .replace(/^(Get\s+\S+\s+to\s+)/i, '')
    .replace(/^(Confirm:\s*)/i, '')
    .replace(/^(Follow\s+up\s+(on|with)\s+\S+[:/]?\s*)/i, '')
    .replace(/^(Track\s+)/i, '')
    .trim()
  return stripped.length > 5 ? stripped : 'this funding step'
}

// ── Main ──

async function main() {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  console.log(`\n=== Funding Follow-Up Dry Run ===`)
  console.log(`DRY_RUN: ${DRY_RUN}`)
  console.log(`ALLOWLIST_ENABLED: ${ALLOWLIST_ENABLED}`)
  console.log(`SEND_ALLOWLIST: ${SEND_ALLOWLIST.join(', ')}`)
  console.log(`Today: ${today.toISOString().slice(0, 10)} (${today.toLocaleDateString('en-US', { weekday: 'long' })})\n`)

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
    details: [],
  }

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

  const pursuitIds = Array.from(new Set(items.map(i => i.pursuit_id).filter(Boolean)))

  const { data: gates, error: gatesErr } = pursuitIds.length > 0
    ? await supabase
        .from('pursuit_gate')
        .select('pursuit_id, submitter_email, submitter_name, backup_email, backup_name, admin_sponsor_email, admin_sponsor_name')
        .in('pursuit_id', pursuitIds)
    : { data: [], error: null }

  if (gatesErr) console.warn('Warning: Could not fetch pursuit_gate:', gatesErr.message)
  const gateByPursuit = new Map((gates ?? []).map(g => [g.pursuit_id, g]))
  console.log(`Loaded ${gates?.length ?? 0} pursuit gates`)

  const { data: pursuits } = pursuitIds.length > 0
    ? await supabase
        .from('funding_pursuits')
        .select('id, next_action_owner_email, pursuit_name, district_name')
        .in('id', pursuitIds)
    : { data: [] }
  const pursuitById = new Map((pursuits ?? []).map(p => [p.id, p]))
  console.log(`Loaded ${pursuits?.length ?? 0} pursuits`)

  // Fetch funding opportunities for window gate
  const { data: opportunities } = pursuitIds.length > 0
    ? await supabase
        .from('funding_opportunities')
        .select('id, pursuit_id, window_status, window_closes')
        .in('pursuit_id', pursuitIds)
    : { data: [] }

  const oppById = new Map((opportunities ?? []).map(o => [o.id, o]))
  const oppsByPursuit = new Map()
  for (const o of opportunities ?? []) {
    const list = oppsByPursuit.get(o.pursuit_id) ?? []
    list.push(o)
    oppsByPursuit.set(o.pursuit_id, list)
  }
  console.log(`Loaded ${opportunities?.length ?? 0} funding opportunities\n`)

  function checkWindowGate(actionItem, currentDate) {
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
    const pursuitOpps = oppsByPursuit.get(actionItem.pursuit_id) ?? []
    if (pursuitOpps.length === 0) return { open: false, status: 'unknown', closes: null }
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
    const firstStatus = pursuitOpps[0].window_status ?? 'unknown'
    return { open: false, status: firstStatus, closes: pursuitOpps[0].window_closes }
  }

  for (const item of items) {
    summary.items_processed++
    if (!item.due_date) continue

    const dueDate = new Date(item.due_date + 'T00:00:00')
    const actionSize = item.action_size || 'standard'
    const leadBizDays = LEAD_WINDOWS[actionSize] ?? LEAD_WINDOWS.standard
    const leadStartDate = subtractBizDays(dueDate, leadBizDays)

    const pursuit = pursuitById.get(item.pursuit_id)
    const ownerEmail = item.owner_email ?? pursuit?.next_action_owner_email ?? null
    const schoolName = pursuit?.pursuit_name ?? pursuit?.district_name ?? 'your school'
    const gate = gateByPursuit.get(item.pursuit_id)
    const effectiveLadder = buildEffectiveLadder(gate, ownerEmail)
    const friendlyTask = clientTaskLabel(item.title, item.client_label)

    let color
    if (dueDate.getTime() < today.getTime()) {
      color = 'red'
    } else if (today >= leadStartDate) {
      color = 'yellow'
    } else {
      color = 'green'
    }

    summary.colors[color]++

    // ── WINDOW GATE ──
    const windowCheck = checkWindowGate(item, today)
    if (!windowCheck.open) {
      summary.window_skipped++
      summary.details.push({
        item_id: item.id,
        title: item.title,
        client_label: friendlyTask,
        owner_email: ownerEmail,
        color,
        due_date: item.due_date,
        action: 'window_skipped',
        window_status: windowCheck.status,
        window_closes: windowCheck.closes,
      })
      continue
    }

    // (Remainder of reminder/nudge/escalation logic would go here,
    //  but window gate will block everything in this test run.)
    // Including the full logic for completeness:

    if (color === 'yellow' && !item.reminder_first_at) {
      summary.reminders_fired++
      summary.dry_run_skipped++
      summary.details.push({
        item_id: item.id, title: item.title, client_label: friendlyTask,
        color, action: 'first_reminder', send_outcome: 'dry_run_skipped',
        on_allowlist: ownerEmail ? isOnAllowlist(ownerEmail) : false,
      })
    }

    if (color === 'red') {
      const bizDaysOverdue = bizDaysBetween(dueDate, today)
      const lastNudge = item.last_nudge_sent_at ? new Date(item.last_nudge_sent_at) : null
      const nudgedToday = lastNudge !== null && lastNudge.toDateString() === today.toDateString()

      if (!nudgedToday) {
        summary.nudges_fired++
        summary.dry_run_skipped++
        summary.details.push({
          item_id: item.id, title: item.title, client_label: friendlyTask,
          color, due_date: item.due_date, action: 'nudge',
          target_email: ownerEmail, biz_days_overdue: bizDaysOverdue,
          send_outcome: 'dry_run_skipped',
          on_allowlist: ownerEmail ? isOnAllowlist(ownerEmail) : false,
        })
      }

      const createdAt = item.created_at ? new Date(item.created_at) : dueDate
      const rawRunway = Math.round((dueDate.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
      const runwayCalDays = Math.max(7, rawRunway)
      const windowSize = escalationWindow(runwayCalDays)
      const currentRung = item.escalation_rung ?? 'none'

      if (currentRung === 'none') {
        const nextStep = effectiveLadder[0]
        if (nextStep) {
          summary.escalations_advanced++
          summary.dry_run_skipped++
          summary.details.push({
            item_id: item.id, title: item.title, client_label: friendlyTask,
            color, due_date: item.due_date,
            action: `escalate_to_${nextStep.rung}`,
            target_email: nextStep.email,
            biz_days_overdue: bizDaysOverdue,
            send_outcome: 'dry_run_skipped',
            on_allowlist: isOnAllowlist(nextStep.email),
          })
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
