// ---------------------------------------------------------------------------
// What happens after a grant application reaches a school.
//
// There are two doors to that outcome and until 9 September only one of them
// created any follow-up:
//
//   /api/funding/send-to-client   sends it and creates the chases
//   /api/funding/outreach-queue   approves an agent's draft, sends the very
//                                 same email, sets the same
//                                 forwarding_email_status, and created nothing
//
// So a grant sent through the approval queue was never chased. Nothing asked
// whether the school submitted it, and funding-next-actions skips an
// opportunity once forwarding_email_status is 'sent', so it also dropped out of
// the board. It went quiet and looked finished.
//
// Bella found it by asking whether there should be a next step next to
// "approved" for a draft Amara wrote. There should, and there was not.
//
// This file is the single answer to "what do we owe after sending". Both routes
// call it. A third route that sends without calling it is the bug returning.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SEND_SILENCE_HOURS } from './funding-rules';
type DbClient = any;

/** Matches the convention in lib/funding-pursuit-template.ts for TDI-owned work. */
const TDI_OWNER_EMAIL = 'hello@teachersdeserveit.com';
const TDI_OWNER_NAME = 'Bella';

/** With no window to anchor to, chase weekly from today. */
const WEEKLY_CHASE_DAYS = 7;

export interface FollowUpInput {
  pursuitId: string;
  opportunityId: string;
  /** The funder's own name, as the school would recognise it. */
  grantName: string;
  /** The school contact, used for the first name in each title. */
  contactName?: string | null;
  /** ISO date the application window opens, when the funder publishes one. */
  windowOpens?: string | null;
  now?: Date;
}

export interface FollowUpResult {
  created: number;
  /** Titles created, so a caller can tell a person what it just scheduled. */
  titles: string[];
  /** Already had open follow-ups, so nothing was added. */
  skipped: boolean;
  error?: string;
}

/**
 * Creates the chases we owe ourselves after an application goes to a school.
 *
 * These are TDI's work, never the school's. They were once created with
 * owner_type 'client' and the principal's address, and the nightly reminder
 * engine duly emailed titles written about the principal, to the principal.
 * "Check if Paula set up her Deed account" landed in Paula's inbox, and two
 * principals received 41 of them between them before anyone noticed. Owning
 * them correctly is what prevents that, not sanitising the wording later.
 */
export async function createSendFollowUps(
  supabase: DbClient,
  input: FollowUpInput
): Promise<FollowUpResult> {
  const { pursuitId, opportunityId, grantName, contactName, windowOpens } = input;
  const now = input.now ?? new Date();
  const firstName = (contactName || '').split(' ')[0] || 'the contact';

  // Never stack a second set on top of one already open. Both send paths can
  // run against the same opportunity, and a school chased twice for the same
  // application is exactly the noise this system keeps producing.
  const { data: existing, error: readError } = await supabase
    .from('funding_action_items')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .eq('category', 'follow_up')
    .eq('status', 'pending');

  if (readError) {
    return { created: 0, titles: [], skipped: false, error: `Could not check existing follow-ups: ${readError.message}` };
  }
  if (existing && existing.length > 0) {
    return { created: 0, titles: [], skipped: true };
  }

  const windowDate = windowOpens ? new Date(windowOpens + 'T00:00:00') : null;
  const deedCheckDate = windowDate ? new Date(windowDate.getTime() - 3 * 86400000) : null;
  const reminderDate = windowDate ? new Date(windowDate.getTime()) : null;
  const followUpDate = windowDate
    ? new Date(windowDate.getTime() + 7 * 86400000)
    : new Date(now.getTime() + WEEKLY_CHASE_DAYS * 86400000);

  const day = (d: Date) => d.toISOString().split('T')[0];
  const base = {
    pursuit_id: pursuitId,
    opportunity_id: opportunityId,
    owner_type: 'tdi',
    owner_name: TDI_OWNER_NAME,
    owner_email: TDI_OWNER_EMAIL,
    status: 'pending',
    category: 'follow_up',
    action_size: 'light',
  };

  const rows: Record<string, unknown>[] = [];

  // Window-specific chases. Only meaningful when the funder publishes one.
  if (windowDate && deedCheckDate && reminderDate) {
    rows.push({
      ...base,
      title: `Check if ${firstName} set up their Deed account`,
      description: `Follow up to confirm Deed registration is complete before the ${grantName} window opens. If not started, offer a call to walk through it.`,
      due_date: day(deedCheckDate),
      requires_answer: true,
    });
    rows.push({
      ...base,
      title: `Remind ${firstName}: ${grantName} window is open. Time to submit.`,
      description: 'Send a reminder that the application window is open. Resend the application package link. Offer to submit together on a call.',
      due_date: day(reminderDate),
    });
  }

  // Always created, window or not. This used to sit inside the window branch,
  // so federal formula funds like Title II-A and IDEA/CEIS, which never have a
  // window, got no follow-ups at all. Measured 26 Aug across 32 grants with no
  // exceptions. Title II-A for Saunemin was sent on 17 Aug, filed as complete,
  // and sat unsubmitted and invisible for nine days.
  rows.push({
    ...base,
    title: `Check if ${firstName} submitted the ${grantName} application`,
    description: `Follow up to confirm submission. Ask them to forward the confirmation email to bella@teachersdeserveit.com. If not submitted, offer to walk through it on a call.`,
    due_date: day(followUpDate),
    requires_answer: true,
  });

  const { error: insertError } = await supabase.from('funding_action_items').insert(rows);

  if (insertError) {
    // Reported, never swallowed. The email is already gone by the time this
    // runs, so a silent failure here is a grant nobody ever chases.
    return { created: 0, titles: [], skipped: false, error: `Follow-ups were not created: ${insertError.message}` };
  }

  return { created: rows.length, titles: rows.map((r) => String(r.title)), skipped: false };
}

/**
 * The step Bella is owed the moment she approves a narrative.
 *
 * Approving used to write a status and nothing else. Measured on 15 September:
 * the Cox Charities application for St. Peter Chanel went to 'ready' that
 * morning and produced no action item, no email draft, no change to waiting_on
 * and no clock. The pursuit page builds its work from action items plus the two
 * drafting states, so the grant left "Running by itself" and landed in nothing.
 * The page showed fewer items after she clicked than before.
 *
 * The board did carry a "Review and send" card the whole time, computed live by
 * funding-next-actions. That is the trap in this class of bug: the prompt
 * existed, on the page she had just navigated away from, so the system looked
 * correct from every angle except the one she was standing at.
 *
 * A row in funding_action_items is what makes it real rather than merely
 * displayed. It shows on the pursuit page, it carries a due date so the overdue
 * rule can find it, it reaches the daily digest, and it survives a reload.
 *
 * Owned by TDI, never the school. The school cannot send itself its own
 * application, and an item owned the wrong way is how two principals received
 * forty-one emails written about themselves.
 */
export async function createApprovedSendStep(
  supabase: DbClient,
  input: {
    pursuitId: string;
    opportunityId: string;
    grantName: string;
    contactName?: string | null;
    now?: Date;
  }
): Promise<{ created: boolean; title: string | null; skipped: boolean; error?: string }> {
  const { pursuitId, opportunityId, grantName, contactName } = input;
  const now = input.now ?? new Date();
  const firstName = (contactName || '').split(' ')[0] || 'the school';

  // 'submission' rather than a category of its own. funding_action_items.category
  // carries a CHECK constraint naming seven values, and a 'send' category would
  // have been rejected by the database on every insert while this function
  // cheerfully reported success to a caller that does not read its result. That
  // is the silent-write shape this codebase has already paid for seven times.
  //
  // Approving twice, or approving a redraft of something already approved once,
  // must not stack two identical items. Matching on the category and the path
  // rather than on the title, because the title carries a contact name that can
  // change under it and a duplicate is a duplicate whatever it is called.
  const { data: existing, error: readError } = await supabase
    .from('funding_action_items')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .eq('category', 'submission')
    .in('status', ['pending', 'blocked']);

  if (readError) {
    return { created: false, title: null, skipped: false, error: `Could not check for an existing send step: ${readError.message}` };
  }
  if (existing && existing.length > 0) {
    return { created: false, title: null, skipped: true };
  }

  const due = new Date(now.getTime() + SEND_SILENCE_HOURS * 3600000);
  const title = `Send the ${grantName} application to ${firstName}`;

  const { error: insertError } = await supabase.from('funding_action_items').insert({
    pursuit_id: pursuitId,
    opportunity_id: opportunityId,
    owner_type: 'tdi',
    owner_name: TDI_OWNER_NAME,
    owner_email: TDI_OWNER_EMAIL,
    status: 'pending',
    category: 'submission',
    action_size: 'light',
    title,
    description:
      `Approved and ready. It does nothing for the school until it reaches them. ` +
      `The email is drafted and waiting in the Outreach Queue at the top of the Funding board. ` +
      `Approving it there sends it and schedules the chases.`,
    due_date: due.toISOString().split('T')[0],
  });

  if (insertError) {
    // Never swallowed. A failure here returns the system to exactly the state
    // this function exists to fix: approved, invisible, and chased by nothing.
    return { created: false, title: null, skipped: false, error: `The send step was not created: ${insertError.message}` };
  }

  return { created: true, title, skipped: false };
}
