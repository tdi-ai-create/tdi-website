'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import { useEnrollment } from '@/lib/hooks/useEnrollment';
import { useProgressTracking } from '@/lib/hooks/useProgressTracking';
import { useLanguage } from '@/lib/hub/useLanguage';
import {
  ArrowLeft,
  BookOpen,
  Award,
  User,
  CheckCircle,
} from 'lucide-react';
import CourseCard from '@/components/hub/CourseCard';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#E8B84B',
  'Time Savers': '#6BA368',
  'Leadership': '#9B7CB8',
  'Communication': '#E8927C',
  'New Teacher': '#5BBEC4',
};

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
  content_type: 'video' | 'audio' | 'read' | 'activity' | 'download' | 'quiz' | 'reflection' | 'action_step' | 'checkpoint';
  is_free_preview: boolean;
  is_quick_win: boolean;
  sort_order: number;
  module_id: string | null;
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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [authorCourses, setAuthorCourses] = useState<RelatedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { enrollment, isEnrolled, isEnrolling, enroll } = useEnrollment(course?.id || null, user?.id || null);
  const { progress, toggleLessonComplete } = useProgressTracking(course?.id || null, user?.id || null);
  const { language, t, hasSpanish } = useLanguage();

  // Fetch course data
  useEffect(() => {
    async function loadCourse() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch course
        console.log('[CourseDetail] Fetching course with slug:', slug);
        const { data: courseData, error: courseError } = await supabase
          .from('hub_courses')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        console.log('[CourseDetail] Course result:', { courseData, courseError });

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          setCourse(null);
          setIsLoading(false);
          return;
        }

        setCourse(courseData);

        // Fetch modules with lessons
        console.log('[CourseDetail] Fetching modules for course_id:', courseData.id);
        const { data: modulesData, error: modulesError } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        console.log('[CourseDetail] Modules result:', { modulesData, modulesError });

        // Fetch lessons
        console.log('[CourseDetail] Fetching lessons for course_id:', courseData.id);
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('hub_lessons')
          .select('id, slug, title, description, estimated_minutes, content_type, is_free_preview, is_quick_win, sort_order, module_id')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        console.log('[CourseDetail] Lessons result:', { lessonsData, lessonsError, count: lessonsData?.length });

        // Group lessons by module
        const moduleMap = new Map<string, Module>();
        const unassignedLessons: Lesson[] = [];

        // Initialize modules
        modulesData?.forEach((mod) => {
          moduleMap.set(mod.id, {
            id: mod.id,
            title: mod.title,
            sort_order: mod.sort_order,
            lessons: [],
          });
        });

        // Assign lessons to modules
        lessonsData?.forEach((lesson) => {
          if (lesson.module_id && moduleMap.has(lesson.module_id)) {
            moduleMap.get(lesson.module_id)!.lessons.push(lesson as Lesson);
          } else {
            unassignedLessons.push(lesson as Lesson);
          }
        });

        // Build final modules array
        let finalModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);

        // If there are unassigned lessons, create a default module
        if (unassignedLessons.length > 0) {
          if (finalModules.length === 0) {
            // All lessons are unassigned, create single module
            finalModules = [{
              id: 'default',
              title: 'Course Content',
              sort_order: 0,
              lessons: unassignedLessons,
            }];
          } else {
            // Add unassigned to first module or create separate
            finalModules[0].lessons = [...unassignedLessons, ...finalModules[0].lessons];
          }
        }

        console.log('[CourseDetail] Final modules:', finalModules);
        setModules(finalModules);

        // Expand all modules by default
        setExpandedModules(new Set(finalModules.map((m) => m.id)));

        // Fetch related courses (same category, different course)
        const { data: relatedData } = await supabase
          .from('hub_courses')
          .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url')
          .eq('category', courseData.category)
          .eq('is_published', true)
          .neq('id', courseData.id)
          .limit(3);

        if (relatedData) {
          // Convert null thumbnail_url to undefined for type compatibility
          setRelatedCourses(relatedData.map(c => ({
            ...c,
            thumbnail_url: c.thumbnail_url || undefined,
          })));
        }

        // Fetch other courses by same author (if author exists)
        if (courseData.author_name) {
          const { data: authorData } = await supabase
            .from('hub_courses')
            .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url')
            .eq('author_name', courseData.author_name)
            .eq('is_published', true)
            .neq('id', courseData.id)
            .limit(3);

          if (authorData) {
            // Convert null thumbnail_url to undefined for type compatibility
            setAuthorCourses(authorData.map(c => ({
              ...c,
              thumbnail_url: c.thumbnail_url || undefined,
            })));
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  const handleEnroll = async () => {
    console.log('[CourseDetailPage] handleEnroll called');
    const success = await enroll();
    console.log('[CourseDetailPage] enroll result:', success);
    if (success) {
      showToast('You are enrolled! 🎉', 'success');
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getTotalLessons = () => {
    return modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  };

  const categoryColor = course ? CATEGORY_COLORS[course.category] || '#E8B84B' : '#E8B84B';

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1100px] mx-auto">
        <div className="h-5 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="hub-card animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-6 bg-gray-100 rounded w-24 mb-4" />
              <div className="h-20 bg-gray-100 rounded mb-4" />
              <div className="h-10 bg-gray-200 rounded w-40" />
            </div>
            <div className="hub-card mt-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="hub-card h-40 animate-pulse" />
            <div className="hub-card h-48 animate-pulse" />
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
  const completedLessons = progress.completedLessons || 0;
  const progressPct = progress.progressPct || 0;

  return (
    <div style={{ background: '#F0EEE9', minHeight: '100vh' }}>
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto">
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

      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <li>
            <Link href="/hub/courses" className="text-gray-500 hover:text-gray-700">
              Courses
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 truncate max-w-[200px]">{t(course.title, course.title_es)}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content */}
        <div>
          {/* Course Hero */}
          <section
            className="relative text-white overflow-hidden rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
          >
            {/* Decorative circle */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ right: '-40px', top: '-60px', width: '240px', height: '240px', background: 'rgba(255,186,6,0.06)' }}
            />

            <div className="relative z-10 px-9 py-8">
              {/* Translation badge */}
              {language === 'es' && !hasSpanish(course.title_es) && (
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3"
                  style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  Traducción próximamente
                </div>
              )}

              {/* Category tag */}
              {course.category && (
                <div
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{
                    background: 'rgba(254,243,199,0.15)',
                    border: '1px solid rgba(255,186,6,0.3)',
                    color: '#FFBA06',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {course.category}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug" style={{ maxWidth: '560px' }}>
                {t(course.title, course.title_es)}
              </h1>

              {/* Description */}
              {course.description && (
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '560px' }}>
                  {t(course.description, course.description_es)}
                </p>
              )}

              {/* Stats row - PD Hours and Lessons only, NO difficulty/level */}
              <div
                className="flex gap-0 pt-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                {course.pd_hours && (
                  <div className="pr-6" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-xl font-bold" style={{ color: '#FFBA06' }}>{course.pd_hours}</div>
                    <div className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>PD Hours</div>
                  </div>
                )}
                {totalLessons > 0 && (
                  <div className="px-6">
                    <div className="text-xl font-bold text-white">{totalLessons}</div>
                    <div className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>Lessons</div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress strip - only show if enrolled */}
            {enrollment && (
              <div
                className="px-9 py-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                  Your progress
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #FFBA06, #F59E0B)' }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: '#FFBA06', whiteSpace: 'nowrap' }}>
                  {progressPct}%
                </span>
              </div>
            )}
          </section>

          {/* Course Content / Lesson List */}
          <div className="mb-6">
            <h2
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}
            >
              Course Content
            </h2>

            {modules.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-8 text-center"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
              >
                <p className="text-gray-500 text-sm">No lessons available yet.</p>
              </div>
            ) : (
              <div>
                {modules.map((module, moduleIndex) => {
                  const moduleIsComplete = module.lessons.every(
                    (l) => progress.lessonProgress.get(l.id)?.status === 'completed'
                  );

                  // Find next lesson
                  const findNextLessonId = () => {
                    for (const mod of modules) {
                      for (const l of mod.lessons) {
                        if (progress.lessonProgress.get(l.id)?.status !== 'completed') {
                          return l.id;
                        }
                      }
                    }
                    return null;
                  };
                  const nextLessonId = findNextLessonId();

                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-2xl overflow-hidden mb-3"
                      style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
                    >
                      {/* Module header */}
                      <div className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Module number badge */}
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: moduleIsComplete ? '#DCFCE7' : '#F3F4F6',
                              color: moduleIsComplete ? '#16A34A' : '#6B7280',
                            }}
                          >
                            {moduleIndex + 1}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{module.title}</span>
                        </div>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          {module.lessons.length} lessons
                        </span>
                      </div>

                      {/* Lesson rows */}
                      {module.lessons.map((lesson) => {
                        const isDone = progress.lessonProgress.get(lesson.id)?.status === 'completed';
                        const isNext = lesson.id === nextLessonId;
                        const canAccess = isEnrolled || lesson.is_free_preview;

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 px-5 py-3 ${canAccess ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}`}
                            style={{
                              borderTop: '0.5px solid #F9FAFB',
                              background: isNext ? '#FFFBF0' : 'transparent',
                            }}
                            onClick={() => canAccess && router.push(`/hub/courses/${course.slug}/${lesson.slug}`)}
                          >
                            {/* Status dot */}
                            <div
                              className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                border: isDone ? 'none' : isNext ? '1.5px solid #FFBA06' : '1.5px solid #E5E7EB',
                                background: isDone ? '#16A34A' : isNext ? 'rgba(255,186,6,0.1)' : 'transparent',
                              }}
                            >
                              {isDone && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              )}
                              {isNext && !isDone && (
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBA06' }} />
                              )}
                            </div>

                            {/* Title */}
                            <div
                              className="flex-1 text-sm"
                              style={{ color: isDone ? '#9CA3AF' : '#374151', fontWeight: isNext ? 600 : 400 }}
                            >
                              {lesson.title}
                              {lesson.is_free_preview && (
                                <span
                                  className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                                >
                                  Free Preview
                                </span>
                              )}
                            </div>

                            {/* Up next badge or time */}
                            {isNext && !isDone ? (
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded"
                                style={{ background: '#FFFBF0', color: '#D97706' }}
                              >
                                Up next
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                                {lesson.estimated_minutes} min
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* More from this instructor */}
          {authorCourses.length > 0 && (
            <div className="mt-8">
              <h2
                className="font-semibold mb-4"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '20px',
                  color: '#2B3A67',
                }}
              >
                More from this instructor
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authorCourses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    enrollment={null}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Related courses */}
          {relatedCourses.length > 0 && (
            <div className="mt-8">
              <h2
                className="font-semibold mb-4"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '20px',
                  color: '#2B3A67',
                }}
              >
                Related Courses
              </h2>
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

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Resume / Start button + progress */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <button
              onClick={() => {
                if (isEnrolled) {
                  // Find next incomplete lesson
                  for (const mod of modules) {
                    for (const l of mod.lessons) {
                      if (progress.lessonProgress.get(l.id)?.status !== 'completed') {
                        router.push(`/hub/courses/${course.slug}/${l.slug}`);
                        return;
                      }
                    }
                  }
                  // All complete, go to first lesson
                  if (modules[0]?.lessons[0]) {
                    router.push(`/hub/courses/${course.slug}/${modules[0].lessons[0].slug}`);
                  }
                } else {
                  handleEnroll();
                }
              }}
              disabled={isEnrolling || !user}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white mb-4 disabled:opacity-50"
              style={{ background: '#1B2A4A' }}
            >
              {isEnrolled ? 'Resume Course →' : isEnrolling ? 'Enrolling...' : !user ? 'Sign in to enroll' : 'Start Course →'}
            </button>

            {enrollment && (
              <>
                <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #FFBA06, #F59E0B)' }}
                  />
                </div>
                <div className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                  Lesson {completedLessons} of {totalLessons}
                </div>
                <div className="text-xs font-medium" style={{ color: '#16A34A' }}>
                  {progressPct === 100 ? 'Course complete!' : "You're doing great - keep going!"}
                </div>
              </>
            )}
          </div>

          {/* PD Hours badge */}
          {course.pd_hours && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: '#FEF3C7' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#FDE68A' }}
              >
                <Award size={16} style={{ color: '#D97706' }} />
              </div>
              <div>
                <div className="text-base font-bold" style={{ color: '#1B2A4A' }}>{course.pd_hours} PD Hours</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>Earned on completion</div>
              </div>
            </div>
          )}

          {/* Meet Your Instructor */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#1B2A4A' }}>
              Meet Your Instructor
            </h3>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {course.author_avatar_url ? (
                  <img
                    src={course.author_avatar_url}
                    alt={course.author_name || 'Instructor'}
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    <User size={20} style={{ color: '#9CA3AF' }} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                  {course.author_name || 'Teachers Deserve It Team'}
                </h4>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  {course.author_name ? 'Educator & Course Creator' : 'Educators supporting teachers'}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs line-clamp-3" style={{ color: '#6B7280' }}>
              {course.author_bio ||
                'Built by educators who believe every teacher deserves support, growth, and a community that gets it.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Enroll Button */}
      {!isEnrolled && (
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
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              minHeight: '52px',
            }}
          >
            {isEnrolling ? 'Enrolling...' : !user ? 'Sign in to Enroll' : 'Enroll in Course'}
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
