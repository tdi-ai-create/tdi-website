import { createHmac, timingSafeEqual } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Leaving must be as easy as arriving.
 *
 * An unsubscribe link is followed by mail clients prefetching it, by scanners,
 * and occasionally by someone forwarding the email to a colleague. So the link
 * carries a signature over the address: it proves we generated it, which stops
 * anyone unsubscribing a person by guessing their email, and it needs no
 * database row to be issued.
 *
 * The signing secret is deliberately not its own variable. One more secret to
 * set is one more thing to be unset in production, and a link that silently
 * fails to verify is a link that does not work.
 */

function secret(): string {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET
  if (!s) throw new Error('No secret available to sign unsubscribe links')
  return s
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', secret()).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(String(token || ''))
  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false, which would be a 500 instead of a polite refusal.
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function unsubscribeUrl(email: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
  return `${base}/api/hub/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`
}

/**
 * Addresses that have opted out, lowercased.
 *
 * Returns null rather than an empty set when the lookup fails. A caller that
 * cannot tell "nobody has opted out" from "I could not check" would mail the
 * people who left, so the send is expected to stop instead.
 */
export async function optedOutEmails(
  supabase: SupabaseClient,
  emailType: string
): Promise<Set<string> | null> {
  const { data, error } = await supabase
    .from('hub_email_optouts')
    .select('email, email_type')
    .in('email_type', ['all', emailType])

  if (error) {
    console.error('[hub-optout] Could not read opt outs:', error.message)
    return null
  }
  return new Set((data ?? []).map((r) => String(r.email).trim().toLowerCase()))
}
