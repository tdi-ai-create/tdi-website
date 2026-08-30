import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Give a person access to a partnership.
 *
 * This is the row that decides whether a leader can open their dashboard.
 * api/partners/auth-check returns 403 without it, so a school that is invited
 * but never linked gets an email, sets a password, signs in, and is told they
 * are not authorised for their own partnership.
 *
 * It used to be an upsert with `onConflict: 'partnership_id,user_id'`.
 * partnership_users has no unique index on that pair, only its primary key on
 * id, so PostgREST answered 42P10 every single time. The error was discarded
 * and the route reported success, which is why this is a lookup followed by an
 * insert or an update rather than an upsert: it needs no constraint to exist,
 * and it cannot fail quietly.
 *
 * Adding the unique index would also work and would be tidier, but a
 * constraint takes effect for every writer the instant it lands, while code
 * arrives on its own schedule. This works today with no migration.
 */
export async function linkPartnershipUser(
  supabase: SupabaseClient,
  params: { partnershipId: string; userId: string; role?: string | null }
): Promise<{ error: string | null }> {
  const role = params.role || 'viewer';

  const { data: existing, error: lookupError } = await supabase
    .from('partnership_users')
    .select('id')
    .eq('partnership_id', params.partnershipId)
    .eq('user_id', params.userId)
    .maybeSingle();

  if (lookupError) {
    return { error: `Could not check existing access: ${lookupError.message}` };
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('partnership_users')
      .update({ role })
      .eq('id', existing.id);

    return { error: updateError ? `Could not update access: ${updateError.message}` : null };
  }

  const { error: insertError } = await supabase.from('partnership_users').insert({
    partnership_id: params.partnershipId,
    user_id: params.userId,
    role,
  });

  return { error: insertError ? `Could not grant access: ${insertError.message}` : null };
}
