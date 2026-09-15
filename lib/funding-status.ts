// ---------------------------------------------------------------------------
// Where a grant has got to.
//
// A census on 14 September found "this grant is finished" written twenty-one
// times in six different ways. Reading them showed they are not six versions of
// one question. They are three questions that had blurred together, each asked
// several ways:
//
//   has the funder decided          ['awarded','denied']
//   has it left our hands           ['applied','submitted','awarded','denied']
//                                   ['awarded','denied','closed','submitted','applied']
//                                   ['applied','submitted','awarded','closed']
//   is there any work left to do    ['closed','denied','awarded']
//                                   ['closed','denied','awarded','not_applicable']
//                                   ['closed','awarded','denied','archived']
//                                   ['denied','awarded','closed','cancelled']
//
// The differences are not cosmetic. One list treats a submitted grant as
// finished and another does not. Three ignore 'closed' entirely. That is why a
// closed grant sat in a writer's queue for nine days and a grant we had already
// won was still being offered for drafting: two screens genuinely disagreed
// about whether the work was over.
//
// Three questions, three answers, one file.
// ---------------------------------------------------------------------------

/** Normalised once, so casing and whitespace cannot fork a decision. */
function s(status?: string | null): string {
  return String(status ?? '').trim().toLowerCase();
}

/**
 * The funder has given a verdict.
 *
 * Only these two. 'closed' is us stopping, not them deciding, and conflating
 * the two is how "denied" statistics quietly included grants nobody submitted.
 */
export function hasFunderDecided(status?: string | null): boolean {
  return ['awarded', 'denied'].includes(s(status));
}

/**
 * It has left our hands and is with the funder or already judged.
 *
 * The question drafting cares about. Nothing should be written for a grant that
 * has already gone, which is what isPastDrafting in funding-eligibility.ts
 * answers for the eligibility screen; this is the same set, named for what it
 * means rather than for where it was first needed.
 */
export function isWithFunder(status?: string | null): boolean {
  return ['applied', 'submitted', 'awarded', 'denied'].includes(s(status));
}

/**
 * No further work is possible or wanted.
 *
 * The widest of the three, and the one most often written too narrowly. A grant
 * we closed, marked not applicable, cancelled or archived is as finished as one
 * that was denied, and a queue that omits any of them keeps offering dead work.
 */
export function isOver(status?: string | null): boolean {
  return ['awarded', 'denied', 'closed', 'not_applicable', 'cancelled', 'archived'].includes(
    s(status),
  );
}

/** Still worth someone's attention. The inverse of isOver, named positively. */
export function isLive(status?: string | null): boolean {
  return !isOver(status);
}
