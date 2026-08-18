import { getServiceSupabase } from '@/lib/supabase';

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

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('tdi_team_members')
    .select('id')
    .ilike('email', normalized)
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error('[isTDIAdmin] lookup failed:', error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
