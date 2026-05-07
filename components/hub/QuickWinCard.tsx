'use client';

import Link from 'next/link';
import { Lock, Sparkles, Heart } from 'lucide-react';
import { useMembership, ContentAccess } from '@/lib/hub/use-membership';

const CAPACITY_STYLES: Record<string, { color: string; label: string }> = {
  low:    { color: '#6BA368', label: 'Low Lift' },
  medium: { color: '#E8B84B', label: 'Medium Lift' },
  high:   { color: '#E8927C', label: 'High Lift' },
};

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
    course_slug?: string;
    access_tier?: string;
    is_free_rotating?: boolean;
    capacity?: 'low' | 'medium' | 'high' | null;
  };
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, type: 'course' | 'quick_win') => void;
  displayTitle?: string;
  displayDescription?: string;
}

export default function QuickWinCard({
  quickWin,
  isFavorited = false,
  onToggleFavorite,
  displayTitle,
  displayDescription,
}: QuickWinCardProps) {
  const colors = CATEGORY_COLORS[quickWin.category] || { bg: '#F3F4F6', text: '#374151' };
  // Use display props if provided, otherwise fall back to quickWin data
  const title = displayTitle || quickWin.title;

  // Check access using membership hook
  const { canAccess } = useMembership();
  const contentAccess: ContentAccess = {
    access_tier: quickWin.access_tier || 'essentials',
    is_free_rotating: quickWin.is_free_rotating,
  };
  const hasAccess = canAccess(contentAccess);
  const isFreeRotating = quickWin.is_free_rotating;

  const getTypeLabel = () => {
    switch (quickWin.content_type) {
      case 'download':
        return 'Download';
      case 'video':
        return 'Video';
      default:
        return 'Activity';
    }
  };

  return (
    <div
      className="p-4 relative"
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '0.5px solid rgba(0,0,0,0.06)',
        opacity: !hasAccess && !isFreeRotating ? 0.82 : 1,
      }}
    >
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(quickWin.id, 'quick_win') }}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-all z-10"
          style={{
            background: isFavorited ? '#FEE2E2' : 'rgba(0,0,0,0.04)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={isFavorited ? 'Remove from saved' : 'Save quick win'}
        >
          <Heart
            size={14}
            style={{
              color: isFavorited ? '#E53935' : '#9CA3AF',
              fill: isFavorited ? '#E53935' : 'none',
              transition: 'all 0.15s',
            }}
          />
        </button>
      )}

      {/* Tier badge - repositioned when favorite button present */}
      {isFreeRotating ? (
        <span className={`absolute ${onToggleFavorite ? 'top-3 right-12' : 'top-3 right-3'} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500 text-white`}>
          <Sparkles size={10} />
          Free
        </span>
      ) : !hasAccess && quickWin.access_tier && quickWin.access_tier !== 'free_rotating' ? (
        <span className={`absolute ${onToggleFavorite ? 'top-3 right-12' : 'top-3 right-3'} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-600 text-white`}>
          <Lock size={10} />
          {quickWin.access_tier === 'essentials' ? 'Essentials' : quickWin.access_tier === 'professional' ? 'Pro' : 'All-Access'}
        </span>
      ) : null}

      {/* Category tag */}
      <div
        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-2"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {quickWin.category}
      </div>

      {/* Title */}
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
        className="text-xs mb-3 flex items-center gap-2 flex-wrap"
        style={{
          color: '#9CA3AF',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>
          {quickWin.estimated_minutes} min
          {quickWin.content_type && ` · ${getTypeLabel()}`}
        </span>
        {quickWin.capacity && CAPACITY_STYLES[quickWin.capacity] && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: CAPACITY_STYLES[quickWin.capacity].color + '22',
              color: CAPACITY_STYLES[quickWin.capacity].color,
            }}
          >
            {CAPACITY_STYLES[quickWin.capacity].label}
          </span>
        )}
      </div>

      {/* Action */}
      {hasAccess ? (
        <Link
          href={quickWin.course_slug
            ? `/hub/courses/${quickWin.course_slug}/${quickWin.slug}`
            : `/hub/quick-wins/${quickWin.slug}`}
          className="text-xs font-semibold rounded-lg px-3 py-1.5 inline-block transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#1B2A4A',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Try it
        </Link>
      ) : (
        <Link
          href="/hub/membership"
          className="text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors hover:bg-gray-50"
          style={{
            border: '1px solid #9CA3AF',
            color: '#6B7280',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Lock size={10} />
          Upgrade
        </Link>
      )}
    </div>
  );
}
