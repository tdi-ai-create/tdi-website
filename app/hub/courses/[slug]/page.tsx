'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useEnrollment } from '@/lib/hooks/useEnrollment';
import { useProgressTracking } from '@/lib/hooks/useProgressTracking';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import {
  ArrowLeft,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  FileText,
} from 'lucide-react';
import CourseCard from '@/components/hub/CourseCard';
import CommunityTabs from '@/components/hub/CommunityTabs';
import AchievementInsights from '@/components/hub/AchievementInsights';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';
import { computeGatePositions } from '@/lib/hub/quiz';
import type { QuizQuestion, QuizOption, QuizResponse } from '@/lib/hub/quiz';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#E8B84B',
  'Time Savers': '#6BA368',
  'Leadership': '#9B7CB8',
  'Communication': '#E8927C',
  'New Teacher': '#5BBEC4',
};

// Testimonials pool
const TESTIMONIALS = [
  { quote: "I printed this out and taped it to my desk. It's the first thing I look at every morning now.", role: "3rd grade teacher", time: "2 days ago" },
  { quote: "Shared this with my whole team at our PLC meeting. Three of them started using it that same week.", role: "Instructional coach", time: "4 days ago" },
  { quote: "As a para, I don't always get tools made for me. This one actually fits how I work.", role: "Paraprofessional, K-2", time: "1 week ago" },
  { quote: "Simple but powerful. I used this during my first year and it helped me survive December.", role: "1st-year teacher", time: "3 days ago" },
  { quote: "I adapted this for my high school students and it worked even better than expected.", role: "9th grade ELA teacher", time: "5 days ago" },
  { quote: "This is exactly what our new teachers needed during onboarding week.", role: "Building mentor", time: "6 days ago" },
  { quote: "I keep coming back to this one. It's become part of my weekly routine.", role: "5th grade teacher", time: "1 week ago" },
  { quote: "Used this in my co-taught class and both of us felt more in sync afterward.", role: "Special education teacher", time: "3 days ago" },
  { quote: "I ran a mini-PD on this at our staff meeting. People loved it.", role: "Teacher leader", time: "5 days ago" },
  { quote: "Finally something practical that doesn't take 45 minutes to set up.", role: "Middle school science teacher", time: "2 days ago" },
  { quote: "I brought this to our district PD day. People were asking where to find more.", role: "District curriculum specialist", time: "1 week ago" },
  { quote: "As a building sub, I need tools that work anywhere. This delivers.", role: "Substitute teacher", time: "4 days ago" },
];

// Pick 3 testimonials deterministically based on course ID
function getTestimonials(id: string): typeof TESTIMONIALS {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % TESTIMONIALS.length;
  const result = [];
  for (let i = 0; i < 3; i++) {
    result.push(TESTIMONIALS[(idx + i) % TESTIMONIALS.length]);
  }
  return result;
}

// Format duration_seconds to m:ss
function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Gate type display text
function getGateLabel(type: string): string {
  switch (type) {
    case 'multiple_choice':
    case 'true_false':
      return "Quick check: Let's make sure this clicked";
    case 'reflection':
      return 'Reflection: Your turn to think on this';
    case 'action_step':
      return 'Action step: Something to try this week';
    case 'checkpoint':
      return 'Checkpoint: Before you go, the big ideas';
    default:
      return "Quick check: Let's make sure this clicked";
  }
}

// Gate type icon character
function getGateIcon(type: string): string {
  switch (type) {
    case 'multiple_choice':
    case 'true_false':
      return '?';
    case 'reflection':
      return '\u270E'; // pencil
    case 'action_step':
      return '\u2713'; // checkmark
    case 'checkpoint':
      return '\u2605'; // star
    default:
      return '?';
  }
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  duration_seconds: number | null;
  estimated_minutes: number;
  type: string;
  is_free_preview: boolean;
  is_quick_win: boolean;
  sort_order: number;
  module_id: string | null;
  has_transcript_en: boolean;
  has_transcript_es: boolean;
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
  description: string;
  category: string;
  pd_hours: number;
  estimated_minutes: number;
  difficulty: string;
  capacity?: 'low' | 'medium' | 'high' | null;
  thumbnail_url: string | null;
  is_published: boolean;
  author_name: string | null;
  author_bio: string | null;
  author_avatar_url: string | null;
  title_es?: string | null;
  description_es?: string | null;
}

interface RelatedCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  pd_hours: number;
  estimated_minutes: number;
  thumbnail_url?: string;
}

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [notified, setNotified] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCapacityFeedback, setShowCapacityFeedback] = useState(false);
  const capacityFeedbackShownRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'course' | 'community'>('course');

  // Formative check-ins state
  const [checkInQuestions, setCheckInQuestions] = useState<QuizQuestion[]>([]);
  const [checkInResponses, setCheckInResponses] = useState<Record<string, QuizResponse>>({});
  const [checkInDrafts, setCheckInDrafts] = useState<Record<string, string>>({});
  const [checkInSubmitting, setCheckInSubmitting] = useState<string | null>(null);

  const { enrollment, isEnrolled, isEnrolling, enroll } = useEnrollment(course?.id || null, user?.id || null);
  const { progress, toggleLessonComplete } = useProgressTracking(course?.id || null, user?.id || null);
  const { language, t } = useLanguage();
  const { tUI } = useTranslation();

  // Fetch course data
  useEffect(() => {
    async function loadCourse() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('hub_courses')
          .select('*')
          .eq('slug', slug)
          .single();

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          setCourse(null);
          setIsLoading(false);
          return;
        }

        setCourse(courseData);

        // Fetch enrolled count (service role endpoint - bypasses RLS)
        fetch(`/api/hub/enrollment-count?courseId=${courseData.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => { if (data?.count != null) setEnrolledCount(data.count); })
          .catch(() => {});

        // Fetch modules with lessons
        const { data: modulesData } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        // Fetch lessons via module IDs (hub_lessons.course_id is often null; modules are the reliable FK)
        const moduleIds = (modulesData || []).map((m: { id: string }) => m.id);
        const { data: lessonsData } = moduleIds.length > 0
          ? await supabase
              .from('hub_lessons')
              .select('id, slug, title, duration_seconds, estimated_minutes, type, is_free_preview, is_quick_win, sort_order, module_id, transcript, transcript_es')
              .in('module_id', moduleIds)
              .order('sort_order', { ascending: true })
          : { data: [] as any[] };

        // Group lessons by module
        const moduleMap = new Map<string, Module>();
        const unassignedLessons: Lesson[] = [];
        const allLessonIds: string[] = [];

        // Initialize modules
        modulesData?.forEach((mod: { id: string; title: string; sort_order: number }) => {
          moduleMap.set(mod.id, {
            id: mod.id,
            title: mod.title,
            sort_order: mod.sort_order,
            lessons: [],
          });
        });

        // Assign lessons to modules
        lessonsData?.forEach((raw: any) => {
          const lesson: Lesson = {
            id: raw.id,
            slug: raw.slug,
            title: raw.title,
            duration_seconds: raw.duration_seconds,
            estimated_minutes: raw.estimated_minutes,
            type: raw.type,
            is_free_preview: raw.is_free_preview,
            is_quick_win: raw.is_quick_win,
            sort_order: raw.sort_order,
            module_id: raw.module_id,
            has_transcript_en: !!raw.transcript,
            has_transcript_es: !!raw.transcript_es,
          };
          allLessonIds.push(raw.id);
          if (lesson.module_id && moduleMap.has(lesson.module_id)) {
            moduleMap.get(lesson.module_id)!.lessons.push(lesson);
          } else {
            unassignedLessons.push(lesson);
          }
        });

        // Build final modules array
        let finalModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);

        // If there are unassigned lessons, create a default module
        if (unassignedLessons.length > 0) {
          if (finalModules.length === 0) {
            finalModules = [{
              id: 'default',
              title: 'Course Content',
              sort_order: 0,
              lessons: unassignedLessons,
            }];
          } else {
            finalModules[0].lessons = [...unassignedLessons, ...finalModules[0].lessons];
          }
        }

        setModules(finalModules);

        // Fetch formative check-in questions for all lessons in this course
        if (allLessonIds.length > 0) {
          const { data: questionsData } = await supabase
            .from('hub_quiz_questions')
            .select('*')
            .in('lesson_id', allLessonIds)
            .order('sort_order', { ascending: true });

          if (questionsData && questionsData.length > 0) {
            setCheckInQuestions(questionsData);
          }
        }

        // Fetch related courses (same category, different course)
        const { data: relatedData } = await supabase
          .from('hub_courses')
          .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url')
          .eq('category', courseData.category)
          .eq('is_published', true)
          .neq('id', courseData.id)
          .limit(3);

        if (relatedData) {
          setRelatedCourses(relatedData.map((c: any) => ({
            ...c,
            thumbnail_url: c.thumbnail_url || undefined,
          })));
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  // Fetch user responses for check-in questions
  useEffect(() => {
    if (!user?.id || checkInQuestions.length === 0) return;

    async function loadResponses() {
      const supabase = getSupabase();
      const lessonIds = [...new Set(checkInQuestions.map(q => q.lesson_id))];

      const { data } = await supabase
        .from('hub_quiz_responses')
        .select('*')
        .eq('user_id', user!.id)
        .in('lesson_id', lessonIds);

      if (data) {
        const responseMap: Record<string, QuizResponse> = {};
        data.forEach((r: QuizResponse) => {
          responseMap[r.question_id] = r;
        });
        setCheckInResponses(responseMap);
      }
    }

    loadResponses();
  }, [user?.id, checkInQuestions]);

  // Show capacity feedback prompt once the educator has completed at least one lesson
  useEffect(() => {
    if (!course?.capacity || !user?.id || !progress.completedLessons) return;
    if (capacityFeedbackShownRef.current) return;
    if (!shouldShowCapacityFeedback('course', course.id)) return;

    const timer = setTimeout(() => {
      capacityFeedbackShownRef.current = true;
      setShowCapacityFeedback(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [course?.id, course?.capacity, user?.id, progress.completedLessons]);

  // Auto-translate course when Spanish is selected and content is missing
  useEffect(() => {
    if (language !== 'es' || !course) return;
    if (course.title_es && course.description_es) return;

    fetch('/api/hub/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'course',
        contentId: course.id,
        lang: 'es',
      }),
    }).then(res => {
      if (res.ok) return res.json();
    }).then(data => {
      if (data) {
        setCourse(prev => prev ? {
          ...prev,
          title_es: data.title_es || prev.title_es,
          description_es: data.description_es || prev.description_es,
        } : prev);
      }
    }).catch(() => {});
  }, [language, course?.id]);

  const handleEnroll = async () => {
    const success = await enroll();
    if (success) {
      // Go straight to the first lesson. No second click needed.
      if (modules[0]?.lessons[0]) {
        router.push(`/hub/courses/${course?.slug}/${modules[0].lessons[0].slug || modules[0].lessons[0].id}`);
      }
    } else {
      showToast('Failed to enroll. Please try again.', 'error');
    }
  };

  const handleLessonToggle = async (lessonId: string) => {
    if (!isEnrolled) return;

    const currentStatus = progress.lessonProgress.get(lessonId)?.status || 'not_started';
    const success = await toggleLessonComplete(lessonId);

    if (success) {
      const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      showToast(
        newStatus === 'completed' ? 'Lesson marked complete' : 'Lesson marked incomplete',
        'success'
      );
    }
  };

  const handleCheckInSubmit = async (question: QuizQuestion, answer: string) => {
    if (!user?.id || !answer.trim()) return;
    setCheckInSubmitting(question.id);

    try {
      let isCorrect: boolean | null = null;

      if (question.question_type === 'multiple_choice' && question.options) {
        const selectedIdx = parseInt(answer, 10);
        isCorrect = question.options[selectedIdx]?.is_correct === true;
      } else if (question.question_type === 'true_false' && question.correct_answer) {
        isCorrect = question.correct_answer.toLowerCase() === answer.toLowerCase();
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from('hub_quiz_responses')
        .upsert(
          {
            user_id: user.id,
            question_id: question.id,
            lesson_id: question.lesson_id,
            response: answer,
            is_correct: isCorrect,
          },
          { onConflict: 'user_id,question_id' }
        );

      if (!error) {
        setCheckInResponses(prev => ({
          ...prev,
          [question.id]: {
            id: question.id,
            user_id: user.id,
            question_id: question.id,
            lesson_id: question.lesson_id,
            response: answer,
            is_correct: isCorrect,
            created_at: new Date().toISOString(),
          },
        }));
        showToast('Response saved', 'success');
      }
    } catch {
      showToast('Failed to save response', 'error');
    } finally {
      setCheckInSubmitting(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getTotalLessons = () => {
    return modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  };

  // Flatten all lessons for gate computation
  const allLessonsFlat = modules.flatMap(mod => mod.lessons);
  const gatePositions = computeGatePositions(checkInQuestions, allLessonsFlat.length);

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
        {/* Hero skeleton */}
        <div style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #1E3A5F 50%, #2B4A72 100%)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px 52px' }}>
            <div className="animate-pulse">
              <div className="h-4 bg-white/10 rounded w-32 mb-6" />
              <div className="h-6 bg-white/10 rounded w-24 mb-4" />
              <div className="h-10 bg-white/10 rounded w-3/4 mb-4" />
              <div className="h-16 bg-white/10 rounded w-2/3 mb-6" />
              <div className="flex gap-3">
                <div className="h-8 bg-white/10 rounded-full w-24" />
                <div className="h-8 bg-white/10 rounded-full w-24" />
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 40px' }}>
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl h-48 mb-5" />
            <div className="bg-white rounded-2xl h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Link
          href="/hub/courses"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={20} />
          Back to courses
        </Link>

        <div
          className="hub-card py-16 text-center"
          style={{ backgroundColor: '#FFF8E7', border: 'none' }}
        >
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: '#E8B84B' }} />
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Course not found
          </h1>
          <p
            className="text-gray-600 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            This course may not exist or is not yet published.
          </p>
          <Link
            href="/hub/courses"
            className="inline-block px-6 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = getTotalLessons();
  const comingSoon = totalLessons === 0;
  const completedLessons = progress.completedLessons || 0;
  const progressPct = progress.progressPct || 0;

  // CTA button label
  const ctaLabel = comingSoon
    ? (notified ? tUI('We will notify you!') : tUI('Notify me when this launches'))
    : isEnrolled
      ? (progressPct === 100 ? tUI('Completed') : tUI('Continue'))
      : isEnrolling
        ? tUI('Enrolling...')
        : !user
          ? tUI('Sign in to enroll')
          : tUI('Start Learning');

  const handleCtaClick = () => {
    if (comingSoon) {
      if (notified) return;
      fetch('/api/hub/notify-course-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: course.title,
          courseSlug: course.slug,
          userEmail: user?.email,
          userName: user?.email?.split('@')[0] || 'Educator',
        }),
      }).catch(() => {});
      setNotified(true);
      return;
    }

    if (isEnrolled) {
      if (progressPct === 100) {
        if (modules[0]?.lessons[0]) {
          router.push(`/hub/courses/${course?.slug}/${modules[0].lessons[0].slug || modules[0].lessons[0].id}`);
        }
        return;
      }
      // Find next incomplete lesson
      for (const mod of modules) {
        for (const l of mod.lessons) {
          if (progress.lessonProgress.get(l.id)?.status !== 'completed') {
            router.push(`/hub/courses/${course.slug}/${l.slug || l.id}`);
            return;
          }
        }
      }
      // All complete, go to first lesson
      if (modules[0]?.lessons[0]) {
        router.push(`/hub/courses/${course?.slug}/${modules[0].lessons[0].slug || modules[0].lessons[0].id}`);
      }
    } else {
      handleEnroll();
    }
  };

  const testimonials = getTestimonials(course.id);

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          style={{
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : null}
          {toast.message}
        </div>
      )}

      {/* ============================================================ */}
      {/* HERO (full-width navy gradient)                               */}
      {/* ============================================================ */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #1E3A5F 50%, #2B4A72 100%)' }}
      >
        {/* Decorative circle */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ right: '-100px', top: '-100px', width: '500px', height: '500px', background: 'rgba(232,184,75,0.04)' }}
        />

        <div
          className="relative z-10"
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px 52px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'start' }}
        >
          {/* Left column */}
          <div>
            {/* Back link */}
            <Link
              href="/hub/courses"
              className="flex items-center gap-1.5 mb-4 text-sm w-fit"
              style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              {tUI('Back to Courses')}
            </Link>

            {/* Category tag */}
            {course.category && (
              <div
                className="inline-block text-xs font-bold px-3.5 py-1 rounded-full mb-4"
                style={{
                  background: 'rgba(232,184,75,0.15)',
                  border: '1px solid rgba(232,184,75,0.3)',
                  color: '#E8B84B',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                {course.category}
              </div>
            )}

            {/* Title */}
            <h1
              className="font-bold text-white mb-4 leading-tight"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '38px',
                lineHeight: '1.15',
              }}
            >
              {t(course.title, course.title_es)}
            </h1>

            {/* Description */}
            {course.description && (
              <p
                className="mb-6"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'rgba(255,255,255,0.6)',
                  maxWidth: '520px',
                }}
              >
                {t(course.description, course.description_es)}
              </p>
            )}

            {/* Hero pills: only lessons + check-ins */}
            <div className="flex gap-3 flex-wrap">
              {totalLessons > 0 && (
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <strong className="text-white">{totalLessons}</strong> {totalLessons === 1 ? 'lesson' : 'lessons'}
                </span>
              )}
              {checkInQuestions.length > 0 && (
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <strong className="text-white">{checkInQuestions.length}</strong> check-in{checkInQuestions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Progress strip (enrolled only) */}
            {enrollment && (
              <div
                className="flex items-center gap-4 mt-6 pt-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                  Your progress
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #E8B84B, #F59E0B)' }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: '#E8B84B', whiteSpace: 'nowrap' }}>
                  {progressPct}%
                </span>
              </div>
            )}
          </div>

          {/* Right column: CTA card */}
          <div
            className="bg-white rounded-2xl"
            style={{ padding: '28px' }}
          >
            {comingSoon ? (
              <div className="text-center">
                <button
                  onClick={handleCtaClick}
                  className="w-full py-4 rounded-xl text-base font-bold transition-colors cursor-pointer"
                  style={{
                    background: notified ? '#D1FAE5' : '#E8B84B',
                    color: notified ? '#065F46' : '#1E2749',
                    border: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {ctaLabel}
                </button>
                <p className="text-sm mt-3" style={{ color: '#9CA3AF' }}>
                  {tUI('This course is launching any day now.')}
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCtaClick}
                  disabled={isEnrolling || !user}
                  className="w-full py-4 rounded-xl text-base font-bold transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    background: progressPct === 100 ? '#16A34A' : '#E8B84B',
                    color: progressPct === 100 ? 'white' : '#1E2749',
                    border: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: '12px',
                  }}
                >
                  {ctaLabel}
                </button>

                <p className="text-center text-sm mb-5" style={{ color: '#9CA3AF' }}>
                  Go at your own pace. Pick up where you left off.
                </p>

                {/* Feature list */}
                <div>
                  {[
                    'Watch short video lessons',
                    'Answer quick check-ins',
                    'Download resource packet',
                    'Earn certificate',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 py-1.5" style={{ fontSize: '13px', color: '#4B5563' }}>
                      <span
                        className="flex-shrink-0 rounded-full"
                        style={{ width: '6px', height: '6px', background: '#E8B84B' }}
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#F3F4F6', margin: '16px 0' }} />

                {/* Certificate badge */}
                <div className="flex items-center gap-2.5">
                  <Award size={18} style={{ color: '#D97706' }} />
                  <span className="text-sm" style={{ color: '#6B7280' }}>Certificate of Completion included</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS + CONTENT AREA                                           */}
      {/* ============================================================ */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>

        {/* Tab bar */}
        <div className="flex gap-0" style={{ borderBottom: '1px solid #E5E7EB', marginTop: '24px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('course')}
            className="px-5 py-3 text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: activeTab === 'course' ? '#1E2749' : '#9CA3AF',
              borderBottom: activeTab === 'course' ? '2px solid #E8B84B' : '2px solid transparent',
              marginBottom: '-1px',
              background: 'none',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'course' ? '#E8B84B' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {tUI('Course')}
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className="px-5 py-3 text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: activeTab === 'community' ? '#1E2749' : '#9CA3AF',
              background: 'none',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'community' ? '#E8B84B' : 'transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
            }}
          >
            {tUI('Community')}
          </button>
        </div>

        {/* ============================================================ */}
        {/* COURSE TAB                                                    */}
        {/* ============================================================ */}
        {activeTab === 'course' && (
          <>
            {/* How This Course Works */}
            <div
              className="bg-white rounded-2xl mb-5"
              style={{ padding: '32px 36px', border: '0.5px solid rgba(0,0,0,0.06)' }}
            >
              <h2
                className="font-semibold mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '22px', color: '#1E2749' }}
              >
                {tUI('How This Course Works')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { num: 1, title: tUI('Watch'), desc: 'Short video lessons you can fit into a prep period or planning block.' },
                  { num: 2, title: tUI('Check In'), desc: 'Answer a quick question between sections to make sure the ideas are clicking.' },
                  { num: 3, title: tUI('Apply'), desc: 'Walk away with strategies you can use in your classroom tomorrow.' },
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div
                      className="mx-auto mb-3 flex items-center justify-center rounded-full font-bold text-white"
                      style={{ width: '44px', height: '44px', background: '#1E2749', fontSize: '18px' }}
                    >
                      {step.num}
                    </div>
                    <div className="font-semibold text-sm mb-1.5" style={{ color: '#1E2749' }}>
                      {step.title}
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                      {step.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            {totalLessons > 0 && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
              >
                {/* Curriculum header */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: '24px 36px', borderBottom: '1px solid #F3F4F6' }}
                >
                  <span
                    className="font-semibold"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '22px', color: '#1E2749' }}
                  >
                    {tUI('Course Curriculum')}
                  </span>
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>
                    {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
                    {checkInQuestions.length > 0 && ` + ${checkInQuestions.length} check-in${checkInQuestions.length !== 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Lesson rows with gate indicators */}
                <div>
                  {(() => {
                    let globalIndex = 0;
                    return modules.map((mod) =>
                      mod.lessons.map((lesson) => {
                        const idx = globalIndex;
                        globalIndex++;
                        const isComplete = progress.lessonProgress.get(lesson.id)?.status === 'completed';
                        const isResource = lesson.type === 'resource' || lesson.type === 'download';
                        const isVideo = !isResource;
                        const duration = formatDuration(lesson.duration_seconds);
                        const gate = gatePositions.get(idx);

                        return (
                          <div key={lesson.id}>
                            {/* Lesson row */}
                            <div
                              className="flex items-center gap-4 transition-colors hover:bg-gray-50"
                              style={{ padding: '16px 36px', borderBottom: '1px solid #FAFBFC', cursor: 'pointer' }}
                              onClick={() => {
                                if (isEnrolled) {
                                  router.push(`/hub/courses/${course.slug}/${lesson.slug || lesson.id}`);
                                }
                              }}
                            >
                              {/* Number circle or completion indicator */}
                              {isEnrolled ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonToggle(lesson.id);
                                  }}
                                  className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    background: isComplete ? '#16A34A' : 'transparent',
                                    border: isComplete ? 'none' : '2px solid #E5E7EB',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: isComplete ? 'white' : '#9CA3AF',
                                    cursor: 'pointer',
                                  }}
                                  title={isComplete ? 'Mark incomplete' : 'Mark complete'}
                                >
                                  {isComplete ? <CheckCircle size={16} style={{ color: 'white' }} /> : idx + 1}
                                </button>
                              ) : (
                                <div
                                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    border: '2px solid #E5E7EB',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#9CA3AF',
                                  }}
                                >
                                  {idx + 1}
                                </div>
                              )}

                              {/* Lesson info */}
                              <div className="flex-1">
                                <div className="text-sm font-medium" style={{ color: isComplete ? '#6B7280' : '#1E2749' }}>
                                  {isEnrolled ? (
                                    <Link
                                      href={`/hub/courses/${course.slug}/${lesson.slug || lesson.id}`}
                                      className="hover:underline"
                                      style={{ color: 'inherit', textDecoration: 'none' }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {lesson.title}
                                    </Link>
                                  ) : (
                                    <span>
                                      {lesson.title}
                                      {lesson.is_free_preview && (
                                        <span
                                          className="ml-2 text-xs px-1.5 py-0.5 rounded"
                                          style={{ background: '#E0F2FE', color: '#0284C7', fontSize: '10px' }}
                                        >
                                          Free Preview
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className="text-xs text-white rounded-full px-2 py-0.5"
                                    style={{
                                      background: isResource ? '#6BA368' : '#1E2749',
                                      fontSize: '11px',
                                    }}
                                  >
                                    {isResource ? 'Resource' : 'Video'}
                                  </span>
                                </div>
                              </div>

                              {/* Duration */}
                              {isVideo && duration && (
                                <span className="flex-shrink-0 text-xs font-medium" style={{ color: '#9CA3AF' }}>
                                  {duration}
                                </span>
                              )}
                            </div>

                            {/* Gate indicator after this lesson */}
                            {gate && (
                              <div
                                className="flex items-center gap-2.5 text-sm font-medium"
                                style={{
                                  padding: '11px 36px 11px 56px',
                                  background: 'linear-gradient(90deg, #FEF9EE 0%, #FFFDF7 100%)',
                                  borderBottom: '1px solid rgba(232,184,75,0.08)',
                                  color: '#92400E',
                                }}
                              >
                                <span
                                  className="flex-shrink-0 flex items-center justify-center rounded-full text-white text-xs font-bold"
                                  style={{ width: '20px', height: '20px', background: '#E8B84B' }}
                                >
                                  {getGateIcon(gate.question_type)}
                                </span>
                                {getGateLabel(gate.question_type)}
                              </div>
                            )}
                          </div>
                        );
                      })
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* COMMUNITY TAB                                                 */}
        {/* ============================================================ */}
        {activeTab === 'community' && (
          <div>
            <CommunityTabs
              contentId={course.id}
              userId={user?.id}
              isAdmin={!!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')}
              conversationApiPath={`/api/hub/courses/${course.id}/conversation`}
              qaApiPath={`/api/hub/courses/${course.id}/qa`}
            />

            <div className="mt-8">
              <AchievementInsights
                data={{
                  name: user?.user_metadata?.display_name || 'Educator',
                  role: 'Educator',
                  toolsExplored: 0,
                  hoursSaved: '0',
                  daysActive: 0,
                  recognitionsEarned: 0,
                  earnedNames: [],
                  topCategories: [course.category || ''],
                  communityPosts: 0,
                  coursesCompleted: 0,
                  pdHours: 0,
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TESTIMONIALS (below tabs, always visible)                     */}
        {/* ============================================================ */}
        <div style={{ marginTop: '32px', marginBottom: '40px' }}>
          <h2
            className="font-semibold mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '20px', color: '#1E2749' }}
          >
            {tUI('What Educators Are Saying')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-xl"
                style={{ padding: '20px', border: '0.5px solid rgba(0,0,0,0.06)' }}
              >
                <div
                  className="mb-2.5"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#374151',
                    borderLeft: '3px solid #E8B84B',
                    paddingLeft: '14px',
                  }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>
                  {testimonial.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2
              className="font-bold mb-1"
              style={{
                fontSize: '22px',
                color: '#1E2749',
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              {tUI('Related Courses')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              {tUI('More courses in this category')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCourses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  enrollment={null}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Enroll Button */}
      {!isEnrolled && !comingSoon && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg"
          style={{ borderColor: '#E5E5E5' }}
        >
          <button
            onClick={handleEnroll}
            disabled={isEnrolling || !user}
            className="w-full py-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#1E2749',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              minHeight: '52px',
            }}
          >
            {isEnrolling ? 'Enrolling...' : !user ? 'Sign in to Enroll' : 'Start Learning'}
          </button>
        </div>
      )}

      {showCapacityFeedback && course.capacity && (
        <CapacityFeedbackPrompt
          contentType="course"
          contentId={course.id}
          officialCapacity={course.capacity}
          onDismiss={() => setShowCapacityFeedback(false)}
        />
      )}
    </div>
  );
}
