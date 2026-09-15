// ---------------------------------------------------------------------------
// The email that carries a finished application to a school.
//
// Approving a narrative used to produce nothing a person could send. Measured
// on 15 September 2026:
//
//   Cox Charities for St. Peter Chanel reached narrative_status 'ready' that
//   morning. It created no action item, no draft, and no clock.
//
//   funding_email_log held zero rows with status 'draft', so the Outreach
//   Queue, which is the only door a funding email may leave by since PR #500,
//   was empty.
//
//   Every other door is paused. The Send button on the board opens the compose
//   modal, which calls /api/funding/send-email, which refuses.
//
// So the application could not be sent by anyone, through any surface, and
// nothing anywhere said so. The board's "Review and send" card pointed at a
// button that could not send.
//
// Approving now writes the email into the queue as a draft. That is the same
// door the agents' drafts arrive through, it keeps the approval step exactly
// where Rae put it, and the queue's approve path already marks the grant sent
// and schedules the chases. No new way out of the building.
//
// The wording is lifted verbatim from the board's compose handler rather than
// rewritten, so moving it here changes nothing a school receives.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/**
 * Distinguishes these from the follow-up drafts the crons write.
 *
 * funding_email_log.email_type carries a CHECK constraint of six values, and
 * this was 'application_ready' until the first real run rejected every insert.
 * The value has to come from that list, and 'submission_instructions' is
 * precisely what this email is: the package, the timeline and how to submit.
 * Nothing else writes it, so it also serves as the key that stops a second copy
 * of the same application reaching the queue.
 *
 * Second CHECK constraint to bite this change in an hour, after
 * funding_action_items.category. Both were caught only by running the write
 * against the real database, and both would have been invisible had the helper
 * discarded its error the way most of this codebase used to.
 */
export const APPLICATION_EMAIL_TYPE = 'submission_instructions';

export interface ApplicationEmailInput {
  grantName: string;
  /** The school as it calls itself, with our internal suffixes stripped. */
  schoolName: string;
  contactName?: string | null;
  /** The application package. Empty is allowed; the reviewer will see it is missing. */
  docLink?: string | null;
  windowOpens?: string | null;
  windowCloses?: string | null;
}

const usDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

/** Internal naming that a principal should never read. */
export function tidySchoolName(raw: string): string {
  return raw
    .replace(/^\(RENEWAL\)\s*/i, '')
    .replace(/ - Grant Funded Funding$/, '')
    .replace(/ - Grant Funding$/, '')
    .replace(/ - Grant Funded$/, '')
    .trim();
}

export function composeApplicationEmail(input: ApplicationEmailInput): { subject: string; body: string } {
  const firstName = (input.contactName || '').split(' ')[0] || 'there';
  const schoolName = tidySchoolName(input.schoolName || '');
  const docLink = input.docLink || '';

  const windowOpens = input.windowOpens ? new Date(input.windowOpens + 'T00:00:00') : null;
  const windowCloses = input.windowCloses ? new Date(input.windowCloses + 'T00:00:00') : null;
  // Two weeks before the window opens, because Deed verification takes one to two.
  const deedDeadline = windowOpens ? new Date(windowOpens.getTime() - 14 * 86400000) : null;

  const deedDeadlineStr = deedDeadline ? usDate(deedDeadline) : 'as soon as possible';
  const windowOpensStr = windowOpens ? usDate(windowOpens) : 'soon';
  const windowClosesStr = windowCloses ? usDate(windowCloses) : '';

  const subject = `Your ${input.grantName} application is ready. Here is your timeline.`;

  const body =
    `Hi ${firstName},\n\nYour ${input.grantName} grant application for ${schoolName} is complete. ` +
    `We wrote everything for you. You will copy, paste, and submit. Nothing to write from scratch.\n\n` +
    `Here is your application package:\n${docLink}\n\n` +
    `Here is your timeline:\n\n` +
    `THIS WEEK: Set up your Deed account (Step 1 in the document). This takes about 5 minutes but ` +
    `verification takes 1 to 2 weeks, so please do this now. Your deadline to have Deed set up is ${deedDeadlineStr}.\n\n` +
    `${windowOpensStr.toUpperCase()}: The application window opens. We will email you a reminder that day ` +
    `with a link to your application package so you can submit. Submitting takes about 15 minutes.\n\n` +
    `${windowClosesStr ? windowClosesStr.toUpperCase() + ': The window closes. We need to submit before this date.\n\n' : ''}` +
    `You do not need to remember any of these dates. We will follow up at every step. If you miss something, we will reach out.\n\n` +
    `If you want to set up your Deed account together on a call this week, reply to this email and I will ` +
    `schedule 15 minutes. I am happy to walk you through it.\n\n` +
    `Best,\nBella\nTeachers Deserve It`;

  return { subject, body };
}

export interface QueueResult {
  queued: boolean;
  /** Already waiting in the queue, so nothing was added. */
  skipped: boolean;
  /** Why no draft could be written, when the reason is not an error. */
  because?: string;
  error?: string;
}

/**
 * Puts the application email in front of Bella, where she approves sends.
 *
 * Written as a draft and never sent from here. The whole point of the pause is
 * that a person approves each one, and a function that approved its own output
 * would be the sixth door the audit closed.
 */
export async function queueApplicationEmail(
  supabase: DbClient,
  input: ApplicationEmailInput & {
    pursuitId: string;
    opportunityId: string;
    toEmail?: string | null;
    toName?: string | null;
  }
): Promise<QueueResult> {
  if (!input.toEmail) {
    // Not an error. Plenty of pursuits have no contact address yet, and the
    // board already raises that as its own item. Reported so the caller can
    // say it rather than implying a draft is waiting when none is.
    return { queued: false, skipped: false, because: 'this school has no contact email on file' };
  }

  // One draft per application. Approving twice, or approving a redraft, must
  // not put two copies of the same email in the queue: a reviewer approving
  // both would mail the school the same application twice.
  const { data: existing, error: readError } = await supabase
    .from('funding_email_log')
    .select('id')
    .eq('opportunity_id', input.opportunityId)
    .eq('email_type', APPLICATION_EMAIL_TYPE)
    .eq('status', 'draft');

  if (readError) {
    return { queued: false, skipped: false, error: `Could not check the queue: ${readError.message}` };
  }
  if (existing && existing.length > 0) {
    return { queued: false, skipped: true };
  }

  const { subject, body } = composeApplicationEmail(input);

  const { error: insertError } = await supabase.from('funding_email_log').insert({
    pursuit_id: input.pursuitId,
    opportunity_id: input.opportunityId,
    subject,
    body,
    to_email: input.toEmail,
    to_name: input.toName ?? input.contactName ?? null,
    status: 'draft',
    email_type: APPLICATION_EMAIL_TYPE,
  });

  if (insertError) {
    return { queued: false, skipped: false, error: `The application email was not queued: ${insertError.message}` };
  }

  return { queued: true, skipped: false };
}
