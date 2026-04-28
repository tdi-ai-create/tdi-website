'use client';

import { Star } from 'lucide-react';

interface PracticeNote {
  id: string;
  what_i_tried: string;
  what_i_changed: string | null;
  what_happened: string | null;
  tags: string[];
  helpful_count: number;
  is_hidden: boolean;
  is_staff_seed: boolean;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
  };
  lesson?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  module?: {
    id: string;
    title: string;
  } | null;
}

interface PracticeNoteCardProps {
  note: PracticeNote;
  isMarkedHelpful: boolean;
  onToggleHelpful: (noteId: string) => void;
  onHide?: (noteId: string, hidden: boolean) => void;
  currentUserId: string | null;
  isAdmin: boolean;
  isEnrolled: boolean;
  onEnroll?: () => void;
}

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  'Pre-K to 2nd': { bg: '#EDE9FE', color: '#6D28D9' },
  '3rd to 5th': { bg: '#EDE9FE', color: '#6D28D9' },
  '6th to 8th': { bg: '#EDE9FE', color: '#6D28D9' },
  '9th to 12th': { bg: '#EDE9FE', color: '#6D28D9' },
  'Used as-is': { bg: '#F3F4F6', color: '#6B7280' },
  'Adapted it': { bg: '#DBEAFE', color: '#2563EB' },
  'Skipped parts': { bg: '#F3F4F6', color: '#6B7280' },
  'Combined with other course': { bg: '#F3F4F6', color: '#6B7280' },
};

export default function PracticeNoteCard({
  note,
  isMarkedHelpful,
  onToggleHelpful,
  onHide,
  currentUserId,
  isAdmin,
  isEnrolled,
  onEnroll,
}: PracticeNoteCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (userId: string) => {
    const colors = ['#7C9CBF', '#9B7CB8', '#6BA368', '#E8927C', '#5BBEC4'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return '1 week ago';
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleHelpfulClick = () => {
    if (!currentUserId) return;
    if (!isEnrolled && onEnroll) {
      onEnroll();
      return;
    }
    onToggleHelpful(note.id);
  };

  const sectionRef = note.lesson || note.module;

  return (
    <div
      className="bg-white rounded-2xl p-6 mb-3 transition-shadow hover:shadow-md"
      style={{
        border: note.is_hidden ? '1px solid #FCA5A5' : '0.5px solid rgba(0,0,0,0.06)',
        fontFamily: "'DM Sans', sans-serif",
        opacity: note.is_hidden ? 0.75 : 1,
      }}
    >
      {/* Admin: hidden indicator */}
      {isAdmin && note.is_hidden && (
        <div className="mb-3 text-xs font-semibold px-2.5 py-1 rounded-md inline-block" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          Hidden from public
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(note.user.id) }}
        >
          {getInitials(note.user.first_name, note.user.last_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
              {note.user.first_name} {note.user.last_name}
            </div>
            {note.is_staff_seed && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#FFFBF0', color: '#D97706', border: '1px solid #FFBA06' }}
              >
                TDI
              </span>
            )}
          </div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            {formatDate(note.created_at)}
          </div>
        </div>
      </div>

      {/* Section reference */}
      {sectionRef && (
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md mb-3"
          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#5BBEC4' }}
          />
          {note.module && `Module: ${note.module.title}`}
          {!note.module && note.lesson && `Lesson: ${note.lesson.title}`}
        </div>
      )}

      {/* Body */}
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.04em' }}>
          What I tried
        </div>
        <div className="text-sm leading-relaxed mb-2.5" style={{ color: '#374151' }}>
          {note.what_i_tried}
        </div>

        {note.what_i_changed && (
          <>
            <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.04em' }}>
              What I changed
            </div>
            <div className="text-sm leading-relaxed mb-2.5" style={{ color: '#374151' }}>
              {note.what_i_changed}
            </div>
          </>
        )}

        {note.what_happened && (
          <>
            <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.04em' }}>
              What happened
            </div>
            <div className="text-sm leading-relaxed" style={{ color: '#374151' }}>
              {note.what_happened}
            </div>
          </>
        )}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {note.tags.map((tag, index) => {
            const style = TAG_STYLES[tag] || { bg: '#F3F4F6', color: '#6B7280' };
            return (
              <span
                key={index}
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3.5"
        style={{ borderTop: '0.5px solid #F3F4F6' }}
      >
        <button
          onClick={handleHelpfulClick}
          disabled={!currentUserId}
          className={`flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-lg border transition-all ${
            isMarkedHelpful
              ? 'bg-[#FFFBF0] border-[#FFBA06] text-[#D97706]'
              : 'bg-transparent border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#FFFBF0] hover:border-[#FFBA06] hover:text-[#D97706]'
          } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Star size={14} fill={isMarkedHelpful ? '#D97706' : 'none'} />
          This helped me · {note.helpful_count}
        </button>

        {isAdmin && (
          <button
            onClick={() => onHide?.(note.id, !note.is_hidden)}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: note.is_hidden ? '#D1FAE5' : '#FCA5A5',
              color: note.is_hidden ? '#059669' : '#DC2626',
              backgroundColor: note.is_hidden ? '#F0FDF4' : '#FEF2F2',
            }}
          >
            {note.is_hidden ? 'Unhide' : 'Hide'}
          </button>
        )}
      </div>
    </div>
  );
}
