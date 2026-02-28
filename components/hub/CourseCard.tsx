'use client';

import Link from 'next/link';
import { Check, Lock, Sparkles } from 'lucide-react';
import { useMembership, ContentAccess } from '@/lib/hub/use-membership';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#E8B84B',
  'Time Savers': '#6BA368',
  'Leadership': '#9B7CB8',
  'Communication': '#E8927C',
  'New Teacher': '#5BBEC4',
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
  };
  enrollment?: {
    status: 'active' | 'completed';
    progress_percentage: number;
  } | null;
  onEnroll?: (courseId: string) => void;
  isEnrolling?: boolean;
}

export default function CourseCard({
  course,
  enrollment,
  onEnroll,
  isEnrolling = false,
}: CourseCardProps) {
  const categoryColor = CATEGORY_COLORS[course.category] || '#E8B84B';
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
    <div className="hub-card p-0 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div
        className="h-[140px] relative"
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
        {/* Category color band at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: categoryColor }}
        />
        {/* Tier badge */}
        {isFreeRotating ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
            <Sparkles size={12} />
            Free This Week
          </span>
        ) : !hasAccess && course.access_tier && course.access_tier !== 'free_rotating' ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-white shadow-sm">
            <Lock size={12} />
            {course.access_tier === 'essentials' ? 'Essentials' : course.access_tier === 'professional' ? 'Professional' : 'All-Access'}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category tag */}
        <span
          className="inline-block text-[11px] font-medium px-2 py-0.5 rounded mb-2 self-start"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {course.category}
        </span>

        {/* Title */}
        <h3
          className="font-bold mb-2 line-clamp-2"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#2B3A67',
          }}
        >
          {course.title}
        </h3>

        {/* Description */}
        <p
          className="text-[13px] text-gray-500 mb-4 line-clamp-2 flex-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {course.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[12px] font-medium px-2 py-1 rounded"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {course.pd_hours} PD Hours
          </span>
          <span
            className="text-[12px] text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            ~{course.estimated_minutes} min
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t border-gray-100"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        {isCompleted ? (
          <div
            className="flex items-center justify-center gap-2 text-green-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Check size={18} />
            <span className="font-medium">Completed</span>
          </div>
        ) : isEnrolled ? (
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: '#E8B84B',
                }}
              />
            </div>
            <Link
              href={`/hub/courses/${course.slug}`}
              className="block w-full text-center py-2 rounded-lg border-2 font-medium transition-colors"
              style={{
                borderColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Continue ({progress}%)
            </Link>
          </div>
        ) : !hasAccess ? (
          <Link
            href="/hub/membership"
            className="block w-full text-center py-2 rounded-lg font-medium transition-colors border-2"
            style={{
              borderColor: '#6B7280',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Lock size={14} className="inline mr-1.5 -mt-0.5" />
            Upgrade to Access
          </Link>
        ) : (
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={isEnrolling}
            className="w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  );
}
