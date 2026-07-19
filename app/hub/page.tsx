'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

export default function HubDashboard() {
  const router = useRouter();
  const { profile, user } = useHub();
  const { favorites, toggleFavorite } = useFavorites();
  const { tUI } = useTranslation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [featuredQuickWins, setFeaturedQuickWins] = useState<QuickWin[]>([]);
  const [tip, setTip] = useState<string>(FALLBACK_TIPS[0]);
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

        // Fetch ALL published quick wins for deterministic daily pick + role filtering
        const { data: allQuickWinData } = await supabase
          .from('hub_quick_wins')
          .select('id, slug, title, description, duration_minutes, category, thumbnail_url')
          .eq('is_published', true);

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

        // Check tracker eligibility + streak
        const [eligibility, learningStats] = await Promise.all([
          checkTrackerEligibility(user.id),
          getLearningStats(user.id),
        ]);
        setTrackerEligibility(eligibility);
        setCurrentStreak(learningStats.currentStreak);

        // Get recommendations if onboarding completed
        const onboardingDone = await hasCompletedOnboarding(user.id);
        if (onboardingDone) {
          const recs = await getRecommendations(user.id);
          if (recs.courses.length > 0) {
            setRecommendations(recs.courses);
            setShowRecommendations(true);
          }
        }

        // Fetch quiz results for dashboard recommendations
        const { data: quizRows } = await supabase
          .from('hub_quiz_results')
          .select('quiz_type, result_key')
          .eq('user_id', user.id);
        const qResults: Record<string, string> = {};
        const educatorType = (profile as unknown as Record<string, unknown>)?.educator_type as string | null;
        if (educatorType) qResults['educator_type'] = educatorType;
        if (quizRows) {
          for (const row of quizRows) qResults[row.quiz_type] = row.result_key;
        }
        setDashboardQuizResults(qResults);

        // Fetch "Educators like you" recommendations
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

        // Fetch certificate count
        const { count: certCount } = await supabase
          .from('hub_certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setCertificateCount(certCount || 0);

        // Check Field Notes (recognitions) + detect new ones
        try {
          const recResult = await checkRecognitions(user.id, supabase);
          setFieldNotesCount(recResult.earned.length);

          // Compare against persisted earned recognitions to find new ones
          const earnedRes = await fetch(`/api/hub/recognitions?userId=${user.id}`);
          const { earned: previouslyEarned } = await earnedRes.json();
          const previousTypes = new Set((previouslyEarned || []).map((e: { recognition_type: string }) => e.recognition_type));
          const currentEarnedTypes = recResult.earned.map(e => e.recognition.id);
          const brandNew = currentEarnedTypes.filter((t: string) => !previousTypes.has(t));

          if (brandNew.length > 0) {
            // Persist all newly earned recognitions
            await fetch('/api/hub/recognitions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, newRecognitions: brandNew }),
            });

            // Show celebration for the first new one
            const celebrateRec = RECOGNITIONS.find(r => r.id === brandNew[0]);
            if (celebrateRec) {
              setNewRecognition(celebrateRec);
            }
          } else if (previouslyEarned.length === 0 && currentEarnedTypes.length > 0) {
            // First time -- persist all existing earned (backfill)
            await fetch('/api/hub/recognitions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, newRecognitions: currentEarnedTypes }),
            });
          }
        } catch {
          // Silent fail -- recognition check is non-critical
        }

        // --- New dashboard enrichment queries (Features 1, 2, 5, 6) ---
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
        <div
          className="animate-pulse"
          style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20" />
              <div>
                <div className="h-8 bg-white/20 rounded w-64 mb-2" />
                <div className="h-5 bg-white/10 rounded w-48" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid rgba(27,42,74,0.06)' }}>
                <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
                <div className="h-24 bg-gray-100 rounded" />
              </div>
              <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid rgba(27,42,74,0.06)' }}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl h-36 animate-pulse" style={{ background: '#1B2A4A' }} />
              <div className="bg-white rounded-2xl h-28 animate-pulse" style={{ border: '1px solid rgba(27,42,74,0.06)' }} />
              <div className="bg-white rounded-2xl h-40 animate-pulse" style={{ border: '1px solid rgba(27,42,74,0.06)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh' }}>
      {/* ============ HERO ============ */}
      <section
        className="relative text-white"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
      >
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '-50px', top: '-70px', width: '260px', height: '260px', background: 'rgba(255,186,6,0.07)' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '50px', bottom: '-90px', width: '180px', height: '180px', background: 'rgba(56,97,140,0.5)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-10">
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

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-2">
            <AvatarDisplay
              size={48}
              avatarId={profile?.avatar_id}
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
            />
            <div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ letterSpacing: '-0.3px', fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Welcome back, {firstName}
              </h1>
              {/* Gold accent line */}
              <div
                style={{ width: '60px', height: '2px', background: 'rgba(255,186,6,0.4)', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Daily message -- italic, Source Serif */}
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '15px',
              marginTop: '8px',
            }}
          >
            {dailyMessage}
          </p>
        </div>
      </section>

      {/* ============ STATUS BAR ============ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="text-center">
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '28px', fontWeight: 700, color: '#1B2A4A' }}>
              {personalStats?.toolsExplored || 0}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              {tUI('tools explored')}
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '28px', fontWeight: 700, color: '#1B2A4A' }}>
              ~{personalStats?.hoursSaved || 0}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              {tUI('hours reclaimed')}
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '28px', fontWeight: 700, color: '#1B2A4A' }}>
              {certificateCount + fieldNotesCount}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              {tUI('achievements earned')}
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '28px', fontWeight: 700, color: '#1B2A4A' }}>
              50
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              {tUI('states represented')}
            </div>
          </div>
        </div>
      </div>

      {/* Tour welcome overlay */}
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
                : 'We built something new for you. A quick tour will show you the highlights -- it takes about 60 seconds and you can skip anytime.'
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

      {/* ============ MAIN GRID ============ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-8">

          {/* A. Goal + Next Step (or Today's Pick for new users) */}
          {(userGoal || featuredQuickWin) && (
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
            >
              {/* Gold left border accent */}
              <div className="flex">
                <div style={{ width: '4px', background: '#FFBA06', flexShrink: 0 }} />
                <div className="flex-1 p-6">
                  {userGoal ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Target size={14} style={{ color: '#D97706' }} />
                        <span className="text-xs font-semibold" style={{ color: '#D97706' }}>
                          {tUI('Your goal')}
                        </span>
                      </div>
                      <p
                        className="mb-4"
                        style={{
                          fontFamily: "'Source Serif 4', Georgia, serif",
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#1B2A4A',
                          lineHeight: 1.5,
                        }}
                      >
                        {tUI('You said you wanted to')} &ldquo;{userGoal.text}&rdquo;
                      </p>
                      {(userGoal.quickWin || featuredQuickWin) && (() => {
                        const qw = userGoal.quickWin || featuredQuickWin!;
                        const categoryBg = CATEGORY_COLORS[qw.category] || '#F3F4F6';
                        const accentColor = CATEGORY_ACCENTS[qw.category] || '#7C9CBF';
                        return (
                          <div
                            className="rounded-xl overflow-hidden flex"
                            style={{ border: '1px solid #E9E7E2' }}
                          >
                            {/* Thumbnail or gradient block */}
                            <div className="w-24 flex-shrink-0 relative" style={{
                              background: qw.thumbnail_url ? undefined : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                            }}>
                              {qw.thumbnail_url ? (
                                <img src={qw.thumbnail_url} alt={qw.title || 'Quick win thumbnail'} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen size={24} style={{ color: 'rgba(255,255,255,0.6)' }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4" style={{ background: '#FAFAF8' }}>
                              <div className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>
                                {tUI('Your next step')}
                              </div>
                              <span
                                className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1.5"
                                style={{ background: categoryBg, color: '#1e2749', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                              >
                                {qw.category}
                              </span>
                              <div className="text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>{qw.title}</div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs" style={{ color: '#9CA3AF' }}>{qw.duration_minutes} min</span>
                                <Link
                                  href={`/hub/quick-wins/${qw.slug}`}
                                  className="flex-shrink-0 text-xs font-semibold rounded-lg px-4 py-1.5 whitespace-nowrap"
                                  style={{ background: '#FFBA06', color: '#1e2749' }}
                                >
                                  {tUI('Try it')}
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : featuredQuickWin && (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={14} style={{ color: '#D97706' }} />
                        <span className="text-xs font-semibold" style={{ color: '#D97706' }}>
                          {profile?.role
                            ? tUI(`Picked for ${roleLabel.toLowerCase()}s`)
                            : tUI("Today's pick for you")}
                        </span>
                      </div>
                      <span
                        className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-2"
                        style={{ background: CATEGORY_COLORS[featuredQuickWin.category] || '#F3F4F6', color: '#1e2749', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        {featuredQuickWin.category}
                      </span>
                      <div
                        className="text-lg font-semibold mb-1"
                        style={{ color: '#1e2749', fontFamily: "'Source Serif 4', serif" }}
                      >
                        {featuredQuickWin.title}
                      </div>
                      {featuredQuickWin.description && (
                        <p className="text-sm mb-3" style={{ color: '#6B7280', lineHeight: '1.5' }}>
                          {featuredQuickWin.description.slice(0, 120)}{featuredQuickWin.description.length > 120 ? '...' : ''}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/hub/quick-wins/${featuredQuickWin.slug}`}
                          className="text-sm font-semibold rounded-lg px-5 py-2 whitespace-nowrap"
                          style={{ background: '#FFBA06', color: '#1e2749' }}
                        >
                          {tUI('Try it')}
                        </Link>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          {featuredQuickWin.duration_minutes} min
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TDI Tip (navy accent) */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#1B2A4A', borderTop: '2px solid #E8B84B' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#E8B84B', letterSpacing: '0.1em' }}>
              {tUI('TDI Tip')}
            </div>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
              &ldquo;{tip}&rdquo;
            </p>
          </div>

          {/* B. Continue Learning (max 2 enrollments) */}
          {enrollments.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
                {tUI('Pick up where you left off')}
              </div>
              <div
                className="bg-white rounded-2xl"
                style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
              >
                <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
                  {enrollments.slice(0, 2).map((enrollment, index) => {
                    const iconColors = ['#E0F4FF', '#E8F5E9', '#FEF3C7'];
                    const iconBg = iconColors[index % iconColors.length];
                    const pct = enrollment.progress_percentage || 0;
                    return (
                      <div key={enrollment.id} className="p-5 flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: iconBg }}
                        >
                          <BookOpen size={20} style={{ color: '#1B2A4A' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold" style={{ color: '#1B2A4A', fontSize: '15px' }}>
                            {enrollment.course?.title}
                          </div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>
                            {enrollment.lessons_completed} of {enrollment.total_lessons} lessons
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 75
                                    ? 'linear-gradient(90deg, #FFBA06, #F59E0B)'
                                    : '#FFBA06',
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold" style={{ color: pct >= 75 ? '#D97706' : '#9CA3AF', minWidth: '32px', textAlign: 'right' }}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/hub/courses/${enrollment.course?.slug}`}
                          className="ml-2 flex-shrink-0 text-xs font-semibold text-white rounded-lg px-4 py-2 whitespace-nowrap"
                          style={{ background: '#1B2A4A' }}
                        >
                          {tUI('Resume')}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Link
                href="/hub/courses"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline mt-3"
                style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}
              >
                {tUI('View all courses')}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* New user: Browse buttons (only when no enrollments, no goal) */}
          {enrollments.length === 0 && !userGoal && (
            <div className="flex gap-3">
              <Link
                href="/hub/courses"
                className="flex-1 text-center text-sm font-semibold rounded-xl px-4 py-3"
                style={{ background: '#1B2A4A', color: 'white' }}
              >
                {tUI('Browse Courses')}
              </Link>
              <Link
                href="/hub/quick-wins"
                className="flex-1 text-center text-sm font-semibold rounded-xl px-4 py-3"
                style={{ background: 'white', color: '#1B2A4A', border: '1px solid rgba(27,42,74,0.12)' }}
              >
                {tUI('Explore Quick Wins')}
              </Link>
            </div>
          )}

          {/* Curated for You moved to sidebar */}

          {/* Saved (moved from sidebar) */}
          <div
            data-tour="favorites"
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
              {tUI('Saved')}
            </div>
            {savedCourses.length > 0 ? (
              <>
                <div className="space-y-2">
                  {savedCourses.slice(0, 3).map(item => {
                    const isQW = 'type' in item && (item as any).type === 'quick_win';
                    const href = isQW ? `/hub/quick-wins/${item.slug}` : `/hub/courses/${item.slug}`;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(href)}
                      >
                        <Heart size={12} style={{ color: '#E53935', fill: '#E53935', flexShrink: 0 }} />
                        <span className="text-sm font-medium flex-1" style={{ color: '#1B2A4A' }}>{item.title}</span>
                        {isQW && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '9px' }}>
                            {tUI('Tool')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {savedCourses.length > 3 && (
                  <Link href="/hub/courses?filter=Saved" className="text-xs font-semibold mt-2 inline-block" style={{ color: '#38618C' }}>
                    {tUI('View all')} {savedCourses.length} {tUI('saved')} →
                  </Link>
                )}
              </>
            ) : (
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {tUI('Heart any course or quick win to save it here.')}
              </p>
            )}

            {/* Community bookmarks */}
            <CommunityBookmarks userId={user?.id} tUI={tUI} />
          </div>

          {/* Hub Pioneer card removed -- tour-specific */}
          {false && fieldNotesCount > 0 && (
            <div
              data-tour="field-notes"
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 100%)', boxShadow: '0 4px 20px rgba(27,42,74,0.15)' }}
            >
              <div className="p-6 flex items-center gap-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,186,6,0.15)' }}
                >
                  <Award size={28} style={{ color: '#FFBA06' }} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#FFBA06', letterSpacing: '0.08em' }}>
                    {tUI('Your first Field Note')}
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {tUI('Hub Pioneer')}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {tUI('You are one of the first educators to explore this space. That says everything about who you are.')}
                  </p>
                </div>
                <Link
                  href="/hub/certificates"
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg"
                  style={{ background: '#FFBA06', color: '#1B2A4A' }}
                >
                  {tUI('View all')}
                </Link>
              </div>
            </div>
          )}

          {/* Know Yourself -- quiz recommendations */}
          {(() => {
            const untaken = ALL_QUIZZES.filter(q => !dashboardQuizResults[q.id]);
            const taken = ALL_QUIZZES.filter(q => dashboardQuizResults[q.id]);
            if (untaken.length === 0 && taken.length === 0) return null;
            const showUntaken = untaken.slice(0, 2);
            const showTaken = taken.slice(0, 1);
            return (
              <div
                className="bg-white rounded-2xl p-5"
                style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
              >
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                  {tUI('Know Yourself')}
                </div>
                <div className="space-y-2.5">
                  {showTaken.map(quiz => (
                    <QuizResultBadge key={quiz.id} quiz={quiz} resultKey={dashboardQuizResults[quiz.id]} compact />
                  ))}
                  {showUntaken.map(quiz => (
                    <Link
                      key={quiz.id}
                      href="/hub/settings/profile?tab=educator_profile"
                      className="block rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                      style={{ border: '1px solid #E9E7E2' }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-12 flex-shrink-0 flex items-center justify-center self-stretch"
                          style={{ background: quiz.accentGradient }}
                        >
                          <span className="text-sm font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>?</span>
                        </div>
                        <div className="flex-1 min-w-0 p-3">
                          <div className="text-sm font-medium" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
                            {quiz.title}
                          </div>
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>
                            {quiz.questionCount} {tUI('questions')} &middot; {quiz.durationLabel}
                          </div>
                        </div>
                        <ArrowRight size={14} className="mr-3" style={{ color: quiz.accentColor }} />
                      </div>
                    </Link>
                  ))}
                  {(untaken.length > 2 || taken.length > 1) && (
                    <Link
                      href="/hub/settings/profile?tab=educator_profile"
                      className="block text-center text-xs font-medium py-2 transition-colors hover:text-gray-700"
                      style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {tUI('See all quizzes')} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })()}

          {/* AI Growth Insight */}
          {(aiInsight || aiInsightLoading) && (
            <div
              className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #263554 100%)', borderLeft: '3px solid #E8B84B' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B84B', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#E8B84B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  AI Growth Insight
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                {aiInsightLoading ? 'Generating your personalized insight...' : (
                  aiInsight && !aiInsightExpanded && aiInsight.length > 150
                    ? aiInsight.slice(0, 150).trim() + '...'
                    : aiInsight
                )}
              </p>
              {aiInsight && aiInsight.length > 150 && (
                <button
                  onClick={() => setAiInsightExpanded(!aiInsightExpanded)}
                  className="mt-2 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif", background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {aiInsightExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
            </div>
          )}

          {/* Community Bookmarks */}
          <CommunityBookmarks userId={user?.id} tUI={tUI} />

        </div>

        {/* ===== RIGHT COLUMN (SIDEBAR) ===== */}
        <div className="space-y-4">
          {/* Gift Element -- deferred to post-launch for polish */}

          {/* TDI Tip removed -- low signal for dashboard */}
          {false && <div
            className="rounded-2xl p-6"
            style={{ background: '#1B2A4A', borderTop: '2px solid #FFBA06' }}
          >
            <div
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: '#FFBA06', letterSpacing: '0.1em' }}
            >
              {tUI('TDI Tip')}
            </div>
            <p
              className="leading-relaxed mb-4"
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: 1.7,
              }}
            >
              &ldquo;{tip}&rdquo;
            </p>
            <button
              onClick={() => setShowCelebrateModal(true)}
              className="flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2 transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,186,6,0.15)', color: '#FFBA06', border: '1px solid rgba(255,186,6,0.3)' }}
            >
              <Share2 size={12} />
              {tUI('Share your wins')}
            </button>
          </div>}

          {/* 3. Your Progress -- merged Achievements + Streak + Tracker */}
          <div
            data-tour="transformation-tracker"
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid rgba(27,42,74,0.08)' }}
          >
            {/* Streak */}
            {currentStreak >= 2 && (
              <>
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FFF8E7' }}
                  >
                    <span style={{ fontSize: '20px' }}>&#9679;</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{currentStreak} {tUI('days')}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{tUI('Learning streak')}</div>
                  </div>
                </div>
                <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
                  {currentStreak >= 7
                    ? tUI("You've shown up consistently. That's what growth looks like.")
                    : tUI("You're building momentum. Keep it going.")}
                </p>
                <div style={{ borderTop: '1px solid #F3F4F6', marginBottom: '16px' }} />
              </>
            )}

            {/* Achievements section */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FEF3C7' }}
              >
                <Award size={20} style={{ color: '#D97706' }} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{certificateCount + fieldNotesCount}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{tUI('Achievements earned')}</div>
              </div>
              <Link href="/hub/certificates" className="text-xs font-semibold" style={{ color: '#38618C' }}>
                {tUI('View all')} →
              </Link>
            </div>
            {(certificateCount > 0 || fieldNotesCount > 0) && (
              <div className="flex gap-4 text-xs mb-4" style={{ color: '#6B7280' }}>
                {certificateCount > 0 && <span>{certificateCount} {tUI('Certificates')}</span>}
                {fieldNotesCount > 0 && <span>{fieldNotesCount} {tUI('Field Notes')}</span>}
              </div>
            )}

            {/* Tracker progress */}
            {trackerEligibility && (
              <>
                <div style={{ borderTop: '1px solid #F3F4F6', marginBottom: '16px' }} />
                {trackerEligibility.isEligible ? (
                  <Link
                    href="/hub/transformation"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FFF8E7' }}
                    >
                      <TrendingUp size={16} style={{ color: '#FFBA06' }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{tUI('Growth Dashboard')}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{tUI('View your progress')}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#38618C' }} />
                  </Link>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold" style={{ color: '#1B2A4A' }}>{tUI('Growth Dashboard')}</div>
                      <div
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px' }}
                      >
                        {tUI('Locked')}
                      </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                      {tUI('Complete 1 course and 2 check-ins to unlock.')}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="text-xs w-14 flex-shrink-0" style={{ color: '#6B7280' }}>{tUI('Courses')}</div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, (trackerEligibility.completedCourses / trackerEligibility.requiredCourses) * 100)}%`, background: '#FFBA06' }}
                          />
                        </div>
                        <div className="text-xs font-semibold w-7 text-right" style={{ color: '#1B2A4A' }}>
                          {trackerEligibility.completedCourses}/{trackerEligibility.requiredCourses}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="text-xs w-14 flex-shrink-0" style={{ color: '#6B7280' }}>{tUI('Check-ins')}</div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                          <div
                            className="h-full rounded-full"
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
              </>
            )}
          </div>

          {/* Curated for You */}
          {showRecommendations && recommendations.length > 0 && (
            <div
              className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid rgba(27,42,74,0.08)' }}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                {tUI('Curated for you')}
              </div>
              <div className="space-y-2.5">
                {recommendations.slice(0, 1).map((course) => {
                  const catAccent = CATEGORY_ACCENTS[course.category] || '#38618C';
                  return (
                    <Link
                      key={course.id}
                      href={`/hub/courses/${course.slug}`}
                      className="rounded-xl overflow-hidden flex hover:shadow-sm transition-shadow block"
                      style={{ border: '1px solid #E9E7E2' }}
                    >
                      <div className="w-16 flex-shrink-0" style={{
                        background: course.thumbnail_url ? undefined : `linear-gradient(135deg, ${catAccent} 0%, ${catAccent}99 100%)`,
                      }}>
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title || 'Course thumbnail'} className="w-full h-full object-cover" style={{ objectPosition: 'top' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center min-h-[60px]">
                            <BookOpen size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3">
                        <div className="text-sm font-semibold leading-snug mb-0.5" style={{ color: '#1B2A4A' }}>{course.title}</div>
                        <div className="text-xs" style={{ color: '#9CA3AF' }}>{course.reason || tUI('Popular with educators')}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Educators Like You */}
          {likeYouRecs.length > 0 && likeYouType && (
            <div
              className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid rgba(27,42,74,0.08)' }}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                {tUI('Educators like you')}
              </div>
              <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                {tUI('Popular with')} {likeYouCohortSize} {tUI('other')} {likeYouType}s
              </p>
              <div className="space-y-2.5">
                {likeYouRecs.map(qw => (
                  <Link
                    key={qw.id}
                    href={`/hub/quick-wins/${qw.slug}`}
                    className="block bg-white rounded-xl p-3 hover:shadow-sm transition-shadow"
                    style={{ border: '1px solid #E9E7E2' }}
                  >
                    <div className="text-sm font-medium" style={{ color: '#1B2A4A' }}>{qw.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{qw.category}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. Quick Wins Explorer */}
          {quickWins.length > 0 && (
            <div
              data-tour="quick-wins"
              className="rounded-2xl p-5"
              style={{ background: '#FAFAF8', border: '1px solid rgba(27,42,74,0.08)' }}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
                {tUI('Quick Wins')}
              </div>
              <div className="space-y-2.5">
                {quickWins.map((qw) => {
                  const categoryBg = CATEGORY_COLORS[qw.category] || '#F3F4F6';
                  const accentColor = CATEGORY_ACCENTS[qw.category] || '#7C9CBF';
                  return (
                    <Link
                      key={qw.id}
                      href={`/hub/quick-wins/${qw.slug}`}
                      className="block bg-white rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                      style={{ border: '1px solid #E9E7E2' }}
                    >
                      {/* Thumbnail strip or gradient */}
                      {qw.thumbnail_url ? (
                        <div className="w-full h-20 overflow-hidden">
                          <img src={qw.thumbnail_url} alt={qw.title || 'Quick win thumbnail'} className="w-full h-full object-cover" style={{ objectPosition: 'top' }} />
                        </div>
                      ) : (
                        <div className="w-full h-2.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
                      )}
                      <div className="p-3.5">
                        <span
                          className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1.5"
                          style={{ background: categoryBg, color: '#1e2749', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                          {qw.category}
                        </span>
                        <div className="text-sm font-semibold leading-snug" style={{ color: '#1B2A4A' }}>
                          {qw.title}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{qw.duration_minutes} min</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/hub/quick-wins"
                className="inline-flex items-center gap-1.5 text-xs font-semibold mt-3 hover:underline"
                style={{ color: '#38618C' }}
              >
                {tUI('Explore all Quick Wins')}
                <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* 5. Practice Games */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="p-5">
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#E8B84B', letterSpacing: '0.08em' }}>
                {tUI('Practice Games')}
              </div>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {tUI('Sharpen your classroom skills with interactive games. Play solo or with your team.')}
              </p>
              <div className="space-y-2">
                {[
                  { slug: 'tell-or-ask', title: 'Tell or Ask?', time: '10 min', color: '#F1C40F' },
                  { slug: 'feedback-level-up', title: 'Feedback Level Up', time: '12 min', color: '#27AE60' },
                  { slug: 'whats-your-move', title: "What's Your Move?", time: '10 min', color: '#22b8bd' },
                ].map((game) => (
                  <Link
                    key={game.slug}
                    href={`/hub/quick-wins/${game.slug}`}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: game.color }} />
                    <span className="text-sm font-medium text-white flex-1">{game.title}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{game.time}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/hub/quick-wins?filter=Games"
                className="inline-flex items-center gap-1.5 text-xs font-semibold mt-3 hover:underline"
                style={{ color: '#E8B84B' }}
              >
                {tUI('All 9 games')}
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* LIFT + Vibe Check moved to tour card and Profile settings */}
        </div>
      </div>
    </div>

    {/* Vibe Check moved to Profile settings */}
    {false && (
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
      <div
        data-tour="vibe-check"
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(27,42,74,0.08)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
      >
        <div className="md:flex">
          {/* Left: header + description */}
          <div className="md:w-2/5 px-6 py-6" style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FAFAF8 100%)' }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D97706', letterSpacing: '0.08em' }}>
              {tUI('Vibe Check')}
            </div>
            <p className="text-sm mb-4" style={{ color: '#4B5563', lineHeight: 1.6 }}>
              {tUI('Quick prompts that pop up randomly while you explore. Our team sends them because we genuinely care how you are doing. They are always easy to answer and completely private.')}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Mood', color: '#DC2626', bg: '#FEE2E2' },
                { label: 'Energy', color: '#D97706', bg: '#FEF3C7' },
                { label: 'Belonging', color: '#7C3AED', bg: '#F3E8FF' },
                { label: 'Purpose', color: '#0891B2', bg: '#E0F4FF' },
                { label: 'Needs', color: '#16A34A', bg: '#D1FAE5' },
              ].map((dim) => (
                <div
                  key={dim.label}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: dim.bg }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
                  <span className="text-xs font-medium" style={{ color: dim.color }}>{tUI(dim.label)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: sample questions */}
          <div className="md:w-3/5 bg-white px-6 py-6 flex flex-col justify-center" style={{ borderLeft: '1px solid #F3F4F6' }}>
            <div className="space-y-2.5">
              {[
                'How are you feeling right now?',
                'Do you have the energy to finish the day strong?',
                'How connected do you feel to your school community?',
              ].map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg px-4 py-3"
                  style={{ background: '#FAFAF8', border: '1px solid #F3F4F6' }}
                >
                  <span className="text-sm" style={{ color: '#4B5563', fontStyle: 'italic' }}>
                    &ldquo;{tUI(q)}&rdquo;
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/hub/settings/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold mt-3"
              style={{ color: '#D97706' }}
            >
              {tUI('View your history')}
              <ArrowRight size={12} />
            </Link>
          </div>
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

                  {/* Email options */}
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                    {tUI('Email it')}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <a href={`mailto:?subject=${encodeURIComponent('My teacher win today')}&body=${encodedMessage}`}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px' }}>@</span>{tUI('Default')}
                    </a>
                    <a href={`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('My teacher win today')}&body=${encodedMessage}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#EA4335' }}>G</span>{tUI('Gmail')}
                    </a>
                    <a href={`https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent('My teacher win today')}&body=${encodedMessage}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#0078D4' }}>O</span>{tUI('Outlook')}
                    </a>
                  </div>

                  {/* Share options */}
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                    {tUI('Share it')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href={`sms:?&body=${encodedMessage}`}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#34C759' }}>+</span>{tUI('Text')}
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#1877F2' }}>f</span>{tUI('Facebook')}
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px' }}>X</span>{tUI('Twitter')}
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://teachersdeserveit.com')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#0A66C2' }}>in</span>{tUI('LinkedIn')}
                    </a>
                    <a href={`https://wa.me/?text=${encodedMessage}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px', color: '#25D366' }}>W</span>{tUI('WhatsApp')}
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText('https://teachersdeserveit.com'); }}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                      <span style={{ fontSize: '20px' }}>~</span>{tUI('Link')}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}
    {showTour && <OnboardingTour onComplete={handleTourComplete} resumeFromStep={tourResumeStep} />}
    </div>
  );
}
