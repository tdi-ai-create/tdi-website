'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useProgressTracking } from '@/lib/hooks/useProgressTracking';
import CourseCompletionModal from '@/components/hub/CourseCompletionModal';
import { useTranslation } from '@/lib/hub/useTranslation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  List,
  X,
  Clock,
  MessageCircle,
} from 'lucide-react';
import {
  type QuizQuestion,
  type QuizResponse,
  type QuizOption,
  getCourseQuestions,
  getCourseResponses,
  computeGatePositions,
  saveQuizResponse,
  checkMultipleChoiceAnswer,
  checkTrueFalseAnswer,
} from '@/lib/hub/quiz';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LessonContentJson {
  body_html?: string;
  video_id?: string;
  text?: string;
  markdown?: string;
  [key: string]: unknown;
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  content: LessonContentJson | string | null;
  estimated_minutes: number;
  type: string;
  sort_order: number;
  module_id: string | null;
  transcript: string | null;
  transcript_es: string | null;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  pd_hours: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractBodyHtml(content: LessonContentJson | string | null): string | null {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (content.body_html && typeof content.body_html === 'string') return content.body_html;
  if (content.text && typeof content.text === 'string') return content.text;
  if (content.markdown && typeof content.markdown === 'string') return content.markdown;
  return null;
}

function extractVideoId(lesson: Lesson): string | null {
  if (lesson.content && typeof lesson.content === 'object' && lesson.content.video_id) {
    return lesson.content.video_id as string;
  }
  return null;
}

function getGateHeader(questionType: string): string {
  switch (questionType) {
    case 'multiple_choice':
    case 'true_false':
      return "Let's make sure this clicked";
    case 'reflection':
      return 'Your turn to think on this';
    case 'action_step':
      return 'Something to try this week';
    case 'checkpoint':
      return 'Before you go, the big ideas';
    default:
      return "Let's make sure this clicked";
  }
}

// ---------------------------------------------------------------------------
// Dark Mode hook (localStorage)
// ---------------------------------------------------------------------------

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tdi-lesson-dark-mode');
    if (stored === 'true') setDark(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem('tdi-lesson-dark-mode', String(next));
      return next;
    });
  }, []);

  return { dark, toggle };
}

// ---------------------------------------------------------------------------
// Auto-advance hook (localStorage)
// ---------------------------------------------------------------------------

function useAutoAdvance() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tdi-lesson-auto-advance');
    if (stored === 'true') setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('tdi-lesson-auto-advance', String(next));
      return next;
    });
  }, []);

  return { enabled, toggle };
}

// ---------------------------------------------------------------------------
// Gate Card Component
// ---------------------------------------------------------------------------

interface GateCardProps {
  question: QuizQuestion;
  userId: string;
  dark: boolean;
  onGateCleared: () => void;
}

function GateCard({ question, userId, dark, onGateCleared }: GateCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [gateCleared, setGateCleared] = useState(false);

  const header = getGateHeader(question.question_type);

  const handleMultipleChoiceSelect = async (idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);

    const options = question.options as QuizOption[];
    const correct = checkMultipleChoiceAnswer(options, idx);
    setWasCorrect(correct);
    setAnswered(true);

    await saveQuizResponse(
      userId,
      question.id,
      question.lesson_id,
      options[idx].text,
      correct
    );
  };

  const handleTrueFalseSelect = async (answer: string) => {
    if (answered) return;
    const idx = answer === 'True' ? 0 : 1;
    setSelectedIndex(idx);

    const correct = checkTrueFalseAnswer(question.correct_answer || '', answer);
    setWasCorrect(correct);
    setAnswered(true);

    await saveQuizResponse(
      userId,
      question.id,
      question.lesson_id,
      answer,
      correct
    );
  };

  const handleSaveReflection = async () => {
    if (reflectionText.trim().length < 50) return;
    setSaving(true);

    await saveQuizResponse(
      userId,
      question.id,
      question.lesson_id,
      reflectionText,
      null
    );

    setSaving(false);
    setAnswered(true);
  };

  const handleActionCommit = async () => {
    setSaving(true);

    await saveQuizResponse(
      userId,
      question.id,
      question.lesson_id,
      actionNotes.trim() || 'Committed to try',
      null
    );

    setSaving(false);
    setAnswered(true);
  };

  const handleCheckpointContinue = async () => {
    setSaving(true);

    await saveQuizResponse(
      userId,
      question.id,
      question.lesson_id,
      'Reviewed',
      null
    );

    setSaving(false);
    setAnswered(true);
    setGateCleared(true);
    onGateCleared();
  };

  const handleContinue = () => {
    setGateCleared(true);
    onGateCleared();
  };

  const cardBg = dark ? 'rgba(254,249,238,0.04)' : '#FEF9EE';
  const cardBorder = dark ? 'rgba(232,184,75,0.2)' : 'rgba(232,184,75,0.3)';

  // Multiple choice / True-false gate
  if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
    const options: QuizOption[] =
      question.question_type === 'true_false'
        ? [{ text: 'True' }, { text: 'False' }]
        : (question.options as QuizOption[]) || [];

    const correctIndex =
      question.question_type === 'true_false'
        ? question.correct_answer?.toLowerCase() === 'true'
          ? 0
          : 1
        : options.findIndex((o) => o.is_correct);

    return (
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: cardBg,
          borderLeft: '3px solid #E8B84B',
          border: `1px solid ${cardBorder}`,
          borderLeftWidth: '3px',
          borderLeftColor: '#E8B84B',
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: dark ? '#F3F4F6' : '#1E2749',
          }}
        >
          {header}
        </h3>

        <p
          className="text-sm mb-5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: dark ? '#D1D5DB' : '#374151',
            lineHeight: '1.6',
          }}
        >
          {question.question_text}
        </p>

        <div className="space-y-2.5">
          {options.map((option, idx) => {
            let borderColor = dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
            let bg = dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
            let textColor = dark ? '#E5E7EB' : '#374151';

            if (answered) {
              if (idx === correctIndex) {
                borderColor = '#16A34A';
                bg = dark ? 'rgba(22,163,74,0.1)' : '#F0FDF4';
                textColor = '#15803D';
              }
              if (idx === selectedIndex && idx !== correctIndex) {
                borderColor = '#DC2626';
                bg = dark ? 'rgba(220,38,38,0.1)' : '#FEF2F2';
                textColor = '#DC2626';
              }
            } else if (idx === selectedIndex) {
              borderColor = '#E8B84B';
              bg = dark ? 'rgba(232,184,75,0.1)' : '#FFF8E7';
            }

            return (
              <button
                key={idx}
                onClick={() =>
                  question.question_type === 'true_false'
                    ? handleTrueFalseSelect(option.text)
                    : handleMultipleChoiceSelect(idx)
                }
                disabled={answered}
                className="w-full text-left px-4 py-3 rounded-lg transition-all"
                style={{
                  border: `1.5px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  cursor: answered ? 'default' : 'pointer',
                  opacity: answered && idx !== selectedIndex && idx !== correctIndex ? 0.5 : 1,
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {answered && question.explanation && (
          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              color: dark ? '#D1D5DB' : '#4B5563',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: '1.5',
            }}
          >
            {question.explanation}
          </div>
        )}

        {answered && !gateCleared && (
          <button
            onClick={handleContinue}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: '#E8B84B',
              color: '#1E2749',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {wasCorrect ? 'You got it. Keep going.' : 'Got it. On to the next one.'}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // Reflection gate
  if (question.question_type === 'reflection') {
    return (
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: cardBg,
          borderLeft: '3px solid #E8B84B',
          border: `1px solid ${cardBorder}`,
          borderLeftWidth: '3px',
          borderLeftColor: '#E8B84B',
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: dark ? '#F3F4F6' : '#1E2749',
          }}
        >
          {header}
        </h3>

        <p
          className="text-sm mb-5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: dark ? '#D1D5DB' : '#374151',
            lineHeight: '1.6',
          }}
        >
          {question.question_text}
        </p>

        {!answered ? (
          <>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Write your reflection here..."
              rows={4}
              className="w-full rounded-lg p-3 text-sm resize-y"
              style={{
                border: `1.5px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                color: dark ? '#E5E7EB' : '#374151',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
            />
            <div className="flex items-center justify-between mt-3">
              <span
                className="text-xs"
                style={{
                  color: reflectionText.length >= 50 ? '#16A34A' : (dark ? '#9CA3AF' : '#9CA3AF'),
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {reflectionText.length}/50 characters minimum
              </span>
              <button
                onClick={handleSaveReflection}
                disabled={reflectionText.trim().length < 50 || saving}
                className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: reflectionText.trim().length >= 50 ? '#E8B84B' : (dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'),
                  color: reflectionText.trim().length >= 50 ? '#1E2749' : (dark ? '#6B7280' : '#9CA3AF'),
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: reflectionText.trim().length >= 50 ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>
          </>
        ) : !gateCleared ? (
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: '#E8B84B',
              color: '#1E2749',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Nice. On to the next one.
            <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
    );
  }

  // Action step gate
  if (question.question_type === 'action_step') {
    return (
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: cardBg,
          borderLeft: '3px solid #E8B84B',
          border: `1px solid ${cardBorder}`,
          borderLeftWidth: '3px',
          borderLeftColor: '#E8B84B',
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: dark ? '#F3F4F6' : '#1E2749',
          }}
        >
          {header}
        </h3>

        {/* Action step callout */}
        <div
          className="rounded-lg p-4 mb-4 text-sm"
          style={{
            backgroundColor: dark ? 'rgba(232,184,75,0.08)' : '#FFF8E7',
            border: `1px solid ${dark ? 'rgba(232,184,75,0.2)' : '#FDE68A'}`,
            color: dark ? '#E5E7EB' : '#374151',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: '1.6',
          }}
        >
          {question.question_text}
        </div>

        {!answered ? (
          <>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Optional: Add notes about how this went..."
              rows={3}
              className="w-full rounded-lg p-3 text-sm resize-y mb-3"
              style={{
                border: `1.5px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                color: dark ? '#E5E7EB' : '#374151',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
            />
            <button
              onClick={handleActionCommit}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{
                backgroundColor: '#E8B84B',
                color: '#1E2749',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {saving ? 'Saving...' : "I'll try this"}
            </button>
          </>
        ) : !gateCleared ? (
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: '#E8B84B',
              color: '#1E2749',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Something to try this week. On to the next one.
            <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
    );
  }

  // Checkpoint gate
  if (question.question_type === 'checkpoint') {
    // Parse options as takeaway bullets if available, otherwise use question_text
    const takeaways: string[] = [];
    if (question.options && Array.isArray(question.options)) {
      question.options.forEach((opt: QuizOption) => {
        if (opt.text) takeaways.push(opt.text);
      });
    }
    if (takeaways.length === 0 && question.question_text) {
      // Split by newline if the question_text has multiple lines
      question.question_text.split('\n').filter(Boolean).forEach((line) => takeaways.push(line));
    }

    return (
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: cardBg,
          borderLeft: '3px solid #E8B84B',
          border: `1px solid ${cardBorder}`,
          borderLeftWidth: '3px',
          borderLeftColor: '#E8B84B',
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: dark ? '#F3F4F6' : '#1E2749',
          }}
        >
          {header}
        </h3>

        <ul className="space-y-2.5 mb-5">
          {takeaways.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-sm"
              style={{
                color: dark ? '#D1D5DB' : '#374151',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: '1.6',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#E8B84B' }}
              />
              {item}
            </li>
          ))}
        </ul>

        {!gateCleared && (
          <button
            onClick={handleCheckpointContinue}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: '#E8B84B',
              color: '#1E2749',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {saving ? 'Saving...' : 'Ready to continue'}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // Fallback: render nothing
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LessonPageProps {
  params: Promise<{ slug: string; lesson: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { slug, lesson: lessonSlug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();
  const { tUI } = useTranslation();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { enabled: autoAdvance, toggle: toggleAutoAdvance } = useAutoAdvance();

  // Data state
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Gate state (course-wide)
  const [courseQuestions, setCourseQuestions] = useState<QuizQuestion[]>([]);
  const [courseResponses, setCourseResponses] = useState<Record<string, QuizResponse>>({});
  const [gates, setGates] = useState<Map<number, QuizQuestion>>(new Map());

  // Gate cleared locally (so UI updates immediately without refetch)
  const [locallyCleared, setLocallyCleared] = useState<Set<string>>(new Set());

  // UI state
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptLang, setTranscriptLang] = useState<'en' | 'es'>('en');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; undoLessonId?: string } | null>(null);

  // Progress tracking
  const { progress, certificateEarned, clearCertificateEarned, markLessonStatus, refetch } =
    useProgressTracking(course?.id || null, user?.id || null);

  // Celebration modal
  const [showCelebration, setShowCelebration] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch course and lesson data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // 1. Fetch course by slug
        const { data: courseData, error: courseError } = await supabase
          .from('hub_courses')
          .select('id, slug, title, pd_hours')
          .eq('slug', slug)
          .single();

        if (courseError || !courseData) {
          router.push('/hub/courses');
          return;
        }
        setCourse(courseData);

        // 2. Check enrollment
        const { data: enrollment } = await supabase
          .from('hub_enrollments')
          .select('id')
          .eq('course_id', courseData.id)
          .eq('user_id', user.id)
          .single();

        if (!enrollment) {
          router.push(`/hub/courses/${slug}`);
          return;
        }

        // 3. Fetch modules for this course
        const { data: modulesData } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        const moduleIds = (modulesData || []).map((m) => m.id);

        // 4. Fetch lessons via module_id (NOT course_id)
        const { data: lessonsData } = moduleIds.length > 0
          ? await supabase
              .from('hub_lessons')
              .select('id, slug, title, content, estimated_minutes, type, sort_order, module_id, transcript, transcript_es')
              .in('module_id', moduleIds)
              .order('sort_order', { ascending: true })
          : { data: [] as Lesson[] };

        if (!lessonsData || lessonsData.length === 0) {
          router.push(`/hub/courses/${slug}`);
          return;
        }

        // 5. Build module/lesson structure
        const moduleMap = new Map<string, Module>();
        const unassigned: Lesson[] = [];

        modulesData?.forEach((mod) => {
          moduleMap.set(mod.id, { id: mod.id, title: mod.title, sort_order: mod.sort_order, lessons: [] });
        });

        (lessonsData as Lesson[]).forEach((lesson) => {
          if (lesson.module_id && moduleMap.has(lesson.module_id)) {
            moduleMap.get(lesson.module_id)!.lessons.push(lesson);
          } else {
            unassigned.push(lesson);
          }
        });

        let finalModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);

        if (unassigned.length > 0) {
          if (finalModules.length === 0) {
            finalModules = [{ id: 'default', title: tUI('Course Content'), sort_order: 0, lessons: unassigned }];
          } else {
            finalModules[0].lessons = [...unassigned, ...finalModules[0].lessons];
          }
        }

        setModules(finalModules);
        setExpandedModules(new Set(finalModules.map((m) => m.id)));

        // Flat ordered lesson list
        const ordered: Lesson[] = [];
        finalModules.forEach((mod) => mod.lessons.forEach((l) => ordered.push(l)));
        setAllLessons(ordered);

        // 6. Find current lesson (match by slug or ID since slugs may be null)
        const current = ordered.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
        if (!current) {
          router.push(`/hub/courses/${slug}`);
          return;
        }
        setCurrentLesson(current);

        // 7. Load course-wide quiz questions + responses
        const allLessonIds = ordered.map((l) => l.id);
        const allQuestions = await getCourseQuestions(allLessonIds);
        setCourseQuestions(allQuestions);

        const questionIds = allQuestions.map((q) => q.id);
        const responseMap = await getCourseResponses(user.id, questionIds);
        setCourseResponses(responseMap);

        // 8. Compute gate positions
        const gateMap = computeGatePositions(allQuestions, ordered.length);
        setGates(gateMap);

        // Reset locally cleared set on lesson change
        setLocallyCleared(new Set());
      } catch (error) {
        console.error('Error loading lesson data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [slug, lessonSlug, user?.id, router, tUI]);

  // Show celebration modal when certificate is earned
  useEffect(() => {
    if (certificateEarned) setShowCelebration(true);
  }, [certificateEarned]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isLastLesson = currentIndex === allLessons.length - 1;
  const lessonStatus = currentLesson
    ? progress.lessonProgress.get(currentLesson.id)?.status || 'not_started'
    : 'not_started';
  const isComplete = lessonStatus === 'completed';

  // Gate logic
  const currentGate = gates.get(currentIndex) || null;
  const isGateActive = currentGate !== null && !courseResponses[currentGate.id] && !locallyCleared.has(currentGate.id);
  const isNextLocked = currentGate !== null && !courseResponses[currentGate.id] && !locallyCleared.has(currentGate.id);

  // Build a set of "locked" lesson indices: lessons after an uncleared gate
  const lockedLessonIndices = new Set<number>();
  if (gates.size > 0) {
    // Walk through all gate positions. Any lesson after an uncleared gate is locked.
    const gateIndices = Array.from(gates.keys()).sort((a, b) => a - b);
    for (const gateIdx of gateIndices) {
      const gateQ = gates.get(gateIdx)!;
      const isCleared = !!courseResponses[gateQ.id] || locallyCleared.has(gateQ.id);
      if (!isCleared) {
        // Lock all lessons after this gate
        for (let i = gateIdx + 1; i < allLessons.length; i++) {
          lockedLessonIndices.add(i);
        }
        break; // First uncleared gate blocks everything after it
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const showToast = (message: string, undoLessonId?: string) => {
    setToast({ message, undoLessonId });
    setTimeout(() => setToast(null), 5000);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    await markLessonStatus(currentLesson.id, 'completed');
    await refetch();
    showToast(tUI('Lesson complete'), currentLesson.id);

    // Auto-advance (only if no uncleared gate on current lesson)
    if (autoAdvance && nextLesson && !isNextLocked) {
      setTimeout(() => {
        router.push(`/hub/courses/${slug}/${nextLesson.slug || nextLesson.id}`);
      }, 800);
    }
  };

  const handleUndoComplete = async () => {
    if (!toast?.undoLessonId) return;
    await markLessonStatus(toast.undoLessonId, 'not_started');
    await refetch();
    setToast(null);
  };

  const handleCompleteCourse = async () => {
    if (!currentLesson) return;
    if (!isComplete) {
      await markLessonStatus(currentLesson.id, 'completed');
    }
  };

  const toggleModule = (moduleId: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleId)) next.delete(moduleId);
    else next.add(moduleId);
    setExpandedModules(next);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    clearCertificateEarned();
  };

  const handleGateCleared = () => {
    if (currentGate) {
      setLocallyCleared((prev) => new Set(prev).add(currentGate.id));
    }
  };

  // ---------------------------------------------------------------------------
  // Theme tokens
  // ---------------------------------------------------------------------------

  const theme = dark
    ? {
        bg: '#0F1219',
        text: '#E5E7EB',
        textMuted: '#9CA3AF',
        sidebar: '#1A1F2E',
        card: '#1A1F2E',
        cardBorder: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.08)',
        title: '#F3F4F6',
        prose: '#D1D5DB',
      }
    : {
        bg: '#F5F7FA',
        text: '#374151',
        textMuted: '#9CA3AF',
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        cardBorder: 'rgba(0,0,0,0.06)',
        border: '#F3F4F6',
        title: '#1E2749',
        prose: '#374151',
      };

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (isLoading || !course || !currentLesson) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="h-[2px] bg-gray-200" />
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
          <div className="lg:grid lg:grid-cols-[1fr_320px] gap-0">
            <div className="p-4 md:p-8">
              <div className="aspect-video bg-gray-200 rounded-xl mb-6 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
            </div>
            <div className="hidden lg:block p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoId = extractVideoId(currentLesson);
  const bodyHtml = extractBodyHtml(currentLesson.content);
  const hasTranscript = !!currentLesson.transcript;
  const hasTranscriptEs = !!currentLesson.transcript_es;

  // ---------------------------------------------------------------------------
  // Sidebar content (shared between desktop and mobile bottom sheet)
  // ---------------------------------------------------------------------------

  // Build a flat index lookup for sidebar gate indicators
  const flatLessonIndex = new Map<string, number>();
  allLessons.forEach((l, idx) => flatLessonIndex.set(l.id, idx));

  const sidebarContent = (
    <div>
      {/* Course title */}
      <Link
        href={`/hub/courses/${slug}`}
        className="block text-sm font-semibold mb-4 hover:opacity-80 transition-opacity"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: theme.title,
        }}
      >
        {course.title}
      </Link>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs font-medium"
            style={{ color: theme.textMuted, fontFamily: "'DM Sans', sans-serif" }}
          >
            {progress.completedLessons} {tUI('of')} {progress.totalLessons} {tUI('complete')}
          </span>
          <span className="text-xs font-bold" style={{ color: '#E8B84B' }}>
            {progress.progressPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress.progressPct}%`,
              background: progress.progressPct === 100
                ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                : 'linear-gradient(90deg, #FFBA06, #E8B84B)',
            }}
          />
        </div>
      </div>

      {/* Module list */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.id);
          const showHeader = modules.length > 1 || mod.title !== tUI('Course Content');

          return (
            <div key={mod.id} className="mb-2">
              {showHeader && (
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-2 py-2 text-left hover:opacity-80 transition-opacity"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} style={{ color: theme.textMuted }} />
                  ) : (
                    <ChevronRight size={14} style={{ color: theme.textMuted }} />
                  )}
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textMuted, letterSpacing: '0.06em' }}
                  >
                    {mod.title}
                  </span>
                </button>
              )}

              {(isExpanded || !showHeader) && (
                <div className="space-y-0.5">
                  {mod.lessons.map((l, idx) => {
                    const isActive = l.id === currentLesson?.id;
                    const isDone = progress.lessonProgress.get(l.id)?.status === 'completed';
                    const lessonGlobalIdx = flatLessonIndex.get(l.id) ?? -1;
                    const isLocked = lockedLessonIndices.has(lessonGlobalIdx);
                    const gateOnThisLesson = gates.get(lessonGlobalIdx);
                    const gateCleared = gateOnThisLesson
                      ? !!courseResponses[gateOnThisLesson.id] || locallyCleared.has(gateOnThisLesson.id)
                      : false;

                    return (
                      <div key={l.id}>
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            router.push(`/hub/courses/${slug}/${l.slug || l.id}`);
                            setBottomSheetOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-left transition-colors"
                          style={{
                            backgroundColor: isActive ? (dark ? 'rgba(232,184,75,0.1)' : '#FFF8E7') : 'transparent',
                            borderLeft: isActive ? '3px solid #E8B84B' : '3px solid transparent',
                            opacity: isLocked ? 0.45 : 1,
                            cursor: isLocked ? 'default' : 'pointer',
                          }}
                        >
                          {/* Status indicator */}
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isDone ? '#16A34A' : 'transparent',
                              border: isDone ? 'none' : `1.5px solid ${isActive ? '#E8B84B' : (dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB')}`,
                            }}
                          >
                            {isDone ? (
                              <Check size={10} className="text-white" />
                            ) : (
                              <span
                                className="text-[10px] font-medium"
                                style={{ color: isActive ? '#E8B84B' : theme.textMuted }}
                              >
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Title + duration */}
                          <div className="flex-1 min-w-0">
                            <span
                              className="text-xs block truncate"
                              style={{
                                color: isActive ? theme.title : theme.textMuted,
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {l.title}
                            </span>
                            {l.estimated_minutes > 0 && (
                              <span className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: theme.textMuted }}>
                                <Clock size={9} />
                                {l.estimated_minutes} {tUI('min')}
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Gate indicator between lessons */}
                        {gateOnThisLesson && (
                          <div className="flex items-center justify-center py-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: gateCleared ? '#16A34A' : '#E8B84B',
                                animation: !gateCleared ? 'pulse 2s ease-in-out infinite' : 'none',
                                boxShadow: !gateCleared ? '0 0 4px rgba(232,184,75,0.5)' : 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pulse animation for gate indicators */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Thin progress bar at very top */}
      <div className="h-[2px] w-full" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#E5E7EB' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress.progressPct}%`,
            background: 'linear-gradient(90deg, #FFBA06, #E8B84B)',
          }}
        />
      </div>

      {/* Top bar: back link + dark mode toggle */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-[1400px] mx-auto">
        <Link
          href={`/hub/courses/${slug}`}
          className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif", color: theme.textMuted }}
        >
          <ArrowLeft size={16} />
          {tUI('Back to course')}
        </Link>

        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:opacity-80 transition-opacity"
          title={dark ? tUI('Light mode') : tUI('Dark mode')}
          style={{ color: theme.textMuted }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main layout: content + sidebar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24 lg:pb-8">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-0">

          {/* ================================================================ */}
          {/* Content Area                                                      */}
          {/* ================================================================ */}
          <div className="lg:pr-8">

            {/* Video Player */}
            {videoId && (
              <div className="w-full aspect-video rounded-xl mb-6 overflow-hidden bg-black">
                <iframe
                  src={`https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoId}/iframe`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Lesson Title */}
            <h1
              className="text-xl md:text-2xl font-bold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: theme.title,
              }}
            >
              {currentLesson.title}
            </h1>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs mb-5" style={{ color: theme.textMuted }}>
              {currentLesson.estimated_minutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {currentLesson.estimated_minutes} {tUI('min')}
                </span>
              )}
              <span>
                {tUI('Lesson')} {currentIndex + 1} {tUI('of')} {allLessons.length}
              </span>
            </div>

            {/* Transcript Panel */}
            {(hasTranscript || hasTranscriptEs) && (
              <div className="mb-6">
                <button
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    color: theme.text,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {transcriptOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {transcriptOpen ? tUI('Hide Transcript') : tUI('Show Transcript')}
                </button>

                {transcriptOpen && (
                  <div
                    className="mt-3 rounded-lg p-4"
                    style={{
                      backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAF8',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {/* Language tabs (only if both exist) */}
                    {hasTranscript && hasTranscriptEs && (
                      <div className="flex gap-0 border-b mb-3" style={{ borderColor: theme.border }}>
                        <button
                          onClick={() => setTranscriptLang('en')}
                          className="px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            color: transcriptLang === 'en' ? theme.title : theme.textMuted,
                            borderBottom: transcriptLang === 'en' ? '2px solid #E8B84B' : '2px solid transparent',
                            marginBottom: '-1px',
                          }}
                        >
                          English
                        </button>
                        <button
                          onClick={() => setTranscriptLang('es')}
                          className="px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            color: transcriptLang === 'es' ? theme.title : theme.textMuted,
                            borderBottom: transcriptLang === 'es' ? '2px solid #E8B84B' : '2px solid transparent',
                            marginBottom: '-1px',
                          }}
                        >
                          Espa&ntilde;ol
                        </button>
                      </div>
                    )}

                    {/* Transcript text */}
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto"
                      style={{ color: theme.prose, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {transcriptLang === 'es' && hasTranscriptEs
                        ? currentLesson.transcript_es
                        : currentLesson.transcript}
                    </div>

                    {/* Download links */}
                    <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                      {hasTranscript && (
                        <a
                          href={`/api/hub/transcripts/${currentLesson.id}?lang=en`}
                          download
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: dark ? 'rgba(30,64,175,0.2)' : '#EFF6FF', color: '#1E40AF', border: `0.5px solid ${dark ? 'rgba(30,64,175,0.4)' : '#BFDBFE'}` }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          {tUI('English')}
                        </a>
                      )}
                      {hasTranscriptEs && (
                        <a
                          href={`/api/hub/transcripts/${currentLesson.id}?lang=es`}
                          download
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: dark ? 'rgba(22,101,52,0.2)' : '#F0FDF4', color: '#166534', border: `0.5px solid ${dark ? 'rgba(22,101,52,0.4)' : '#BBF7D0'}` }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          Espa&ntilde;ol
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Body HTML content (always rendered if present) */}
            {bodyHtml && (
              <div
                className="prose prose-gray max-w-none mb-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: theme.prose,
                  lineHeight: '1.7',
                }}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}

            {/* Gate Card (between content and navigation) */}
            {currentGate && user && (
              <GateCard
                question={currentGate}
                userId={user.id}
                dark={dark}
                onGateCleared={handleGateCleared}
              />
            )}

            {/* Mark as complete checkbox (only when no active gate blocking) */}
            {!isGateActive && (
              <div className="mb-8">
                <label
                  className="flex items-center gap-3 cursor-pointer select-none p-4 rounded-lg border transition-all"
                  style={{
                    borderColor: isComplete ? '#10B981' : (dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'),
                    backgroundColor: isComplete ? (dark ? 'rgba(16,185,129,0.1)' : '#D1FAE5') : theme.card,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: isComplete ? '#10B981' : (dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'),
                      backgroundColor: isComplete ? '#10B981' : 'transparent',
                    }}
                  >
                    {isComplete && <Check size={14} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isComplete}
                    onChange={handleMarkComplete}
                    className="sr-only"
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isComplete ? '#065F46' : theme.text,
                    }}
                  >
                    {isComplete ? tUI('Lesson completed!') : tUI('I have completed this lesson')}
                  </span>
                </label>
              </div>
            )}

            {/* Community Prompt Card */}
            <div
              className="rounded-xl p-5 mb-8"
              style={{
                backgroundColor: dark ? 'rgba(232,184,75,0.06)' : '#FFF8E7',
                border: `1px solid ${dark ? 'rgba(232,184,75,0.15)' : '#FDE68A'}`,
              }}
            >
              <p
                className="text-sm font-medium mb-3"
                style={{ color: theme.title, fontFamily: "'DM Sans', sans-serif" }}
              >
                {tUI('How did this land for you?')}
              </p>
              <Link
                href={`/hub/courses/${slug}#community`}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#1E2749',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <MessageCircle size={14} />
                {tUI('Share with other educators')}
              </Link>
            </div>

            {/* Lesson Navigation */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t"
              style={{ borderColor: theme.border }}
            >
              {/* Previous */}
              {prevLesson ? (
                <Link
                  href={`/hub/courses/${slug}/${prevLesson.slug || prevLesson.id}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto justify-center hover:opacity-80"
                  style={{ color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                >
                  <ArrowLeft size={16} />
                  <span className="truncate max-w-[150px]">{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {/* Counter + auto-advance */}
              <div className="flex flex-col items-center gap-1 order-first sm:order-none">
                <span
                  className="text-sm"
                  style={{ color: theme.textMuted, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {tUI('Lesson')} {currentIndex + 1} {tUI('of')} {allLessons.length}
                </span>
                <label
                  className="flex items-center gap-1.5 cursor-pointer text-xs"
                  style={{ color: theme.textMuted, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={toggleAutoAdvance}
                    className="w-3 h-3 rounded"
                  />
                  {tUI('Auto-advance')}
                </label>
              </div>

              {/* Next or Complete Course (hidden when gate is active) */}
              {isGateActive ? (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg w-full sm:w-auto justify-center text-sm"
                  style={{
                    color: theme.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
                  }}
                >
                  Complete the check-in above to continue
                </div>
              ) : isLastLesson && progress.progressPct === 100 ? (
                <button
                  onClick={handleCompleteCourse}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#1E2749',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  {tUI('Complete Course')}
                  <Check size={16} />
                </button>
              ) : nextLesson ? (
                <Link
                  href={`/hub/courses/${slug}/${nextLesson.slug || nextLesson.id}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto justify-center hover:opacity-80"
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    color: theme.text,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  <span className="truncate max-w-[150px]">{nextLesson.title}</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* Desktop Sidebar                                                   */}
          {/* ================================================================ */}
          <aside
            className="hidden lg:block p-6 sticky top-0 self-start"
            style={{
              borderLeft: `1px solid ${theme.border}`,
              backgroundColor: theme.sidebar,
              maxHeight: '100vh',
              overflowY: 'auto',
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Mobile: Fixed bottom button to open bottom sheet                  */}
      {/* ================================================================ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <button
          onClick={() => setBottomSheetOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: dark ? '#1A1F2E' : '#FFFFFF',
            color: theme.title,
            borderTop: `1px solid ${theme.border}`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <List size={18} />
          {tUI('Course Outline')}
        </button>
      </div>

      {/* ================================================================ */}
      {/* Mobile Bottom Sheet                                               */}
      {/* ================================================================ */}
      {bottomSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setBottomSheetOpen(false)}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-xl"
            style={{
              backgroundColor: theme.sidebar,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB' }}
              />
            </div>

            {/* Close button */}
            <div className="flex items-center justify-between px-5 pb-3">
              <span
                className="text-sm font-semibold"
                style={{ color: theme.title, fontFamily: "'DM Sans', sans-serif" }}
              >
                {tUI('Course Outline')}
              </span>
              <button
                onClick={() => setBottomSheetOpen(false)}
                className="p-1.5 rounded-lg hover:opacity-80"
                style={{ color: theme.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-6">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Toast                                                             */}
      {/* ================================================================ */}
      {toast && (
        <div
          className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#10B981',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Check size={16} />
          <span className="text-sm font-medium">{toast.message}</span>
          {toast.undoLessonId && (
            <button
              onClick={handleUndoComplete}
              className="text-sm font-bold underline ml-2"
            >
              {tUI('Undo')}
            </button>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* Course Completion Modal                                           */}
      {/* ================================================================ */}
      {showCelebration && certificateEarned && course && (
        <CourseCompletionModal
          isOpen={showCelebration}
          onClose={handleCloseCelebration}
          courseTitle={course.title}
          pdHours={course.pd_hours}
          verificationCode={certificateEarned.verificationCode}
          courseSlug={slug}
        />
      )}
    </div>
  );
}
