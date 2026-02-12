'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import { useEnrollment } from '@/lib/hooks/useEnrollment';
import { useProgressTracking, LessonStatus } from '@/lib/hooks/useProgressTracking';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  BarChart2,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Headphones,
  Zap,
  Check,
  CheckCircle,
  Award,
  Infinity,
  HelpCircle,
  PenLine,
  CheckSquare,
  Flag,
} from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { enrollment, isEnrolled, isEnrolling, enroll } = useEnrollment(course?.id || null, user?.id || null);
  const { progress, toggleLessonComplete } = useProgressTracking(course?.id || null, user?.id || null);

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
          .eq('is_published', true)
          .single();

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          setCourse(null);
          setIsLoading(false);
          return;
        }

        setCourse(courseData);

        // Fetch modules with lessons
        const { data: modulesData } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('hub_lessons')
          .select('id, slug, title, description, estimated_minutes, content_type, is_free_preview, is_quick_win, sort_order, module_id')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

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

        setModules(finalModules);

        // Expand all modules by default
        setExpandedModules(new Set(finalModules.map((m) => m.id)));
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

  const getLessonIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Play size={14} />;
      case 'audio':
        return <Headphones size={14} />;
      case 'read':
      case 'download':
        return <FileText size={14} />;
      case 'quiz':
        return <HelpCircle size={14} />;
      case 'reflection':
        return <PenLine size={14} />;
      case 'action_step':
        return <CheckSquare size={14} />;
      case 'checkpoint':
        return <Flag size={14} />;
      default:
        return <BookOpen size={14} />;
    }
  };

  const getLessonStatusIcon = (lessonId: string) => {
    const status = progress.lessonProgress.get(lessonId)?.status || 'not_started';

    if (status === 'completed') {
      return (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#10B981' }}
        >
          <Check size={14} className="text-white" />
        </div>
      );
    }

    if (status === 'in_progress') {
      return (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center border-2"
          style={{ borderColor: '#E8B84B' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E8B84B' }} />
        </div>
      );
    }

    return (
      <div
        className="w-6 h-6 rounded-full border-2"
        style={{ borderColor: '#D1D5DB' }}
      />
    );
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

  return (
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
          <li className="text-gray-700 truncate max-w-[200px]">{course.title}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content */}
        <div>
          {/* Course Header Card */}
          <div className="hub-card">
            {/* Category pill */}
            <span
              className="inline-block text-[12px] font-medium px-3 py-1 rounded-full mb-4"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {course.category}
            </span>

            {/* Title */}
            <h1
              className="font-bold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '28px',
                color: '#2B3A67',
              }}
            >
              {course.title}
            </h1>

            {/* Description */}
            <p
              className="text-[15px] mb-6 line-clamp-3"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#4B5563',
              }}
            >
              {course.description}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={18} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                  {course.pd_hours} hours PD credit
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <BookOpen size={18} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                  {getTotalLessons()} lessons
                </span>
              </div>
              {course.difficulty && (
                <div className="flex items-center gap-2 text-gray-500">
                  <BarChart2 size={18} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                    {course.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Enroll button or Progress */}
            {isEnrolled ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                  >
                    Your progress
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                  >
                    {progress.progressPct}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress.progressPct}%`,
                      backgroundColor: progress.isComplete ? '#10B981' : '#E8B84B',
                    }}
                  />
                </div>
                {progress.isComplete && (
                  <p
                    className="mt-3 text-sm text-green-600 flex items-center gap-2"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <CheckCircle size={16} />
                    Course completed! View your certificate.
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling || !user}
                className="px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isEnrolling ? 'Enrolling...' : !user ? 'Sign in to enroll' : 'Enroll in Course'}
              </button>
            )}
          </div>

          {/* Course Content / Lesson List */}
          <div className="hub-card mt-6">
            <h2
              className="font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '18px',
                color: '#2B3A67',
              }}
            >
              Course Content
            </h2>

            {modules.length === 0 ? (
              <p
                className="text-gray-500 text-center py-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                No lessons available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    {/* Module header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules.has(module.id) ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                        <span
                          className="font-semibold text-left"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '16px',
                            color: '#2B3A67',
                          }}
                        >
                          {module.title}
                        </span>
                      </div>
                      <span
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {/* Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="divide-y divide-gray-100">
                        {module.lessons.map((lesson, index) => {
                          const canAccess = isEnrolled || lesson.is_free_preview;
                          const lessonStatus = progress.lessonProgress.get(lesson.id)?.status || 'not_started';

                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-4 p-4 ${!canAccess ? 'opacity-60' : ''}`}
                            >
                              {/* Status circle - clickable if enrolled */}
                              {isEnrolled ? (
                                <button
                                  onClick={() => handleLessonToggle(lesson.id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                  title={
                                    lessonStatus === 'completed'
                                      ? 'Mark as incomplete'
                                      : 'Mark as complete'
                                  }
                                >
                                  {getLessonStatusIcon(lesson.id)}
                                </button>
                              ) : (
                                <div className="flex-shrink-0">{getLessonStatusIcon(lesson.id)}</div>
                              )}

                              {/* Lesson info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {canAccess ? (
                                    <Link
                                      href={`/hub/courses/${course.slug}/${lesson.slug}`}
                                      className="font-medium hover:text-[#E8B84B] transition-colors truncate"
                                      style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: '14px',
                                        color: '#2B3A67',
                                      }}
                                    >
                                      {lesson.title}
                                    </Link>
                                  ) : (
                                    <span
                                      className="font-medium truncate"
                                      style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: '14px',
                                        color: '#6B7280',
                                      }}
                                    >
                                      {lesson.title}
                                    </span>
                                  )}
                                  {lesson.is_free_preview && (
                                    <span
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: '#D1FAE5',
                                        color: '#059669',
                                        fontFamily: "'DM Sans', sans-serif",
                                      }}
                                    >
                                      Free Preview
                                    </span>
                                  )}
                                  {lesson.is_quick_win && (
                                    <Zap size={14} style={{ color: '#E8B84B' }} />
                                  )}
                                </div>
                              </div>

                              {/* Duration and type */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                  className="text-[12px] text-gray-400"
                                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                  {lesson.estimated_minutes} min
                                </span>
                                <div className="text-gray-400">{getLessonIcon(lesson.content_type)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* What you'll learn */}
          <div className="hub-card">
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                color: '#2B3A67',
              }}
            >
              What you'll learn
            </h3>
            <ul className="space-y-3">
              {['Key concepts and strategies', 'Practical techniques you can use immediately', 'Real classroom examples'].map(
                (item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* This course includes */}
          <div className="hub-card">
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                color: '#2B3A67',
              }}
            >
              This course includes
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Play size={16} className="text-gray-400" />
                {getTotalLessons()} lessons
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Clock size={16} className="text-gray-400" />
                {course.pd_hours} PD hours
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Award size={16} className="text-gray-400" />
                Certificate on completion
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Infinity size={16} className="text-gray-400" />
                Lifetime access
              </li>
            </ul>
          </div>

          {/* Enroll CTA (sidebar on desktop) */}
          {!isEnrolled && (
            <div className="hidden lg:block hub-card" style={{ backgroundColor: '#FFF8E7', border: 'none' }}>
              <p
                className="text-sm text-gray-600 mb-4"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Get full access to all lessons and earn your PD certificate.
              </p>
              <button
                onClick={handleEnroll}
                disabled={isEnrolling || !user}
                className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          )}
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
  );
}
