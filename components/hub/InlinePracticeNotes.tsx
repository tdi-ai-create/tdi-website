'use client';

interface InlinePracticeNotesProps {
  courseId: string;
  lessonId: string;
  courseSlug: string;
}

/**
 * Stub added to unblock the TEA-7328 preview build. The full inline practice
 * notes UI (that replaces the removed LessonConversation tab) is tracked as a
 * separate design/implementation follow-up.
 */
export default function InlinePracticeNotes(_props: InlinePracticeNotesProps) {
  return null;
}
