/**
 * Simulates 3 consecutive engine runs for a single overdue Allenwood item,
 * proving the escalation ladder climbs submitter → backup → rae across
 * non-response windows.
 *
 * Pure in-memory simulation — no DB writes, no emails.
 * Fetches the real item + gate once, then clones and advances in memory.
 *
 * Usage: node scripts/sim-escalation-climb.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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

// ── Engine logic (copied from route.ts) ──

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

function addBizDays(date, days) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  let remaining = days
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
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

function displayRung(rung) {
  if (rung === 'rae') return 'Rae'
  if (rung === 'admin_sponsor') return 'Admin Sponsor'
  return rung.charAt(0).toUpperCase() + rung.slice(1)
}

// ── Main simulation ──

async function main() {
  const ITEM_ID = '2f8abbe3-1395-4b83-8ab6-8091dfc2ed8d'

  // Fetch real item
  const { data: item, error: itemErr } = await supabase
    .from('funding_action_items')
    .select('*')
    .eq('id', ITEM_ID)
    .single()

  if (itemErr || !item) {
    console.error('Could not fetch item:', itemErr)
    process.exit(1)
  }

  // Fetch real gate
  const { data: gates } = await supabase
    .from('pursuit_gate')
    .select('pursuit_id, submitter_email, submitter_name, backup_email, backup_name, admin_sponsor_email, admin_sponsor_name')
    .eq('pursuit_id', item.pursuit_id)

  const gate = gates?.[0] ?? null

  // Fetch pursuit for school name
  const { data: pursuit } = await supabase
    .from('funding_pursuits')
    .select('id, pursuit_name, district_name')
    .eq('id', item.pursuit_id)
    .single()

  const schoolName = pursuit?.pursuit_name ?? pursuit?.district_name ?? 'unknown'
  const effectiveLadder = buildEffectiveLadder(gate, item.owner_email)

  // Compute runway + window
  const dueDate = new Date(item.due_date + 'T00:00:00')
  const createdAt = item.created_at ? new Date(item.created_at) : dueDate
  const rawRunway = Math.round((dueDate.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const runwayCalDays = Math.max(7, rawRunway)
  const windowSize = escalationWindow(runwayCalDays)

  console.log('\n══════════════════════════════════════════════════')
  console.log('  ESCALATION LADDER SIMULATION (in-memory only)')
  console.log('══════════════════════════════════════════════════')
  console.log(`  Item:       "${item.title}"`)
  console.log(`  Client label: "${item.client_label ?? '(none)'}"`)
  console.log(`  Due date:   ${item.due_date}`)
  console.log(`  Owner:      ${item.owner_name} (${item.owner_email})`)
  console.log(`  School:     ${schoolName}`)
  console.log(`  Runway:     ${runwayCalDays} cal days (raw ${rawRunway}, floored to 7)`)
  console.log(`  Window:     ${windowSize} business days per rung`)
  console.log(`  Ladder:     ${effectiveLadder.map(s => `${displayRung(s.rung)} (${s.email})`).join(' → ')}`)
  console.log(`  Status:     ${item.status}`)
  console.log('──────────────────────────────────────────────────\n')

  // Clone item state for simulation
  let simRung = 'none'
  let simLastEscalatedAt = null

  // Determine the simulation start: the first business day after due_date
  const simStart = addBizDays(dueDate, 1)

  for (let run = 1; run <= 3; run++) {
    // Compute the simulated "today" for this run:
    //   Run 1: 1 biz day after due (first overdue biz day)
    //   Run 2: 1 + windowSize biz days after due (one full window since Run 1)
    //   Run 3: 1 + 2*windowSize biz days after due (one full window since Run 2)
    const simToday = addBizDays(dueDate, 1 + (run - 1) * windowSize)
    simToday.setHours(0, 0, 0, 0)

    const bizDaysOverdue = bizDaysBetween(dueDate, simToday)

    console.log(`── Run ${run} ─────────────────────────────────`)
    console.log(`  Simulated date:   ${simToday.toISOString().slice(0, 10)} (${simToday.toLocaleDateString('en-US', { weekday: 'long' })})`)
    console.log(`  Biz days overdue: ${bizDaysOverdue}`)
    console.log(`  Current rung:     ${displayRung(simRung)}`)
    console.log(`  Last escalated:   ${simLastEscalatedAt ? simLastEscalatedAt.toISOString().slice(0, 10) : '(never)'}`)

    // Run the escalation logic
    if (simRung === 'none') {
      // First overdue — escalate to first rung
      const nextStep = effectiveLadder[0]
      if (nextStep) {
        simRung = nextStep.rung
        simLastEscalatedAt = simToday
        console.log(`  ACTION:           Escalate none → ${displayRung(nextStep.rung)}`)
        console.log(`  Recipient:        ${nextStep.email}`)
        if (gate) {
          const name = nextStep.rung === 'submitter' ? (gate.submitter_name ?? item.owner_name)
            : nextStep.rung === 'backup' ? gate.backup_name
            : nextStep.rung === 'admin_sponsor' ? gate.admin_sponsor_name
            : 'Rae'
          console.log(`  Contact name:     ${name}`)
        }
      }
    } else {
      // Check non-response window
      if (simLastEscalatedAt) {
        const bizDaysSince = bizDaysBetween(simLastEscalatedAt, simToday)
        console.log(`  Biz days since last escalation: ${bizDaysSince} (window = ${windowSize})`)

        if (bizDaysSince >= windowSize) {
          const nextStep = findNextStep(effectiveLadder, simRung)
          if (nextStep) {
            const prevRung = simRung
            simRung = nextStep.rung
            simLastEscalatedAt = simToday
            console.log(`  ACTION:           Escalate ${displayRung(prevRung)} → ${displayRung(nextStep.rung)} (non-response)`)
            console.log(`  Recipient:        ${nextStep.email}`)
            if (gate) {
              const name = nextStep.rung === 'submitter' ? (gate.submitter_name ?? item.owner_name)
                : nextStep.rung === 'backup' ? gate.backup_name
                : nextStep.rung === 'admin_sponsor' ? gate.admin_sponsor_name
                : 'Rae'
              console.log(`  Contact name:     ${name}`)
            }
          } else {
            console.log(`  ACTION:           Already at final rung — no further escalation`)
          }
        } else {
          console.log(`  ACTION:           Waiting — window not elapsed yet`)
        }
      }
    }

    console.log(`  Rung after run:   ${displayRung(simRung)}`)
    console.log()
  }

  console.log('══════════════════════════════════════════════════')
  console.log('  RESULT: ' + (simRung === 'rae'
    ? 'Ladder climbed to Rae as expected.'
    : `Ladder at ${displayRung(simRung)} — may need more runs to reach Rae.`))
  console.log('  No DB writes. No emails. Pure simulation.')
  console.log('══════════════════════════════════════════════════\n')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
