'use client';

import Link from 'next/link';
import { Check, Lock, Sparkles, Heart } from 'lucide-react';
import { useMembership, ContentAccess } from '@/lib/hub/use-membership';

// Category colors - elevated design
const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  'Stress & Wellness': { bar: '#7C9CBF', bg: '#E8F0F8', text: '#3D5A80' },
  'Classroom Management': { bar: '#E8B84B', bg: '#FEF3C7', text: '#854F0B' },
  'Time Savers': { bar: '#6BA368', bg: '#E8F5E9', text: '#27500A' },
  'Leadership': { bar: '#9B7CB8', bg: '#EDE9FE', text: '#4C1D95' },
  'Communication': { bar: '#E8927C', bg: '#FEE2E2', text: '#991B1B' },
  'New Teacher': { bar: '#5BBEC4', bg: '#E1F5EE', text: '#085041' },
};

const CAPACITY_STYLES: Record<string, { color: string; label: string }> = {
  low:    { color: '#6BA368', label: 'Low Lift' },
  medium: { color: '#E8B84B', label: 'Medium Lift' },
  high:   { color: '#E8927C', label: 'High Lift' },
};

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    pd_hours: number;
    estimated_minutes: number;
    thumbnail_url?: string;
    access_tier?: string;
    is_free_rotating?: boolean;
    capacity?: 'low' | 'medium' | 'high' | null;
  };
  enrollment?: {
    status: 'active' | 'completed';
    progress_percentage: number;
  } | null;
  onEnroll?: (courseId: string) => void;
  isEnrolling?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, type: 'course' | 'quick_win') => void;
  displayTitle?: string;
  displayDescription?: string;
}

export default function CourseCard({
  course,
  enrollment,
  onEnroll,
  isEnrolling = false,
  isFavorited = false,
  onToggleFavorite,
  displayTitle,
  displayDescription,
}: CourseCardProps) {
  // Use display props if provided, otherwise fall back to course data
  const title = displayTitle || course.title;
  const description = displayDescription || course.description;
  const colors = CATEGORY_COLORS[course.category] || {
    bar: '#E8B84B',
    bg: '#FEF3C7',
    text: '#854F0B',
  };
  const isCompleted = enrollment?.status === 'completed';
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress_percentage || 0;

  // Check access using membership hook
  const { canAccess } = useMembership();
  const contentAccess: ContentAccess = {
    access_tier: course.access_tier || 'all_access',
    is_free_rotating: course.is_free_rotating,
  };
  const hasAccess = canAccess(contentAccess);
  const isFreeRotating = course.is_free_rotating;

  return (
    <div
      className="flex flex-col overflow-hidden relative"
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '0.5px solid rgba(0,0,0,0.06)',
        opacity: !hasAccess && !isFreeRotating ? 0.82 : 1,
      }}
    >
      {/* Category color bar at top */}
      <div
        style={{
          height: '5px',
          backgroundColor: colors.bar,
        }}
      />

      {/* Thumbnail */}
      <div
        className="h-[130px] relative"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-gray-400 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Course thumbnail
            </span>
          </div>
        )}
        {/* Tier badge */}
        {isFreeRotating ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
            <Sparkles size={12} />
            Free This Week
          </span>
        ) : !hasAccess && course.access_tier && course.access_tier !== 'free_rotating' ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white shadow-sm">
            <Lock size={12} />
            {course.access_tier === 'essentials' ? 'Essentials' : course.access_tier === 'professional' ? 'Pro' : 'All-Access'}
          </span>
        ) : null}
      </div>

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(course.id, 'course') }}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-all z-10"
          style={{
            background: isFavorited ? '#FEE2E2' : 'rgba(0,0,0,0.04)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={isFavorited ? 'Remove from saved' : 'Save course'}
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

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category tag */}
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-2 self-start"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {course.category}
        </span>

        {/* Title */}
        <h3
          className="font-semibold mb-2 line-clamp-2"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            color: '#1B2A4A',
            lineHeight: '1.3',
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="text-[13px] mb-4 line-clamp-2 flex-1"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#6B7280',
          }}
        >
          {description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="text-[11px] font-semibold px-2 py-1 rounded"
            style={{
              backgroundColor: '#FEF3C7',
              color: '#854F0B',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {course.pd_hours} PD Hours
          </span>
          <span
            className="text-[12px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#9CA3AF',
            }}
          >
            ~{course.estimated_minutes} min
          </span>
          {course.capacity && CAPACITY_STYLES[course.capacity] && (
            <span
              className="text-[11px] font-semibold px-2 py-1 rounded"
              style={{
                backgroundColor: CAPACITY_STYLES[course.capacity].color + '22',
                color: CAPACITY_STYLES[course.capacity].color,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {CAPACITY_STYLES[course.capacity].label}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.04)' }}
      >
        {isCompleted ? (
          <div
            className="flex items-center justify-center gap-2"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#10B981',
            }}
          >
            <Check size={18} />
            <span className="font-medium">Completed</span>
          </div>
        ) : isEnrolled ? (
          <div className="space-y-2">
            {/* Gradient progress bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FFBA06, #4ecdc4)',
                }}
              />
            </div>
            <Link
              href={`/hub/courses/${course.slug}`}
              className="block w-full text-center py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: '#1B2A4A',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
              }}
            >
              Continue ({progress}%)
            </Link>
          </div>
        ) : !hasAccess ? (
          <Link
            href="/hub/membership"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #9CA3AF',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            }}
          >
            <Lock size={14} />
            Upgrade to Access
          </Link>
        ) : (
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={isEnrolling}
            className="w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#1B2A4A',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            }}
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  );
}
