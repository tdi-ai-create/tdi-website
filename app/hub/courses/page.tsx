'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import CourseCard from '@/components/hub/CourseCard';
import EmptyState from '@/components/hub/EmptyState';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { enrollInCourse } from '@/lib/hooks/useEnrollment';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import { BookOpen, CheckCircle, AlertCircle, Gamepad2, Play, Zap, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import QuizNudge from '@/components/hub/QuizNudge';
import HubFilterBar from '@/components/hub/HubFilterBar';

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
  'Games',
];

// Practice game cards for Games filter
const PRACTICE_GAME_CARDS = [
  { slug: 'question-knockout', title: 'Question Knockout', description: 'Real scenarios. Questions only. Can you resist telling?', time: '~15 min', color: '#FF7847' },
  { slug: 'tell-or-ask', title: 'Tell or Ask?', description: 'Is it really a question... or a command in disguise?', time: '~10 min', color: '#F1C40F' },
  { slug: 'feedback-level-up', title: 'Feedback Level Up', description: 'What level is this feedback? Debate it out.', time: '~12 min', color: '#27AE60' },
  { slug: 'feedback-madlibs', title: 'Feedback Madlibs', description: 'Practice the feedback formula... with a twist!', time: '~10 min', color: '#9333EA' },
  { slug: 'feedback-makeover', title: 'Feedback Makeover', description: 'Terrible feedback + real context. Race to fix it.', time: '~15 min', color: '#E74C3C' },
  { slug: 'whats-your-move', title: "What's Your Move?", description: 'Classroom scenarios. Three options. Only one is the best move.', time: '~10 min', color: '#22b8bd' },
  { slug: 'classroom-shuffle', title: 'Classroom Scenario Shuffle', description: 'Real classroom management scenarios. Choose your response.', time: '~12 min', color: '#3498DB' },
  { slug: 'prioritize-this', title: 'Prioritize This', description: 'Rank tasks by priority. See how experienced educators would do it.', time: '~10 min', color: '#9333EA' },
  { slug: 'energy-budget', title: 'Energy Budget', description: '100 energy points. How do you spend your day?', time: '~10 min', color: '#22b8bd' },
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
  danielson_domains?: string[];
  roles?: string[];
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
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [danielsonFilter, setDanielsonFilter] = useState<string[]>([]);
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
      // Fetch all courses (published first, then coming soon)
      const { data: courseData } = await supabase
        .from('hub_courses')
        .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url, is_published, access_tier, is_free_rotating, capacity, danielson_domains, roles, title_es, description_es')
        .order('is_published', { ascending: false })
        .order('created_at', { ascending: false });

      if (courseData) {
        // Add cache-buster to thumbnail URLs to force fresh load
        const bust = Date.now();
        setCourses(courseData.map(c => ({
          ...c,
          thumbnail_url: c.thumbnail_url ? `${c.thumbnail_url}?v=${bust}` : undefined,
        })));
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

  const totalCount = courses.length;

  // Filter courses based on category and capacity
  const filteredCourses = courses.filter((course) => {
    const categoryMatch = (() => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Saved') return isFavorite(course.id);
      if (activeFilter === 'In Progress') return !!enrollments[course.id];
      // Match kebab-case DB values against Title Case filter labels
      const normalizedCategory = course.category?.replace(/-/g, ' ').replace(/&/g, '&').replace(/\b\w/g, c => c.toUpperCase());
      return normalizedCategory === activeFilter || course.category === activeFilter;
    })();
    const capacityMatch = capacityFilter === 'all' || course.capacity === capacityFilter;
    const danielsonMatch = danielsonFilter.length === 0 || danielsonFilter.some(d => course.danielson_domains?.includes(d));
    const roleMatch = roleFilter === 'all' || course.roles?.includes(roleFilter);
    return categoryMatch && capacityMatch && danielsonMatch && roleMatch;
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
        style={{ backgroundColor: '#F5F7FA', minHeight: 'calc(100vh - 54px)' }}
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
      style={{ backgroundColor: '#F5F7FA', minHeight: 'calc(100vh - 54px)' }}
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
        <QuizNudge />
        {/* Header */}
        <div className="mb-4">
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
        </div>

        <HubFilterBar
          categories={FILTER_CATEGORIES}
          totalCount={totalCount}
          filteredCount={filteredCourses.length}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          capacityFilter={capacityFilter}
          setCapacityFilter={setCapacityFilter}
          danielsonFilter={danielsonFilter}
          setDanielsonFilter={setDanielsonFilter}
          isFavorite={isFavorite}
          tUI={tUI}
          itemLabel="courses"
          subtitle="Practical PD built by teachers, for teachers"
        />

        {/* Games Filter View */}
        {activeFilter === 'Games' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {PRACTICE_GAME_CARDS.map((game) => (
              <Link
                key={game.slug}
                href={`/hub/quick-wins/${game.slug}`}
                className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md group"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
              >
                {/* Color header */}
                <div className="h-2" style={{ backgroundColor: game.color }} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 size={16} style={{ color: game.color }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${game.color}15`, color: game.color }}
                    >
                      {game.time}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-base mb-2 group-hover:opacity-80 transition-opacity"
                    style={{ color: '#1B2A4A', fontFamily: "'Source Serif 4', serif" }}
                  >
                    {game.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#6B7280', lineHeight: 1.5 }}>
                    {game.description}
                  </p>
                  <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all group-hover:scale-[1.02]"
                    style={{ backgroundColor: game.color, color: 'white' }}
                  >
                    <Play size={16} />
                    {tUI('Play')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

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
        {filteredCourses.length > 0 && activeFilter !== 'Games' && (
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
