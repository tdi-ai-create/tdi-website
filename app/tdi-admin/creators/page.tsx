'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Rocket,
  Plus,
  X,
  Loader2,
  PenLine,
  Package,
  GraduationCap,
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
} from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
import { createCreator } from '@/lib/creator-portal-data';

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

export default function CreatorStudioPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');

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
  const [showFilters, setShowFilters] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState<'lastActive' | 'progress' | 'name'>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    course_title: '',
    course_audience: '',
    target_launch_month: '',
  });

  const canEdit = isOwner || hasPermission(permissions, 'creator_studio', 'edit');

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard-data');
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
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [hasAccess, loadDashboardData]);

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
  }, [searchQuery, dashboardData, filterPath, filterPhase, filterWaitingOn, activeStatFilter, sortBy, sortOrder]);

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

  const handleStatCardClick = (filter: string | null) => {
    if (activeStatFilter === filter) {
      setActiveStatFilter(null);
    } else {
      setActiveStatFilter(filter);
    }
  };

  const activeFiltersCount =
    (filterPath !== 'all' ? 1 : 0) +
    (filterPhase !== 'all' ? 1 : 0) +
    (filterWaitingOn !== 'all' ? 1 : 0);

  // Get topic tag color based on phase
  const getTopicTagColor = (phase: string) => {
    if (phase === 'launch') return 'bg-green-100 text-green-700 border-green-200';
    if (phase === 'course_design' || phase === 'test_prep' || phase === 'production') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Get path badge styling
  const getPathBadge = (path: string | null) => {
    switch (path) {
      case 'course':
        return { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Course', color: 'bg-blue-100 text-blue-700' };
      case 'blog':
        return { icon: <PenLine className="w-3.5 h-3.5" />, label: 'Blog', color: 'bg-green-100 text-green-700' };
      case 'download':
        return { icon: <Package className="w-3.5 h-3.5" />, label: 'Download', color: 'bg-amber-100 text-amber-700' };
      default:
        return { icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'Not set', color: 'bg-gray-100 text-gray-500' };
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
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#E8B84B' }} />
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

  const { stats, phaseCounts, pathCounts, closestToLaunch, recentActivity, topics } = dashboardData;
  const maxPhaseCount = Math.max(...Object.values(phaseCounts), 1);

  // Compute creators needing team attention, sorted by longest waiting first
  const needsAttention = dashboardData.creators
    .filter((c: EnrichedCreator) => c.waitingOn === 'tdi')
    .sort((a: EnrichedCreator, b: EnrichedCreator) =>
      new Date(a.lastActivityDate).getTime() - new Date(b.lastActivityDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#2B3A67' }}
          >
            Creator Command Center
          </h1>
          <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Pipeline overview and creator management
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Creator
          </button>
        )}
      </div>

      {/* SECTION 1: Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {/* Total */}
        <button
          onClick={() => handleStatCardClick(null)}
          className={`bg-white rounded-xl p-4 border transition-all text-left ${
            activeStatFilter === null ? 'border-[#E8B84B] ring-2 ring-[#E8B84B]/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(43, 58, 103, 0.1)' }}
            >
              <Users className="w-5 h-5" style={{ color: '#2B3A67' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </button>

        {/* Stalled */}
        <button
          onClick={() => handleStatCardClick('stalled')}
          className={`bg-white rounded-xl p-4 border transition-all text-left ${
            activeStatFilter === 'stalled' ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{stats.stalled}</p>
              <p className="text-xs text-gray-600">Stalled (14+ days)</p>
            </div>
          </div>
        </button>

        {/* Waiting on Creator */}
        <button
          onClick={() => handleStatCardClick('waitingOnCreator')}
          className={`bg-white rounded-xl p-4 border transition-all text-left ${
            activeStatFilter === 'waitingOnCreator' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Hourglass className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{stats.waitingOnCreator}</p>
              <p className="text-xs text-gray-600">Waiting on Creator</p>
            </div>
          </div>
        </button>

        {/* Waiting on TDI */}
        <button
          onClick={() => handleStatCardClick('waitingOnTDI')}
          className={`bg-white rounded-xl p-4 border transition-all text-left ${
            activeStatFilter === 'waitingOnTDI' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{stats.waitingOnTDI}</p>
              <p className="text-xs text-gray-600">Waiting on TDI</p>
            </div>
          </div>
        </button>

        {/* Launched */}
        <button
          onClick={() => handleStatCardClick('launched')}
          className={`bg-white rounded-xl p-4 border transition-all text-left ${
            activeStatFilter === 'launched' ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{stats.launched}</p>
              <p className="text-xs text-gray-600">Launched</p>
            </div>
          </div>
        </button>
      </div>

      {/* COMPACT 2x2 GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* ROW 1: Pipeline + Closest to Launch */}
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2
            className="text-base font-semibold mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            Creator Pipeline
          </h2>
          <div className="space-y-2">
            {[
              { key: 'onboarding', label: 'Onboarding', color: 'bg-[#2B3A67]' },
              { key: 'agreement', label: 'Agreement', color: 'bg-[#4a5d8f]' },
              { key: 'course_design', label: 'Prep & Resources', color: 'bg-[#6980b4]' },
              { key: 'test_prep', label: 'Production', color: 'bg-[#E8B84B]' },
              { key: 'launch', label: 'Launch', color: 'bg-green-500' },
            ].map((phase) => {
              const count = phaseCounts[phase.key as keyof typeof phaseCounts];
              const widthPercent = Math.max((count / maxPhaseCount) * 100, 8);
              return (
                <div key={phase.key} className="flex items-center gap-2">
                  <div
                    className="w-24 text-sm flex-shrink-0"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B7280' }}
                  >
                    {phase.label}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-6 ${phase.color} rounded flex items-center justify-end px-2 transition-all`}
                      style={{ width: `${widthPercent}%`, minWidth: count > 0 ? '32px' : '8px' }}
                    >
                      {count > 0 && (
                        <span className="text-white text-xs font-medium">{count}</span>
                      )}
                    </div>
                    {count === 0 && <span className="text-gray-400 text-xs">0</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closest to Launch */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            <Trophy className="w-4 h-4" style={{ color: '#E8B84B' }} />
            Closest to Launch
          </h3>
          {closestToLaunch.length === 0 ? (
            <p className="text-sm text-gray-500">No creators in progress</p>
          ) : (
            <div className="space-y-2">
              {closestToLaunch.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/tdi-admin/creators/${creator.id}`}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{ backgroundColor: '#2B3A67' }}
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${creator.progressPercentage}%`, backgroundColor: '#E8B84B' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8">{creator.progressPercentage}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ROW 2: Needs Attention + Content Paths */}
        {/* Needs Your Attention */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Needs Your Attention
            {stats.waitingOnTDI > 0 && (
              <span className="text-xs font-normal text-gray-500">({stats.waitingOnTDI})</span>
            )}
          </h3>
          {needsAttention.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 py-2">
              <span>✓</span>
              <p className="text-sm">All caught up! No creators waiting on team feedback.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {needsAttention.map((creator: EnrichedCreator) => (
                <Link
                  key={creator.id}
                  href={`/tdi-admin/creators/${creator.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-amber-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate group-hover:text-amber-700"
                      style={{ color: '#2B3A67' }}
                    >
                      {creator.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {creator.currentMilestoneName || 'Waiting on review'}
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 font-medium flex-shrink-0">
                    {getRelativeTime(creator.lastActivityDate)}
                  </p>
                </Link>
              ))}
              {stats.waitingOnTDI > 5 && (
                <button
                  onClick={() => handleStatCardClick('waitingOnTDI')}
                  className="w-full text-center text-xs pt-1"
                  style={{ color: '#E8B84B' }}
                >
                  View all {stats.waitingOnTDI} waiting →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Paths */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            Content Paths
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'blog', icon: '📝', label: 'Blog', count: pathCounts.blog },
              { key: 'download', icon: '📦', label: 'Download', count: pathCounts.download },
              { key: 'course', icon: '🎓', label: 'Course', count: pathCounts.course },
              { key: 'notSet', icon: '❓', label: 'Not Set', count: pathCounts.notSet },
            ].map((path) => (
              <div key={path.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-base">{path.icon}</span>
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: '#2B3A67' }}>{path.count}</p>
                  <p className="text-xs text-gray-500">{path.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topics in Pipeline - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2
          className="text-base font-semibold mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
        >
          Topics in the Pipeline
        </h2>
        {topics.length === 0 ? (
          <p className="text-sm text-gray-500">No course topics yet</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/tdi-admin/creators/${topic.id}`}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors hover:opacity-80 ${getTopicTagColor(topic.phase)}`}
                >
                  {topic.title}
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Near launch
              <span className="mx-2">·</span>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span> In progress
              <span className="mx-2">·</span>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Early stage
            </p>
          </>
        )}
      </div>

      {/* Recent Activity - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
        >
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
                    <span
                      className="font-medium group-hover:opacity-80"
                      style={{ color: '#2B3A67' }}
                    >
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

      {/* SECTION 4: Search, Filters, and Creator Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-[#E8B84B] bg-[#E8B84B]/10'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span
                  className="text-white text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#E8B84B' }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Content Path</label>
                <select
                  value={filterPath}
                  onChange={(e) => setFilterPath(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                >
                  <option value="all">All Paths</option>
                  <option value="blog">Blog</option>
                  <option value="download">Download</option>
                  <option value="course">Course</option>
                  <option value="notSet">Not Set</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phase</label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
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
                <label className="block text-xs text-gray-500 mb-1">Waiting On</label>
                <select
                  value={filterWaitingOn}
                  onChange={(e) => setFilterWaitingOn(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                >
                  <option value="all">All</option>
                  <option value="creator">Creator</option>
                  <option value="tdi">TDI</option>
                  <option value="stalled">Stalled</option>
                  <option value="launched">Launched</option>
                </select>
              </div>
              {(activeFiltersCount > 0 || activeStatFilter) && (
                <button
                  onClick={() => {
                    setFilterPath('all');
                    setFilterPhase('all');
                    setFilterWaitingOn('all');
                    setActiveStatFilter(null);
                  }}
                  className="self-end px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active stat filter indicator */}
        {activeStatFilter && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <span className="text-sm text-gray-600">Showing:</span>
            <span className="text-sm font-medium capitalize" style={{ color: '#2B3A67' }}>
              {activeStatFilter === 'waitingOnCreator' ? 'Waiting on Creator' :
               activeStatFilter === 'waitingOnTDI' ? 'Waiting on TDI' :
               activeStatFilter}
            </span>
            <button
              onClick={() => setActiveStatFilter(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Creator Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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

                  return (
                    <tr
                      key={creator.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        creator.isStalled ? 'border-l-4 border-l-red-400 bg-red-50/30' : ''
                      }`}
                    >
                      {/* Creator */}
                      <td className="px-4 py-3">
                        <Link href={`/tdi-admin/creators/${creator.id}`} className="flex items-center gap-3 group">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                            style={{ backgroundColor: creator.progressPercentage === 100 ? '#22c55e' : '#2B3A67' }}
                          >
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium truncate group-hover:opacity-80"
                              style={{ color: '#2B3A67' }}
                            >
                              {creator.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate md:hidden">
                              {creator.course_title || creator.email}
                            </p>
                          </div>
                        </Link>
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
                                  backgroundColor: creator.progressPercentage === 100 ? '#22c55e' : '#E8B84B'
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10" style={{ color: '#2B3A67' }}>
                              {creator.progressPercentage}%
                            </span>
                          </div>
                          {creator.progress?.bonusAvailable && creator.progress.bonusAvailable > 0 && (
                            <span className="text-xs text-amber-600">
                              + {creator.progress.bonusAvailable} bonus available
                            </span>
                          )}
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

        {/* Table footer with count */}
        <div
          className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Showing {filteredCreators.length} of {dashboardData.creators.length} creators
        </div>
      </div>

      {/* Add Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2
                className="text-xl font-semibold"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#2B3A67' }}
              >
                Add Creator
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCreator} className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCreator.name}
                  onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newCreator.email}
                  onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Course Title
                </label>
                <input
                  type="text"
                  value={newCreator.course_title}
                  onChange={(e) => setNewCreator({ ...newCreator, course_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Target Audience
                </label>
                <input
                  type="text"
                  value={newCreator.course_audience}
                  onChange={(e) => setNewCreator({ ...newCreator, course_audience: e.target.value })}
                  placeholder="e.g., Elementary teachers, K-12 paras"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Target Launch Month
                </label>
                <input
                  type="text"
                  value={newCreator.target_launch_month}
                  onChange={(e) => setNewCreator({ ...newCreator, target_launch_month: e.target.value })}
                  placeholder="e.g., March 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8B84B]/50 focus:border-[#E8B84B]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
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
    </div>
  );
}
