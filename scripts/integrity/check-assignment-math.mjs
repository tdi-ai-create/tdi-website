/**
 * The assignment derivations, checked against the rules they come from.
 *
 * These are the functions that decide what number a school sees on its own
 * dashboard and which of a teacher's words a principal is allowed to read. They
 * are pure, so they can be checked exactly, and the two failures worth fearing
 * are both silent: a percentage that is wrong in a plausible direction, and a
 * reflection shown to somebody the teacher did not choose.
 *
 * Run: npm run check:assignments
 */

const M = await import('../../lib/partners/assignments.ts')

let failed = 0
const results = []

function check(rule, what, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) failed++
  results.push({ ok, rule, what, got, want })
}

const asn = (id, type = 'quickwin', closed = null) => ({
  id, recipient_email: id + '@x.test', content_type: type,
  content_slug: 's', content_title: 't', goal_id: 'g', goal_label: 'Goal',
  planned_date: null, closed_at: closed,
})
const ans = (assignment_id, step, created_at, words = null, words_shared_with = 'just_me') =>
  ({ assignment_id, step, words, words_shared_with, created_at })

// ── A4.6 to A4.8. Newest answer wins, and it can move down ───────────────────
check('A4.6', 'the newest answer is the position',
  [...M.currentSteps([ans('a', 2, '2026-10-01'), ans('a', 4, '2026-10-02')])],
  [['a', 4]])

check('A4.7', 'an answer can move back down',
  [...M.currentSteps([ans('a', 4, '2026-10-01'), ans('a', 2, '2026-10-05')])],
  [['a', 2]])

check('A4.8', 'an assignment with no answer is absent, not zero',
  [...M.currentSteps([])], [])

// ── A5.1. The share, counted from "used it with students" ────────────────────
{
  const a = [asn('1'), asn('2'), asn('3'), asn('4')]
  const s = M.currentSteps([ans('1', 1, 'x'), ans('2', 2, 'x'), ans('3', 3, 'x'), ans('4', 4, 'x')])
  check('A5.1', 'two of four at step 3 or better reads 50%',
    M.goalReading(a, s, true), { state: 'measured', percent: 50, inPractice: 2, answered: 4, assigned: 4 })
}

// ── A5.3, revised. The number shows from the first answer ────────────────────
{
  const a = [asn('1'), asn('2'), asn('3'), asn('4'), asn('5'), asn('6')]
  const s = M.currentSteps([ans('1', 3, 'x')])
  check('A5.3', 'one answer out of six assigned already reads',
    M.goalReading(a, s, true), { state: 'measured', percent: 100, inPractice: 1, answered: 1, assigned: 6 })
}
{
  // L4.8 is satisfied by the sample travelling with the number, not by hiding
  // it. A panel that prints the percentage without `answered` and `assigned`
  // is the bug this guards against.
  const a = [asn('1'), asn('2'), asn('3'), asn('4'), asn('5'), asn('6')]
  const r = M.goalReading(a, M.currentSteps([ans('1', 3, 'x')]), true)
  check('L4.8', 'the reading carries its own sample size so a panel cannot hide it',
    [typeof r.answered, typeof r.assigned], ['number', 'number'])
}

// ── A5.4. Nobody answering is unmeasured, never zero percent ─────────────────
{
  const a = [asn('1'), asn('2'), asn('3'), asn('4'), asn('5')]
  check('A5.4', 'five assigned and none answered is unmeasured, not 0%',
    M.goalReading(a, new Map(), true), { state: 'unmeasured', assigned: 5 })
}

// ── A4.5. Silence never drags the percentage down ────────────────────────────
{
  // Four answered, all in practice. Six more were assigned and said nothing.
  const a = [asn('1'), asn('2'), asn('3'), asn('4'), asn('5'), asn('6'),
             asn('7'), asn('8'), asn('9'), asn('10')]
  const s = M.currentSteps([ans('1', 3, 'x'), ans('2', 3, 'x'), ans('3', 4, 'x'), ans('4', 4, 'x')])
  check('A4.5', 'six silent people do not make four-in-practice read as 40%',
    M.goalReading(a, s, true).percent, 100)
}

// ── A4.13.2. A quiz is out of the denominator ────────────────────────────────
{
  const a = [asn('1'), asn('2'), asn('3'), asn('4'), asn('q1', 'quiz'), asn('q2', 'quiz')]
  const s = M.currentSteps([ans('1', 3, 'x'), ans('2', 3, 'x'), ans('3', 3, 'x'), ans('4', 3, 'x')])
  check('A4.13.2', 'two assigned quizzes do not drag a 100% goal down',
    M.goalReading(a, s, true), { state: 'measured', percent: 100, inPractice: 4, answered: 4, assigned: 4 })
}

// ── A9.3. A goal reads nothing unless TDI turned it on ───────────────────────
{
  const a = [asn('1'), asn('2'), asn('3'), asn('4')]
  const s = M.currentSteps([ans('1', 4, 'x'), ans('2', 4, 'x'), ans('3', 4, 'x'), ans('4', 4, 'x')])
  check('A9.3', 'a goal measured another way shows no figure even with four answers',
    M.goalReading(a, s, false), { state: 'not_measured_this_way' })
}

// ── A4.14. The floor, at the two-person schools ──────────────────────────────
{
  const two = [{ assignment_id: 'a', reason: 'does_not_fit', words: null },
               { assignment_id: 'b', reason: 'no_time', words: null }]
  check('A4.14', 'two reasons are withheld, which is Oak Grove and Tidioute',
    M.reasonCounts(two), { withheld: true, answered: 2 })

  const three = two.concat([{ assignment_id: 'c', reason: 'does_not_fit', words: null }])
  const got = M.reasonCounts(three)
  check('A4.14', 'three reasons are reported, most common first',
    [got.withheld, got.total, got.rows[0].reason, got.rows[0].count], [false, 3, 'does_not_fit', 2])
}

// ── A4.4. "just me" means just them ──────────────────────────────────────────
{
  const names = new Map([['a', 'Marcy Ellison'], ['b', 'Dion Park'], ['c', 'Priya Nagel']])
  const answers = [
    ans('a', 3, 'x', 'Private thoughts', 'just_me'),
    ans('b', 3, 'x', 'For my leader', 'my_leader'),
    ans('c', 3, 'x', 'For the school', 'my_school_anonymous'),
  ]
  const got = M.visibleReflections(answers, names)
  check('A4.4', 'a "just me" reflection never appears in what the leader reads',
    JSON.stringify(got.shared).includes('Private thoughts'), false)
  check('A4.3', 'a "my leader" reflection carries the name',
    got.shared.find(s => s.words === 'For my leader').name, 'Dion Park')
  check('A4.2', 'a "school anonymous" reflection has the name stripped at the read',
    got.shared.find(s => s.words === 'For the school').name, null)
  check('A4.4', 'the kept-to-themselves count is reported without the words',
    got.kept, 1)
}

{
  // Two shared reflections at a two-person school: withheld as a set, because
  // at two, one anonymous reflection is attributable by elimination.
  const got = M.visibleReflections(
    [ans('a', 3, 'x', 'One', 'my_school_anonymous'), ans('b', 3, 'x', 'Two', 'my_school_anonymous')],
    new Map())
  check('A4.14', 'two reflections are withheld even though both are anonymous',
    got, { withheld: true, answered: 2 })
}

// ── A1.1 to A1.3. The cap, and what the refusal carries ──────────────────────
check('A1.1', 'a third open assignment is still allowed',
  M.capRefusal([asn('1'), asn('2')]), { allowed: true })
{
  const got = M.capRefusal([asn('1'), asn('2'), asn('3')])
  check('A1.3', 'the fourth is refused and the refusal names the three it holds',
    [got.allowed, got.holding.length], [false, 3])
}

// ── A4.11 and A4.12. Who gets the one reminder ───────────────────────────────
const F = r => ({ assignment_id: 'a', reason: r, words: null })
check('A4.11', 'nothing is sent before ten days',
  M.needsReminder(asn('a'), undefined, undefined, 9), false)
check('A4.11', 'somebody who never answered is reminded at ten days',
  M.needsReminder(asn('a'), undefined, undefined, 10), true)
check('A4.11', '"I have not had the time yet" is reminded',
  M.needsReminder(asn('a'), 1, F('no_time'), 12), true)
for (const r of ['does_not_fit', 'tried_it_failed', 'already_doing_it']) {
  check('A4.11', `"${r}" is an answer, not silence, and is never reminded`,
    M.needsReminder(asn('a'), 1, F(r), 30), false)
}
check('A4.11', '"I would need help" goes to the leader, not back to the teacher',
  M.needsReminder(asn('a'), 1, F('need_help'), 30), false)
check('A3.4', 'a closed assignment is never reminded',
  M.needsReminder(asn('a', 'quickwin', '2026-10-01'), undefined, undefined, 99), false)

// ── report ───────────────────────────────────────────────────────────────────
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.rule.padEnd(9)} ${r.what}`)
  if (!r.ok) console.log(`       got  ${JSON.stringify(r.got)}\n       want ${JSON.stringify(r.want)}`)
}
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
