'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { checkTrackerEligibility, type TrackerEligibility } from '@/lib/hub/transformation';
import { getRecommendations, hasCompletedOnboarding, type RecommendedCourse } from '@/lib/hub/recommendations';
import {
  BookOpen,
  Zap,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  TrendingUp,
} from 'lucide-react';
import ShareMenu from '@/components/hub/ShareMenu';

// Daily motivational messages - picks based on day of week
const DAILY_MESSAGES = [
  'You showed up today. That matters.',
  'Small steps still move you forward.',
  'You are more than your to-do list.',
  'The fact that you are here says everything.',
  'Today is a good day to take care of you.',
  'Progress, not perfection.',
  'You deserve this time.',
];

// Fallback TDI tips when no tips in database
const FALLBACK_TIPS = [
  'Take one thing off your plate today. Not because you have to. Because you can.',
  'You became a teacher to make a difference. You already are.',
  'Rest is not a reward. It is a requirement.',
  'The best lesson you can teach today is that you matter too.',
  'Progress over perfection. Every single time.',
  'Your students do not need you to be perfect. They need you to be present.',
  'Five minutes of silence can change your entire afternoon.',
];

// Check-in response messages
const CHECKIN_RESPONSES: Record<number, string> = {
  1: 'Glad you are having a good day.',
  2: 'Glad you are having a good day.',
  3: 'Hang in there. You have got this.',
  4: 'Sending you a deep breath. Remember, "I need a moment" is always here.',
  5: 'Sending you a deep breath. Remember, "I need a moment" is always here.',
};

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  course: {
    id: string;
    slug: string;
    title: string;
    category: string;
    estimated_minutes: number;
  };
  lessons_completed: number;
  total_lessons: number;
}

interface QuickWin {
  id: string;
  slug: string;
  title: string;
  estimated_minutes: number;
  course_slug?: string;
}

export default function HubDashboard() {
  const { profile, user } = useHub();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quickWin, setQuickWin] = useState<QuickWin | null>(null);
  const [tip, setTip] = useState<string>(FALLBACK_TIPS[0]);
  const [certificateCount, setCertificateCount] = useState<number>(0);
  const [todayCheckIn, setTodayCheckIn] = useState<number | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackerEligibility, setTrackerEligibility] = useState<TrackerEligibility | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const firstName = profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher';
  const dailyMessage = DAILY_MESSAGES[new Date().getDay()];

  // Role display
  const roleLabels: Record<string, string> = {
    classroom_teacher: 'Classroom Teacher',
    para: 'Paraprofessional',
    coach: 'Instructional Coach',
    school_leader: 'School Leader',
    district_staff: 'District Staff',
    other: 'Educator',
  };
  const roleLabel = profile?.role ? roleLabels[profile.role] || 'Educator' : 'Educator';

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch enrollments with course data
        const { data: enrollmentData } = await supabase
          .from('hub_enrollments')
          .select(`
            id,
            course_id,
            status,
            progress_percentage,
            course:hub_courses(id, slug, title, category, estimated_minutes)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (enrollmentData) {
          // Get lesson counts for each enrollment
          const enrichedEnrollments = await Promise.all(
            enrollmentData.map(async (enrollment) => {
              const { count: totalLessons } = await supabase
                .from('hub_lessons')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', enrollment.course_id);

              const { count: completedLessons } = await supabase
                .from('hub_lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .in('lesson_id',
                  (await supabase
                    .from('hub_lessons')
                    .select('id')
                    .eq('course_id', enrollment.course_id)
                  ).data?.map(l => l.id) || []
                );

              return {
                ...enrollment,
                course: Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course,
                lessons_completed: completedLessons || 0,
                total_lessons: totalLessons || 0,
              };
            })
          );
          setEnrollments(enrichedEnrollments as Enrollment[]);
        }

        // Fetch random quick win
        const { data: quickWinData } = await supabase
          .from('hub_lessons')
          .select(`
            id,
            slug,
            title,
            estimated_minutes,
            course:hub_courses!inner(slug, is_published)
          `)
          .eq('is_quick_win', true)
          .eq('hub_courses.is_published', true)
          .limit(10);

        if (quickWinData && quickWinData.length > 0) {
          const randomIndex = Math.floor(Math.random() * quickWinData.length);
          const qw = quickWinData[randomIndex];
          const courseData = qw.course as { slug: string } | { slug: string }[] | null;
          const courseSlug = Array.isArray(courseData) ? courseData[0]?.slug : courseData?.slug;
          setQuickWin({
            id: qw.id,
            slug: qw.slug,
            title: qw.title,
            estimated_minutes: qw.estimated_minutes,
            course_slug: courseSlug,
          });
        }

        // Fetch TDI tip - pick based on date
        const { data: tipData } = await supabase
          .from('hub_tdi_tips')
          .select('id, content')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: true });

        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );

        if (tipData && tipData.length > 0) {
          const tipIndex = dayOfYear % tipData.length;
          setTip(tipData[tipIndex].content);
        } else {
          // Use fallback tips
          const tipIndex = dayOfYear % FALLBACK_TIPS.length;
          setTip(FALLBACK_TIPS[tipIndex]);
        }

        // Check tracker eligibility
        const eligibility = await checkTrackerEligibility(user.id);
        setTrackerEligibility(eligibility);

        // Get recommendations if onboarding completed
        const onboardingDone = await hasCompletedOnboarding(user.id);
        if (onboardingDone) {
          const recs = await getRecommendations(user.id);
          if (recs.courses.length > 0) {
            setRecommendations(recs.courses);
            setShowRecommendations(true);
          }
        }

        // Fetch certificate count
        const { count: certCount } = await supabase
          .from('hub_certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setCertificateCount(certCount || 0);

        // Check if user already checked in today
        const today = new Date().toISOString().split('T')[0];
        const { data: checkInData } = await supabase
          .from('hub_assessments')
          .select('score')
          .eq('user_id', user.id)
          .eq('type', 'daily_check_in')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (checkInData && checkInData.length > 0) {
          setTodayCheckIn(checkInData[0].score);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  const handleCheckIn = async (score: number) => {
    if (!user?.id || isCheckingIn) return;

    setIsCheckingIn(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase.from('hub_assessments').insert({
        user_id: user.id,
        type: 'daily_check_in',
        score: score,
        data: { source: 'dashboard_widget' },
      });

      if (!error) {
        setTodayCheckIn(score);
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Welcome Banner Skeleton */}
        <div
          className="rounded-xl p-6 mb-8 animate-pulse"
          style={{ backgroundColor: '#2B3A67' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 bg-white/20 rounded w-64 mb-3" />
              <div className="h-5 bg-white/10 rounded w-48" />
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <div className="hub-card h-48 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
            <div className="hub-card h-32 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="hub-card h-32 animate-pulse" />
            <div className="hub-card h-24 animate-pulse" />
            <div className="hub-card h-36 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{ backgroundColor: '#2B3A67' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-semibold text-white mb-2"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '28px' }}
            >
              Welcome back, {firstName}
            </h1>
            <p
              className="text-white/70 text-base md:text-lg"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {dailyMessage}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center">
            <AvatarDisplay
              size={48}
              avatarId={profile?.avatar_id}
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
            />
            <span
              className="text-xs mt-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#E8B84B',
              }}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid - Left column (main) + Right column (sidebar) */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Continue Learning Section */}
          <div className="hub-card">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <BookOpen size={20} style={{ color: '#E8B84B' }} />
              </div>
              <h2
                className="font-semibold"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '18px',
                  color: '#2B3A67',
                }}
              >
                Continue Learning
              </h2>
            </div>

            {enrollments.length > 0 ? (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-lg border border-gray-100 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span
                          className="inline-block text-[11px] font-medium px-2 py-0.5 rounded mb-2"
                          style={{
                            backgroundColor: '#E8B84B20',
                            color: '#B45309',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {enrollment.course?.category || 'Course'}
                        </span>
                        <h3
                          className="font-bold"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '16px',
                            color: '#2B3A67',
                          }}
                        >
                          {enrollment.course?.title}
                        </h3>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${enrollment.progress_percentage}%`,
                            backgroundColor: '#E8B84B',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className="text-[13px] text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {enrollment.lessons_completed} of {enrollment.total_lessons} lessons complete
                      </span>
                      <Link
                        href={`/hub/courses/${enrollment.course?.slug}`}
                        className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: '#E8B84B',
                          color: '#2B3A67',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                ))}

                <Link
                  href="/hub/courses"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  style={{
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  View all courses
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                iconBgColor="#BFDBFE"
                title="You have not enrolled in any courses yet."
                description="Browse the catalog to find your first course."
                buttonText="Browse Courses"
                buttonLink="/hub/courses"
              />
            )}
          </div>

          {/* Recommended for You Section */}
          {showRecommendations && recommendations.length > 0 && (
            <div className="hub-card">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <Sparkles size={20} style={{ color: '#E8B84B' }} />
                </div>
                <h2
                  className="font-semibold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '18px',
                    color: '#2B3A67',
                  }}
                >
                  Recommended for You
                </h2>
              </div>

              <div className="space-y-3">
                {recommendations.map((course) => (
                  <Link
                    key={course.id}
                    href={`/hub/courses/${course.slug}`}
                    className="block p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span
                          className="inline-block text-[11px] font-medium px-2 py-0.5 rounded mb-2"
                          style={{
                            backgroundColor: '#E8B84B20',
                            color: '#B45309',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {course.category}
                        </span>
                        <h3
                          className="font-bold line-clamp-1"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '15px',
                            color: '#2B3A67',
                          }}
                        >
                          {course.title}
                        </h3>
                        <p
                          className="text-xs text-gray-500 mt-1"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {course.reason}
                        </p>
                      </div>
                      <span
                        className="text-[11px] font-medium px-2 py-1 rounded flex-shrink-0"
                        style={{
                          backgroundColor: '#E8B84B',
                          color: '#2B3A67',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {course.pd_hours} PD
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Got 5 Minutes Section */}
          <div className="hub-card">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Zap size={20} style={{ color: '#E8B84B' }} />
              </div>
              <h2
                className="font-semibold"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '18px',
                  color: '#2B3A67',
                }}
              >
                Got 5 Minutes?
              </h2>
            </div>

            {quickWin ? (
              <div
                className="p-4 rounded-lg"
                style={{ borderLeft: '4px solid #E8B84B', backgroundColor: '#FAFAF8' }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '16px',
                    color: '#2B3A67',
                  }}
                >
                  {quickWin.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded"
                    style={{
                      backgroundColor: '#F5F5F5',
                      color: '#6B7280',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <Clock size={12} />
                    Takes about {quickWin.estimated_minutes} minutes
                  </span>
                  <Link
                    href={`/hub/courses/${quickWin.course_slug}/${quickWin.slug}`}
                    className="text-sm font-medium px-4 py-2 rounded-lg border-2 transition-colors hover:bg-[#FFF8E7]"
                    style={{
                      borderColor: '#E8B84B',
                      color: '#2B3A67',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Try it now
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="p-6 rounded-lg text-center"
                style={{ backgroundColor: '#FAFAF8' }}
              >
                <p
                  className="text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Quick Wins are coming soon. Short, practical tools you can use in 3-5 minutes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Today's TDI Tip */}
          <div className="hub-card">
            <span
              className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-3"
              style={{
                color: '#E8B84B',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              TDI Tip
            </span>
            <p
              className="text-[15px] text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tip}
            </p>
            <ShareMenu
              type="tip"
              text={tip}
              buttonVariant="ghost"
              buttonSize="sm"
            />
          </div>

          {/* Certificates Widget */}
          <div className="hub-card">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Award size={20} style={{ color: '#E8B84B' }} />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    color: '#2B3A67',
                  }}
                >
                  {certificateCount}
                </p>
              </div>
            </div>
            <p
              className="text-sm text-gray-600 mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {certificateCount === 0
                ? '0 certificates earned yet. Complete a course to earn PD hours.'
                : `certificate${certificateCount !== 1 ? 's' : ''} earned`}
            </p>
            <Link
              href="/hub/certificates"
              className="text-sm font-medium hover:underline"
              style={{
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View certificates
            </Link>
          </div>

          {/* Stress Check-In Widget */}
          <div className="hub-card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} style={{ color: '#E8B84B' }} />
              <h3
                className="font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#2B3A67',
                }}
              >
                How are you feeling today?
              </h3>
            </div>

            {todayCheckIn !== null ? (
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <p
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Thanks for checking in. {CHECKIN_RESPONSES[todayCheckIn]}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleCheckIn(num)}
                      disabled={isCheckingIn}
                      className="w-12 h-12 rounded-lg font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        backgroundColor: '#F5F5F5',
                        color: '#2B3A67',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[11px] text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Great
                  </span>
                  <span
                    className="text-[11px] text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Rough
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Transformation Tracker Teaser - shown when not eligible */}
          {trackerEligibility && !trackerEligibility.isEligible && (
            <div
              className="hub-card"
              style={{ backgroundColor: '#FAFAF8', border: '1px dashed #E5E5E5' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E5E5E5' }}
                >
                  <Lock size={18} style={{ color: '#9CA3AF' }} />
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#6B7280',
                  }}
                >
                  Your Transformation Tracker
                </h3>
              </div>
              <p
                className="text-sm text-gray-500 mb-4"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Complete 1 course and 2 check-ins to unlock your growth dashboard.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Courses
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (trackerEligibility.completedCourses / trackerEligibility.requiredCourses) * 100)}%`,
                          backgroundColor: trackerEligibility.completedCourses >= trackerEligibility.requiredCourses ? '#10B981' : '#E8B84B',
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: trackerEligibility.completedCourses >= trackerEligibility.requiredCourses ? '#10B981' : '#6B7280',
                      }}
                    >
                      {trackerEligibility.completedCourses}/{trackerEligibility.requiredCourses}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Check-ins
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (trackerEligibility.totalAssessments / trackerEligibility.requiredAssessments) * 100)}%`,
                          backgroundColor: trackerEligibility.totalAssessments >= trackerEligibility.requiredAssessments ? '#10B981' : '#E8B84B',
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: trackerEligibility.totalAssessments >= trackerEligibility.requiredAssessments ? '#10B981' : '#6B7280',
                      }}
                    >
                      {trackerEligibility.totalAssessments}/{trackerEligibility.requiredAssessments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transformation Tracker Link - shown when eligible */}
          {trackerEligibility && trackerEligibility.isEligible && (
            <Link
              href="/hub/transformation"
              className="hub-card block hover:shadow-md transition-shadow"
              style={{ borderLeft: '4px solid #E8B84B' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <TrendingUp size={18} style={{ color: '#E8B84B' }} />
                </div>
                <div>
                  <h3
                    className="font-bold"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      color: '#2B3A67',
                    }}
                  >
                    Your Growth Journey
                  </h3>
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    View your progress and milestones
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
