'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useTranslation } from '@/lib/hub/useTranslation';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { checkTrackerEligibility, type TrackerEligibility } from '@/lib/hub/transformation';
import { getRecommendations, hasCompletedOnboarding, type RecommendedCourse } from '@/lib/hub/recommendations';
import { checkRecognitions } from '@/lib/hub/recognitions';
import dynamic from 'next/dynamic';
import GiftElement from '@/components/hub/GiftElement';

const OnboardingTour = dynamic(() => import('@/components/hub/OnboardingTour'), { ssr: false });
import {
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Heart,
  Share2,
  X,
  Copy,
  Mail,
  MessageCircle,
  Check,
} from 'lucide-react';

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

const CELEBRATION_CATEGORIES = [
  { key: 'showed-up', label: 'I showed up for myself today' },
  { key: 'tried-new', label: 'I tried something new in my classroom' },
  { key: 'earned-pd', label: 'I earned PD hours on my own time' },
  { key: 'found-tool', label: 'I found a tool that saved me hours' },
  { key: 'invested', label: 'I invested in myself when nobody asked me to' },
  { key: 'tough-week', label: 'I made it through a tough week' },
  { key: 'helped', label: 'I helped another teacher by sharing a resource' },
  { key: 'completed', label: 'I completed a course' },
] as const;

const CELEBRATION_MESSAGES: Record<string, string[]> = {
  'showed-up': [
    'Took 5 minutes for myself today between 2nd and 3rd period. Revolutionary concept, I know. teachersdeserveit.com',
    'Today I chose to invest in myself before I burned out. Wild behavior for a teacher. teachersdeserveit.com',
    'Logged into my PD hub today instead of doom-scrolling the teacher subreddit. Growth. teachersdeserveit.com',
    'Showed up for myself today. Not for admin, not for evals. For me. teachersdeserveit.com',
    'Opened a PD resource during my planning period instead of stress-eating crackers. Progress. teachersdeserveit.com',
  ],
  'tried-new': [
    'Tried a new strategy today and my kids actually responded. Mark the calendar. teachersdeserveit.com',
    'Downloaded a tool, used it by lunch, and my afternoon class was smoother. This is the PD I actually need. teachersdeserveit.com',
    'Tested a new idea in 3rd period. Nobody cried. Calling it a win. teachersdeserveit.com',
    'Took a risk with a new approach today. My students were more engaged than I expected. teachersdeserveit.com',
  ],
  'earned-pd': [
    'Getting PD hours from my couch in my pajamas. The future is now. teachersdeserveit.com',
    'Earned PD credit without sitting through a 3-hour after-school session. I will never go back. teachersdeserveit.com',
    'Racking up PD hours at my own pace, on my own terms. This is how it should work. teachersdeserveit.com',
    'Just earned PD hours while my laundry was running. Multitasking queen. teachersdeserveit.com',
  ],
  'found-tool': [
    'Found a 5-minute download that replaced 45 minutes of planning. Consider my Sunday free. teachersdeserveit.com',
    'My co-teacher asked why I was smiling. It is because I found a tool that does the thing I hate. teachersdeserveit.com',
    'Discovered a resource that cut my prep time in half. Why did nobody tell me sooner. teachersdeserveit.com',
    'Found the cheat code. A tool that does in 5 minutes what used to take my entire planning period. teachersdeserveit.com',
  ],
  'invested': [
    'Nobody told me to do this PD. I just wanted to be better. Teachers are different. teachersdeserveit.com',
    'Investing in myself because nobody else budgeted for it. Classic. teachersdeserveit.com',
    'Spent my own time getting better at my craft. No stipend, no requirement. Just drive. teachersdeserveit.com',
    'Did professional development because I wanted to, not because I had to. That hits different. teachersdeserveit.com',
  ],
  'tough-week': [
    'Survived another week. Downloaded a stress tool. Eating ice cream. This is recovery. teachersdeserveit.com',
    'Made it to Friday. That is the whole tweet. teachersdeserveit.com',
    'This week tried to break me but I am still here and still learning. teachersdeserveit.com',
    'Rough week but I showed up every single day. Give teachers a raise or at least a nap. teachersdeserveit.com',
  ],
  'helped': [
    'Sent a resource to my teacher bestie today. We rise by lifting others or whatever. teachersdeserveit.com',
    'Shared a tool in the group chat and three people texted back THANK YOU. That is my PD. teachersdeserveit.com',
    'Helped a colleague find a resource today. Community over competition, always. teachersdeserveit.com',
    'Forwarded a resource to my team and someone said it changed their whole lesson. That feeling. teachersdeserveit.com',
  ],
  'completed': [
    'Just finished a course in my pajamas on a Tuesday night. Who needs Netflix. teachersdeserveit.com',
    'Course complete. Certificate earned. Resume updated. Boss move. teachersdeserveit.com',
    'Finished a full PD course on my own time. Somebody put this on my evaluation. teachersdeserveit.com',
    'Another course done. Another skill unlocked. Teachers never stop learning. teachersdeserveit.com',
  ],
};

function getCelebrationMessage(categoryKey: string, tipText: string): string {
  const messages = CELEBRATION_MESSAGES[categoryKey];
  if (!messages || messages.length === 0) return '';
  // Deterministic pick based on category + current date
  const dateStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  const seed = categoryKey + dateStr;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % messages.length;
  let msg = messages[index];
  // Append tip if relevant for certain categories
  if (['showed-up', 'invested'].includes(categoryKey) && tipText) {
    msg += '\n\nToday\'s TDI tip: "' + tipText + '"';
  }
  return msg;
}

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
  duration_minutes: number;
  category: string;
}

interface SavedCourse {
  id: string;
  slug: string;
  title: string;
  category: string;
}

export default function HubDashboard() {
  const router = useRouter();
  const { profile, user } = useHub();
  const { favorites } = useFavorites();
  const { tUI } = useTranslation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [featuredQuickWins, setFeaturedQuickWins] = useState<QuickWin[]>([]);
  const [tip, setTip] = useState<string>(FALLBACK_TIPS[0]);
  const [certificateCount, setCertificateCount] = useState<number>(0);
  const [fieldNotesCount, setFieldNotesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [trackerEligibility, setTrackerEligibility] = useState<TrackerEligibility | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [showCelebrateModal, setShowCelebrateModal] = useState(false);
  const [celebrateCopied, setCelebrateCopied] = useState(false);
  const [selectedCelebration, setSelectedCelebration] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [tourChecked, setTourChecked] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

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

        // Fetch quick wins from hub_quick_wins
        const { data: quickWinData } = await supabase
          .from('hub_quick_wins')
          .select('id, slug, title, duration_minutes, category')
          .eq('is_published', true)
          .limit(6);

        if (quickWinData && quickWinData.length > 0) {
          const mapped: QuickWin[] = quickWinData.map((qw) => ({
            id: qw.id,
            slug: qw.slug,
            title: qw.title,
            duration_minutes: qw.duration_minutes || 5,
            category: qw.category || 'Classroom Tools',
          }));
          setQuickWins(mapped.slice(0, 3));
          setFeaturedQuickWins(mapped.slice(0, 3));
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

        // Check Field Notes (recognitions)
        try {
          const recResult = await checkRecognitions(user.id, supabase);
          setFieldNotesCount(recResult.earned.length);
        } catch {
          // Silent fail
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  // Load saved courses when favorites change
  useEffect(() => {
    async function loadSavedCourses() {
      if (favorites.size === 0) {
        setSavedCourses([]);
        return;
      }

      const supabase = getSupabase();
      const favoriteIds = Array.from(favorites);

      const { data } = await supabase
        .from('hub_courses')
        .select('id, slug, title, category')
        .in('id', favoriteIds)
        .eq('is_published', true);

      if (data) {
        setSavedCourses(data);
      }
    }

    loadSavedCourses();
  }, [favorites]);

  // Check if user needs the onboarding tour
  useEffect(() => {
    if (!user?.id || tourChecked) return;

    async function checkTourStatus() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_activity_log')
        .select('id')
        .eq('user_id', user!.id)
        .eq('action', 'tour_completed')
        .limit(1)
        .maybeSingle();

      setTourChecked(true);
      if (data) {
        setTourCompleted(true);
      }
    }

    checkTourStatus();
  }, [user?.id, tourChecked]);

  const handleTourComplete = useCallback((stopsSeen: number) => {
    setShowTour(false);
    setTourCompleted(true);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={{ background: '#F0EEE9', minHeight: '100vh' }}>
        {/* Welcome Banner Skeleton - Full width */}
        <div
          className="animate-pulse"
          style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
            <div className="h-6 bg-white/20 rounded w-24 mb-3" />
            <div className="h-8 bg-white/20 rounded w-64 mb-2" />
            <div className="h-5 bg-white/10 rounded w-48" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
              <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl h-32 animate-pulse" style={{ background: '#1B2A4A' }} />
              <div className="bg-white rounded-2xl h-24 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }} />
              <div className="bg-white rounded-2xl h-36 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F0EEE9', minHeight: '100vh' }}>
      {/* Welcome Hero - Full width */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
      >
        {/* Decorative circles - purely visual */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '-50px', top: '-70px', width: '260px', height: '260px', background: 'rgba(255,186,6,0.07)' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '50px', bottom: '-90px', width: '180px', height: '180px', background: 'rgba(56,97,140,0.5)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8">
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

      {/* Main Content - Constrained width */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Tour welcome card -- persistent until they take the tour */}
        {tourChecked && !tourCompleted && !showTour && (
          <div
            className="mb-6 p-4 flex items-center justify-between rounded-xl"
            style={{ backgroundColor: '#1e2749', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div>
              <p className="text-sm font-semibold text-white">{tUI('Welcome to the new TDI Learning Hub')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{tUI('A lot has changed. Take a quick tour when you are ready.')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button
                onClick={() => setShowTour(true)}
                className="text-xs font-semibold px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                {tUI('Take the tour')}
              </button>
            </div>
          </div>
        )}

        {/* Main Grid - Left column (main) + Right column (sidebar) */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Continue Learning / Where to Start Section */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
              {enrollments.length > 0 ? tUI('Continue Learning') : tUI('Where to Start')}
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
                          {tUI('Resume')}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6">
                  {/* Where to Start - new user experience */}
                  <h2
                    className="font-semibold mb-1"
                    style={{ color: '#1e2749', fontFamily: "'Source Serif 4', serif", fontSize: '20px' }}
                  >
                    {tUI('Your first 5 minutes start here')}
                  </h2>
                  <p className="text-sm mb-5" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                    {tUI('Pick a quick win to try right now, or dive into a full course. No pressure, no deadlines.')}
                  </p>

                  {/* Featured Quick Wins grid */}
                  {featuredQuickWins.length > 0 && (
                    <div className="space-y-2.5 mb-5">
                      {featuredQuickWins.map((qw) => {
                        const categoryColors: Record<string, string> = {
                          'Stress Relief': '#E0F4FF',
                          'Time Savers': '#FEF3C7',
                          'Classroom Tools': '#E8F5E9',
                          'Communication': '#F3E8FF',
                          'Self-Care': '#FCE7F3',
                        };
                        const categoryBg = categoryColors[qw.category] || '#F3F4F6';
                        return (
                          <div
                            key={qw.id}
                            className="flex items-center gap-3 rounded-xl overflow-hidden"
                            style={{ border: '0.5px solid #E9E7E2', background: '#FAFAF8' }}
                          >
                            <div
                              className="w-1.5 self-stretch flex-shrink-0"
                              style={{ background: categoryBg }}
                            />
                            <div className="flex-1 py-3 pr-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <span
                                  className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1"
                                  style={{ background: categoryBg, color: '#1e2749', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                >
                                  {qw.category}
                                </span>
                                <div className="text-sm font-semibold" style={{ color: '#1e2749' }}>
                                  {qw.title}
                                </div>
                                <div className="text-xs" style={{ color: '#9CA3AF' }}>
                                  {qw.duration_minutes} min &middot; PDF Download
                                </div>
                              </div>
                              <Link
                                href={`/hub/quick-wins/${qw.slug}`}
                                className="flex-shrink-0 text-xs font-semibold rounded-lg px-4 py-1.5 whitespace-nowrap"
                                style={{ background: '#FFBA06', color: '#1e2749' }}
                              >
                                {tUI('Try it')}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Browse Courses button */}
                  <Link
                    href="/hub/courses"
                    className="block w-full text-center text-sm font-semibold rounded-lg px-4 py-2.5 mb-3"
                    style={{ background: '#1e2749', color: 'white' }}
                  >
                    {tUI('Browse Courses')}
                  </Link>

                  {/* Explore Quick Wins link */}
                  <Link
                    href="/hub/quick-wins"
                    className="block text-center text-sm font-medium hover:underline"
                    style={{ color: '#38618C' }}
                  >
                    {tUI('Or explore all Quick Wins')}
                  </Link>
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
                {tUI('View all courses')}
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Saved - only show if teacher has bookmarked anything */}
          {savedCourses.length > 0 && (
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                {tUI('Saved')}
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {savedCourses.slice(0, 3).map(course => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl flex items-center gap-3 px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
                    style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
                    onClick={() => router.push(`/hub/courses/${course.slug}`)}
                  >
                    <Heart size={14} style={{ color: '#E53935', fill: '#E53935', flexShrink: 0 }} />
                    <span className="text-sm font-medium flex-1" style={{ color: '#1B2A4A' }}>{course.title}</span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{course.category}</span>
                  </div>
                ))}
              </div>
              {savedCourses.length > 3 && (
                <Link href="/hub/courses?filter=Saved" className="text-xs font-semibold" style={{ color: '#38618C' }}>
                  View all {savedCourses.length} saved →
                </Link>
              )}
            </div>
          )}

          {/* Recommended for You Section */}
          {showRecommendations && recommendations.length > 0 && (
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                {tUI('Recommended for You')}
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
                        {course.pd_hours} {tUI('PD Hours')}
                      </div>
                      <div className="text-sm font-semibold mb-0.5" style={{ color: '#1B2A4A' }}>{course.title}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{course.reason || tUI('Popular with educators')}</div>
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
              {tUI('Quick Wins')}
            </div>
            {quickWins.length > 0 ? (
              <div className="space-y-2.5 mb-4">
                {quickWins.map((qw) => {
                  const categoryColors: Record<string, string> = {
                    'Stress Relief': '#E0F4FF',
                    'Time Savers': '#FEF3C7',
                    'Classroom Tools': '#E8F5E9',
                    'Communication': '#F3E8FF',
                    'Self-Care': '#FCE7F3',
                  };
                  const categoryBg = categoryColors[qw.category] || '#F3F4F6';
                  return (
                    <div
                      key={qw.id}
                      className="flex items-center gap-3 rounded-xl overflow-hidden"
                      style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
                    >
                      <div
                        className="w-1.5 self-stretch flex-shrink-0"
                        style={{ background: categoryBg }}
                      />
                      <div className="flex-1 py-3 pr-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span
                            className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1"
                            style={{ background: categoryBg, color: '#1e2749', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                          >
                            {qw.category}
                          </span>
                          <div className="text-sm font-semibold leading-snug" style={{ color: '#1B2A4A' }}>
                            {qw.title}
                          </div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>
                            {qw.duration_minutes} min
                          </div>
                        </div>
                        <Link
                          href={`/hub/quick-wins/${qw.slug}`}
                          className="flex-shrink-0 text-xs font-semibold rounded-lg px-4 py-1.5 whitespace-nowrap"
                          style={{ background: '#1B2A4A', color: 'white' }}
                        >
                          {tUI('Try it now')}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="rounded-xl p-6 text-center mb-4"
                style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
              >
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {tUI('Quick Wins are loading...')}
                </p>
              </div>
            )}
            <Link
              href="/hub/quick-wins"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#1B2A4A' }}
            >
              {tUI('View all Quick Wins')}
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
              {tUI('TDI Tip')}
            </div>
            <div className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {tip}
            </div>
            <button
              onClick={() => setShowCelebrateModal(true)}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <Share2 size={14} />
              {tUI('Share your wins')}
            </button>
          </div>

          {/* The Gift */}
          <GiftElement />

          {/* Achievements Widget */}
          <div
            className="bg-white rounded-2xl p-5 mb-4"
            style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FEF3C7' }}
              >
                <Award size={20} style={{ color: '#D97706' }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{certificateCount + fieldNotesCount}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{tUI('Achievements earned')}</div>
              </div>
              <Link href="/hub/certificates" className="ml-auto text-xs font-semibold" style={{ color: '#38618C' }}>
                {tUI('View all')} →
              </Link>
            </div>
            {(certificateCount > 0 || fieldNotesCount > 0) && (
              <div className="flex gap-4 text-xs" style={{ color: '#6B7280' }}>
                {certificateCount > 0 && <span>{certificateCount} {tUI('Certificates')}</span>}
                {fieldNotesCount > 0 && <span>{fieldNotesCount} {tUI('Field Notes')}</span>}
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
                <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{tUI('Your Transformation Tracker')}</div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px' }}
                >
                  {tUI('Locked')}
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
                {tUI('Complete 1 course and 2 check-ins to unlock your growth dashboard.')}
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="text-xs w-16 flex-shrink-0" style={{ color: '#6B7280' }}>{tUI('Courses')}</div>
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
                  <div className="text-xs w-16 flex-shrink-0" style={{ color: '#6B7280' }}>{tUI('Check-ins')}</div>
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
                <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{tUI('Your Transformation Tracker')}</div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: '#FEF3C7', color: '#854F0B', fontSize: '10px' }}
                >
                  {tUI('Building')}
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
                    {tUI('View your progress and milestones')}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: '#38618C' }} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
    {/* Celebrate & Share Modal */}
    {showCelebrateModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setShowCelebrateModal(false)}
      >
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact header */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#1e2749' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
                {tUI('Share your win')}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                {tUI('Pick one, we will write the rest')}
              </p>
            </div>
            <button
              onClick={() => setShowCelebrateModal(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Step 1: Pick your win (always visible) */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-2">
                {CELEBRATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCelebration(cat.key);
                      setCelebrateCopied(false);
                    }}
                    className="text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border"
                    style={
                      selectedCelebration === cat.key
                        ? { background: '#FFBA06', borderColor: '#FFBA06', color: '#1e2749' }
                        : { background: 'white', borderColor: '#E5E7EB', color: '#4B5563' }
                    }
                  >
                    {tUI(cat.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Message + share (only after selection) */}
            {selectedCelebration && (() => {
              const message = getCelebrationMessage(selectedCelebration, tip);
              const encodedMessage = encodeURIComponent(message);
              return (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid #F3F4F6' }}>
                  {/* The message -- this is the star */}
                  <div
                    className="my-4 p-4 rounded-xl"
                    style={{ background: '#1e2749' }}
                  >
                    <p style={{ fontSize: '14px', color: 'white', lineHeight: '1.6', fontStyle: 'italic' }}>
                      &ldquo;{message}&rdquo;
                    </p>
                  </div>

                  {/* Copy -- primary action */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message);
                      setCelebrateCopied(true);
                      setTimeout(() => setCelebrateCopied(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mb-4"
                    style={
                      celebrateCopied
                        ? { background: '#D1FAE5', color: '#065F46' }
                        : { background: '#FFBA06', color: '#1e2749' }
                    }
                  >
                    {celebrateCopied ? <Check size={14} /> : <Copy size={14} />}
                    {celebrateCopied ? tUI('Copied!') : tUI('Copy and paste anywhere')}
                  </button>

                  {/* Share shortcuts -- compact row */}
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {[
                      { label: 'Email', href: `mailto:?subject=${encodeURIComponent('My teacher win today')}&body=${encodedMessage}` },
                      { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('My teacher win today')}&body=${encodedMessage}` },
                      { label: 'Text', href: `sms:?&body=${encodedMessage}` },
                      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}` },
                      { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodedMessage}` },
                      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://teachersdeserveit.com')}` },
                      { label: 'WhatsApp', href: `https://wa.me/?text=${encodedMessage}` },
                    ].map((ch) => (
                      <a
                        key={ch.label}
                        href={ch.href}
                        target={ch.label === 'Email' || ch.label === 'Text' ? undefined : '_blank'}
                        rel={ch.label === 'Email' || ch.label === 'Text' ? undefined : 'noopener noreferrer'}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors hover:bg-gray-50"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                      >
                        {tUI(ch.label)}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}
    {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </div>
  );
}
