'use client';

import { useState, useEffect } from 'react';
import { useHub } from '@/components/hub/HubContext';
import PracticeNoteCard from './PracticeNoteCard';

interface Module {
  id: string;
  title: string;
  sort_order: number;
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  module_id: string | null;
}

interface CommunityPracticeSpaceProps {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
  isEnrolled: boolean;
  onEnroll?: () => void;
}

const GRADE_TAGS = ['Pre-K to 2nd', '3rd to 5th', '6th to 8th', '9th to 12th'];
const ADAPTATION_TAGS = ['Used as-is', 'Adapted it', 'Skipped parts', 'Combined with other course'];

export default function CommunityPracticeSpace({
  courseId,
  modules,
  lessons,
  isEnrolled,
  onEnroll,
}: CommunityPracticeSpaceProps) {
  const { user } = useHub();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [helpfulMarks, setHelpfulMarks] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 20;

  // Form state
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [whatITried, setWhatITried] = useState('');
  const [whatIChanged, setWhatIChanged] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = !!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com');

  useEffect(() => {
    setOffset(0);
    loadNotes(0, true);
  }, [courseId, filter, user?.id]);

  const loadNotes = async (pageOffset = 0, replace = false) => {
    if (pageOffset === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({ courseId, limit: String(PAGE_SIZE), offset: String(pageOffset) });
      if (filter === 'my') params.append('myNotes', 'true');

      const response = await fetch(`/api/hub/practice-notes?${params}`);
      const data = await response.json();
      const loadedNotes = data.notes || [];

      if (replace) {
        setNotes(loadedNotes);
      } else {
        setNotes(prev => [...prev, ...loadedNotes]);
      }
      setTotal(data.total || 0);

      const marked = new Set<string>(replace ? [] : Array.from(helpfulMarks));
      for (const note of loadedNotes) {
        if (note.user_has_marked_helpful) marked.add(note.id);
        else marked.delete(note.id);
      }
      setHelpfulMarks(marked);
    } catch (error) {
      console.error('Error loading practice notes:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    loadNotes(next, false);
  };

  const handleToggleHelpful = async (noteId: string) => {
    if (!user?.id) return;

    if (!isEnrolled && onEnroll) {
      onEnroll();
      return;
    }

    try {
      const response = await fetch(`/api/hub/practice-notes/${noteId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.marked) {
        setHelpfulMarks(prev => new Set([...prev, noteId]));
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, helpful_count: n.helpful_count + 1 } : n));
      } else {
        setHelpfulMarks(prev => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, helpful_count: Math.max(0, n.helpful_count - 1) } : n));
      }
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const handleHide = async (noteId: string, hidden: boolean) => {
    try {
      const response = await fetch(`/api/hub/practice-notes/${noteId}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden }),
      });

      if (response.ok) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_hidden: hidden } : n));
      }
    } catch (error) {
      console.error('Error hiding practice note:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !whatITried.trim() || isSubmitting) return;

    if (!isEnrolled && onEnroll) {
      onEnroll();
      return;
    }

    setIsSubmitting(true);
    try {
      let lessonId = null;
      let moduleId = null;

      if (selectedSection.startsWith('lesson-')) {
        lessonId = selectedSection.replace('lesson-', '');
      } else if (selectedSection.startsWith('module-')) {
        moduleId = selectedSection.replace('module-', '');
      }

      const response = await fetch('/api/hub/practice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          moduleId,
          whatITried,
          whatIChanged: whatIChanged.trim() || null,
          whatHappened: whatHappened.trim() || null,
          tags: selectedTags,
        }),
      });

      if (response.ok) {
        setSelectedSection('');
        setWhatITried('');
        setWhatIChanged('');
        setWhatHappened('');
        setSelectedTags([]);
        setOffset(0);
        loadNotes(0, true);
      }
    } catch (error) {
      console.error('Error submitting practice note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const totalNotes = total;
  const uniqueEducators = new Set(notes.map(n => n.user?.id).filter(Boolean)).size;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#1B2A4A' }}
          >
            From the Practice
          </h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            How educators are using and adapting this course in their classrooms
          </p>
        </div>
        <div className="flex gap-5 text-sm" style={{ color: '#6B7280' }}>
          <span><strong style={{ color: '#1B2A4A' }}>{totalNotes}</strong> practice notes</span>
          <span><strong style={{ color: '#1B2A4A' }}>{uniqueEducators}</strong> educators sharing</span>
        </div>
      </div>

      {/* Share Form — visible to enrolled users; non-enrolled users see enrollment CTA */}
      {user && (
        isEnrolled ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 mb-6"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <h3
              className="text-lg font-semibold mb-1"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#1B2A4A' }}
            >
              Share Your Practice
            </h3>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
              Tell other educators how you used or adapted something from this course. Not a review, just what you tried and what happened.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280' }}>
                Which part of the course does this relate to?
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#374151' }}
              >
                <option value="">Select a module or lesson (optional)</option>
                {modules.map(module => {
                  const moduleLessons = lessons.filter(l => l.module_id === module.id);
                  return (
                    <optgroup key={module.id} label={module.title}>
                      <option value={`module-${module.id}`}>{module.title}</option>
                      {moduleLessons.map(lesson => (
                        <option key={lesson.id} value={`lesson-${lesson.id}`}>
                          &nbsp;&nbsp;&nbsp;&nbsp;{lesson.title}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            <div
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6' }}
            >
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                  What I tried <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(required)</span>
                </label>
                <textarea
                  value={whatITried}
                  onChange={(e) => setWhatITried(e.target.value)}
                  placeholder="What did you do with this content? E.g., 'I used the morning routine checklist with my 3rd graders...'"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg resize-vertical"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#fff', minHeight: '60px' }}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                  What I changed <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(optional)</span>
                </label>
                <textarea
                  value={whatIChanged}
                  onChange={(e) => setWhatIChanged(e.target.value)}
                  placeholder="Did you adapt or skip anything? E.g., 'I skipped Section 2 because my class already does breathing exercises...'"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg resize-vertical"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#fff', minHeight: '60px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                  What happened <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(optional)</span>
                </label>
                <textarea
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value)}
                  placeholder="What was the result? E.g., 'My students were noticeably calmer after recess for the rest of the week...'"
                  className="w-full px-3 py-2.5 text-sm border rounded-lg resize-vertical"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#fff', minHeight: '60px' }}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280' }}>
                Tags (select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[...GRADE_TAGS, ...ADAPTATION_TAGS].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-[#FFFBF0] border-[#FFBA06] text-[#D97706]'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#FFBA06] hover:text-[#D97706]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                Your name will appear with your note. You can edit or delete anytime.
              </span>
              <button
                type="submit"
                disabled={!whatITried.trim() || isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  opacity: !whatITried.trim() || isSubmitting ? 0.5 : 1,
                  cursor: !whatITried.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Sharing...' : 'Share Practice Note'}
              </button>
            </div>
          </form>
        ) : (
          <div
            className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 flex-wrap"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: '#1B2A4A' }}>
                Share your practice with other educators
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>
                Enroll in this course to post notes and mark notes as helpful.
              </div>
            </div>
            <button
              onClick={onEnroll}
              className="px-5 py-2 text-sm font-semibold rounded-lg flex-shrink-0"
              style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
            >
              Post a note
            </button>
          </div>
        )
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div
          className="flex gap-1 bg-white rounded-xl p-1"
          style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[#1B2A4A] text-white'
                : 'bg-transparent text-[#6B7280] hover:bg-[#F9FAFB]'
            }`}
          >
            All Notes
          </button>
          {user && (
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filter === 'my'
                  ? 'bg-[#1B2A4A] text-white'
                  : 'bg-transparent text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              My Notes
            </button>
          )}
        </div>
      </div>

      {/* Notes feed */}
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">
          Loading practice notes...
        </div>
      ) : notes.length === 0 ? (
        <div
          className="text-center py-12 bg-white rounded-2xl"
          style={{ border: '1px dashed #E5E7EB' }}
        >
          <div className="text-4xl mb-3" style={{ color: '#E5E7EB' }}>📝</div>
          <h4 className="text-base font-semibold mb-1" style={{ color: '#1B2A4A' }}>
            No practice notes yet
          </h4>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Be the first to share how you used this course!
          </p>
        </div>
      ) : (
        <>
          {notes.map(note => (
            <PracticeNoteCard
              key={note.id}
              note={note}
              isMarkedHelpful={helpfulMarks.has(note.id)}
              onToggleHelpful={handleToggleHelpful}
              onHide={isAdmin ? handleHide : undefined}
              currentUserId={user?.id || null}
              isAdmin={isAdmin}
              isEnrolled={isEnrolled}
              onEnroll={onEnroll}
            />
          ))}

          {notes.length < total && (
            <div className="text-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-sm font-semibold px-7 py-2.5 border rounded-lg transition-colors"
                style={{
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                  backgroundColor: 'transparent',
                  opacity: isLoadingMore ? 0.6 : 1,
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoadingMore ? 'Loading...' : `Load More Practice Notes (${total - notes.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
