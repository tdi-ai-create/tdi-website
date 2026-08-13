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
  { label: 'qa_review, no verdict', opp: { ...base, narrative_status: 'qa_review', qa_passed: null }, gate: openGate, expectOwner: ['agent'] },
  { label: 'qa_review, attempt 2', opp: { ...base, narrative_status: 'qa_review', qa_passed: null, qa_attempt_count: 1 }, gate: openGate, expectOwner: ['agent'] },
  { label: 'approval (QA passed)', opp: { ...base, narrative_status: 'approval', qa_passed: true, qa_reviewer: 'julie' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'legacy qa_review + passed', opp: { ...base, narrative_status: 'qa_review', qa_passed: true }, gate: openGate, expectOwner: ['bella'] },
  { label: 'escalated, needs decision', opp: { ...base, narrative_status: 'escalated', qa_escalation: { summary: 's', root_cause: 'r', recommended_option: 'reassign' } }, gate: openGate, expectOwner: ['bella'] },
  { label: 'escalated, awaiting client', opp: { ...base, narrative_status: 'escalated', qa_escalation: { awaiting_client: true, client_ask: 'enrollment' } }, gate: openGate, expectOwner: ['school'] },
  { label: 'ready', opp: { ...base, narrative_status: 'ready' }, gate: openGate, expectOwner: ['bella'] },
  { label: 'closed (stopped pursuing)', opp: { ...base, narrative_status: 'escalated', status: 'closed' }, gate: openGate, expectOwner: ['NONE'] },
]

let failures = 0

for (const c of cases) {
  const actions = computeNextActions(pursuit, [c.opp], [], c.gate, [])
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

console.log(`\n${failures === 0 ? 'All states owned and actionable.' : `${failures} state(s) produce no owner — traps.`}`)
process.exit(failures === 0 ? 0 : 1)
