'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import CourseCard from '@/components/hub/CourseCard';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { enrollInCourse } from '@/lib/hooks/useEnrollment';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import { BookOpen, CheckCircle, AlertCircle, Heart, Info } from 'lucide-react';

// Filter categories
const FILTER_CATEGORIES = [
  'All',
  'Saved',
  'In Progress',
  'Stress & Wellness',
  'Classroom Management',
  'Time Savers',
  'Leadership',
  'Communication',
  'New Teacher',
];

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  pd_hours: number;
  estimated_minutes: number;
  thumbnail_url?: string;
  is_published: boolean;
  access_tier?: string;
  is_free_rotating?: boolean;
  capacity?: 'low' | 'medium' | 'high' | null;
  title_es?: string | null;
  description_es?: string | null;
}

interface Enrollment {
  course_id: string;
  status: 'active' | 'completed';
  progress_percentage: number;
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const { user } = useHub();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();
  const { tUI } = useTranslation();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCourses = useCallback(async () => {
    const supabase = getSupabase();
    setIsLoading(true);

    try {
      // Fetch all published courses
      const { data: courseData } = await supabase
        .from('hub_courses')
        .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url, is_published, access_tier, is_free_rotating, capacity, title_es, description_es')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (courseData) {
        setCourses(courseData);
      }

      // Fetch user's enrollments if logged in
      if (user?.id) {
        const { data: enrollmentData } = await supabase
          .from('hub_enrollments')
          .select('course_id, status, progress_percentage')
          .eq('user_id', user.id);

        if (enrollmentData) {
          const enrollmentMap: Record<string, Enrollment> = {};
          enrollmentData.forEach((e) => {
            enrollmentMap[e.course_id] = e;
          });
          setEnrollments(enrollmentMap);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Auto-translate courses when Spanish is selected
  useEffect(() => {
    if (language !== 'es' || courses.length === 0 || isLoading) return;

    // Find courses that need translation
    const coursesNeedingTranslation = courses.filter(course => !course.title_es);
    if (coursesNeedingTranslation.length === 0) return;

    // Trigger translation for courses missing Spanish content
    // Translations cache to database - subsequent loads are instant
    let translationTriggered = false;
    coursesNeedingTranslation.forEach(course => {
      fetch('/api/hub/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'course',
          contentId: course.id,
          lang: 'es',
        }),
      }).then(res => {
        if (res.ok && !translationTriggered) {
          translationTriggered = true;
          // Refresh courses to get translated content after first successful translation
          setTimeout(() => loadCourses(), 500);
        }
      }).catch(() => {}); // Silent fail - English fallback is fine
    });
  }, [language, courses.length, isLoading, loadCourses]);

  const handleEnroll = async (courseId: string) => {
    console.log('[CourseCatalogPage] handleEnroll called', { courseId, userId: user?.id });

    if (!user?.id) {
      console.log('[CourseCatalogPage] No user, redirecting to login');
      router.push('/hub/login');
      return;
    }

    if (isEnrolling) {
      console.log('[CourseCatalogPage] Already enrolling, skipping');
      return;
    }

    setIsEnrolling(courseId);

    try {
      // Use the enrollment function that also creates lesson progress records
      console.log('[CourseCatalogPage] Calling enrollInCourse...');
      const result = await enrollInCourse(courseId, user.id);
      console.log('[CourseCatalogPage] enrollInCourse result:', result);

      if (result.success) {
        // Update local state
        setEnrollments((prev) => ({
          ...prev,
          [courseId]: {
            course_id: courseId,
            status: 'active',
            progress_percentage: 0,
          },
        }));

        showToast('You are enrolled!', 'success');

        // Find the course slug and redirect to course detail page
        const course = courses.find((c) => c.id === courseId);
        if (course) {
          console.log('[CourseCatalogPage] Redirecting to course detail page...');
          router.push(`/hub/courses/${course.slug}`);
        }
      } else {
        console.error('[CourseCatalogPage] Enrollment failed:', result.error);
        showToast(result.error || 'Failed to enroll. Please try again.', 'error');
      }
    } catch (error) {
      console.error('[CourseCatalogPage] Error enrolling:', error);
      showToast('Failed to enroll. Please try again.', 'error');
    } finally {
      setIsEnrolling(null);
    }
  };

  // Filter courses based on category and capacity
  const filteredCourses = courses.filter((course) => {
    const categoryMatch = (() => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Saved') return isFavorite(course.id);
      if (activeFilter === 'In Progress') return !!enrollments[course.id];
      return course.category === activeFilter;
    })();
    const capacityMatch = capacityFilter === 'all' || course.capacity === capacityFilter;
    return categoryMatch && capacityMatch;
  });

  // Get in-progress courses (enrolled but not completed)
  const inProgressCourses = courses.filter((course) => {
    const enrollment = enrollments[course.id];
    return enrollment && enrollment.status === 'active' && enrollment.progress_percentage > 0;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="p-4 md:p-8"
        style={{ backgroundColor: '#F0EEE9', minHeight: 'calc(100vh - 54px)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="h-8 bg-white/50 rounded w-48 mb-2 animate-pulse" />
            <div className="h-5 bg-white/30 rounded w-96 animate-pulse" />
          </div>

          {/* Filter pills skeleton */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 bg-white/50 rounded-full w-28 flex-shrink-0 animate-pulse"
              />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-white rounded-2xl animate-pulse"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-8"
      style={{ backgroundColor: '#F0EEE9', minHeight: 'calc(100vh - 54px)' }}
    >
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-16 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          style={{
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#1B2A4A',
            }}
          >
            {tUI('Courses')}
          </h1>
          <p
            className="text-[15px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#6B7280',
            }}
          >
            {courses.length} {tUI('courses')} · {tUI('Practical PD built by teachers, for teachers')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTER_CATEGORIES.map((category) => {
            const isSaved = category === 'Saved';
            const isActive = activeFilter === category;
            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? (isSaved ? '#E53935' : '#1B2A4A') : 'white',
                  color: isActive ? 'white' : '#6B7280',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSaved && <Heart size={14} style={{ fill: isActive ? 'white' : 'none' }} />}
                {tUI(category)}
              </button>
            );
          })}
        </div>

        {/* Lift Filter Row */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span
            className="text-[11px] font-bold tracking-wider flex-shrink-0"
            style={{
              color: '#9CA3AF',
              textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {tUI('Lift')}
            <span className="relative group" style={{ display: 'inline-flex' }}>
              <Info size={13} style={{ color: '#9CA3AF', cursor: 'help' }} />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-lg text-left normal-case tracking-normal pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
                style={{ background: '#1B2A4A', color: 'white', fontSize: 12, fontWeight: 400, lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Lift = how much brain power and time a resource takes to put into action.</strong>
                <span style={{ display: 'block', marginBottom: 4 }}><strong>Low lift</strong> — Grab and go. Sentence starters, one-page downloads, quick reference cards.</span>
                <span style={{ display: 'block', marginBottom: 4 }}><strong>Medium lift</strong> — Some prep needed. Reflection downloads, structured activities. 15-30 min to plan.</span>
                <span style={{ display: 'block' }}><strong>High lift</strong> — Sustained effort. Courses, multi-week guides, full curriculum frameworks.</span>
              </span>
            </span>
          </span>
          {([['all', 'All'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCapacityFilter(val)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: capacityFilter === val
                  ? (val === 'low' ? '#6BA368' : val === 'medium' ? '#E8B84B' : val === 'high' ? '#E8927C' : '#1B2A4A')
                  : 'white',
                color: capacityFilter === val ? 'white' : '#6B7280',
                border: capacityFilter === val ? 'none' : '1px solid rgba(0,0,0,0.08)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI(label)}
            </button>
          ))}
        </div>

        {/* In Progress Section - only show when filter is All */}
        {inProgressCourses.length > 0 && activeFilter === 'All' && (
          <div className="mb-10">
            <h2
              className="text-[11px] font-bold tracking-wider mb-4"
              style={{
                color: '#1B2A4A',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI('IN PROGRESS')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgressCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollments[course.id] || null}
                  onEnroll={handleEnroll}
                  isEnrolling={isEnrolling === course.id}
                  isFavorited={isFavorite(course.id)}
                  onToggleFavorite={toggleFavorite}
                  displayTitle={t(course.title, course.title_es)}
                  displayDescription={t(course.description, course.description_es)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        {filteredCourses.length > 0 && (
          <div>
            {inProgressCourses.length > 0 && activeFilter === 'All' && (
              <h2
                className="text-[11px] font-bold tracking-wider mb-4"
                style={{
                  color: '#1B2A4A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tUI('ALL COURSES')}
              </h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollments[course.id] || null}
                  onEnroll={handleEnroll}
                  isEnrolling={isEnrolling === course.id}
                  isFavorited={isFavorite(course.id)}
                  onToggleFavorite={toggleFavorite}
                  displayTitle={t(course.title, course.title_es)}
                  displayDescription={t(course.description, course.description_es)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {courses.length === 0 ? (
          <div
            className="rounded-2xl py-16"
            style={{ backgroundColor: 'white', border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <EmptyState
              icon={BookOpen}
              iconBgColor="#E0E7FF"
              title={tUI('Courses are coming soon.')}
              description={tUI('We are building practical, teacher-tested courses that earn PD hours. Check back soon.')}
            />
            <p
              className="text-center text-sm mt-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#6B7280',
              }}
            >
              {tUI('Want to be notified? We will email you when courses launch.')}
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div
            className="rounded-2xl py-12 text-center"
            style={{ backgroundColor: 'white', border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#6B7280',
              }}
            >
              {tUI('No courses match this filter. Try selecting a different category.')}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
