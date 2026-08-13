// ---------------------------------------------------------------------------
// Creator re-engagement: shared constants and the reactivation URL
//
// The re-engagement cron owns its own thresholds and its own dry-run handling
// via lib/cron-guard. What lives here is the small set of things more than one
// place needs to agree on:
//
//   - the reactivation URL shape, used by the cron's final step and by the
//     paused check-in job, so both send a link that actually resolves
//   - the pacing figures the admin Re-engagement tab reads in order to explain
//     the ladder without duplicating the cron's internals
//   - the send switch for the paused check-in job
//
// The pacing values below mirror STALL_THRESHOLD_DAYS and STEP_INTERVAL_DAYS in
// app/api/cron/creator-reengagement/route.ts. They are read-only here: the cron
// is the authority, and this exists so the admin view can describe it. If the
// cron's values change, change these to match.
// ---------------------------------------------------------------------------

/**
 * Whether the paused check-in job delivers email.
 *
 * Separate from the re-engagement cron, which gates sends through the ?dryRun
 * parameter in lib/cron-guard. This job has no such parameter and reaches
 * people who are already paused, so it carries its own switch.
 */
export const PAUSE_CHECK_IN_SENDS_ENABLED = true;

/** Days a paused creator waits between check-ins. */
export const PAUSE_CHECK_IN_INTERVAL_DAYS = 90;

/** Mirrors the cron. Days without portal activity before a sequence starts. */
export const STALL_THRESHOLD_DAYS = 15;

/** Mirrors the cron. Days between sequence steps. */
export const STEP_INTERVAL_DAYS = 7;

/** Mirrors the cron. A completed or cancelled sequence blocks re-enrolment. */
export const REENROLMENT_COOLDOWN_DAYS = 90;

/** Mirrors the cron. The step that sends the pause notice and pauses. */
export const FINAL_STEP = 6;

// ---------------------------------------------------------------------------
// The agreement gate
//
// A signed agreement is what makes someone a creator. Without one there is no
// commitment on either side, and an unsigned account that never starts is a
// person we are quietly emailing forever rather than a relationship.
//
// After AGREEMENT_GRACE_DAYS, an unsigned account with no real work behind it
// closes on its own, with a warm note that leaves the door open. Anyone who is
// actually working is never closed automatically: they are surfaced to Bella
// instead, because someone building content without a contract needs a
// conversation, not a form letter.
// ---------------------------------------------------------------------------

/** Days a new creator has to sign before the gate applies. */
export const AGREEMENT_GRACE_DAYS = 60;

/**
 * A milestone completed within this window counts as real work, and protects
 * an unsigned creator from automatic closure.
 *
 * Deliberately does NOT consider last_portal_activity_at. That column was
 * backfilled in Aug 2026 and reads 19 Jul for the entire roster, which is a
 * bulk edit date rather than anything a creator did. It will become a good
 * signal once real time has passed; it is not one yet.
 */
export const AGREEMENT_WORK_WINDOW_DAYS = 90;

/** A sign-in within this window also protects an unsigned creator. */
export const AGREEMENT_LOGIN_WINDOW_DAYS = 30;

/** Whether the gate closes accounts. False makes it report only. */
export const AGREEMENT_GATE_ENABLED = true;

export const SITE_URL = 'https://www.teachersdeserveit.com';

/**
 * One-click reactivation URL for a paused creator. Public and token-gated, so
 * it works without signing in. That matters because most of the roster has
 * never signed in, which made the previous dashboard link a dead end.
 */
export function unpauseUrl(token: string): string {
  return `${SITE_URL}/unpause/${token}`;
}
