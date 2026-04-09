'use client';

import { getSupabase } from '@/lib/supabase';

const PARTNER_COOKIE = 'tdi_partnership_id';

function getPartnershipIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + PARTNER_COOKIE + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// Call this after supabase.auth.signUp() succeeds.
// Reads the partner cookie set by middleware and writes partnership_id to hub_profiles.
export async function attributePartnership(userId: string): Promise<void> {
  const partnershipId = getPartnershipIdFromCookie();
  if (!partnershipId) return;

  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_profiles')
    .update({ partnership_id: partnershipId })
    .eq('id', userId)
    .is('partnership_id', null); // Only attribute once

  if (error) {
    console.warn('[TEA-79] Partnership attribution failed (non-fatal):', error.message);
  }
}
