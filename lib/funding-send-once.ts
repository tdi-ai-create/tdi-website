// ---------------------------------------------------------------------------
// Two rules about sending a funding email, both of which were enforced in one
// place and bypassed everywhere else.
//
// RULE ONE: one person receives one email.
//
// The follow-up cron already obeys this. Before drafting it looks for an open
// draft addressed to the same person and, finding one, adds the new ask to it
// rather than starting a second thread. That was built after Gary Doughan had
// six drafts waiting on 2 September, two genuine questions drafted three ways
// each, any one of which was individually sendable.
//
// The rule stopped at that one function. Two other paths create or send client
// email and neither asks the question:
//
//   funding-reminders cron   dedupes on opportunity_id, not on the recipient.
//                            A person with three grants approaching their
//                            deadlines gets three drafts, which is the exact
//                            outcome the rule exists to prevent.
//   the outreach queue       sends the draft in front of the reviewer without
//                            checking whether the same person has another one
//                            waiting behind it.
//
// RULE TWO: a draft sends at most once.
//
// The queue's approve path called Resend first and marked the row sent
// afterwards. Two requests arriving together both read status 'draft', both
// sent, and both then wrote 'sent' over each other. On 8 September Gary
// received the same question twice, ten seconds apart, with identical bodies.
// That is this race, not a drafting fault.
//
// The fix is to claim the row before sending rather than after. The status
// column permits only draft, sent, failed and rejected, so the claim uses
// 'sent' and relies on the affected row count: exactly one caller can move a
// row out of 'draft', and the loser is told so instead of sending.
//
// A claim that never completes leaves status 'sent' with resend_id null, which
// is detectable and reportable. Measured 15 Sep 2026: of 85 sent rows exactly
// one has a null resend_id, so the signature is clean enough to alert on.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export interface WaitingDraft {
  id: string;
  subject: string | null;
}

/**
 * Does this person already have something waiting, other than the row we are
 * about to act on.
 *
 * Addressed on `to_email`, deliberately, and not on the pursuit or the
 * opportunity. Two items for the same school can be owned by two different
 * people, and one grant can generate several asks. The recipient is the thing
 * the rule is about.
 *
 * Returns the oldest, because if a reviewer is going to be told to merge, the
 * thread that has been waiting longest is the one to merge into.
 */
export async function otherOpenDraftFor(
  supabase: DbClient,
  toEmail: string,
  exceptId?: string | null,
): Promise<{ draft: WaitingDraft | null; error?: string }> {
  if (!toEmail) return { draft: null };

  let query = supabase
    .from('funding_email_log')
    .select('id, subject')
    .eq('to_email', toEmail)
    .eq('status', 'draft')
    .order('created_at', { ascending: true })
    .limit(1);

  if (exceptId) query = query.neq('id', exceptId);

  const { data, error } = await query.maybeSingle();

  // Never swallowed. A failed read here is not proof the person has nothing
  // waiting, and treating it as proof is how a second email goes out.
  if (error) return { draft: null, error: error.message };

  return { draft: (data as WaitingDraft) ?? null };
}

export type ClaimOutcome =
  | { claimed: true }
  | { claimed: false; reason: 'already_taken' }
  | { claimed: false; reason: 'error'; message: string };

/**
 * Take exclusive ownership of a draft before sending it.
 *
 * The transition out of 'draft' is the lock. Postgres applies the `eq('status',
 * 'draft')` predicate atomically, so of two concurrent callers exactly one
 * updates a row and the other updates none. Only the winner may call Resend.
 *
 * On a send failure the caller must release the row with `releaseClaim`,
 * otherwise it sits claimed and unsent.
 */
export async function claimDraftForSending(
  supabase: DbClient,
  id: string,
  sentBy: string,
): Promise<ClaimOutcome> {
  const { data, error } = await supabase
    .from('funding_email_log')
    .update({ status: 'sent', sent_at: new Date().toISOString(), sent_by: sentBy })
    .eq('id', id)
    .eq('status', 'draft')
    .select('id');

  if (error) return { claimed: false, reason: 'error', message: error.message };
  if (!data || data.length === 0) return { claimed: false, reason: 'already_taken' };
  return { claimed: true };
}

/**
 * Hand a claimed row back after the send failed.
 *
 * Recorded as 'failed' rather than returned to 'draft'. The attempt happened
 * and the record should say so: a row quietly back in 'draft' reads as though
 * nothing was ever tried.
 */
export async function releaseClaim(
  supabase: DbClient,
  id: string,
  why: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('funding_email_log')
    .update({ status: 'failed', rejected_reason: `Send failed: ${why}`.slice(0, 500) })
    .eq('id', id);

  if (error) {
    console.error('[funding-send-once] Could not release a claimed draft:', error.message);
    return { error: error.message };
  }
  return {};
}
