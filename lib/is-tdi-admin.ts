import { getServiceSupabase } from '@/lib/supabase';
import { emailMatchSet } from '@/lib/canonical-email';

/**
 * Single source of truth for "is this person a TDI admin?".
 *
 * Historically several routes gated on the caller's email ending in
 * @teachersdeserveit.com. That silently locked out team members on other
 * domains (Omar on secureplusfinancial.com, Kristin on whatwilllast.com)
 * while letting Rae and Bella through, so the same portal worked for some
 * admins and 403'd for others.
 *
 * Membership is now decided by the tdi_team_members table. The domain check
 * is kept only as a fast path for TDI's own addresses.
 */
export async function isTDIAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const normalized = email.toLowerCase().trim();
  if (normalized.endsWith('@teachersdeserveit.com')) return true;

  // Matches the address given and the mailbox it delivers to, so a plus tag
  // such as team+tdi@whatwilllast.com resolves to the team@ row that already
  // grants access rather than being refused as an unknown address.
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('tdi_team_members')
    .select('id')
    .in('email', emailMatchSet(normalized))
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error('[isTDIAdmin] lookup failed:', error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
