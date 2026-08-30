import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Has anybody at this school ever signed in.
 *
 * There were three answers to this on one screen and they disagreed.
 *
 *   `invite_accepted_at` is stamped by paths other than a sign in and is
 *   missing for leaders who have signed in. It named Dee Neukirch and Melissa
 *   Mahaney as never having signed in when Supabase had them at 12 Aug and
 *   29 Jul.
 *
 *   `activity_log` actions `login` and `dashboard_viewed` are written by the
 *   app, and those writes were unchecked until 29 Aug, so it has holes. It has
 *   nothing at all for Tidioute, who signed in on 29 Jul.
 *
 *   `auth.users.last_sign_in_at` on `partnerships.portal_user_id` is real, but
 *   it only looks at one person. Addison has two linked leaders and the one who
 *   actually signed in was not the one on that column, so Addison read as
 *   never accessed when somebody there had been using it since 29 July.
 *
 * The answer is last_sign_in_at across every linked user, which is Supabase's
 * own record of a real authentication, for everyone who has access rather than
 * for one nominated contact.
 *
 * Note what this deliberately does not claim. A school can be signed in while
 * its named contact never has, which is Addison exactly. If that distinction
 * matters somewhere, ask this for the school and check the contact separately.
 */
export interface SchoolSignIn {
  /** Nobody linked to this partnership has ever authenticated. */
  neverSignedIn: boolean;
  /** Most recent sign in across every linked user, or null. */
  lastSignInAt: string | null;
  /** Emails of linked users who have signed in at least once. */
  signedInEmails: string[];
  /** True when a lookup failed. Never treat this as "never signed in". */
  unknown: boolean;
}

export async function getSchoolSignIns(
  supabase: SupabaseClient,
  partnershipIds: string[]
): Promise<Map<string, SchoolSignIn>> {
  const result = new Map<string, SchoolSignIn>();
  for (const id of partnershipIds) {
    result.set(id, { neverSignedIn: true, lastSignInAt: null, signedInEmails: [], unknown: false });
  }

  if (partnershipIds.length === 0) return result;

  const { data: links, error } = await supabase
    .from('partnership_users')
    .select('partnership_id, user_id')
    .in('partnership_id', partnershipIds)
    .not('user_id', 'is', null);

  if (error) {
    // A failed read must not read as "nobody ever signed in", which would put
    // every school on an attention list on the strength of one outage.
    console.error('[signed-in] partnership_users read failed:', error.message);
    for (const id of partnershipIds) {
      result.set(id, { neverSignedIn: false, lastSignInAt: null, signedInEmails: [], unknown: true });
    }
    return result;
  }

  await Promise.all(
    (links ?? []).map(async (link) => {
      const pid = link.partnership_id as string;
      const entry = result.get(pid);
      if (!entry) return;

      const { data, error: userError } = await supabase.auth.admin.getUserById(link.user_id as string);

      if (userError) {
        console.error(`[signed-in] auth lookup failed for ${pid}:`, userError.message);
        entry.unknown = true;
        entry.neverSignedIn = false;
        return;
      }

      const at = data?.user?.last_sign_in_at ?? null;
      if (!at) return;

      entry.neverSignedIn = false;
      entry.signedInEmails.push(data?.user?.email ?? 'unknown address');
      if (!entry.lastSignInAt || at > entry.lastSignInAt) entry.lastSignInAt = at;
    })
  );

  return result;
}
