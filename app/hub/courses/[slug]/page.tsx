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
  User,
  CheckCircle,
  Zap,
} from 'lucide-react';
import CourseCard from '@/components/hub/CourseCard';
import CommunityTabs from '@/components/hub/CommunityTabs';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#E8B84B',
  'Time Savers': '#6BA368',
  'Leadership': '#9B7CB8',
  'Communication': '#E8927C',
  'New Teacher': '#5BBEC4',
};

// Testimonials pool - varied roles across K-12
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

// Pick 1-3 testimonials deterministically based on course ID
function getTestimonials(id: string): typeof TESTIMONIALS {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % TESTIMONIALS.length;
  const count = (Math.abs(hash) % 3) + 1; // 1-3 testimonials
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(TESTIMONIALS[(idx + i) % TESTIMONIALS.length]);
  }
  return result;
}

// Coming Soon flag — set to false when course playback goes live
const COMING_SOON = true;

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

interface RelatedQuickWin {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration_minutes: number;
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
  const [notified, setNotified] = useState(false);
  const [authorCourses, setAuthorCourses] = useState<RelatedCourse[]>([]);
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [relatedQuickWins, setRelatedQuickWins] = useState<RelatedQuickWin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCapacityFeedback, setShowCapacityFeedback] = useState(false);
  const capacityFeedbackShownRef = useRef(false);

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
          .eq('is_published', true)
          .single();

        if (courseError || !courseData) {
          console.error('Error fetching course:', courseError);
          setCourse(null);
          setIsLoading(false);
          return;
        }

        setCourse(courseData);

        // Fetch enrolled count (service role endpoint — bypasses RLS)
        fetch(`/api/hub/enrollment-count?courseId=${courseData.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => { if (data?.count != null) setEnrolledCount(data.count); })
          .catch(() => {});

        // Fetch modules with lessons
        const { data: modulesData, error: modulesError } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
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

        // Fetch related quick wins (same category)
        const { data: relatedQW } = await supabase
          .from('hub_quick_wins')
          .select('id, slug, title, category, duration_minutes')
          .eq('is_published', true)
          .eq('category', courseData.category)
          .limit(4);

        if (relatedQW) {
          setRelatedQuickWins(relatedQW as RelatedQuickWin[]);
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

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
    if (course.title_es && course.description_es) return; // Already translated

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
        // Update local state with translated content
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
      const newCount = (enrolledCount ?? 0) + 1;
      setEnrolledCount(newCount);
      const countMsg = newCount > 1
        ? `You're joining ${newCount.toLocaleString()} educators in this course.`
        : 'Welcome to the course!';
      showToast(`You're in! ${countMsg} 🎉`, 'success');
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
                  {course.category.replace(/-/g, ' ').replace(/&/g, '&').replace(/\b\w/g, c => c.toUpperCase())}
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

              {/* Stats row - PD Hours, Lessons, and Capacity */}
              <div
                className="flex gap-0 pt-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                {course.pd_hours != null && course.pd_hours > 0 && (
                  <div className="pr-6" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-xl font-bold" style={{ color: '#FFBA06' }}>{course.pd_hours}</div>
                    <div className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>PD Hours</div>
                  </div>
                )}
                {totalLessons > 0 && (
                  <div className="px-6" style={(course.capacity || (enrolledCount !== null && enrolledCount > 0)) ? { borderRight: '1px solid rgba(255,255,255,0.08)' } : {}}>
                    <div className="text-xl font-bold text-white">{totalLessons}</div>
                    <div className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>Lessons</div>
                  </div>
                )}
                {course.capacity && (
                  <div className="px-6" style={(enrolledCount !== null && enrolledCount > 0) ? { borderRight: '1px solid rgba(255,255,255,0.08)' } : {}}>
                    <div
                      className="text-xl font-bold capitalize"
                      style={{
                        color: course.capacity === 'low' ? '#6BA368' : course.capacity === 'medium' ? '#E8B84B' : '#E8927C',
                      }}
                    >
                      {course.capacity.charAt(0).toUpperCase() + course.capacity.slice(1)}
                    </div>
                    <div
                      className="text-xs font-bold tracking-widest uppercase mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}
                      title="How action-ready a resource is"
                    >
                      Lift
                    </div>
                  </div>
                )}
                {enrolledCount !== null && enrolledCount > 0 && (
                  <div className="px-6">
                    <div className="text-xl font-bold" style={{ color: '#E8927C' }}>
                      {enrolledCount.toLocaleString()}
                    </div>
                    <div className="text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
                      Enrolled
                    </div>
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

        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Resume / Start button + progress */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            {COMING_SOON ? (
              <div className="text-center">
                <button
                  onClick={async () => {
                    if (notified) return;
                    try {
                      await fetch('/api/hub/notify-course-interest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          courseTitle: course.title,
                          courseSlug: course.slug,
                          userEmail: user?.email,
                          userName: user?.email?.split('@')[0] || 'Educator',
                        }),
                      });
                    } catch {}
                    setNotified(true);
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={notified
                    ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                    : { backgroundColor: '#ffba06', color: '#1e2749' }
                  }
                >
                  {notified ? tUI('We will notify you!') : tUI('Notify me when this launches')}
                </button>
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                  {tUI('This course is launching any day now.')}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* PD Hours badge */}
          {course.pd_hours != null && course.pd_hours > 0 && (
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
            <h3 className="text-sm font-semibold mb-4 whitespace-nowrap" style={{ color: '#1B2A4A', fontSize: '14px' }}>
              Meet Your Instructor
            </h3>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <img
                  src={course.author_avatar_url || '/team/rae-hughart.jpg'}
                  alt={course.author_name || 'Teachers Deserve It Team'}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                  {(course.author_name === 'Teachers Deserve It Team' || !course.author_name) ? <>{tUI('Teachers Deserve It')}<br />{tUI('Team')}</> : course.author_name}
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

          {/* Testimonials */}
          {course && (
            <div
              className="bg-white rounded-2xl p-5"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
            >
              <p
                className="mb-3"
                style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '11px', fontWeight: 600 }}
              >
                {tUI('What educators are saying')}
              </p>
              <div className="space-y-4">
                {getTestimonials(course.id).map((testimonial, i) => (
                  <div
                    key={i}
                    className="pl-3"
                    style={{ borderLeft: '3px solid #ffba06' }}
                  >
                    <p
                      className="text-sm mb-1"
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontStyle: 'italic',
                        color: '#374151',
                        lineHeight: '1.5',
                      }}
                    >
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: '#9CA3AF' }}
                    >
                      -- {testimonial.role}, {testimonial.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Divider */}
      <hr
        className="my-10 border-none border-t-2 border-dashed relative"
        style={{ borderColor: 'rgba(255,186,6,0.3)' }}
      />

      {/* Community: Conversation + Q&A tabs */}
      <CommunityTabs
        contentId={course.id}
        userId={user?.id}
        isAdmin={!!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')}
        conversationApiPath={`/api/hub/courses/${course.id}/conversation`}
        qaApiPath={`/api/hub/courses/${course.id}/qa`}
      />

      {/* Related Quick Wins */}
      {relatedQuickWins.length > 0 && (
        <div className="mt-10 mb-8">
          <h2
            className="font-bold mb-1"
            style={{
              fontSize: '22px',
              color: '#1e2749',
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            {tUI('Related Quick Wins')}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
            {tUI('Grab these tools while you wait')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedQuickWins.map((qw) => {
              const qwColor = CATEGORY_COLORS[qw.category] || '#ffba06';
              return (
                <Link
                  key={qw.id}
                  href={`/hub/quick-wins/${qw.slug}`}
                  className="bg-white rounded-xl p-4 transition-colors group"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${qwColor}18` }}
                  >
                    <Zap size={18} style={{ color: qwColor }} />
                  </div>
                  <p
                    className="text-sm font-medium leading-tight mb-2"
                    style={{ color: '#1e2749' }}
                  >
                    {qw.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${qwColor}18`, color: qwColor, fontSize: '10px' }}
                    >
                      {qw.category}
                    </span>
                    {qw.duration_minutes != null && qw.duration_minutes > 0 && (
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {qw.duration_minutes} {tUI('min')}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="mt-10 mb-8">
          <h2
            className="font-bold mb-1"
            style={{
              fontSize: '22px',
              color: '#1e2749',
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

      {/* Mobile Sticky Enroll Button */}
      {!isEnrolled && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg"
          style={{ borderColor: '#E5E5E5' }}
        >
          {COMING_SOON ? (
            <div className="text-center">
              <div
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'default' }}
              >
                {tUI('Coming Soon')}
              </div>
              <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                {tUI('This course is launching on our new platform any day now. We will let you know the moment it goes live.')}
              </p>
            </div>
          ) : (
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
              {isEnrolling ? 'Enrolling...' : !user ? 'Sign in to Enroll' : 'Join this course'}
            </button>
          )}
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
    </div>
  );
}
