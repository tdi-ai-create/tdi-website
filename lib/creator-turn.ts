// ---------------------------------------------------------------------------
// Whose turn is it on a creator step.
//
// This was answered in four places, with four different rules, on the same row.
//
//   app/api/admin/creators/queue/route.ts   requires_team_action
//                                           OR status waiting_approval
//                                           OR review_status submitted
//   lib/creator-journey.ts                  requires_team_action
//   app/api/cron/creator-monthly-newsletter status waiting_approval
//   app/api/admin/dashboard-data/route.ts   requires_team_action
//
// The queue is the only one that is right, and its own comment says so: "the
// second half is the case the first version missed." Somebody already found
// this bug, fixed it where it was reported, and left the other three. That is
// the whole diagnosis. Nothing forced the rule out of the file it was found in.
//
// What a person sees when the rules disagree: the Needs You board says Holly
// Stuart is blocked on us and waiting on our answer, and her page then says
// "HOLLY'S TURN". The roster says the same, because a submitted step is not
// `available` so it never becomes the row's next milestone and the column can
// never read TDI. Three screens, one creator, three answers.
//
// Two questions live here, and they are not the same question:
//
//   isOursToDo    the step is TDI's work, and always was. Content Launched.
//                 Used for "we do this one, not them".
//   isWaitingOnUs the ball is with TDI right now. Either the step is ours, or
//                 they handed something in and are owed a response. This is the
//                 one that decides whose turn it is on any screen.
//
// Keeping them apart matters. A creator step under review is waiting on us
// without becoming our work, and collapsing the two makes "we do this one, not
// them" appear on a step the creator plainly did.
// ---------------------------------------------------------------------------

export type Turn = 'creator' | 'tdi';

/**
 * The fields this decision needs, named once. Callers read them off rows whose
 * own shapes differ (`s.review_status`, `r.milestones.requires_team_action`,
 * `row.status`), so they normalise into this rather than each inventing a test.
 */
export interface StepTurnInput {
  status?: string | null;
  reviewStatus?: string | null;
  requiresTeamAction?: boolean | null;
}

/** The step is TDI's work by definition, whoever is waiting. */
export function isOursToDo(step: StepTurnInput): boolean {
  return step.requiresTeamAction === true;
}

/**
 * The creator has handed something in on this step.
 *
 * `under_review` sits alongside `submitted` because a step that reached a
 * reviewer is still theirs handed in, not theirs to do again.
 */
export function hasSubmitted(step: StepTurnInput): boolean {
  return step.reviewStatus === 'submitted' || step.reviewStatus === 'under_review';
}

/**
 * Something of theirs is being looked at.
 *
 * This is the narrower question, and it is not the same as whose turn it is: a
 * step that is simply ours to do has nothing of theirs in review. The creator
 * portal branches on this to decide whether to offer the Submit control again.
 */
export function isInReview(step: StepTurnInput): boolean {
  return step.status === 'waiting_approval' || hasSubmitted(step);
}

/**
 * The ball is with TDI: either the step is ours, or the creator has handed
 * something in and is waiting to hear back.
 *
 * This is the one that decides whose turn it is on any screen.
 */
export function isWaitingOnUs(step: StepTurnInput): boolean {
  return isOursToDo(step) || isInReview(step);
}

/** The same answer as a word, for callers that store or display it. */
export function whoseTurn(step: StepTurnInput): Turn {
  return isWaitingOnUs(step) ? 'tdi' : 'creator';
}
