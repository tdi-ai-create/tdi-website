'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import {
  Building2,
  School,
  ClipboardList,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
  Users,
  Check,
  Clock,
  Mail,
  Loader2,
  ChevronRight,
  AlertCircle,
  Plus,
  Copy,
  BarChart3,
  ListTodo,
  GitBranch,
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';

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
}

interface Stats {
  activeCount: number;
  totalEducators: number;
  pendingSetup: number;
  awaitingAccept: number;
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
  { id: 'partnerships', label: 'Partnerships', icon: School },
  { id: 'dashboards', label: 'School Dashboards', icon: ExternalLink },
  { id: 'reports', label: 'School Reports', icon: FileSpreadsheet },
  { id: 'actions', label: 'Action Items', icon: ListTodo },
  { id: 'pipeline', label: 'Onboarding Pipeline', icon: GitBranch },
  { id: 'billing', label: 'Billing', icon: DollarSign },
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

export default function LeadershipDashboardPage() {
  const { permissions, isOwner, teamMember } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<TabId>('partnerships');

  // Data state
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (hasAccess) {
      loadPartnerships();
      loadActionItems();
    }
  }, [hasAccess, loadPartnerships, loadActionItems]);

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

  // Pipeline counts
  const pipelineCounts = {
    invited: partnerships.filter((p) => p.status === 'invited').length,
    setup: partnerships.filter((p) => p.status === 'setup_in_progress').length,
    active: partnerships.filter((p) => p.status === 'active').length,
    paused: partnerships.filter((p) => p.status === 'paused').length,
    completed: partnerships.filter((p) => p.status === 'completed').length,
  };

  // Get active partnerships for dashboards tab
  const activePartnerships = partnerships.filter(
    (p) => p.status === 'active' && p.slug
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
            You don&apos;t have permission to access the Lead Dashboard.
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#1a1a2e',
          }}
        >
          Lead Dashboard
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage school partnerships, reports, action items, and billing.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {stats.activeCount}
                </p>
                <p className="text-xs text-gray-600">Active Partnerships</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {stats.totalEducators}
                </p>
                <p className="text-xs text-gray-600">Total Educators</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {stats.pendingSetup}
                </p>
                <p className="text-xs text-gray-600">Pending Setup</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {stats.awaitingAccept}
                </p>
                <p className="text-xs text-gray-600">Awaiting Accept</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all relative"
              style={{
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? '#2B3A67' : '#6B7280',
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: isActive
                  ? '2px solid #E8B84B'
                  : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              <Icon size={18} />
              {tab.label}
              {tab.id === 'actions' && pendingActionItems.length > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {pendingActionItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* =========== PARTNERSHIPS TAB =========== */}
        {activeTab === 'partnerships' && (
          <div>
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#2B3A67',
                      color: 'white',
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPartnerships.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
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
                          className="hover:bg-gray-50 transition-colors"
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
                                <p
                                  className="font-medium truncate"
                                  style={{ color: '#2B3A67' }}
                                >
                                  {partnership.org_name || partnership.contact_name}
                                </p>
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
                              {partnership.slug && partnership.status === 'active' && (
                                <Link
                                  href={`/partners/${partnership.slug}-dashboard`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Dashboard
                                </Link>
                              )}
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
        {activeTab === 'dashboards' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Active Partner Dashboards
                </h2>
                <p className="text-sm text-gray-500">
                  Quick access to all active partner dashboards
                </p>
              </div>
              <button
                onClick={loadPartnerships}
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
            ) : activePartnerships.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active partnerships with dashboards yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePartnerships.map((partnership) => (
                  <Link
                    key={partnership.id}
                    href={`/partners/${partnership.slug}-dashboard`}
                    target="_blank"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        partnership.partnership_type === 'district'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {partnership.partnership_type === 'district' ? (
                        <Building2 className="w-6 h-6" />
                      ) : (
                        <School className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: '#2B3A67' }}
                      >
                        {partnership.org_name || partnership.contact_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            phaseColors[partnership.contract_phase]
                          }`}
                        >
                          {partnership.contract_phase}
                        </span>
                        <span>{partnership.staff_count ?? 0} educators</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========== SCHOOL REPORTS TAB =========== */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  School Reports
                </h2>
                <p className="text-sm text-gray-500">
                  Hub engagement and progress data by partnership
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : activePartnerships.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active partnerships to report on yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Organization
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Educators
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Hub Login %
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Sessions Used
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Contract Period
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activePartnerships.map((partnership) => {
                      // Calculate usage percentage
                      const totalSessions =
                        (partnership.virtual_sessions_total || 0) +
                        (partnership.observation_days_total || 0) +
                        (partnership.executive_sessions_total || 0);
                      const usedSessions =
                        (partnership.virtual_sessions_used || 0) +
                        (partnership.observation_days_used || 0) +
                        (partnership.executive_sessions_used || 0);
                      const usagePercent =
                        totalSessions > 0
                          ? Math.round((usedSessions / totalSessions) * 100)
                          : 0;

                      return (
                        <tr key={partnership.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                              <span
                                className="font-medium"
                                style={{ color: '#2B3A67' }}
                              >
                                {partnership.org_name || partnership.contact_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {partnership.staff_count ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: '0%' }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">--</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">
                                {usedSessions}/{totalSessions}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {partnership.contract_start
                              ? new Date(
                                  partnership.contract_start
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '--'}{' '}
                            -{' '}
                            {partnership.contract_end
                              ? new Date(
                                  partnership.contract_end
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '--'}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/tdi-admin/leadership/${partnership.id}`}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              Full Report
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========== ACTION ITEMS TAB =========== */}
        {activeTab === 'actions' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
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

        {/* =========== ONBOARDING PIPELINE TAB =========== */}
        {activeTab === 'pipeline' && (
          <div className="p-6">
            <div className="mb-6">
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                Onboarding Pipeline
              </h2>
              <p className="text-sm text-gray-500">
                Track partnerships through each stage
              </p>
            </div>

            {/* Pipeline Visual */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
              {[
                {
                  label: 'Invited',
                  count: pipelineCounts.invited,
                  color: 'bg-gray-100 text-gray-700',
                  barColor: 'bg-gray-400',
                },
                {
                  label: 'Setup',
                  count: pipelineCounts.setup,
                  color: 'bg-amber-100 text-amber-700',
                  barColor: 'bg-amber-400',
                },
                {
                  label: 'Active',
                  count: pipelineCounts.active,
                  color: 'bg-green-100 text-green-700',
                  barColor: 'bg-green-500',
                },
                {
                  label: 'Paused',
                  count: pipelineCounts.paused,
                  color: 'bg-orange-100 text-orange-700',
                  barColor: 'bg-orange-400',
                },
                {
                  label: 'Completed',
                  count: pipelineCounts.completed,
                  color: 'bg-blue-100 text-blue-700',
                  barColor: 'bg-blue-500',
                },
              ].map((stage, index) => (
                <div key={stage.label} className="flex items-center">
                  <div className="text-center min-w-[100px]">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${stage.color}`}
                    >
                      <span className="text-2xl font-bold">{stage.count}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {stage.label}
                    </p>
                  </div>
                  {index < 4 && (
                    <div className="w-12 h-1 bg-gray-200 mx-2 flex-shrink-0">
                      <div className={`h-full ${stage.barColor}`} style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pipeline Lists */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Invited */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Invited ({pipelineCounts.invited})
                </h3>
                <div className="space-y-2">
                  {partnerships
                    .filter((p) => p.status === 'invited')
                    .slice(0, 5)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/tdi-admin/leadership/${p.id}`}
                        className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <p className="font-medium text-sm" style={{ color: '#2B3A67' }}>
                          {p.org_name || p.contact_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRelativeTime(p.created_at)}
                        </p>
                      </Link>
                    ))}
                  {pipelineCounts.invited === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No pending invites
                    </p>
                  )}
                </div>
              </div>

              {/* Setup In Progress */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Setup ({pipelineCounts.setup})
                </h3>
                <div className="space-y-2">
                  {partnerships
                    .filter((p) => p.status === 'setup_in_progress')
                    .slice(0, 5)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/tdi-admin/leadership/${p.id}`}
                        className="block p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
                      >
                        <p className="font-medium text-sm" style={{ color: '#2B3A67' }}>
                          {p.org_name || p.contact_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.staff_count ?? 0} educators
                        </p>
                      </Link>
                    ))}
                  {pipelineCounts.setup === 0 && (
                    <p className="text-sm text-amber-400 text-center py-4">
                      No partnerships in setup
                    </p>
                  )}
                </div>
              </div>

              {/* Active */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Active ({pipelineCounts.active})
                </h3>
                <div className="space-y-2">
                  {partnerships
                    .filter((p) => p.status === 'active')
                    .slice(0, 5)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/tdi-admin/leadership/${p.id}`}
                        className="block p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors"
                      >
                        <p className="font-medium text-sm" style={{ color: '#2B3A67' }}>
                          {p.org_name || p.contact_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.staff_count ?? 0} educators •{' '}
                          <span className={`${phaseColors[p.contract_phase]} px-1 rounded`}>
                            {p.contract_phase}
                          </span>
                        </p>
                      </Link>
                    ))}
                  {pipelineCounts.active === 0 && (
                    <p className="text-sm text-green-400 text-center py-4">
                      No active partnerships
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========== BILLING TAB =========== */}
        {activeTab === 'billing' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Billing & Contracts
                </h2>
                <p className="text-sm text-gray-500">
                  Track contract periods and service allocations
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : partnerships.filter((p) => p.status === 'active').length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active contracts to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Organization
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Phase
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Contract Period
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Observation Days
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Virtual Sessions
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Exec Sessions
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {partnerships
                      .filter(
                        (p) =>
                          p.status === 'active' || p.status === 'setup_in_progress'
                      )
                      .map((partnership) => {
                        // Check if contract is expiring soon (within 60 days)
                        const isExpiringSoon =
                          partnership.contract_end &&
                          new Date(partnership.contract_end).getTime() -
                            new Date().getTime() <
                            60 * 24 * 60 * 60 * 1000;

                        return (
                          <tr key={partnership.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                                <span
                                  className="font-medium"
                                  style={{ color: '#2B3A67' }}
                                >
                                  {partnership.org_name || partnership.contact_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  phaseColors[partnership.contract_phase]
                                }`}
                              >
                                {partnership.contract_phase}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <p className="text-gray-700">
                                  {partnership.contract_start
                                    ? new Date(
                                        partnership.contract_start
                                      ).toLocaleDateString()
                                    : '--'}{' '}
                                  -{' '}
                                  {partnership.contract_end
                                    ? new Date(
                                        partnership.contract_end
                                      ).toLocaleDateString()
                                    : '--'}
                                </p>
                                {isExpiringSoon && (
                                  <p className="text-xs text-orange-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Expiring soon
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">
                                <span className="font-medium" style={{ color: '#2B3A67' }}>
                                  {partnership.observation_days_used || 0}
                                </span>
                                <span className="text-gray-400">
                                  /{partnership.observation_days_total || 0}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">
                                <span className="font-medium" style={{ color: '#2B3A67' }}>
                                  {partnership.virtual_sessions_used || 0}
                                </span>
                                <span className="text-gray-400">
                                  /{partnership.virtual_sessions_total || 0}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">
                                <span className="font-medium" style={{ color: '#2B3A67' }}>
                                  {partnership.executive_sessions_used || 0}
                                </span>
                                <span className="text-gray-400">
                                  /{partnership.executive_sessions_total || 0}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex text-xs px-2 py-1 rounded-full border ${
                                  statusColors[partnership.status]
                                }`}
                              >
                                {statusLabels[partnership.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
