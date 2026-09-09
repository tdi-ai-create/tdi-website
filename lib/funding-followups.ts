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
