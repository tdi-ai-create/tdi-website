import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Who belongs to a partnership, in the Learning Hub.
 *
 * There is one correct answer to this question and there used to be eleven
 * wrong ones. Every `api/partnerships/[id]/*` route asked it separately, and
 * all eleven asked it in a way that could not work:
 *
 *   - Eight opened a connection to the partnerships database and then queried
 *     Hub tables through it. Different project, so the read returned nothing.
 *   - Nine joined through `hub_org_members`, a table that was created and
 *     never populated. It holds zero rows in both databases, so the answer was
 *     always an empty list and every route reported has_data:false.
 *
 * Measured 26 Aug 2026: 216 live partner seats, and every one of those routes
 * saw none of them.
 *
 * The honest record of who holds a seat is `hub_memberships`. It carries
 * partnership_id, and filtering on tier and status matters because
 * contract-expiration downgrades an expired seat to free while leaving both
 * source and status untouched, so an expired seat still looks like a partner
 * seat if you only check those two.
 */

const HUB_URL =
  process.env.LEARNING_HUB_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;

const HUB_SERVICE_KEY =
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY ||
  process.env.LEARNING_HUB_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Service-role client for the Learning Hub project.
 *
 * Deliberately does not fall back to SUPABASE_SERVICE_ROLE_KEY. A fallback to
 * the portal key is how these routes ended up querying the wrong project while
 * looking perfectly healthy, so a missing Hub key should be loud.
 */
export function getHubServiceClient(): SupabaseClient {
  if (!HUB_URL || !HUB_SERVICE_KEY) {
    throw new Error(
      'Learning Hub service credentials are not configured. Set LEARNING_HUB_SUPABASE_URL and LEARNING_HUB_SUPABASE_SERVICE_KEY.'
    );
  }
  return createClient(HUB_URL, HUB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface PartnershipMembers {
  /** Hub user ids holding a live all_access seat for this partnership. */
  userIds: string[];
  /** How the link was found. Useful when a partnership reads unexpectedly empty. */
  matchedBy: 'partnership_id' | 'partnership_slug' | 'none';
}

/**
 * Resolve a partnership to its Hub users.
 *
 * Primary match is `hub_memberships.partnership_id`, which the official
 * provisioning route stamps. Seats created by hand skip that route and leave
 * the column null, so `hub_profiles.partnership_slug` is accepted as a
 * secondary match rather than reporting a provisioned school as empty.
 *
 * St. Mary is the live example: eleven seats created directly in the Hub on
 * 26 Aug 2026, carrying the slug but no partnership_id. Backfilling that
 * column is the real fix and this fallback should be removed once it is done.
 *
 * Email matching is deliberately not offered. Addison has 22 roster rows whose
 * address does not match their seat, so anything keyed on email drifts.
 */
export async function getPartnershipMemberIds(
  partnershipId: string,
  options: { slug?: string | null; hub?: SupabaseClient } = {}
): Promise<PartnershipMembers> {
  const hub = options.hub ?? getHubServiceClient();

  const { data: byId, error: byIdError } = await hub
    .from('hub_memberships')
    .select('user_id')
    .eq('partnership_id', partnershipId)
    .eq('tier', 'all_access')
    .eq('status', 'active');

  // Surface rather than swallow. A discarded error here is exactly how these
  // routes reported "no data" for two months while looking healthy.
  if (byIdError) {
    throw new Error(`hub_memberships read failed: ${byIdError.message}`);
  }

  if (byId && byId.length > 0) {
    return { userIds: byId.map((r) => r.user_id as string), matchedBy: 'partnership_id' };
  }

  if (!options.slug) {
    return { userIds: [], matchedBy: 'none' };
  }

  const { data: profiles, error: profileError } = await hub
    .from('hub_profiles')
    .select('id')
    .eq('partnership_slug', options.slug);

  if (profileError) {
    throw new Error(`hub_profiles read failed: ${profileError.message}`);
  }

  const profileIds = (profiles ?? []).map((r) => r.id as string);
  if (profileIds.length === 0) {
    return { userIds: [], matchedBy: 'none' };
  }

  // Still require a live seat. Holding a profile is not the same as being
  // entitled, and a school whose contract lapsed should not read as active.
  const { data: seated, error: seatedError } = await hub
    .from('hub_memberships')
    .select('user_id')
    .in('user_id', profileIds)
    .eq('tier', 'all_access')
    .eq('status', 'active');

  if (seatedError) {
    throw new Error(`hub_memberships read failed: ${seatedError.message}`);
  }

  return {
    userIds: (seated ?? []).map((r) => r.user_id as string),
    matchedBy: seated && seated.length > 0 ? 'partnership_slug' : 'none',
  };
}

/**
 * Resolve a partnership to its Hub users, looking the slug up on the way.
 *
 * This is what routes should call. It keeps the portal lookup in one place so
 * a route needs a single import and cannot accidentally end up holding both a
 * portal client and a Hub client, which is the mistake that started all this.
 */
export async function resolvePartnershipMembers(
  partnershipId: string
): Promise<PartnershipMembers> {
  const portalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const portalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let slug: string | null = null;
  if (portalUrl && portalKey) {
    const portal = createClient(portalUrl, portalKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await portal
      .from('partnerships')
      .select('slug')
      .eq('id', partnershipId)
      .maybeSingle();
    slug = (data?.slug as string | undefined) ?? null;
  }

  return getPartnershipMemberIds(partnershipId, { slug });
}

/**
 * Activity that represents a person choosing to do something.
 *
 * `account_provisioned` is written when TDI creates the seat, not when the
 * educator turns up. Counting it made Roosevelt read as sixteen active
 * educators when the true number was one, so every engagement figure has to
 * exclude it.
 */
export const PROVISIONING_ACTIONS = ['account_provisioned'] as const;
