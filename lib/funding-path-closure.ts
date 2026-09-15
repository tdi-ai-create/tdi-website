// ---------------------------------------------------------------------------
// Closing a grant path, and saying why in the place people read.
//
// Two things already close a path, and until now neither wrote the reason
// anywhere a person looks:
//
//   applyAnswerOutcome    an answer comes back that rules the path out
//   the eligibility audit a screen verdict of 'stop'
//
// Both set eligibility_reason on the opportunity row, which is exactly one
// sentence in one field that only renders while the path is still open. Once
// the path is closed the panel stops drawing the banner, so the record of why
// we stopped disappears from the screen at the moment it becomes history.
//
// The Record tab reads funding_opportunity_notes. That is the log. A closure
// that is not in it did not happen as far as anyone reviewing the school later
// is concerned, and "why did we never apply for this" is a question Rae asks
// about paths nobody remembers.
//
// The order below is deliberate and is the whole point of the file: the note is
// written first, and the path closes only if the note landed. A path closed
// with no explanation is worse than a path left open, because the first looks
// like a decision and the second looks like work.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/** System writes are authored, so the log never shows a decision with no source. */
export const SCREEN_AUTHOR = 'eligibility screen';

export interface ClosureInput {
  opportunityId: string;
  /** Plain words, as shown to a person. Never a rule id on its own. */
  reason: string;
  /** Which rule decided it, kept for auditing a bad rule later. */
  rule: string;
  /** Who or what closed it. Defaults to the screen. */
  author?: string;
  now?: Date;
}

export interface ClosureResult {
  closed: boolean;
  /** True when the note was written but the status change failed. */
  loggedOnly: boolean;
  error?: string;
}

/**
 * Records why a path is being abandoned, then abandons it.
 *
 * `status: 'closed'` rather than 'not_applicable', matching applyAnswerOutcome,
 * which has closed paths this way since it was written. Both are finished as far
 * as isOver is concerned and a second spelling for one outcome is how this
 * codebase ends up with six definitions of finished.
 *
 * waiting_on is cleared in the same write. A path that is over is nobody's next
 * move, and leaving it set is what put six dead grants on Bella's board still
 * badged as waiting on TDI.
 */
export async function closePathWithReason(
  supabase: DbClient,
  input: ClosureInput
): Promise<ClosureResult> {
  const now = input.now ?? new Date();
  const author = input.author ?? SCREEN_AUTHOR;

  const content =
    `Not eligible, so this path is closed. ${input.reason} ` +
    `(rule: ${input.rule}). ` +
    `Nothing further is owed here. If this is wrong, override the screen on the ` +
    `grant path and it reopens.`;

  const { error: noteErr } = await supabase.from('funding_opportunity_notes').insert({
    opportunity_id: input.opportunityId,
    content,
    author,
  });

  if (noteErr) {
    // Deliberately leaves the path open. See the header: an unexplained closure
    // is the worse of the two failures, and an open path at least keeps
    // appearing until someone deals with it.
    return { closed: false, loggedOnly: false, error: `Nothing was closed, because the reason could not be logged: ${noteErr.message}` };
  }

  const { error: closeErr } = await supabase
    .from('funding_opportunities')
    .update({
      status: 'closed',
      waiting_on: 'none',
      eligibility_reason: input.reason,
      eligibility_rule: input.rule,
      eligibility_verdict: 'stop',
      eligibility_checked_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', input.opportunityId);

  if (closeErr) {
    return { closed: false, loggedOnly: true, error: `The reason was logged but the path did not close: ${closeErr.message}` };
  }

  return { closed: true, loggedOnly: false };
}

/**
 * Work still open against a path that has just been closed.
 *
 * "Decide whether to keep pursuing it" is unanswerable once the screen has
 * ruled the school cannot win it, and four such items were open on 15 September
 * against paths in exactly that state. Leaving them is how a closed grant keeps
 * asking for attention, which is the complaint that produced the waiting_on fix
 * in the opportunities route.
 *
 * Cancelled rather than deleted, so the history of what was once being asked
 * survives in the Record.
 */
export async function cancelWorkOnClosedPath(
  supabase: DbClient,
  opportunityId: string
): Promise<{ cancelled: number; error?: string }> {
  const { data, error } = await supabase
    .from('funding_action_items')
    .update({ status: 'cancelled' })
    .eq('opportunity_id', opportunityId)
    .in('status', ['pending', 'in_progress', 'blocked'])
    .select('id');

  if (error) return { cancelled: 0, error: `Open work on the closed path was left behind: ${error.message}` };
  return { cancelled: (data ?? []).length };
}
