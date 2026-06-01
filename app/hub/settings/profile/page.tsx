'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import AvatarPicker from '@/components/hub/AvatarPicker';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { signOut, updateHubProfile } from '@/lib/hub-auth';
import {
  User,
  Bell,
  LogOut,
  Trash2,
  Check,
  Smile,
  Clock,
  MonitorSpeaker,
  Sun,
  TrendingUp,
  Users,
  Home,
  Heart,
  Calendar,
  MessageCircle,
  Lightbulb,
  Compass,
  CheckCheck,
  Target,
  BarChart3,
  BookOpen,
  Award,
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Coffee,
  Share2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  checkRecognitions,
  type RecognitionResult,
} from '@/lib/hub/recognitions';

// ── Types ──────────────────────────────────────────────────────────────

type Role =
  | 'classroom_teacher'
  | 'para'
  | 'coach'
  | 'school_leader'
  | 'district_staff'
  | 'other';
type GoalType =
  | 'reduce_stress'
  | 'save_time'
  | 'classroom_management'
  | 'find_joy'
  | 'team_growth'
  | 'role_support'
  | 'stop_bringing_work_home'
  | 'feel_like_myself'
  | 'make_it_to_summer'
  | 'better_parent_communication'
  | 'fresh_ideas'
  | 'figure_out_whats_next'
  | 'all_of_the_above';

type GrowthTab =
  | 'profile'
  | 'growth'
  | 'vibe_check'
  | 'library'
  | 'wellbeing';

interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, string> | null;
  created_at: string;
}

interface FavoriteEntry {
  id: string;
  content_type: 'course' | 'quick_win';
  content_id: string;
  created_at: string;
  title?: string;
  category?: string;
}

interface CheckInEntry {
  id: string;
  score: number;
  responses: Record<string, string> | null;
  created_at: string;
}

interface StatsData {
  toolsExplored: number;
  hoursSaved: string;
  communityContributions: number;
  daysActive: number;
  recentActivity: ActivityEntry[];
}

// ── Constants ──────────────────────────────────────────────────────────

const ROLES: { value: Role; label: string; subtitle: string }[] = [
  { value: 'classroom_teacher', label: 'Classroom Teacher', subtitle: 'Any grade, any subject' },
  { value: 'para', label: 'Paraprofessional', subtitle: 'Support staff, aides' },
  { value: 'coach', label: 'Instructional Coach', subtitle: 'PD lead, mentor' },
  { value: 'school_leader', label: 'School Leader', subtitle: 'Admin, principal, AP' },
  { value: 'district_staff', label: 'District Staff', subtitle: 'Central office, curriculum' },
  { value: 'other', label: 'Something Else', subtitle: 'Unique role' },
];

const GoalIconMap: Record<GoalType, React.ReactNode> = {
  reduce_stress: <Smile size={20} strokeWidth={1.5} />,
  save_time: <Clock size={20} strokeWidth={1.5} />,
  classroom_management: <MonitorSpeaker size={20} strokeWidth={1.5} />,
  find_joy: <Sun size={20} strokeWidth={1.5} />,
  team_growth: <TrendingUp size={20} strokeWidth={1.5} />,
  role_support: <Users size={20} strokeWidth={1.5} />,
  stop_bringing_work_home: <Home size={20} strokeWidth={1.5} />,
  feel_like_myself: <Heart size={20} strokeWidth={1.5} />,
  make_it_to_summer: <Calendar size={20} strokeWidth={1.5} />,
  better_parent_communication: <MessageCircle size={20} strokeWidth={1.5} />,
  fresh_ideas: <Lightbulb size={20} strokeWidth={1.5} />,
  figure_out_whats_next: <Compass size={20} strokeWidth={1.5} />,
  all_of_the_above: <CheckCheck size={20} strokeWidth={1.5} />,
};

const GRID_GOALS: { value: GoalType; label: string }[] = [
  { value: 'reduce_stress', label: 'Manage my stress' },
  { value: 'save_time', label: 'Get my time back' },
  { value: 'classroom_management', label: 'Classroom management' },
  { value: 'find_joy', label: 'Find the joy again' },
  { value: 'team_growth', label: 'Grow as a leader' },
  { value: 'role_support', label: 'Support my team' },
  { value: 'stop_bringing_work_home', label: 'Stop bringing work home' },
  { value: 'feel_like_myself', label: 'Feel like myself again' },
  { value: 'make_it_to_summer', label: 'Make it to summer' },
  { value: 'better_parent_communication', label: 'Better parent convos' },
  { value: 'fresh_ideas', label: 'Fresh ideas' },
  { value: 'figure_out_whats_next', label: 'Figure out what is next' },
];

const ALL_INDIVIDUAL_GOALS: GoalType[] = GRID_GOALS.map((g) => g.value);

const GOAL_QUICK_WIN_MAP: Record<string, string[]> = {
  reduce_stress: ['Breathing exercise', '2-minute reset', 'Stress journal prompt'],
  save_time: ['Template pack', 'Batch grading tips', 'Auto-response email'],
  classroom_management: ['Morning meeting script', 'Transition timer', 'Calm corner guide'],
  find_joy: ['Gratitude prompt', 'Joy list builder', 'Celebration tracker'],
  team_growth: ['Team check-in template', 'Feedback framework', 'Meeting agenda tool'],
  role_support: ['Role clarity worksheet', 'Boundary builder', 'Communication guide'],
  stop_bringing_work_home: ['End-of-day checklist', 'Priority matrix', 'Time boundary plan'],
  feel_like_myself: ['Identity reflection', 'Values check-in', 'Self-care planner'],
  make_it_to_summer: ['Countdown tracker', 'Weekly wins log', 'Survival mode toolkit'],
  better_parent_communication: ['Email templates', 'Conference prep sheet', 'Positive note generator'],
  fresh_ideas: ['Inspiration board', 'Lesson remix guide', 'Cross-curricular spark'],
  figure_out_whats_next: ['Career reflection', 'Skills inventory', 'Goal mapping worksheet'],
};

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Heart,
  Coffee,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  Star: Award,
};

const TAB_CONFIG: { id: GrowthTab; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'growth', label: 'My Growth', icon: BarChart3 },
  { id: 'vibe_check', label: 'Vibe Check', icon: Heart },
];

// ── Helpers ────────────────────────────────────────────────────────────

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Sparkles;
}

function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    quick_win_viewed: 'Explored a tool',
    quick_win_saved: 'Saved a tool',
    moment_mode_completed: 'Completed a Moment Mode session',
    share_used: 'Shared a resource',
    course_started: 'Started a course',
    course_completed: 'Completed a course',
    daily_check_in: 'Did a Vibe Check',
    page_view: 'Visited a page',
  };
  return map[action] || action.replace(/_/g, ' ');
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Component ──────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { profile, user } = useHub();
  const { tUI } = useTranslation();

  // Active tab
  const [activeTab, setActiveTab] = useState<GrowthTab>('profile');

  // Profile state
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Data for other tabs
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [recognitionData, setRecognitionData] = useState<RecognitionResult | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // AI Insights
  const [growthInsight, setGrowthInsight] = useState<string | null>(null);
  const [vibeInsight, setVibeInsight] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ── Initialize profile state ─────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedRole(profile.role as Role | null);
      setSelectedAvatarId(profile.avatar_id);
      setUploadedAvatarUrl(profile.avatar_url);

      const onboardingData = profile.onboarding_data as { goals?: GoalType[] } | null;
      if (onboardingData?.goals) {
        setSelectedGoals(onboardingData.goals);
      }
    }
  }, [profile]);

  // ── Load data for all tabs ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || dataLoaded) return;

    const loadData = async () => {
      const supabase = getSupabase();

      const [
        activityResult,
        recentResult,
        responsesResult,
        checkInResult,
        favoritesResult,
        recognitionResult,
      ] = await Promise.all([
        // All activity for stats
        supabase
          .from('hub_activity_log')
          .select('action, created_at')
          .eq('user_id', user.id),
        // Recent activity (last 5)
        supabase
          .from('hub_activity_log')
          .select('id, action, metadata, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        // Community contributions
        supabase
          .from('quick_win_responses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        // Vibe Check history (from activity log)
        supabase
          .from('hub_activity_log')
          .select('id, metadata, created_at')
          .eq('user_id', user.id)
          .eq('action', 'wellbeing_check')
          .order('created_at', { ascending: false })
          .limit(30),
        // Favorites with content info
        supabase
          .from('hub_favorites')
          .select('id, content_type, content_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        // Recognitions
        checkRecognitions(user.id, supabase),
      ]);

      // Process stats
      const allActivity = activityResult.data || [];
      const toolsExplored = allActivity.filter(
        (a: { action: string }) => a.action === 'quick_win_viewed'
      ).length;
      const uniqueDays = new Set(
        allActivity.map((a: { created_at: string }) =>
          new Date(a.created_at).toISOString().split('T')[0]
        )
      );

      setStatsData({
        toolsExplored,
        hoursSaved: ((toolsExplored * 5) / 60).toFixed(1),
        communityContributions: responsesResult.count || 0,
        daysActive: uniqueDays.size,
        recentActivity: (recentResult.data || []) as ActivityEntry[],
      });

      // Map activity log entries to CheckInEntry format
      const rawCheckIns = (checkInResult.data || []) as { id: string; metadata: Record<string, unknown> | null; created_at: string }[];
      setCheckIns(rawCheckIns.map(entry => ({
        id: entry.id,
        score: (entry.metadata?.score as number) || (entry.metadata?.value as number) || 3,
        responses: (entry.metadata as Record<string, string>) || null,
        created_at: entry.created_at,
      })));

      // Enrich favorites with titles
      const rawFavorites = (favoritesResult.data || []) as FavoriteEntry[];
      if (rawFavorites.length > 0) {
        const qwIds = rawFavorites
          .filter((f) => f.content_type === 'quick_win')
          .map((f) => f.content_id);
        const courseIds = rawFavorites
          .filter((f) => f.content_type === 'course')
          .map((f) => f.content_id);

        const [qwResult, courseResult] = await Promise.all([
          qwIds.length > 0
            ? supabase
                .from('hub_quick_wins')
                .select('id, title, category')
                .in('id', qwIds)
            : Promise.resolve({ data: [] }),
          courseIds.length > 0
            ? supabase
                .from('hub_courses')
                .select('id, title, category')
                .in('id', courseIds)
            : Promise.resolve({ data: [] }),
        ]);

        const titleMap: Record<string, { title: string; category: string }> = {};
        for (const item of qwResult.data || []) {
          titleMap[item.id] = { title: item.title, category: item.category };
        }
        for (const item of courseResult.data || []) {
          titleMap[item.id] = { title: item.title, category: item.category };
        }

        setFavorites(
          rawFavorites.map((f) => ({
            ...f,
            title: titleMap[f.content_id]?.title,
            category: titleMap[f.content_id]?.category,
          }))
        );
      } else {
        setFavorites([]);
      }

      setRecognitionData(recognitionResult);
      setDataLoaded(true);
    };

    loadData();
  }, [user?.id, dataLoaded]);

  // ── Fetch AI insights when switching tabs ──────────────────────────────
  useEffect(() => {
    if (activeTab === 'growth' && !growthInsight && statsData && !insightsLoading) {
      setInsightsLoading(true);
      fetch('/api/hub/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: 'growth',
          data: {
            toolsExplored: statsData.toolsExplored,
            hoursSaved: statsData.hoursSaved,
            daysActive: statsData.daysActive,
            communityContributions: statsData.communityContributions,
            recognitionsEarned: recognitionData?.earned.length || 0,
            goals: selectedGoals,
          },
        }),
      })
        .then(r => r.json())
        .then(r => { if (r.insight) setGrowthInsight(r.insight); })
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
    }
    if (activeTab === 'vibe_check' && !vibeInsight && checkIns.length > 0 && !insightsLoading) {
      setInsightsLoading(true);
      const dimensions = new Set(checkIns.map(c => c.responses?.category).filter(Boolean));
      fetch('/api/hub/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: 'vibe_check',
          data: {
            checkIns: checkIns.slice(0, 10).map(c => ({
              score: c.score,
              category: c.responses?.category || 'mood',
              date: new Date(c.created_at).toISOString().split('T')[0],
            })),
            totalCheckIns: checkIns.length,
            dimensionsChecked: Array.from(dimensions),
          },
        }),
      })
        .then(r => r.json())
        .then(r => { if (r.insight) setVibeInsight(r.insight); })
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
    }
  }, [activeTab, statsData, checkIns, growthInsight, vibeInsight, insightsLoading, recognitionData, selectedGoals]);

  // ── Derived state ─────────────────────────────────────────────────────

  const hasNameChanged = displayName !== (profile?.display_name || '');
  const hasRoleChanged = selectedRole !== profile?.role;
  const hasAvatarChanged =
    selectedAvatarId !== profile?.avatar_id ||
    uploadedAvatarUrl !== profile?.avatar_url;
  const currentGoals =
    (profile?.onboarding_data as { goals?: GoalType[] } | null)?.goals || [];
  const hasGoalsChanged =
    JSON.stringify([...selectedGoals].sort()) !==
    JSON.stringify([...currentGoals].sort());

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSaveName = async () => {
    if (!user?.id || !hasNameChanged) return;
    setIsSaving(true);
    await updateHubProfile(user.id, { display_name: displayName });
    setSavedField('name');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleRoleChange = async (role: Role) => {
    if (!user?.id) return;
    setSelectedRole(role);
    setIsSaving(true);
    await updateHubProfile(user.id, { role });
    setSavedField('role');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    setUploadedAvatarUrl(null);
  };

  const handleAvatarUpload = (url: string) => {
    setUploadedAvatarUrl(url);
    setSelectedAvatarId(null);
  };

  const handleAvatarClear = () => {
    setUploadedAvatarUrl(null);
  };

  const handleAvatarFileSelect = async (file: File) => {
    if (!user?.id) return;
    setIsUploading(true);
    const supabase = getSupabase();

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      await supabase.storage
        .from('hub-avatars')
        .remove([
          `${user.id}/avatar.jpg`,
          `${user.id}/avatar.png`,
          `${user.id}/avatar.webp`,
        ]);

      const { error: uploadError } = await supabase.storage
        .from('hub-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('hub-avatars')
        .getPublicUrl(filePath);

      setUploadedAvatarUrl(publicUrl.publicUrl);
      setSelectedAvatarId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!user?.id || !hasAvatarChanged) return;
    setIsSaving(true);
    await updateHubProfile(user.id, {
      avatar_id: selectedAvatarId,
      avatar_url: uploadedAvatarUrl,
    });
    setIsAvatarPickerOpen(false);
    setSavedField('avatar');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) => {
      if (goal === 'all_of_the_above') {
        if (prev.includes('all_of_the_above')) {
          return [];
        }
        return [...ALL_INDIVIDUAL_GOALS, 'all_of_the_above'];
      }

      if (prev.includes(goal)) {
        return prev.filter((g) => g !== goal && g !== 'all_of_the_above');
      } else {
        const newGoals = [...prev, goal];
        const allIndividualSelected = ALL_INDIVIDUAL_GOALS.every((g) =>
          newGoals.includes(g)
        );
        if (allIndividualSelected) {
          return [...newGoals, 'all_of_the_above'];
        }
        return newGoals;
      }
    });
  };

  const handleSaveGoals = async () => {
    if (!user?.id || !hasGoalsChanged) return;
    setIsSaving(true);

    const supabase = getSupabase();
    const currentData = (profile?.onboarding_data || {}) as Record<
      string,
      unknown
    >;
    await updateHubProfile(user.id, {
      onboarding_data: { ...currentData, goals: selectedGoals },
    });

    await supabase.from('hub_user_goals').delete().eq('user_id', user.id);
    if (selectedGoals.length > 0) {
      await supabase.from('hub_user_goals').insert(
        selectedGoals.map((goal) => ({ user_id: user.id, goal_type: goal }))
      );
    }

    setSavedField('goals');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    await signOut();
  };

  // ── Quick win recommendations based on selected goals ─────────────────

  const goalRecommendations = selectedGoals
    .filter((g) => g !== 'all_of_the_above')
    .flatMap((g) => (GOAL_QUICK_WIN_MAP[g] || []).map((title) => ({ goal: g, title })))
    .slice(0, 3);

  // ── Render ────────────────────────────────────────────────────────────

  // Computed profile stats for hero
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;
  const roleLabels: Record<string, string> = {
    classroom_teacher: 'Classroom Teacher',
    para: 'Paraprofessional',
    coach: 'Instructional Coach',
    school_leader: 'School Leader',
    district_staff: 'District Staff',
    other: 'Educator',
  };
  const heroRoleLabel = profile?.role ? roleLabels[profile.role] || 'Educator' : 'Educator';
  const heroName = profile?.display_name || user?.email?.split('@')[0] || 'Teacher';

  return (
    <div>
      {/* ════ Profile Hero Banner ════ */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '-40px', top: '-60px', width: '220px', height: '220px', background: 'rgba(255,186,6,0.07)' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ right: '80px', bottom: '-80px', width: '160px', height: '160px', background: 'rgba(56,97,140,0.4)' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-5">
            {/* Large avatar */}
            <div className="flex-shrink-0">
              <div
                className="rounded-full p-1"
                style={{ border: '2px solid rgba(255,186,6,0.4)' }}
              >
                <AvatarDisplay
                  size={96}
                  avatarId={profile?.avatar_id}
                  avatarUrl={profile?.avatar_url}
                  displayName={profile?.display_name}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {heroName}
              </h1>
              {/* Role badge + member since */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(255,186,6,0.15)',
                    border: '1px solid rgba(255,186,6,0.3)',
                    color: '#FFBA06',
                    letterSpacing: '0.04em',
                  }}
                >
                  {heroRoleLabel}
                </span>
                {memberSince && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {tUI('Member since')} {memberSince}
                  </span>
                )}
              </div>
              {/* Quick stats row */}
              {statsData && (
                <div className="flex items-center gap-5 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{statsData.toolsExplored}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{tUI('tools')}</div>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{statsData.daysActive}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{tUI('days active')}</div>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#FFBA06' }}>
                      {recognitionData ? recognitionData.earned.length : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{tUI('field notes')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {/* Settings-level tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
          <Link
            href="/hub/settings/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <User size={18} />
            {tUI('Profile')}
          </Link>
          <Link
            href="/hub/settings/notifications"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Bell size={18} />
            {tUI('Notifications')}
          </Link>
          <Link
            href="/hub/settings/help"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <HelpCircle size={18} />
            {tUI('Help & FAQ')}
          </Link>
        </div>

        {/* Growth Tab Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? '#1e2749' : '#f3f4f6',
                  color: isActive ? '#ffffff' : '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Icon size={16} />
                {tUI(tab.label)}
              </button>
            );
          })}
        </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: Profile
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Personalize Your Space -- consolidated card */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
          >
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <h2
                className="text-sm font-semibold mb-1"
                style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}
              >
                {tUI('Personalize your space')}
              </h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {tUI('Make this hub feel like yours. Choose your look, set your name, pick your role.')}
              </p>
            </div>

            {/* Avatar section */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  <div className="rounded-full p-0.5" style={{ border: '2px solid rgba(232,184,75,0.3)' }}>
                    <AvatarDisplay
                      size={96}
                      avatarId={isAvatarPickerOpen ? selectedAvatarId : profile?.avatar_id}
                      avatarUrl={isAvatarPickerOpen ? uploadedAvatarUrl : profile?.avatar_url}
                      displayName={profile?.display_name}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                    {tUI('Your Avatar')}
                    {savedField === 'avatar' && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        <Check size={14} className="inline" /> {tUI('Saved')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
                    {tUI('This is how you appear in the community.')}
                  </p>
                  {!isAvatarPickerOpen ? (
                    <button
                      onClick={() => setIsAvatarPickerOpen(true)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[#FFF8E7]"
                      style={{ border: '1.5px solid #E8B84B', color: '#2B3A67' }}
                    >
                      {tUI('Change avatar')}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAvatar}
                        disabled={!hasAvatarChanged || isSaving}
                        className="text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                        style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
                      >
                        {isSaving ? tUI('Saving...') : tUI('Save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsAvatarPickerOpen(false);
                          setSelectedAvatarId(profile?.avatar_id || null);
                          setUploadedAvatarUrl(profile?.avatar_url || null);
                        }}
                        className="text-xs font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: '#E5E5E5', color: '#6B7280' }}
                      >
                        {tUI('Cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {isAvatarPickerOpen && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <AvatarPicker
                    selectedAvatarId={selectedAvatarId}
                    uploadedAvatarUrl={null}
                    onSelect={handleAvatarSelect}
                    onUpload={() => {}}
                    onClearUpload={() => {}}
                    size="settings"
                  />
                </div>
              )}
            </div>

            {/* Display Name */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A' }}>
                {tUI('Display Name')}
                {savedField === 'name' && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    <Check size={14} className="inline" /> {tUI('Saved')}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={tUI('Your name')}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8B84B] transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                {hasNameChanged && (
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
                  >
                    {isSaving ? tUI('Saving...') : tUI('Save')}
                  </button>
                )}
              </div>
            </div>

            {/* Role Selector */}
            <div className="px-6 py-5">
              <div className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A' }}>
                {tUI('Your Role')}
                {savedField === 'role' && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    <Check size={14} className="inline" /> {tUI('Saved')}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(role.value)}
                    disabled={isSaving}
                    className="p-3 rounded-lg text-left transition-all focus:outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: isSelected ? '#FFF8E7' : 'white',
                      border: isSelected
                        ? '2px solid #E8B84B'
                        : '1.5px solid #E5E7EB',
                    }}
                  >
                    <p
                      className="font-medium text-sm"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {tUI(role.label)}
                    </p>
                    <p
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {tUI(role.subtitle)}
                    </p>
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          {/* Take the Tour */}
          <div className="hub-card">
            <h2
              className="font-semibold mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
                fontSize: '16px',
              }}
            >
              {tUI('Learning Hub Tour')}
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              {tUI(
                'Take a guided tour of the Hub features anytime. See what is new and discover tools you might have missed.'
              )}
            </p>
            <Link
              href="/hub?tour=start"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#ffba06',
                color: '#1e2749',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI('Take the tour')}
            </Link>
          </div>

          {/* Account / Danger Zone */}
          <div className="hub-card">
            <h2
              className="font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                color: '#2B3A67',
              }}
            >
              {tUI('Account')}
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <LogOut size={18} />
                {tUI('Sign out')}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Trash2 size={16} />
                {tUI('Delete my account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: My Growth (Goals + Stats + Recognitions combined)
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {/* Goals selector */}
          <div>
            <p className="text-sm mb-6" style={{ color: '#6B7280', lineHeight: 1.6 }}>
              {tUI('Pick what matters. We will shape everything around it.')}
              {savedField === 'goals' && (
                <span className="ml-2 text-xs text-green-600"><Check size={12} className="inline" /> {tUI('Saved')}</span>
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {GRID_GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.value);
                return (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className="group relative p-5 rounded-2xl transition-all focus:outline-none text-left"
                    style={{
                      backgroundColor: isSelected ? '#1B2A4A' : 'white',
                      border: isSelected ? '1px solid #1B2A4A' : '1px solid rgba(27,42,74,0.08)',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(27,42,74,0.15)'
                        : '0 1px 3px rgba(27,42,74,0.04)',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <Check size={14} style={{ color: '#FFBA06' }} />
                      </div>
                    )}
                    <div className="mb-2" style={{ color: isSelected ? '#FFBA06' : '#9CA3AF' }}>
                      {GoalIconMap[goal.value]}
                    </div>
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: isSelected ? 'white' : '#1B2A4A' }}
                    >
                      {tUI(goal.label)}
                    </p>
                  </button>
                );
              })}
            </div>

            {hasGoalsChanged && (
              <button
                onClick={handleSaveGoals}
                disabled={isSaving}
                className="text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFBA06', color: '#1B2A4A' }}
              >
                {isSaving ? tUI('Saving...') : tUI('Update goals')}
              </button>
              )}
          </div>

          {goalRecommendations.length > 0 && (
            <div
              className="bg-white rounded-2xl"
              style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
            >
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                  {tUI('Based on your goals, we recommend')}
                </h3>
              </div>
              <div>
                {goalRecommendations.map((rec, i) => (
                  <Link
                    key={i}
                    href={`/hub/quick-wins?q=${encodeURIComponent(rec.title)}`}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    style={i < goalRecommendations.length - 1 ? { borderBottom: '1px solid #F3F4F6', display: 'flex' } : { display: 'flex' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FFF8E7' }}
                    >
                      <Lightbulb size={18} style={{ color: '#D97706' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{rec.title}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        {tUI(GRID_GOALS.find((g) => g.value === rec.goal)?.label || '')}
                      </p>
                    </div>
                    <ArrowRight size={16} style={{ color: '#38618C' }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── AI Growth Insight ── */}
          {(growthInsight || insightsLoading) && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)',
                boxShadow: '0 4px 16px rgba(27,42,74,0.15)',
              }}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} style={{ color: '#E8B84B' }} />
                  <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}>
                    {tUI('AI Insight')}
                  </span>
                </div>
                {insightsLoading && !growthInsight ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-3/5 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                    {growthInsight}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Stats Section ── */}
          {/* Stats Grid -- navy accent cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tools explored', value: statsData?.toolsExplored ?? 0, accent: '#FFBA06' },
              { label: 'Hours reclaimed', value: `~${statsData?.hoursSaved ?? '0'}`, accent: '#4A9A8B' },
              { label: 'Contributions', value: statsData?.communityContributions ?? 0, accent: '#7C9CBF' },
              { label: 'Days active', value: statsData?.daysActive ?? 0, accent: '#9B7CB8' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl text-center py-6 px-4"
                style={{
                  background: 'white',
                  border: '1px solid rgba(27,42,74,0.06)',
                  boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)',
                  borderTop: `3px solid ${stat.accent}`,
                }}
              >
                <p className="font-bold text-3xl mb-1" style={{ fontFamily: "'Source Serif 4', serif", color: '#1B2A4A' }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{tUI(stat.label)}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          {/* Activity Heatmap -- last 12 weeks */}
          <div
            className="bg-white rounded-2xl"
            style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                {tUI('Your Activity')}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{tUI('Last 12 weeks')}</p>
            </div>
            <div className="px-6 py-5">
              {(() => {
                // Build 12-week heatmap from activity data
                const weeks = 12;
                const days = weeks * 7;
                const today = new Date();
                const activityDays = new Set(
                  (statsData?.recentActivity || []).map(a => new Date(a.created_at).toISOString().split('T')[0])
                );
                // Also use daysActive to mark additional days from all activity
                const allDaySet = new Set<string>();
                // We only have recentActivity (5 items) but daysActive count tells us more
                // For now, use what we have
                (statsData?.recentActivity || []).forEach(a => {
                  allDaySet.add(new Date(a.created_at).toISOString().split('T')[0]);
                });

                const cells = [];
                for (let i = days - 1; i >= 0; i--) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - i);
                  const key = d.toISOString().split('T')[0];
                  const isActive = allDaySet.has(key);
                  const isToday = i === 0;
                  cells.push({ key, isActive, isToday, day: d.getDay() });
                }

                // Group into weeks (columns)
                const weekColumns: typeof cells[] = [];
                for (let w = 0; w < weeks; w++) {
                  weekColumns.push(cells.slice(w * 7, (w + 1) * 7));
                }

                return (
                  <div className="flex gap-1">
                    {weekColumns.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1">
                        {week.map((cell) => (
                          <div
                            key={cell.key}
                            className="rounded-sm"
                            title={`${cell.key}${cell.isActive ? ' -- active' : ''}`}
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: cell.isActive ? '#E8B84B' : cell.isToday ? '#FFF8E7' : '#F3F4F6',
                              border: cell.isToday ? '1px solid #E8B84B' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#F3F4F6' }} />
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{tUI('No activity')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E8B84B' }} />
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{tUI('Active day')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recognitions Summary ── */}
          {recognitionData && recognitionData.earned.length > 0 && (
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                  {tUI('Recognitions Earned')}
                </h3>
                <Link
                  href="/hub/certificates"
                  className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: '#E8B84B' }}
                >
                  {tUI('View all')} <ArrowRight size={12} />
                </Link>
              </div>
              <div className="px-6 py-4 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <span className="text-xl font-bold" style={{ color: '#D97706' }}>{recognitionData.earned.length}</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                    {recognitionData.earned.length} {recognitionData.earned.length === 1 ? tUI('Field Note earned') : tUI('Field Notes earned')}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {tUI('View your achievements, print certificates, and share your wins')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: Vibe Check
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'vibe_check' && (
        <div className="space-y-6">
          {/* ── AI Vibe Insight ── */}
          {(vibeInsight || (insightsLoading && checkIns.length > 0)) && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)',
                boxShadow: '0 4px 16px rgba(27,42,74,0.15)',
              }}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} style={{ color: '#E8B84B' }} />
                  <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}>
                    {tUI('AI Insight')}
                  </span>
                </div>
                {insightsLoading && !vibeInsight ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-3/5 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                    {vibeInsight}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dimension score visualization */}
          {checkIns.length > 0 && (() => {
            const dimScores: Record<string, { total: number; count: number; color: string }> = {
              mood: { total: 0, count: 0, color: '#DC2626' },
              energy: { total: 0, count: 0, color: '#D97706' },
              belonging: { total: 0, count: 0, color: '#7C3AED' },
              purpose: { total: 0, count: 0, color: '#0891B2' },
              needs: { total: 0, count: 0, color: '#16A34A' },
            };
            checkIns.forEach(c => {
              const cat = (c.responses?.category as string) || 'mood';
              if (dimScores[cat]) {
                dimScores[cat].total += c.score;
                dimScores[cat].count++;
              }
            });
            return (
              <div
                className="bg-white rounded-2xl p-6"
                style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
                  {tUI('Your Averages by Dimension')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(dimScores).map(([dim, data]) => {
                    const avg = data.count > 0 ? data.total / data.count : 0;
                    const pct = (avg / 5) * 100;
                    return (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-xs font-medium capitalize w-20 text-right" style={{ color: '#6B7280' }}>{dim}</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: data.count > 0 ? `${pct}%` : '0%', backgroundColor: data.color, opacity: data.count > 0 ? 1 : 0.2 }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-8" style={{ color: data.count > 0 ? '#1B2A4A' : '#D1D5DB' }}>
                          {data.count > 0 ? avg.toFixed(1) : '--'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>{tUI('Scale: 1 (tough) to 5 (great). Dimensions without check-ins show as empty.')}</p>
              </div>
            );
          })()}

          {/* Dimension overview */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
          >
            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FAFAF8 100%)' }}>
              <h2 className="text-sm font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                {tUI('Your Vibe Check History')}
              </h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {tUI('We check in across 5 dimensions. This data is completely private -- only you can see it.')}
              </p>
            </div>
            <div className="bg-white px-6 py-4 flex flex-wrap gap-2">
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

          {/* History */}
          <div
            className="bg-white rounded-2xl"
            style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                {tUI('Recent Check-ins')}
              </h3>
            </div>

            {checkIns.length > 0 ? (
              <div>
                {checkIns.map((entry, idx) => {
                  const scoreConfigs: Record<number, { label: string; bg: string; color: string; border: string }> = {
                    1: { label: 'Tough day', bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
                    2: { label: 'Hanging in there', bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
                    3: { label: 'Okay', bg: '#FEF9C3', color: '#854D0E', border: '#D97706' },
                    4: { label: 'Good day', bg: '#DCFCE7', color: '#166534', border: '#22C55E' },
                    5: { label: 'Great day', bg: '#D1FAE5', color: '#065F46', border: '#16A34A' },
                  };
                  const scoreConfig = scoreConfigs[entry.score] || scoreConfigs[3];
                  return (
                    <div
                      key={entry.id}
                      className="px-6 py-4 flex items-center gap-4"
                      style={idx < checkIns.length - 1 ? { borderBottom: '1px solid #F3F4F6' } : {}}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: scoreConfig.border }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {entry.responses?.category && (
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded capitalize"
                              style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px' }}
                            >
                              {entry.responses.category}
                            </span>
                          )}
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: scoreConfig.bg, color: scoreConfig.color, fontSize: '10px' }}
                          >
                            {tUI(scoreConfig.label)}
                          </span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: scoreConfig.bg, color: scoreConfig.color }}
                      >
                        {entry.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <Heart size={28} className="mx-auto mb-3" style={{ color: '#D97706' }} />
                <p className="text-sm font-medium mb-1" style={{ color: '#1e2749' }}>
                  {tUI('No check-ins yet')}
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  {tUI('Vibe Checks pop up randomly as you explore. Just answer when you see one.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* ════════════════════════════════════════════════════════════════════
          Delete Confirmation Modal (always available)
         ════════════════════════════════════════════════════════════════════ */}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '18px',
                color: '#2B3A67',
              }}
            >
              {tUI('Delete your account?')}
            </h3>
            <p
              className="text-gray-600 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tUI(
                'This will permanently delete your profile, progress, and certificates. This action cannot be undone.'
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 font-medium transition-colors hover:bg-gray-50"
                style={{
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tUI('Cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tUI('Delete account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
