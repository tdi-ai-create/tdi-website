'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { getTopicConfig, TOPIC_MAP } from '@/lib/data/creator-topics';
import dynamic from 'next/dynamic';
import {
  Search,
  Users,
  Rocket,
  Plus,
  X,
  Loader2,
  FileText,
  Download as DownloadIcon,
  BookOpen,
  Clock,
  AlertTriangle,
  Filter,
  Bell,
  Hourglass,
  Trophy,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Palette,
  MapPin,
  BarChart3,
  DollarSign,
  TrendingUp,
  Calendar,
  Zap,
  CalendarDays,
  Globe,
  Check,
  Copy,
  LayoutGrid,
  UserCheck,
  MessageCircle,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  MousePointerClick,
  BookMarked, PenLine, Activity, FlaskConical, Calculator,
  GraduationCap, Sparkles, Languages, HeartHandshake, Music, Library,
  HeartPulse, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Sprout,
  Target, Home as HomeIcon, Laptop, Scale, Mail, MoreVertical, Inbox, KeyRound,
  UserPlus, Award,
} from 'lucide-react';

import { useTDIAdmin } from '@/lib/tdi-admin/context';
import {
  TOPIC_ICON_MAP,
  getRelativeTime,
  type EnrichedCreator,
  type DashboardData,
} from '@/components/tdi-admin/creators/shared';
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_CARD_TITLE,
  TYPE_STAT_VALUE,
  TYPE_STAT_LABEL,
  TYPE_WIDGET_LABEL,
  TYPE_TABLE_HEADER,
} from '@/components/tdi-admin/ui/design-tokens';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { copyToClipboard, formatEmailsForCopy } from '@/lib/tdi-admin/clipboard';
import { Toast, useToast } from '@/components/tdi-admin/Toast';
import { RecruitmentTab } from '@/components/tdi-admin/creators/RecruitmentTab';
import { CreatorQueue } from '@/components/tdi-admin/creators/CreatorQueue';
import {
  DraftNoteCard,
  type DraftNote,
  type DraftNoteAction,
  type DraftNoteActionPayload,
} from '@/components/tdi-admin/DraftNoteCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HorizontalBarChart, DonutChart, DonutLegend, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts';

// Creators theme colors
const theme = PORTAL_THEMES.creators;

// Dynamic import for map to avoid SSR issues
const USMapChart = dynamic(() => import('@/components/tdi-admin/USMapChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
    </div>
  ),
});

// Tab types
type TabId = 'queue' | 'dashboard' | 'creators' | 'recruitment';

// Tab configuration
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  // Needs You lands first because it is the only tab that answers "what do I
  // do now". Action Center stays for the moment rather than being replaced in
  // the same change, so the new screen can be checked against the old one
  // before anything is removed.
  { id: 'queue', label: 'Needs You', icon: Bell },
  { id: 'dashboard', label: 'Action Center', icon: LayoutGrid },
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
];

// Re-engagement, Analytics and Affiliate are destinations rather than things
// you switch between while working, so they are links in the header now. Seven
// tabs made the four that matter harder to find.
const SIDE_PAGES: { href: string; label: string; icon: React.ElementType }[] = [
  { href: '/tdi-admin/creators/re-engagement', label: 'Re-engagement', icon: Mail },
  { href: '/tdi-admin/creators/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/tdi-admin/creators/affiliate', label: 'Affiliate', icon: DollarSign },
];

// Re-engagement filter options for the creators roster. Grouped by what Bella
// would actually act on rather than by raw step number.
type ReengagementFilter =
  | 'all'
  | 'none'
  | 'any'
  | 'early'
  | 'late'
  | 'facing_pause'
  | 'paused';

const REENGAGEMENT_FILTERS: { value: ReengagementFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'none', label: 'Not in sequence' },
  { value: 'any', label: 'In sequence' },
  { value: 'early', label: 'Early (steps 0 to 2)' },
  { value: 'late', label: 'Late (steps 3 to 5)' },
  { value: 'facing_pause', label: 'Facing pause' },
  { value: 'paused', label: 'Paused' },
];

function matchesReengagementFilter(c: EnrichedCreator, filter: ReengagementFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'paused') return c.lifecycle_state === 'paused';

  const seq = c.reengagement;
  if (filter === 'none') return !seq;
  if (!seq) return false;

  switch (filter) {
    case 'any':
      return true;
    case 'early':
      return seq.currentStep <= 2;
    case 'late':
      return seq.currentStep >= 3 && seq.currentStep <= 4;
    case 'facing_pause':
      return seq.facingPause;
    default:
      return true;
  }
}

// Types
// EnrichedCreator and DashboardData moved to
// components/tdi-admin/creators/shared.ts when analytics became its own
// route. Both files had a copy for a while; one contract is enough.

// Phase display names
const phaseDisplayNames: Record<string, string> = {
  onboarding: 'Onboarding',
  agreement: 'Agreement',
  course_design: 'Prep & Resources',
  test_prep: 'Production',
  production: 'Production',
  launch: 'Launch',
};

// Helper function for relative time
function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}


// Modern Stat Card Component
// Status indicator component - dots for most, checkmark for launched
function StatusIndicator({ status }: { status: string }) {
  if (status === 'launched') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#ffba06" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-wide" style={{ color: '#ffba06' }}>LIVE</span>
      </div>
    );
  }

  const dots: Record<string, string> = {
    total:          '#1e2749',
    stalled:        '#6B7280',
    followedUp:     '#10B981',
    waitingOnCreator:'#06B6D4',
    waitingOnTDI:   '#1e2749',
  };

  const labels: Record<string, string> = {
    total:           'ALL PATHS',
    stalled:         '14+ DAYS',
    followedUp:      'BY TEAM',
    waitingOnCreator:'ACTION NEEDED',
    waitingOnTDI:    'NEEDS REVIEW',
  };

  const color = dots[status] || '#1e2749';
  const label = labels[status] || status.toUpperCase();

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-xs font-semibold text-gray-400 tracking-wide">{label}</span>
    </div>
  );
}

export default function CreatorStudioPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('queue');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filteredCreators, setFilteredCreators] = useState<EnrichedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Filter state
  const [filterPath, setFilterPath] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterWaitingOn, setFilterWaitingOn] = useState<string>('all');
  const [filterPublishStatus, setFilterPublishStatus] = useState<string>('all');
  const [filterReengagement, setFilterReengagement] = useState<ReengagementFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState<'lastActive' | 'progress' | 'name'>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state for bulk email
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<Set<string>>(new Set());

  // Bulk delete state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Milestone sync state
  const [isSyncingMilestones, setIsSyncingMilestones] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    creatorsProcessed?: number;
    milestonesInserted?: number;
  } | null>(null);

  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    course_title: '',
    course_audience: '',
    target_publish_month: '',
    target_launch_year: new Date().getFullYear().toString(),
  });

  // Recent email activity
  const [recentEmails, setRecentEmails] = useState<any[]>([]);

  // Quick actions dropdown
  const [quickActionCreatorId, setQuickActionCreatorId] = useState<string | null>(null);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);

  // Geographic distribution state
  const [locationData, setLocationData] = useState<{
    stateData: { state: string; count: number }[];
    topStates: { state: string; count: number }[];
    totalCreators: number;
    creatorsWithLocation: number;
    noLocationCount: number;
  } | null>(null);

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<{
    phaseVelocity: { phase: string; name: string; avgDays: number; sampleSize: number; color: string }[];
    bottleneckReport: { id: string; name: string; phase: string; phaseId: string; avgDays: number; currentlyStuck: number }[];
    contentPathBreakdown: { name: string; value: number; color: string; percent: number }[];
    contentPathTrends: { month: string; monthLabel: string; blog: number; download: number; course: number; notSet: number; total: number }[];
    activityHeatmap: { id: string; name: string; initials: string; contentPath: string | null; activityLevel: 'green' | 'yellow' | 'orange' | 'red'; daysSinceActivity: number; lastActivity: string }[];
    journeyTimes: { id: string; name: string; contentPath: string | null; days: number; startDate: string; endDate: string }[];
    completionFunnel: { phase: string; name: string; count: number; percent: number }[];
    stalledCreators: { id: string; name: string; email: string; contentPath: string | null; currentStep: string | null; daysSinceActivity: number; lastActivityDate: string; severity: 'yellow' | 'orange' | 'red' }[];
    publishedPerMonth: { month: string; monthLabel: string; courses: number; blogs: number; cumulativeCourses: number; cumulativeBlogs: number; total: number }[];
    geographicDistribution: { hasData: boolean; total: number; withState: number; withoutState: number; states: { state: string; count: number; percent: number }[] };
    // Event-driven overlay (optional — absent when milestone_events table is empty)
    realtimeActivityFeed?: { id: string; creatorId: string; creatorName: string; eventType: string; eventLabel: string; triggerType: string; triggerLabel: string; milestoneName: string; phase: string; contentPath: string; createdAt: string }[];
    selfCompleteRatio?: { contentPath: string; selfComplete: number; adminAdvance: number; other: number; total: number; selfCompletePercent: number; adminAdvancePercent: number }[];
    eventEngagementHeatmap?: { id: string; name: string; initials: string; contentPath: string | null; engagementLevel: 'hot' | 'warm' | 'cool' | 'cold'; eventsLast30Days: number; eventsLast7Days: number; lastEventAt: string | null }[];
    eventFunnelAnalysis?: { phase: string; name: string; count: number; percent: number; avgDaysToPhase: number | null; sampleSize: number }[];
    publishingPipeline?: {
      forecast: { month: string; monthLabel: string; download: number; course: number; total: number }[];
      detailList: { month: string; monthLabel: string; count: number; creators: { id: string; name: string; email: string; contentPath: string | null; projectedPublishDate: string | null }[] }[];
      noProjectedDate: { id: string; name: string; email: string; contentPath: string | null }[];
      pastProjectedDate: { id: string; name: string; email: string; contentPath: string | null; projectedCompletionDate: string | null; daysOverdue: number }[];
    };
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Hub content impact data
  const [hubCreatorData, setHubCreatorData] = useState<{
    topContent: { id: string; title: string; category: string; creator: string; views: number; communityResponses: number; qaThreads: number; impactScore: number }[];
    categoryPerformance: Record<string, { views: number; responses: number; qaThreads: number; contentCount: number }>;
    contentRequests: { request: unknown; date: string }[];
    totalContent: number;
  } | null>(null);
  const [hubCreatorLoading, setHubCreatorLoading] = useState(false);

  // Follow-up modal state
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedCreatorForFollowUp, setSelectedCreatorForFollowUp] = useState<{ id: string; name: string } | null>(null);
  const [isMarkingFollowUp, setIsMarkingFollowUp] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');

  // Feedback review queue state
  const [feedbackQueue, setFeedbackQueue] = useState<any[]>([]);
  const [waitingApplications, setWaitingApplications] = useState(0);
  const [newSubmissions, setNewSubmissions] = useState<any[]>([]);
  const [pendingRecruitment, setPendingRecruitment] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editedFeedbackContent, setEditedFeedbackContent] = useState('');
  const [feedbackActionLoading, setFeedbackActionLoading] = useState<string | null>(null);

  // Draft notes queue state (Anne Marie's check-in notes for Bella)
  const [draftNotes, setDraftNotes] = useState<any[]>([]);
  const [noteActionLoading, setNoteActionLoading] = useState<string | null>(null);

  const [recruitmentSourceData, setRecruitmentSourceData] = useState<any>(null);

  const canEdit = isOwner || hasPermission(permissions, 'creator_studio', 'edit');

  const loadDashboardData = useCallback(async () => {
    try {
      const url = showArchived
        ? '/api/admin/dashboard-data?includeArchived=true'
        : '/api/admin/dashboard-data';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
          setFilteredCreators(data.creators);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);


  useEffect(() => {
    if (hasAccess) {
      loadDashboardData();
      // Load location data
      fetch('/api/admin/creator-locations')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setLocationData(data);
          }
        })
        .catch(err => console.error('Failed to load location data:', err));
      // Load the application queue count. Applications used to land in a table
      // nothing read, so seven people waited months without an answer. The
      // count is surfaced here so the queue cannot go quiet again.
      fetch('/api/tdi-admin/creator-applications?status=open')
        .then(res => res.json())
        .then(data => setWaitingApplications((data.applications || []).length))
        .catch(() => {});
      // Load recent email activity
      fetch('/api/admin/creator-email-activity')
        .then(res => res.json())
        .then(data => setRecentEmails(data.emails || []))
        .catch(() => {});
      // Load feedback review queue (Anne Marie drafts waiting for Bella)
      fetch('/api/admin/creator-feedback?status=pending_review')
        .then(res => res.json())
        .then(data => setFeedbackQueue(data.feedback || []))
        .catch(() => {});
      // Load draft notes queue (Anne Marie check-in notes waiting for Bella)
      fetch('/api/admin/creator-notes?status=pending_approval')
        .then(res => res.json())
        .then(data => setDraftNotes(data.notes || []))
        .catch(() => {});
      // Load new submissions waiting for review (before Anne Marie acts)
      fetch('/api/admin/creator-feedback?status=all')
        .then(res => res.json())
        .then(data => {
          const submitted = (data.feedback || []).filter(
            (f: any) => !f.feedback_content && !f.feedback_draft_status
          );
          setNewSubmissions(submitted);
        })
        .catch(() => {});
      // Load suggested recruitment candidates for Action Center
      fetch('/api/admin/creator-recruitment?action=pipeline&stage=suggested')
        .then(res => res.json())
        .then(data => setPendingRecruitment(data.candidates || []))
        .catch(() => {});
      // Get admin email from session
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user?.email) {
            setAdminEmail(session.user.email);
          }
        });
      });
    } else {
      setIsLoading(false);
    }
  }, [hasAccess, loadDashboardData]);

  // Quick actions from creator list
  const handleQuickAction = async (action: string, creatorId: string, creatorEmail?: string) => {
    setQuickActionLoading(action);
    try {
      switch (action) {
        case 'mark-engaged':
          await fetch(`/api/admin/creators/${creatorId}/mark-engaged`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail }),
          });
          break;
        case 'pause':
          await fetch(`/api/admin/creators/${creatorId}/pause`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Paused via quick action', adminEmail }),
          });
          break;
        case 'resend-welcome':
          await fetch('/api/admin/resend-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creatorId }),
          });
          break;
      }
      setQuickActionCreatorId(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setQuickActionLoading(null);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setQuickActionCreatorId(null);
    if (quickActionCreatorId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [quickActionCreatorId]);

  // The three analytics loads that used to sit here moved with the screen
  // they served, to app/tdi-admin/creators/analytics.

  // Filter and sort creators
  useEffect(() => {
    if (!dashboardData) return;

    let filtered = [...dashboardData.creators];

    // Apply stat card filter
    if (activeStatFilter) {
      switch (activeStatFilter) {
        case 'stalled':
          filtered = filtered.filter((c) => c.waitingOn === 'stalled');
          break;
        case 'followedUp':
          filtered = filtered.filter((c) => c.waitingOn === 'followed_up');
          break;
        case 'waitingOnCreator':
          filtered = filtered.filter((c) => c.waitingOn === 'creator');
          break;
        case 'waitingOnTDI':
          filtered = filtered.filter((c) => c.waitingOn === 'tdi');
          break;
        case 'launched':
          filtered = filtered.filter((c) => c.waitingOn === 'launched');
          break;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.course_title?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply content path filter
    if (filterPath !== 'all') {
      if (filterPath === 'notSet') {
        filtered = filtered.filter((c) => !c.content_path);
      } else {
        filtered = filtered.filter((c) => c.content_path === filterPath);
      }
    }

    // Apply phase filter
    if (filterPhase !== 'all') {
      filtered = filtered.filter((c) => c.current_phase === filterPhase);
    }

    // Apply waiting on filter
    if (filterWaitingOn !== 'all') {
      filtered = filtered.filter((c) => c.waitingOn === filterWaitingOn);
    }

    // Apply publish status filter
    if (filterPublishStatus !== 'all') {
      filtered = filtered.filter((c) => c.publish_status === filterPublishStatus);
    }

    // Apply re-engagement filter
    if (filterReengagement !== 'all') {
      filtered = filtered.filter((c) => matchesReengagementFilter(c, filterReengagement));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'lastActive':
          comparison = new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime();
          break;
        case 'progress':
          comparison = b.progressPercentage - a.progressPercentage;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // Move stalled creators to top if not filtering by a specific stat
    if (!activeStatFilter) {
      const stalled = filtered.filter((c) => c.isStalled);
      const notStalled = filtered.filter((c) => !c.isStalled);
      filtered = [...stalled, ...notStalled];
    }

    setFilteredCreators(filtered);
  }, [searchQuery, dashboardData, filterPath, filterPhase, filterWaitingOn, filterPublishStatus, filterReengagement, activeStatFilter, sortBy, sortOrder]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    // Combine month and year into a single string
    const targetLaunchMonth = newCreator.target_publish_month && newCreator.target_launch_year
      ? `${newCreator.target_publish_month} ${newCreator.target_launch_year}`
      : undefined;

    try {
      const response = await fetch('/api/admin/add-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCreator.name,
          email: newCreator.email,
          intakeResponses: {
            course_title: newCreator.course_title || undefined,
            course_audience: newCreator.course_audience || undefined,
            target_publish_month: targetLaunchMonth,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setNewCreator({
          name: '',
          email: '',
          course_title: '',
          course_audience: '',
          target_publish_month: '',
          target_launch_year: new Date().getFullYear().toString(),
        });
        await loadDashboardData();
      } else {
        console.error('Error adding creator:', data.error);
        alert(data.error || 'Failed to add creator');
      }
    } catch (error) {
      console.error('Error adding creator:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle stat card click - switches to Creators tab with filter applied
  const handleStatCardClick = (filter: string | null) => {
    setActiveStatFilter(filter);
    setActiveTab('creators');
  };

  // Handle pipeline phase click
  const handlePhaseClick = (phase: string) => {
    setFilterPhase(phase);
    setActiveStatFilter(null);
    setActiveTab('creators');
  };

  // Handle content path click
  const handlePathClick = (path: string) => {
    setFilterPath(path);
    setActiveStatFilter(null);
    setActiveTab('creators');
  };

  // Toast state
  const { toast, showToast, hideToast } = useToast();

  // Copy button states for "Copied!" feedback
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  /**
   * Approve, edit-and-approve, or reject one of Anne Marie's draft notes.
   *
   * Approving publishes the note and emails the creator. Only drop the note
   * from the queue when the server confirms it, and say plainly whether the
   * email went out, since a published note nobody was told about is the exact
   * failure this queue is meant to prevent.
   */
  const handleDraftNoteAction = async (
    note: DraftNote,
    action: DraftNoteAction,
    payload?: DraftNoteActionPayload
  ) => {
    setNoteActionLoading(note.id);
    try {
      const res = await fetch('/api/admin/creator-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note_id: note.id,
          approved_by: adminEmail || 'admin',
          rejected_by: adminEmail || 'admin',
          ...(payload || {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not update this note', 'error');
        return;
      }

      setDraftNotes(prev => prev.filter(n => n.id !== note.id));

      const who = note.creator_name || 'the creator';
      if (action === 'reject') {
        showToast('Draft rejected and the reason recorded');
      } else if (data.scheduled_send_at) {
        showToast(
          `Approved. It sends to ${who} on ${new Date(data.scheduled_send_at).toLocaleString()}`
        );
      } else if (data.emailed) {
        showToast(`Note published and ${who} was emailed`);
      } else {
        showToast(
          `Note published, but the email to ${who} did not send: ${data.email_error || 'unknown error'}. Reach out directly.`,
          'error'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setNoteActionLoading(null);
    }
  };

  /**
   * Save internal documentation against the creator, not the draft, so it is
   * still there after the draft is approved or rejected.
   */
  const handleSaveInternalNote = async (
    note: DraftNote,
    content: string,
    reminderAt: string | null
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/creator-internal-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          creator_id: note.creator_id,
          content,
          reminder_at: reminderAt,
          author: adminEmail || 'TDI Admin',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not save the internal note', 'error');
        return false;
      }

      // Reflect it on the card without a refetch.
      setDraftNotes(prev =>
        prev.map(n => (n.creator_id === note.creator_id ? { ...n, internal_note: data.note } : n))
      );
      showToast(reminderAt ? 'Internal note saved with a reminder' : 'Internal note saved');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
      return false;
    }
  };

  // Copy emails to clipboard helper
  const handleCopyEmails = async (emails: string[], sectionId: string) => {
    if (emails.length === 0) return;
    const emailString = formatEmailsForCopy(emails);
    await copyToClipboard(emailString);
    setCopiedSection(sectionId);
    showToast(`${emails.length} email address${emails.length > 1 ? 'es' : ''} copied to clipboard`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Handle bulk copy for selected creators
  const handleBulkCopy = async () => {
    const selectedEmails = filteredCreators
      .filter(c => selectedCreatorIds.has(c.id))
      .map(c => c.email);
    if (selectedEmails.length === 0) return;
    await handleCopyEmails(selectedEmails, 'bulk');
  };

  // Handle bulk mark followed up
  const [isBulkFollowingUp, setIsBulkFollowingUp] = useState(false);
  const handleBulkFollowUp = async () => {
    if (selectedCreatorIds.size === 0) return;
    setIsBulkFollowingUp(true);
    const selectedIds = Array.from(selectedCreatorIds);
    let successCount = 0;
    for (const creatorId of selectedIds) {
      try {
        const response = await fetch('/api/admin/mark-followed-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorId, adminEmail }),
        });
        const result = await response.json();
        if (result.success) successCount++;
      } catch (error) {
        console.error(`Error following up creator ${creatorId}:`, error);
      }
    }
    setIsBulkFollowingUp(false);
    setSelectedCreatorIds(new Set());
    loadDashboardData();
    showToast(`Marked ${successCount} creator${successCount !== 1 ? 's' : ''} as followed up`);
  };

  // Handle bulk delete for selected creators
  const handleBulkDelete = async () => {
    if (selectedCreatorIds.size === 0) return;
    setIsDeletingBulk(true);

    const selectedIds = Array.from(selectedCreatorIds);
    let successCount = 0;
    let failCount = 0;

    for (const creatorId of selectedIds) {
      try {
        const response = await fetch('/api/admin/delete-creator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorId }),
        });
        const result = await response.json();
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to delete creator ${creatorId}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error deleting creator ${creatorId}:`, error);
      }
    }

    setIsDeletingBulk(false);
    setShowBulkDeleteModal(false);
    setSelectedCreatorIds(new Set());

    // Show result message
    if (failCount === 0) {
      showToast(`Successfully deleted ${successCount} creator${successCount > 1 ? 's' : ''}`);
    } else {
      showToast(`Deleted ${successCount}, failed ${failCount}`);
    }

    // Refresh the data
    loadDashboardData();
  };

  // Get selected creators for modal display
  const getSelectedCreators = () => {
    return filteredCreators.filter(c => selectedCreatorIds.has(c.id));
  };

  // Toggle single creator selection
  const toggleCreatorSelection = (creatorId: string) => {
    setSelectedCreatorIds(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });
  };

  // Toggle all creators selection
  const toggleAllCreators = () => {
    if (selectedCreatorIds.size === filteredCreators.length) {
      setSelectedCreatorIds(new Set());
    } else {
      setSelectedCreatorIds(new Set(filteredCreators.map(c => c.id)));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCreatorIds(new Set());
  };

  // Handle marking a creator as followed up
  const handleMarkFollowedUp = async () => {
    if (!selectedCreatorForFollowUp || !adminEmail) return;

    setIsMarkingFollowUp(true);
    try {
      const response = await fetch('/api/admin/mark-followed-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreatorForFollowUp.id,
          adminEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`${selectedCreatorForFollowUp.name} marked as followed up`);
        await loadDashboardData(); // Refresh data
        setShowFollowUpModal(false);
        setSelectedCreatorForFollowUp(null);
      } else {
        showToast(`Failed to mark as followed up: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error marking as followed up:', error);
      showToast('Error marking as followed up. Please try again.', 'error');
    } finally {
      setIsMarkingFollowUp(false);
    }
  };

  // Open follow-up modal for a creator
  const openFollowUpModal = (creator: { id: string; name: string }) => {
    setSelectedCreatorForFollowUp(creator);
    setShowFollowUpModal(true);
  };

  // Handle syncing milestones for all creators
  const handleSyncMilestones = async () => {
    setIsSyncingMilestones(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/sync-all-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncResult({
          success: true,
          message: result.message || 'Milestones synced successfully',
          creatorsProcessed: result.creators_processed,
          milestonesInserted: result.milestones_inserted,
        });
        showToast(`Synced milestones: ${result.milestones_inserted || 0} added for ${result.creators_processed || 0} creators`);
        await loadDashboardData(); // Refresh data to reflect any changes
      } else {
        setSyncResult({
          success: false,
          message: result.error || 'Failed to sync milestones',
        });
        showToast(`Milestone sync failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error syncing milestones:', error);
      setSyncResult({
        success: false,
        message: 'Network error. Please try again.',
      });
      showToast('Error syncing milestones. Please try again.', 'error');
    } finally {
      setIsSyncingMilestones(false);
    }
  };

  const activeFiltersCount =
    (filterPath !== 'all' ? 1 : 0) +
    (filterPhase !== 'all' ? 1 : 0) +
    (filterWaitingOn !== 'all' ? 1 : 0) +
    (filterPublishStatus !== 'all' ? 1 : 0) +
    (filterReengagement !== 'all' ? 1 : 0);

  // Get path badge styling
  const getPathBadge = (path: string | null) => {
    switch (path) {
      case 'course':
        return { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Course', color: 'bg-slate-100 text-slate-700' };
      case 'blog':
        return { icon: <FileText className="w-3.5 h-3.5" />, label: 'Blog', color: 'bg-slate-100 text-slate-700' };
      case 'download':
        return { icon: <DownloadIcon className="w-3.5 h-3.5" />, label: 'Quick Tool (Download)', color: 'bg-slate-100 text-slate-700' };
      default:
        return { icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'Not set', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Get waiting on badge - uses dot indicators with consistent colors
  const getWaitingOnBadge = (waitingOn: string, isStalled: boolean) => {
    if (isStalled) {
      return {
        dotColor: '#DC2626',
        label: 'Stalled',
        isCheckmark: false,
        bgColor: '#FEE2E2',
        textColor: '#991B1B'
      };
    }
    switch (waitingOn) {
      case 'tdi':
        return {
          dotColor: '#1e2749',
          label: 'TDI',
          isCheckmark: false,
          bgColor: '#DBEAFE',
          textColor: '#1E40AF'
        };
      case 'launched':
        return {
          dotColor: '#ffba06',
          label: 'Live',
          isCheckmark: true,
          bgColor: '#DCFCE7',
          textColor: '#166534'
        };
      case 'followed_up':
        return {
          dotColor: '#1e2749',
          label: 'Followed Up',
          isCheckmark: false,
          bgColor: '#FCE7F3',
          textColor: '#BE185D'
        };
      default:
        return {
          dotColor: '#6B7280',
          label: 'Creator',
          isCheckmark: false,
          bgColor: '#F3F4F6',
          textColor: '#92400E'
        };
    }
  };

  // Access denied view
  if (!hasAccess) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Palette size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="mb-3"
            style={TYPE_PAGE_TITLE}
          >
            Access Restricted
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6B7280',
            }}
          >
            You don&apos;t have permission to access the Creator Studio.
            Contact your administrator to request access.
          </p>
          <Link
            href="/tdi-admin/hub"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme.accent,
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Go to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  // Loading view
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.accent }} />
          <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Loading Creator Studio...
          </p>
        </div>
      </div>
    );
  }

  // Error view
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Failed to load dashboard data.
        </p>
      </div>
    );
  }

  const { stats, phaseCounts, pathCounts, closestToLaunch, recentActivity } = dashboardData;
  const maxPhaseCount = Math.max(...Object.values(phaseCounts), 1);

  // Compute creators needing team attention
  // Include: waitingOn === 'tdi' OR has post_launch_notes (active follow-up work)
  const needsAttention = dashboardData.creators
    .filter((c: EnrichedCreator) => {
      // Exclude published creators -- they belong in "Recently Published", not "Needs Attention"
      if (c.publish_status === 'published') return false;
      if (c.status === 'archived') return false;
      return c.waitingOn === 'tdi' || (c.post_launch_notes && c.post_launch_notes.trim() !== '');
    })
    .sort((a: EnrichedCreator, b: EnrichedCreator) => {
      // Sort post-launch notes items to the end, then by last activity date
      const aHasNotes = a.post_launch_notes && a.post_launch_notes.trim() !== '';
      const bHasNotes = b.post_launch_notes && b.post_launch_notes.trim() !== '';
      const aIsWaitingTDI = a.waitingOn === 'tdi';
      const bIsWaitingTDI = b.waitingOn === 'tdi';

      // TDI waiting items come first
      if (aIsWaitingTDI && !bIsWaitingTDI) return -1;
      if (!aIsWaitingTDI && bIsWaitingTDI) return 1;

      // Within same category, sort by last activity date
      return new Date(a.lastActivityDate).getTime() - new Date(b.lastActivityDate).getTime();
    })
    .slice(0, 8);

  // Count for display - how many need attention
  const needsAttentionCount = dashboardData.creators.filter(
    (c: EnrichedCreator) => {
      if (c.publish_status === 'published') return false;
      if (c.status === 'archived') return false;
      return c.waitingOn === 'tdi' || (c.post_launch_notes && c.post_launch_notes.trim() !== '');
    }
  ).length;

  // Compute priority data for "Today's Priorities" banner
  const now = new Date();
  const pendingReviews = dashboardData.creators.filter((c: EnrichedCreator) => c.waitingOn === 'tdi');
  const pendingReviewsWithWait = pendingReviews.map((c: EnrichedCreator) => {
    const daysWaiting = Math.floor((now.getTime() - new Date(c.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
    return { ...c, daysWaiting };
  }).sort((a, b) => b.daysWaiting - a.daysWaiting);

  const stalledCreators = dashboardData.creators.filter((c: EnrichedCreator) => c.isStalled && c.waitingOn === 'stalled');
  const stalledBySeverity = {
    critical: stalledCreators.filter(c => {
      const days = Math.floor((now.getTime() - new Date(c.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 60;
    }).length,
    serious: stalledCreators.filter(c => {
      const days = Math.floor((now.getTime() - new Date(c.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 30 && days < 60;
    }).length,
    mild: stalledCreators.filter(c => {
      const days = Math.floor((now.getTime() - new Date(c.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 14 && days < 30;
    }).length,
  };

  const followedUpApproachingRestall = dashboardData.creators.filter((c: EnrichedCreator) => {
    if (c.waitingOn !== 'followed_up' || !c.last_followed_up_at) return false;
    const daysSinceFollowUp = Math.floor((now.getTime() - new Date(c.last_followed_up_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceFollowUp >= 11; // 3 days before 14-day re-stall
  });

  // Compute creators that have been followed up
  const followedUpCreators = dashboardData.creators
    .filter((c: EnrichedCreator) => c.waitingOn === 'followed_up')
    .sort((a: EnrichedCreator, b: EnrichedCreator) => {
      // Sort by follow-up date, most recent first
      const aDate = a.last_followed_up_at ? new Date(a.last_followed_up_at) : new Date(0);
      const bDate = b.last_followed_up_at ? new Date(b.last_followed_up_at) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 8);

  // Prepare analytics data
  const phaseChartData = [
    { name: 'Onboarding', count: phaseCounts.onboarding },
    { name: 'Agreement', count: phaseCounts.agreement },
    { name: 'Prep & Resources', count: phaseCounts.course_design },
    { name: 'Production', count: phaseCounts.test_prep },
    { name: 'Launch', count: phaseCounts.launch },
  ];

  const pathChartData = [
    { name: 'Course', value: pathCounts.course, color: theme.accent },
    { name: 'Blog', value: pathCounts.blog, color: '#B8A1D4' },
    { name: 'Quick Tool (Download)', value: pathCounts.download, color: '#D4C1E8' },
    { name: 'Not Set', value: pathCounts.notSet, color: '#E8E0F0' },
  ].filter(d => d.value > 0);

  // Calculate average progress
  const avgProgress = dashboardData.creators.length > 0
    ? Math.round(dashboardData.creators.reduce((sum, c) => sum + c.progressPercentage, 0) / dashboardData.creators.length)
    : 0;

  // Find most active creator this month
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActivityCounts = recentActivity
    .filter(a => new Date(a.completedAt) > thirtyDaysAgo)
    .reduce((acc, a) => {
      acc[a.creatorName] = (acc[a.creatorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const mostActiveCreator = Object.entries(recentActivityCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center gap-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-violet-600 text-slate-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          {/* Title and the one control that creates something. Everything else
              is a destination and belongs on its own line: eight buttons in one
              row squashed each other, wrapping "Who can get in" over three
              lines and pushing Add Creator off the edge. */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <h1 style={TYPE_PAGE_TITLE}>Creator Studio</h1>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-white shadow-sm hover:shadow-md hover:opacity-90 shrink-0 whitespace-nowrap"
                style={{ backgroundColor: '#1e2749' }}
              >
                <Plus className="w-4 h-4" />
                Add Creator
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/tdi-admin/creators/applications"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                waitingApplications > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Applications
              {waitingApplications > 0 && (
                <span className="ml-0.5 px-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold">
                  {waitingApplications}
                </span>
              )}
            </Link>
            <Link
              href="/tdi-admin/creators/access"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Who can get in
            </Link>
            <Link
              href="/tdi-admin/creator-updates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-violet-200 text-violet-600 hover:bg-violet-50 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Updates & Guide
            </Link>
            <Link
              href="/tdi-admin/creator-email-audit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Audit
            </Link>

            <span className="w-px h-5 bg-gray-200 mx-1" aria-hidden />

            {/* The three former tabs. Places you go and come back from, not
                things you switch between while working. */}
            {SIDE_PAGES.map(page => (
              <Link
                key={page.href}
                href={page.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
              >
                <page.icon className="w-3.5 h-3.5" />
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}

      {/* ACTION CENTER TAB (was Dashboard) */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Today's Priorities Banner */}
          {(pendingReviewsWithWait.length > 0 || stalledCreators.length > 0 || followedUpApproachingRestall.length > 0) && (
            <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafbfc' }}>
                <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                  Today&apos;s Priorities
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Pending Reviews */}
                <button
                  onClick={() => handleStatCardClick('waitingOnTDI')}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left w-full"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    pendingReviewsWithWait.length > 0
                      ? pendingReviewsWithWait.some(c => c.daysWaiting >= 5) ? 'bg-red-100' : pendingReviewsWithWait.some(c => c.daysWaiting >= 2) ? 'bg-amber-100' : 'bg-green-100'
                      : 'bg-gray-100'
                  }`}>
                    <FileText className={`w-4.5 h-4.5 ${
                      pendingReviewsWithWait.length > 0
                        ? pendingReviewsWithWait.some(c => c.daysWaiting >= 5) ? 'text-red-600' : pendingReviewsWithWait.some(c => c.daysWaiting >= 2) ? 'text-amber-600' : 'text-green-600'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>{pendingReviewsWithWait.length}</span>
                      <span className="text-sm text-gray-500">pending review{pendingReviewsWithWait.length !== 1 ? 's' : ''}</span>
                    </div>
                    {pendingReviewsWithWait.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {pendingReviewsWithWait.slice(0, 3).map(c => (
                          <p key={c.id} className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              c.daysWaiting >= 5 ? 'bg-red-500' : c.daysWaiting >= 2 ? 'bg-amber-500' : 'bg-green-500'
                            }`} />
                            {c.name}
                            <span className={`font-medium ${
                              c.daysWaiting >= 5 ? 'text-red-600' : c.daysWaiting >= 2 ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {c.daysWaiting}d
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </button>

                {/* Stalled Creators — auto-managed by re-engagement */}
                <button
                  onClick={() => handleStatCardClick('stalled')}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left w-full"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    stalledCreators.length > 0 ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Mail className={`w-4.5 h-4.5 ${
                      stalledCreators.length > 0 ? 'text-amber-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>{stalledCreators.length}</span>
                      <span className="text-sm text-gray-500">in re-engagement</span>
                    </div>
                    {stalledCreators.length > 0 ? (
                      <p className="mt-1 text-xs text-amber-600 font-medium">
                        Auto-emails active. Reply to Bella if they respond.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">
                        No stalled creators
                      </p>
                    )}
                  </div>
                </button>

                {/* Follow-up Check-ins */}
                <button
                  onClick={() => handleStatCardClick('followedUp')}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left w-full"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    followedUpApproachingRestall.length > 0 ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <UserCheck className={`w-4.5 h-4.5 ${
                      followedUpApproachingRestall.length > 0 ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>{followedUpApproachingRestall.length}</span>
                      <span className="text-sm text-gray-500">re-stalling soon</span>
                    </div>
                    {followedUpApproachingRestall.length > 0 && (
                      <p className="mt-1 text-xs text-orange-600 font-medium">
                        Followed up but no creator activity. Check in again.
                      </p>
                    )}
                    {followedUpApproachingRestall.length === 0 && stats.followedUp > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        {stats.followedUp} followed up, all within window
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* New Submissions -- creators submitted work, waiting for review */}
          {newSubmissions.length > 0 && (
            <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fafbfc' }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                    New Submissions
                  </h2>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2563EB' }}>
                    {newSubmissions.length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Waiting for review. Write feedback or wait for Anne Marie.</span>
              </div>
              <div className="divide-y divide-gray-100">
                {newSubmissions.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/tdi-admin/creators/${item.creator_id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>{item.creator_name}</span>
                          <span className="text-xs text-gray-400">v{item.submission_version}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">New</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{item.milestone_title}</p>
                        {item.submitted_value && (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 line-clamp-2">
                            <span className="font-medium text-gray-500">Submitted: </span>
                            {item.submitted_value.length > 120 ? item.submitted_value.substring(0, 120) + '...' : item.submitted_value}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap flex-shrink-0">View &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Review Queue */}
          {feedbackQueue.length > 0 && (
            <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fafbfc' }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                    Feedback Review Queue
                  </h2>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#8B5CF6' }}>
                    {feedbackQueue.length}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {feedbackQueue.map((item: any) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>{item.creator_name}</span>
                          <span className="text-xs text-gray-400">v{item.submission_version}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{item.milestone_title}</p>
                        {item.submitted_value && (
                          <div className="mb-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 line-clamp-2">
                            <span className="font-medium text-gray-500">Submitted: </span>
                            {item.submitted_value.length > 120 ? item.submitted_value.substring(0, 120) + '...' : item.submitted_value}
                          </div>
                        )}
                        {editingFeedbackId === item.id ? (
                          <div className="mb-2">
                            <textarea
                              value={editedFeedbackContent}
                              onChange={(e) => setEditedFeedbackContent(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                              rows={4}
                              placeholder="Edit feedback before approving..."
                            />
                          </div>
                        ) : (
                          <div className="px-3 py-2 bg-violet-50 rounded-lg text-xs text-gray-700 line-clamp-3">
                            <span className="font-medium text-violet-600">Anne Marie&apos;s draft: </span>
                            {item.feedback_content}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {editingFeedbackId === item.id ? (
                          <>
                            <button
                              onClick={async () => {
                                setFeedbackActionLoading(item.id);
                                try {
                                  await fetch('/api/admin/creator-feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'approve',
                                      feedback_id: item.id,
                                      approved_by: adminEmail || 'admin',
                                      edited_content: editedFeedbackContent,
                                    }),
                                  });
                                  setFeedbackQueue(prev => prev.filter(f => f.id !== item.id));
                                  setEditingFeedbackId(null);
                                } catch (err) {
                                  console.error('Error approving feedback:', err);
                                } finally {
                                  setFeedbackActionLoading(null);
                                }
                              }}
                              disabled={feedbackActionLoading === item.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                              style={{ backgroundColor: '#16a34a' }}
                            >
                              {feedbackActionLoading === item.id ? 'Saving...' : 'Save & Approve'}
                            </button>
                            <button
                              onClick={() => { setEditingFeedbackId(null); setEditedFeedbackContent(''); }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={async () => {
                                setFeedbackActionLoading(item.id);
                                try {
                                  await fetch('/api/admin/creator-feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'approve',
                                      feedback_id: item.id,
                                      approved_by: adminEmail || 'admin',
                                    }),
                                  });
                                  setFeedbackQueue(prev => prev.filter(f => f.id !== item.id));
                                } catch (err) {
                                  console.error('Error approving feedback:', err);
                                } finally {
                                  setFeedbackActionLoading(null);
                                }
                              }}
                              disabled={feedbackActionLoading === item.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                              style={{ backgroundColor: '#16a34a' }}
                            >
                              {feedbackActionLoading === item.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingFeedbackId(item.id);
                                setEditedFeedbackContent(item.feedback_content || '');
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                            >
                              Edit & Approve
                            </button>
                            <button
                              onClick={async () => {
                                setFeedbackActionLoading(item.id);
                                try {
                                  await fetch('/api/admin/creator-feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'reject',
                                      feedback_id: item.id,
                                      reason: 'Rejected by admin',
                                    }),
                                  });
                                  setFeedbackQueue(prev => prev.filter(f => f.id !== item.id));
                                } catch (err) {
                                  console.error('Error rejecting feedback:', err);
                                } finally {
                                  setFeedbackActionLoading(null);
                                }
                              }}
                              disabled={feedbackActionLoading === item.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draft Notes Queue (Anne Marie check-in notes for Bella) */}
          {draftNotes.length > 0 && (
            <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fafbfc' }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                    Check-in Notes to Review
                  </h2>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2563EB' }}>
                    {draftNotes.length}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {draftNotes.map((note: any) => (
                  <DraftNoteCard
                    key={note.id}
                    note={note}
                    loading={noteActionLoading === note.id}
                    onAction={handleDraftNoteAction}
                    onSaveInternalNote={handleSaveInternalNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Needs Your Attention */}
          {needsAttention.length > 0 && (
            <div
              className="mb-5 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-l-4"
              style={{ borderLeftColor: '#6B7280' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={TYPE_CARD_TITLE}>
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  Needs Your Attention
                  {needsAttentionCount > 0 && (
                    <span className="text-xs font-normal text-gray-500">({needsAttentionCount})</span>
                  )}
                </h3>
                <button
                  onClick={() => handleCopyEmails(needsAttention.map(c => c.email), 'needsAttention')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    copiedSection === 'needsAttention'
                      ? 'bg-green-50 text-yellow-600 border border-green-200'
                      : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {copiedSection === 'needsAttention' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Emails
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {needsAttention.map((creator: EnrichedCreator) => {
                  const hasPostLaunchNotes = creator.post_launch_notes && creator.post_launch_notes.trim() !== '';
                  const isWaitingOnTDI = creator.waitingOn === 'tdi';

                  return (
                    <Link
                      key={creator.id}
                      href={`/tdi-admin/creators/${creator.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          hasPostLaunchNotes && !isWaitingOnTDI ? 'bg-yellow-500' : ''
                        }`}
                        style={{ backgroundColor: hasPostLaunchNotes && !isWaitingOnTDI ? undefined : theme.accent }}
                      >
                        {hasPostLaunchNotes && !isWaitingOnTDI ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          creator.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate group-hover:text-slate-700"
                          style={{ color: '#2B3A67' }}
                        >
                          {creator.name}
                        </p>
                        {hasPostLaunchNotes ? (
                          <p className="text-xs text-gray-700 truncate flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            {creator.post_launch_notes}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 truncate">
                            {creator.currentMilestoneName || 'Waiting on review'}
                          </p>
                        )}
                      </div>
                      {hasPostLaunchNotes && !isWaitingOnTDI ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
                          Published
                        </span>
                      ) : (() => {
                        const daysWaiting = Math.floor((now.getTime() - new Date(creator.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
                        const slaColor = daysWaiting >= 5 ? 'bg-red-100 text-red-700' : daysWaiting >= 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
                        return (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${slaColor}`}>
                            {daysWaiting}d waiting
                          </span>
                        );
                      })()}
                    </Link>
                  );
                })}
                {needsAttentionCount > 8 && (
                  <button
                    onClick={() => handleStatCardClick('waitingOnTDI')}
                    className="w-full text-center text-xs pt-1"
                    style={{ color: theme.accent }}
                  >
                    View all {needsAttentionCount} items →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recruitment Candidates Awaiting Outreach Approval */}
          {pendingRecruitment.length > 0 && (
            <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#fafbfc' }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                    Recruitment: Outreach Ready
                  </h2>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#059669' }}>
                    {pendingRecruitment.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-tab="recruitment"]') as HTMLElement;
                    if (el) el.click();
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  View in Recruitment tab &rarr;
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingRecruitment.slice(0, 5).map((candidate: any) => (
                  <div key={candidate.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>{candidate.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                            background: candidate.source === 'hub_user' ? '#DBEAFE' : candidate.source === 'social_media' ? '#FCE7F3' : candidate.source === 'substack' ? '#FEF3C7' : candidate.source === 'sales_nomination' ? '#D1FAE5' : '#F3F4F6',
                            color: candidate.source === 'hub_user' ? '#1E40AF' : candidate.source === 'social_media' ? '#9D174D' : candidate.source === 'substack' ? '#92400E' : candidate.source === 'sales_nomination' ? '#065F46' : '#374151',
                          }}>
                            {(candidate.source || '').replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{
                            background: candidate.content_path === 'course' ? '#DBEAFE' : candidate.content_path === 'download' ? '#D1FAE5' : '#FEF3C7',
                            color: candidate.content_path === 'course' ? '#1E40AF' : candidate.content_path === 'download' ? '#065F46' : '#92400E',
                          }}>
                            {candidate.content_path || 'TBD'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{candidate.expertise_area}</p>
                      </div>
                      {candidate.gap_category && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{candidate.gap_category}</span>
                      )}
                    </div>
                    {candidate.outreach_draft && (
                      <div className="mb-3 px-3 py-2 bg-amber-50 rounded-lg text-xs text-gray-700 border border-amber-100">
                        <span className="font-medium text-amber-700">Draft outreach: </span>
                        {candidate.outreach_draft.length > 150 ? candidate.outreach_draft.substring(0, 150) + '...' : candidate.outreach_draft}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            if (candidate.outreach_draft) {
                              navigator.clipboard.writeText(candidate.outreach_draft);
                            }
                            await fetch('/api/admin/creator-recruitment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'approve_outreach', candidate_id: candidate.id, approved_by: adminEmail }),
                            });
                            setPendingRecruitment(prev => prev.filter(c => c.id !== candidate.id));
                            if (candidate.email) {
                              const mailtoUrl = `mailto:${candidate.email}?subject=Quick question about creating with TDI&body=${encodeURIComponent(candidate.outreach_draft || '')}`;
                              window.open(mailtoUrl);
                              showToast('Outreach approved and copied. Send via email.', 'success');
                            } else if (candidate.social_url) {
                              window.open(candidate.social_url, '_blank');
                              showToast('Outreach approved and copied. Send via social DM.', 'success');
                            } else {
                              showToast('Outreach approved and copied to clipboard.', 'success');
                            }
                          } catch {}
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#059669' }}
                      >
                        Approve Outreach
                      </button>
                      <button
                        onClick={() => {
                          const el = document.querySelector('[data-tab="recruitment"]') as HTMLElement;
                          if (el) el.click();
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit & Approve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/admin/creator-recruitment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'dismiss', candidate_id: candidate.id }),
                            });
                            setPendingRecruitment(prev => prev.filter(c => c.id !== candidate.id));
                          } catch {}
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calm State -- shown when no submissions, feedback, or recruitment to act on. Provides context. */}
          {newSubmissions.length === 0 && feedbackQueue.length === 0 && draftNotes.length === 0 && needsAttention.length === 0 && pendingRecruitment.length === 0 && (
            <>
              {/* All caught up + quick pulse */}
              <div className="mb-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 flex items-center gap-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                      All caught up
                    </p>
                    <p className="text-sm text-gray-400">No submissions, feedback, or action items waiting.</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 divide-x divide-gray-100">
                  {[
                    { label: 'Active', value: stats.total - (dashboardData.creators.filter((c: EnrichedCreator) => c.lifecycle_state === 'paused').length), color: '#1e2749' },
                    { label: 'In Progress', value: stats.total - stats.stalled - (dashboardData.creators.filter((c: EnrichedCreator) => c.publish_status === 'published' || c.lifecycle_state === 'paused').length), color: '#2563EB' },
                    { label: 'Stalled (14d+)', value: stats.stalled, color: stats.stalled > 10 ? '#DC2626' : '#D97706' },
                    { label: 'Published', value: dashboardData.creators.filter((c: EnrichedCreator) => c.publish_status === 'published').length, color: '#059669' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 text-center">
                      <p className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closest to Launch + Recently Active side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Closest to Launch */}
                {closestToLaunch.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 15, fontWeight: 700, color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Closest to Launch
                    </h3>
                    <div className="space-y-3">
                      {closestToLaunch.slice(0, 5).map((creator) => (
                        <Link
                          key={creator.id}
                          href={`/tdi-admin/creators/${creator.id}`}
                          className="flex items-center gap-3 group hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                        >
                          <div
                            className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)` }}
                          >
                            {creator.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 group-hover:text-yellow-600 transition-colors">
                              {creator.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${creator.progressPercentage}%`,
                                  background: creator.progressPercentage >= 90 ? '#F59E0B' : creator.progressPercentage >= 60 ? '#1e2749' : '#6B7280',
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium" style={{ color: creator.progressPercentage >= 90 ? '#F59E0B' : '#6B7280' }}>
                              {creator.progressPercentage >= 90 && <Check className="w-3 h-3 inline mr-0.5" />}
                              {creator.progressPercentage}%
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Active */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 15, fontWeight: 700, color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recently Active
                  </h3>
                  {(() => {
                    const recentlyActive = dashboardData.creators
                      .filter((c: EnrichedCreator) => c.status !== 'archived' && c.publish_status !== 'published' && c.lifecycle_state !== 'paused')
                      .sort((a: EnrichedCreator, b: EnrichedCreator) => new Date(b.lastActivityDate || 0).getTime() - new Date(a.lastActivityDate || 0).getTime())
                      .slice(0, 5);

                    return recentlyActive.length === 0 ? (
                      <p className="text-sm text-gray-400">No recent creator activity</p>
                    ) : (
                      <div className="space-y-3">
                        {recentlyActive.map((creator: EnrichedCreator) => {
                          const daysAgo = Math.floor((Date.now() - new Date(creator.lastActivityDate || 0).getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <Link
                              key={creator.id}
                              href={`/tdi-admin/creators/${creator.id}`}
                              className="flex items-center gap-3 group hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                            >
                              <div
                                className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 shadow-sm"
                                style={{ background: daysAgo <= 14 ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : 'linear-gradient(135deg, #6B7280, #9CA3AF)' }}
                              >
                                {creator.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {creator.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{creator.current_phase || 'Onboarding'} &middot; {creator.content_path || 'Path not set'}</p>
                              </div>
                              <span className={`text-xs font-medium flex-shrink-0 ${daysAgo <= 7 ? 'text-green-600' : daysAgo <= 14 ? 'text-blue-600' : daysAgo <= 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                                {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CREATORS TAB */}
      {activeTab === 'creators' && (
        <>
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Search and Filters Bar */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or course title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-slate-50 text-slate-700 border border-purple-200'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e2749' }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Content Path</label>
                  <select
                    value={filterPath}
                    onChange={(e) => setFilterPath(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All Paths</option>
                    <option value="blog">Blog</option>
                    <option value="download">Quick Tool (Download)</option>
                    <option value="course">Course</option>
                    <option value="notSet">Not Set</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phase</label>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All Phases</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="agreement">Agreement</option>
                    <option value="course_design">Prep & Resources</option>
                    <option value="test_prep">Production</option>
                    <option value="launch">Launch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Waiting On</label>
                  <select
                    value={filterWaitingOn}
                    onChange={(e) => setFilterWaitingOn(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All</option>
                    <option value="creator">Creator</option>
                    <option value="tdi">TDI</option>
                    <option value="stalled">Stalled</option>
                    <option value="followed_up">Followed Up</option>
                    <option value="launched">Launched</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Publish Status</label>
                  <select
                    value={filterPublishStatus}
                    onChange={(e) => setFilterPublishStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Re-engagement</label>
                  <select
                    value={filterReengagement}
                    onChange={(e) => setFilterReengagement(e.target.value as ReengagementFilter)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white"
                  >
                    {REENGAGEMENT_FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                {(activeFiltersCount > 0 || activeStatFilter) && (
                  <button
                    onClick={() => {
                      setFilterPath('all');
                      setFilterPhase('all');
                      setFilterWaitingOn('all');
                      setFilterPublishStatus('all');
                      setFilterReengagement('all');
                      setActiveStatFilter(null);
                    }}
                    className="self-end px-3 py-2 text-sm text-gray-500 hover:text-slate-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
                {/* Show Archived Toggle */}
                <label className="flex items-center gap-2 self-end cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-slate-700 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">
                    Show Archived {dashboardData?.stats.archived ? `(${dashboardData.stats.archived})` : ''}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Active stat filter indicator */}
          {activeStatFilter && (
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-slate-50">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="text-sm font-semibold capitalize text-slate-700">
                {activeStatFilter === 'waitingOnCreator' ? 'Waiting on Creator' :
                 activeStatFilter === 'waitingOnTDI' ? 'Waiting on TDI' :
                 activeStatFilter === 'followedUp' ? 'Followed Up' :
                 activeStatFilter}
              </span>
              <button
                onClick={() => setActiveStatFilter(null)}
                className="text-gray-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Creator Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedCreatorIds.size === filteredCreators.length && filteredCreators.length > 0}
                      onChange={toggleAllCreators}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: theme.accent }}
                    />
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Creator
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Path
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Phase
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Target Launch
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">
                    Current Milestone
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    <button
                      onClick={() => {
                        if (sortBy === 'progress') {
                          setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortBy('progress');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Progress
                      {sortBy === 'progress' && (
                        sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Waiting On
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    <button
                      onClick={() => {
                        if (sortBy === 'lastActive') {
                          setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortBy('lastActive');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Last Active
                      {sortBy === 'lastActive' && (
                        sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-10">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery || activeFiltersCount > 0 || activeStatFilter
                        ? 'No creators found matching your criteria.'
                        : 'No creators yet. Add your first creator to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredCreators.map((creator) => {
                    const pathBadge = getPathBadge(creator.content_path);
                    const waitingBadge = getWaitingOnBadge(creator.waitingOn, creator.isStalled);
                    const daysSinceActive = getDaysSince(creator.lastActivityDate);
                    const isInactive = daysSinceActive >= 14 && creator.progressPercentage < 100;
                    const isSelected = selectedCreatorIds.has(creator.id);

                    return (
                      <tr
                        key={creator.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          creator.isStalled ? 'border-l-4 border-l-slate-700 bg-slate-50/50' : ''
                        } ${isSelected ? 'bg-slate-50' : ''}`}
                        onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCreatorSelection(creator.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                            style={{ accentColor: theme.accent }}
                          />
                        </td>
                        {/* Creator */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const topicConfig = getTopicConfig(creator.topic);
                              const TopicIcon = TOPIC_ICON_MAP[topicConfig.icon] || Sparkles;
                              const isComplete = creator.progressPercentage === 100;
                              return (
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: isComplete ? '#22c55e' : topicConfig.background,
                                    border: isComplete ? 'none' : `1.5px solid ${topicConfig.border}`,
                                  }}
                                  title={creator.topic || 'No topic chosen yet'}
                                >
                                  {isComplete ? (
                                    <span className="text-white font-medium">{creator.name.charAt(0).toUpperCase()}</span>
                                  ) : (
                                    <TopicIcon style={{ width: 18, height: 18, color: topicConfig.iconColor }} />
                                  )}
                                </div>
                              );
                            })()}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="font-medium truncate" style={{ color: '#2B3A67' }}>
                                  {creator.name}
                                </p>
                                {creator.reengagement && (
                                  <span
                                    className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                      creator.reengagement.facingPause
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                    title={`Re-engagement step ${creator.reengagement.currentStep} of 6. Next email due ${new Date(creator.reengagement.nextEmailDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}
                                  >
                                    {creator.reengagement.facingPause
                                      ? 'Facing pause'
                                      : `Step ${creator.reengagement.currentStep}`}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {creator.topic || creator.course_title || creator.email}
                              </p>
                              {/* Why this creator reads as stalled. Without it, a row in a
                                  sequence is a mystery, which is how the wrong 19 people
                                  went unnoticed for a month. */}
                              {creator.isStalled && creator.activity && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  {creator.activity.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Path */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${pathBadge.color}`}>
                            {pathBadge.icon}
                            {pathBadge.label}
                          </span>
                        </td>

                        {/* Phase */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-700">
                            {phaseDisplayNames[creator.current_phase] || creator.current_phase}
                          </span>
                        </td>

                        {/* Target Launch */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">
                            {creator.target_publish_month || '-'}
                          </span>
                        </td>

                        {/* Current Milestone */}
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                            {creator.currentMilestoneName || (creator.progressPercentage === 100 ? 'All complete' : '-')}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${creator.progressPercentage}%`,
                                    backgroundColor: creator.progressPercentage === 100 ? '#22c55e' : theme.accent
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium w-10" style={{ color: '#2B3A67' }}>
                                {creator.progressPercentage}%
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Waiting On */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: waitingBadge.bgColor,
                              color: waitingBadge.textColor,
                            }}
                          >
                            {waitingBadge.isCheckmark ? (
                              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#ffba06" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            ) : (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: waitingBadge.dotColor }}
                              />
                            )}
                            {waitingBadge.label}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-3">
                          <span className={`text-sm flex items-center gap-1 ${
                            isInactive ? 'text-gray-700 font-medium' : 'text-gray-600'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {getRelativeTime(creator.lastActivityDate)}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickActionCreatorId(quickActionCreatorId === creator.id ? null : creator.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {quickActionCreatorId === creator.id && (
                              <div className="absolute right-0 top-8 z-50 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                  View Profile
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(creator.email);
                                    setQuickActionCreatorId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                >
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                  Copy Email
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                {creator.isStalled && (
                                  <button
                                    onClick={() => handleQuickAction('mark-engaged', creator.id)}
                                    disabled={quickActionLoading === 'mark-engaged'}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                  >
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                    {quickActionLoading === 'mark-engaged' ? 'Marking...' : 'Mark as Engaged'}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleQuickAction('pause', creator.id)}
                                  disabled={quickActionLoading === 'pause'}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  {quickActionLoading === 'pause' ? 'Pausing...' : 'Pause Account'}
                                </button>
                                <button
                                  onClick={() => handleQuickAction('resend-welcome', creator.id)}
                                  disabled={quickActionLoading === 'resend-welcome'}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                                  {quickActionLoading === 'resend-welcome' ? 'Sending...' : 'Resend Welcome'}
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                <a
                                  href={`mailto:${creator.email}`}
                                  onClick={() => setQuickActionCreatorId(null)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                >
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  Email Creator
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
            Showing {filteredCreators.length} of {dashboardData.creators.length} creators
          </div>
        </div>

        {/* Floating Action Bar for Bulk Actions */}
        {selectedCreatorIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-50 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-700">
              {selectedCreatorIds.size} creator{selectedCreatorIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-white shadow-sm hover:shadow-md hover:opacity-90"
              style={{ backgroundColor: '#1e2749' }}
            >
              {copiedSection === 'bulk' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Emails
                </>
              )}
            </button>
            <button
              onClick={handleBulkFollowUp}
              disabled={isBulkFollowingUp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-green-200 text-gray-700 hover:bg-green-50 disabled:opacity-50"
            >
              {isBulkFollowingUp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              Mark Followed Up
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-red-200 text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      )}



      {/* Add Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Creator
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCreator} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCreator.name}
                  onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newCreator.email}
                  onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Course Title
                </label>
                <input
                  type="text"
                  value={newCreator.course_title}
                  onChange={(e) => setNewCreator({ ...newCreator, course_title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={newCreator.course_audience}
                  onChange={(e) => setNewCreator({ ...newCreator, course_audience: e.target.value })}
                  placeholder="e.g., Elementary teachers, K-12 paras"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Target Launch Date
                </label>
                <div className="flex gap-2">
                  <select
                    value={newCreator.target_publish_month}
                    onChange={(e) => setNewCreator({ ...newCreator, target_publish_month: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  >
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <select
                    value={newCreator.target_launch_year}
                    onChange={(e) => setNewCreator({ ...newCreator, target_launch_year: e.target.value })}
                    className="w-28 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  >
                    {[0, 1, 2, 3].map(offset => {
                      const year = new Date().getFullYear() + offset;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white shadow-sm hover:shadow-md hover:opacity-90"
                  style={{ backgroundColor: '#1e2749' }}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Creator'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up confirmation modal */}
      {showFollowUpModal && selectedCreatorForFollowUp && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FCE7F3' }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#1e2749' }} />
                </div>
                <h2 style={TYPE_CARD_TITLE}>Mark as Followed Up</h2>
              </div>
              <button
                onClick={() => {
                  setShowFollowUpModal(false);
                  setSelectedCreatorForFollowUp(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Confirm you&apos;ve reached out to <strong>{selectedCreatorForFollowUp.name}</strong>?
                This will move them to &quot;Followed Up&quot; status.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                They will return to &quot;Stalled&quot; if 14 days pass with no activity, or move back to
                &quot;Active&quot; when they complete a milestone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFollowUpModal(false);
                    setSelectedCreatorForFollowUp(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkFollowedUp}
                  disabled={isMarkingFollowUp}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: '#1e2749' }}
                >
                  {isMarkingFollowUp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Follow-up
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete {selectedCreatorIds.size} Creator{selectedCreatorIds.size > 1 ? 's' : ''}</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-gray-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-800">
                  You are about to permanently delete {selectedCreatorIds.size} creator{selectedCreatorIds.size > 1 ? 's' : ''} and all their associated data.
                </p>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-2">Creators to be deleted:</p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {getSelectedCreators().map(creator => (
                  <li key={creator.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="font-medium">{creator.name}</span>
                    <span className="text-gray-400">({creator.email})</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                This will delete all milestone progress, notes, projects, and submission data for these creators.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeletingBulk}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingBulk ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ NEEDS YOU ═══════ */}
      {activeTab === 'queue' && <CreatorQueue />}

      {/* ═══════ RECRUITMENT TAB ═══════ */}
      {activeTab === 'recruitment' && (
        <RecruitmentTab hasAccess={hasAccess} showToast={showToast} adminEmail={adminEmail} />
      )}
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      </div>
    </div>
  );
}
