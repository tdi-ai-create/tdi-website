'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InlinePracticeNotesProps {
  courseId: string;
  lessonId: string;
  courseSlug: string;
}

interface CompactNote {
  id: string;
  what_i_tried: string;
  helpful_count: number;
  user: {
    first_name: string;
    last_name: string;
  };
}

export default function InlinePracticeNotes({ courseId, lessonId, courseSlug }: InlinePracticeNotesProps) {
  const [notes, setNotes] = useState<CompactNote[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ courseId, lessonId, limit: '2', offset: '0' });
    fetch(`/api/hub/practice-notes?${params}`)
      .then(r => r.json())
      .then(data => {
        setNotes(data.notes || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [courseId, lessonId]);

  if (isLoading) return null;

  const courseUrl = `/hub/courses/${courseSlug}`;

  return (
    <div className="mt-8 pt-8" style={{ borderTop: '0.5px solid #F3F4F6', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#1B2A4A' }}
        >
          From the Practice
        </h3>
        <Link
          href={courseUrl}
          className="text-xs font-semibold hover:opacity-75 transition-opacity"
          style={{ color: '#E8B84B' }}
        >
          {total > 2 ? `See all ${total} notes →` : 'See all notes →'}
        </Link>
      </div>

      {notes.length === 0 ? (
        <div
          className="text-center py-6 rounded-xl"
          style={{ background: '#FAFAFA', border: '1px dashed #E5E7EB' }}
        >
          <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>
            Be the first to share what you tried in this lesson.
          </p>
          <Link
            href={courseUrl}
            className="text-xs font-semibold px-4 py-2 rounded-lg inline-block transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
          >
            Share a practice note
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map(note => (
            <div
              key={note.id}
              className="bg-white rounded-xl p-4"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
            >
              <p className="text-sm mb-2" style={{ color: '#374151', lineHeight: '1.6' }}>
                {note.what_i_tried.length > 160
                  ? note.what_i_tried.slice(0, 157) + '…'
                  : note.what_i_tried}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  {note.user.first_name} {note.user.last_name.charAt(0)}.
                </span>
                {note.helpful_count > 0 && (
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    ♥ {note.helpful_count}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end pt-1">
            <Link
              href={courseUrl}
              className="text-xs font-semibold hover:opacity-75 transition-opacity"
              style={{ color: '#E8B84B' }}
            >
              Share what you tried →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
