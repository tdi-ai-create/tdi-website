// ---------------------------------------------------------------------------
// The agreement rules, written once
//
// Two places need to agree about the creator agreement: the reminder the
// creator sees in the portal, and the wall the admin hits when publishing
// their work. When those two carry their own copy of the rule they drift, and
// the drift is invisible until someone publishes unsigned work. That already
// happened three times: Kimberelle Martin, Stephanie Nardi and Kim Lohse are
// all live with no agreement on file.
//
// Note this is a different question from lib/agreement-gate.ts. That one asks
// "should we keep chasing this creator or close them out", which is about
// re-engagement. This one asks "have they signed", which is about permission
// to publish. Same column, unrelated decisions.
// ---------------------------------------------------------------------------

/** The only fields either rule reads. Keeps callers from over-selecting. */
export interface AgreementSubject {
  agreement_signed?: boolean | null;
  agreement_signed_at?: string | null;
  status?: string | null;
}

/** Columns to select when a caller needs to run these rules. */
export const AGREEMENT_COLUMNS = 'agreement_signed, agreement_signed_at, status';

/**
 * Signed means both the flag and the timestamp are present.
 *
 * The route that writes them sets both together and all 22 active creators
 * currently agree, so this is not papering over drift. It reads both so that a
 * half-written row counts as unsigned rather than silently passing the publish
 * gate, which is the direction we want to fail in.
 */
export function hasSignedAgreement(c: AgreementSubject): boolean {
  return c.agreement_signed === true && !!c.agreement_signed_at;
}

/**
 * Rule A. IF the creator is active AND has not signed, THEN remind them.
 *
 * Deliberately has no grace window. A creator who has not signed has not
 * signed, and the reminder is dismissible, so showing it on day one costs
 * them one click and closes the hole that let six people get past it.
 */
export function needsAgreementReminder(c: AgreementSubject): boolean {
  return c.status === 'active' && !hasSignedAgreement(c);
}

/**
 * Rule B. IF work would go live AND the creator has not signed, THEN block it.
 *
 * Applies to publishing only. Submitting work for review stays open, because
 * the nine creators mid-flight missed this step by accident and should not be
 * frozen out of their own project over it.
 */
export function blocksPublish(c: AgreementSubject): boolean {
  return !hasSignedAgreement(c);
}

/** The sentence an admin sees when rule B stops them. */
export const PUBLISH_BLOCKED_MESSAGE =
  'This creator has not signed their Creator Partnership Agreement. ' +
  'Their work cannot be published until they do. They are being reminded in ' +
  'the portal every time they sign in.';
