'use client';

import Link from 'next/link';
import { Lock, Heart } from 'lucide-react';
import { useMembership, ContentAccess } from '@/lib/hub/use-membership';
import { useTranslation } from '@/lib/hub/useTranslation';

// Category color map -- dot + text color (bolder, each unique)
const CATEGORY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  'Instructional Strategies': { dot: '#059669', bg: '#D1FAE5', text: '#059669' },
  'Assessment':               { dot: '#6366F1', bg: '#E0E7FF', text: '#6366F1' },
  'Classroom Setup':          { dot: '#0891B2', bg: '#CFFAFE', text: '#0891B2' },
  'Communication':            { dot: '#EA580C', bg: '#FFEDD5', text: '#EA580C' },
  'Lesson Planning':          { dot: '#2563EB', bg: '#DBEAFE', text: '#2563EB' },
  'Self-Care':                { dot: '#7C3AED', bg: '#F3E8FF', text: '#7C3AED' },
  'Stress Relief':            { dot: '#BE123C', bg: '#FFE4E6', text: '#BE123C' },
  'Classroom Management':     { dot: '#1e2749', bg: '#E2E4EA', text: '#1e2749' },
  'Games':                    { dot: '#B45309', bg: '#FEF9C3', text: '#B45309' },
  'Time Savers':              { dot: '#0E7490', bg: '#CFFAFE', text: '#0E7490' },
  'Vocational':               { dot: '#4D7C0F', bg: '#ECFCCB', text: '#4D7C0F' },
  'Leadership':               { dot: '#4338CA', bg: '#E0E7FF', text: '#4338CA' },
};

// Lift pill styles
const LIFT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low:    { bg: '#D9E8E2', text: '#0F4438', label: 'Grab & Go' },
  medium: { bg: '#F4E9D0', text: '#6B4A0F', label: 'Short Prep' },
  high:   { bg: '#F0D8CE', text: '#6B2E1A', label: 'Deep Dive' },
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
}

export default function QuickWinCard({
  quickWin,
  isFavorited = false,
  onToggleFavorite,
  displayTitle,
  displayDescription,
}: QuickWinCardProps) {
  const catColors = CATEGORY_COLORS[quickWin.category] || { dot: '#6B7280', bg: '#F3F4F6', text: '#374151' };
  const liftStyle = quickWin.capacity ? LIFT_STYLES[quickWin.capacity] : null;
  const title = displayTitle || quickWin.title;
  const description = displayDescription || quickWin.description;

  const { canAccess } = useMembership();
  const { tUI } = useTranslation();
  const contentAccess: ContentAccess = {
    access_tier: quickWin.access_tier || 'essentials',
    is_free_rotating: quickWin.is_free_rotating,
  };
  const hasAccess = canAccess(contentAccess);
  const isFreeRotating = quickWin.is_free_rotating;

  const getTypeLabel = () => {
    if (quickWin.format_label && quickWin.format_label.trim().length > 0) {
      return tUI(quickWin.format_label);
    }
    switch (quickWin.content_type) {
      case 'download': return tUI('Download');
      case 'video': return tUI('Video');
      default: return tUI('Activity');
    }
  };

  const tierLabel = quickWin.access_tier === 'free' ? 'FREE'
    : quickWin.access_tier === 'professional' ? 'PROFESSIONAL'
    : 'ESSENTIALS';

  return (
    <Link
      href={quickWin.course_slug
        ? `/hub/courses/${quickWin.course_slug}/${quickWin.slug}`
        : `/hub/quick-wins/${quickWin.slug}`}
      className="block"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="flex flex-col relative"
        style={{
          backgroundColor: 'white',
          borderRadius: '14px',
          border: '0.5px solid rgba(0,0,0,0.06)',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          opacity: !hasAccess && !isFreeRotating ? 0.82 : 1,
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.06)';
        }}
      >
        {/* Top row: category dot + name, heart */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span
              style={{
                width: 11, height: 11, borderRadius: '50%',
                background: catColors.dot, flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: catColors.text,
              }}
            >
              {tUI(quickWin.category)}
            </span>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(quickWin.id, 'quick_win'); }}
              className="p-1.5 rounded-full transition-all"
              style={{
                background: isFavorited ? '#FEE2E2' : 'rgba(0,0,0,0.04)',
                border: 'none', cursor: 'pointer',
              }}
              aria-label={isFavorited ? tUI('Remove from saved') : tUI('Save quick win')}
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
        </div>

        {/* Title */}
        <div
          className="font-bold leading-snug mb-1.5"
          style={{ fontSize: 16, color: '#1e2749' }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          className="mb-3"
          style={{
            fontSize: 12, color: '#B8BCC5', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {description}
        </div>

        {/* Bottom row: lift pill + meta, action button */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2.5">
            {liftStyle && (
              <span
                style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 99, background: liftStyle.bg, color: liftStyle.text,
                  whiteSpace: 'nowrap',
                }}
              >
                {tUI(liftStyle.label)}
              </span>
            )}
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {quickWin.estimated_minutes} {tUI('min')} &middot; {getTypeLabel()}
            </span>
          </div>
          {hasAccess ? (
            <span
              className="text-xs font-semibold rounded-lg px-4 py-2 inline-block"
              style={{ backgroundColor: '#1e2749', color: 'white' }}
            >
              {tUI('Try it')}
            </span>
          ) : (
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
              style={{ border: '1px solid #9CA3AF', color: '#6B7280' }}
            >
              <Lock size={10} />
              {tUI('Upgrade')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
