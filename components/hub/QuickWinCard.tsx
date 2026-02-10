'use client';

import Link from 'next/link';
import { Clock, Download, Play, FileText } from 'lucide-react';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Stress Relief': '#7C9CBF',
  'Time Savers': '#6BA368',
  'Classroom Tools': '#E8B84B',
  'Communication': '#E8927C',
  'Self-Care': '#9B7CB8',
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
  };
}

export default function QuickWinCard({ quickWin }: QuickWinCardProps) {
  const categoryColor = CATEGORY_COLORS[quickWin.category] || '#E8B84B';

  const getTypeIcon = () => {
    switch (quickWin.content_type) {
      case 'download':
        return <Download size={12} />;
      case 'video':
        return <Play size={12} />;
      default:
        return <FileText size={12} />;
    }
  };

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

  const getActionLabel = () => {
    return quickWin.content_type === 'download' ? 'Download' : 'Try it';
  };

  return (
    <div
      className="hub-card p-4"
      style={{ borderLeft: '4px solid #E8B84B' }}
    >
      {/* Category tag */}
      <span
        className="inline-block text-[11px] font-medium px-2 py-0.5 rounded mb-3"
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {quickWin.category}
      </span>

      {/* Title */}
      <h3
        className="font-bold mb-2"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '16px',
          color: '#2B3A67',
        }}
      >
        {quickWin.title}
      </h3>

      {/* Description */}
      <p
        className="text-[13px] text-gray-500 mb-4 line-clamp-2"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {quickWin.description}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Time badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded"
            style={{
              backgroundColor: '#F5F5F5',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Clock size={12} />
            Takes {quickWin.estimated_minutes} min
          </span>

          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded border"
            style={{
              borderColor: '#E5E5E5',
              color: '#6B7280',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {getTypeIcon()}
            {getTypeLabel()}
          </span>
        </div>

        {/* Action button */}
        <Link
          href={quickWin.course_slug
            ? `/hub/courses/${quickWin.course_slug}/${quickWin.slug}`
            : `/hub/quick-wins/${quickWin.slug}`}
          className="text-[13px] font-medium px-3 py-1.5 rounded-lg border-2 transition-colors hover:bg-[#FFF8E7]"
          style={{
            borderColor: '#E8B84B',
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {getActionLabel()}
        </Link>
      </div>
    </div>
  );
}
