'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

import { HorizontalBarChart, DonutChart, DonutLegend, ProgressRing, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts';
import OnboardingMatrix from '@/components/tdi-admin/leadership/OnboardingMatrix';
import {
  Building2,
  School,
  Search,
  Filter,
  Users,
  Check,
  Mail,
  Loader2,
  ChevronRight,
  Plus,
  Copy,
  BarChart3,
  Calendar,
  RefreshCw,
  ExternalLink,
  ListTodo,
} from 'lucide-react';
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_STAT_VALUE,
} from '@/components/tdi-admin/ui/design-tokens';

// Leadership theme colors
const theme = PORTAL_THEMES.leadership;

// Types
interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  slug: string | null;
  contact_name: string;
  contact_email: string;
  contract_phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN';
  contract_start: string | null;
  contract_end: string | null;
  building_count: number;
  observation_days_total: number;
  observation_days_used?: number;
  virtual_sessions_total: number;
  virtual_sessions_used?: number;
  executive_sessions_total: number;
  executive_sessions_used?: number;
  invite_token: string;
  invite_sent_at: string | null;
  invite_accepted_at: string | null;
  status: 'invited' | 'setup_in_progress' | 'active' | 'paused' | 'completed';
  created_at: string;
  org_name?: string | null;
  staff_count?: number;
  // Migration 014 fields
  legacy_dashboard_url?: string | null;
  primary_contact_name?: string | null;
  address?: string | null;
  website?: string | null;
}

// Reads as "invited 29 days ago" rather than a bare date, because the point of
// the never-signed-in card is how long someone has been sitting on an invite.
function formatDaysAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'at an unknown date';
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

interface Stats {
  activeCount: number;
  totalEducators: number;
  awaitingAccept: number;
  neverSignedIn: { id: string; orgName: string; contactName: string | null; invitedAt: string | null }[];
}

interface ActionItem {
  id: string;
  partnership_id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  due_date?: string;
  partnership?: {
    org_name?: string;
    contact_name?: string;
    slug?: string;
  };
}

// Tab configuration
const TABS = [
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'actions', label: 'Action Items' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// Status badge colors
const statusColors: Record<string, string> = {
  invited: 'bg-gray-100 text-gray-600 border-gray-200',
  setup_in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-orange-100 text-orange-700 border-orange-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusLabels: Record<string, string> = {
  invited: 'Invited',
  setup_in_progress: 'Setup In Progress',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

// Phase badge colors
const phaseColors: Record<string, string> = {
  IGNITE: 'bg-amber-100 text-amber-700',
  ACCELERATE: 'bg-teal-100 text-teal-700',
  SUSTAIN: 'bg-green-100 text-green-700',
};

// Priority colors
const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

// Helper function for relative time
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
}

// Portal Access Cell Component
function PortalAccessCell({
  partnershipId,
  contactEmail,
  contactName,
  userEmail,
}: {
  partnershipId: string;
  contactEmail: string;
  contactName: string;
  userEmail: string;
}) {
  const [status, setStatus] = useState<'loading' | 'not_invited' | 'invited' | 'active'>('loading');
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tdi-admin/leadership/${partnershipId}/invite-status`, {
      headers: { 'x-user-email': userEmail },
    })
      .then(r => r.json())
      .then(data => {
        setStatus(data.status || 'not_invited');
        setSentAt(data.inviteSentAt || null);
        setLastLogin(data.lastLogin || null);
      })
      .catch(() => setStatus('not_invited'));
  }, [partnershipId, userEmail]);

  async function sendInvite() {
    setSending(true);
    const res = await fetch('/api/tdi-admin/leadership/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({
        partnershipId,
        email: contactEmail,
        name: contactName,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus('invited');
      setSentAt(new Date().toISOString());
    }
    setSending(false);
  }

  if (status === 'loading') {
    return <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />;
  }

  if (status === 'active') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-green-700 font-medium">Active</span>
        {lastLogin && (
          <span className="text-xs text-gray-400">
            · {new Date(lastLogin).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  if (status === 'invited') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-xs text-amber-700 font-medium">Invited</span>
        {sentAt && (
          <span className="text-xs text-gray-400">
            · {new Date(sentAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  // not_invited - only show button if we have contact email
  if (!contactEmail) {
    return <span className="text-xs text-gray-400">No email</span>;
  }

  return (
    <button
      onClick={sendInvite}
      disabled={sending}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
      style={{
        background: sending ? '#FEF3C7' : '#2563EB',
        color: sending ? '#92400E' : '#fff',
      }}
    >
      {sending ? 'Sending...' : '✉ Send Invite'}
    </button>
  );
}

export default function LeadershipDashboardPage() {
  const router = useRouter();
  const { permissions, isOwner, teamMember } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<TabId>('partnerships');

  // Data state
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hub connection data for School Reports
  const [hubSchools, setHubSchools] = useState<{
    name: string; district: string; state: string;
    totalEducators: number; activeEducators: number; activeRate: number;
    avgVibeScore: number | null; totalPdHours: number; totalToolsViewed: number; totalCompletions: number;
  }[]>([]);
  const [hubPartnerships, setHubPartnerships] = useState<{
    partnershipId: string; name: string; district: string; state: string;
    totalEducators: number; activeEducators: number; activeRate: number;
    avgVibeScore: number | null; totalPdHours: number; totalToolsViewed: number; totalCompletions: number;
  }[]>([]);
  const [hubLoading, setHubLoading] = useState(false);

  // Filter state
  const leadershipSearchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(leadershipSearchParams.get('search') || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership');

  // Load partnerships data
  const loadPartnerships = useCallback(async () => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch('/api/admin/partnerships', {
        headers: {
          'x-user-email': teamMember.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPartnerships(data.partnerships);
          setFilteredPartnerships(data.partnerships);
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to load partnerships:', error);
    } finally {
      setIsLoading(false);
    }
  }, [teamMember?.email]);

  // Load action items across all partnerships
  const loadActionItems = useCallback(async () => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch('/api/tdi-admin/leadership/action-items', {
        headers: {
          'x-user-email': teamMember.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActionItems(data.actionItems);
        }
      }
    } catch (error) {
      console.error('Failed to load action items:', error);
    }
  }, [teamMember?.email]);

  // Load Hub school data for reports tab
  const loadHubData = useCallback(async () => {
    setHubLoading(true);
    try {
      const res = await fetch('/api/tdi-admin/hub-connections?section=leadership');
      if (res.ok) {
        const data = await res.json();
        setHubSchools(data.schools || []);
        setHubPartnerships(data.partnerships || []);
      }
    } catch (error) {
      console.error('Failed to load Hub data:', error);
    } finally {
      setHubLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadPartnerships();
      loadActionItems();
      loadHubData(); // Load Hub data upfront so Partnerships tab can show metrics
    }
  }, [hasAccess, loadPartnerships, loadActionItems, loadHubData]);

  // Build Hub lookup maps: direct partnership_id match (preferred) + school name fallback
  const hubPartnershipMap = new Map<string, typeof hubPartnerships[0]>();
  hubPartnerships.forEach(p => hubPartnershipMap.set(p.partnershipId, p));

  const hubSchoolMap = new Map<string, typeof hubSchools[0]>();
  hubSchools.forEach(school => {
    hubSchoolMap.set(school.name.toLowerCase(), school);
    if (school.district) hubSchoolMap.set(school.district.toLowerCase(), school);
  });

  const getHubMetrics = (partnership: Partnership) => {
    // Prefer direct partnership_id match (reliable, from backfilled hub_profiles)
    const directMatch = hubPartnershipMap.get(partnership.id);
    if (directMatch) return directMatch;
    // Fall back to school name match (legacy)
    const orgName = (partnership.org_name || partnership.contact_name || '').toLowerCase();
    return hubSchoolMap.get(orgName) || null;
  };

  // Filter partnerships
  useEffect(() => {
    if (!partnerships.length) return;

    let filtered = [...partnerships];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.contact_name.toLowerCase().includes(query) ||
          p.contact_email.toLowerCase().includes(query) ||
          (p.org_name?.toLowerCase().includes(query) ?? false)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((p) => p.partnership_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterPhase !== 'all') {
      filtered = filtered.filter((p) => p.contract_phase === filterPhase);
    }

    setFilteredPartnerships(filtered);
  }, [searchQuery, partnerships, filterType, filterStatus, filterPhase]);

  const copyInviteLink = async (token: string, id: string) => {
    const url = `${window.location.origin}/partner-setup/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const activeFiltersCount =
    (filterType !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterPhase !== 'all' ? 1 : 0);


  // Get active partnerships for dashboards tab (with legacy_dashboard_url or slug)
  const activePartnerships = partnerships.filter(
    (p) => p.status === 'active' && (p.legacy_dashboard_url || p.slug)
  );

  // Get pending action items (not completed)
  const pendingActionItems = actionItems.filter(
    (item) => item.status !== 'completed'
  );

  if (!hasAccess) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Building2 size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="mb-3"
            style={TYPE_PAGE_TITLE}
          >
            Access Restricted
          </h1>
          <p
            className="mb-6"
            style={TYPE_PAGE_SUBTITLE}
          >
            You don&apos;t have permission to access the Lead Dashboard.
            Contact your administrator to request access.
          </p>
          <Link
            href="/tdi-admin/hub"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme.accent,
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

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-200"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-0 px-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium transition-colors relative"
                style={{
                  color: isActive ? '#111827' : '#6B7280',
                  borderBottom: isActive
                    ? `2px solid ${theme.accent}`
                    : '2px solid transparent',
                }}
              >
                {tab.label}
                {tab.id === 'actions' && pendingActionItems.length > 0 && (
                  <span className="ml-1 text-xs text-gray-900 font-medium">
                    ({pendingActionItems.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 style={TYPE_PAGE_TITLE}>Lead Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every school partnership, and what needs attention.
          </p>
        </div>

      {/* Stats Cards - White bg with accent top bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-start">
          <div
            className="bg-white rounded-xl border border-gray-100 transition-all duration-200 group relative overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="h-0.5 w-full" style={{ background: theme.accent }} />
            <div className="p-5 flex items-center justify-between">
              <div>
                <p
                  className="font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{ ...TYPE_STAT_VALUE, color: theme.accent }}
                >
                  {stats.activeCount}
                </p>
                <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Active Partnerships
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${theme.accent}15` }}
              >
                <Check className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border border-gray-100 transition-all duration-200 group relative overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="h-0.5 w-full" style={{ background: theme.accent }} />
            <div className="p-5 flex items-center justify-between">
              <div>
                <p
                  className="font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{ ...TYPE_STAT_VALUE, color: theme.accent }}
                >
                  {stats.totalEducators}
                </p>
                <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Total Educators
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${theme.accent}15` }}
              >
                <Users className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderColor: stats.neverSignedIn.length > 0 ? '#FCA5A5' : '#F3F4F6',
            }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: stats.neverSignedIn.length > 0 ? '#DC2626' : theme.accent }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="font-bold mb-1"
                    style={{
                      ...TYPE_STAT_VALUE,
                      color: stats.neverSignedIn.length > 0 ? '#DC2626' : theme.accent,
                    }}
                  >
                    {stats.awaitingAccept}
                  </p>
                  <p className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {stats.awaitingAccept === 1 ? 'Leader has never signed in' : 'Leaders have never signed in'}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: stats.neverSignedIn.length > 0 ? '#FEE2E2' : `${theme.accent}15`,
                  }}
                >
                  <Mail
                    className="w-6 h-6"
                    style={{ color: stats.neverSignedIn.length > 0 ? '#DC2626' : theme.accent }}
                  />
                </div>
              </div>

              {stats.neverSignedIn.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                  {stats.neverSignedIn.map((leader) => (
                    <Link
                      key={leader.id}
                      href={`/tdi-admin/leadership/${leader.id}`}
                      className="block text-xs text-gray-600 hover:text-[#1e2749]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <span className="font-semibold">{leader.contactName || 'Contact not recorded'}</span>
                      <span className="text-gray-400"> at </span>
                      <span>{leader.orgName}</span>
                      {leader.invitedAt && (
                        <span className="text-gray-400">
                          {' '}
                          &middot; invited {formatDaysAgo(leader.invitedAt)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div
        className="bg-white rounded-xl border border-gray-100"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {/* =========== PARTNERSHIPS TAB =========== */}
        {activeTab === 'partnerships' && (
          <div>
            {/* ─── ONBOARDING ───
                The first thing on the page, because "how many partnerships do
                we have" was never the question. This replaces the Onboarding
                Pipeline tab, which bucketed schools on invite_accepted_at, a
                field an auth check stamps automatically. It read as accepted
                for two schools that have never logged in. */}
            <div className="p-4 pb-0">
              {/* Not headed "Onboarding" any more: the same table now toggles to
                  an Engagement view, and the toggle bar inside carries the
                  per-view explanation, so a subtitle here would repeat it. */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                <h2 style={TYPE_SECTION_HEADER}>Where every partnership stands</h2>
                <span className="text-[13px] text-gray-500">
                  One definition, computed from both databases.
                </span>
              </div>
              <OnboardingMatrix userEmail={teamMember?.email ?? null} />
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                      showFilters || activeFiltersCount > 0
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  <Link
                    href="/admin/partnerships"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: theme.accent,
                      color: 'white',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    New Partnership
                  </Link>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="district">District</option>
                      <option value="school">School</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="invited">Invited</option>
                      <option value="setup_in_progress">Setup In Progress</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Phase
                    </label>
                    <select
                      value={filterPhase}
                      onChange={(e) => setFilterPhase(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    >
                      <option value="all">All Phases</option>
                      <option value="IGNITE">IGNITE</option>
                      <option value="ACCELERATE">ACCELERATE</option>
                      <option value="SUSTAIN">SUSTAIN</option>
                    </select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterStatus('all');
                        setFilterPhase('all');
                      }}
                      className="self-end px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Organization
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                        Type
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                        Phase
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">
                        Contact
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                        Created
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Portal Access
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                        Hub Activity
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPartnerships.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          {searchQuery || activeFiltersCount > 0
                            ? 'No partnerships found matching your criteria.'
                            : 'No partnerships yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPartnerships.map((partnership) => (
                        <tr
                          key={partnership.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/tdi-admin/leadership/${partnership.id}`)}
                        >
                          {/* Organization */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  partnership.partnership_type === 'district'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {partnership.partnership_type === 'district' ? (
                                  <Building2 className="w-4 h-4" />
                                ) : (
                                  <School className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/tdi-admin/leadership/${partnership.id}`}
                                  className="font-medium truncate block hover:underline"
                                  style={{ color: '#2B3A67' }}
                                >
                                  {partnership.org_name || partnership.contact_name}
                                </Link>
                                <p className="text-xs text-gray-500">
                                  {(partnership.staff_count ?? 0) > 0
                                    ? `${partnership.staff_count} educators`
                                    : 'No staff yet'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-gray-700 capitalize">
                              {partnership.partnership_type}
                            </span>
                          </td>

                          {/* Phase */}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span
                              className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                                phaseColors[partnership.contract_phase]
                              }`}
                            >
                              {partnership.contract_phase}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex text-xs px-2 py-1 rounded-full border ${
                                statusColors[partnership.status]
                              }`}
                            >
                              {statusLabels[partnership.status]}
                            </span>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <div className="text-sm">
                              <p style={{ color: '#2B3A67' }}>
                                {partnership.contact_name}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {partnership.contact_email}
                              </p>
                            </div>
                          </td>

                          {/* Created */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-gray-600">
                              {getRelativeTime(partnership.created_at)}
                            </span>
                          </td>

                          {/* Portal Access */}
                          <td className="px-4 py-3">
                            <PortalAccessCell
                              partnershipId={partnership.id}
                              contactEmail={partnership.contact_email}
                              contactName={partnership.contact_name}
                              userEmail={teamMember?.email || ''}
                            />
                          </td>

                          {/* Hub Activity */}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {(() => {
                              const hub = getHubMetrics(partnership);
                              if (!hub) return <span className="text-xs text-gray-400">No Hub data</span>;
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${hub.activeRate}%`, backgroundColor: hub.activeRate >= 60 ? '#2A9D8F' : hub.activeRate >= 30 ? '#EAB308' : '#EF4444' }} />
                                    </div>
                                    <span className="text-[10px] font-medium" style={{ color: hub.activeRate >= 60 ? '#2A9D8F' : hub.activeRate >= 30 ? '#EAB308' : '#EF4444' }}>{hub.activeRate}%</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500">{hub.totalToolsViewed} tools / {hub.totalPdHours > 0 ? hub.totalPdHours.toFixed(0) + ' PD hrs' : '0 PD hrs'}</p>
                                  {hub.avgVibeScore !== null && (
                                    <p className="text-[10px]" style={{ color: hub.avgVibeScore >= 4 ? '#2A9D8F' : hub.avgVibeScore >= 3 ? '#EAB308' : '#EF4444' }}>Vibe: {hub.avgVibeScore}/5</p>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/tdi-admin/leadership/${partnership.id}`}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                View
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                              {partnership.status === 'invited' && (
                                <button
                                  onClick={() =>
                                    copyInviteLink(
                                      partnership.invite_token,
                                      partnership.id
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                                    copiedId === partnership.id
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {copiedId === partnership.id ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Link
                                    </>
                                  )}
                                </button>
                              )}
                              {(partnership.legacy_dashboard_url || partnership.slug) && partnership.status === 'active' && (
                                <Link
                                  href={partnership.slug ? `/partners/${partnership.slug}` : (partnership.legacy_dashboard_url || '#')}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Dashboard
                                </Link>
                              )}
                              <Link
                                href={`/tdi-admin/sales?search=${encodeURIComponent(partnership.org_name || partnership.contact_name || '')}`}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                Sales
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              Showing {filteredPartnerships.length} of {partnerships.length}{' '}
              partnerships
            </div>
          </div>
        )}

        {/* =========== SCHOOL DASHBOARDS TAB =========== */}
        {activeTab === 'actions' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  style={TYPE_SECTION_HEADER}
                >
                  Action Items
                </h2>
                <p className="text-sm text-gray-500">
                  Outstanding tasks across all partnerships
                </p>
              </div>
              <button
                onClick={loadActionItems}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : pendingActionItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p>All action items are complete!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingActionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      item.status === 'paused'
                        ? 'bg-gray-50 border-gray-200'
                        : item.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === 'paused'
                          ? 'bg-gray-200 text-gray-500'
                          : item.priority === 'high'
                          ? 'bg-red-100 text-red-600'
                          : item.priority === 'medium'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="font-medium truncate"
                          style={{ color: '#2B3A67' }}
                        >
                          {item.title}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            priorityColors[item.priority]
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {item.partnership?.org_name ||
                            item.partnership?.contact_name ||
                            'Unknown'}
                        </span>
                        {item.due_date && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due{' '}
                              {new Date(item.due_date).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="capitalize">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/tdi-admin/leadership/${item.partnership_id}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      View
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
    </div>
  );
}
