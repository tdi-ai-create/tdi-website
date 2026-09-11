/**
 * Which person an admin session is, for the purposes of approving content.
 *
 * The state machine holds `approver: ['kristin', 'rae']`. Those are people, not
 * accounts, so the mapping is explicit rather than inferred: an approval is
 * signed, and the signature has to mean something. Anyone else with admin access
 * can read the queue and cannot approve from it.
 */
const APPROVER_BY_EMAIL: Record<string, string> = {
  'rae@teachersdeserveit.com': 'rae',
  'kristin@whatwilllast.com': 'kristin',
}

export function approverFor(email: string | null | undefined): string | null {
  if (!email) return null
  return APPROVER_BY_EMAIL[email.trim().toLowerCase()] ?? null
}

export function approverRefusal(email: string | null | undefined): string {
  return `${email || 'This account'} can read the queue but cannot approve from it. Approval is Kristin's or Rae's, and it is recorded under their name.`
}
