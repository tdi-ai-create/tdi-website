'use client';

import Link from 'next/link';
import { Lock, Heart } from 'lucide-react';
import { useMembership } from '@/lib/hub/use-membership';
import { useTranslation } from '@/lib/hub/useTranslation';
import CoverImageOverlay from '@/components/hub/CoverImageOverlay';

// Category colors - elevated design
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Stress Relief':    { bg: '#FEF3C7', text: '#854F0B' },
  'Communication':    { bg: '#E8F5E9', text: '#27500A' },
  'Time Savers':      { bg: '#EEEDFE', text: '#3C3489' },
  'Para Support':     { bg: '#E1F5EE', text: '#085041' },
  'Classroom Mgmt':   { bg: '#FEE2E2', text: '#991B1B' },
  'Classroom Tools':  { bg: '#FEF3C7', text: '#854F0B' },
  'Wellbeing':        { bg: '#EDE9FE', text: '#4C1D95' },
  'Self-Care':        { bg: '#EDE9FE', text: '#4C1D95' },
};

interface QuickWinCardProps {
  quickWin: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    estimated_minutes: number;
    content_type: 'download' | 'activity' | 'video';
    format_label?: string | null;
    thumbnail_url?: string;
    course_slug?: string;
    access_tier?: string;
    is_free_rotating?: boolean;
    capacity?: 'low' | 'medium' | 'high' | null;
  };
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, type: 'course' | 'quick_win') => void;
  displayTitle?: string;
  displayDescription?: string;
  /** When provided, skips the per-card useMembership hook (perf optimization). */
  hasAccess?: boolean;
}

export default function QuickWinCard({
  quickWin,
  isFavorited = false,
  onToggleFavorite,
  displayTitle,
  displayDescription,
  hasAccess: hasAccessProp,
}: QuickWinCardProps) {
  const colors = CATEGORY_COLORS[quickWin.category] || { bg: '#F3F4F6', text: '#374151' };
  const title = displayTitle || quickWin.title;

  const { canAccess } = useMembership();
  const { tUI } = useTranslation();
  const hasAccess = hasAccessProp ?? canAccess({
    access_tier: quickWin.access_tier || 'essentials',
    is_free_rotating: quickWin.is_free_rotating,
  });
  const isFreeRotating = quickWin.is_free_rotating;

  const getTypeLabel = () => {
    // Prefer the rich DB format label (e.g. "Cheat Sheet", "Cards", "Playbook")
    // over the generic technical type when authors have set one.
    if (quickWin.format_label && quickWin.format_label.trim().length > 0) {
      return tUI(quickWin.format_label);
    }
    switch (quickWin.content_type) {
      case 'download':
        return tUI('Download');
      case 'video':
        return tUI('Video');
      default:
        return tUI('Activity');
    }
  };

  return (
    <div
      className="flex flex-row overflow-hidden relative"
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '0.5px solid rgba(0,0,0,0.06)',
        opacity: !hasAccess && !isFreeRotating ? 0.82 : 1,
      }}
    >
      {/* Left: Cover image / placeholder — 50% width */}
      <CoverImageOverlay
        className="w-1/2 flex-shrink-0"
        imageUrl={quickWin.thumbnail_url}
        imageAlt={quickWin.title}
        liftRating={quickWin.capacity}
        tier={quickWin.access_tier}
        variant="quick-win"
      />

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(quickWin.id, 'quick_win') }}
          className="absolute top-2 right-2 p-1 rounded-full transition-all z-10"
          style={{
            background: isFavorited ? '#FEE2E2' : 'rgba(0,0,0,0.04)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={isFavorited ? tUI('Remove from saved') : tUI('Save quick win')}
        >
          <Heart
            size={12}
            style={{
              color: isFavorited ? '#E53935' : '#9CA3AF',
              fill: isFavorited ? '#E53935' : 'none',
              transition: 'all 0.15s',
            }}
          />
        </button>
      )}

      {/* Right: Content — 50% width */}
      <div className="w-1/2 p-3 flex flex-col justify-center min-w-0">
        {/* Category tag */}
        <div
          className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mb-1 self-start"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {tUI(quickWin.category)}
        </div>

        {/* Title — full, no truncation */}
        <div
          className="text-sm font-semibold mb-1 leading-snug"
          style={{
            color: '#1B2A4A',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {title}
        </div>

        {/* Meta */}
        <div
          className="text-[11px] mb-3"
          style={{
            color: '#9CA3AF',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {quickWin.estimated_minutes} {tUI('min')} · {getTypeLabel()}
        </div>

        {/* Action */}
        {hasAccess ? (
          <Link
            href={quickWin.category === 'Games'
              ? `/hub/practice/${quickWin.slug}`
              : quickWin.course_slug
                ? `/hub/courses/${quickWin.course_slug}/${quickWin.slug}`
                : `/hub/quick-wins/${quickWin.slug}`}
            className="text-xs font-semibold rounded-lg py-2.5 block text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#1B2A4A',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tUI('Try it')}
          </Link>
        ) : (
          <Link
            href="/hub/membership"
            className="text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors hover:bg-gray-50"
            style={{
              border: '1px solid #9CA3AF',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Lock size={10} />
            {tUI('Upgrade')}
          </Link>
        )}
      </div>
    </div>
  );
}
