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
    <div className="p-4 md:p-8 max-w-6xl mx-auto" style={{ background: '#F0EEE9', minHeight: '100vh' }}>
      {/* Welcome Hero */}
      <section
        className="relative text-white overflow-hidden rounded-2xl mb-6"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
      >
        {/* Decorative circles - purely visual */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '-50px', top: '-70px', width: '260px', height: '260px', background: 'rgba(255,186,6,0.07)' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '50px', bottom: '-90px', width: '180px', height: '180px', background: 'rgba(56,97,140,0.5)' }} />

        <div className="relative z-10 px-8 py-8">
          {/* Role tag */}
          {profile?.role && (
            <div
              className="inline-flex items-center mb-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
              style={{
                background: 'rgba(255,186,6,0.15)',
                border: '1px solid rgba(255,186,6,0.3)',
                color: '#FFBA06',
                letterSpacing: '0.06em',
              }}
            >
              {roleLabel}
            </div>
          )}

          {/* Name */}
          <h1 className="text-3xl font-bold text-white mb-1" style={{ letterSpacing: '-0.3px' }}>
            Welcome back, {firstName}
          </h1>

          {/* Daily message */}
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{dailyMessage}</p>
        </div>
      </section>

      {/* Main Grid - Left column (main) + Right column (sidebar) */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Continue Learning Section */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
              Continue Learning
            </div>
            <div
              className="bg-white rounded-2xl mb-4"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              {enrollments.length > 0 ? (
                <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
                  {enrollments.map((enrollment, index) => {
                    const iconColors = ['#E0F4FF', '#E8F5E9', '#FEF3C7'];
                    const iconBg = iconColors[index % iconColors.length];
                    return (
                      <div
                        key={enrollment.id}
                        className="p-4 flex items-center gap-4"
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: iconBg }}
                        >
                          <BookOpen size={20} style={{ color: '#1B2A4A' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                            {enrollment.course?.title}
                          </div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>
                            {enrollment.lessons_completed} of {enrollment.total_lessons} lessons
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 rounded-full mt-2" style={{ background: '#F3F4F6' }}>
                            <div
                              style={{ background: '#FFBA06', height: '100%', borderRadius: '3px', width: `${enrollment.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          href={`/hub/courses/${enrollment.course?.slug}`}
                          className="ml-auto flex-shrink-0 text-xs font-semibold text-white rounded-lg px-4 py-1.5 whitespace-nowrap"
                          style={{ background: '#1B2A4A' }}
                        >
                          Resume
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    icon={BookOpen}
                    iconBgColor="#BFDBFE"
                    title="You have not enrolled in any courses yet."
                    description="Browse the catalog to find your first course."
                    buttonText="Browse Courses"
                    buttonLink="/hub/courses"
                  />
                </div>
              )}
            </div>
            {enrollments.length > 0 && (
              <Link
                href="/hub/courses"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{
                  color: '#1B2A4A',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                View all courses
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Recommended for You Section */}
          {showRecommendations && recommendations.length > 0 && (
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                Recommended for You
              </div>
              <div className="space-y-2.5 mb-4">
                {recommendations.map((course) => (
                  <Link
                    key={course.id}
                    href={`/hub/courses/${course.slug}`}
                    className="rounded-xl p-4 cursor-pointer flex justify-between items-start gap-3 hover:shadow-md transition-shadow"
                    style={{ background: '#F0F6FF', border: '0.5px solid #C8DEFF' }}
                  >
                    <div>
                      <div
                        className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-2"
                        style={{ background: '#1B2A4A', color: '#FFBA06', fontSize: '10px' }}
                      >
                        {course.pd_hours} PD Hours
                      </div>
                      <div className="text-sm font-semibold mb-0.5" style={{ color: '#1B2A4A' }}>{course.title}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{course.reason || 'Popular with educators'}</div>
                    </div>
                    <div className="text-base font-semibold flex-shrink-0 mt-1" style={{ color: '#38618C' }}>→</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins Section */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
              Quick Wins
            </div>
            {quickWin ? (
              <div
                className="rounded-xl p-3.5 cursor-pointer mb-4"
                style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
              >
                <div
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-2"
                  style={{ background: '#FEF3C7', color: '#854F0B', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}
                >
                  Quick Win
                </div>
                <div className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1B2A4A' }}>
                  {quickWin.title}
                </div>
                <div className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                  {quickWin.estimated_minutes} min
                </div>
                <Link
                  href={`/hub/courses/${quickWin.course_slug}/${quickWin.slug}`}
                  className="text-xs font-semibold text-white rounded-lg px-4 py-1.5 inline-block"
                  style={{ background: '#1B2A4A' }}
                >
                  Try it now
                </Link>
              </div>
            ) : (
              <div
                className="rounded-xl p-6 text-center mb-4"
                style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
              >
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Quick Wins are coming soon. Short, practical tools you can use in 3-5 minutes.
                </p>
              </div>
            )}
            <Link
              href="/hub/quick-wins"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#1B2A4A' }}
            >
              View all Quick Wins
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* TDI Tip */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: '#1B2A4A' }}>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: '#FFBA06', letterSpacing: '0.1em' }}
            >
              TDI Tip
            </div>
            <div className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {tip}
            </div>
            <ShareMenu
              type="tip"
              text={tip}
              buttonVariant="ghost"
              buttonSize="sm"
            />
          </div>

          {/* Certificates Widget */}
          <div
            className="bg-white rounded-2xl p-5 flex items-center gap-3.5 mb-4"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEF3C7' }}
            >
              <Award size={20} style={{ color: '#D97706' }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{certificateCount}</div>
              <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Certificates earned</div>
            </div>
            <Link href="/hub/certificates" className="ml-auto text-xs font-semibold" style={{ color: '#38618C' }}>
              View all →
            </Link>
          </div>

          {/* Check-In Widget */}
          <div
            className="bg-white rounded-2xl p-5 mb-4"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <div className="text-sm font-semibold mb-3.5" style={{ color: '#1B2A4A' }}>
              How are you feeling today?
            </div>

            {todayCheckIn !== null ? (
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <p className="text-sm text-gray-700">
                  Thanks for checking in. {CHECKIN_RESPONSES[todayCheckIn]}
                </p>
              </div>
            ) : (
              <div className="flex gap-1.5">
                {[
                  { label: 'Thriving', score: 5, bg: '#4CAF50', textColor: 'rgba(255,255,255,0.95)' },
                  { label: 'Good',     score: 4, bg: '#8BC34A', textColor: 'rgba(255,255,255,0.95)' },
                  { label: 'Okay',     score: 3, bg: '#FFC107', textColor: 'rgba(0,0,0,0.6)'        },
                  { label: 'Tough',    score: 2, bg: '#FF7043', textColor: 'rgba(255,255,255,0.95)' },
                  { label: 'Rough',    score: 1, bg: '#E53935', textColor: 'rgba(255,255,255,0.95)' },
                ].map(({ label, score, bg, textColor }) => (
                  <button
                    key={score}
                    onClick={() => handleCheckIn(score)}
                    disabled={isCheckingIn}
                    className="flex-1 rounded-lg border-none cursor-pointer flex items-center justify-center transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ background: bg, height: '44px' }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: '500', color: textColor }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transformation Tracker - shown when not eligible */}
          {trackerEligibility && !trackerEligibility.isEligible && (
            <div
              className="bg-white rounded-2xl p-5 mb-4"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Your Transformation Tracker</div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px' }}
                >
                  Locked
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
                Complete 1 course and 2 check-ins to unlock your growth dashboard.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="text-xs w-16 flex-shrink-0" style={{ color: '#6B7280' }}>Courses</div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (trackerEligibility.completedCourses / trackerEligibility.requiredCourses) * 100)}%`, background: '#FFBA06' }}
                    />
                  </div>
                  <div className="text-xs font-semibold w-7 text-right" style={{ color: '#1B2A4A' }}>
                    {trackerEligibility.completedCourses}/{trackerEligibility.requiredCourses}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-xs w-16 flex-shrink-0" style={{ color: '#6B7280' }}>Check-ins</div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (trackerEligibility.totalAssessments / trackerEligibility.requiredAssessments) * 100)}%`, background: '#4ecdc4' }}
                    />
                  </div>
                  <div className="text-xs font-semibold w-7 text-right" style={{ color: '#1B2A4A' }}>
                    {trackerEligibility.totalAssessments}/{trackerEligibility.requiredAssessments}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transformation Tracker Link - shown when eligible */}
          {trackerEligibility && trackerEligibility.isEligible && (
            <Link
              href="/hub/transformation"
              className="bg-white rounded-2xl p-5 block hover:shadow-md transition-shadow mb-4"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Your Transformation Tracker</div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: '#FEF3C7', color: '#854F0B', fontSize: '10px' }}
                >
                  Building
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <TrendingUp size={18} style={{ color: '#FFBA06' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                    View your progress and milestones
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: '#38618C' }} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
