// ---------------------------------------------------------------------------
// Recording what a creator hands in.
//
// There were two submit routes. The one the portal actually calls wrote an
// internal note and nothing else. The one that records the work properly, and
// opens it for review, was reachable only from the resubmit-after-feedback
// screen. So you could use the feedback system only if you already had
// feedback, and nobody could ever get feedback.
//
// That is why creator_milestone_feedback held exactly one row in the entire
// history of Creator Studio, why Anne Marie has never drafted feedback on a
// submission, and why Bella opened her queue on 20 August and found nothing
// from Kim, Stephanie or Catherine. Thirteen submissions from eight creators
// between 11 February and 20 August went into notes nobody was shown.
//
// One function now, called by both routes, so they cannot drift again.
// ---------------------------------------------------------------------------

import { creatorSubmittedDeliverable } from './creator-slack';

/* eslint-disable-next-line */
type DbClient = any;

export interface RecordedSubmission {
  ok: boolean;
  version: number;
  feedbackId?: string;
  error?: string;
}

/**
 * Writes a creator's deliverable everywhere it needs to exist: onto the step
 * itself so their own portal shows it, and into the feedback table so it
 * appears in the review queue and an agent can draft against it.
 *
 * Takes the milestone record id, not the milestone id, because a creator on a
 * second project has more than one row for the same step.
 */
export async function recordSubmission(
  supabase: DbClient,
  params: {
    milestoneRecordId: string;
    creatorId: string;
    submittedValue: string;
    submissionNotes?: string | null;
    /** Name of the step, for the Slack alert. */
    stepName?: string | null;
    /** Skip Slack when the caller has already posted its own. */
    announce?: boolean;
  }
): Promise<RecordedSubmission> {
  const {
    milestoneRecordId, creatorId, submittedValue,
    submissionNotes = null, stepName = null, announce = true,
  } = params;

  const { count, error: countError } = await supabase
    .from('creator_milestone_feedback')
    .select('id', { count: 'exact', head: true })
    .eq('milestone_record_id', milestoneRecordId);

  if (countError) {
    return { ok: false, version: 0, error: `Counting earlier versions failed: ${countError.message}` };
  }

  const version = (count || 0) + 1;

  const { data: feedback, error: feedbackError } = await supabase
    .from('creator_milestone_feedback')
    .insert({
      milestone_record_id: milestoneRecordId,
      creator_id: creatorId,
      submission_version: version,
      submitted_value: submittedValue,
      submission_notes: submissionNotes,
      submitted_at: new Date().toISOString(),
      // Stays hidden until a person approves whatever is written back.
      visible_to_creator: false,
    })
    .select('id')
    .single();

  if (feedbackError) {
    return { ok: false, version, error: `Recording the submission failed: ${feedbackError.message}` };
  }

  // Whether this step is waiting on a review, or is already done.
  //
  // Some submissions complete the step outright: a form, a confirmation, a
  // choice. Marking one of those "submitted" puts a finished step into the
  // review queue, where it sits looking like work Bella owes somebody.
  const { data: stepNow } = await supabase
    .from('creator_milestones')
    .select('status, review_status')
    .eq('id', milestoneRecordId)
    .maybeSingle();

  const alreadyDone = stepNow?.status === 'completed';

  const stepPatch: Record<string, unknown> = {
    submitted_value: submittedValue,
    submission_notes: submissionNotes,
    updated_at: new Date().toISOString(),
  };
  if (!alreadyDone) stepPatch.review_status = 'submitted';

  const { error: stepError } = await supabase
    .from('creator_milestones')
    .update(stepPatch)
    .eq('id', milestoneRecordId);

  if (stepError) {
    return { ok: false, version, feedbackId: feedback?.id, error: `Saving it onto the step failed: ${stepError.message}` };
  }

  if (announce) {
    const { data: creator } = await supabase
      .from('creators')
      .select('name')
      .eq('id', creatorId)
      .single();

    creatorSubmittedDeliverable(
      creator?.name || 'A creator',
      stepName || 'a step',
      version
    ).catch(() => {
      /* a submission must never fail over a notification */
    });
  }

  return { ok: true, version, feedbackId: feedback?.id };
}
