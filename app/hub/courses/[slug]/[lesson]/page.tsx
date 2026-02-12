'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import { useProgressTracking } from '@/lib/hooks/useProgressTracking';
import LessonContent from '@/components/hub/LessonContent';
import CourseCompletionModal from '@/components/hub/CourseCompletionModal';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { type QuizQuestion, type QuizResponse, getLessonQuestions, getUserResponses } from '@/lib/hub/quiz';

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  estimated_minutes: number;
  content_type: string;
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
  pd_hours: number;
}

interface LessonPageProps {
  params: Promise<{ slug: string; lesson: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { slug, lesson: lessonSlug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userResponses, setUserResponses] = useState<Record<string, QuizResponse>>({});

  // Progress tracking
  const { progress, certificateEarned, clearCertificateEarned, markLessonStatus, refetch } = useProgressTracking(
    course?.id || null,
    user?.id || null
  );

  // Celebration modal
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch course and lesson data
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('hub_courses')
          .select('id, slug, title, pd_hours')
          .eq('slug', slug)
          .single();

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          router.push('/hub/courses');
          return;
        }

        setCourse(courseData);

        // Check enrollment
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

        // Fetch modules
        const { data: modulesData } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        // Fetch all lessons
        const { data: lessonsData } = await supabase
          .from('hub_lessons')
          .select('id, slug, title, description, content, video_url, estimated_minutes, content_type, sort_order, module_id')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        if (!lessonsData || lessonsData.length === 0) {
          router.push(`/hub/courses/${slug}`);
          return;
        }

        // Build ordered lesson list
        const moduleMap = new Map<string, Module>();
        const unassignedLessons: Lesson[] = [];

        modulesData?.forEach((mod) => {
          moduleMap.set(mod.id, {
            id: mod.id,
            title: mod.title,
            sort_order: mod.sort_order,
            lessons: [],
          });
        });

        lessonsData.forEach((lesson) => {
          if (lesson.module_id && moduleMap.has(lesson.module_id)) {
            moduleMap.get(lesson.module_id)!.lessons.push(lesson as Lesson);
          } else {
            unassignedLessons.push(lesson as Lesson);
          }
        });

        let finalModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);

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
        setExpandedModules(new Set(finalModules.map((m) => m.id)));

        // Build flat ordered list
        const orderedLessons: Lesson[] = [];
        finalModules.forEach((mod) => {
          mod.lessons.forEach((lesson) => orderedLessons.push(lesson));
        });
        setAllLessons(orderedLessons);

        // Find current lesson
        const current = orderedLessons.find((l) => l.slug === lessonSlug);
        if (!current) {
          router.push(`/hub/courses/${slug}`);
          return;
        }
        setCurrentLesson(current);

        // Load quiz questions for this lesson
        const lessonQuestions = await getLessonQuestions(current.id);
        setQuestions(lessonQuestions);

        // Load user responses (already returns a Record)
        const responseMap = await getUserResponses(user.id, current.id);
        setUserResponses(responseMap);

      } catch (error) {
        console.error('Error loading lesson data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [slug, lessonSlug, user?.id, router]);

  // Show celebration modal when certificate is earned
  useEffect(() => {
    if (certificateEarned) {
      setShowCelebration(true);
    }
  }, [certificateEarned]);

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isLastLesson = currentIndex === allLessons.length - 1;
  const lessonStatus = currentLesson ? progress.lessonProgress.get(currentLesson.id)?.status || 'not_started' : 'not_started';
  const isComplete = lessonStatus === 'completed';

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    await markLessonStatus(currentLesson.id, 'completed');
    await refetch();
  };

  const handleCompleteCourse = async () => {
    if (!currentLesson) return;
    if (!isComplete) {
      await markLessonStatus(currentLesson.id, 'completed');
    }
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

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    clearCertificateEarned();
  };

  if (isLoading || !course || !currentLesson) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="h-1 bg-gray-200" />
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
          <div className="h-5 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-32 mb-8 animate-pulse" />
          <div className="aspect-video bg-gray-200 rounded-xl mb-6 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Progress bar at top */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress.progressPct}%`,
            backgroundColor: progress.isComplete ? '#10B981' : '#E8B84B',
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
          {/* Main Content */}
          <div className="p-4 md:p-8">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol
                className="flex items-center gap-2 text-sm flex-wrap"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <li>
                  <Link href="/hub/courses" className="text-gray-500 hover:text-gray-700">
                    Courses
                  </Link>
                </li>
                <li className="text-gray-400">&gt;</li>
                <li>
                  <Link
                    href={`/hub/courses/${slug}`}
                    className="text-gray-500 hover:text-gray-700 truncate max-w-[150px] inline-block align-bottom"
                  >
                    {course.title}
                  </Link>
                </li>
                <li className="text-gray-400">&gt;</li>
                <li className="text-gray-700 truncate max-w-[150px]">{currentLesson.title}</li>
              </ol>
            </nav>

            {/* Back to course link */}
            <Link
              href={`/hub/courses/${slug}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <ArrowLeft size={16} />
              Back to course
            </Link>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Menu size={18} />
              Course outline
            </button>

            {/* Video placeholder (if video_url exists) */}
            {currentLesson.video_url && (
              <div
                className="w-full aspect-video rounded-xl mb-6 flex flex-col items-center justify-center"
                style={{ backgroundColor: '#E5E7EB' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(43, 58, 103, 0.1)' }}
                >
                  <Play size={32} style={{ color: '#2B3A67', marginLeft: '4px' }} />
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Video player coming soon
                </p>
              </div>
            )}

            {/* Lesson Title */}
            <h1
              className="font-bold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '24px',
                color: '#2B3A67',
              }}
            >
              {currentLesson.title}
            </h1>

            {/* Lesson description/content */}
            {currentLesson.description && (
              <p
                className="mb-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: '1.7',
                }}
              >
                {currentLesson.description}
              </p>
            )}

            {/* Lesson content (if any) */}
            {currentLesson.content && (
              <div
                className="prose prose-gray max-w-none mb-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: '1.7',
                }}
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              />
            )}

            {/* Quiz content (if questions exist) */}
            {questions.length > 0 && user && (
              <div className="mb-8">
                <LessonContent
                  lessonId={currentLesson.id}
                  lessonTitle=""
                  questions={questions}
                  userResponses={userResponses}
                  userId={user.id}
                  onComplete={handleMarkComplete}
                  isCompleted={isComplete}
                />
              </div>
            )}

            {/* Mark as complete checkbox (only if no quiz) */}
            {questions.length === 0 && (
              <div className="mb-8">
                <label
                  className="flex items-center gap-3 cursor-pointer select-none p-4 rounded-lg border transition-all"
                  style={{
                    borderColor: isComplete ? '#10B981' : '#E5E7EB',
                    backgroundColor: isComplete ? '#D1FAE5' : 'white',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: isComplete ? '#10B981' : '#D1D5DB',
                      backgroundColor: isComplete ? '#10B981' : 'white',
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
                      color: isComplete ? '#065F46' : '#374151',
                    }}
                  >
                    {isComplete ? 'Lesson completed!' : 'I have completed this lesson'}
                  </span>
                </label>
              </div>
            )}

            {/* Lesson Navigation */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t"
              style={{ borderColor: '#E5E5E5' }}
            >
              {/* Previous button */}
              <Link
                href={prevLesson ? `/hub/courses/${slug}/${prevLesson.slug}` : '#'}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto justify-center ${
                  prevLesson
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed pointer-events-none'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                aria-disabled={!prevLesson}
              >
                <ArrowLeft size={16} />
                Previous Lesson
              </Link>

              {/* Lesson counter */}
              <span
                className="text-sm text-gray-500 order-first sm:order-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Lesson {currentIndex + 1} of {allLessons.length}
              </span>

              {/* Next button or Complete Course */}
              {isLastLesson && progress.progressPct === 100 ? (
                <button
                  onClick={handleCompleteCourse}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  Complete Course
                  <Check size={16} />
                </button>
              ) : (
                <Link
                  href={nextLesson ? `/hub/courses/${slug}/${nextLesson.slug}` : '#'}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto justify-center ${
                    nextLesson
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none'
                  }`}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                  aria-disabled={!nextLesson}
                >
                  Next Lesson
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block p-4 lg:p-8 lg:pl-0">
            <div
              className="sticky top-4 bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: '#E5E5E5', maxHeight: 'calc(100vh - 2rem)' }}
            >
              <div
                className="p-4 border-b"
                style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAF8' }}
              >
                <h3
                  className="font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: '#2B3A67',
                  }}
                >
                  Course Outline
                </h3>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                {modules.map((module) => (
                  <div key={module.id}>
                    {/* Module header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className="text-sm font-medium truncate"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        {module.title}
                      </span>
                    </button>

                    {/* Module lessons */}
                    {expandedModules.has(module.id) && (
                      <div>
                        {module.lessons.map((lesson) => {
                          const isCurrentLesson = lesson.id === currentLesson.id;
                          const lessonComplete = progress.lessonProgress.get(lesson.id)?.status === 'completed';

                          return (
                            <Link
                              key={lesson.id}
                              href={`/hub/courses/${slug}/${lesson.slug}`}
                              className={`flex items-center gap-2 px-4 py-2 pl-8 text-sm transition-colors ${
                                isCurrentLesson ? 'bg-[#FFF8E7]' : 'hover:bg-gray-50'
                              }`}
                              style={{
                                borderLeft: isCurrentLesson ? '3px solid #E8B84B' : '3px solid transparent',
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {lessonComplete ? (
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: '#10B981' }}
                                >
                                  <Check size={12} className="text-white" />
                                </div>
                              ) : (
                                <div
                                  className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                                  style={{
                                    borderColor: isCurrentLesson ? '#E8B84B' : '#D1D5DB',
                                  }}
                                />
                              )}
                              <span
                                className={`truncate ${isCurrentLesson ? 'font-medium' : ''}`}
                                style={{ color: isCurrentLesson ? '#2B3A67' : '#6B7280' }}
                              >
                                {lesson.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Mobile Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-xl"
                style={{ maxWidth: '85vw' }}
              >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E5E5E5' }}>
                  <h3
                    className="font-semibold"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      color: '#2B3A67',
                    }}
                  >
                    Course Outline
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
                  {modules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center gap-2 p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className="text-sm font-medium"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#2B3A67',
                          }}
                        >
                          {module.title}
                        </span>
                      </button>
                      {expandedModules.has(module.id) && (
                        <div>
                          {module.lessons.map((lesson) => {
                            const isCurrentLesson = lesson.id === currentLesson.id;
                            const lessonComplete = progress.lessonProgress.get(lesson.id)?.status === 'completed';

                            return (
                              <Link
                                key={lesson.id}
                                href={`/hub/courses/${slug}/${lesson.slug}`}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 p-4 pl-10 text-sm transition-colors min-h-[48px] ${
                                  isCurrentLesson ? 'bg-[#FFF8E7]' : 'hover:bg-gray-50'
                                }`}
                                style={{
                                  borderLeft: isCurrentLesson ? '3px solid #E8B84B' : '3px solid transparent',
                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                {lessonComplete ? (
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#10B981' }}
                                  >
                                    <Check size={14} className="text-white" />
                                  </div>
                                ) : (
                                  <div
                                    className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                                    style={{
                                      borderColor: isCurrentLesson ? '#E8B84B' : '#D1D5DB',
                                    }}
                                  />
                                )}
                                <span
                                  className={isCurrentLesson ? 'font-medium' : ''}
                                  style={{ color: isCurrentLesson ? '#2B3A67' : '#6B7280' }}
                                >
                                  {lesson.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Completion Modal */}
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
