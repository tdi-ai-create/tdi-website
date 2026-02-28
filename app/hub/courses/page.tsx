'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import CourseCard from '@/components/hub/CourseCard';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { enrollInCourse } from '@/lib/hooks/useEnrollment';
import { Search, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

// Filter categories
const FILTER_CATEGORIES = [
  'All',
  'Stress & Wellness',
  'Classroom Management',
  'Time Savers',
  'Leadership',
  'Communication',
  'New Teacher',
  'Quick Wins Only',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadCourses() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch all published courses
        const { data: courseData } = await supabase
          .from('hub_courses')
          .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url, is_published, access_tier, is_free_rotating')
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
    }

    loadCourses();
  }, [user?.id]);

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

        showToast('You are enrolled! 🎉', 'success');

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

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Quick Wins Only' && false) || // This would filter for quick win courses
      course.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-96 animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="mb-6">
          <div className="h-12 bg-gray-100 rounded-lg w-full max-w-md animate-pulse" />
        </div>

        {/* Filter pills skeleton */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 bg-gray-100 rounded-full w-28 flex-shrink-0 animate-pulse"
            />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="hub-card h-80 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
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
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Course Catalog
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Practical PD built by teachers, for teachers. Every course earns PD hours.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTER_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
            style={{
              backgroundColor: activeFilter === category ? '#E8B84B' : 'white',
              color: activeFilter === category ? 'white' : '#6B7280',
              border: activeFilter === category ? 'none' : '1px solid #E5E5E5',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course Grid or Empty State */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollments[course.id] || null}
              onEnroll={handleEnroll}
              isEnrolling={isEnrolling === course.id}
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div
          className="hub-card py-16"
          style={{ backgroundColor: '#FFF8E7', border: 'none' }}
        >
          <EmptyState
            icon={BookOpen}
            iconBgColor="#BFDBFE"
            title="Courses are coming soon."
            description="We are building practical, teacher-tested courses that earn PD hours. Check back soon."
          />
          <p
            className="text-center text-sm text-gray-500 mt-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Want to be notified? We will email you when courses launch.
          </p>
        </div>
      ) : (
        <div
          className="hub-card py-12 text-center"
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No courses match your search. Try a different filter or search term.
          </p>
        </div>
      )}
    </div>
  );
}
