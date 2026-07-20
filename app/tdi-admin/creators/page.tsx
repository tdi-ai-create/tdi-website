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
  Target, Home as HomeIcon, Laptop, Scale, Mail, MoreVertical,
  UserPlus, Award,
} from 'lucide-react';

const TOPIC_ICON_MAP: Record<string, any> = {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, HomeIcon, Laptop, Scale,
};
import { useTDIAdmin } from '@/lib/tdi-admin/context';
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
type TabId = 'dashboard' | 'creators' | 'analytics' | 'affiliate' | 'recruitment';

// Tab configuration
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Action Center', icon: LayoutGrid },
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'affiliate', label: 'Affiliate', icon: DollarSign },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
];

// Types
interface EnrichedCreator {
  id: string;
  name: string;
  email: string;
  course_title: string | null;
  course_audience: string | null;
  content_path: string | null;
  topic?: string | null;
  current_phase: string;
  target_publish_month: string | null;
  created_at: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  lastActivityDate: string;
  currentMilestoneName: string | null;
  requiresTeamAction: boolean;
  waitingOn: 'creator' | 'tdi' | 'stalled' | 'launched' | 'followed_up';
  isStalled: boolean;
  last_followed_up_at: string | null;
  followed_up_by: string | null;
  // Publish workflow fields
  publish_status: 'in_progress' | 'scheduled' | 'published';
  scheduled_publish_date: string | null;
  published_date: string | null;
  // Archive and post-launch fields
  status: 'active' | 'archived';
  lifecycle_state: 'active' | 'paused' | null;
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
    followedUp: number;
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

interface AffiliateMetrics {
  period: string;
  clicks: number;
  conversions: number;
  creatorPayoutCents: number;
  tdiRevenueCents: number;
}

interface LeaderboardCreator {
  id: string;
  name: string;
  email: string;
  slug: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnedCents: number;
  lifetimeEarnedCents: number;
  lastActivity: string | null;
}

interface PayoutBatch {
  period: string;
  totalPayoutCents: number;
  totalConversions: number;
  status: string;
  generatedAt: string;
  generatedBy: string | null;
  payoutIds: string[];
  creators: Array<{ name: string; email: string; payoutCents: number; conversions: number }>;
}

interface CreatorDrillDown {
  clicks: Array<{ id: string; clicked_at: string; referrer_url: string | null; landing_page: string | null }>;
  signups: Array<{ id: string; signed_up_at: string; user_email: string | null }>;
  conversions: Array<{ id: string; converted_at: string; user_email: string | null; gross_amount_cents: number; net_revenue_cents: number; creator_payout_cents: number; refunded: boolean; payout_id: string | null; paid_to_creator_at: string | null }>;
  payouts: Array<{ id: string; period: string; payout_amount_cents: number; status: string; paid_at: string | null; paid_method: string | null }>;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getPreviousPeriod(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[month - 1]} ${year}`;
}

function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value: val, label: formatPeriodLabel(val) });
  }
  return options;
}

function AffiliateTab() {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [metrics, setMetrics] = useState<AffiliateMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardCreator[]>([]);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Mark paid modal
  const [markPaidBatch, setMarkPaidBatch] = useState<PayoutBatch | null>(null);
  const [paidMethod, setPaidMethod] = useState('');
  const [paidReference, setPaidReference] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Creator drill-down
  const [drillDownCreator, setDrillDownCreator] = useState<LeaderboardCreator | null>(null);
  const [drillDownData, setDrillDownData] = useState<CreatorDrillDown | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  // Link copied toast
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, leaderboardRes, batchesRes] = await Promise.all([
        fetch(`/api/admin/affiliate/metrics?period=${period}`).then(r => r.json()),
        fetch(`/api/admin/affiliate/leaderboard?period=${period}`).then(r => r.json()),
        fetch('/api/admin/affiliate/payouts').then(r => r.json()),
      ]);
      setMetrics(metricsRes);
      setLeaderboard(leaderboardRes.creators || []);
      setBatches(batchesRes.batches || []);
    } catch (err) {
      console.error('Failed to load affiliate data:', err);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    const generatePeriod = getPreviousPeriod();
    if (!confirm(`Generate payout batch for ${formatPeriodLabel(generatePeriod)}?`)) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/affiliate/payouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: generatePeriod }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.payoutsCreated} payout(s) from ${data.totalConversions} conversion(s).`);
        await loadData();
      } else {
        alert(data.error || 'Failed to generate payouts');
      }
    } catch {
      alert('Error generating payouts');
    }
    setGenerating(false);
  };

  const handleMarkPaid = async () => {
    if (!markPaidBatch || !paidMethod) return;
    setMarkingPaid(true);
    try {
      const res = await fetch('/api/admin/affiliate/payouts/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutIds: markPaidBatch.payoutIds,
          paidMethod,
          paidReference,
          paidAt: new Date(paidDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMarkPaidBatch(null);
        setPaidMethod('');
        setPaidReference('');
        await loadData();
      } else {
        alert(data.error || 'Failed to mark as paid');
      }
    } catch {
      alert('Error marking paid');
    }
    setMarkingPaid(false);
  };

  const openDrillDown = async (creator: LeaderboardCreator) => {
    setDrillDownCreator(creator);
    setDrillDownLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliate/creator?id=${creator.id}`);
      const data = await res.json();
      setDrillDownData(data);
    } catch {
      setDrillDownData(null);
    }
    setDrillDownLoading(false);
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://teachersdeserveit.com/r/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const periodOptions = getPeriodOptions();

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-slate-300 focus:border-transparent"
        >
          {periodOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {/* Section 1: Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Clicks', value: metrics?.clicks || 0, format: (v: number) => v.toLocaleString() },
          { label: 'Conversions', value: metrics?.conversions || 0, format: (v: number) => v.toLocaleString() },
          { label: 'Creator Payouts', value: metrics?.creatorPayoutCents || 0, format: formatCents },
          { label: 'TDI Revenue', value: metrics?.tdiRevenueCents || 0, format: formatCents },
        ].map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="mb-2" style={TYPE_WIDGET_LABEL}>{card.label}</div>
            <div style={{ ...TYPE_STAT_VALUE, color: '#111827' }}>
              {card.format(card.value)}
            </div>
            <div className="text-xs text-gray-400 mt-1">{formatPeriodLabel(period)}</div>
          </div>
        ))}
      </div>

      {/* Section 2: Monthly Payouts */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 style={TYPE_CARD_TITLE}>
            Monthly Payouts
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={`/api/admin/affiliate/payouts/export?period=${getPreviousPeriod()}`}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <DownloadIcon className="w-3 h-3 inline mr-1" />
              Export CSV
            </a>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1"
              style={{ backgroundColor: theme.accent }}
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Generate {formatPeriodLabel(getPreviousPeriod())}
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No payout batches generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Period</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Payout</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Conv.</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Generated</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{formatPeriodLabel(batch.period)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold" style={{ color: '#2B3A67' }}>
                      {formatCents(batch.totalPayoutCents)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{batch.totalConversions}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === 'paid'
                          ? 'bg-green-50 text-yellow-700'
                          : 'bg-amber-50 text-gray-700'
                      }`}>
                        {batch.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {new Date(batch.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/admin/affiliate/payouts/export?period=${batch.period}`}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          CSV
                        </a>
                        {batch.status === 'pending' && (
                          <button
                            onClick={() => {
                              setMarkPaidBatch(batch);
                              setPaidMethod('');
                              setPaidReference('');
                              setPaidDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="text-xs font-medium px-2 py-1 rounded bg-green-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Creator Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Creator Leaderboard
        </h3>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No creators with affiliate slugs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creator</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clicks</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Signups</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Conv.</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Earned</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Lifetime</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openDrillDown(c)}
                        className="font-medium hover:underline text-left"
                        style={{ color: '#2B3A67' }}
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <code className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{c.slug}</code>
                        <button
                          onClick={() => handleCopyLink(c.slug)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy affiliate link"
                        >
                          {copiedSlug === c.slug ? <Check className="w-3 h-3 text-yellow-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{c.clicks}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600 hidden md:table-cell">{c.signups}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{c.conversions}</td>
                    <td className="py-2.5 px-3 text-right font-semibold" style={{ color: c.earnedCents > 0 ? '#059669' : '#9CA3AF' }}>
                      {c.earnedCents > 0 ? formatCents(c.earnedCents) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 hidden lg:table-cell">
                      {c.lifetimeEarnedCents > 0 ? formatCents(c.lifetimeEarnedCents) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs hidden lg:table-cell">
                      {c.lastActivity
                        ? new Date(c.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {markPaidBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 style={TYPE_CARD_TITLE}>Mark Batch as Paid</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatPeriodLabel(markPaidBatch.period)} &middot; {formatCents(markPaidBatch.totalPayoutCents)} to {markPaidBatch.creators.length} creator(s)
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                <select
                  value={paidMethod}
                  onChange={e => setPaidMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                >
                  <option value="">Select method...</option>
                  <option value="check">Check</option>
                  <option value="ach">ACH</option>
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference number (optional)</label>
                <input
                  type="text"
                  value={paidReference}
                  onChange={e => setPaidReference(e.target.value)}
                  placeholder="e.g. check #1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={e => setPaidDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setMarkPaidBatch(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={!paidMethod || markingPaid}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#059669' }}
              >
                {markingPaid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Drill-Down Modal */}
      {drillDownCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 style={TYPE_CARD_TITLE}>{drillDownCreator.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  <code className="bg-gray-50 px-1.5 py-0.5 rounded text-xs">{drillDownCreator.slug}</code>
                  <span className="mx-2">&middot;</span>
                  {drillDownCreator.email}
                </p>
              </div>
              <button onClick={() => { setDrillDownCreator(null); setDrillDownData(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drillDownLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : drillDownData ? (
                <>
                  {/* Click history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5" /> Recent Clicks ({drillDownData.clicks.length})
                    </h4>
                    {drillDownData.clicks.length === 0 ? (
                      <p className="text-xs text-gray-400">No clicks recorded.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.clicks.slice(0, 20).map(c => (
                              <tr key={c.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(c.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </td>
                                <td className="py-1.5 px-3 text-gray-400 truncate max-w-[200px]">{c.referrer_url || '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Signup history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Signups ({drillDownData.signups.length})
                    </h4>
                    {drillDownData.signups.length === 0 ? (
                      <p className="text-xs text-gray-400">No signups recorded.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.signups.map(s => (
                              <tr key={s.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(s.signed_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-1.5 px-3 text-gray-600">{s.user_email || '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Conversion history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Conversions ({drillDownData.conversions.length})
                    </h4>
                    {drillDownData.conversions.length === 0 ? (
                      <p className="text-xs text-gray-400">No conversions recorded.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="py-1.5 px-3 text-left font-medium text-gray-500">Date</th>
                              <th className="py-1.5 px-3 text-right font-medium text-gray-500">Gross</th>
                              <th className="py-1.5 px-3 text-right font-medium text-gray-500">Payout</th>
                              <th className="py-1.5 px-3 text-left font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drillDownData.conversions.map(c => (
                              <tr key={c.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(c.converted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-1.5 px-3 text-right text-gray-600">{formatCents(c.gross_amount_cents)}</td>
                                <td className="py-1.5 px-3 text-right font-medium text-yellow-700">{formatCents(c.creator_payout_cents)}</td>
                                <td className="py-1.5 px-3">
                                  {c.refunded ? (
                                    <span className="text-gray-700">Refunded</span>
                                  ) : c.paid_to_creator_at ? (
                                    <span className="text-yellow-600">Paid</span>
                                  ) : c.payout_id ? (
                                    <span className="text-gray-700">Batched</span>
                                  ) : (
                                    <span className="text-gray-400">Pending</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payout history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Payout History ({drillDownData.payouts.length})
                    </h4>
                    {drillDownData.payouts.length === 0 ? (
                      <p className="text-xs text-gray-400">No payouts yet.</p>
                    ) : (
                      <div className="border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.payouts.map(p => (
                              <tr key={p.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 font-medium text-gray-700">{formatPeriodLabel(p.period)}</td>
                                <td className="py-1.5 px-3 text-right font-semibold text-yellow-700">{formatCents(p.payout_amount_cents)}</td>
                                <td className="py-1.5 px-3">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    p.status === 'paid' ? 'bg-green-50 text-yellow-700' : 'bg-amber-50 text-gray-700'
                                  }`}>
                                    {p.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-gray-400">
                                  {p.paid_at ? `Paid ${new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                                  {p.paid_method ? ` via ${p.paid_method}` : ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Failed to load creator details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function CreatorStudioPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

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
  const [newSubmissions, setNewSubmissions] = useState<any[]>([]);
  const [pendingRecruitment, setPendingRecruitment] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editedFeedbackContent, setEditedFeedbackContent] = useState('');
  const [feedbackActionLoading, setFeedbackActionLoading] = useState<string | null>(null);

  // ── Recruitment tab state ──
  const [recruitmentStats, setRecruitmentStats] = useState<{
    critical_gaps_without_candidates: number;
    total_candidates_by_stage: Record<string, number>;
    avg_days_in_pipeline: number;
    conversions_this_month: number;
  } | null>(null);
  const [recruitmentGaps, setRecruitmentGaps] = useState<any[]>([]);
  const [recruitmentCandidates, setRecruitmentCandidates] = useState<any[]>([]);
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);
  const [recruitmentStageFilter, setRecruitmentStageFilter] = useState<string>('all');
  const [recruitmentGapsExpanded, setRecruitmentGapsExpanded] = useState(true);
  const [recruitmentActionLoading, setRecruitmentActionLoading] = useState<string | null>(null);
  const [recruitmentEditingOutreach, setRecruitmentEditingOutreach] = useState<string | null>(null);
  const [recruitmentEditedDraft, setRecruitmentEditedDraft] = useState('');
  const [recruitmentResponseForm, setRecruitmentResponseForm] = useState<{ candidateId: string; notes: string; stage: string } | null>(null);
  const [recruitmentNoteForm, setRecruitmentNoteForm] = useState<{ candidateId: string; content: string } | null>(null);
  const [recruitmentConvertForm, setRecruitmentConvertForm] = useState<{ candidateId: string; contentPath: string; topic: string } | null>(null);
  const [recruitmentExpandedFit, setRecruitmentExpandedFit] = useState<Set<string>>(new Set());
  const [recruitmentExpandedDraft, setRecruitmentExpandedDraft] = useState<Set<string>>(new Set());
  const [recruitmentQuickNotes, setRecruitmentQuickNotes] = useState<Record<string, string>>({});
  const [recruitmentSourceData, setRecruitmentSourceData] = useState<any>(null);
  const [nominateForm, setNominateForm] = useState({
    name: '', email: '', school_org: '', expertise_area: '', source: 'sales_nomination', notes: ''
  });
  const [nominateLoading, setNominateLoading] = useState(false);

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

  // ── Recruitment data loading ──
  const loadRecruitmentData = useCallback(async () => {
    setRecruitmentLoading(true);
    try {
      const [statsRes, gapsRes, pipelineRes] = await Promise.all([
        fetch('/api/admin/creator-recruitment?action=stats'),
        fetch('/api/admin/creator-recruitment?action=gaps'),
        fetch(`/api/admin/creator-recruitment?action=pipeline&stage=${recruitmentStageFilter}`),
      ]);
      const [statsData, gapsData, pipelineData] = await Promise.all([
        statsRes.json(), gapsRes.json(), pipelineRes.json(),
      ]);
      if (statsData.stats) setRecruitmentStats(statsData.stats);
      if (gapsData.gaps) setRecruitmentGaps(gapsData.gaps);
      if (pipelineData.candidates) setRecruitmentCandidates(pipelineData.candidates);
    } catch (error) {
      console.error('Failed to load recruitment data:', error);
    } finally {
      setRecruitmentLoading(false);
    }
  }, [recruitmentStageFilter]);

  useEffect(() => {
    if (hasAccess && activeTab === 'recruitment') {
      loadRecruitmentData();
    }
  }, [hasAccess, activeTab, loadRecruitmentData]);

  const handleRecruitmentAction = async (actionType: string, payload: Record<string, unknown>) => {
    const candidateId = payload.candidate_id as string;
    setRecruitmentActionLoading(candidateId);
    try {
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(actionType === 'convert_to_creator' ? 'Candidate converted to creator!' : 'Action completed', 'success');
        await loadRecruitmentData();
        // Reset forms
        setRecruitmentEditingOutreach(null);
        setRecruitmentResponseForm(null);
        setRecruitmentNoteForm(null);
        setRecruitmentConvertForm(null);
        return data;
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setRecruitmentActionLoading(null);
    }
  };

  const handleNominate = async () => {
    if (!nominateForm.name.trim()) { showToast('Name is required', 'error'); return; }
    setNominateLoading(true);
    try {
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'nominate', ...nominateForm, nominated_by: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Candidate nominated!', 'success');
        setNominateForm({ name: '', email: '', school_org: '', expertise_area: '', source: 'sales_nomination', notes: '' });
        await loadRecruitmentData();
      } else {
        showToast(data.error || 'Nomination failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setNominateLoading(false);
    }
  };

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

  // Load Hub content data when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !hubCreatorData && !hubCreatorLoading) {
      setHubCreatorLoading(true);
      fetch('/api/tdi-admin/hub-connections?section=creators')
        .then(res => res.json())
        .then(data => setHubCreatorData(data))
        .catch(() => {})
        .finally(() => setHubCreatorLoading(false));
    }
  }, [activeTab, hubCreatorData, hubCreatorLoading]);

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

  // Load recruitment source analytics when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !recruitmentSourceData) {
      fetch('/api/admin/recruitment-analytics')
        .then(res => res.json())
        .then(data => setRecruitmentSourceData(data))
        .catch(() => {});
    }
  }, [activeTab, recruitmentSourceData]);

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
    (filterPublishStatus !== 'all' ? 1 : 0);

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
        <div className="flex items-center justify-between mb-6">
          <h1 style={TYPE_PAGE_TITLE}>Creator Studio</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/tdi-admin/creator-updates"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              <Sparkles className="w-4 h-4" />
              Updates & Guide
            </Link>
            <Link
              href="/tdi-admin/creator-email-audit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Mail className="w-4 h-4" />
              Email Audit
            </Link>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-white shadow-sm hover:shadow-md hover:opacity-90"
                style={{ backgroundColor: '#1e2749' }}
              >
                <Plus className="w-4 h-4" />
                Add Creator
              </button>
            )}
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
          {newSubmissions.length === 0 && feedbackQueue.length === 0 && needsAttention.length === 0 && pendingRecruitment.length === 0 && (
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
                {(activeFiltersCount > 0 || activeStatFilter) && (
                  <button
                    onClick={() => {
                      setFilterPath('all');
                      setFilterPhase('all');
                      setFilterWaitingOn('all');
                      setFilterPublishStatus('all');
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
                              <p className="font-medium truncate" style={{ color: '#2B3A67' }}>
                                {creator.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {creator.topic || creator.course_title || creator.email}
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

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
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
                    const catEntries = Object.entries(hubCreatorData.categoryPerformance).sort((a, b) => b[1].views - a[1].views);
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
                {Object.entries(hubCreatorData.categoryPerformance)
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
                    dashboardData.creators.forEach((creator: any) => {
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
                            className={`p-2 rounded-xl ${bgColors[creator.activityLevel]} transition-colors cursor-pointer`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${colors[creator.activityLevel]}`} />
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
                                  className={`${bgColor[creator.severity]} hover:brightness-95 transition-all`}
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
                                        openFollowUpModal({ id: creator.id, name: creator.name });
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
            const sourceEntries = Object.entries(sources).filter(([key]) => key !== 'unknown');

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
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mt-5">
            <h3 className="mb-4 flex items-center gap-2" style={TYPE_CARD_TITLE}>
              <Settings className="w-5 h-5 text-gray-500" />
              Admin Tools
            </h3>
            <div className="space-y-4">
              {/* Milestone Sync */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Sync Milestones for All Creators</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Add any missing milestone records for existing creators when new milestones are deployed.
                  </p>
                </div>
                <button
                  onClick={handleSyncMilestones}
                  disabled={isSyncingMilestones}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    isSyncingMilestones
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {isSyncingMilestones ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync Milestones
                    </>
                  )}
                </button>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div
                  className={`p-4 rounded-xl text-sm ${
                    syncResult.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-gray-50 border border-red-200 text-gray-800'
                  }`}
                >
                  <p className="font-medium">{syncResult.success ? 'Sync Complete' : 'Sync Failed'}</p>
                  <p className="mt-1">{syncResult.message}</p>
                  {syncResult.success && syncResult.creatorsProcessed !== undefined && (
                    <p className="mt-1 text-xs opacity-75">
                      Processed {syncResult.creatorsProcessed} creators, inserted {syncResult.milestonesInserted} milestone records
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

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
      )}

      {/* AFFILIATE TAB */}
      {activeTab === 'affiliate' && (
        <AffiliateTab />
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

      {/* ═══════ RECRUITMENT TAB ═══════ */}
      {activeTab === 'recruitment' && (
        <div className="space-y-6">
          {recruitmentLoading && !recruitmentStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
              <span className="ml-2 text-gray-500">Loading recruitment data...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Pipeline Health Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {recruitmentStats?.critical_gaps_without_candidates ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold text-red-700">
                        {recruitmentStats.critical_gaps_without_candidates} Critical Gap{recruitmentStats.critical_gaps_without_candidates > 1 ? 's' : ''} Uncovered
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-700">All critical gaps covered</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      Suggested: <strong>{recruitmentStats?.total_candidates_by_stage?.suggested || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      Outreach: <strong>{(recruitmentStats?.total_candidates_by_stage?.outreach_approved || 0) + (recruitmentStats?.total_candidates_by_stage?.outreach_sent || 0)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      Interested: <strong>{recruitmentStats?.total_candidates_by_stage?.interested || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      Committed: <strong>{recruitmentStats?.total_candidates_by_stage?.committed || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-yellow-600" />
                      Conversions: <strong>{recruitmentStats?.conversions_this_month || 0}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Gap Priorities */}
              <div className="bg-white rounded-xl border border-gray-200">
                <button
                  onClick={() => setRecruitmentGapsExpanded(!recruitmentGapsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 style={TYPE_SECTION_HEADER}>Content Gap Priorities</h3>
                  {recruitmentGapsExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {recruitmentGapsExpanded && (
                  <div className="px-4 pb-4">
                    {recruitmentGaps.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">No content gaps identified yet. Anne Marie will analyze Hub content and sales data to identify priority areas.</p>
                    ) : (
                      <div className="grid gap-3">
                        {recruitmentGaps.map((gap: any) => (
                          <div key={gap.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 text-sm">{gap.category}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    gap.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                    gap.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {(gap.priority || 'low').toUpperCase()}
                                  </span>
                                  {gap.recommended_content_path && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {gap.recommended_content_path}
                                    </span>
                                  )}
                                </div>
                                {gap.demand_signal && (
                                  <p className="text-xs text-gray-500 mt-1">{gap.demand_signal}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                  {gap.existing_course_count > 0 && <span>{gap.existing_course_count} course{gap.existing_course_count > 1 ? 's' : ''}</span>}
                                  {gap.existing_quick_win_count > 0 && <span>{gap.existing_quick_win_count} quick win{gap.existing_quick_win_count > 1 ? 's' : ''}</span>}
                                  {gap.active_creator_count > 0 && <span>{gap.active_creator_count} active creator{gap.active_creator_count > 1 ? 's' : ''}</span>}
                                  {gap.sales_mention_count > 0 && <span>{gap.sales_mention_count} sales mention{gap.sales_mention_count > 1 ? 's' : ''}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                                <span>{gap.candidate_count} candidate{gap.candidate_count !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Candidate Pipeline */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 style={TYPE_SECTION_HEADER}>Candidate Pipeline</h3>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'suggested', label: 'Suggested' },
                      { value: 'outreach_approved', label: 'Outreach Approved' },
                      { value: 'outreach_sent', label: 'Outreach Sent' },
                      { value: 'interested', label: 'Interested' },
                      { value: 'evaluation', label: 'Evaluation' },
                      { value: 'call_scheduled', label: 'Call Scheduled' },
                      { value: 'committed', label: 'Committed' },
                      { value: 'revisit', label: 'Revisit' },
                      { value: 'declined', label: 'Declined' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRecruitmentStageFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          recruitmentStageFilter === opt.value
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={recruitmentStageFilter === opt.value ? { backgroundColor: theme.accent } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  {recruitmentCandidates.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">
                      {recruitmentStageFilter === 'all'
                        ? 'No candidates in pipeline. Anne Marie will research potential creators based on gap priorities.'
                        : `No candidates in ${recruitmentStageFilter.replace(/_/g, ' ')} stage.`}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recruitmentCandidates.map((candidate: any) => {
                        const isActionLoading = recruitmentActionLoading === candidate.id;
                        const isEditingOutreach = recruitmentEditingOutreach === candidate.id;
                        const isResponseForm = recruitmentResponseForm?.candidateId === candidate.id;
                        const isNoteForm = recruitmentNoteForm?.candidateId === candidate.id;
                        const isConvertForm = recruitmentConvertForm?.candidateId === candidate.id;
                        const isFitExpanded = recruitmentExpandedFit.has(candidate.id);

                        const sourceBadgeColor: Record<string, string> = {
                          hub_user: 'bg-blue-100 text-blue-700',
                          social_media: 'bg-pink-100 text-pink-700',
                          sales_nomination: 'bg-green-100 text-green-700',
                          referral: 'bg-amber-100 text-amber-700',
                          inbound: 'bg-teal-100 text-teal-700',
                          substack: 'bg-orange-100 text-orange-700',
                        };

                        const stageBadgeColor: Record<string, string> = {
                          suggested: 'bg-purple-100 text-purple-700',
                          outreach_approved: 'bg-indigo-100 text-indigo-700',
                          outreach_sent: 'bg-blue-100 text-blue-700',
                          interested: 'bg-amber-100 text-amber-700',
                          evaluation: 'bg-cyan-100 text-cyan-700',
                          call_scheduled: 'bg-teal-100 text-teal-700',
                          committed: 'bg-green-100 text-green-700',
                          revisit: 'bg-gray-100 text-gray-600',
                          declined: 'bg-red-100 text-red-700',
                        };

                        return (
                          <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900">{candidate.name}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadgeColor[candidate.source] || 'bg-gray-100 text-gray-600'}`}>
                                    {(candidate.source || 'unknown').replace(/_/g, ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeColor[candidate.stage] || 'bg-gray-100 text-gray-600'}`}>
                                    {(candidate.stage || '').replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  {candidate.email && <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">{candidate.email}</a>}
                                  {candidate.social_url && <a href={candidate.social_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /></a>}
                                  {candidate.school_org && <span>{candidate.school_org}</span>}
                                  {candidate.role && <span>{candidate.role}</span>}
                                </div>
                              </div>
                              {/* Gap badge */}
                              {candidate.gap && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-xs text-gray-500">{candidate.gap.category}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    candidate.gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    candidate.gap.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                    candidate.gap.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {(candidate.gap.priority || '').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content path + fit */}
                            <div className="mt-2 flex items-start gap-2">
                              {candidate.content_path && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                  {candidate.content_path}
                                </span>
                              )}
                              {candidate.why_good_fit && (
                                <p className={`text-xs text-gray-600 ${!isFitExpanded ? 'line-clamp-2' : ''}`}>
                                  {candidate.why_good_fit}
                                  {!isFitExpanded && candidate.why_good_fit.length > 120 && (
                                    <button
                                      onClick={() => setRecruitmentExpandedFit(prev => { const next = new Set(prev); next.add(candidate.id); return next; })}
                                      className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >more</button>
                                  )}
                                  {isFitExpanded && (
                                    <button
                                      onClick={() => setRecruitmentExpandedFit(prev => { const next = new Set(prev); next.delete(candidate.id); return next; })}
                                      className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >less</button>
                                  )}
                                </p>
                              )}
                            </div>

                            {/* Outreach draft for suggested */}
                            {candidate.stage === 'suggested' && candidate.outreach_draft && !isEditingOutreach && (
                              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">Outreach Draft (Anne Marie)</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.outreach_draft}</p>
                              </div>
                            )}

                            {/* Outreach draft for outreach_approved / outreach_sent (collapsible) */}
                            {(candidate.stage === 'outreach_approved' || candidate.stage === 'outreach_sent') && candidate.outreach_draft && !isEditingOutreach && (
                              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => setRecruitmentExpandedDraft(prev => {
                                    const next = new Set(prev);
                                    if (next.has(candidate.id)) { next.delete(candidate.id); } else { next.add(candidate.id); }
                                    return next;
                                  })}
                                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-xs font-medium text-gray-500"
                                >
                                  <span>Outreach Draft</span>
                                  {recruitmentExpandedDraft.has(candidate.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                                {recruitmentExpandedDraft.has(candidate.id) && (
                                  <div className="px-3 py-2">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.outreach_draft}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Editing outreach */}
                            {isEditingOutreach && (
                              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">Edit Outreach Draft</p>
                                <textarea
                                  value={recruitmentEditedDraft}
                                  onChange={e => setRecruitmentEditedDraft(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => { handleRecruitmentAction('approve_outreach', { candidate_id: candidate.id, approved_by: 'admin', edited_outreach: recruitmentEditedDraft }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >
                                    {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save & Approve'}
                                  </button>
                                  <button
                                    onClick={() => setRecruitmentEditingOutreach(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Response form */}
                            {isResponseForm && (
                              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-700 mb-2">Log Response</p>
                                <textarea
                                  value={recruitmentResponseForm!.notes}
                                  onChange={e => setRecruitmentResponseForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                  placeholder="Response notes..."
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[60px] mb-2"
                                />
                                <div className="flex items-center gap-2">
                                  <select
                                    value={recruitmentResponseForm!.stage}
                                    onChange={e => setRecruitmentResponseForm(prev => prev ? { ...prev, stage: e.target.value } : null)}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                                  >
                                    <option value="interested">Interested</option>
                                    <option value="evaluation">Evaluation</option>
                                    <option value="call_scheduled">Call Scheduled</option>
                                    <option value="declined">Declined</option>
                                  </select>
                                  <button
                                    onClick={() => { handleRecruitmentAction('log_response', { candidate_id: candidate.id, response_notes: recruitmentResponseForm!.notes, new_stage: recruitmentResponseForm!.stage }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit'}</button>
                                  <button onClick={() => setRecruitmentResponseForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Note form */}
                            {isNoteForm && (
                              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-amber-700 mb-2">Add Note</p>
                                <textarea
                                  value={recruitmentNoteForm!.content}
                                  onChange={e => setRecruitmentNoteForm(prev => prev ? { ...prev, content: e.target.value } : null)}
                                  placeholder="Note content..."
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[60px] mb-2"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentNoteForm!.content, author: 'admin' }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}</button>
                                  <button onClick={() => setRecruitmentNoteForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Convert form */}
                            {isConvertForm && (
                              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-green-700 mb-2">Convert to Creator</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <label className="text-xs text-gray-500">Content Path</label>
                                    <select
                                      value={recruitmentConvertForm!.contentPath}
                                      onChange={e => setRecruitmentConvertForm(prev => prev ? { ...prev, contentPath: e.target.value } : null)}
                                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mt-0.5"
                                    >
                                      <option value="course">Course</option>
                                      <option value="download">Download</option>
                                      <option value="blog">Blog</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500">Topic</label>
                                    <input
                                      value={recruitmentConvertForm!.topic}
                                      onChange={e => setRecruitmentConvertForm(prev => prev ? { ...prev, topic: e.target.value } : null)}
                                      placeholder="e.g. SEL, STEM..."
                                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mt-0.5"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { handleRecruitmentAction('convert_to_creator', { candidate_id: candidate.id, content_path: recruitmentConvertForm!.contentPath, topic: recruitmentConvertForm!.topic }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Convert to Creator'}</button>
                                  <button onClick={() => setRecruitmentConvertForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Revisit info */}
                            {candidate.stage === 'revisit' && (
                              <div className="mt-2 text-xs text-gray-500">
                                {candidate.revisit_date && <span>Revisit: {new Date(candidate.revisit_date).toLocaleDateString()}</span>}
                                {candidate.revisit_reason && <span className="ml-2">- {candidate.revisit_reason}</span>}
                              </div>
                            )}

                            {/* Declined info */}
                            {candidate.stage === 'declined' && candidate.declined_reason && (
                              <div className="mt-2 text-xs text-gray-500">
                                Reason: {candidate.declined_reason}
                              </div>
                            )}

                            {/* Action buttons */}
                            {candidate.stage !== 'declined' && (
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {candidate.stage === 'suggested' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        if (candidate.outreach_draft) {
                                          navigator.clipboard.writeText(candidate.outreach_draft);
                                        }
                                        await handleRecruitmentAction('approve_outreach', { candidate_id: candidate.id, approved_by: 'admin' });
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
                                      }}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve Outreach'}</button>
                                    <button
                                      onClick={() => { setRecruitmentEditingOutreach(candidate.id); setRecruitmentEditedDraft(candidate.outreach_draft || ''); }}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Edit & Approve</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('dismiss', { candidate_id: candidate.id, reason: 'Dismissed from pipeline' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Dismiss</button>
                                  </>
                                )}
                                {candidate.stage === 'outreach_approved' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('mark_sent', { candidate_id: candidate.id })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark as Sent'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'outreach_sent' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentResponseForm({ candidateId: candidate.id, notes: '', stage: 'interested' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                      style={{ backgroundColor: theme.accent }}
                                    >Log Response</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'no_response', notes: 'No response received' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Mark No Response</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'interested' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'call_scheduled' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Schedule Call'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'evaluation' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100"
                                    >Send Evaluation</button>
                                  </>
                                )}
                                {candidate.stage === 'evaluation' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'call_scheduled', notes: 'Evaluation passed' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                    >Pass</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'declined', declined_reason: 'Did not pass evaluation' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Fail</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'call_scheduled' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                      style={{ backgroundColor: theme.accent }}
                                    >Log Call Notes</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'committed', notes: 'Moving to committed after call' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Move to Committed'}</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'declined', declined_reason: 'Declined after call' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Declined</button>
                                  </>
                                )}
                                {candidate.stage === 'committed' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentConvertForm({ candidateId: candidate.id, contentPath: candidate.content_path || 'course', topic: candidate.expertise_area || '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-green-600 hover:bg-green-700"
                                    >Convert to Creator</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'revisit' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'suggested', notes: 'Re-engaged from revisit' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Re-engage'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'suggested' && !isNoteForm && (
                                  <button
                                    onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                  >Add Note</button>
                                )}
                              </div>
                            )}

                            {/* Quick note inline input */}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={recruitmentQuickNotes[candidate.id] || ''}
                                onChange={e => setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: e.target.value }))}
                                placeholder="Quick note..."
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300"
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && recruitmentQuickNotes[candidate.id]?.trim()) {
                                    handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentQuickNotes[candidate.id].trim(), author: 'admin' });
                                    setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: '' }));
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  if (recruitmentQuickNotes[candidate.id]?.trim()) {
                                    handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentQuickNotes[candidate.id].trim(), author: 'admin' });
                                    setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: '' }));
                                  }
                                }}
                                disabled={!recruitmentQuickNotes[candidate.id]?.trim()}
                                className="px-2 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-30"
                                style={{ backgroundColor: theme.accent }}
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Quick Nominate Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 style={TYPE_SECTION_HEADER}>Quick Nominate</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Add someone to the recruitment pipeline</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Name *</label>
                    <input
                      value={nominateForm.name}
                      onChange={e => setNominateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Email</label>
                    <input
                      value={nominateForm.email}
                      onChange={e => setNominateForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">School / Org</label>
                    <input
                      value={nominateForm.school_org}
                      onChange={e => setNominateForm(prev => ({ ...prev, school_org: e.target.value }))}
                      placeholder="Organization"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Expertise Area</label>
                    <input
                      value={nominateForm.expertise_area}
                      onChange={e => setNominateForm(prev => ({ ...prev, expertise_area: e.target.value }))}
                      placeholder="e.g. SEL, Math, Leadership"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Source</label>
                    <select
                      value={nominateForm.source}
                      onChange={e => setNominateForm(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="sales_nomination">Sales Nomination</option>
                      <option value="referral">Referral</option>
                      <option value="inbound">Inbound</option>
                      <option value="social_media">Social Media</option>
                      <option value="hub_user">Hub User</option>
                      <option value="substack">Substack</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Notes</label>
                    <input
                      value={nominateForm.notes}
                      onChange={e => setNominateForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Why this person?"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleNominate}
                    disabled={nominateLoading || !nominateForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {nominateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Nominate
                  </button>
                </div>
              </div>
            </>
          )}
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
    </div>
  );
}
