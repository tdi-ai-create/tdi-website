/**
 * The content queue's state machine.
 *
 * Eleven states, each with exactly one owner, so a stalled item always has
 * precisely one name to ask. Kristin set the shape on 7 September 2026: three
 * gates before an approver, not the one gate I predicted.
 *
 * Two rules here are load-bearing and easy to lose in a refactor:
 *
 *   1. A rejection returns to the writer and re-enters at QA. It never goes
 *      straight back to the approver, because the whole point of the gates is
 *      that nothing reaches a human unchecked, including a second time.
 *
 *   2. The writer cannot pass a gate on their own work. Izzy writes the social,
 *      so Izzy reviewing it is a second draft rather than a review. The router
 *      refuses it rather than relying on anyone remembering.
 */

export type Status =
  | 'brief' | 'drafting' | 'pending_qa' | 'pending_creative' | 'pending_editorial'
  | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'verified'
  | 'changes_requested' | 'cancelled'

/** Who a state is waiting on. Stored on the row so a stalled item is answerable. */
export const OWNER_OF: Record<Status, string> = {
  brief:             'orchestrator',
  drafting:          'writer',
  pending_qa:        'julie',
  pending_creative:  'lily',
  pending_editorial: 'olivia',
  pending_approval:  'approver',
  approved:          'system',
  scheduled:         'system',
  published:         'system',
  verified:          'nobody',
  changes_requested: 'writer',
  cancelled:         'nobody',
}

export type Action =
  | 'place_brief' | 'pick_up' | 'submit'
  | 'pass_qa' | 'pass_creative' | 'pass_editorial'
  | 'request_changes' | 'approve' | 'schedule' | 'mark_published' | 'verify' | 'cancel'
  // Not a transition: it parks a piece where it already is.
  | 'flag_blocked'

type Rule = {
  from: Status[]
  to: Status
  /** Role permitted to make this move. null means the system. */
  role: string | null
  /** A written note is mandatory. Used where a decision needs a reason. */
  needsNote?: boolean
}

export const TRANSITIONS: Record<Exclude<Action, 'flag_blocked'>, Rule> = {
  place_brief:     { from: [],                                     to: 'brief',             role: 'orchestrator' },
  pick_up:         { from: ['brief', 'changes_requested'],         to: 'drafting',          role: 'writer' },
  submit:          { from: ['drafting'],                           to: 'pending_qa',        role: 'writer' },
  pass_qa:         { from: ['pending_qa'],                         to: 'pending_creative',  role: 'julie' },
  pass_creative:   { from: ['pending_creative'],                   to: 'pending_editorial', role: 'lily' },
  pass_editorial:  { from: ['pending_editorial'],                  to: 'pending_approval',  role: 'olivia' },
  approve:         { from: ['pending_approval'],                   to: 'approved',          role: 'approver' },
  schedule:        { from: ['approved'],                           to: 'scheduled',         role: null },
  // Also from 'approved'. When a person publishes a Substack post themselves,
  // the piece never passes through 'scheduled': there was no planned date, they
  // just posted it. Requiring a schedule first would mean inventing one after
  // the fact so the state machine could be satisfied, which is bookkeeping, not
  // truth.
  mark_published:  { from: ['approved', 'scheduled'],              to: 'published',         role: null },
  verify:          { from: ['published'],                          to: 'verified',          role: null },
  cancel:          { from: ['brief','drafting','pending_qa','pending_creative','pending_editorial','pending_approval','changes_requested'],
                     to: 'cancelled',        role: null, needsNote: true },
  // Every gate and the approver can refuse. It always lands back with the writer.
  request_changes: { from: ['pending_qa','pending_creative','pending_editorial','pending_approval'],
                     to: 'changes_requested', role: null, needsNote: true },
}

/** Agents allowed to act as each role. An agent may hold more than one. */
export const ROLE_HOLDERS: Record<string, string[]> = {
  orchestrator: ['nora'],
  // Izzy and Zara. Izzy's own instructions describe every social post as
  // co-drafted with Zara, so a gate that refuses Zara refuses the person doing
  // the work. Jasmine was here by mistake: she is Hub curriculum, and Hub
  // content moves through content-sync, not this queue.
  writer:       ['izzy', 'zara'],
  julie:        ['julie-lynn'],
  lily:         ['lily'],
  olivia:       ['olivia'],
  approver:     ['kristin', 'rae'],
}

/**
 * The writer of an item can never pass a gate on it, even if they somehow hold
 * that role too. Checked separately from the role map so that adding a role to
 * an agent can never quietly hand them their own review.
 */
export function isSelfReview(actor: string, itemAuthor: string | null): boolean {
  if (!itemAuthor) return false
  return actor.trim().toLowerCase() === itemAuthor.trim().toLowerCase()
}

export function actorHoldsRole(actor: string, role: string | null): boolean {
  if (role === null) return true
  const holders = ROLE_HOLDERS[role]
  if (!holders) return false
  return holders.includes(actor.trim().toLowerCase())
}

/** flag_blocked is the one action that is not a transition, so it has no rule. */
export function isTransition(action: Action): action is Exclude<Action, 'flag_blocked'> {
  return action !== 'flag_blocked'
}

export function legalFrom(action: Action, current: Status): boolean {
  if (!isTransition(action)) return false
  const rule = TRANSITIONS[action]
  if (!rule) return false
  return rule.from.includes(current)
}

/**
 * Who may send a piece back.
 *
 * The gates and the approver may always refuse: that is what a gate is for.
 *
 * A writer may recall their own work, but only in the narrow window where they
 * have just submitted it and nobody has acted yet. Izzy used this on 8 September
 * to pull back a draft she had submitted before writing it, which is exactly the
 * case worth keeping. Outside that window a writer sending work back is a writer
 * pulling a piece out of review, so it is refused and they have to ask.
 *
 * The window is defined by the log rather than by the status, because the log is
 * what records whether anyone has touched the piece since the submit.
 */
export function canRequestChanges(
  actor: string,
  item: { status: Status; feedback_log?: unknown[] },
): { allowed: boolean; reason?: string } {
  const who = actor.trim().toLowerCase()

  const isReviewer =
    actorHoldsRole(who, 'julie') ||
    actorHoldsRole(who, 'lily') ||
    actorHoldsRole(who, 'olivia') ||
    actorHoldsRole(who, 'approver')
  if (isReviewer) return { allowed: true }

  const log = (item.feedback_log ?? []) as Array<Record<string, unknown>>
  const last = log[log.length - 1]
  const justSubmittedByThisActor =
    last != null &&
    last.action === 'submit' &&
    typeof last.actor === 'string' &&
    last.actor.trim().toLowerCase() === who

  if (justSubmittedByThisActor) return { allowed: true }

  return {
    allowed: false,
    reason: `"${actor}" cannot send this back. A gate or an approver can refuse it, and a writer can recall their own work only immediately after submitting it, before anyone has acted. Ask the gate holder instead of pulling it out of review.`,
  }
}

/** States where a gate is holding the piece and could find itself unable to judge it. */
export const GATE_STATES = ['pending_qa', 'pending_creative', 'pending_editorial'] as const

/**
 * A gate that cannot judge a piece must not send it back to the writer.
 *
 * On 9 September Lily hit a Substack post with no structural contract, called
 * the draft "clean and on-voice", and sent it back anyway because that was the
 * only refusal available to her. Izzy picked it up, changed nothing that
 * mattered, resubmitted, Julie re-passed, and Lily bounced it again. One full
 * wasted cycle, and it would have run forever: the writer cannot author a
 * standard, so the thing being asked for could never arrive.
 *
 * Flagging parks the piece where it is instead. It stays in the gate, because
 * that is the truth of it, and the flag says what is missing and who has to
 * decide. A piece already flagged is left alone.
 */
export function canFlagBlocked(
  actor: string,
  item: { status: string; feedback_log?: unknown[] },
): { allowed: boolean; reason?: string } {
  if (!(GATE_STATES as readonly string[]).includes(item.status)) {
    return { allowed: false, reason: `Only a piece sitting in a gate can be flagged. This one is "${item.status}".` }
  }
  const who = actor.trim().toLowerCase()
  const holds =
    actorHoldsRole(who, 'julie') || actorHoldsRole(who, 'lily') ||
    actorHoldsRole(who, 'olivia') || actorHoldsRole(who, 'orchestrator')
  if (!holds) {
    return { allowed: false, reason: `"${actor}" does not hold a gate, so cannot flag this as blocked.` }
  }
  const log = (item.feedback_log ?? []) as Array<Record<string, unknown>>
  const already = log.some(e => e.action === 'flag_blocked')
  if (already) {
    return { allowed: false, reason: 'Already flagged as blocked, and nothing has changed. Leave it parked rather than flagging it again.' }
  }
  return { allowed: true }
}

/**
 * Is there actually anything here to judge?
 *
 * On 9 September an empty draft passed QA. Izzy submitted a row whose body was
 * null and whose artifact_refs were empty, Julie passed it, and Lily then wrote
 * that it read "clean and on-voice". There was nothing to read.
 *
 * Every rule in the database trigger guards against bad content: a named
 * district, a dash, a headcount. All of them read COALESCE(body,''), so an empty
 * body satisfies every one of them trivially. The gates could see what was wrong
 * with the text and could not notice that there was no text.
 *
 * A piece carries its content either inline or as a rendered artifact. Either is
 * fine. Neither is not.
 */
export function hasContent(item: { body?: string | null; artifact_refs?: unknown }): boolean {
  const body = (item.body ?? '').trim()
  if (body.length > 0) return true
  const refs = item.artifact_refs
  return Array.isArray(refs) && refs.length > 0
}
