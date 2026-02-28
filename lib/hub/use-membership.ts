'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';
import {
  UserMembership,
  MembershipTier,
  getEffectiveTier,
  canAccessContent,
  ContentAccess
} from './membership-access';

export interface UseMembershipResult {
  membership: UserMembership | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembership = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        // No user logged in = free tier
        setMembership(null);
        return;
      }

      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from('hub_memberships')
        .select('tier, source, status, org_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // PGRST116 = no rows found, which is fine (user has no membership = free)
        if (fetchError.code === 'PGRST116') {
          setMembership(null);
        } else {
          throw new Error(fetchError.message);
        }
      } else if (data) {
        setMembership({
          tier: data.tier as MembershipTier,
          source: data.source as UserMembership['source'],
          status: data.status as UserMembership['status'],
          org_id: data.org_id,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch membership'));
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const effectiveTier = getEffectiveTier(membership);

  const canAccess = useCallback(
    (content: ContentAccess) => canAccessContent(membership, content),
    [membership]
  );

  return {
    membership,
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
export async function getMembership(userId: string): Promise<UserMembership | null> {
  const { getServiceSupabase } = await import('@/lib/supabase');
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('hub_memberships')
    .select('tier, source, status, org_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    tier: data.tier as MembershipTier,
    source: data.source as UserMembership['source'],
    status: data.status as UserMembership['status'],
    org_id: data.org_id,
  };
}

// Re-export useful types and functions from membership-access
export {
  type UserMembership,
  type MembershipTier,
  type ContentAccess,
  type ContentAccessTier,
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
