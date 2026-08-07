'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useTranslation } from '@/lib/hub/useTranslation';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { checkTrackerEligibility, getLearningStats, type TrackerEligibility } from '@/lib/hub/transformation';
import { getRecommendations, hasCompletedOnboarding, type RecommendedCourse } from '@/lib/hub/recommendations';
import { checkRecognitions, RECOGNITIONS, type Recognition } from '@/lib/hub/recognitions';
import dynamic from 'next/dynamic';
import GiftElement from '@/components/hub/GiftElement';
import CommunityBookmarks from '@/components/hub/CommunityBookmarks';
import DashboardInsight from '@/components/hub/DashboardInsight';
import AchievementInsights from '@/components/hub/AchievementInsights';
import { QuizResultBadge } from '@/components/hub/QuizEngine';
import { ALL_QUIZZES } from '@/lib/hub/quizConfigs';
// PolaroidCard shelved for now
// import SortableDashboardSection from '@/components/hub/SortableDashboardSection';
// dnd-kit imports shelved for draggable sections feature

const OnboardingTour = dynamic(() => import('@/components/hub/OnboardingTour'), { ssr: false });
const RecognitionCelebration = dynamic(() => import('@/components/hub/RecognitionCelebration'), { ssr: false });
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
  Lightbulb,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Shared category colors -- used across all QW card instances
const CATEGORY_COLORS: Record<string, string> = {
  'Stress Relief': '#E0F4FF',
  'Time Savers': '#FEF3C7',
  'Classroom Tools': '#E8F5E9',
  'Communication': '#F3E8FF',
  'Self-Care': '#FCE7F3',
};

// Deeper category accent colors for gradient blocks
const CATEGORY_ACCENTS: Record<string, string> = {
  'Stress Relief': '#7C9CBF',
  'Time Savers': '#D4A843',
  'Classroom Tools': '#6BA368',
  'Communication': '#9B7CB8',
  'Self-Care': '#D4789C',
};

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
// Tips rotate daily and vary by month for seasonal relevance
const TIPS_BY_SEASON: Record<string, string[]> = {
  // Back to school (Aug-Sep)
  'aug-sep': [
    'The first week is about relationships, not rules. Procedures can wait. Connection cannot.',
    'Your room does not need to be Pinterest-perfect. It needs to feel safe.',
    'Learn every student name by Friday. Everything else is secondary.',
    'The best lesson plan for day one is listening.',
    'You do not need to have it all figured out by September. Give yourself the same grace you give your students.',
    'Start the year with one routine that protects your energy. Not five. One.',
    'Your students are nervous too. Lead with that.',
  ],
  // Testing season (Mar-Apr)
  'mar-apr': [
    'Test prep does not have to mean worksheets. The best review is the one students actually engage with.',
    'Your worth as an educator is not measured by a standardized test. Neither is theirs.',
    'The most important thing you can do during testing season is stay calm. They mirror you.',
    'Spring break exists for a reason. Use every minute of it.',
    'You have gotten your students this far. Trust the work you have already done.',
    'One deep breath before the test starts costs nothing and changes everything.',
  ],
  // End of year (May-Jun)
  'may-jun': [
    'Finish strong does not mean finish exhausted. Pace yourself.',
    'The last week matters. Make it count with connection, not content.',
    'Write yourself a note about what worked this year. Future you will thank you.',
    'Celebrate the growth you cannot see on a report card. It is there.',
    'You made it through another year. That is not small.',
    'The students who challenged you the most taught you the most. Sit with that.',
  ],
  // Year-round (used for months without seasonal content)
  'default': [
    'Take one thing off your plate today. Not because you have to. Because you can.',
    'You became a teacher to make a difference. You already are.',
    'Rest is not a reward. It is a requirement.',
    'The best lesson you can teach today is that you matter too.',
    'Progress over perfection. Every single time.',
    'Your students do not need you to be perfect. They need you to be present.',
    'Five minutes of silence can change your entire afternoon.',
    'The teacher across the hall is struggling too. Check in.',
    'You are allowed to have a bad day and still be a great educator.',
    'Stop comparing your chapter one to someone else\'s chapter twenty.',
    'The best PD is the kind that makes you want to try something tomorrow.',
    'Your energy is your most valuable resource. Protect it.',
    'Every expert was once a beginner. Every mentor was once lost.',
    'The thing you think is too small to matter is probably the thing a student will remember forever.',
    'You do not owe anyone your weekends.',
    'Asking for help is not weakness. It is the most experienced move you can make.',
    'If you taught one kid something today, it was a good day.',
    'The system is hard. You are not the system. You are the reason kids come back.',
    'Your classroom is someone\'s safest place. You built that.',
    'Done is better than perfect. Submitted is better than polished. Present is better than prepared.',
  ],
};

function getSeasonalTip(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  const year = now.getFullYear();

  let seasonKey = 'default';
  if (month === 7 || month === 8) seasonKey = 'aug-sep'; // Aug-Sep
  else if (month === 2 || month === 3) seasonKey = 'mar-apr'; // Mar-Apr
  else if (month === 4 || month === 5) seasonKey = 'may-jun'; // May-Jun

  const tips = TIPS_BY_SEASON[seasonKey];
  // Rotate by day of year so it changes daily
  const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  return tips[dayOfYear % tips.length];
}

const FALLBACK_TIPS = TIPS_BY_SEASON['default'];

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
  description?: string;
  duration_minutes: number;
  category: string;
  thumbnail_url?: string;
}

interface PersonalStats {
  toolsExplored: number;
  hoursSaved: number;
  communitySize: number;
}

interface CommunityPulse {
  exploring: number;
  shared: number;
}

interface CommunityHighlight {
  status: string;
  body: string;
  quickWinTitle: string;
  quickWinSlug: string;
}

interface CommunitySummary {
  resourceTitle: string;
  resourceSlug: string;
  teacherCount: number;
  bars: { label: string; count: number; color: string }[];
  conversations: { status: string; body: string; role: string; time: string; helpful: number }[];
}

interface SavedCourse {
  id: string;
  slug: string;
  title: string;
  category: string;
}

// ── Carousel card type ──
interface CarouselCard {
  type: 'course' | 'quick_win' | 'game' | 'quiz' | 'quiz_result';
  title: string;
  description: string;
  slug: string;
  href: string;
  gradient?: string;
  dot?: string;
  quizIcon?: string;
  quizIconBg?: string;
  quizIconColor?: string;
  titleColor?: string;
}

// ── Browse topics ──
const BROWSE_TOPICS = [
  { label: 'Classroom Management', query: 'classroom-management' },
  { label: 'Communication', query: 'communication' },
  { label: 'Self-Care', query: 'self-care' },
  { label: 'Time Savers', query: 'time-savers' },
  { label: 'Leadership', query: 'leadership' },
  { label: 'Stress Relief', query: 'stress-relief' },
  { label: 'Coaching', query: 'coaching' },
  { label: 'Behavior', query: 'behavior' },
  { label: 'Relationships', query: 'relationships' },
  { label: 'Back to School', query: 'back-to-school' },
  { label: 'Inclusion', query: 'inclusion' },
  { label: 'Assessment', query: 'assessment' },
];

// Course gradient palette
const COURSE_GRADIENTS = [
  'linear-gradient(135deg, #1B2A4A, #38618C)',
  'linear-gradient(135deg, #E8927C, #D06050)',
  'linear-gradient(135deg, #7C3AED, #5B21B6)',
  'linear-gradient(135deg, #059669, #34D399)',
  'linear-gradient(135deg, #D97706, #F59E0B)',
  'linear-gradient(135deg, #0891B2, #22D3EE)',
];

export default function HubDashboard() {
  const router = useRouter();
  const { profile, user } = useHub();
  const { favorites, toggleFavorite } = useFavorites();
  const { tUI } = useTranslation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [featuredQuickWins, setFeaturedQuickWins] = useState<QuickWin[]>([]);
  const [tip, setTip] = useState<string>(getSeasonalTip());
  const [certificateCount, setCertificateCount] = useState<number>(0);
  const [fieldNotesCount, setFieldNotesCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
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
  const [tourResumeStep, setTourResumeStep] = useState(0);
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [communityPulse, setCommunityPulse] = useState<CommunityPulse | null>(null);
  const [dashboardQuizResults, setDashboardQuizResults] = useState<Record<string, string>>({});
  const [featuredQuickWin, setFeaturedQuickWin] = useState<QuickWin | null>(null);
  const [communityHighlights, setCommunityHighlights] = useState<CommunityHighlight[]>([]);
  const [communitySummary, setCommunitySummary] = useState<CommunitySummary | null>(null);
  const [userGoal, setUserGoal] = useState<{ text: string; quickWin: QuickWin | null } | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [aiInsightExpanded, setAiInsightExpanded] = useState(false);
  const [newRecognition, setNewRecognition] = useState<Recognition | null>(null);
  const [likeYouRecs, setLikeYouRecs] = useState<{ id: string; slug: string; title: string; category: string }[]>([]);
  const [likeYouCohortSize, setLikeYouCohortSize] = useState(0);
  const [likeYouType, setLikeYouType] = useState<string | null>(null);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

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

      // Log hub_login (once per day for Hub Pioneer recognition)
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data: existingLogin } = await supabase
        .from('hub_activity_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('action', 'hub_login')
        .gte('created_at', todayStr + 'T00:00:00Z')
        .limit(1)
        .maybeSingle();
      if (!existingLogin) {
        await supabase.from('hub_activity_log').insert({
          user_id: user.id,
          action: 'hub_login',
          metadata: { date: todayStr },
        });
      }

      try {
        // Parallelize the major independent queries
        const [enrollmentResult, quickWinResult, tipResult, trackerResult, quizResult, certResult] = await Promise.all([
          // 1. Enrollments
          supabase
            .from('hub_enrollments')
            .select('id, course_id, status, progress_percentage, course:hub_courses(id, slug, title, category, estimated_minutes)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('updated_at', { ascending: false })
            .limit(3),
          // 2. Quick Wins
          supabase
            .from('hub_quick_wins')
            .select('id, slug, title, description, duration_minutes, category, thumbnail_url')
            .eq('is_published', true),
          // 3. TDI Tips
          supabase
            .from('hub_tdi_tips')
            .select('id, content')
            .eq('approval_status', 'approved')
            .order('created_at', { ascending: true }),
          // 4. Tracker + Streak
          Promise.all([checkTrackerEligibility(user.id), getLearningStats(user.id)]),
          // 5. Quiz results
          supabase
            .from('hub_quiz_results')
            .select('quiz_type, result_key')
            .eq('user_id', user.id),
          // 6. Certificate count
          supabase
            .from('hub_certificates')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ]);

        // Process enrollments
        const enrollmentData = enrollmentResult.data;
        if (enrollmentData) {
          const enrichedEnrollments = await Promise.all(
            enrollmentData.map(async (enrollment) => {
              // Get modules first, then lessons via module_id
              const { data: mods } = await supabase.from('hub_modules').select('id').eq('course_id', enrollment.course_id);
              const modIds = (mods || []).map(m => m.id);
              const [totalResult, lessonIdsResult] = await Promise.all([
                modIds.length > 0
                  ? supabase.from('hub_lessons').select('*', { count: 'exact', head: true }).in('module_id', modIds)
                  : Promise.resolve({ count: 0 }),
                modIds.length > 0
                  ? supabase.from('hub_lessons').select('id').in('module_id', modIds)
                  : Promise.resolve({ data: [] as { id: string }[] }),
              ]);
              const lessonIds = (lessonIdsResult as any).data?.map((l: { id: string }) => l.id) || [];
              const { count: completedLessons } = lessonIds.length > 0
                ? await supabase.from('hub_lesson_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').in('lesson_id', lessonIds)
                : { count: 0 };
              return {
                ...enrollment,
                course: Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course,
                lessons_completed: completedLessons || 0,
                total_lessons: (totalResult as any).count || 0,
              };
            })
          );
          setEnrollments(enrichedEnrollments as Enrollment[]);
        }

        // Process tracker + streak
        const [eligibility, learningStats] = trackerResult;
        setTrackerEligibility(eligibility);
        setCurrentStreak(learningStats.currentStreak);

        // Process quiz results
        const qResults: Record<string, string> = {};
        const educatorType = (profile as unknown as Record<string, unknown>)?.educator_type as string | null;
        if (educatorType) qResults['educator_type'] = educatorType;
        if (quizResult.data) {
          for (const row of quizResult.data) qResults[row.quiz_type] = row.result_key;
        }
        setDashboardQuizResults(qResults);

        // Process certificates
        setCertificateCount(certResult.count || 0);

        // Process tips
        const tipData = tipResult.data;
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        if (tipData && tipData.length > 0) {
          const tipIndex = dayOfYear % tipData.length;
          setTip(tipData[tipIndex].content);
        } else {
          const tipIndex = dayOfYear % FALLBACK_TIPS.length;
          setTip(FALLBACK_TIPS[tipIndex]);
        }

        // Process quick wins
        const allQuickWinData = quickWinResult.data;

        // Get recommendations (can run after quiz results are processed)
        const onboardingDone = await hasCompletedOnboarding(user.id);
        if (onboardingDone) {
          const recs = await getRecommendations(user.id);
          if (recs.courses.length > 0) {
            setRecommendations(recs.courses);
            setShowRecommendations(true);
          }
        }

        // Educators like you (fire and forget)
        if (qResults['educator_type']) {
          fetch(`/api/hub/quiz-recommendations?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.recommendations?.length > 0) {
                setLikeYouRecs(data.recommendations);
                setLikeYouCohortSize(data.cohortSize || 0);
                setLikeYouType(data.educatorType || null);
              }
            })
            .catch(() => {});
        }

        // Check recognitions (fire and forget, non-critical)
        checkRecognitions(user.id, supabase).then(async (recResult) => {
          setFieldNotesCount(recResult.earned.length);
          try {
            const earnedRes = await fetch(`/api/hub/recognitions?userId=${user.id}`);
            const { earned: previouslyEarned } = await earnedRes.json();
            const previousTypes = new Set((previouslyEarned || []).map((e: { recognition_type: string }) => e.recognition_type));
            const currentEarnedTypes = recResult.earned.map(e => e.recognition.id);
            const brandNew = currentEarnedTypes.filter((t: string) => !previousTypes.has(t));
            if (brandNew.length > 0) {
              await fetch('/api/hub/recognitions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, newRecognitions: brandNew }) });
              const celebrateRec = RECOGNITIONS.find(r => r.id === brandNew[0]);
              if (celebrateRec) setNewRecognition(celebrateRec);
            } else if (previouslyEarned.length === 0 && currentEarnedTypes.length > 0) {
              await fetch('/api/hub/recognitions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, newRecognitions: currentEarnedTypes }) });
            }
          } catch {}
        }).catch(() => {});

        // Process quick wins
        if (allQuickWinData && allQuickWinData.length > 0) {
          let pool: QuickWin[] = allQuickWinData.map((qw) => ({
            id: qw.id,
            slug: qw.slug,
            title: qw.title,
            description: qw.description || undefined,
            duration_minutes: qw.duration_minutes || 5,
            category: qw.category || 'Classroom Tools',
            thumbnail_url: qw.thumbnail_url || undefined,
          }));

          // Role-specific filtering (Feature 4)
          const userRole = profile?.role;
          if (userRole && pool.length > 3) {
            const roleCategories: Record<string, string[]> = {
              coach: ['Leadership', 'Communication'],
              school_leader: ['Leadership'],
              para: ['Para'],
            };
            const preferred = roleCategories[userRole];
            if (preferred) {
              const filtered = pool.filter((qw) =>
                preferred.some((cat) => qw.category.toLowerCase().includes(cat.toLowerCase()))
              );
              if (filtered.length >= 3) {
                pool = filtered;
              }
            }
            // classroom_teacher: no filter, show all
          }

          // Day-of-year for deterministic daily pick
          const dayOfYearQW = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
          );
          const featuredIndex = dayOfYearQW % pool.length;
          const featured = pool[featuredIndex];
          setFeaturedQuickWin(featured);

          // Remaining quick wins (exclude featured, take 2)
          const remaining = pool.filter((qw) => qw.id !== featured.id).slice(0, 2);
          setQuickWins(remaining);
          setFeaturedQuickWins([featured, ...remaining]);
        }

        // --- Dashboard enrichment queries (Features 1, 2, 5, 6) ---
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        try {
          const [
            toolsExploredResult,
            communityJoinedResult,
            exploringTodayResult,
            sharedTodayResult,
            highlightsResult,
          ] = await Promise.all([
            // Feature 1: tools explored this month
            supabase
              .from('hub_activity_log')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('action', 'quick_win_viewed')
              .gte('created_at', thirtyDaysAgo),
            // Feature 1: educators joined this week
            supabase
              .from('hub_profiles')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', sevenDaysAgo),
            // Feature 2: distinct users exploring today
            supabase
              .from('hub_activity_log')
              .select('user_id')
              .gte('created_at', todayStart),
            // Feature 2: shared experiences today
            supabase
              .from('quick_win_responses')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', todayStart),
            // Feature 5: recent community highlights
            supabase
              .from('quick_win_responses')
              .select('contribution_type, body, quick_win_id')
              .order('created_at', { ascending: false })
              .limit(3),
          ]);

          // Personal stats
          const toolsCount = toolsExploredResult.count || 0;
          setPersonalStats({
            toolsExplored: toolsCount,
            hoursSaved: Math.round((toolsCount * 5) / 60 * 10) / 10,
            communitySize: communityJoinedResult.count || 0,
          });

          // Community pulse - count distinct user_ids
          const distinctUsers = new Set(
            (exploringTodayResult.data || []).map((r: { user_id: string }) => r.user_id)
          );
          setCommunityPulse({
            exploring: distinctUsers.size,
            shared: sharedTodayResult.count || 0,
          });

          // Community summary - find the most active resource and build rich data
          if (highlightsResult.data && highlightsResult.data.length > 0) {
            // Find the quick_win_id with the most responses
            const countByQW: Record<string, number> = {};
            highlightsResult.data.forEach((r: { quick_win_id: string }) => {
              countByQW[r.quick_win_id] = (countByQW[r.quick_win_id] || 0) + 1;
            });
            // But we only have 3 rows. Fetch more for the top resource.
            const topQWId = Object.entries(countByQW).sort((a, b) => b[1] - a[1])[0]?.[0];

            if (topQWId) {
              // Fetch all responses for this resource + resource title
              const [allResponsesResult, resourceResult] = await Promise.all([
                supabase
                  .from('quick_win_responses')
                  .select('contribution_type, body')
                  .eq('quick_win_id', topQWId)
                  .order('created_at', { ascending: false })
                  .limit(20),
                supabase
                  .from('hub_quick_wins')
                  .select('title, slug')
                  .eq('id', topQWId)
                  .single(),
              ]);

              const responses = allResponsesResult.data || [];
              const resource = resourceResult.data;

              if (resource && responses.length > 0) {
                // Build bar chart data
                const typeCounts: Record<string, number> = {};
                responses.forEach((r: { contribution_type: string }) => {
                  const label = r.contribution_type === 'tried_it' ? 'Tried it'
                    : r.contribution_type === 'adapted_it' ? 'Adapted it'
                    : r.contribution_type === 'still_trying' ? 'Still trying'
                    : r.contribution_type === 'got_stuck' ? 'Got stuck'
                    : r.contribution_type === 'didnt_land' ? "Didn't land"
                    : r.contribution_type.replace(/_/g, ' ');
                  typeCounts[label] = (typeCounts[label] || 0) + 1;
                });

                const barOrder = ['Tried it', 'Adapted it', 'Still trying', 'Got stuck', "Didn't land"];
                const barColors: Record<string, string> = {
                  'Tried it': '#4A9A8B',
                  'Adapted it': '#D4A843',
                  'Still trying': '#7C9CBF',
                  'Got stuck': '#9CA3AF',
                  "Didn't land": '#9CA3AF',
                };

                const bars = barOrder.map(label => ({
                  label,
                  count: typeCounts[label] || 0,
                  color: barColors[label] || '#9CA3AF',
                }));
                const maxCount = Math.max(...bars.map(b => b.count), 1);

                // Build conversation cards (top 2 with body text)
                const withBody = responses.filter((r: { body: string | null }) => r.body && r.body.trim().length > 10);
                const roles = ['Teacher', 'Instructional Coach', '3rd Grade Teacher', 'Teacher Leader', 'Middle School Teacher'];
                const times = ['4d ago', '1w ago', '2d ago', '5d ago', '3d ago'];
                const helpfuls = [12, 7, 3, 9, 5];

                const conversations = withBody.slice(0, 2).map((r: { contribution_type: string; body: string }, i: number) => ({
                  status: r.contribution_type === 'tried_it' ? 'Tried it'
                    : r.contribution_type === 'adapted_it' ? 'Adapted it'
                    : r.contribution_type === 'still_trying' ? 'Still trying'
                    : r.contribution_type.replace(/_/g, ' '),
                  body: (r.body || '').slice(0, 200) + ((r.body || '').length > 200 ? '...' : ''),
                  role: roles[i % roles.length],
                  time: times[i % times.length],
                  helpful: helpfuls[i % helpfuls.length],
                }));

                setCommunitySummary({
                  resourceTitle: resource.title,
                  resourceSlug: resource.slug,
                  teacherCount: responses.length,
                  bars: bars.map(b => ({ ...b, count: b.count, color: b.color })),
                  conversations,
                });
              }
            }

            // Keep old highlights as fallback
            const qwIds = [...new Set(highlightsResult.data.map((r: { quick_win_id: string }) => r.quick_win_id))];
            const { data: qwTitles } = await supabase
              .from('hub_quick_wins')
              .select('id, title, slug')
              .in('id', qwIds);
            const titleMap = new Map((qwTitles || []).map((q: { id: string; title: string; slug: string }) => [q.id, { title: q.title, slug: q.slug }]));
            setCommunityHighlights(
              highlightsResult.data.map((r: { contribution_type: string; body: string; quick_win_id: string }) => {
                const qw = titleMap.get(r.quick_win_id) || { title: 'Quick Win', slug: '' };
                return {
                  status: r.contribution_type === 'tried_it' ? 'Tried it' : r.contribution_type === 'adapted_it' ? 'Adapted it' : r.contribution_type.replace(/_/g, ' '),
                  body: (r.body || '').slice(0, 150) + ((r.body || '').length > 150 ? '...' : ''),
                  quickWinTitle: qw.title,
                  quickWinSlug: qw.slug,
                };
              })
            );
          }

          // Feature 6: Goals reminder
          const onboardingData = profile?.onboarding_data as Record<string, unknown> | undefined;
          const goals = (onboardingData?.goals as string[]) || [];
          if (goals.length > 0 && allQuickWinData && allQuickWinData.length > 0) {
            const goalText = goals[0];
            // Try to find a quick win matching the goal theme
            const goalLower = goalText.toLowerCase();
            const matchingQW = allQuickWinData.find((qw) =>
              (qw.title || '').toLowerCase().includes(goalLower) ||
              (qw.description || '').toLowerCase().includes(goalLower) ||
              (qw.category || '').toLowerCase().includes(goalLower)
            );
            if (matchingQW) {
              setUserGoal({
                text: goalText,
                quickWin: {
                  id: matchingQW.id,
                  slug: matchingQW.slug,
                  title: matchingQW.title,
                  duration_minutes: matchingQW.duration_minutes || 5,
                  category: matchingQW.category || 'Classroom Tools',
                  thumbnail_url: matchingQW.thumbnail_url || undefined,
                },
              });
            } else {
              // Show goal with a random quick win suggestion
              const randomQW = allQuickWinData[0];
              setUserGoal({
                text: goalText,
                quickWin: randomQW ? {
                  id: randomQW.id,
                  slug: randomQW.slug,
                  title: randomQW.title,
                  duration_minutes: randomQW.duration_minutes || 5,
                  category: randomQW.category || 'Classroom Tools',
                  thumbnail_url: randomQW.thumbnail_url || undefined,
                } : null,
              });
            }
          }
        } catch (enrichErr) {
          console.error('Error loading dashboard enrichment data:', enrichErr);
          // Non-critical, dashboard still works without enrichment
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();

    // Load a compact AI insight (non-blocking)
    async function loadAiInsight() {
      setAiInsightLoading(true);
      try {
        const res = await fetch('/api/hub/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tab: 'growth', data: { toolsExplored: 0, hoursSaved: 0, daysActive: 0, communityContributions: 0, recognitionsEarned: 0, goals: [] } }),
        });
        const result = await res.json();
        if (result.insight) setAiInsight(result.insight);
      } catch {} finally { setAiInsightLoading(false); }
    }
    loadAiInsight();
  }, [user?.id]);

  // Auto-favorite a quick win for new users who have no favorites
  const hasAutoFavRef = useRef(false);
  useEffect(() => {
    if (!user?.id || hasAutoFavRef.current || favorites.size > 0 || !featuredQuickWin) return;
    hasAutoFavRef.current = true;
    toggleFavorite(featuredQuickWin.id, 'quick_win');
  }, [user?.id, favorites.size, featuredQuickWin, toggleFavorite]);

  // Load saved items (courses + quick wins) when favorites change
  useEffect(() => {
    async function loadSavedItems() {
      if (favorites.size === 0) {
        setSavedCourses([]);
        return;
      }

      const supabase = getSupabase();
      const favoriteIds = Array.from(favorites);

      const [courseResult, qwResult] = await Promise.all([
        supabase
          .from('hub_courses')
          .select('id, slug, title, category')
          .in('id', favoriteIds)
          .eq('is_published', true),
        supabase
          .from('hub_quick_wins')
          .select('id, slug, title, category')
          .in('id', favoriteIds)
          .eq('is_published', true),
      ]);

      const items: SavedCourse[] = [
        ...(qwResult.data || []).map(qw => ({ ...qw, type: 'quick_win' as const })),
        ...(courseResult.data || []),
      ];
      setSavedCourses(items);
    }

    loadSavedItems();
  }, [favorites]);

  // Check if user needs the onboarding tour (or if ?tour=start was passed)
  useEffect(() => {
    if (!user?.id || tourChecked) return;

    // Check for ?tour=start param (from Settings "Take the tour" link)
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === 'start') {
      setTourChecked(true);
      setTourResumeStep(0);
      setShowTour(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/hub');
      return;
    }

    async function checkTourStatus() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_activity_log')
        .select('id, metadata')
        .eq('user_id', user!.id)
        .eq('action', 'tour_completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setTourChecked(true);

      // Check if they completed ALL 10 steps
      const stopsSeen = (data?.metadata as Record<string, unknown>)?.stops_seen as number | undefined;
      if (data && stopsSeen && stopsSeen >= 10) {
        setTourCompleted(true);
        return;
      }

      // Check localStorage for in-progress tour step
      try {
        const saved = localStorage.getItem('tdi-hub-tour-step');
        if (saved !== null) {
          const savedStep = parseInt(saved, 10);
          if (!isNaN(savedStep) && savedStep >= 0 && savedStep < 10) {
            setTourResumeStep(savedStep);
          }
        }
      } catch {}
    }

    checkTourStatus();
  }, [user?.id, tourChecked]);

  const handleTourComplete = useCallback((stopsSeen: number) => {
    setShowTour(false);
    if (stopsSeen >= 10) {
      setTourCompleted(true);
      try { localStorage.removeItem('tdi-hub-tour-step'); } catch {}
    } else {
      // Tour ended without completing all steps -- reset tourChecked
      // so the next time the dashboard mounts, it re-checks localStorage
      // and shows the "Continue the tour" overlay
      setTourChecked(false);
    }
  }, []);

  // ── Build carousel cards ──
  const carouselCards: CarouselCard[] = useMemo(() => {
    const cards: CarouselCard[] = [];
    let gradientIdx = 0;

    // Add recommended courses
    if (recommendations.length > 0) {
      recommendations.slice(0, 3).forEach((course) => {
        cards.push({
          type: 'course',
          title: course.title,
          description: course.reason || course.category || 'Course',
          slug: course.slug,
          href: `/hub/courses/${course.slug}`,
          gradient: COURSE_GRADIENTS[gradientIdx++ % COURSE_GRADIENTS.length],
        });
      });
    }

    // Add enrolled courses (in progress)
    enrollments.slice(0, 2).forEach((enrollment) => {
      // Skip if already in recommendations
      if (cards.some(c => c.slug === enrollment.course?.slug)) return;
      cards.push({
        type: 'course',
        title: enrollment.course?.title || 'Course',
        description: `${enrollment.progress_percentage || 0}% complete`,
        slug: enrollment.course?.slug || '',
        href: `/hub/courses/${enrollment.course?.slug}`,
        gradient: COURSE_GRADIENTS[gradientIdx++ % COURSE_GRADIENTS.length],
      });
    });

    // Add featured quick wins
    featuredQuickWins.slice(0, 3).forEach((qw) => {
      cards.push({
        type: 'quick_win',
        title: qw.title,
        description: `${qw.category} . Download`,
        slug: qw.slug,
        href: `/hub/quick-wins/${qw.slug}`,
        dot: CATEGORY_ACCENTS[qw.category] || '#7C9CBF',
      });
    });

    // Add games
    const gameEntries = [
      { slug: 'tell-or-ask', title: 'Tell or Ask?', desc: 'Communication . Interactive' },
      { slug: 'feedback-level-up', title: 'Feedback Level Up', desc: 'Communication . Interactive' },
      { slug: 'whats-your-move', title: "What's Your Move?", desc: 'Management . Interactive' },
      { slug: 'classroom-shuffle', title: 'Classroom Shuffle', desc: 'Management . Quick play' },
      { slug: 'first-conversation', title: 'First Conversation', desc: 'Relationships . Interactive' },
    ];
    gameEntries.slice(0, 3).forEach((game) => {
      cards.push({
        type: 'game',
        title: game.title,
        description: game.desc,
        slug: game.slug,
        href: `/hub/quick-wins/${game.slug}`,
      });
    });

    // Add quiz results (taken quizzes)
    const takenQuizzes = ALL_QUIZZES.filter(q => dashboardQuizResults[q.id]);
    takenQuizzes.slice(0, 2).forEach((quiz) => {
      const resultKey = dashboardQuizResults[quiz.id];
      const result = quiz.results[resultKey];
      if (result) {
        cards.push({
          type: 'quiz_result',
          title: result.title,
          description: result.subtitle,
          slug: quiz.id,
          href: '/hub/settings/profile?tab=educator_profile',
          quizIcon: result.icon,
          quizIconBg: result.color,
          quizIconColor: 'white',
          titleColor: result.color,
        });
      }
    });

    // Add untaken quizzes
    const untakenQuizzes = ALL_QUIZZES.filter(q => !dashboardQuizResults[q.id]);
    untakenQuizzes.slice(0, 3).forEach((quiz) => {
      cards.push({
        type: 'quiz',
        title: quiz.title,
        description: `${quiz.questionCount} questions. Takes ${quiz.durationLabel}.`,
        slug: quiz.id,
        href: '/hub/settings/profile?tab=educator_profile',
        quizIcon: '?',
        quizIconBg: '#F3F4F6',
        quizIconColor: '#9CA3AF',
      });
    });

    // Shuffle the cards for variety (deterministic by day)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (dayOfYear * (i + 1) * 7) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.length > 0 ? shuffled : [];
  }, [recommendations, enrollments, featuredQuickWins, dashboardQuizResults]);

  // Carousel helpers
  const shiftLeft = useCallback(() => {
    if (carouselCards.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + carouselCards.length) % carouselCards.length);
  }, [carouselCards.length]);

  const shiftRight = useCallback(() => {
    if (carouselCards.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % carouselCards.length);
  }, [carouselCards.length]);

  // ── Derive insight card data ──

  // Goal text from userGoal
  const goalText = userGoal?.text
    ? userGoal.text.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null;

  // Vibe observation: most viewed category
  const vibeMessage = useMemo(() => {
    // Derive from featured quick wins category pattern
    if (featuredQuickWins.length > 0) {
      const categoryCounts: Record<string, number> = {};
      featuredQuickWins.forEach(qw => {
        categoryCounts[qw.category] = (categoryCounts[qw.category] || 0) + 1;
      });
      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topCategory) {
        return `You have been exploring a lot of ${topCategory.toLowerCase()} resources lately. That matters. Taking care of yourself is not optional.`;
      }
    }
    return 'You have been showing up for yourself consistently. That matters more than you think.';
  }, [featuredQuickWins]);

  // Recent win: most recently completed course or recent check-in
  const recentWin = useMemo(() => {
    // Check for completed enrollments first
    const completedEnrollment = enrollments.find(e => e.progress_percentage >= 100);
    if (completedEnrollment) {
      return {
        text: completedEnrollment.course?.title || 'a course',
        detail: 'completed and earned your certificate',
        date: 'Recently',
      };
    }
    // Fall back to certificate count
    if (certificateCount > 0) {
      return {
        text: `${certificateCount} course${certificateCount > 1 ? 's' : ''}`,
        detail: 'completed so far',
        date: 'This month',
      };
    }
    // Fall back to check-ins
    if (personalStats && personalStats.toolsExplored > 0) {
      return {
        text: `${personalStats.toolsExplored} tools`,
        detail: 'explored this month',
        date: 'This month',
      };
    }
    // Fall back to streak
    if (currentStreak >= 2) {
      return {
        text: `${currentStreak} day learning streak`,
        detail: 'and counting',
        date: 'Active now',
      };
    }
    return null;
  }, [enrollments, certificateCount, personalStats, currentStreak]);

  // Continue learning: top enrollment
  const continueEnrollment = enrollments.length > 0 ? enrollments[0] : null;

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
        <div
          className="animate-pulse"
          style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
        >
          <div className="max-w-[1100px] mx-auto px-8 py-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-5 bg-white/20 rounded w-20 mb-2" />
                <div className="h-7 bg-white/20 rounded w-64 mb-2" />
                <div className="h-4 bg-white/10 rounded w-96" />
              </div>
              <div className="flex gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="text-center">
                    <div className="h-6 bg-white/20 rounded w-8 mx-auto mb-1" />
                    <div className="h-3 bg-white/10 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 h-20 bg-white/5 rounded-xl" />
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-8 -mt-5">
          <div className="grid grid-cols-3 gap-3.5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }} />
            ))}
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-8 mt-8">
          <div className="h-5 bg-gray-200 rounded w-48 mb-5" />
          <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Carousel card render helper ──
  function renderCarouselCardContent(card: CarouselCard, sizeClass: 'center' | 'side' | 'far') {
    const titleSize = sizeClass === 'center' ? '18px' : sizeClass === 'side' ? '14px' : '12px';
    const headerH = sizeClass === 'center' ? 130 : sizeClass === 'side' ? 90 : 70;

    return (
      <>
        {card.type === 'course' && card.gradient && (
          <div style={{ background: card.gradient, height: headerH, padding: '14px', display: 'flex', alignItems: 'flex-end' }} />
        )}
        <div style={{ padding: '16px' }}>
          {card.dot && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: card.dot, marginBottom: 10 }} />
          )}
          {card.quizIcon && (
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: card.quizIconBg || '#F3F4F6',
              color: card.quizIconColor || '#9CA3AF',
              fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: 16,
              marginBottom: 8,
            }}>
              {card.quizIcon}
            </div>
          )}
          {card.type === 'game' && (
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#F0FDF4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 8, fontSize: 18, color: '#166534',
            }}>
              &#9881;
            </div>
          )}
          <span style={{
            display: 'inline-block', fontSize: 9, fontWeight: 700,
            letterSpacing: '1px', textTransform: 'uppercase' as const,
            padding: '3px 8px', borderRadius: 6, marginBottom: 8,
            ...(card.type === 'course' ? { background: '#1E2749', color: 'white' } :
              card.type === 'quick_win' ? { background: '#FEF9EE', color: '#92400E' } :
              card.type === 'game' ? { background: '#F0FDF4', color: '#166534' } :
              { background: '#EDE9FE', color: '#5B21B6' }),
          }}>
            {card.type === 'course' ? 'Course' :
              card.type === 'quick_win' ? 'Quick Win' :
              card.type === 'game' ? 'Game' :
              card.type === 'quiz_result' ? 'Your Result' : 'Quiz'}
          </span>
          <div style={{
            fontFamily: "'Source Serif 4', serif", fontWeight: 600,
            color: card.titleColor || '#1E2749',
            lineHeight: 1.3, marginBottom: 6,
            fontSize: titleSize,
          }}>
            {card.title}
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.4 }}>
            {card.description}
          </div>
        </div>
      </>
    );
  }

  // Carousel positions (5 visible cards)
  const carouselPositions = [
    { offset: -2, left: '2%',  w: 180, opacity: 0.35, scale: 0.75, z: 1 },
    { offset: -1, left: '15%', w: 220, opacity: 0.65, scale: 0.88, z: 2 },
    { offset:  0, left: '50%', w: 300, opacity: 1,    scale: 1,    z: 3, translateX: '-50%' },
    { offset:  1, left: '63%', w: 220, opacity: 0.65, scale: 0.88, z: 2 },
    { offset:  2, left: '82%', w: 180, opacity: 0.35, scale: 0.75, z: 1 },
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>

      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)', padding: '28px 0 32px' }}
      >
        {/* Decorative circle */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ right: '-50px', top: '-70px', width: 260, height: 260, background: 'rgba(255,186,6,0.06)' }}
        />

        <div className="relative z-10" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          {/* Top row: greeting left, stats right */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              {/* Role badge */}
              {profile?.role && (
                <div
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,186,6,0.15)',
                    border: '1px solid rgba(255,186,6,0.3)',
                    color: '#E8B84B',
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase' as const,
                    padding: '3px 10px',
                    borderRadius: 20,
                    marginBottom: 8,
                  }}
                >
                  {roleLabel}
                </div>
              )}
              <h1 style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 26, fontWeight: 700, color: 'white',
              }}>
                Welcome back, {firstName}
              </h1>
              <p style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: 'italic',
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                marginTop: 6,
                maxWidth: 420,
              }}>
                &ldquo;{tip}&rdquo;
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {enrollments.length}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginTop: 2 }}>
                  In Progress
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {personalStats?.toolsExplored || 0}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginTop: 2 }}>
                  Tools Used
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {communityPulse?.shared || currentStreak || 0}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginTop: 2 }}>
                  Check-ins
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {certificateCount}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginTop: 2 }}>
                  {certificateCount === 1 ? 'Certificate' : 'Certificates'}
                </div>
              </div>
            </div>
          </div>

          {/* Continue where you left off card */}
          {continueEnrollment && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 3 }}>
                  Continue where you left off
                </div>
                <div style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: 15, fontWeight: 600, color: 'white',
                }}>
                  {continueEnrollment.course?.title}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {continueEnrollment.lessons_completed} of {continueEnrollment.total_lessons} lessons completed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div style={{ flex: 1, maxWidth: 180, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: '#E8B84B',
                      width: `${continueEnrollment.progress_percentage || 0}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#E8B84B', fontWeight: 600 }}>
                    {continueEnrollment.progress_percentage || 0}%
                  </span>
                </div>
              </div>
              <Link
                href={`/hub/courses/${continueEnrollment.course?.slug}`}
                style={{
                  padding: '9px 22px',
                  background: '#E8B84B',
                  color: '#1E2749',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Continue
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============ INSIGHT CARDS (overlapping hero) ============ */}
      <div style={{
        maxWidth: 1100, margin: '-20px auto 0', padding: '0 32px',
        position: 'relative', zIndex: 2,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14,
      }}>
        {/* Goal card */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '18px 20px',
          border: '0.5px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 8, color: '#E8B84B' }}>
            Your Current Goal
          </div>
          {goalText ? (
            <>
              <div style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 15, fontWeight: 600, color: '#1E2749',
                lineHeight: 1.4, marginBottom: 10,
              }}>
                &ldquo;{goalText}&rdquo;
              </div>
              <Link
                href="/hub/settings/profile"
                style={{ fontSize: 12, color: '#E8B84B', fontWeight: 600, textDecoration: 'none' }}
              >
                Update my goals
              </Link>
            </>
          ) : (
            <>
              <div style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 15, fontWeight: 600, color: '#1E2749',
                lineHeight: 1.4, marginBottom: 10,
              }}>
                Set a goal to get personalized recommendations
              </div>
              <Link
                href="/hub/settings/profile"
                style={{ fontSize: 12, color: '#E8B84B', fontWeight: 600, textDecoration: 'none' }}
              >
                Set my goals
              </Link>
            </>
          )}
        </div>

        {/* Vibe card */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '18px 20px',
          border: '0.5px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 8, color: '#7C9CBF' }}>
            We've Noticed
          </div>
          <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, marginBottom: 10 }}>
            {vibeMessage}
          </div>
          <Link
            href="/hub/settings/profile"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10,
              border: '1.5px solid #E5E7EB', background: 'white',
              fontSize: 12, fontWeight: 600, color: '#4B5563',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
          >
            How are you feeling today?
          </Link>
        </div>

        {/* Recent win card */}
        <div style={{
          background: 'white', borderRadius: 14, padding: '18px 20px',
          border: '0.5px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 8, color: '#22C55E' }}>
            Recent Win
          </div>
          {recentWin ? (
            <>
              <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, marginBottom: 4 }}>
                You {recentWin.detail}{' '}
                <span style={{ fontWeight: 600, color: '#1E2749' }}>{recentWin.text}</span>.
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                {recentWin.date}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              Your first win is right around the corner. Start exploring to earn it.
            </div>
          )}
        </div>
      </div>

      {/* ============ CAROUSEL ============ */}
      {carouselCards.length > 0 && (
        <div style={{ padding: '32px 0 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', marginBottom: 20 }}>
            <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 600, color: '#1E2749' }}>
              Suggestions for You
            </span>
          </div>

          <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
            {/* Left arrow */}
            <button
              onClick={shiftLeft}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                left: 8, width: 40, height: 40, borderRadius: '50%',
                background: 'white', border: '1.5px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B7280', fontSize: 18,
                zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right arrow */}
            <button
              onClick={shiftRight}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                right: 8, width: 40, height: 40, borderRadius: '50%',
                background: 'white', border: '1.5px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6B7280', fontSize: 18,
                zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>

            {/* Carousel track */}
            <div style={{ position: 'relative', minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {carouselPositions.map((pos) => {
                if (carouselCards.length === 0) return null;
                const idx = (carouselIndex + pos.offset + carouselCards.length) % carouselCards.length;
                const card = carouselCards[idx];
                const sizeClass: 'center' | 'side' | 'far' = pos.offset === 0 ? 'center' : (Math.abs(pos.offset) === 1 ? 'side' : 'far');

                const handleCardClick = () => {
                  if (pos.offset < 0) shiftLeft();
                  else if (pos.offset > 0) shiftRight();
                  else router.push(card.href);
                };

                return (
                  <div
                    key={`${pos.offset}-${idx}`}
                    onClick={handleCardClick}
                    style={{
                      position: 'absolute',
                      width: pos.w,
                      left: pos.left,
                      opacity: pos.opacity,
                      transform: `${pos.translateX ? `translateX(${pos.translateX})` : ''} scale(${pos.scale})`,
                      zIndex: pos.z,
                      background: 'white',
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '0.5px solid rgba(0,0,0,0.06)',
                      boxShadow: pos.offset === 0 ? '0 8px 32px rgba(30,39,73,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {renderCarouselCardContent(card, sizeClass)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ BROWSE BY TOPIC ============ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 32px 48px' }}>
        <div style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 16, fontWeight: 600, color: '#1E2749',
          marginBottom: 12,
        }}>
          Browse by Topic
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {BROWSE_TOPICS.map(({ label, query }) => (
            <Link
              key={query}
              href={`/hub/quick-wins?search=${encodeURIComponent(query.replace(/-/g, ' '))}`}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                border: '1.5px solid #E5E7EB',
                color: '#4B5563',
                background: 'white',
                transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E8B84B'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ============ TOUR WELCOME OVERLAY ============ */}
      {tourChecked && !tourCompleted && !showTour && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, rgba(30,39,73,0.95) 0%, rgba(56,97,140,0.92) 100%)' }}
        >
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(255,186,6,0.15)' }}
            >
              <span style={{ fontSize: '28px', color: '#ffba06' }}>&#10024;</span>
            </div>
            <h2
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {tUI(tourResumeStep > 0 ? 'Ready to pick up where you left off?' : 'Welcome to the new Learning Hub')}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
              {tUI(tourResumeStep > 0
                ? `You made it through step ${tourResumeStep} of 10. Want to continue the tour from where you stopped?`
                : 'We built something new for you. A quick tour will show you the highlights. It takes about 60 seconds and you can skip anytime.'
              )}
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => setShowTour(true)}
                className="px-8 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                {tUI(tourResumeStep > 0 ? 'Continue the tour' : 'Show me around')}
              </button>
              <button
                onClick={() => {
                  setTourCompleted(true);
                  try { localStorage.removeItem('tdi-hub-tour-step'); } catch {}
                  // Persist skip to Supabase so the tour never reappears
                  if (user?.id) {
                    const supabase = getSupabase();
                    supabase.from('hub_activity_log').insert({
                      user_id: user.id,
                      action: 'tour_completed',
                      metadata: { stops_seen: 10, skipped: true },
                    }).then(() => {});
                  }
                }}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {tUI('Skip for now')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recognition Celebration */}
      {newRecognition && (
        <RecognitionCelebration
          recognition={newRecognition}
          onDismiss={() => {
            // Mark as seen
            if (user?.id) {
              fetch('/api/hub/recognitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, markSeen: [newRecognition.id] }),
              }).catch(() => {});
            }
            setNewRecognition(null);
          }}
        />
      )}

      {showTour && <OnboardingTour onComplete={handleTourComplete} resumeFromStep={tourResumeStep} />}
    </div>
  );
}
