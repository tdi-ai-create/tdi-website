'use client';

/**
 * Everything an educator wrote during a course, given back to them.
 *
 * Reflections and implementation plans were being stored and never shown to
 * anyone, including the person who wrote them. A plan you write and never see
 * again is a plan you do not do, so this is the surface that makes writing one
 * worth the effort.
 *
 * Deliberately absent: comprehension answers, scores, and anything that marks a
 * plan done. Showing whether they picked B or C turns their own thinking into a
 * graded test, and a nudge is a different feature with different consent.
 */

import { useState, useEffect } from 'react';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useTranslation } from '@/lib/hub/useTranslation';

interface NoteEntry {
  id: string;
  questionText: string;
  answer: string;
  type: 'reflection' | 'action_step';
  lessonTitle: string;
  lessonOrder: number;
}

interface CourseNoteGroup {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  isComplete: boolean;
  totalCheckIns: number;
  entries: NoteEntry[];
}

interface CourseNotesProps {
  userId: string;
}

export default function CourseNotes({ userId }: CourseNotesProps) {
  const { tUI } = useTranslation();
  const [courses, setCourses] = useState<CourseNoteGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getSupabase();

      try {
        // Only the prompts that ask an educator to think or plan. Comprehension
        // questions are counted for "1 of 3" but never shown.
        const { data: questions } = await supabase
          .from('hub_quiz_questions')
          .select('id, lesson_id, question_text, question_type, sort_order')
          .eq('is_active', true);

        if (!questions || questions.length === 0) {
          if (!cancelled) { setCourses([]); setIsLoading(false); }
          return;
        }

        const written = questions.filter(
          (q) => q.question_type === 'reflection' || q.question_type === 'action_step'
        );

        const { data: responses } = await supabase
          .from('hub_quiz_responses')
          .select('id, question_id, response')
          .eq('user_id', userId)
          .in('question_id', written.map((q) => q.id));

        if (!responses || responses.length === 0) {
          if (!cancelled) { setCourses([]); setIsLoading(false); }
          return;
        }

        // Walk lesson to module to course. hub_lessons.course_id is unreliable,
        // so modules are the path.
        const lessonIds = [...new Set(questions.map((q) => q.lesson_id))];
        const { data: lessons } = await supabase
          .from('hub_lessons')
          .select('id, title, sort_order, module_id')
          .in('id', lessonIds);

        const moduleIds = [...new Set((lessons || []).map((l) => l.module_id).filter(Boolean))];
        const { data: modules } = await supabase
          .from('hub_modules')
          .select('id, course_id, sort_order')
          .in('id', moduleIds as string[]);

        const courseIds = [...new Set((modules || []).map((m) => m.course_id))];
        const { data: courseRows } = await supabase
          .from('hub_courses')
          .select('id, slug, title')
          .in('id', courseIds);

        const { data: enrollments } = await supabase
          .from('hub_enrollments')
          .select('course_id, completed_at')
          .eq('user_id', userId)
          .in('course_id', courseIds);

        const lessonById = new Map((lessons || []).map((l) => [l.id, l]));
        const moduleById = new Map((modules || []).map((m) => [m.id, m]));
        const courseById = new Map((courseRows || []).map((c) => [c.id, c]));
        const completedBy = new Map(
          (enrollments || []).map((e) => [e.course_id, !!e.completed_at])
        );
        const answerBy = new Map((responses || []).map((r) => [r.question_id, r.response]));

        const courseOf = (lessonId: string) => {
          const lesson = lessonById.get(lessonId);
          if (!lesson?.module_id) return null;
          const mod = moduleById.get(lesson.module_id);
          return mod ? courseById.get(mod.course_id) : null;
        };

        // How many check-ins each course has, so an in-progress course can say
        // "1 of 3" rather than leaving the educator guessing.
        const checkInLessonsByCourse = new Map<string, Set<string>>();
        questions.forEach((q) => {
          const course = courseOf(q.lesson_id);
          if (!course) return;
          const set = checkInLessonsByCourse.get(course.id) || new Set<string>();
          set.add(q.lesson_id);
          checkInLessonsByCourse.set(course.id, set);
        });

        const grouped = new Map<string, CourseNoteGroup>();
        written.forEach((q) => {
          const answer = answerBy.get(q.id);
          if (!answer || !answer.trim()) return;

          const course = courseOf(q.lesson_id);
          const lesson = lessonById.get(q.lesson_id);
          if (!course || !lesson) return;

          const existing: CourseNoteGroup = grouped.get(course.id) || {
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
            isComplete: completedBy.get(course.id) === true,
            totalCheckIns: checkInLessonsByCourse.get(course.id)?.size || 0,
            entries: [],
          };

          existing.entries.push({
            id: q.id,
            questionText: q.question_text,
            answer: answer.trim(),
            type: q.question_type as 'reflection' | 'action_step',
            lessonTitle: lesson.title,
            lessonOrder: lesson.sort_order ?? 0,
          });

          grouped.set(course.id, existing);
        });

        const result = [...grouped.values()];
        result.forEach((c) => c.entries.sort((a, b) => a.lessonOrder - b.lessonOrder));
        // Finished courses first, then alphabetical, so the ones with a full set
        // of notes lead.
        result.sort((a, b) => {
          if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1;
          return a.courseTitle.localeCompare(b.courseTitle);
        });

        if (!cancelled) { setCourses(result); setIsLoading(false); }
      } catch (error) {
        console.error('Error loading course notes:', error);
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (isLoading || courses.length === 0) return null;

  return (
    <section className="mb-10" id="your-notes">
      <h2
        className="text-lg font-semibold mb-1"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#1e2749' }}
      >
        {tUI('Your Notes')}
      </h2>
      <p className="text-sm mb-5" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
        {tUI('What you wrote as you worked through your courses.')}
      </p>

      <div className="space-y-4">
        {courses.map((course) => {
          const plan = course.entries.find((e) => e.type === 'action_step');

          return (
            <div
              key={course.courseId}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {/* Course header */}
              <div
                className="flex items-center gap-3 flex-wrap"
                style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}
              >
                <span
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#1e2749',
                  }}
                >
                  {course.courseTitle}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    background: course.isComplete ? '#F0FDF4' : '#FEF9EE',
                    color: course.isComplete ? '#16A34A' : '#92400E',
                  }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: '6px',
                      height: '6px',
                      background: course.isComplete ? '#16A34A' : '#E8B84B',
                    }}
                  />
                  {course.isComplete
                    ? tUI('Completed')
                    : `${course.entries.length} ${tUI('of')} ${course.totalCheckIns || course.entries.length}`}
                </span>
              </div>

              {/* Entries */}
              {course.entries.map((entry) => {
                const isPlan = entry.type === 'action_step';
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid #F3F4F6',
                      background: isPlan ? '#FEF9EE' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="rounded-full"
                        style={{
                          width: '7px',
                          height: '7px',
                          background: isPlan ? '#E8B84B' : '#C4CCD8',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: isPlan ? '#92400E' : '#6B7280',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {isPlan ? tUI('Your plan') : tUI('Reflection')}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                        {tUI('after')} {entry.lessonTitle}
                      </span>
                    </div>

                    {/* The prompt. A plan read weeks later without its question
                        is hard to place. */}
                    <div
                      style={{
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        color: '#6B7280',
                        paddingLeft: '14px',
                        borderLeft: '2px solid #E5E7EB',
                        marginBottom: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {entry.questionText}
                    </div>

                    <div
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontSize: '16px',
                        lineHeight: 1.68,
                        color: isPlan ? '#3A2E14' : '#2A3348',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {entry.answer}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div
                className="flex items-center gap-3 flex-wrap"
                style={{ padding: '16px 24px', background: '#FCFCFD' }}
              >
                <a
                  href={`/api/hub/course-notes/${course.courseSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg transition-colors"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4B5563',
                    border: '1.5px solid #E5E7EB',
                    background: '#fff',
                    padding: '9px 16px',
                    fontFamily: "'DM Sans', sans-serif",
                    textDecoration: 'none',
                  }}
                >
                  {tUI('Download these notes')}
                </a>
                {plan && (
                  <span
                    className="flex items-center gap-2"
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12.5px',
                      color: '#9CA3AF',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{ width: '7px', height: '7px', background: '#16A34A' }}
                    />
                    {tUI('Private to you. Never shared with your school.')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
