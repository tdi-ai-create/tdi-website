import { computeNextActions } from '../lib/funding-next-actions'

/**
 * The guardrail, as a test: every narrative state must produce at least one
 * item, and that item must have an owner who can actually move it.
 * A state that produces nothing is a trap — that is what put ten opportunities
 * on ice for weeks.
 */

const pursuit = { id: 'p1', pursuit_name: 'Test School', intro_sent_at: '2026-01-01', client_contact_email: 'x@y.org', current_phase: 'writing', school_profile: {} }
const openGate = { gate_open: true, submitter_name: 'A', submitter_email: 'a@b.c', backup_name: 'B', backup_email: 'b@b.c', admin_sponsor_name: 'C', admin_sponsor_email: 'c@b.c', contract1_signed: true, contract2_signed: true, submitter_employment_verified_at: new Date().toISOString() }
const shutGate = { ...openGate, gate_open: false, backup_name: null, contract1_signed: false }

const base = { id: 'o1', name: 'Test Grant', status: 'not_started', window_status: 'open', plan_category: 'C', amount: 5000 }

type Case = { label: string; opp: any; gate: any; expectOwner: string[] }

const cases: Case[] = [
  { label: 'not_started, window open, gate open', opp: { ...base, narrative_status: 'not_started' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'requested, gate open', opp: { ...base, narrative_status: 'requested' }, gate: openGate, expectOwner: ['agent'] },
  { label: 'requested, GATE SHUT', opp: { ...base, narrative_status: 'requested' }, gate: shutGate, expectOwner: ['bella'] },
  { label: 'requested, window unknown', opp: { ...base, narrative_status: 'requested', window_status: 'unknown' }, gate: openGate, expectOwner: ['bella', 'agent'] },
  { label: 'drafting', opp: { ...base, narrative_status: 'drafting' }, gate: openGate, expectOwner: ['agent'] },
  { label: 'review', opp: { ...base, narrative_status: 'review' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'qa_review, no verdict', opp: { ...base, narrative_status: 'qa_review', qa_passed: null, narrative_status_changed_at: new Date().toISOString() }, gate: openGate, expectOwner: ['agent'] },
  { label: 'qa_review, attempt 2', opp: { ...base, narrative_status: 'qa_review', qa_passed: null, qa_attempt_count: 1, narrative_status_changed_at: new Date().toISOString() }, gate: openGate, expectOwner: ['agent'] },
  { label: 'approval (QA passed)', opp: { ...base, narrative_status: 'approval', qa_passed: true, qa_reviewer: 'julie' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'legacy qa_review + passed', opp: { ...base, narrative_status: 'qa_review', qa_passed: true }, gate: openGate, expectOwner: ['bella'] },
  { label: 'escalated, needs decision', opp: { ...base, narrative_status: 'escalated', qa_escalation: { summary: 's', root_cause: 'r', recommended_option: 'reassign' } }, gate: openGate, expectOwner: ['bella'] },
  { label: 'escalated, awaiting client', opp: { ...base, narrative_status: 'escalated', qa_escalation: { awaiting_client: true, client_ask: 'enrollment' } }, gate: openGate, expectOwner: ['school'] },
  { label: 'ready', opp: { ...base, narrative_status: 'ready' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'closed (stopped pursuing)', opp: { ...base, narrative_status: 'escalated', status: 'closed' }, gate: openGate, expectOwner: ['NONE'] },
]

let failures = 0

for (const c of cases) {
  const actions = computeNextActions(pursuit, [c.opp], [], c.gate, [], { qaAgentEnabled: true })
  // Ignore pursuit-level noise; we only care about items about this opportunity
  const relevant = actions.filter(a => a.targetId === c.opp.id || a.id.includes(c.opp.id))
  const owners = [...new Set(relevant.map(a => a.owner))]

  if (c.expectOwner[0] === 'NONE') {
    const ok = relevant.length === 0
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.label}  →  ${relevant.length} items (expected none)`)
    if (!ok) failures++
    continue
  }

  const hasItem = relevant.length > 0
  const ownerOk = owners.some(o => c.expectOwner.includes(o))
  const ok = hasItem && ownerOk
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.label}  →  owners=[${owners.join(',')}] expected=[${c.expectOwner.join(',')}]  "${relevant[0]?.label ?? 'NO ITEM'}"`)
}

// ── QA ownership must follow whether automated QA is actually running ──
//
// This is the regression that put five finished narratives back into silence:
// qa_review was called agent work while no QA agent was configured, so nothing
// surfaced to a person and nothing picked it up.

console.log('\n── QA ownership ──')

const qaOpp = { ...base, narrative_status: 'qa_review', qa_passed: null, qa_attempt_count: 0,
  narrative_status_changed_at: new Date().toISOString() }

const agentOff = computeNextActions(pursuit, [qaOpp], [], openGate, [], { qaAgentEnabled: false })
  .filter(a => a.owner === 'bella' && !a.inProgress)
const offOk = agentOff.length > 0
if (!offOk) failures++
console.log(`${offOk ? 'PASS' : 'FAIL'}  QA agent OFF → a person owns it  (${agentOff.length} actionable)`)

const agentOn = computeNextActions(pursuit, [qaOpp], [], openGate, [], { qaAgentEnabled: true })
  .filter(a => a.owner === 'agent')
const onOk = agentOn.length > 0
if (!onOk) failures++
console.log(`${onOk ? 'PASS' : 'FAIL'}  QA agent ON, fresh → agent owns it  (${agentOn.length} muted)`)

// Even with the agent on, silence past the threshold must reach a person
const staleOpp = { ...qaOpp, narrative_status_changed_at: new Date(Date.now() - 48 * 3600000).toISOString() }
const stale = computeNextActions(pursuit, [staleOpp], [], openGate, [], { qaAgentEnabled: true, qaSilenceHours: 24 })
  .filter(a => a.owner === 'bella' && !a.inProgress)
const staleOk = stale.length > 0
if (!staleOk) failures++
console.log(`${staleOk ? 'PASS' : 'FAIL'}  QA agent ON but silent 48h → a person owns it  (${stale.length} actionable)`)

// ── A redrafted narrative must be reviewable again ──
//
// qa_passed keeps the 'false' from the previous attempt unless it is cleared on
// re-entry. find_work used to filter on qa_passed IS NULL, which made every
// redrafted narrative permanently invisible to QA. Five sat that way for days.

console.log('\n── Re-review after a redraft ──')

const redrafted = { ...base, narrative_status: 'qa_review', qa_passed: false, qa_attempt_count: 1,
  narrative_status_changed_at: new Date().toISOString() }

const reviewable = computeNextActions(pursuit, [redrafted], [], openGate, [], { qaAgentEnabled: true })
  .filter(a => a.targetId === redrafted.id)
const reviewOk = reviewable.length > 0
if (!reviewOk) failures++
console.log(`${reviewOk ? 'PASS' : 'FAIL'}  redrafted narrative (qa_passed=false) still surfaces  (${reviewable.length} items)`)

// It must never read as approved just because a stale verdict is sitting on it
const wronglyApproved = reviewable.filter(a => a.actionType === 'approve_draft')
const notApproved = wronglyApproved.length === 0
if (!notApproved) failures++
console.log(`${notApproved ? 'PASS' : 'FAIL'}  and is not treated as approved`)

console.log(`\n${failures === 0 ? 'All states owned and actionable.' : `${failures} check(s) failed — work can go silent.`}`)
process.exit(failures === 0 ? 0 : 1)
