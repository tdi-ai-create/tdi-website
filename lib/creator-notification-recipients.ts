/**
 * Centralized notification recipients for Creator Studio emails.
 * Update these when team members change instead of editing every route.
 */
export const CREATOR_STUDIO_RECIPIENTS = [
  'creatorstudio@teachersdeserveit.com',
  'rae@teachersdeserveit.com',
];

// Bella owns the creator relationship and every send is written to
// creator_email_log, so the portal is the record. Rae came off this list on
// 6 Sept 2026: one newsletter run put thirteen copies in her inbox, and a blind
// copy of each individual send is not oversight, it is volume.
export const CREATOR_STUDIO_BCC = [
  'bella@teachersdeserveit.com',
];
