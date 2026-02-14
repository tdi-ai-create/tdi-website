'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

// Leadership theme colors
const theme = PORTAL_THEMES.leadership;
import {
  ArrowLeft,
  Building2,
  School,
  Loader2,
  ExternalLink,
  Check,
  X,
  Plus,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Activity,
  Mail,
  Copy,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  BarChart3,
  CalendarPlus,
  ListTodo,
  FileText,
  Trash2,
  Download,
} from 'lucide-react';
import {
  getMetricStatus,
  statusColors as metricStatusColors,
  statusLabels as metricStatusLabels,
  formatMetricValue,
} from '@/lib/metric-thresholds';

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
}

interface Organization {
  id: string;
  name: string;
  org_type: string;
  address_city?: string;
  address_state?: string;
  partnership_goal?: string | null;
  success_targets?: string[] | null;
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  due_date?: string;
  completed_at?: string;
  paused_at?: string;
  paused_reason?: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface MetricSnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  snapshot_date: string;
  building_id?: string;
  source?: string;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  role_title?: string;
  building_id?: string;
  hub_enrolled?: boolean;
  buildings?: { name: string } | null;
}

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

// Metric types
const METRIC_TYPES = [
  { value: 'hub_login_pct', label: 'Hub Login %' },
  { value: 'courses_avg', label: 'Avg Courses Completed' },
  { value: 'avg_stress', label: 'Avg Stress Level' },
  { value: 'implementation_pct', label: 'Implementation %' },
];

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

// Format action for display
function formatAction(action: string): string {
  const actionLabels: Record<string, string> = {
    invite_generated: 'Invite Generated',
    invite_accepted: 'Invite Accepted',
    intake_completed: 'Intake Completed',
    staff_uploaded: 'Staff Uploaded',
    action_item_completed: 'Action Item Completed',
    action_item_paused: 'Action Item Paused',
    action_item_created: 'Action Item Created',
    action_item_updated: 'Action Item Updated',
    partnership_updated: 'Partnership Updated',
    metric_recorded: 'Metric Recorded',
    observation_day_completed: 'Observation Day',
    virtual_session_completed: 'Virtual Session',
    executive_session_completed: 'Executive Session',
  };
  return actionLabels[action] || action.replace(/_/g, ' ');
}

export default function PartnershipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnershipId = params.id as string;
  const { permissions, isOwner, teamMember } = useTDIAdmin();

  // Data state
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [metricSnapshots, setMetricSnapshots] = useState<MetricSnapshot[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Partnership>>({});
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership');

  const loadPartnership = useCallback(async () => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        headers: {
          'x-user-email': teamMember.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPartnership(data.partnership);
          setOrganization(data.organization);
          setActionItems(data.actionItems || []);
          setActivityLog(data.activityLog || []);
          setMetricSnapshots(data.metricSnapshots || []);
          setStaffCount(data.staffCount || 0);
          setStaffMembers(data.staff || []);
        }
      } else if (response.status === 404) {
        router.push('/tdi-admin/leadership');
      }
    } catch (error) {
      console.error('Failed to load partnership:', error);
    } finally {
      setIsLoading(false);
    }
  }, [partnershipId, router, teamMember?.email]);

  useEffect(() => {
    if (hasAccess) {
      loadPartnership();
    }
  }, [hasAccess, loadPartnership]);

  // Download staff roster as CSV
  const downloadStaffCSV = () => {
    const orgName = organization?.name || partnership?.contact_name || 'partnership';
    const headers = ['Name', 'Email', 'Role', 'Building', 'Hub Status'];
    const rows = staffMembers.map((s) => [
      `${s.first_name} ${s.last_name}`,
      s.email,
      s.role_title || s.role || '',
      s.buildings?.name || '',
      s.hub_enrolled ? 'Logged in' : 'Not yet',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-staff-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePartnership = async () => {
    if (!teamMember?.email || !partnership) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': teamMember.email,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        setPartnership({ ...partnership, ...editForm });
        setIsEditing(false);
        setEditForm({});
      }
    } catch (error) {
      console.error('Error saving partnership:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyInviteLink = async () => {
    if (!partnership) return;
    const url = `${window.location.origin}/partner-setup/${partnership.invite_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Get latest metric values
  const getLatestMetric = (metricName: string) => {
    const metric = metricSnapshots.find((m) => m.metric_name === metricName);
    return metric?.metric_value ?? null;
  };

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
            You don&apos;t have permission to view this partnership.
          </p>
          <Link
            href="/tdi-admin/leadership"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme.primary,
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Partnership not found</p>
          <Link
            href="/tdi-admin/leadership"
            className="inline-block mt-4 text-amber-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const orgName = organization?.name || partnership.contact_name;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* Back Link */}
      <Link
        href="/tdi-admin/leadership"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leadership Dashboard
      </Link>

      {/* Quick Info Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                partnership.partnership_type === 'district'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {partnership.partnership_type === 'district' ? (
                <Building2 className="w-7 h-7" />
              ) : (
                <School className="w-7 h-7" />
              )}
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                {orgName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex text-xs px-2 py-1 rounded-full border ${
                    statusColors[partnership.status]
                  }`}
                >
                  {statusLabels[partnership.status]}
                </span>
                <span
                  className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                    phaseColors[partnership.contract_phase]
                  }`}
                >
                  {partnership.contract_phase}
                </span>
                <span className="text-sm text-gray-500">
                  {staffCount} educator{staffCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {partnership.status === 'invited' && (
              <button
                onClick={copyInviteLink}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  copiedLink
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Invite Link
                  </>
                )}
              </button>
            )}
            {partnership.slug && partnership.status === 'active' && (
              <Link
                href={`/partners/${partnership.slug}-dashboard`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
              >
                <ExternalLink className="w-4 h-4" />
                View Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setEditForm(partnership);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {METRIC_TYPES.map((metric) => {
            const value = getLatestMetric(metric.value);
            const status = getMetricStatus(metric.value, value);
            return (
              <div key={metric.value} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                <p
                  className="text-lg font-bold"
                  style={{ color: metricStatusColors[status] }}
                >
                  {formatMetricValue(metric.value, value)}
                </p>
                <p
                  className="text-xs"
                  style={{ color: metricStatusColors[status] }}
                >
                  {metricStatusLabels[status]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Partnership Form */}
      {isEditing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Edit Partnership
            </h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({});
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={editForm.contact_name || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, contact_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={editForm.contact_email || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, contact_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editForm.status || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as Partnership['status'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              >
                <option value="invited">Invited</option>
                <option value="setup_in_progress">Setup In Progress</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase
              </label>
              <select
                value={editForm.contract_phase || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    contract_phase: e.target.value as Partnership['contract_phase'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              >
                <option value="IGNITE">IGNITE</option>
                <option value="ACCELERATE">ACCELERATE</option>
                <option value="SUSTAIN">SUSTAIN</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Start
              </label>
              <input
                type="date"
                value={editForm.contract_start || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, contract_start: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract End
              </label>
              <input
                type="date"
                value={editForm.contract_end || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, contract_end: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePartnership}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#2B3A67' }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Usage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Service Usage
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {partnership.observation_days_used || 0} /{' '}
                  {partnership.observation_days_total}
                </p>
                <p className="text-sm text-gray-500">Observation Days</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {partnership.virtual_sessions_used || 0} /{' '}
                  {partnership.virtual_sessions_total}
                </p>
                <p className="text-sm text-gray-500">Virtual Sessions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>
                  {partnership.executive_sessions_used || 0} /{' '}
                  {partnership.executive_sessions_total}
                </p>
                <p className="text-sm text-gray-500">Executive Sessions</p>
              </div>
            </div>
          </div>

          {/* Staff Roster */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                Staff Roster
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({staffCount} educator{staffCount !== 1 ? 's' : ''})
                </span>
              </h2>
              {staffMembers.length > 0 && (
                <button
                  onClick={downloadStaffCSV}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#2B3A67', color: 'white' }}
                >
                  <Download className="w-3 h-3" />
                  Download CSV
                </button>
              )}
            </div>

            {staffMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No staff members added yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        Name
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        Email
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        Role
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        Building
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                        Hub Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.slice(0, 10).map((staff) => (
                      <tr key={staff.id} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          {staff.first_name} {staff.last_name}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{staff.email}</td>
                        <td className="py-2 px-3">
                          {staff.role_title || staff.role ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                              {staff.role_title || staff.role}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-600">
                          {staff.buildings?.name || '-'}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`flex items-center gap-1 text-xs ${
                              staff.hub_enrolled ? 'text-teal-600' : 'text-gray-400'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                staff.hub_enrolled ? 'bg-teal-500' : 'bg-gray-300'
                              }`}
                            />
                            {staff.hub_enrolled ? 'Logged in' : 'Not yet'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {staffMembers.length > 10 && (
                  <p className="text-sm text-gray-500 text-center py-3 border-t border-gray-100">
                    Showing 10 of {staffMembers.length} staff members
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                Action Items
              </h2>
              <Link
                href={`/admin/partnerships/${partnershipId}`}
                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline"
              >
                <Plus className="w-4 h-4" />
                Manage in Full Admin
              </Link>
            </div>

            {actionItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No action items yet</p>
            ) : (
              <div className="space-y-3">
                {actionItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : item.status === 'paused'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : item.status === 'paused'
                          ? 'bg-gray-200 text-gray-500'
                          : item.priority === 'high'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {item.status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ListTodo className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          item.status === 'completed'
                            ? 'line-through text-gray-500'
                            : ''
                        }`}
                        style={{ color: item.status === 'completed' ? undefined : '#2B3A67' }}
                      >
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize">{item.category}</span>
                        {item.due_date && (
                          <>
                            <span>•</span>
                            <span>Due {new Date(item.due_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'paused'
                          ? 'bg-gray-100 text-gray-600'
                          : item.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {actionItems.length > 5 && (
                  <Link
                    href={`/admin/partnerships/${partnershipId}`}
                    className="block text-center text-sm text-amber-600 hover:underline py-2"
                  >
                    View all {actionItems.length} action items
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity Log & Info */}
        <div className="space-y-6">
          {/* Partnership Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Partnership Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Contact</span>
                <span style={{ color: '#2B3A67' }}>{partnership.contact_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="truncate ml-4" style={{ color: '#2B3A67' }}>
                  {partnership.contact_email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="capitalize" style={{ color: '#2B3A67' }}>
                  {partnership.partnership_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span style={{ color: '#2B3A67' }}>
                  {new Date(partnership.created_at).toLocaleDateString()}
                </span>
              </div>
              {partnership.contract_start && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract Start</span>
                  <span style={{ color: '#2B3A67' }}>
                    {new Date(partnership.contract_start).toLocaleDateString()}
                  </span>
                </div>
              )}
              {partnership.contract_end && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract End</span>
                  <span style={{ color: '#2B3A67' }}>
                    {new Date(partnership.contract_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Recent Metrics
            </h2>

            {metricSnapshots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No metrics recorded yet</p>
            ) : (
              <div className="space-y-2">
                {metricSnapshots.slice(0, 5).map((metric) => {
                  const status = getMetricStatus(metric.metric_name, metric.metric_value);
                  return (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                          {METRIC_TYPES.find((m) => m.value === metric.metric_name)
                            ?.label || metric.metric_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(metric.snapshot_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: metricStatusColors[status] }}
                      >
                        {formatMetricValue(metric.metric_name, metric.metric_value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="w-full flex items-center justify-between"
            >
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                Activity Log
              </h2>
              {showActivityLog ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showActivityLog && (
              <div className="mt-4 space-y-3">
                {activityLog.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activity yet</p>
                ) : (
                  activityLog.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                          {formatAction(entry.action)}
                        </p>
                        {typeof entry.details?.title === 'string' &&
                          entry.details.title && (
                            <p className="text-xs text-gray-600 truncate">
                              {entry.details.title}
                            </p>
                          )}
                        <p className="text-xs text-gray-400">
                          {getRelativeTime(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
