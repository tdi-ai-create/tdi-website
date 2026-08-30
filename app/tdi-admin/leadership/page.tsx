'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

import OnboardingMatrix from '@/components/tdi-admin/leadership/OnboardingMatrix';
import {
  Building2,
  Users,
  Check,
  Mail,
  Loader2,
  ChevronRight,
  Plus,
  Calendar,
  RefreshCw,
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

// Priority colors
const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function LeadershipDashboardPage() {
  const { permissions, isOwner, teamMember } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<TabId>('partnerships');

  // Data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  useEffect(() => {
    if (hasAccess) {
      loadPartnerships();
      loadActionItems();
    }
  }, [hasAccess, loadPartnerships, loadActionItems]);

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

            {/* The partnership list that used to sit here is gone. It repeated
                the nine rows the matrix above already shows, with weaker
                columns, and its Portal Access column disagreed with the card at
                the top of the same page about who had signed in. New
                Partnership was the one action it carried, so that is what
                remains. */}
            <div className="px-4 pb-4">
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
