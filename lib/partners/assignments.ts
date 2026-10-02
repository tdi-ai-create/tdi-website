/**
 * Reading assignments, and turning them into the one number a goal shows.
 *
 * The agreement is docs/assignment-spec.md. Rule ids below are from it, and
 * where a rule exists to prevent a failure this codebase has already had, the
 * failure is named, because that is what stops the rule being deleted by
 * somebody who only sees its cost.
 *
 * Everything here reads. Nothing writes, by A7.4: the leader's rollup computes
 * from Hub answers and never writes to the Hub.
 */

/** A4.1, in order. The line between 2 and 3 is where a classroom starts. */
export const STEPS = [
  'Not yet',
  'I read it, I have not used it',
  'I used it with students',
  'I am using it regularly',
] as const

/** A5.1 counts from here up: used it with students, or better. */
export const IN_PRACTICE_FROM = 3

/**
 * A5.3, revised by Rae on 2 October 2026: the number shows right away.
 *
 * It used to wait for four answers before printing a percentage. It no longer
 * waits for any, because a principal who assigns something on Monday and has
 * one answer by Wednesday should see that answer, and a panel that says
 * "collecting" for a fortnight is the dashboard going quiet at exactly the
 * moment somebody is paying attention to it.
 *
 * L4.8 still has to be satisfied, and it is satisfied a different way: a sample
 * too small to mean anything is reported as a sample. So the reading always
 * carries `answered` and `assigned` alongside the percentage, and the panel is
 * required to show them. "100%" alone is a lie at one answer. "100%, 1 of 6
 * answered" is not.
 */
export const GOAL_MIN_ANSWERS = 1

/**
 * A4.14. Nothing is reported to anyone below three people.
 *
 * Separate from GOAL_MIN_ANSWERS above and deliberately so. That one is about a
 * percentage being meaningless; this one is about a person being identifiable.
 * Oak Grove and Tidioute have two active staff each, and at two, "1 of 2 said it
 * does not fit my students" names that person, a single anonymous reflection is
 * attributable by elimination, and a quiz spread of one Connector and one
 * Architect is a roster with the labels attached.
 *
 * Same floor and the same reason as Vibe Check, which already tells a leader an
 * area needs three people before it shows an average.
 */
export const REPORTING_FLOOR = 3

export type ContentType = 'quickwin' | 'game' | 'course' | 'quiz'

export type Assignment = {
  id: string
  recipient_email: string
  content_type: ContentType
  content_slug: string
  content_title: string
  goal_id: string | null
  goal_label: string
  planned_date: string | null
  closed_at: string | null
}

export type Answer = {
  assignment_id: string
  step: number
  words: string | null
  words_shared_with: 'just_me' | 'my_leader' | 'my_school_anonymous'
  created_at: string
}

export type Followup = {
  assignment_id: string
  reason: 'does_not_fit' | 'no_time' | 'tried_it_failed' | 'already_doing_it' | 'need_help'
  words: string | null
}

export const REASON_LABELS: Record<Followup['reason'], string> = {
  does_not_fit: 'It does not fit my students or my subject',
  no_time: 'I have not had the time yet',
  tried_it_failed: 'I tried it and it did not work',
  already_doing_it: 'I am already doing something like it',
  need_help: 'I would need help to get started',
}

/**
 * A4.6 to A4.8. The newest answer is the position; every older one is kept.
 *
 * Returns a map of assignment id to its current step. An assignment with no
 * answer is absent rather than zero, because A4.5 and A5.4 both turn on the
 * difference: nobody answering is unmeasured, and it is never reported as "not
 * implemented".
 */
export function currentSteps(answers: Answer[]): Map<string, number> {
  const newest = new Map<string, Answer>()
  for (const a of answers) {
    const seen = newest.get(a.assignment_id)
    if (!seen || a.created_at > seen.created_at) newest.set(a.assignment_id, a)
  }
  const out = new Map<string, number>()
  newest.forEach((a, id) => out.set(id, a.step))
  return out
}

export type GoalReading =
  | { state: 'measured'; percent: number; inPractice: number; answered: number; assigned: number }
  | { state: 'collecting'; answered: number; assigned: number }
  | { state: 'unmeasured'; assigned: number }
  | { state: 'not_measured_this_way' }

/**
 * A5.1 and A5.2. The share of assigned staff at "used it with students" or
 * above, computed every time it is displayed.
 *
 * No cron writes a snapshot of this and no column stores it. A5.2 is the
 * derived-state rule, and it is here because every hand-maintained mirror of a
 * computed number in this codebase has eventually disagreed with the thing it
 * mirrored.
 *
 * `measuredByAssignment` is A9.3: a goal reads a number from assignments only
 * when TDI has turned that on for it, one goal at a time, defaulting to off.
 * Roosevelt's "Staff supported on stress and burnout" is scored 3.5 out of 5
 * and both "Positive parent engagement" goals have no target at all, so a share
 * of staff is not what any of them mean. A goal with it off still carries the
 * reason for an assignment, per A9.4, it just never shows a figure.
 */
export function goalReading(
  assignments: Assignment[],
  steps: Map<string, number>,
  measuredByAssignment: boolean,
): GoalReading {
  if (!measuredByAssignment) return { state: 'not_measured_this_way' }

  /**
   * A4.13.2. A quiz is excluded from the denominator. It asks nothing, so it
   * can never reach "used it with students", and counting it would make a goal
   * read as going backwards every time a leader assigned one.
   */
  const counted = assignments.filter(a => a.content_type !== 'quiz' && !a.closed_at)
  const assigned = counted.length
  if (assigned === 0) return { state: 'unmeasured', assigned: 0 }

  const answeredSteps = counted
    .map(a => steps.get(a.id))
    .filter((s): s is number => typeof s === 'number')

  // A5.4. Zero answered is not zero percent implemented. It is unmeasured.
  if (answeredSteps.length === 0) return { state: 'unmeasured', assigned }

  if (answeredSteps.length < GOAL_MIN_ANSWERS) {
    return { state: 'collecting', answered: answeredSteps.length, assigned }
  }
  // Unreachable while GOAL_MIN_ANSWERS is 1, and kept deliberately: the gate is
  // one constant away from returning, and the state it produces is still drawn.

  const inPractice = answeredSteps.filter(s => s >= IN_PRACTICE_FROM).length
  return {
    state: 'measured',
    // Of the people who answered, not of everyone assigned. A4.5 forbids
    // counting silence as a failure, and dividing by `assigned` would do
    // exactly that by another route.
    percent: Math.round((inPractice / answeredSteps.length) * 100),
    inPractice,
    answered: answeredSteps.length,
    assigned,
  }
}

/** The four step bar a leader sees. Counts only, never names. */
export function stepSpread(
  assignments: Assignment[],
  steps: Map<string, number>,
): { counts: [number, number, number, number]; answered: number; silent: number } {
  const counts: [number, number, number, number] = [0, 0, 0, 0]
  let answered = 0
  for (const a of assignments) {
    const s = steps.get(a.id)
    if (typeof s !== 'number') continue
    counts[s - 1]++
    answered++
  }
  return { counts, answered, silent: assignments.length - answered }
}

export type Withheld = { withheld: true; answered: number }

/**
 * A4.14, applied at the read.
 *
 * In the read and not in the component on purpose: a second surface that reads
 * the same rows a different way would otherwise reintroduce the leak, and this
 * is the exact shape of eight silent-write bugs already catalogued in this
 * codebase, where one path enforced a rule and another did not.
 */
export function reasonCounts(
  followups: Followup[],
): Withheld | { withheld: false; total: number; rows: { reason: Followup['reason']; label: string; count: number }[] } {
  const total = followups.length
  if (total < REPORTING_FLOOR) return { withheld: true, answered: total }

  const tally = new Map<Followup['reason'], number>()
  for (const f of followups) tally.set(f.reason, (tally.get(f.reason) ?? 0) + 1)

  const rows = [...tally.entries()]
    .map(([reason, count]) => ({ reason, label: REASON_LABELS[reason], count }))
    .sort((a, b) => b.count - a.count)

  return { withheld: false, total, rows }
}

/**
 * A4.2, A4.3 and A4.4. What the leader is allowed to read.
 *
 * "just_me" never leaves the teacher, in any circumstance. "my_leader" reaches
 * the leader with the name on it. "my_school_anonymous" reaches the school with
 * the name stripped here rather than hidden in a component, because a name that
 * is still in the payload is a name that leaks through a view-source, an export
 * or the next person to write a different component.
 *
 * The floor applies to the set as a whole, not per reflection: at two people a
 * single shared reflection is attributable by elimination even when it carries
 * no name.
 */
export function visibleReflections(
  answers: Answer[],
  recipientNameByAssignment: Map<string, string>,
): Withheld | { withheld: false; shared: { words: string; name: string | null }[]; kept: number } {
  const withWords = answers.filter(a => a.words && a.words.trim())
  if (withWords.length < REPORTING_FLOOR) return { withheld: true, answered: withWords.length }

  const shared: { words: string; name: string | null }[] = []
  let kept = 0
  for (const a of withWords) {
    if (a.words_shared_with === 'just_me') { kept++; continue }
    shared.push({
      words: a.words as string,
      name: a.words_shared_with === 'my_leader'
        ? recipientNameByAssignment.get(a.assignment_id) ?? null
        : null,
    })
  }
  return { withheld: false, shared, kept }
}

/**
 * A1.1 to A1.3. Three open per person, counted across every leader.
 *
 * Enforced here and in the route rather than by a disabled button, because a
 * disabled button is also just a drawing: two leaders on two screens can each
 * see a person at two and both assign.
 */
export function capRefusal(
  open: Assignment[],
): { allowed: true } | { allowed: false; holding: Assignment[] } {
  if (open.length < 3) return { allowed: true }
  // A1.3. The refusal names the three and offers to close one. It never says
  // "limit reached" and stops, which is why the rows come back rather than a
  // boolean.
  return { allowed: false, holding: open }
}

/**
 * A4.11. Who gets the one reminder, and who must never get one.
 *
 * Sent only to somebody who never answered at all, or who said they have not
 * had the time. Never to somebody who said it does not fit their room, that
 * they tried it and it did not work, or that they are already doing something
 * like it. Those are answers, not silence, and reminding somebody who has told
 * us the tool is wrong for their classroom tells them we were not listening.
 *
 * "I would need help to get started" produces no reminder to the teacher at
 * all. It is a request, and it surfaces to the leader as something to act on.
 *
 * A4.12: after this one, nothing further is sent in any circumstance, which is
 * why the caller checks reminder_sent_at before calling and stamps it after.
 */
export function needsReminder(
  assignment: Assignment,
  currentStep: number | undefined,
  followup: Followup | undefined,
  daysSince: number,
): boolean {
  if (assignment.closed_at) return false
  if (daysSince < 10) return false
  if (typeof currentStep !== 'number') return true
  if (!followup) return false
  return followup.reason === 'no_time'
}
