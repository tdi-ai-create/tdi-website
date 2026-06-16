/**
 * Membership Access Helper
 *
 * Central logic for checking whether a user can access content based on their membership tier.
 *
 * Tier hierarchy: free < essentials < professional < all_access
 *
 * Pricing:
 * - free: $0 - rotating content only
 * - essentials: $5/mo - individual downloads and community access
 * - professional: $10/mo - comprehensive resource packs
 * - all_access: $25/mo - full course library
 */

// Tier hierarchy levels
const TIER_LEVELS: Record<string, number> = {
  'free': 0,
  'essentials': 1,
  'professional': 2,
  'all_access': 3,
};

export type MembershipTier = 'free' | 'essentials' | 'professional' | 'all_access';
export type ContentAccessTier = 'free_rotating' | 'essentials' | 'professional' | 'all_access';
export type MembershipSource = 'self' | 'district_partner' | 'admin_assigned' | 'stripe';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface UserMembership {
  tier: MembershipTier;
  source: MembershipSource;
  status: MembershipStatus;
  org_id?: string | null;
  expires_at?: string | null;
}

export interface ContentAccess {
  access_tier: ContentAccessTier | string;
  is_free_rotating?: boolean;
}

export interface ActiveTierOverride {
  user_id: string;
  tier_granted: MembershipTier;
  granted_by_mechanic: string;
  granted_at: string;
  expires_at: string;
}

/**
 * Check if a user's membership tier grants access to a piece of content.
 *
 * Access rules:
 * 1. If content is_free_rotating = true, anyone can access it
 * 2. If user has no membership (or expired), they are 'free' tier
 * 3. If user tier level >= content tier level, access granted
 * 4. district_partner source always maps to all_access
 */
export function canAccessContent(
  membership: UserMembership | null,
  content: ContentAccess,
  overrides?: ActiveTierOverride[] | null
): boolean {
  // Free rotating content is accessible to everyone
  if (content.is_free_rotating) return true;

  // Content marked as free_rotating tier is also accessible
  if (content.access_tier === 'free_rotating') return true;

  const effectiveTier = getEffectiveTier(membership, overrides);

  const userLevel = TIER_LEVELS[effectiveTier] ?? 0;
  const contentLevel = TIER_LEVELS[content.access_tier] ?? 3; // default to highest if unknown

  return userLevel >= contentLevel;
}

/**
 * Get the effective tier for a user, accounting for source
 */
export function getEffectiveTier(
  membership: UserMembership | null,
  overrides?: ActiveTierOverride[] | null
): MembershipTier {
  // Base tier from membership
  let baseTier: MembershipTier = 'free';
  if (membership?.status === 'active' || membership?.status === 'trial') {
    // Check expires_at — if set and in the past, treat as expired (downgrade to free)
    if (membership.expires_at && new Date(membership.expires_at).getTime() <= Date.now()) {
      // Membership has expired — baseTier stays 'free'
    } else {
      if (membership.source === 'district_partner') return 'all_access';
      baseTier = membership.tier;
    }
  }

  // Check for unexpired tier overrides -- take the highest
  if (overrides && overrides.length > 0) {
    const now = new Date().getTime();
    for (const override of overrides) {
      if (new Date(override.expires_at).getTime() > now) {
        const overrideLevel = TIER_LEVELS[override.tier_granted] ?? 0;
        if (overrideLevel > (TIER_LEVELS[baseTier] ?? 0)) {
          baseTier = override.tier_granted;
        }
      }
    }
  }

  return baseTier;
}

/**
 * Get the tier label for display
 */
export function getTierLabel(tier: MembershipTier | ContentAccessTier): string {
  const labels: Record<string, string> = {
    'free': 'Free',
    'free_rotating': 'Free',
    'essentials': 'Essentials ($5/mo)',
    'professional': 'Professional ($10/mo)',
    'all_access': 'All-Access ($25/mo)',
  };
  return labels[tier] || tier;
}

/**
 * Get a short tier label (without price)
 */
export function getShortTierLabel(tier: MembershipTier | ContentAccessTier): string {
  const labels: Record<string, string> = {
    'free': 'Free',
    'free_rotating': 'Free',
    'essentials': 'Essentials',
    'professional': 'Professional',
    'all_access': 'All-Access',
  };
  return labels[tier] || tier;
}

/**
 * Get the minimum tier needed to unlock content
 */
export function getRequiredTierLabel(content: ContentAccess): string {
  if (content.is_free_rotating) return 'Free';
  return getTierLabel(content.access_tier as MembershipTier);
}

/**
 * Get the next tier up from the user's current tier (for upgrade prompts)
 */
export function getNextTier(currentTier: MembershipTier): MembershipTier | null {
  const order: MembershipTier[] = ['free', 'essentials', 'professional', 'all_access'];
  const idx = order.indexOf(currentTier);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

/**
 * Get tier pricing info
 */
export function getTierPricing(tier: MembershipTier): { price: number; period: string } | null {
  const pricing: Record<MembershipTier, { price: number; period: string } | null> = {
    'free': null,
    'essentials': { price: 5, period: 'month' },
    'professional': { price: 10, period: 'month' },
    'all_access': { price: 25, period: 'month' },
  };
  return pricing[tier];
}

/**
 * Check if a user is a district partner (has org-provided access)
 */
export function isDistrictPartner(membership: UserMembership | null): boolean {
  return membership?.source === 'district_partner' && membership?.status === 'active';
}

/**
 * Get tier badge color classes
 */
export function getTierBadgeColors(tier: MembershipTier | ContentAccessTier): string {
  const colors: Record<string, string> = {
    'free': 'bg-gray-100 text-gray-700',
    'free_rotating': 'bg-green-100 text-green-700',
    'essentials': 'bg-blue-100 text-blue-700',
    'professional': 'bg-purple-100 text-purple-700',
    'all_access': 'bg-amber-100 text-amber-700',
  };
  return colors[tier] || 'bg-gray-100 text-gray-700';
}
