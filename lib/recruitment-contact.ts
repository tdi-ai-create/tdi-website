/**
 * Contact details on a recruitment candidate.
 *
 * The researcher deliberately leaves email null rather than guessing an
 * address, so almost every candidate arrives without one. That is correct at
 * the top of the funnel and fatal at the bottom: creators.email is NOT NULL and
 * UNIQUE, so converting a candidate with no email fails on a raw database
 * error, and converting someone who is already a creator fails on a duplicate.
 *
 * Bella learns the address when the person replies, often in a social DM. These
 * helpers let her record it at that moment and turn both failure modes into
 * something she can act on.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; error: string }

export function normalizeEmail(raw: unknown): EmailCheck {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (!value) return { ok: false, error: 'Email is required' }
  if (!EMAIL_RE.test(value)) return { ok: false, error: 'That does not look like a valid email address' }
  return { ok: true, email: value }
}

/**
 * Why a conversion cannot proceed, phrased for the person reading it in the
 * portal rather than as a database error.
 */
export function conversionBlockedMessage(reason: 'no_email' | 'already_creator', name: string): string {
  if (reason === 'no_email') {
    return `${name} has no email address on file. Add the address they replied from, then convert.`
  }
  return `${name} is already set up as a creator with that email address. Open them in the Creators tab instead of converting again.`
}
