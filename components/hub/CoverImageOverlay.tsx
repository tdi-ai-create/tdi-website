'use client';

import { useTranslation } from '@/lib/hub/useTranslation';

type LiftRating = 'low' | 'medium' | 'high';
type Tier = 'free' | 'free_rotating' | 'essentials' | 'professional' | 'all_access';

const LIFT_STYLES: Record<LiftRating, { bg: string; text: string; label: string }> = {
  low:    { bg: '#D9E8E2', text: '#0F4438', label: 'LIFT · LOW' },
  medium: { bg: '#F4E9D0', text: '#6B4A0F', label: 'LIFT · MED' },
  high:   { bg: '#F0D8CE', text: '#6B2E1A', label: 'LIFT · HIGH' },
};

const TIER_LABELS: Record<string, string> = {
  free: 'FREE',
  free_rotating: 'FREE',
  essentials: 'ESSENTIALS',
  professional: 'PROFESSIONAL',
  all_access: 'ALL-ACCESS',
};

interface CoverImageOverlayProps {
  imageUrl?: string;
  imageAlt: string;
  liftRating?: LiftRating | null;
  tier?: Tier | string | null;
  variant?: 'course' | 'quick-win';
  className?: string;
  children?: React.ReactNode;
}

export default function CoverImageOverlay({
  imageUrl,
  imageAlt,
  liftRating,
  tier,
  variant = 'course',
  className = '',
  children,
}: CoverImageOverlayProps) {
  const { tUI } = useTranslation();
  const inset = variant === 'course' ? 24 : 20;
  const liftStyle = liftRating ? LIFT_STYLES[liftRating] : null;
  const tierLabel = tier ? TIER_LABELS[tier] || tier.toUpperCase().replace('_', '-') : null;

  return (
    <div className={`relative ${className}`} style={{ backgroundColor: '#F5F5F5' }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex flex-col justify-center px-5"
          style={{
            backgroundColor: '#FAFAF5',
            boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: variant === 'course' ? '15px' : '13px',
              fontWeight: 600,
              color: '#1B2A4A',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}
          >
            {imageAlt}
          </span>
        </div>
      )}

      {liftStyle && (
        <span
          role="status"
          aria-label={`${tUI('LIFT rating')}: ${tUI(liftRating!)}`}
          style={{
            position: 'absolute',
            top: inset,
            right: inset,
            backgroundColor: liftStyle.bg,
            color: liftStyle.text,
            borderRadius: 999,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            padding: '3px 8px',
            lineHeight: '1',
            whiteSpace: 'nowrap',
          }}
        >
          {tUI(liftStyle.label)}
        </span>
      )}

      {tierLabel && (
        <span
          role="status"
          aria-label={`${tUI('Tier')}: ${tUI(tierLabel)}`}
          style={{
            position: 'absolute',
            bottom: inset,
            left: inset,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#888780',
            lineHeight: '1',
            whiteSpace: 'nowrap',
          }}
        >
          {tUI(tierLabel)}
        </span>
      )}

      {children}
    </div>
  );
}
