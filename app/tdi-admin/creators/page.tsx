'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
import { createCreator } from '@/lib/creator-portal-data';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { copyToClipboard, formatEmailsForCopy } from '@/lib/tdi-admin/clipboard';
import { Toast, useToast } from '@/components/tdi-admin/Toast';
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

// Creators theme colors
const theme = PORTAL_THEMES.creators;

// Dynamic import for map to avoid SSR issues
const USMapChart = dynamic(() => import('@/components/tdi-admin/USMapChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.primary }} />
    </div>
  ),
});

// Tab types
type TabId = 'dashboard' | 'creators' | 'analytics' | 'payouts';

// Tab configuration
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'payouts', label: 'Payouts', icon: DollarSign },
];

// Types
interface EnrichedCreator {
  id: string;
  name: string;
  email: string;
  course_title: string | null;
  course_audience: string | null;
  content_path: string | null;
  current_phase: string;
  target_launch_month: string | null;
  created_at: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  lastActivityDate: string;
  currentMilestoneName: string | null;
  requiresTeamAction: boolean;
  waitingOn: 'creator' | 'tdi' | 'stalled' | 'launched';
  isStalled: boolean;
  // Publish workflow fields
  publish_status: 'in_progress' | 'scheduled' | 'published';
  scheduled_publish_date: string | null;
  published_date: string | null;
  // Archive and post-launch fields
  status: 'active' | 'archived';
  post_launch_notes: string | null;
  previous_project_id: string | null;
  progress?: {
    coreTotal: number;
    coreCompleted: number;
    corePercent: number;
    bonusTotal: number;
    bonusCompleted: number;
    bonusAvailable: number;
    isComplete: boolean;
  };
}

interface DashboardData {
  creators: EnrichedCreator[];
  stats: {
    total: number;
    stalled: number;
    waitingOnCreator: number;
    waitingOnTDI: number;
    launched: number;
    archived: number;
  };
  phaseCounts: {
    onboarding: number;
    agreement: number;
    course_design: number;
    test_prep: number;
    launch: number;
  };
  pathCounts: {
    blog: number;
    download: number;
    course: number;
    notSet: number;
  };
  closestToLaunch: {
    id: string;
    name: string;
    course_title: string | null;
    progressPercentage: number;
  }[];
  recentActivity: {
    id: string;
    creatorId: string;
    creatorName: string;
    milestoneName: string;
    completedAt: string;
    type: 'creator' | 'team' | 'new';
  }[];
  topics: {
    id: string;
    title: string;
    phase: string;
  }[];
}

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
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
}

// Get days since date
function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// Sidebar Navigation Item Component
function SidebarNavItem({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={active ? 'text-indigo-600' : 'text-gray-400'} />
      <span className={active ? 'font-semibold' : ''}>{children}</span>
    </button>
  );
}

// Modern Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  isActive,
  onClick,
  accentColor,
  lightColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  accentColor?: string;
  lightColor?: string;
}) {
  const accent = accentColor || '#6366F1';
  const light = lightColor || '#F8F9FA';

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl p-5 text-left cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: light,
        borderLeft: `3px solid ${accent}`,
        boxShadow: isActive
          ? `0 4px 12px ${accent}25, 0 1px 3px rgba(0,0,0,0.08)`
          : '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-3xl font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{ color: accent }}
          >
            {value}
          </p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: accent }} />
        </div>
      </div>
    </button>
  );
}

export default function CreatorStudioPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [showFilters, setShowFilters] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState<'lastActive' | 'progress' | 'name'>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state for bulk email
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<Set<string>>(new Set());

  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    course_title: '',
    course_audience: '',
    target_launch_month: '',
  });

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
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
    } else {
      setIsLoading(false);
    }
  }, [hasAccess, loadDashboardData]);

  // Load analytics data when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData && !analyticsLoading) {
      setAnalyticsLoading(true);
      fetch('/api/admin/analytics')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAnalyticsData(data);
          }
        })
        .catch(err => console.error('Failed to load analytics data:', err))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab, analyticsData, analyticsLoading]);

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
  }, [searchQuery, dashboardData, filterPath, filterPhase, filterWaitingOn, filterPublishStatus, activeStatFilter, sortBy, sortOrder]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const creator = await createCreator(newCreator);
      if (creator) {
        setShowAddModal(false);
        setNewCreator({
          name: '',
          email: '',
          course_title: '',
          course_audience: '',
          target_launch_month: '',
        });
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error adding creator:', error);
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

  const activeFiltersCount =
    (filterPath !== 'all' ? 1 : 0) +
    (filterPhase !== 'all' ? 1 : 0) +
    (filterWaitingOn !== 'all' ? 1 : 0) +
    (filterPublishStatus !== 'all' ? 1 : 0);

  // Get path badge styling
  const getPathBadge = (path: string | null) => {
    switch (path) {
      case 'course':
        return { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Course', color: 'bg-purple-100 text-purple-700' };
      case 'blog':
        return { icon: <FileText className="w-3.5 h-3.5" />, label: 'Blog', color: 'bg-purple-100 text-purple-700' };
      case 'download':
        return { icon: <DownloadIcon className="w-3.5 h-3.5" />, label: 'Download', color: 'bg-purple-100 text-purple-700' };
      default:
        return { icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'Not set', color: 'bg-orange-100 text-orange-600' };
    }
  };

  // Get waiting on badge
  const getWaitingOnBadge = (waitingOn: string, isStalled: boolean) => {
    if (isStalled) {
      return { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Stalled', color: 'bg-red-100 text-red-700' };
    }
    switch (waitingOn) {
      case 'tdi':
        return { icon: <Bell className="w-3.5 h-3.5" />, label: 'TDI', color: 'bg-blue-100 text-blue-700' };
      case 'launched':
        return { icon: <Rocket className="w-3.5 h-3.5" />, label: 'Launched', color: 'bg-green-100 text-green-700' };
      default:
        return { icon: <Hourglass className="w-3.5 h-3.5" />, label: 'Creator', color: 'bg-amber-100 text-amber-700' };
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
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
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
              backgroundColor: theme.primary,
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.primary }} />
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
    .filter((c: EnrichedCreator) => c.waitingOn === 'tdi' || (c.post_launch_notes && c.post_launch_notes.trim() !== ''))
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
    (c: EnrichedCreator) => c.waitingOn === 'tdi' || (c.post_launch_notes && c.post_launch_notes.trim() !== '')
  ).length;

  // Prepare analytics data
  const phaseChartData = [
    { name: 'Onboarding', count: phaseCounts.onboarding },
    { name: 'Agreement', count: phaseCounts.agreement },
    { name: 'Prep & Resources', count: phaseCounts.course_design },
    { name: 'Production', count: phaseCounts.test_prep },
    { name: 'Launch', count: phaseCounts.launch },
  ];

  const pathChartData = [
    { name: 'Course', value: pathCounts.course, color: theme.primary },
    { name: 'Blog', value: pathCounts.blog, color: '#B8A1D4' },
    { name: 'Download', value: pathCounts.download, color: '#D4C1E8' },
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
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ boxShadow: '1px 0 3px rgba(0,0,0,0.03)' }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Creator Studio</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {TABS.map((tab) => (
              <SidebarNavItem
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                icon={tab.icon}
              >
                {tab.label}
              </SidebarNavItem>
            ))}
          </nav>

          {/* Sidebar Footer - User */}
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                RH
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Rae Hughart</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Creator Command Center
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pipeline overview and creator management
                </p>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Creator
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="px-6 py-6">
          {/* TAB CONTENT */}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard
              icon={Users}
              label="Total"
              value={stats.total}
              isActive={false}
              onClick={() => handleStatCardClick(null)}
            />
            <StatCard
              icon={AlertTriangle}
              label="Stalled (14+ days)"
              value={stats.stalled}
              isActive={activeStatFilter === 'stalled'}
              onClick={() => handleStatCardClick('stalled')}
              accentColor="#F97316"
              lightColor="#FFF7ED"
            />
            <StatCard
              icon={Hourglass}
              label="Waiting on Creator"
              value={stats.waitingOnCreator}
              isActive={activeStatFilter === 'waitingOnCreator'}
              onClick={() => handleStatCardClick('waitingOnCreator')}
              accentColor="#F59E0B"
              lightColor="#FFFBEB"
            />
            <StatCard
              icon={Bell}
              label="Waiting on TDI"
              value={stats.waitingOnTDI}
              isActive={activeStatFilter === 'waitingOnTDI'}
              onClick={() => handleStatCardClick('waitingOnTDI')}
              accentColor="#3B82F6"
              lightColor="#EFF6FF"
            />
            <StatCard
              icon={Rocket}
              label="Launched"
              value={stats.launched}
              isActive={activeStatFilter === 'launched'}
              onClick={() => handleStatCardClick('launched')}
              accentColor="#22C55E"
              lightColor="#F0FDF4"
            />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Pipeline Funnel */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Creator Pipeline
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'onboarding', label: 'Onboarding', color: '#6366F1' },
                  { key: 'agreement', label: 'Agreement', color: '#8B5CF6' },
                  { key: 'course_design', label: 'Prep & Resources', color: '#A78BFA' },
                  { key: 'test_prep', label: 'Production', color: '#F59E0B' },
                  { key: 'launch', label: 'Launch', color: '#22C55E' },
                ].map((phase) => {
                  const count = phaseCounts[phase.key as keyof typeof phaseCounts];
                  const widthPercent = Math.max((count / maxPhaseCount) * 100, 5);
                  return (
                    <button
                      key={phase.key}
                      onClick={() => handlePhaseClick(phase.key)}
                      className="flex items-center gap-3 w-full text-left group cursor-pointer"
                    >
                      <div className="w-28 text-sm flex-shrink-0 text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                        {phase.label}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        {/* Background track */}
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end px-3 transition-all duration-500 group-hover:brightness-110"
                            style={{
                              width: `${widthPercent}%`,
                              minWidth: count > 0 ? '40px' : '0',
                              background: `linear-gradient(135deg, ${phase.color}, ${phase.color}dd)`,
                            }}
                          >
                            {count > 0 && (
                              <span className="text-white text-xs font-semibold">{count}</span>
                            )}
                          </div>
                        </div>
                        {count === 0 && (
                          <span className="text-gray-300 text-xs font-medium px-2">0</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Closest to Launch */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Closest to Launch
                </h3>
                {closestToLaunch.length > 0 && (
                  <button
                    onClick={() => {
                      const emails = closestToLaunch
                        .map(c => dashboardData.creators.find(cr => cr.id === c.id)?.email)
                        .filter((e): e is string => !!e);
                      handleCopyEmails(emails, 'closestToLaunch');
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                      copiedSection === 'closestToLaunch'
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {copiedSection === 'closestToLaunch' ? (
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
                )}
              </div>
              {closestToLaunch.length === 0 ? (
                <p className="text-sm text-gray-500">No creators in progress</p>
              ) : (
                <div className="space-y-3">
                  {closestToLaunch.map((creator) => {
                    const progressColor = creator.progressPercentage >= 80 ? '#22C55E' : creator.progressPercentage >= 50 ? '#F59E0B' : '#6366F1';
                    return (
                      <Link
                        key={creator.id}
                        href={`/tdi-admin/creators/${creator.id}`}
                        className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0 ring-2 ring-white shadow-sm">
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {creator.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${creator.progressPercentage}%`, backgroundColor: progressColor }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-9 text-right" style={{ color: progressColor }}>{creator.progressPercentage}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduled for Launch */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              {(() => {
                const scheduled = dashboardData.creators
                  .filter(c => c.publish_status === 'scheduled' && c.scheduled_publish_date)
                  .sort((a, b) => new Date(a.scheduled_publish_date!).getTime() - new Date(b.scheduled_publish_date!).getTime())
                  .slice(0, 5);

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <CalendarDays className="w-5 h-5 text-blue-500" />
                        Scheduled for Launch
                      </h3>
                      {scheduled.length > 0 && (
                        <button
                          onClick={() => handleCopyEmails(scheduled.map(c => c.email), 'scheduled')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                            copiedSection === 'scheduled'
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {copiedSection === 'scheduled' ? (
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
                      )}
                    </div>

                    {scheduled.length === 0 ? (
                      <p className="text-sm text-gray-500">No creators scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {scheduled.map((creator) => {
                          const scheduledDate = new Date(creator.scheduled_publish_date!);
                          const isPastDue = scheduledDate <= new Date();
                          return (
                            <Link
                              key={creator.id}
                              href={`/tdi-admin/creators/${creator.id}`}
                              className="flex items-center gap-2 group"
                            >
                              <div
                                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 bg-blue-500"
                              >
                                {creator.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium truncate group-hover:opacity-80"
                                  style={{ color: '#2B3A67' }}
                                >
                                  {creator.name}
                                </p>
                              </div>
                              <div className={`text-xs flex-shrink-0 px-2 py-0.5 rounded ${isPastDue ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isPastDue ? 'Past due' : scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Recently Published */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              {(() => {
                // Include creators who are either:
                // 1. Explicitly marked as published (publish_status === 'published')
                // 2. Have all core milestones completed (progress.isComplete === true)
                const published = dashboardData.creators
                  .filter(c => c.publish_status === 'published' || c.progress?.isComplete === true)
                  .sort((a, b) => {
                    // Sort by published_date if available, otherwise lastActivityDate
                    const dateA = a.published_date ? new Date(a.published_date) : new Date(a.lastActivityDate);
                    const dateB = b.published_date ? new Date(b.published_date) : new Date(b.lastActivityDate);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .slice(0, 5);

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <Globe className="w-5 h-5 text-green-500" />
                        Recently Published
                      </h3>
                      {published.length > 0 && (
                        <button
                          onClick={() => handleCopyEmails(published.map(c => c.email), 'published')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                            copiedSection === 'published'
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {copiedSection === 'published' ? (
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
                      )}
                    </div>

                    {published.length === 0 ? (
                      <p className="text-sm text-gray-500">No published creators yet</p>
                    ) : (
                      <div className="space-y-3">
                        {published.map((creator) => (
                          <Link
                            key={creator.id}
                            href={`/tdi-admin/creators/${creator.id}`}
                            className="flex items-start gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-600 shadow-sm">
                              <Check className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-gray-900 group-hover:text-green-600 transition-colors">
                                {creator.name}
                              </p>
                              {creator.post_launch_notes && (
                                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-1 truncate flex items-center gap-1">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{creator.post_launch_notes}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex-shrink-0 mt-0.5 font-medium">
                              {new Date(creator.published_date || creator.lastActivityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Needs Your Attention */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Needs Your Attention
                  {needsAttentionCount > 0 && (
                    <span className="text-xs font-normal text-gray-500">({needsAttentionCount})</span>
                  )}
                </h3>
                {needsAttention.length > 0 && (
                  <button
                    onClick={() => handleCopyEmails(needsAttention.map(c => c.email), 'needsAttention')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                      copiedSection === 'needsAttention'
                        ? 'bg-green-50 text-green-600 border border-green-200'
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
                )}
              </div>
              {needsAttention.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 py-2">
                  <span>✓</span>
                  <p className="text-sm">All caught up! No creators waiting on team feedback.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {needsAttention.map((creator: EnrichedCreator) => {
                    const hasPostLaunchNotes = creator.post_launch_notes && creator.post_launch_notes.trim() !== '';
                    const isWaitingOnTDI = creator.waitingOn === 'tdi';

                    return (
                      <Link
                        key={creator.id}
                        href={`/tdi-admin/creators/${creator.id}`}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-purple-50 transition-colors group"
                      >
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            hasPostLaunchNotes && !isWaitingOnTDI ? 'bg-green-500' : ''
                          }`}
                          style={{ backgroundColor: hasPostLaunchNotes && !isWaitingOnTDI ? undefined : theme.primary }}
                        >
                          {hasPostLaunchNotes && !isWaitingOnTDI ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            creator.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate group-hover:text-purple-700"
                            style={{ color: '#2B3A67' }}
                          >
                            {creator.name}
                          </p>
                          {hasPostLaunchNotes ? (
                            <p className="text-xs text-amber-700 truncate flex items-center gap-1">
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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                            Published
                          </span>
                        ) : (
                          <p className="text-xs font-medium flex-shrink-0" style={{ color: theme.primary }}>
                            {getRelativeTime(creator.lastActivityDate)}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                  {needsAttentionCount > 8 && (
                    <button
                      onClick={() => handleStatCardClick('waitingOnTDI')}
                      className="w-full text-center text-xs pt-1"
                      style={{ color: theme.primary }}
                    >
                      View all {needsAttentionCount} items →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content Paths */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Content Paths
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'blog', icon: FileText, label: 'Blog', count: pathCounts.blog, color: theme.primary },
                  { key: 'download', icon: DownloadIcon, label: 'Download', count: pathCounts.download, color: theme.primary },
                  { key: 'course', icon: BookOpen, label: 'Course', count: pathCounts.course, color: theme.primary },
                  { key: 'notSet', icon: HelpCircle, label: 'Not Set', count: pathCounts.notSet, color: '#E8927C' },
                ].map((path) => {
                  const IconComponent = path.icon;
                  return (
                    <button
                      key={path.key}
                      onClick={() => handlePathClick(path.key)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: theme.light }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: path.color }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold leading-none" style={{ color: theme.primary }}>{path.count}</p>
                        <p className="text-sm text-gray-500">{path.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          {locationData && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] mb-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Geographic Distribution
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* US Map */}
                <div className="lg:col-span-2">
                  <USMapChart data={locationData.stateData} />
                </div>

                {/* Top States + Stats */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: '#2B3A67' }}>
                      Top States
                    </h3>
                    {locationData.topStates.length === 0 ? (
                      <p className="text-sm text-gray-500">No location data yet</p>
                    ) : (
                      <div className="space-y-2">
                        {locationData.topStates.slice(0, 5).map((item, index) => {
                          const percentage = locationData.creatorsWithLocation > 0
                            ? Math.round((item.count / locationData.creatorsWithLocation) * 100)
                            : 0;
                          return (
                            <div key={item.state} className="flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-500 w-4">{index + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                                    {item.state}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${percentage}%`, backgroundColor: theme.primary }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: theme.light }}>
                        <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                          {locationData.creatorsWithLocation}
                        </p>
                        <p className="text-xs text-gray-600">With Location</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-400">
                          {locationData.noLocationCount}
                        </p>
                        <p className="text-xs text-gray-500">Not Shared</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/tdi-admin/creators/${activity.creatorId}`}
                    className="flex items-start gap-2 group"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === 'team' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium group-hover:opacity-80" style={{ color: '#2B3A67' }}>
                          {activity.creatorName}
                        </span>
                        <span className="text-gray-600"> · </span>
                        <span className="text-gray-500 text-xs">{activity.milestoneName}</span>
                      </p>
                      <p className="text-xs text-gray-400">{getRelativeTime(activity.completedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Creator
              <span className="mx-2">·</span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Team
            </p>
          </div>
        </div>
      )}

      {/* CREATORS TAB */}
      {activeTab === 'creators' && (
        <>
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
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
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="text-white text-xs px-2 py-0.5 rounded-full bg-indigo-600">
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
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All Paths</option>
                    <option value="blog">Blog</option>
                    <option value="download">Download</option>
                    <option value="course">Course</option>
                    <option value="notSet">Not Set</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phase</label>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
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
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All</option>
                    <option value="creator">Creator</option>
                    <option value="tdi">TDI</option>
                    <option value="stalled">Stalled</option>
                    <option value="launched">Launched</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Publish Status</label>
                  <select
                    value={filterPublishStatus}
                    onChange={(e) => setFilterPublishStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
                  >
                    <option value="all">All</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                {(activeFiltersCount > 0 || activeStatFilter) && (
                  <button
                    onClick={() => {
                      setFilterPath('all');
                      setFilterPhase('all');
                      setFilterWaitingOn('all');
                      setFilterPublishStatus('all');
                      setActiveStatFilter(null);
                    }}
                    className="self-end px-3 py-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
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
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-indigo-50">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="text-sm font-semibold capitalize text-indigo-700">
                {activeStatFilter === 'waitingOnCreator' ? 'Waiting on Creator' :
                 activeStatFilter === 'waitingOnTDI' ? 'Waiting on TDI' :
                 activeStatFilter}
              </span>
              <button
                onClick={() => setActiveStatFilter(null)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
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
                      style={{ accentColor: theme.primary }}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
                          creator.isStalled ? 'border-l-4 border-l-red-400 bg-red-50/30' : ''
                        } ${isSelected ? 'bg-purple-50' : ''}`}
                        onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCreatorSelection(creator.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                            style={{ accentColor: theme.primary }}
                          />
                        </td>
                        {/* Creator */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                              style={{ backgroundColor: creator.progressPercentage === 100 ? '#22c55e' : theme.primary }}
                            >
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate" style={{ color: '#2B3A67' }}>
                                {creator.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate md:hidden">
                                {creator.course_title || creator.email}
                              </p>
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
                                    backgroundColor: creator.progressPercentage === 100 ? '#22c55e' : theme.primary
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
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${waitingBadge.color}`}>
                            {waitingBadge.icon}
                            {waitingBadge.label}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-3">
                          <span className={`text-sm flex items-center gap-1 ${
                            isInactive ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {getRelativeTime(creator.lastActivityDate)}
                          </span>
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

        {/* Floating Action Bar for Bulk Copy */}
        {selectedCreatorIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-50 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-700">
              {selectedCreatorIds.size} creator{selectedCreatorIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md"
            >
              {copiedSection === 'bulk' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Email Addresses
                </>
              )}
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

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          {/* Analytics Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-gray-500 mb-1 font-medium">Avg Progress</p>
              <p className="text-3xl font-bold text-indigo-600">{avgProgress}%</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Creators</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-gray-500 mb-1 font-medium">Most Active (30d)</p>
              <p className="text-xl font-bold truncate text-indigo-600">
                {mostActiveCreator ? mostActiveCreator[0] : '-'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-gray-500 mb-1 font-medium">Launched</p>
              <p className="text-3xl font-bold text-green-600">{stats.launched}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Creators by Phase */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Creators by Phase
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content Path Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Content Path Distribution
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pathChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pathChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stalled Creators */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Stalled Creators
              </h3>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <p className="text-5xl font-bold" style={{ color: stats.stalled > 0 ? '#F97316' : '#22C55E' }}>
                    {stats.stalled}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">creators inactive 14+ days</p>
                  {stats.stalled > 0 && (
                    <button
                      onClick={() => handleStatCardClick('stalled')}
                      className="mt-3 text-sm px-4 py-2 rounded-lg"
                      style={{ backgroundColor: theme.light, color: theme.primary }}
                    >
                      View stalled creators
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Progress Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: '0-25%', min: 0, max: 25 },
                  { label: '26-50%', min: 26, max: 50 },
                  { label: '51-75%', min: 51, max: 75 },
                  { label: '76-99%', min: 76, max: 99 },
                  { label: '100%', min: 100, max: 100 },
                ].map((range) => {
                  const count = dashboardData.creators.filter(
                    c => c.progressPercentage >= range.min && c.progressPercentage <= range.max
                  ).length;
                  const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={range.label} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16">{range.label}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: range.min === 100 ? '#22C55E' : theme.primary,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8" style={{ color: '#2B3A67' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Creator Payouts Coming Soon
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Manage creator payouts, view payment history, track pending payments,
              and configure revenue share settings.
            </p>
          </div>
        </div>
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Target Launch Month
                </label>
                <input
                  type="text"
                  value={newCreator.target_launch_month}
                  onChange={(e) => setNewCreator({ ...newCreator, target_launch_month: e.target.value })}
                  placeholder="e.g., March 2026"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
                />
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
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md"
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

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
        </div>
      </main>
    </div>
  );
}
