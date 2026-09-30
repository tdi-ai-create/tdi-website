/**
 * How many of a school's team are actually using the Hub.
 *
 * One definition, in one place, because there were three.
 *
 *   The leadership list page computed it here, inline, from live Hub seats and
 *   the shared engagement allowlist. That one is right and this file is a
 *   verbatim lift of it, so that page cannot change behaviour.
 *
 *   The per-school page showed "Hub Login %", which was distinct sign ins in
 *   the current calendar month over provisioned seats. A different question on
 *   a different window, so Addison read 19 there.
 *
 *   The nightly attention-flag cron used `staff_members.hub_login_date` in the
 *   portal CRM over the count of roster rows. Ever rather than this month, and
 *   a roster denominator rather than a seat one, so the same school read 34 in
 *   the warning printed directly underneath the 19. That column also only moves
 *   on a fresh sign in event, so three Glen Ellyn paras who worked all morning
 *   on an existing session still read as 14 August.
 *
 * What this counts: distinct educators holding a live all_access seat who have
 * at least one genuine engagement action in the Hub. Everything the allowlist
 * leaves out was written by TDI rather than earned by the educator, so counting
 * it would report a school as active on the strength of our own outbound.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { isEngagementAction } from '@/lib/hub/partnership-members';

export interface HubEngagement {
  /** Live all_access seats we can attribute to this partnership. */
  seats: number;
  /** Of those, how many have earned at least one engagement action. */
  active: number;
  /** Seat holders, for callers that need to count their own actions. */
  seatUserIds: Set<string>;
  /** The subset that is active. */
  activeUserIds: Set<string>;
  /** A read failed. Never treat this as "nobody is using it". */
  unknown: boolean;
}

function empty(): HubEngagement {
  return { seats: 0, active: 0, seatUserIds: new Set(), activeUserIds: new Set(), unknown: false };
}

/**
 * @param portal the main project client, for partnerships.slug
 * @param hub    the Learning Hub project client
 */
export async function getHubEngagement(
  portal: SupabaseClient,
  hub: SupabaseClient,
  partnershipIds: string[],
): Promise<Map<string, HubEngagement>> {
  const result = new Map<string, HubEngagement>();
  for (const id of partnershipIds) result.set(id, empty());

  if (partnershipIds.length === 0) return result;

  const markUnknown = () => {
    for (const id of partnershipIds) {
      const entry = result.get(id);
      if (entry) entry.unknown = true;
    }
    return result;
  };

  const [slugRes, seatRes, profileRes] = await Promise.all([
    portal.from('partnerships').select('id, slug').in('id', partnershipIds),
    hub
      .from('hub_memberships')
      .select('user_id, partnership_id')
      .in('partnership_id', partnershipIds)
      .eq('tier', 'all_access')
      .eq('status', 'active'),
    hub.from('hub_profiles').select('id, partnership_slug').not('partnership_slug', 'is', null),
  ]);

  for (const [name, res] of [
    ['partnerships', slugRes],
    ['hub_memberships', seatRes],
    ['hub_profiles', profileRes],
  ] as const) {
    if (res.error) {
      // Surfaced rather than swallowed. A discarded error here produces a
      // number that looks authoritative and reports everyone as behind.
      console.error(`[hub-engagement] ${name} read failed:`, res.error.message);
      return markUnknown();
    }
  }

  // Seats by partnership, with a slug fallback for schools provisioned by hand.
  // St. Mary is the live case: eleven seats carrying the slug but no
  // partnership_id, because they skipped the official provisioning route.
  const slugToId = new Map<string, string>();
  for (const p of slugRes.data ?? []) if (p.slug) slugToId.set(String(p.slug), String(p.id));

  const seatUserIds = new Map<string, Set<string>>();
  for (const s of seatRes.data ?? []) {
    const key = String(s.partnership_id);
    if (!seatUserIds.has(key)) seatUserIds.set(key, new Set());
    seatUserIds.get(key)!.add(s.user_id as string);
  }

  const profileByPartnership = new Map<string, Set<string>>();
  for (const pr of profileRes.data ?? []) {
    const pid = slugToId.get(String(pr.partnership_slug));
    if (!pid) continue;
    if (!profileByPartnership.has(pid)) profileByPartnership.set(pid, new Set());
    profileByPartnership.get(pid)!.add(pr.id as string);
  }

  // Only fall back for partnerships with no linked seats at all, and only count
  // a profile if it actually holds a live seat. A profile is not an entitlement:
  // someone who has left still has one.
  const fallbackCandidates = [...profileByPartnership.entries()].filter(
    ([pid]) => (seatUserIds.get(pid)?.size ?? 0) === 0,
  );

  if (fallbackCandidates.length > 0) {
    const candidateIds = [...new Set(fallbackCandidates.flatMap(([, set]) => [...set]))];
    const { data: fallbackSeats, error: fallbackError } = await hub
      .from('hub_memberships')
      .select('user_id')
      .in('user_id', candidateIds)
      .eq('tier', 'all_access')
      .eq('status', 'active');

    if (fallbackError) {
      console.error('[hub-engagement] fallback seat read failed:', fallbackError.message);
      return markUnknown();
    }

    const seated = new Set((fallbackSeats ?? []).map((s) => s.user_id as string));
    for (const [pid, set] of fallbackCandidates) {
      seatUserIds.set(pid, new Set([...set].filter((u) => seated.has(u))));
    }
  }

  const allSeatIds = [...new Set([...seatUserIds.values()].flatMap((s) => [...s]))];

  let activeUsers = new Set<string>();
  if (allSeatIds.length > 0) {
    const { data: activity, error: activityError } = await hub
      .from('hub_activity_log')
      .select('user_id, action')
      .in('user_id', allSeatIds);

    if (activityError) {
      console.error('[hub-engagement] hub_activity_log read failed:', activityError.message);
      return markUnknown();
    }

    activeUsers = new Set(
      (activity ?? [])
        .filter((a) => isEngagementAction(a.action as string | null))
        .map((a) => a.user_id as string),
    );
  }

  for (const id of partnershipIds) {
    const seats = seatUserIds.get(id) ?? new Set<string>();
    const active = new Set([...seats].filter((u) => activeUsers.has(u)));
    result.set(id, {
      seats: seats.size,
      active: active.size,
      seatUserIds: seats,
      activeUserIds: active,
      unknown: false,
    });
  }

  return result;
}

/**
 * The share of a school's seats that are using the Hub, as a whole percent.
 * Null when there are no seats, which is different from zero and must stay
 * different: no seats is our failure to provision, zero active is theirs to act
 * on. Also null when a read failed, because "0%" on an outage puts a school on
 * an attention list it has not earned.
 */
export function hubActivePct(engagement: HubEngagement | undefined): number | null {
  if (!engagement || engagement.unknown || engagement.seats === 0) return null;
  return Math.round((engagement.active / engagement.seats) * 100);
}
