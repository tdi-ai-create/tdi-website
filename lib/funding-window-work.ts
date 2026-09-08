// ---------------------------------------------------------------------------
// Is establishing this funder's window the research agent's job.
//
// Two places need the same answer and must not disagree:
//
//   find_work branch 2b   decides what to hand Amara
//   the eligibility audit decides whether to put the question on Bella's list
//
// If the audit's rule is narrower than find_work's, a question lands on a
// person that the agent was also being offered. If it is wider, the question
// reaches nobody. On 8 September the first happened: five window questions sat
// on Bella's list while Amara's queue for the same funders was empty, and she
// asked in Slack whether she should just answer them herself.
//
// The distinction that matters is `research_status`. A funder Amara discovered
// reads 'found', and establishing its window is the second half of the same
// research. A federal or formula programme like Title I Section 1003 reads
// 'none': nobody discovered it, there is no funder site to check, and its
// window is a question for a state agency. That one is genuinely a person's.
//
// Named assignment is deliberately NOT part of the test. find_work offers
// unassigned research to whoever asks, so requiring an agent name here would
// have sent Casey's Cash for Classrooms and Corn Belt Energy to Bella while
// Amara was being offered both.
// ---------------------------------------------------------------------------

export interface WindowWorkInput {
  research_status?: string | null;
  window_status?: string | null;
  window_checked_at?: string | null;
  status?: string | null;
}

/** Paths that are over. Nothing about their window is worth anyone's time. */
const FINISHED = new Set(['closed', 'awarded', 'denied']);

/** The window is not established: nobody has answered the question yet. */
export function windowIsUnestablished(opp: WindowWorkInput): boolean {
  return !opp.window_status || opp.window_status === 'unknown';
}

/**
 * The research agent is the right party to establish this window, and has not
 * yet had a turn at it.
 *
 * `window_checked_at` is the honest record of whether she has looked. It moves
 * only when a window field is written, unlike `updated_at`, which any job
 * touching the row moved and which silently suppressed her queue for six
 * funders until this was found.
 */
export function isAgentWindowWork(opp: WindowWorkInput): boolean {
  if (opp.status && FINISHED.has(opp.status)) return false;
  if (!windowIsUnestablished(opp)) return false;
  if (opp.window_checked_at) return false;
  return opp.research_status === 'found';
}
