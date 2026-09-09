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

type Rule = {
  from: Status[]
  to: Status
  /** Role permitted to make this move. null means the system. */
  role: string | null
  /** A written note is mandatory. Used where a decision needs a reason. */
  needsNote?: boolean
}

export const TRANSITIONS: Record<Action, Rule> = {
  place_brief:     { from: [],                                     to: 'brief',             role: 'orchestrator' },
  pick_up:         { from: ['brief', 'changes_requested'],         to: 'drafting',          role: 'writer' },
  submit:          { from: ['drafting'],                           to: 'pending_qa',        role: 'writer' },
  pass_qa:         { from: ['pending_qa'],                         to: 'pending_creative',  role: 'julie' },
  pass_creative:   { from: ['pending_creative'],                   to: 'pending_editorial', role: 'lily' },
  pass_editorial:  { from: ['pending_editorial'],                  to: 'pending_approval',  role: 'olivia' },
  approve:         { from: ['pending_approval'],                   to: 'approved',          role: 'approver' },
  schedule:        { from: ['approved'],                           to: 'scheduled',         role: null },
  mark_published:  { from: ['scheduled'],                          to: 'published',         role: null },
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

export function legalFrom(action: Action, current: Status): boolean {
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
