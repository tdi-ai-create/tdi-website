/**
 * Threshold checks for the recruitment action queue.
 *
 * The queue decides what Bella sees as owed work, so the day boundaries matter.
 * Run: npx tsx scripts/test-recruitment-queue.ts
 */
import { buildActionQueue, summarizeGoals, type CandidateRow } from '../lib/recruitment-goals'

const NOW = new Date('2026-08-13T12:00:00Z').getTime()
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString()

function row(over: Partial<CandidateRow>): CandidateRow {
  return {
    id: over.id || 'id',
    name: over.name || 'Test Person',
    stage: over.stage || 'suggested',
    created_at: over.created_at || daysAgo(0),
    updated_at: over.updated_at ?? null,
    outreach_sent_at: over.outreach_sent_at ?? null,
    outreach_follow_up_1_at: over.outreach_follow_up_1_at ?? null,
    outreach_follow_up_2_at: over.outreach_follow_up_2_at ?? null,
    revisit_date: over.revisit_date ?? null,
  }
}

let failures = 0
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`)
}

const reasons = (rows: CandidateRow[]) => buildActionQueue(rows, NOW).map(i => i.reason)

// Outreach sent, before and after each threshold.
check('4 days after outreach is not yet due',
  reasons([row({ stage: 'outreach_sent', outreach_sent_at: daysAgo(4) })]), [])
check('5 days triggers the first follow up',
  reasons([row({ stage: 'outreach_sent', outreach_sent_at: daysAgo(5) })]), ['follow_up_1'])
check('first follow up already logged does not repeat',
  reasons([row({ stage: 'outreach_sent', outreach_sent_at: daysAgo(6), outreach_follow_up_1_at: daysAgo(1) })]), [])
check('12 days triggers the second follow up',
  reasons([row({ stage: 'outreach_sent', outreach_sent_at: daysAgo(12), outreach_follow_up_1_at: daysAgo(7) })]), ['follow_up_2'])
check('19 days asks Bella to close it out',
  reasons([row({ stage: 'outreach_sent', outreach_sent_at: daysAgo(19), outreach_follow_up_1_at: daysAgo(14), outreach_follow_up_2_at: daysAgo(7) })]), ['decide_no_response'])

// Other stages.
check('suggested always needs a decision',
  reasons([row({ stage: 'suggested' })]), ['approve_outreach'])
check('approved but unsent is the most urgent thing',
  reasons([row({ stage: 'outreach_approved', updated_at: daysAgo(2) })]), ['send_outreach'])
check('revisit in the future stays quiet',
  reasons([row({ stage: 'revisit', revisit_date: daysAgo(-3) })]), [])
check('revisit in the past surfaces',
  reasons([row({ stage: 'revisit', revisit_date: daysAgo(1) })]), ['revisit_due'])
check('mid pipeline stage untouched for 10 days is stalled',
  reasons([row({ stage: 'interested', updated_at: daysAgo(10) })]), ['stalled'])
check('mid pipeline stage touched recently is fine',
  reasons([row({ stage: 'interested', updated_at: daysAgo(3) })]), [])
check('closed stages never appear',
  reasons([
    row({ stage: 'declined', updated_at: daysAgo(60) }),
    row({ stage: 'no_response', updated_at: daysAgo(60) }),
    row({ stage: 'archived', updated_at: daysAgo(60) }),
  ]), [])

// Ordering: send-it outranks new triage.
check('urgent work sorts above new triage',
  reasons([
    row({ id: 'a', stage: 'suggested' }),
    row({ id: 'b', stage: 'outreach_approved', updated_at: daysAgo(1) }),
  ]), ['send_outreach', 'approve_outreach'])

// Goals.
const goalRows = [
  row({ id: '1', stage: 'suggested', created_at: daysAgo(1) }),
  row({ id: '2', stage: 'suggested', created_at: daysAgo(2) }),
  row({ id: '3', stage: 'declined', created_at: daysAgo(30) }),
]
const goals = summarizeGoals(goalRows, 1, buildActionQueue(goalRows, NOW), NOW)
check('sourced this week counts only recent rows', goals.sourced_this_week, 2)
check('active pipeline excludes declined', goals.active_pipeline, 2)
check('conversions pass through', goals.converted_this_month, 1)

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}`)
process.exit(failures === 0 ? 0 : 1)
