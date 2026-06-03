'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { getAdminStats } from '@/lib/hub/admin';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import {
  ChevronRight,
  BarChart3,
  FileText,
  Zap,
  Mail,
  Download,
  Info,
  X,
  Search,
  User,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { USChoroplethMap } from '@/components/tdi-admin/shared/USChoroplethMap';
import { ALL_QUIZZES, getQuizById } from '@/lib/hub/quizConfigs';
import { TrendAreaChart, HorizontalBarChart, DonutChart, DonutLegend } from '@/components/tdi-admin/hub-charts/HubCharts';
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_WIDGET_LABEL,
  TYPE_STAT_VALUE,
  TYPE_STAT_LABEL,
  TYPE_BODY,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens';

// ── User Search Component ─────────────────────────────────────────
function UserSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; email: string; display_name: string | null; role: string | null; created_at: string; tier?: string; source?: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const supabase = getSupabase();
      const q = query.trim().toLowerCase();

      // Search by email or display name
      const { data: profiles } = await supabase
        .from('hub_profiles')
        .select('id, email, display_name, role, created_at')
        .or(`email.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(10);

      // Get memberships for found users
      const userIds = (profiles || []).map(p => p.id);
      let membershipMap: Record<string, { tier: string; source: string }> = {};
      if (userIds.length > 0) {
        const { data: mems } = await supabase
          .from('hub_memberships')
          .select('user_id, tier, source')
          .in('user_id', userIds);
        (mems || []).forEach((m: { user_id: string; tier: string; source: string }) => {
          membershipMap[m.user_id] = { tier: m.tier, source: m.source };
        });
      }

      setResults((profiles || []).map(p => ({
        ...p,
        tier: membershipMap[p.id]?.tier || 'free',
        source: membershipMap[p.id]?.source || '--',
      })));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search users by email or name..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E8B84B] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || query.trim().length < 2}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#1B2A4A', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>No users found for "{query}"</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-2 flex" style={{ ...TYPE_WIDGET_LABEL, borderBottom: '1px solid #F3F4F6' }}>
                <span className="flex-1">User</span>
                <span className="w-24 text-center">Tier</span>
                <span className="w-24 text-center">Source</span>
                <span className="w-24 text-right">Joined</span>
              </div>
              {results.map((user) => (
                <div key={user.id} className="px-4 py-3 flex items-center hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A' }}>{user.display_name || 'No name'}</p>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>{user.email}</p>
                  </div>
                  <span
                    className="w-24 text-center text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor: user.tier === 'all_access' ? '#FFF8E7' : user.tier === 'free' ? '#F3F4F6' : '#E0F4FF',
                      color: user.tier === 'all_access' ? '#D97706' : user.tier === 'free' ? '#6B7280' : '#0891B2',
                    }}
                  >
                    {user.tier?.replace('_', ' ')}
                  </span>
                  <span className="w-24 text-center text-xs capitalize" style={{ color: '#9CA3AF' }}>{user.source?.replace('_', ' ')}</span>
                  <span className="w-24 text-right text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hub theme colors
const theme = PORTAL_THEMES.hub;

// Tab configuration for top nav
const HUB_TABS = [
  { id: 'overview', label: 'Overview', href: '/tdi-admin/hub' },
  { id: 'operations', label: 'Operations', href: '/tdi-admin/hub/operations' },
  { id: 'production', label: 'Production', href: '/tdi-admin/hub/production' },
];

interface HubStats {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
  totalPdHours: number;
  avgStressScore: number | null;
  membershipByTier?: Record<string, number>;
  membershipBySource?: Record<string, number>;
  recentSignups?: number;
  todaySignups?: number;
  topQuickWins?: { title: string; views: number }[];
  recentActivity?: { action: string; user_id: string; created_at: string }[];
  growthChart?: { date: string; count: number }[];
  roleBreakdown?: Record<string, number>;
  freeUsers?: number;
  paidUsers?: number;
  totalQAQuestions?: number;
  totalQAReplies?: number;
  totalConversationPosts?: number;
  engagementFunnel?: { totalUsers: number; organicUsers?: number; exploredTool: number; returnedAgain: number; upgraded: number };
  activeUsers7d?: number;
  categoryBreakdown?: Record<string, number>;
  schoolBreakdown?: { name: string; count: number; district: string; state: string }[];
  stateBreakdown?: Record<string, number>;
  previousWeek?: { signups: number; enrollments: number; completions: number; certificates: number };
}

// Modern Stat Card Component with trend indicator + hover tooltip
function StatCard({
  label,
  value,
  subtitle,
  trend,
  hoverDetail,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: { current: number; previous: number };
  hoverDetail?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trendPct = trend && trend.previous > 0
    ? ((trend.current - trend.previous) / trend.previous) * 100
    : null;
  const trendUp = trendPct !== null && trendPct > 0;
  const trendDown = trendPct !== null && trendPct < 0;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 relative overflow-hidden group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: theme.accent }} />
      <div className="p-5">
        <div className="flex items-baseline gap-2">
          <p
            className="mb-1"
            style={{ ...TYPE_STAT_VALUE, color: theme.accent }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trendPct !== null && Math.abs(trendPct) >= 0.1 && (
            <span
              className="text-[10px] font-semibold flex items-center gap-0.5"
              style={{ color: trendUp ? '#2A9D8F' : trendDown ? '#EF4444' : '#9CA3AF' }}
            >
              {trendUp ? '\u2191' : trendDown ? '\u2193' : '\u2022'}
              {Math.abs(trendPct).toFixed(0)}%
            </span>
          )}
        </div>
        <p style={TYPE_STAT_LABEL}>{label}</p>
        {subtitle && <p className="mt-1" style={TYPE_SMALL}>{subtitle}</p>}
      </div>

      {/* Hover tooltip */}
      {hoverDetail && showTooltip && (
        <div
          className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs max-w-[220px] text-center pointer-events-none"
          style={{ backgroundColor: '#1e2749', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {hoverDetail}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1e2749' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Section Card Component - with small dot accent instead of large icon
function SectionCard({
  title,
  description,
  features,
  href,
}: {
  title: string;
  description: string;
  features: string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-200 group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}

// Subtle Example Data Notice
function ExampleDataNotice({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-6">
      <Info size={16} className="text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-700 flex-1">
        Viewing example data for demonstration purposes.
      </p>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-amber-100 transition-colors"
        title="Dismiss"
      >
        <X size={14} className="text-amber-600" />
      </button>
    </div>
  );
}

export default function HubAdminPage() {
  const { teamMember, permissions, isOwner } = useTDIAdmin();
  const [stats, setStats] = useState<HubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExampleNotice] = useState(false);
  const [quizInsights, setQuizInsights] = useState<{ quizType: string; resultKey: string; count: number }[]>([]);
  const [quizTotalUsers, setQuizTotalUsers] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);

        // Load quiz analytics
        const supabase = getSupabase();
        const { data: quizData } = await supabase
          .from('hub_quiz_results')
          .select('quiz_type, result_key');
        if (quizData) {
          // Count by quiz_type + result_key
          const counts: Record<string, number> = {};
          const uniqueUsers = new Set<string>();
          for (const row of quizData) {
            const key = `${row.quiz_type}::${row.result_key}`;
            counts[key] = (counts[key] || 0) + 1;
          }
          // Count unique users
          const { count: userCount } = await supabase
            .from('hub_quiz_results')
            .select('user_id', { count: 'exact', head: true });
          setQuizTotalUsers(userCount || 0);
          setQuizInsights(
            Object.entries(counts)
              .map(([key, count]) => {
                const [quizType, resultKey] = key.split('::');
                return { quizType, resultKey, count };
              })
              .sort((a, b) => b.count - a.count)
          );
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-0 px-6">
          {HUB_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: tab.id === 'overview' ? '#111827' : '#6B7280',
                borderBottom: tab.id === 'overview'
                  ? '2px solid #EAB308'
                  : '2px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 style={TYPE_PAGE_TITLE}>Learning Hub</h1>
            <p className="mt-1" style={TYPE_PAGE_SUBTITLE}>Manage enrollments, content, and analytics</p>
          </div>
          <Link
            href="/hub"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm border"
            style={{
              color: '#1B2A4A',
              borderColor: '#E5E7EB',
              backgroundColor: 'white',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Eye size={16} style={{ color: '#6B7280' }} />
            See the Hub as a Learner
          </Link>
        </div>

        {/* User Search */}
        <UserSearchBar />

        {/* Launch Status Banner */}
        {!showExampleNotice && stats && (stats.todaySignups || 0) > 0 && (
          <div
            className="rounded-xl p-4 mb-6 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #38618C 100%)' }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#2A9D8F' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'DM Sans', sans-serif" }}>
              <span className="font-bold" style={{ color: '#E8B84B' }}>{stats.todaySignups}</span> new signups today
              {(stats.recentSignups || 0) > (stats.todaySignups || 0) && (
                <span> -- <span className="font-bold" style={{ color: '#E8B84B' }}>{stats.recentSignups}</span> this week</span>
              )}
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Quick Stats</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 animate-pulse border border-gray-100"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={stats.totalUsers || 0}
                trend={{ current: stats.recentSignups || 0, previous: stats.previousWeek?.signups || 0 }}
                hoverDetail={`${(stats.recentSignups || 0).toLocaleString()} signups this week. ${(stats.todaySignups || 0).toLocaleString()} today.`}
              />
              <StatCard
                label="Free Users"
                value={stats.freeUsers || 0}
                hoverDetail="Users without a paid membership. Includes imported Substack subscribers."
              />
              <StatCard
                label="Paid / District"
                value={stats.paidUsers || 0}
                hoverDetail={Object.entries(stats.membershipByTier || {}).map(([t, c]) => `${t}: ${c}`).join(', ') || 'No memberships'}
              />
              <StatCard
                label="Enrollments"
                value={stats.totalEnrollments || 0}
                trend={{ current: stats.totalEnrollments || 0, previous: (stats.totalEnrollments || 0) - (stats.previousWeek?.enrollments || 0) }}
                hoverDetail="Total course enrollments across all users."
              />
              <StatCard
                label="Completions"
                value={stats.totalCompletions || 0}
                trend={{ current: stats.totalCompletions || 0, previous: (stats.totalCompletions || 0) - (stats.previousWeek?.completions || 0) }}
                hoverDetail="Courses completed with all lessons marked done."
              />
              <StatCard
                label="Certificates"
                value={stats.totalCertificates || 0}
                trend={{ current: stats.totalCertificates || 0, previous: (stats.totalCertificates || 0) - (stats.previousWeek?.certificates || 0) }}
                hoverDetail="PD certificates earned on course completion."
              />
              <StatCard
                label="PD Hours"
                value={stats.totalPdHours || 0}
                hoverDetail="Total professional development hours earned across all certificates."
              />
              <StatCard
                label="Avg Vibe"
                value={stats.avgStressScore || '-'}
                subtitle="1=tough, 5=great"
                hoverDetail="Average Vibe Check score from latest check-in per user. Private to each educator."
              />
            </div>
          ) : (
            <p className="text-gray-500">Unable to load stats.</p>
          )}
        </div>

        {/* Membership & Growth */}
        {stats && (stats.membershipByTier || stats.recentSignups) && (
          <div className="mb-8">
            <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Membership & Growth</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Signups */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 className="mb-3" style={TYPE_WIDGET_LABEL}>Signups</h3>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold" style={{ color: '#E8B84B' }}>{stats.todaySignups || 0}</span>
                  <span className="text-sm" style={{ color: '#6B7280' }}>today</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-bold" style={{ color: '#1B2A4A' }}>{stats.recentSignups || 0}</span>
                  <span className="text-sm" style={{ color: '#6B7280' }}>this week</span>
                </div>
              </div>

              {/* By Tier */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 className="mb-3" style={TYPE_WIDGET_LABEL}>Active Memberships by Tier</h3>
                <div className="space-y-2">
                  {Object.entries(stats.membershipByTier || {}).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <span className="text-sm capitalize" style={{ color: '#374151' }}>{tier.replace('_', ' ')}</span>
                      <span className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{count as number}</span>
                    </div>
                  ))}
                  {Object.keys(stats.membershipByTier || {}).length === 0 && (
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>No active memberships yet</p>
                  )}
                </div>
              </div>

              {/* By Source */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 className="mb-3" style={TYPE_WIDGET_LABEL}>Members by Source</h3>
                <div className="space-y-2">
                  {Object.entries(stats.membershipBySource || {}).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm capitalize" style={{ color: '#374151' }}>{source.replace('_', ' ')}</span>
                      <span className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{count as number}</span>
                    </div>
                  ))}
                  {Object.keys(stats.membershipBySource || {}).length === 0 && (
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>No membership sources yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Growth Chart + Role Breakdown */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Growth Chart -- last 30 days */}
            <div className="md:col-span-2 bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>User Growth (Last 30 Days)</h3>
              <TrendAreaChart
                data={(stats.growthChart || []).map(d => ({
                  label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  value: d.count,
                }))}
                height={160}
                color="#E8B84B"
                showGrid
              />
            </div>

            {/* Role Breakdown */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Users by Role</h3>
              {(() => {
                const roleLabels: Record<string, string> = {
                  classroom_teacher: 'Teacher',
                  para: 'Para',
                  coach: 'Coach',
                  school_leader: 'Leader',
                  district_staff: 'District',
                  other: 'Other',
                  unknown: 'Not Set',
                };
                const roleColors = ['#E8B84B', '#2A9D8F', '#8B5CF6', '#F97316', '#2563EB', '#EC4899', '#6B7280'];
                return (
                  <HorizontalBarChart
                    data={Object.entries(stats.roleBreakdown || {})
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 7)
                      .map(([role, count], i) => ({
                        label: roleLabels[role] || role,
                        value: count as number,
                        color: roleColors[i % roleColors.length],
                      }))}
                    valueFormatter={(v) => v.toLocaleString()}
                  />
                );
              })()}
            </div>
          </div>
        )}

        {/* Engagement Funnel + Active Users */}
        {stats && stats.engagementFunnel && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Funnel */}
            <div className="md:col-span-2 bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Active User Engagement</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  {stats.engagementFunnel.organicUsers?.toLocaleString() || '0'} of {stats.engagementFunnel.totalUsers.toLocaleString()} have logged in
                </span>
              </div>
              {(() => {
                const organic = stats.engagementFunnel.organicUsers || 1;
                return (
                  <div className="space-y-3">
                    {[
                      { label: 'Logged In (Organic Users)', value: organic, color: '#E8B84B', pct: 100 },
                      { label: 'Explored a Tool', value: stats.engagementFunnel.exploredTool, color: '#2A9D8F', pct: (stats.engagementFunnel.exploredTool / organic) * 100 },
                      { label: 'Came Back (2+ days)', value: stats.engagementFunnel.returnedAgain, color: '#7C3AED', pct: (stats.engagementFunnel.returnedAgain / organic) * 100 },
                      { label: 'Has Membership', value: stats.engagementFunnel.upgraded, color: '#1B2A4A', pct: (stats.engagementFunnel.upgraded / organic) * 100 },
                    ].map((step) => (
                      <div key={step.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm" style={{ color: '#374151' }}>{step.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                            <span className="text-xs" style={{ color: '#9CA3AF' }}>{step.pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(step.pct, 0.5)}%`, backgroundColor: step.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <p className="text-[10px] mt-3 pt-2" style={{ color: '#9CA3AF', borderTop: '1px solid #F3F4F6' }}>
                Percentages based on {stats.engagementFunnel.organicUsers?.toLocaleString() || '0'} organic users (logged in at least once), not {stats.engagementFunnel.totalUsers.toLocaleString()} total accounts (includes bulk imports)
              </p>
            </div>

            {/* Active Users + Category */}
            <div className="space-y-4">
              {/* Active Users */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Active Users (7 Days)</h3>
                <div className="flex items-center gap-4">
                  <div className="relative" style={{ width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#E8B84B" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${((stats.activeUsers7d || 0) / Math.max(stats.totalUsers, 1)) * 201} 201`}
                        transform="rotate(-90 40 40)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{stats.activeUsers7d || 0}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>{stats.totalUsers > 0 ? (((stats.activeUsers7d || 0) / stats.totalUsers) * 100).toFixed(1) : 0}%</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>of total users active</p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              {stats.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Popular Categories</h3>
                  <HorizontalBarChart
                    data={Object.entries(stats.categoryBreakdown)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 8)
                      .map(([cat, count]) => ({
                        label: cat.length > 18 ? cat.slice(0, 18) + '...' : cat,
                        value: count as number,
                        color: '#E8B84B',
                      }))}
                    valueFormatter={(v) => `${v} views`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schools & Districts */}
        {stats && stats.schoolBreakdown && stats.schoolBreakdown.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold mb-4" style={{ fontSize: 18, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Schools & Districts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schools bar chart */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Top Schools</h3>
                <HorizontalBarChart
                  data={stats.schoolBreakdown.slice(0, 10).map(school => ({
                    label: school.name.length > 20 ? school.name.slice(0, 20) + '...' : school.name,
                    value: school.count,
                    color: '#2A9D8F',
                  }))}
                  valueFormatter={(v) => `${v} users`}
                />
              </div>

              {/* Geographic Map */}
              {stats.stateBreakdown && Object.keys(stats.stateBreakdown).length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                    Activity by State ({Object.keys(stats.stateBreakdown).length} states)
                  </h3>
                  <USChoroplethMap
                    byState={Object.fromEntries(
                      Object.entries(stats.stateBreakdown).map(([state, count]) => [
                        state,
                        { count: count as number, value: count as number, label: 'educators', isCurrency: false }
                      ])
                    )}
                    valueLabel="educators"
                    isCurrency={false}
                    accentColor="#E8B84B"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Performance & Activity */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Quick Wins */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Most Explored Quick Wins</h3>
              {(stats.topQuickWins || []).length > 0 ? (
                <div className="space-y-3">
                  {(stats.topQuickWins || []).map((qw, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold w-5 text-center" style={{ color: i === 0 ? '#E8B84B' : '#9CA3AF' }}>{i + 1}</span>
                        <span className="text-sm truncate" style={{ color: '#374151' }}>{qw.title}</span>
                      </div>
                      <span className="text-xs font-semibold ml-2" style={{ color: '#1B2A4A' }}>{qw.views} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#9CA3AF' }}>No activity yet</p>
              )}
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Recent Activity</h3>
                <button onClick={() => window.location.reload()} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Refresh</button>
              </div>
              {(stats.recentActivity || []).length > 0 ? (
                <div className="space-y-2">
                  {(stats.recentActivity || []).slice(0, 8).map((entry, i) => {
                    const actionMap: Record<string, string> = {
                      quick_win_viewed: 'Explored a tool',
                      quick_win_completed: 'Completed a tool',
                      wellbeing_check: 'Did a vibe check',
                      hub_login: 'Logged in',
                      tour_completed: 'Completed the tour',
                      content_request: 'Submitted a content request',
                    };
                    const label = actionMap[entry.action] || entry.action.replace(/_/g, ' ');
                    const timeAgo = (() => {
                      const diff = Date.now() - new Date(entry.created_at).getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 1) return 'just now';
                      if (mins < 60) return `${mins}m ago`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs}h ago`;
                      return `${Math.floor(hrs / 24)}d ago`;
                    })();
                    return (
                      <div key={i} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 0 ? '#2A9D8F' : '#D1D5DB' }} />
                          <span className="text-xs" style={{ color: '#374151' }}>{label}</span>
                        </div>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#9CA3AF' }}>No activity yet</p>
              )}
            </div>

            {/* Community Engagement */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Community Engagement</h3>
              {(() => {
                const communityData = [
                  { name: 'Q&A Questions', value: stats.totalQAQuestions || 0, color: '#E8B84B' },
                  { name: 'Q&A Replies', value: stats.totalQAReplies || 0, color: '#2A9D8F' },
                  { name: 'Conversations', value: stats.totalConversationPosts || 0, color: '#8B5CF6' },
                ];
                const total = communityData.reduce((s, d) => s + d.value, 0);
                return (
                  <div className="flex flex-col items-center">
                    <DonutChart
                      data={communityData}
                      size={150}
                      innerRadius={42}
                      outerRadius={62}
                      centerValue={total}
                      centerLabel="total"
                    />
                    <div className="mt-3 w-full">
                      <DonutLegend data={communityData} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Quiz Insights */}
        {quizInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Quiz Insights</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Summary card */}
              <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p style={TYPE_WIDGET_LABEL}>Overview</p>
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span style={TYPE_BODY}>Total quiz completions</span>
                    <span style={TYPE_STAT_VALUE}>{quizInsights.reduce((s, q) => s + q.count, 0)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span style={TYPE_BODY}>Unique quizzers</span>
                    <span style={TYPE_STAT_VALUE}>{quizTotalUsers}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span style={TYPE_BODY}>Quizzes available</span>
                    <span style={TYPE_STAT_VALUE}>{ALL_QUIZZES.length}</span>
                  </div>
                </div>
              </div>

              {/* Per-quiz breakdown cards */}
              {ALL_QUIZZES.map(quiz => {
                const results = quizInsights.filter(q => q.quizType === quiz.id);
                const total = results.reduce((s, r) => s + r.count, 0);
                if (total === 0) return null;
                return (
                  <div key={quiz.id} className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: quiz.accentColor }} />
                      <p style={TYPE_WIDGET_LABEL}>{quiz.shortTitle}</p>
                      <span className="ml-auto text-xs font-semibold" style={{ color: '#6B7280' }}>{total} taken</span>
                    </div>
                    <div className="space-y-2">
                      {results
                        .sort((a, b) => b.count - a.count)
                        .map(r => {
                          const resultConfig = quiz.results[r.resultKey];
                          const pct = Math.round((r.count / total) * 100);
                          return (
                            <div key={r.resultKey}>
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: '#374151' }}>{resultConfig?.title || r.resultKey}</span>
                                <span style={{ color: '#9CA3AF' }}>{pct}% ({r.count})</span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: resultConfig?.color || quiz.accentColor }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Cards */}
        <div className="mb-8">
          <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Manage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard
              title="Operations"
              description="Accounts, enrollments, reports, analytics"
              features={[
                'View and manage enrollments',
                'Export reports and data',
                'View analytics dashboards',
                'Manage user accounts',
                'Send bulk emails',
                'Certificate management',
              ]}
              href="/tdi-admin/hub/operations"
            />
            <SectionCard
              title="Production"
              description="Courses, content, Quick Wins, media"
              features={[
                'Create and edit courses',
                'Manage lessons and modules',
                'Publish/unpublish content',
                'Manage Quick Wins',
                'Upload videos and resources',
                'Content calendar',
              ]}
              href="/tdi-admin/hub/production"
            />
          </div>
        </div>

        {/* Support Triage */}
        <div className="mb-8">
          <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Support Triage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Common Issues */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} style={{ color: '#E8B84B' }} />
                <h3 style={TYPE_WIDGET_LABEL}>Common Issues</h3>
              </div>
              <div className="space-y-3">
                {[
                  { issue: 'Cannot log in', action: 'Check if email exists in user search above. If yes, send password reset. If no, create account manually in Operations > Accounts.' },
                  { issue: 'Content not loading', action: 'Check their membership tier. Free users only see rotating content. Verify their access_tier matches their membership.' },
                  { issue: 'Wrong membership tier', action: 'Go to Operations > Accounts, find the user, and update their hub_membership row. Source should match how they got access.' },
                ].map((item, i) => (
                  <details key={i} className="group">
                    <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between" style={{ color: '#1B2A4A' }}>
                      {item.issue}
                      <ChevronRight size={14} className="group-open:rotate-90 transition-transform" style={{ color: '#9CA3AF' }} />
                    </summary>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: '#6B7280' }}>{item.action}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} style={{ color: '#E8B84B' }} />
                <h3 style={TYPE_WIDGET_LABEL}>Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Link
                  href="/tdi-admin/hub/operations"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: '#374151' }}
                >
                  <User size={14} style={{ color: '#9CA3AF' }} />
                  Manage user accounts
                </Link>
                <Link
                  href="/tdi-admin/hub/production"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: '#374151' }}
                >
                  <FileText size={14} style={{ color: '#9CA3AF' }} />
                  Manage content
                </Link>
                <Link
                  href="/tdi-admin/hub/operations"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: '#374151' }}
                >
                  <Mail size={14} style={{ color: '#9CA3AF' }} />
                  Send bulk email
                </Link>
                <Link
                  href="/tdi-admin/hub/operations"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: '#374151' }}
                >
                  <Download size={14} style={{ color: '#9CA3AF' }} />
                  Export user data
                </Link>
              </div>
            </div>

            {/* Escalation Guide */}
            <div className="bg-white rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} style={{ color: '#E8B84B' }} />
                <h3 style={TYPE_WIDGET_LABEL}>Escalation Guide</h3>
              </div>
              <div className="space-y-3 text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1B2A4A' }}>Billing / Stripe issues</p>
                  <p>Escalate to Omar. Check Stripe dashboard for subscription status. Do not issue refunds without approval.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1B2A4A' }}>Content requests / creator issues</p>
                  <p>Route to CreatorStudio@teachersdeserveit.com. Holly can triage content-specific requests.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1B2A4A' }}>Technical bugs</p>
                  <p>Create a Paperclip issue in the Learning Hub project. Tag with priority. Include screenshots and user email.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1B2A4A' }}>Partnership / district questions</p>
                  <p>Route to Jim Ford. If urgent, escalate to Rae directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CMO Dashboard Widget — owners only */}
        {isOwner && (
          <div className="mb-8">
            <h2 className="mb-4" style={TYPE_SECTION_HEADER}>Executive</h2>
            <Link
              href="/tdi-admin/cmo"
              className="flex items-center justify-between bg-white rounded-xl p-5 border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)' }}
                >
                  <BarChart3 size={20} style={{ color: '#0D9488' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">CMO Dashboard</p>
                  <p className="text-xs text-gray-500 mt-0.5">Weekly metrics, ARR, TikTok, Substack, UTM tracking</p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200"
              />
            </Link>
          </div>
        )}

        {/* Quick Actions removed -- duplicated by Manage section cards above */}
      </div>
    </div>
  );
}
