'use client';

/**
 * Creator analytics.
 *
 * Publishing pipeline, topic coverage, geography, Hub impact and recruitment
 * sources.
 *
 * This was 1,776 lines of JSX sitting inside the creators page, reading state
 * that page happened to hold. It is a destination rather than something you
 * switch between while working, so it is a route now, and it fetches its own
 * data instead of borrowing the roster's.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Loader2, ArrowLeft, TrendingUp, Users, BookOpen, Download as DownloadIcon,
  Clock, Calendar, CalendarDays, Globe, MapPin, BarChart3, Trophy, Rocket,
  Hourglass, AlertTriangle, Target, Sparkles, Award, Star, Zap, Activity,
  ChevronDown, ChevronUp, HelpCircle, Palette, LayoutGrid, X, Check,
  Copy, FileText, Mail, MessageCircle, RefreshCw, Settings,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { HorizontalBarChart, DonutChart, DonutLegend, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts';
import { getTopicConfig, TOPIC_MAP } from '@/lib/data/creator-topics';
import { TOPIC_ICON_MAP, getRelativeTime, type DashboardData } from '@/components/tdi-admin/creators/shared';
import { copyToClipboard, formatEmailsForCopy } from '@/lib/tdi-admin/clipboard';

/** A coloured dot for a creator's status. The roster keeps its own richer version. */
function StatusIndicator({ status }: { status: string }) {
  const color =
    status === 'active' ? '#1f7a5c'
    : status === 'paused' ? '#b4680d'
    : status === 'withdrawn' ? '#b4322e'
    : '#c3cadd';
  return <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} title={status} />;
}
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import {
  TYPE_PAGE_TITLE, TYPE_PAGE_SUBTITLE, TYPE_SECTION_HEADER, TYPE_CARD_TITLE,
  TYPE_STAT_VALUE, TYPE_STAT_LABEL, TYPE_WIDGET_LABEL, TYPE_TABLE_HEADER,
} from '@/components/tdi-admin/ui/design-tokens';

const theme = PORTAL_THEMES.creators;

/** Loose shapes for the three endpoints that have no typed contract yet. */
type Loose = { [key: string]: any };
type HubCreatorData = Loose & {
  topContent: any[];
  contentRequests: any[];
  categoryPerformance: Record<string, any>;
};
type AnalyticsData = Loose & {
  success?: boolean;
  // Every array the markup walks, declared as any[] so the callbacks over them
  // get a parameter type. The endpoint has no typed contract yet; this is the
  // same looseness the parent had, said once instead of fifty times.
  phaseVelocity: any[];
  topicCoverage: any[];
  publishingTrend: any[];
  activityHeatmap: any[];
  bottleneckReport: any[];
  completionFunnel: any[];
  contentPathBreakdown: any[];
  eventEngagementHeatmap: any[];
  eventFunnelAnalysis: any[];
  geographicDistribution: Loose & { states: any[] };
  journeyTimes: any[];
  publishedPerMonth: any[];
  realtimeActivityFeed: any[];
  selfCompleteRatio: any[];
  stalledCreators: any[];
};
type LocationData = Loose & { topStates: any[] };
type RecruitmentSourceData = Loose & { creators_by_source?: Record<string, any>; conversion_rates?: Record<string, any> };


const USMapChart = dynamic(() => import('@/components/tdi-admin/USMapChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
    </div>
  ),
});

function StatCard({
  label,
  value,
  isActive,
  onClick,
  status,
}: {
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  status: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl p-5 text-left cursor-pointer relative overflow-hidden border border-gray-100"
      style={{
        boxShadow: isActive
          ? '0 8px 28px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        borderColor: isActive ? 'rgba(139, 92, 246, 0.5)' : undefined,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(139, 92, 246, 0.1), 0 2px 8px rgba(0,0,0,0.06)';
          const topBar = e.currentTarget.querySelector('.stat-top-bar') as HTMLElement;
          if (topBar) topBar.style.background = '#1e2749';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#F3F4F6';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
          const topBar = e.currentTarget.querySelector('.stat-top-bar') as HTMLElement;
          if (topBar) topBar.style.background = 'transparent';
        }
      }}
    >
      {/* Accent top bar - revealed on hover/active */}
      <div
        className="stat-top-bar absolute top-0 left-0 right-0 h-0.5"
        style={{ background: isActive ? '#1e2749' : 'transparent', transition: 'background 0.25s' }}
      />

      <div className="mb-2" style={TYPE_WIDGET_LABEL}>{label}</div>
      <div className="leading-none mb-2" style={{ ...TYPE_STAT_VALUE, color: '#111827' }}>{value}</div>

      {/* Status indicator */}
      <StatusIndicator status={status} />
    </button>
  );
}

// ==========================================
// Projected Publishing Pipeline Component
// ==========================================

interface PipelineData {
  forecast: { month: string; monthLabel: string; download: number; course: number; total: number }[];
  detailList: { month: string; monthLabel: string; count: number; creators: { id: string; name: string; email: string; contentPath: string | null; projectedPublishDate: string | null }[] }[];
  noProjectedDate: { id: string; name: string; email: string; contentPath: string | null }[];
  pastProjectedDate: { id: string; name: string; email: string; contentPath: string | null; projectedCompletionDate: string | null; daysOverdue: number }[];
}

function ProjectedPublishingPipeline({ data }: { data: PipelineData }) {
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [showNoDateModal, setShowNoDateModal] = useState(false);
  const [showPastDateModal, setShowPastDateModal] = useState(false);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        Projected Publishing Pipeline
      </h2>

      {/* Warning Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Callout A: No projected date */}
        <button
          onClick={() => data.noProjectedDate.length > 0 && setShowNoDateModal(true)}
          className={`bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-left transition-all ${
            data.noProjectedDate.length > 0 ? 'hover:shadow-md cursor-pointer' : ''
          }`}
          style={data.noProjectedDate.length > 0 ? { borderLeft: '3px solid #6B7280' } : {}}
          disabled={data.noProjectedDate.length === 0}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
              <CalendarDays className="w-5 h-5" style={{ color: '#374151' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Creators with no projected date</p>
              <p className="text-2xl font-bold text-gray-900">{data.noProjectedDate.length}</p>
            </div>
          </div>
          {data.noProjectedDate.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Click to view list</p>
          )}
        </button>

        {/* Callout B: Past projected date */}
        <button
          onClick={() => data.pastProjectedDate.length > 0 && setShowPastDateModal(true)}
          className={`bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-left transition-all ${
            data.pastProjectedDate.length > 0 ? 'hover:shadow-md cursor-pointer' : ''
          }`}
          style={data.pastProjectedDate.length > 0 ? { borderLeft: '3px solid #6B7280' } : {}}
          disabled={data.pastProjectedDate.length === 0}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
              <Clock className="w-5 h-5" style={{ color: '#374151' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Creators past their projected date</p>
              <p className="text-2xl font-bold text-gray-900">{data.pastProjectedDate.length}</p>
            </div>
          </div>
          {data.pastProjectedDate.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">These creators may need a check-in. Click to view.</p>
          )}
        </button>
      </div>

      {/* Pipeline Forecast Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-5">
        <h3 className="mb-1" style={TYPE_CARD_TITLE}>
          Pipeline Forecast
        </h3>
        <p className="text-sm text-gray-500 mb-4">Projected content launches by month</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.forecast}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="download" stackId="a" fill="#ffba06" name="Quick Tool (Download)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="course" stackId="a" fill="#1e2749" name="Course" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.forecast.every(m => m.total === 0) && (
          <p className="text-sm text-gray-400 text-center mt-2">
            No projected publish dates set yet
          </p>
        )}
      </div>

      {/* Detail List — Grouped by Month */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4" style={TYPE_CARD_TITLE}>
          Monthly Detail
        </h3>
        <div className="space-y-1">
          {data.detailList.map(month => {
            const isExpanded = expandedMonths[month.month] ?? false;
            return (
              <div key={month.month} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleMonth(month.month)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-900">{month.monthLabel}</span>
                    <span className="text-xs text-gray-400">({month.count} creator{month.count !== 1 ? 's' : ''})</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-gray-50">
                    {month.creators.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">No creators projected for this month</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {month.creators.map(creator => (
                          <div key={creator.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                {creator.name.charAt(0).toUpperCase()}
                              </div>
                              <Link
                                href={`/tdi-admin/creators/${creator.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-slate-700 transition-colors"
                              >
                                {creator.name}
                              </Link>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                creator.contentPath === 'course'
                                  ? 'bg-slate-100 text-slate-800'
                                  : 'bg-slate-50 text-slate-700'
                              }`}>
                                {creator.contentPath === 'course' ? 'Course' : 'Quick Tool (Download)'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              publishes by {creator.projectedPublishDate
                                ? new Date(creator.projectedPublishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* No Projected Date Modal */}
      {showNoDateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                  <CalendarDays className="w-5 h-5" style={{ color: '#374151' }} />
                </div>
                <div>
                  <h2 style={TYPE_CARD_TITLE}>No Projected Date</h2>
                  <p className="text-sm text-gray-500">{data.noProjectedDate.length} creator{data.noProjectedDate.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoDateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="divide-y divide-gray-100">
                {data.noProjectedDate.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/tdi-admin/creators/${creator.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-slate-700 transition-colors"
                      >
                        {creator.name}
                      </Link>
                      <p className="text-xs text-gray-400">{creator.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      creator.contentPath === 'course'
                        ? 'bg-slate-100 text-slate-800'
                        : creator.contentPath === 'download'
                        ? 'bg-slate-50 text-slate-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {creator.contentPath || 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Projected Date Modal */}
      {showPastDateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                  <Clock className="w-5 h-5" style={{ color: '#374151' }} />
                </div>
                <div>
                  <h2 style={TYPE_CARD_TITLE}>Past Projected Date</h2>
                  <p className="text-sm text-gray-500">These creators may need a check-in</p>
                </div>
              </div>
              <button
                onClick={() => setShowPastDateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="divide-y divide-gray-100">
                {data.pastProjectedDate.map((creator: PipelineData['pastProjectedDate'][number]) => (
                  <div key={creator.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/tdi-admin/creators/${creator.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-slate-700 transition-colors"
                      >
                        {creator.name}
                      </Link>
                      <p className="text-xs text-gray-400">
                        Projected: {creator.projectedCompletionDate
                          ? new Date(creator.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '\u2014'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-gray-700">
                      {creator.daysOverdue} day{creator.daysOverdue !== 1 ? 's' : ''} overdue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// AFFILIATE TAB COMPONENT
// =============================================================================

function DashboardRefSection({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-3 text-left group"
      >
        <div className="flex-grow h-px bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 group-hover:text-gray-600 whitespace-nowrap flex items-center gap-1.5">
          {isOpen ? 'Hide' : 'Show'} Reference & Details
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
        <div className="flex-grow h-px bg-gray-200" />
      </button>
      {isOpen && <div className="mt-4 space-y-5">{children}</div>}
    </div>
  );
}

export default function CreatorAnalyticsPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [hubCreatorData, setHubCreatorData] = useState<HubCreatorData | null>(null);
  const [hubCreatorLoading, setHubCreatorLoading] = useState(true);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [recruitmentSourceData, setRecruitmentSourceData] = useState<RecruitmentSourceData | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    // Each of these used to be fired by the parent page on tab change. They
    // belong to this screen, so they live here now.
    fetch('/api/admin/dashboard-data')
      .then(r => r.json())
      .then(d => { if (d?.success) setDashboardData(d); })
      .catch(err => console.error('[creator analytics] dashboard data failed:', err));

    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => setAnalyticsData(d))
      .catch(err => console.error('[creator analytics] analytics failed:', err))
      .finally(() => setAnalyticsLoading(false));

    fetch('/api/tdi-admin/hub-connections')
      .then(r => r.json())
      .then(d => setHubCreatorData(d))
      .catch(err => console.error('[creator analytics] hub connections failed:', err))
      .finally(() => setHubCreatorLoading(false));

    fetch('/api/admin/creator-locations')
      .then(r => r.json())
      .then(d => { if (!d?.error) setLocationData(d); })
      .catch(err => console.error('[creator analytics] locations failed:', err));

    fetch('/api/admin/recruitment-analytics')
      .then(r => r.json())
      .then(d => setRecruitmentSourceData(d))
      .catch(err => console.error('[creator analytics] recruitment sources failed:', err));
  }, []);

  // The markup below all sits inside a dashboardData guard. Aliasing once is
  // honest about that; adding optional chaining to 1,700 lines of JSX would not
  // be, since it would silently render blanks instead of failing loudly.
  // Empty rather than asserted. Whether this sits inside the dashboardData
  // guard depends on where a block 400 lines up happens to close, and a screen
  // that throws while its data is still loading is not worth that bet.
  const dashboardData_ = (dashboardData ?? { creators: [] }) as DashboardData;
  const creators = dashboardData?.creators || [];

  // These come off the same dashboard-data response the roster reads. They were
  // destructured by the parent and handed down implicitly; now they are read
  // here, from the same source, so the two screens cannot drift apart.
  // The JSX below only renders inside a dashboardData guard, which is why
  // this asserts rather than defaulting to an empty object.
  const stats = dashboardData?.stats as DashboardData['stats'];
  const phaseCounts: Record<string, number> = dashboardData?.phaseCounts || {};
  const pathCounts: Record<string, number> = dashboardData?.pathCounts || {};
  const closestToLaunch = dashboardData?.closestToLaunch as DashboardData['closestToLaunch'];
  const recentActivity = dashboardData?.recentActivity || [];
  const recentEmails: any[] = (dashboardData as Loose | null)?.recentEmails || [];
  const maxPhaseCount = Math.max(...Object.values(phaseCounts).map(Number), 1);

  // Analytics is a place you look, not a place you filter the roster from, so
  // the three click-to-filter handlers send you to the roster instead of
  // pretending to filter a table that is not on this page.
  const goToRoster = (query: string) => router.push(`/tdi-admin/creators${query}`);
  const handleStatCardClick = (filter: string | null) =>
    goToRoster(filter ? `?stat=${encodeURIComponent(filter)}` : '');
  const handlePhaseClick = (phase: string) => goToRoster(`?phase=${encodeURIComponent(phase)}`);
  const handlePathClick = (path: string) => goToRoster(`?path=${encodeURIComponent(path)}`);
  const activeStatFilter: string | null = null;

  const handleCopyEmails = async (emails: string[], sectionId: string) => {
    const ok = await copyToClipboard(formatEmailsForCopy(emails));
    if (ok) {
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  // Following someone up belongs on the roster, where the modal lives.
  const openFollowUpModal = (id: string) => goToRoster(`?followUp=${encodeURIComponent(id)}`);


  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Link
        href="/tdi-admin/creators"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Creator Studio
      </Link>
      <h1 style={TYPE_PAGE_TITLE} className="mb-4">Analytics</h1>
        <div className="space-y-8">
          {/* Loading State */}
          {analyticsLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#1e2749' }} />
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          )}

          {/* Hub Content Impact */}
          {hubCreatorData && (
            <div className="space-y-4">
              <LiveSectionHeader title="Hub Content Impact" subtitle="How creator content performs on the Learning Hub -- views, community engagement, and Q&A activity" />

              {/* Two columns: impact bar chart + category donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Impact score bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Top Content by Impact Score</p>
                  <HorizontalBarChart
                    data={hubCreatorData.topContent.slice(0, 12).map(c => ({
                      label: c.title.length > 28 ? c.title.slice(0, 28) + '...' : c.title,
                      value: c.impactScore,
                      color: '#EAB308',
                    }))}
                    valueFormatter={(v) => `${v} pts`}
                  />
                </div>

                {/* Category performance donut */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Views by Category</p>
                  {(() => {
                    const catEntries = Object.entries(hubCreatorData.categoryPerformance as Record<string, any>).sort((a, b) => b[1].views - a[1].views);
                    const totalViews = catEntries.reduce((s, [, p]) => s + p.views, 0);
                    return catEntries.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <DonutChart
                          data={catEntries.slice(0, 8).map(([name, p]) => ({ name, value: p.views }))}
                          size={180}
                          innerRadius={48}
                          outerRadius={72}
                          centerValue={totalViews}
                          centerLabel="total views"
                        />
                        <div className="mt-3 w-full">
                          <DonutLegend data={catEntries.slice(0, 6).map(([name, p]) => ({ name, value: p.views }))} />
                        </div>
                      </div>
                    ) : <p className="text-center text-gray-400 text-sm py-8">No category data</p>;
                  })()}
                </div>
              </div>

              {/* Category detail cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(hubCreatorData.categoryPerformance as Record<string, any>)
                  .sort((a, b) => b[1].views - a[1].views)
                  .slice(0, 8)
                  .map(([cat, perf]) => (
                    <div key={cat} className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{cat}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#1e2749' }}>{perf.views}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF' }}>{perf.contentCount} tools / {perf.responses} responses / {perf.qaThreads} Q&A</p>
                    </div>
                  ))
                }
              </div>

              {/* Content requests */}
              {hubCreatorData.contentRequests.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Educator Content Requests</h3>
                  <div className="space-y-2">
                    {hubCreatorData.contentRequests.map((req, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderRadius: 8, backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                        <p style={{ fontSize: 13, color: '#374151' }}>{String(req.request)}</p>
                        <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>{new Date(req.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {hubCreatorLoading && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center text-gray-400 text-sm">
              Loading Hub content data...
            </div>
          )}

          {/* Stat Cards -- moved from Action Center */}
          {dashboardData && (
            <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <StatCard
              label="Total"
              value={stats.total}
              isActive={false}
              onClick={() => handleStatCardClick(null)}
              status="total"
            />
            <StatCard
              label="Stalled"
              value={stats.stalled}
              isActive={activeStatFilter === 'stalled'}
              onClick={() => handleStatCardClick('stalled')}
              status="stalled"
            />
            <StatCard
              label="Followed Up"
              value={stats.followedUp}
              isActive={activeStatFilter === 'followedUp'}
              onClick={() => handleStatCardClick('followedUp')}
              status="followedUp"
            />
            <StatCard
              label="Waiting on Creator"
              value={stats.waitingOnCreator}
              isActive={activeStatFilter === 'waitingOnCreator'}
              onClick={() => handleStatCardClick('waitingOnCreator')}
              status="waitingOnCreator"
            />
            <StatCard
              label="Waiting on TDI"
              value={stats.waitingOnTDI}
              isActive={activeStatFilter === 'waitingOnTDI'}
              onClick={() => handleStatCardClick('waitingOnTDI')}
              status="waitingOnTDI"
            />
            <StatCard
              label="Launched"
              value={stats.launched}
              isActive={activeStatFilter === 'launched'}
              onClick={() => handleStatCardClick('launched')}
              status="launched"
            />
          </div>

          {/* Creator Pipeline + Closest to Launch -- side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Pipeline Funnel */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4" style={TYPE_SECTION_HEADER}>
                Creator Pipeline
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'onboarding', label: 'Onboarding', color: '#1e2749' },
                  { key: 'agreement', label: 'Agreement', color: '#A78BFA' },
                  { key: 'course_design', label: 'Prep & Resources', color: '#A78BFA' },
                  { key: 'test_prep', label: 'Production', color: '#C4B5FD' },
                  { key: 'launch', label: 'Launch', color: '#ffba06' },
                ].map((phase) => {
                  const count = phaseCounts[phase.key as keyof typeof phaseCounts];
                  const widthPercent = Math.max((count / maxPhaseCount) * 100, 5);
                  const isLaunch = phase.key === 'launch';
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
                        <div className="flex-1 h-8 bg-gray-100 rounded-md overflow-hidden">
                          {count > 0 ? (
                            <div
                              className="h-full rounded-md flex items-center gap-1 pl-2 transition-all duration-500 group-hover:brightness-110"
                              style={{
                                width: `${widthPercent}%`,
                                minWidth: '40px',
                                background: phase.color,
                              }}
                            >
                              {isLaunch && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              <span className="text-white text-xs font-semibold">{count}</span>
                            </div>
                          ) : (
                            <div className="h-full w-1 rounded-md" style={{ background: phase.color }} />
                          )}
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
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={TYPE_SECTION_HEADER}>
                  <Trophy className="w-5 h-5 text-gray-600" />
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
                        ? 'bg-green-50 text-yellow-600 border border-green-200'
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
                    const isNearLaunch = creator.progressPercentage >= 90;
                    const progressColor = isNearLaunch ? '#ffba06' : '#1e2749';
                    return (
                      <Link
                        key={creator.id}
                        href={`/tdi-admin/creators/${creator.id}`}
                        className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0 ring-2 ring-white shadow-sm"
                          style={{ background: '#1e2749' }}
                        >
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900 group-hover:text-slate-700 transition-colors">
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
                          {isNearLaunch ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3.5 h-3.5 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#ffba06" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <span className="text-xs font-bold" style={{ color: '#ffba06' }}>{creator.progressPercentage}%</span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold w-9 text-right" style={{ color: '#1e2749' }}>{creator.progressPercentage}%</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recently Published + Content Paths -- side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recently Published */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              {(() => {
                const published = dashboardData.creators
                  .filter(c => c.publish_status === 'published' || c.progress?.isComplete === true)
                  .sort((a, b) => {
                    const dateA = a.published_date ? new Date(a.published_date) : new Date(a.lastActivityDate);
                    const dateB = b.published_date ? new Date(b.published_date) : new Date(b.lastActivityDate);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .slice(0, 5);

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2" style={TYPE_SECTION_HEADER}>
                        <Globe className="w-5 h-5 text-yellow-500" />
                        Recently Published
                      </h3>
                      {published.length > 0 && (
                        <button
                          onClick={() => handleCopyEmails(published.map(c => c.email), 'published')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                            copiedSection === 'published'
                              ? 'bg-green-50 text-yellow-600 border border-green-200'
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
                              <p className="text-sm font-medium truncate text-gray-900 group-hover:text-yellow-600 transition-colors">
                                {creator.name}
                              </p>
                              {creator.post_launch_notes && (
                                <p className="text-xs text-gray-700 bg-amber-50 px-2 py-1 rounded-lg mt-1 truncate flex items-center gap-1">
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

            {/* Content Paths */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                Content Paths
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'blog', icon: FileText, label: 'Blog', count: pathCounts.blog, color: theme.accent },
                  { key: 'download', icon: DownloadIcon, label: 'Quick Tool (Download)', count: pathCounts.download, color: theme.accent },
                  { key: 'course', icon: BookOpen, label: 'Course', count: pathCounts.course, color: theme.accent },
                  { key: 'notSet', icon: HelpCircle, label: 'Not Set', count: pathCounts.notSet, color: '#E8927C' },
                ].map((path) => {
                  const IconComponent = path.icon;
                  return (
                    <button
                      key={path.key}
                      onClick={() => handlePathClick(path.key)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: theme.accentLight }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: path.color }} />
                      </div>
                      <div>
                        <p className="leading-none" style={{ ...TYPE_STAT_VALUE, color: theme.accent }}>{path.count}</p>
                        <p className="text-sm text-gray-500">{path.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scheduled for Launch -- only renders if there are scheduled creators */}
          {(() => {
            const scheduled = dashboardData.creators
              .filter(c => c.publish_status === 'scheduled' && c.scheduled_publish_date)
              .sort((a, b) => new Date(a.scheduled_publish_date!).getTime() - new Date(b.scheduled_publish_date!).getTime())
              .slice(0, 5);

            if (scheduled.length === 0) return null;

            return (
              <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2" style={TYPE_SECTION_HEADER}>
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    Scheduled for Launch
                  </h3>
                  <button
                    onClick={() => handleCopyEmails(scheduled.map(c => c.email), 'scheduled')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                      copiedSection === 'scheduled'
                        ? 'bg-green-50 text-yellow-600 border border-green-200'
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
                </div>
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
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: '#1e2749' }}
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
                        <div className={`text-xs flex-shrink-0 px-2 py-0.5 rounded ${isPastDue ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isPastDue ? 'Past due' : scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
            </>
          )}

          {/* Analytics Content */}
          {!analyticsLoading && analyticsData && (
            <>
              {/* ==========================================
                  SECTION 0: TOPIC DISTRIBUTION
                  ========================================== */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Topic Distribution
                </h2>
                <p className="text-sm text-gray-500 mb-4">How many creators across each topic. Empty topics highlight recruiting gaps.</p>

                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-6">
                  {(() => {
                    const topicCounts: Record<string, number> = {};
                    Object.keys(TOPIC_ICON_MAP).forEach((iconName) => {});
                    Object.keys({}).forEach(() => {});
                    const allTopics = Object.entries(TOPIC_MAP) as Array<[string, any]>;
                    allTopics.forEach(([name]) => { topicCounts[name] = 0; });
                    dashboardData_.creators.forEach((creator: any) => {
                      if (creator.topic && topicCounts[creator.topic] !== undefined) topicCounts[creator.topic]++;
                      if (Array.isArray(creator.secondary_topics)) {
                        creator.secondary_topics.forEach((st: string) => {
                          if (topicCounts[st] !== undefined) topicCounts[st]++;
                        });
                      }
                    });
                    const sorted = allTopics.sort((a, b) => topicCounts[b[0]] - topicCounts[a[0]]);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {sorted.map(([topicName, config]) => {
                          const count = topicCounts[topicName] || 0;
                          const Icon = TOPIC_ICON_MAP[config.icon] || Sparkles;
                          const isEmpty = count === 0;
                          return (
                            <div
                              key={topicName}
                              className="flex items-center gap-2 p-2 rounded-lg"
                              style={{
                                background: isEmpty ? '#F9FAFB' : config.background,
                                border: isEmpty ? '1px dashed #E5E7EB' : `1px solid ${config.border}`,
                                opacity: isEmpty ? 0.6 : 1,
                              }}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: isEmpty ? '#F3F4F6' : 'white' }}
                              >
                                <Icon style={{ width: 16, height: 16, color: isEmpty ? '#9CA3AF' : config.iconColor }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate" style={{ color: isEmpty ? '#9CA3AF' : '#1e2749' }}>{topicName}</p>
                                <p className="text-xs" style={{ color: isEmpty ? '#9CA3AF' : config.iconColor, fontWeight: 600 }}>
                                  {count} creator{count === 1 ? '' : 's'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ==========================================
                  SECTION 1: PIPELINE HEALTH
                  ========================================== */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Pipeline Health
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* A. Creator Velocity — Average Time Per Phase */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Creator Velocity
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Average days spent in each phase</p>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.phaseVelocity} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                          <Tooltip
                            formatter={(value: number) => [`${value} days`, 'Avg Time']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="avgDays" radius={[0, 8, 8, 0]}>
                            {analyticsData.phaseVelocity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Based on {analyticsData.phaseVelocity.reduce((sum, p) => sum + p.sampleSize, 0)} phase completions
                    </p>
                  </div>

                  {/* B. Bottleneck Report */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Bottleneck Report
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Milestones where creators get stuck</p>
                    {analyticsData.bottleneckReport.length === 0 ? (
                      <p className="text-sm text-gray-400 py-8 text-center">No bottlenecks detected</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                              <th className="pb-2 font-medium">Milestone</th>
                              <th className="pb-2 font-medium">Phase</th>
                              <th className="pb-2 font-medium text-right">Avg Days</th>
                              <th className="pb-2 font-medium text-right">Stuck</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {analyticsData.bottleneckReport.slice(0, 10).map((item) => (
                              <tr
                                key={item.id}
                                className={item.currentlyStuck > 3 ? 'bg-amber-50' : ''}
                              >
                                <td className="py-2 pr-2 font-medium text-gray-900 truncate max-w-[150px]">
                                  {item.name}
                                </td>
                                <td className="py-2 pr-2 text-gray-500 text-xs">
                                  {item.phase}
                                </td>
                                <td className="py-2 text-right text-gray-600">
                                  {item.avgDays}
                                </td>
                                <td className="py-2 text-right">
                                  <span className={`font-semibold ${item.currentlyStuck > 3 ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {item.currentlyStuck}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* C. Content Path Breakdown */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Content Path Breakdown
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.contentPathBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {analyticsData.contentPathBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number, name: string) => [`${value} creators (${analyticsData.contentPathBreakdown.find(p => p.name === name)?.percent || 0}%)`, name]}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {analyticsData.contentPathBreakdown.map((item) => (
                          <div key={item.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                            <span className="text-xs text-gray-400 w-10 text-right">{item.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content Path Trends */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      New Creators Over Time
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.contentPathTrends}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="course" stackId="a" fill="#1e2749" radius={[0, 0, 0, 0]} name="Course" />
                          <Bar dataKey="blog" stackId="a" fill="#1e2749" name="Blog" />
                          <Bar dataKey="download" stackId="a" fill="#ffba06" name="Quick Tool (Download)" />
                          <Bar dataKey="notSet" stackId="a" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Not Set" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* D. Creator Activity Heatmap */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-2" style={TYPE_CARD_TITLE}>
                      Creator Activity Heatmap
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Recent activity by creator (sorted by most dormant)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto">
                      {analyticsData.activityHeatmap.slice(0, 40).map((creator) => {
                        const colors = {
                          green: 'bg-yellow-500',
                          yellow: 'bg-yellow-500',
                          orange: 'bg-gray-500',
                          red: 'bg-gray-500',
                        };
                        const bgColors = {
                          green: 'bg-yellow-50 hover:bg-yellow-100',
                          yellow: 'bg-yellow-50 hover:bg-yellow-100',
                          orange: 'bg-gray-50 hover:bg-gray-100',
                          red: 'bg-gray-50 hover:bg-gray-100',
                        };
                        return (
                          <Link
                            key={creator.id}
                            href={`/tdi-admin/creators/${creator.id}`}
                            className={`p-2 rounded-xl ${bgColors[creator.activityLevel as keyof typeof bgColors]} transition-colors cursor-pointer`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${colors[creator.activityLevel as keyof typeof colors]}`} />
                              <span className="text-xs font-medium text-gray-700 truncate">
                                {creator.initials}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 truncate">{creator.name}</p>
                            <p className="text-[10px] text-gray-400">{creator.daysSinceActivity}d</p>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 0-7 days</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 8-14 days</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500" /> 15-30 days</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500" /> 30+ days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==========================================
                  SECTION 2: CONVERSION & COMPLETION
                  ========================================== */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Conversion & Completion
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* E. Time from Intake to Launch */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Time to Launch
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Total journey time for launched creators</p>
                    {analyticsData.journeyTimes.length < 3 ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-sm text-gray-400 text-center">
                          More data will appear as creators complete their journeys
                        </p>
                      </div>
                    ) : (
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.journeyTimes.slice(0, 10)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit=" days" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip
                              formatter={(value: number) => [`${value} days`, 'Journey Time']}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="days" radius={[0, 8, 8, 0]}>
                              {analyticsData.journeyTimes.slice(0, 10).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.contentPath === 'course' ? '#1e2749' : entry.contentPath === 'blog' ? '#1e2749' : entry.contentPath === 'download' ? '#ffba06' : '#9CA3AF'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* F. Completion Funnel */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Completion Funnel
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Creator progression through phases</p>
                    <div className="space-y-2">
                      {analyticsData.completionFunnel.map((stage, index) => {
                        const colors = ['#1e2749', '#2B3A67', '#475569', '#94A3B8', '#CBD5E1', '#ffba06'];
                        return (
                          <div key={stage.phase} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-gray-600 truncate">{stage.name}</div>
                            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                                style={{
                                  width: `${stage.percent}%`,
                                  backgroundColor: colors[index] || '#1e2749',
                                  minWidth: stage.count > 0 ? '50px' : '0',
                                }}
                              >
                                {stage.count > 0 && (
                                  <span className="text-white text-xs font-semibold">{stage.count}</span>
                                )}
                              </div>
                            </div>
                            <div className="w-12 text-right text-sm font-medium text-gray-600">
                              {stage.percent}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* G. Stalled Creator Alerts */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="flex items-center gap-2" style={TYPE_CARD_TITLE}>
                          Stalled Creator Alerts
                          {analyticsData.stalledCreators.length > 0 && (
                            <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-amber-100 text-gray-700">
                              {analyticsData.stalledCreators.length} creators
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">Creators with no activity in 14+ days</p>
                      </div>
                      {analyticsData.stalledCreators.length > 0 && (
                        <button
                          onClick={() => handleCopyEmails(analyticsData.stalledCreators.map(c => c.email), 'stalledAnalytics')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            copiedSection === 'stalledAnalytics'
                              ? 'bg-green-50 text-yellow-600 border border-green-200'
                              : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {copiedSection === 'stalledAnalytics' ? (
                            <><Check className="w-3.5 h-3.5" /> Copied!</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy Emails</>
                          )}
                        </button>
                      )}
                    </div>
                    {analyticsData.stalledCreators.length === 0 ? (
                      <div className="flex items-center gap-2 text-yellow-600 py-4">
                        <Check className="w-5 h-5" />
                        <p className="text-sm">All caught up! No stalled creators.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                              <th className="pb-2 font-medium">Creator</th>
                              <th className="pb-2 font-medium">Content Path</th>
                              <th className="pb-2 font-medium">Current Step</th>
                              <th className="pb-2 font-medium text-right">Days Stalled</th>
                              <th className="pb-2 font-medium text-right">Last Activity</th>
                              <th className="pb-2 font-medium text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {analyticsData.stalledCreators.map((creator) => {
                              const bgColor = {
                                yellow: 'bg-yellow-50',
                                orange: 'bg-gray-50',
                                red: 'bg-gray-50',
                              };
                              return (
                                <tr
                                  key={creator.id}
                                  className={`${bgColor[creator.severity as keyof typeof bgColor]} hover:brightness-95 transition-all`}
                                >
                                  <td
                                    className="py-3 pr-2 cursor-pointer"
                                    onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                        {creator.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-medium text-gray-900">{creator.name}</span>
                                    </div>
                                  </td>
                                  <td
                                    className="py-3 pr-2 text-gray-500 capitalize cursor-pointer"
                                    onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  >
                                    {creator.contentPath || 'Not set'}
                                  </td>
                                  <td
                                    className="py-3 pr-2 text-gray-600 truncate max-w-[200px] cursor-pointer"
                                    onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  >
                                    {creator.currentStep || '-'}
                                  </td>
                                  <td
                                    className="py-3 text-right font-semibold text-gray-700 cursor-pointer"
                                    onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  >
                                    {creator.daysSinceActivity}
                                  </td>
                                  <td
                                    className="py-3 text-right text-gray-500 cursor-pointer"
                                    onClick={() => window.location.href = `/tdi-admin/creators/${creator.id}`}
                                  >
                                    {new Date(creator.lastActivityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-3 text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openFollowUpModal(creator.id);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-200 transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      Mark Followed Up
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ==========================================
                  SECTION 3: OUTPUT & GROWTH
                  ========================================== */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Output & Growth
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* H. Content Published Per Month */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Content Published Per Month
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.publishedPerMonth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Bar dataKey="courses" fill="#1e2749" name="Courses" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="blogs" fill="#1e2749" name="Blogs" radius={[4, 4, 0, 0]} />
                          <Line type="monotone" dataKey="cumulativeCourses" stroke="#1e2749" strokeWidth={2} dot={false} name="Total Courses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {analyticsData.publishedPerMonth.every(m => m.total === 0) && (
                      <p className="text-sm text-gray-400 text-center mt-2">
                        Track will build as more creators launch
                      </p>
                    )}
                  </div>

                  {/* I. Geographic Distribution */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-4" style={TYPE_CARD_TITLE}>
                      Geographic Distribution
                    </h3>
                    {!analyticsData.geographicDistribution.hasData ? (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          Geographic data will appear once creator locations are captured
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          This can be added to the creator intake form
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="space-y-2">
                            {analyticsData.geographicDistribution.states.slice(0, 10).map((item, index) => (
                              <div key={item.state} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-400 w-4">{index + 1}</span>
                                <span className="text-sm text-gray-700 w-24">{item.state}</span>
                                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${item.percent}%`, backgroundColor: '#1e2749' }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-600 w-8 text-right">{item.count}</span>
                                <span className="text-xs text-gray-400 w-10 text-right">{item.percent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-slate-50 rounded-xl p-4 text-center">
                            <p style={{ ...TYPE_STAT_VALUE, color: '#1e2749' }}>{analyticsData.geographicDistribution.withState}</p>
                            <p className="text-sm text-gray-600">With Location</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p style={{ ...TYPE_STAT_VALUE, color: '#9CA3AF' }}>{analyticsData.geographicDistribution.withoutState}</p>
                            <p className="text-sm text-gray-500">Not Shared</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ==========================================
                  SECTION 5: PROJECTED PUBLISHING PIPELINE
                  ========================================== */}
              {analyticsData.publishingPipeline && (
                <ProjectedPublishingPipeline data={analyticsData.publishingPipeline} />
              )}

              {/* ==========================================
                  SECTION 4: EVENT-DRIVEN INSIGHTS (overlay)
                  ========================================== */}
              {(analyticsData.realtimeActivityFeed?.length ?? 0) > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-100">
                    Event-Driven Insights
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Live data from milestone_events — self-complete vs admin-advance signals, frequency-based engagement, and event-sourced funnel.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* K. Real-time Activity Feed */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <h3 className="mb-1" style={TYPE_CARD_TITLE}>Recent Activity</h3>
                      <p className="text-sm text-gray-500 mb-4">Latest milestone completions from the event log</p>
                      <div className="space-y-2 max-h-[320px] overflow-y-auto">
                        {analyticsData.realtimeActivityFeed?.slice(0, 20).map((event) => (
                          <div key={event.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              event.triggerType === 'self_complete' ? 'bg-yellow-400' :
                              event.triggerType === 'admin_advance' ? 'bg-slate-700' : 'bg-gray-300'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{event.creatorName}</p>
                              <p className="text-xs text-gray-500 truncate">{event.milestoneName}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                event.triggerType === 'self_complete' ? 'bg-green-50 text-yellow-700' :
                                event.triggerType === 'admin_advance' ? 'bg-slate-50 text-slate-700' : 'bg-gray-50 text-gray-500'
                              }`}>
                                {event.triggerLabel}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* L. Self-Complete vs Admin-Advance Ratio */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <h3 className="mb-1" style={TYPE_CARD_TITLE}>Self-Complete Ratio</h3>
                      <p className="text-sm text-gray-500 mb-4">Creator-driven vs admin-driven completions per content path</p>
                      <div className="space-y-4">
                        {analyticsData.selfCompleteRatio?.filter(r => r.total > 0).map((row) => (
                          <div key={row.contentPath}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">{row.contentPath}</span>
                              <span className="text-xs text-gray-400">{row.total} completions</span>
                            </div>
                            <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-yellow-400 transition-all"
                                style={{ width: `${row.selfCompletePercent}%` }}
                                title={`Self-complete: ${row.selfCompletePercent}%`}
                              />
                              <div
                                className="h-full bg-slate-700 transition-all"
                                style={{ width: `${row.adminAdvancePercent}%` }}
                                title={`Admin advance: ${row.adminAdvancePercent}%`}
                              />
                            </div>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs text-yellow-600">{row.selfCompletePercent}% self</span>
                              <span className="text-xs text-slate-700">{row.adminAdvancePercent}% admin</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <span className="text-xs text-gray-500">Self-Complete</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-slate-700" />
                          <span className="text-xs text-gray-500">Admin Advance</span>
                        </div>
                      </div>
                    </div>

                    {/* M. Event Engagement Heatmap */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <h3 className="mb-1" style={TYPE_CARD_TITLE}>Engagement Frequency</h3>
                      <p className="text-sm text-gray-500 mb-4">Based on event count (last 30 days), not just last-touch date</p>
                      <div className="flex gap-3 mb-3 flex-wrap">
                        {[
                          { level: 'hot', label: '3+ this week', color: 'bg-red-400' },
                          { level: 'warm', label: '3+ this month', color: 'bg-orange-400' },
                          { level: 'cool', label: '1–2 this month', color: 'bg-yellow-400' },
                          { level: 'cold', label: 'No events', color: 'bg-gray-300' },
                        ].map(({ level, label, color }) => (
                          <div key={level} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                            <span className="text-xs text-gray-500">{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto">
                        {analyticsData.eventEngagementHeatmap?.slice(0, 40).map((creator) => {
                          const colorMap: Record<string, string> = {
                            hot: 'bg-gray-100 border-red-200 text-gray-800',
                            warm: 'bg-gray-100 border-orange-200 text-gray-700',
                            cool: 'bg-yellow-100 border-yellow-200 text-yellow-700',
                            cold: 'bg-gray-100 border-gray-200 text-gray-500',
                          };
                          return (
                            <div
                              key={creator.id}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${colorMap[creator.engagementLevel]}`}
                              title={`${creator.name} — ${creator.eventsLast30Days} events/30d, ${creator.eventsLast7Days} events/7d`}
                            >
                              <span className="font-medium">{creator.initials}</span>
                              <span className="opacity-70">{creator.eventsLast30Days}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* N. Event Funnel Analysis */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                      <h3 className="mb-1" style={TYPE_CARD_TITLE}>Event Funnel</h3>
                      <p className="text-sm text-gray-500 mb-4">Phase-by-phase reach based on event timestamps</p>
                      <div className="space-y-3">
                        {analyticsData.eventFunnelAnalysis?.map((stage, index, arr) => {
                          const prevPercent = index === 0 ? 100 : arr[index - 1].percent;
                          const dropOff = index === 0 ? 0 : prevPercent - stage.percent;
                          return (
                            <div key={stage.phase}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                                <div className="flex items-center gap-2">
                                  {dropOff > 5 && (
                                    <span className="text-xs text-gray-600">-{dropOff}%</span>
                                  )}
                                  <span className="text-xs text-gray-500">{stage.count} creators</span>
                                  {stage.avgDaysToPhase !== null && (
                                    <span className="text-xs text-gray-400">~{stage.avgDaysToPhase}d</span>
                                  )}
                                </div>
                              </div>
                              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${stage.percent}%`,
                                    backgroundColor: index === 0 ? '#1e2749' : index < 3 ? '#F472B6' : index < 5 ? '#6B7280' : '#ffba06',
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{stage.percent}% of all creators</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==========================================
              CONTENT CALENDAR (Phase 3)
              ========================================== */}
          {dashboardData && (() => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Build 3-month window
            const months: { month: number; year: number; label: string }[] = [];
            for (let i = 0; i < 3; i++) {
              const m = (currentMonth + i) % 12;
              const y = currentYear + Math.floor((currentMonth + i) / 12);
              months.push({
                month: m,
                year: y,
                label: new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              });
            }

            type CalendarEntry = {
              id: string;
              name: string;
              contentPath: string | null;
              topic: string | null;
              confidence: 'Planned' | 'Target Set' | 'Estimated' | 'Projected' | 'Pipeline';
              monthIndex: number; // 0, 1, or 2
            };

            const entries: CalendarEntry[] = [];

            // Process active creators
            dashboardData.creators
              .filter(c => c.publish_status !== 'published' && c.status === 'active')
              .forEach(c => {
                let targetMonth: number | null = null;
                let targetYear: number | null = null;
                let confidence: CalendarEntry['confidence'] | null = null;

                // 1. Has target_publish_month set (e.g. "August 2026" or "July")
                if (c.target_publish_month) {
                  const parsed = new Date(c.target_publish_month + ' 1');
                  if (!isNaN(parsed.getTime())) {
                    targetMonth = parsed.getMonth();
                    targetYear = parsed.getFullYear();
                    confidence = 'Planned';
                  } else {
                    // Try parsing month name only
                    const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
                    const idx = monthNames.indexOf(c.target_publish_month.toLowerCase().split(' ')[0]);
                    if (idx >= 0) {
                      targetMonth = idx;
                      // Check if year is in the string
                      const yearMatch = c.target_publish_month.match(/\d{4}/);
                      targetYear = yearMatch ? parseInt(yearMatch[0]) : currentYear;
                      confidence = 'Planned';
                    }
                  }
                }

                // 2-4. Estimate based on progress
                if (confidence === null) {
                  const progress = c.progressPercentage || 0;
                  const path = c.content_path?.toLowerCase() || '';

                  if (progress >= 70) {
                    const offset = path.includes('course') ? 2 : path.includes('download') ? 1 : 0;
                    const estMonth = (currentMonth + offset) % 12;
                    const estYear = currentYear + Math.floor((currentMonth + offset) / 12);
                    targetMonth = estMonth;
                    targetYear = estYear;
                    confidence = 'Estimated';
                  } else if (progress >= 30) {
                    const offset = path.includes('course') ? 4 : path.includes('download') ? 2 : 1;
                    const estMonth = (currentMonth + offset) % 12;
                    const estYear = currentYear + Math.floor((currentMonth + offset) / 12);
                    targetMonth = estMonth;
                    targetYear = estYear;
                    confidence = 'Projected';
                  }
                  // progress < 30 -- skip
                }

                if (targetMonth !== null && targetYear !== null && confidence) {
                  // Check if it falls within our 3-month window
                  const monthIdx = months.findIndex(m => m.month === targetMonth && m.year === targetYear);
                  if (monthIdx >= 0) {
                    entries.push({
                      id: c.id,
                      name: c.name,
                      contentPath: c.content_path,
                      topic: c.course_title || c.topic || null,
                      confidence,
                      monthIndex: monthIdx,
                    });
                  }
                }
              });

            // Summary stats
            const totalProjected = entries.length;
            const courseCount = entries.filter(e => e.contentPath?.toLowerCase().includes('course')).length;
            const downloadCount = entries.filter(e => e.contentPath?.toLowerCase().includes('download')).length;
            const blogCount = entries.filter(e => e.contentPath?.toLowerCase().includes('blog')).length;

            // Content path badge colors
            const pathBadgeStyle = (path: string | null) => {
              const p = (path || '').toLowerCase();
              if (p.includes('course')) return { background: '#DBEAFE', color: '#1D4ED8' };
              if (p.includes('download')) return { background: '#DCFCE7', color: '#166534' };
              if (p.includes('blog')) return { background: '#FEF3C7', color: '#92400E' };
              return { background: '#F3F4F6', color: '#6B7280' };
            };

            // Confidence badge colors
            const confidenceBadgeStyle = (confidence: string) => {
              switch (confidence) {
                case 'Planned': return { background: '#DCFCE7', color: '#166534' };
                case 'Target Set': return { background: '#DBEAFE', color: '#1D4ED8' };
                case 'Estimated': return { background: '#FEF3C7', color: '#92400E' };
                case 'Projected': return { background: '#F3F4F6', color: '#6B7280' };
                case 'Pipeline': return { background: '#F3E8FF', color: '#7C3AED' };
                default: return { background: '#F3F4F6', color: '#6B7280' };
              }
            };

            const pathLabel = (path: string | null) => {
              const p = (path || '').toLowerCase();
              if (p.includes('course')) return 'Course';
              if (p.includes('download')) return 'Download';
              if (p.includes('blog')) return 'Blog';
              return 'TBD';
            };

            return (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Content Calendar
                </h2>
                <p className="text-sm text-gray-500 mb-4">Forward-looking view of projected content publishes based on targets, progress, and content path.</p>

                {/* Summary stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#1e2749' }}>{totalProjected}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Projected (3 months)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#1D4ED8' }}>{courseCount}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Courses</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#166534' }}>{downloadCount}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Downloads</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#92400E' }}>{blogCount}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Blogs</p>
                  </div>
                </div>

                {/* 3-month calendar columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {months.map((month, idx) => {
                    const monthEntries = entries.filter(e => e.monthIndex === idx);
                    return (
                      <div key={month.label} className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e2749', marginBottom: 12 }}>
                          {month.label}
                        </h3>
                        {monthEntries.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9CA3AF', padding: '16px 0', textAlign: 'center' }}>
                            Nothing projected for {month.label.split(' ')[0]}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {monthEntries.map(entry => (
                              <div key={entry.id} style={{ padding: '10px 12px', borderRadius: 10, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e2749', marginBottom: 4 }}>{entry.name}</p>
                                {entry.topic && (
                                  <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.topic}</p>
                                )}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 99,
                                    ...pathBadgeStyle(entry.contentPath),
                                  }}>
                                    {pathLabel(entry.contentPath)}
                                  </span>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 99,
                                    ...confidenceBadgeStyle(entry.confidence),
                                  }}>
                                    {entry.confidence}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Recruitment Source Quality */}
          {(() => {
            if (!recruitmentSourceData) return null;

            const sources = recruitmentSourceData.creators_by_source || {};
            const conversions = recruitmentSourceData.conversion_rates || {};
            const sourceEntries = Object.entries(sources as Record<string, any>).filter(([key]) => key !== 'unknown');

            // Don't show section if no recruitment-sourced creators exist yet
            if (sourceEntries.length === 0 && Object.keys(conversions).length === 0) {
              return (
                <div className="mb-5 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-100">
                    Recruitment Source Quality
                  </h2>
                  <p className="text-sm text-gray-400 py-4">No creators have been recruited through the pipeline yet. Source quality data will appear here as candidates convert to creators.</p>
                </div>
              );
            }

            const sourceColors: Record<string, string> = {
              hub_user: '#2563EB',
              social_media: '#EC4899',
              substack: '#F59E0B',
              sales_nomination: '#059669',
              referral: '#D97706',
              inbound: '#0891B2',
              other: '#6B7280',
            };

            return (
              <div className="mb-5 bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <h2 className="text-xl font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-100">
                  Recruitment Source Quality
                </h2>
                <p className="text-sm text-gray-400 mb-4">Which recruitment sources produce the most creators, and how well do they convert.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Creators by source */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Creators by Source</p>
                    <div className="space-y-2">
                      {sourceEntries.map(([source, data]: [string, any]) => (
                        <div key={source} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: sourceColors[source] || '#6B7280' }} />
                          <span className="text-sm text-gray-700 w-32 truncate">{source.replace(/_/g, ' ')}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min((data.count / Math.max(...sourceEntries.map(([,d]: [string, any]) => d.count), 1)) * 100, 100)}%`, background: sourceColors[source] || '#6B7280' }} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">{data.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversion rates */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Conversion Rate by Source</p>
                    {Object.keys(conversions).length === 0 ? (
                      <p className="text-sm text-gray-400">No conversion data yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(conversions).map(([source, data]: [string, any]) => (
                          <div key={source} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: sourceColors[source] || '#6B7280' }} />
                              <span className="text-sm text-gray-700">{source.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-400">{data.candidates} candidates</span>
                              <span className="text-gray-400">{data.converted} converted</span>
                              <span className="font-semibold" style={{ color: data.rate > 30 ? '#059669' : data.rate > 15 ? '#D97706' : '#6B7280' }}>{data.rate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Reference & Details -- collapsed by default */}
          {dashboardData && (
          <DashboardRefSection>

          {/* Geographic Distribution */}
          {locationData && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-5">
              <h2 className="mb-4 flex items-center gap-2" style={TYPE_CARD_TITLE}>
                <MapPin className="w-5 h-5" style={{ color: '#1e2749' }} />
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
                                    style={{ width: `${percentage}%`, backgroundColor: theme.accent }}
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
                      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: theme.accentLight }}>
                        <p style={{ ...TYPE_STAT_VALUE, color: theme.accent }}>
                          {locationData.creatorsWithLocation}
                        </p>
                        <p className="text-xs text-gray-600">With Location</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p style={{ ...TYPE_STAT_VALUE, color: '#9CA3AF' }}>
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
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <h3 className="mb-4" style={TYPE_CARD_TITLE}>
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
                      activity.type === 'team' ? 'bg-blue-500' : 'bg-yellow-500'
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
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span> Creator
              <span className="mx-2">·</span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Team
            </p>
          </div>

          {/* Automated Email Log */}
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] mt-5 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2749', fontSize: '14px', fontWeight: 600 }}>
                <Mail className="w-4 h-4 text-gray-400" />
                Automated Emails
                {recentEmails.length > 0 && (
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    {recentEmails.length} this week
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3">
                <Link
                  href="/tdi-admin/creator-email-audit"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#1e2749' }}
                >
                  View all email types
                </Link>
              </div>
            </div>
            {recentEmails.length === 0 ? (
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-400">No automated emails sent in the last 7 days. Emails will appear here as the system sends them.</p>
              </div>
            ) : (
              <div className="border-t border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    {recentEmails.slice(0, 10).map((email: any) => (
                      <tr key={email.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              email.category === 'reengagement' ? 'bg-amber-400' :
                              email.category === 'countdown_reminder' ? 'bg-blue-400' :
                              'bg-gray-300'
                            }`} />
                            <span className="font-medium text-gray-700">{email.creator_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-2 text-gray-500 truncate max-w-[300px]">{email.subject}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            email.category === 'reengagement'
                              ? 'bg-amber-50 text-amber-700'
                              : email.category === 'countdown_reminder'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}>
                            {email.category === 'reengagement'
                              ? `Re-engage #${email.step ?? 0}`
                              : email.category === 'countdown_reminder'
                              ? 'Countdown'
                              : email.category}
                          </span>
                        </td>
                        <td className="px-6 py-2 text-xs text-gray-400 text-right whitespace-nowrap">
                          {new Date(email.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recentEmails.length > 10 && (
                  <div className="px-6 py-2 text-center border-t border-gray-50">
                    <span className="text-xs text-gray-400">+ {recentEmails.length - 10} more this week</span>
                  </div>
                )}
                <div className="px-6 py-2 border-t border-gray-100" style={{ backgroundColor: '#fafbfc' }}>
                  <p className="text-[11px] text-gray-400">
                    All sent automatically. Bella receives a weekly digest every Monday at 8 AM.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Tools */}
          {/* The Admin Tools card that sat here held one control, Sync
              Milestones for All Creators. That is maintenance, not
              analytics, and it belongs beside the roster it repairs. It was
              removed rather than carried over as a button that did nothing. */}

          </DashboardRefSection>
          )}

          {/* Empty State */}
          {!analyticsLoading && !analyticsData && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Failed to load analytics data</p>
                <button
                  onClick={() => {
                    setAnalyticsData(null);
                    setAnalyticsLoading(false);
                  }}
                  className="mt-3 text-sm text-slate-700 hover:text-slate-700"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
