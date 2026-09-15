// ---------------------------------------------------------------------------
// Funding outbound to schools is paused, except Bella's approval button.
//
// Rae, 15 September 2026: "pause all outbound client emails related to funding
// not sent by Bella via an approval button."
//
// Before this, six code paths could put an email in front of a school and only
// one of them ran the checks. The audit that produced this file found:
//
//   /api/funding/outreach-queue      approve   allowlist + leak check + label check
//   /api/funding/actions/[id]/send-nudge       allowlist + window gate + preview
//   /api/funding/send-email                    allowlist only
//   /api/funding/pursuits/[id]/emails PATCH    nothing
//   /api/funding/nudge                         nothing, and no UI calls it at all
//
// The last two are the reason this exists. The Emails tab put a Send button on
// every draft row, including the drafts the hourly cron writes and addresses to
// Bella for review, and that button ran none of her checks. So the queue was
// never the only way out. It was one of several, and the weakest one decided
// what a principal actually received.
//
// The rule now has one sentence: an email reaches a school only when a person
// approved it in the Outreach Queue. Everything else stops here.
//
// WHAT THIS DOES NOT TOUCH, on purpose:
//
//   - The Outreach Queue approve path. That is the approval button. It does not
//     import this module.
//   - Internal mail. A recipient at teachersdeserveit.com is us, not a client,
//     so escalations to Rae and the nightly digests keep working. Pausing those
//     would hide the fact that the client sends are paused, which is the one
//     failure mode worse than the sends themselves.
//   - Drafting. The crons and the Paperclip agents write rows with
//     status 'draft' and never send, so they are unaffected and the queue keeps
//     filling. Nothing is lost while this is on; it waits.
//
// TO UNPAUSE: set PAUSED to false below, open a PR, merge. One line, one place,
// and it shows up in a diff. There is deliberately no environment variable and
// no database flag: both can be flipped without a review, and the whole point
// of this file is that sending to a school is a reviewed act.
// ---------------------------------------------------------------------------

/** The switch. Flip to false to resume direct sends. */
const PAUSED = true

/** Exported so guards and the UI can ask, rather than duplicating the constant. */
export function isFundingClientSendPaused(): boolean {
  return PAUSED
}

/**
 * Us, or them.
 *
 * Same test the follow-up cron uses to decide whether to send or to draft. If
 * that definition ever changes it must change in both places, which is why this
 * is a named function and not an inline endsWith.
 */
export function isTdiAddress(email: string): boolean {
  return (email ?? '').trim().toLowerCase().endsWith('@teachersdeserveit.com')
}

/**
 * The reason this send is refused, or null if it may proceed.
 *
 * Returns a sentence written for the person who pressed the button, because
 * that person is going to read it and needs to know where the email went
 * instead. "Blocked" on its own gets reported to Rae as a bug.
 */
export function fundingClientSendBlockReason(to: string | null | undefined): string | null {
  if (!PAUSED) return null
  if (!to) return null
  if (isTdiAddress(to)) return null
  return (
    `Sending to ${to} is paused. Funding email reaches a school only through the ` +
    `Outreach Queue approval button. Save this as a draft and approve it there.`
  )
}

/** True when this recipient may be emailed directly right now. */
export function canSendToFundingClient(to: string | null | undefined): boolean {
  return fundingClientSendBlockReason(to) === null
}
