'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { getCurrentUser } from '@/lib/hub-auth';
import {
  UserMembership,
  MembershipTier,
  ActiveTierOverride,
  getEffectiveTier,
  canAccessContent,
  ContentAccess
} from './membership-access';

export interface UseMembershipResult {
  membership: UserMembership | null;
  overrides: ActiveTierOverride[] | null;
  effectiveTier: MembershipTier;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  canAccess: (content: ContentAccess) => boolean;
}

/**
 * React hook to fetch and manage the current user's Hub membership.
 *
 * Returns:
 * - membership: Raw membership data from the database
 * - effectiveTier: The user's effective tier (accounting for district partners)
 * - isLoading: Whether the membership is being fetched
 * - error: Any error that occurred during fetch
 * - refetch: Function to manually refetch membership
 * - canAccess: Helper to check if user can access specific content
 */
export function useMembership(): UseMembershipResult {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [overrides, setOverrides] = useState<ActiveTierOverride[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembership = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        setMembership(null);
        setOverrides(null);
        return;
      }

      const supabase = getSupabase();

      // Fetch membership and active tier overrides in parallel
      const [membershipResult, overridesResult] = await Promise.all([
        supabase
          .from('hub_memberships')
          .select('tier, source, status, org_id, expires_at')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('active_tier_overrides')
          .select('user_id, tier_granted, granted_by_mechanic, granted_at, expires_at')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString()),
      ]);

      // Process membership
      if (membershipResult.error) {
        if (membershipResult.error.code === 'PGRST116') {
          setMembership(null);
        } else {
          throw new Error(membershipResult.error.message);
        }
      } else if (membershipResult.data) {
        setMembership({
          tier: membershipResult.data.tier as MembershipTier,
          source: membershipResult.data.source as UserMembership['source'],
          status: membershipResult.data.status as UserMembership['status'],
          org_id: membershipResult.data.org_id,
          expires_at: membershipResult.data.expires_at,
        });
      }

      // Process overrides (table may not exist yet -- treat errors as empty)
      if (overridesResult.error) {
        setOverrides(null);
      } else {
        setOverrides((overridesResult.data as ActiveTierOverride[]) || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch membership'));
      setMembership(null);
      setOverrides(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const effectiveTier = getEffectiveTier(membership, overrides);

  const canAccess = useCallback(
    (content: ContentAccess) => canAccessContent(membership, content, overrides),
    [membership, overrides]
  );

  return {
    membership,
    overrides,
    effectiveTier,
    isLoading,
    error,
    refetch: fetchMembership,
    canAccess,
  };
}

/**
 * Server-side function to get user membership.
 * Use in API routes and server components.
 */
export async function getMembership(userId: string): Promise<{
  membership: UserMembership | null;
  overrides: ActiveTierOverride[] | null;
}> {
  const { getServiceSupabase } = await import('@/lib/supabase');
  const supabase = getServiceSupabase();

  const [membershipResult, overridesResult] = await Promise.all([
    supabase
      .from('hub_memberships')
      .select('tier, source, status, org_id, expires_at')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('active_tier_overrides')
      .select('user_id, tier_granted, granted_by_mechanic, granted_at, expires_at')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString()),
  ]);

  const membership = membershipResult.data
    ? {
        tier: membershipResult.data.tier as MembershipTier,
        source: membershipResult.data.source as UserMembership['source'],
        status: membershipResult.data.status as UserMembership['status'],
        org_id: membershipResult.data.org_id,
        expires_at: membershipResult.data.expires_at,
      }
    : null;

  const overrides = overridesResult.error
    ? null
    : (overridesResult.data as ActiveTierOverride[]) || null;

  return { membership, overrides };
}

// Re-export useful types and functions from membership-access
export {
  type UserMembership,
  type MembershipTier,
  type ContentAccess,
  type ContentAccessTier,
  type ActiveTierOverride,
  canAccessContent,
  getEffectiveTier,
  getTierLabel,
  getShortTierLabel,
  getRequiredTierLabel,
  getNextTier,
  getTierPricing,
  isDistrictPartner,
  getTierBadgeColors,
} from './membership-access';
