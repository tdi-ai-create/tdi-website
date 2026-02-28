'use client';

import Link from 'next/link';
import { useMembership, ContentAccess, getShortTierLabel, getTierPricing, getRequiredTierLabel } from '@/lib/hub/use-membership';

interface ContentGateProps {
  content: ContentAccess;
  children: React.ReactNode;
  /** Show a blurred preview instead of completely hiding content */
  showPreview?: boolean;
  /** Custom message for the upgrade prompt */
  upgradeMessage?: string;
  /** Optional class name for the container */
  className?: string;
}

/**
 * ContentGate - Conditionally renders content based on user's membership tier.
 *
 * If user has access: renders children normally
 * If user doesn't have access: shows upgrade prompt (optionally with blurred preview)
 */
export function ContentGate({
  content,
  children,
  showPreview = true,
  upgradeMessage,
  className = '',
}: ContentGateProps) {
  const { canAccess, effectiveTier, isLoading } = useMembership();

  // While loading, show a subtle placeholder
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  // User has access - render content normally
  if (canAccess(content)) {
    return <>{children}</>;
  }

  // User doesn't have access - show gate
  const requiredTier = getRequiredTierLabel(content);
  const pricing = getTierPricing(content.access_tier as 'essentials' | 'professional' | 'all_access');

  return (
    <div className={`relative ${className}`}>
      {/* Blurred preview */}
      {showPreview && (
        <div className="relative overflow-hidden rounded-lg">
          <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
            {children}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>
      )}

      {/* Upgrade prompt */}
      <div className={`${showPreview ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm mx-auto text-center">
          {/* Lock icon */}
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {requiredTier} Content
          </h3>

          <p className="text-gray-600 text-sm mb-4">
            {upgradeMessage ||
              `This content requires a ${requiredTier} membership. Upgrade to unlock full access.`}
          </p>

          {/* Current tier badge */}
          <div className="text-xs text-gray-500 mb-4">
            Your current plan: <span className="font-medium">{getShortTierLabel(effectiveTier)}</span>
          </div>

          {/* Upgrade button */}
          <Link
            href="/hub/membership"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {pricing ? `Upgrade for $${pricing.price}/mo` : 'View Plans'}
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple access check component - renders nothing if user doesn't have access.
 * Use when you want to completely hide content rather than show an upgrade prompt.
 */
export function RequireAccess({
  content,
  children,
  fallback,
}: {
  content: ContentAccess;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { canAccess, isLoading } = useMembership();

  if (isLoading) {
    return null;
  }

  if (canAccess(content)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * Tier badge component - shows content's required tier
 */
export function TierBadge({
  content,
  className = '',
}: {
  content: ContentAccess;
  className?: string;
}) {
  const { canAccess } = useMembership();
  const hasAccess = canAccess(content);
  const tierLabel = getShortTierLabel(content.access_tier as 'essentials' | 'professional' | 'all_access');

  // Color based on tier and access
  const colors = content.is_free_rotating || content.access_tier === 'free_rotating'
    ? 'bg-green-100 text-green-700'
    : hasAccess
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors} ${className}`}
    >
      {content.is_free_rotating ? (
        <>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Free This Week
        </>
      ) : !hasAccess ? (
        <>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          {tierLabel}
        </>
      ) : (
        tierLabel
      )}
    </span>
  );
}

/**
 * Free rotating badge - highlights content that's currently free
 */
export function FreeRotatingBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ${className}`}
    >
      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Free This Week
    </span>
  );
}
