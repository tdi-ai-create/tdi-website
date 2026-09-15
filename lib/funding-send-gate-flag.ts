/**
 * Whether the send gate actually blocks, or only reports.
 *
 * Default off, because this is enforcement and enforcement applies to every
 * school the moment it is true. Measured on 15 September 2026: of fourteen
 * packages already sent, six had no document behind the link, so switching
 * this on without working that backlog first would stop real sends people are
 * expecting to go out.
 *
 * The order is: ship reporting only, read what it would have blocked, fix the
 * documents, then set FUNDING_SEND_GATE=true. Rolling back is unsetting one
 * variable and needs no deploy.
 *
 * Kept in its own file rather than in funding-qa.ts so that the gate's logic
 * has no reason to import the QA module, which imports half the funding rules.
 */
export function isSendGateEnforced(): boolean {
  return process.env.FUNDING_SEND_GATE === 'true'
}
