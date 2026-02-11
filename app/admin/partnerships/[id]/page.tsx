'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Building2,
  School,
  Loader2,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  X,
  Plus,
  BarChart3,
  CalendarPlus,
  ListTodo,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
  Activity,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getMetricStatus,
  statusColors,
  statusLabels,
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
  curated_courses?: string[] | null;
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

// Check if user is TDI admin
async function checkTDIAdmin(email: string): Promise<boolean> {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// Status badge colors
const partnershipStatusColors: Record<string, string> = {
  invited: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  setup_in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-gray-100 text-gray-600 border-gray-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
};

const partnershipStatusLabels: Record<string, string> = {
  invited: 'Awaiting Accept',
  setup_in_progress: 'Setup In Progress',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

// Phase badge colors
const phaseColors: Record<string, string> = {
  IGNITE: 'bg-orange-100 text-orange-700',
  ACCELERATE: 'bg-blue-100 text-blue-700',
  SUSTAIN: 'bg-green-100 text-green-700',
};

// Action item categories
const ACTION_CATEGORIES = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'data', label: 'Data Collection' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'engagement', label: 'Engagement' },
];

// Metric types
const METRIC_TYPES = [
  { value: 'hub_login_pct', label: 'Hub Login %' },
  { value: 'courses_avg', label: 'Avg Courses Completed' },
  { value: 'avg_stress', label: 'Avg Stress Level' },
  { value: 'implementation_pct', label: 'Implementation %' },
];

// Timeline event types
const TIMELINE_EVENT_TYPES = [
  { value: 'observation_day_completed', label: 'Observation Day Completed' },
  { value: 'virtual_session_completed', label: 'Virtual Session Completed' },
  { value: 'executive_session_completed', label: 'Executive Session Completed' },
  { value: 'survey_completed', label: 'Survey Completed' },
  { value: 'milestone_reached', label: 'Milestone Reached' },
  { value: 'pd_hours_awarded', label: 'PD Hours Awarded' },
  { value: 'custom_event', label: 'Custom Event' },
];

// Helper function for relative time
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
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

  // Data state
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [metricSnapshots, setMetricSnapshots] = useState<MetricSnapshot[]>([]);
  const [staffCount, setStaffCount] = useState(0);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Partnership>>({});
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Modal state
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showActionItemModal, setShowActionItemModal] = useState(false);

  // Modal form state
  const [metricsForm, setMetricsForm] = useState({
    metric_name: 'hub_login_pct',
    metric_value: '',
    snapshot_date: new Date().toISOString().split('T')[0],
    building_id: '',
    source: 'admin_manual',
  });

  const [timelineForm, setTimelineForm] = useState({
    event_type: 'observation_day_completed',
    event_date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    building_id: '',
  });

  const [actionItemForm, setActionItemForm] = useState({
    title: '',
    description: '',
    category: 'engagement',
    priority: 'medium',
    due_date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard Content state
  const [goalForm, setGoalForm] = useState('');
  const [successTargetsForm, setSuccessTargetsForm] = useState<string[]>(['']);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingTargets, setIsSavingTargets] = useState(false);

  const loadPartnership = useCallback(
    async (email: string) => {
      try {
        const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
          headers: {
            'x-user-email': email,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPartnership(data.partnership);
            setOrganization(data.organization);
            setActionItems(data.actionItems);
            setActivityLog(data.activityLog);
            setMetricSnapshots(data.metricSnapshots);
            setStaffCount(data.staffCount);
          }
        } else if (response.status === 404) {
          router.push('/admin/partnerships');
        }
      } catch (error) {
        console.error('Failed to load partnership:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [partnershipId, router]
  );

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      const isAdmin = await checkTDIAdmin(session.user.email);
      if (!isAdmin) {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      setUserEmail(session.user.email);
      await loadPartnership(session.user.email);
    };

    checkAuth();
  }, [router, loadPartnership]);

  // Sync dashboard content form state when organization loads
  useEffect(() => {
    if (organization) {
      setGoalForm(organization.partnership_goal || '');
      setSuccessTargetsForm(
        organization.success_targets && organization.success_targets.length > 0
          ? organization.success_targets
          : ['']
      );
    }
  }, [organization]);

  const handleSavePartnership = async () => {
    if (!userEmail || !partnership) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
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

  const handleSaveGoal = async () => {
    if (!userEmail || !organization) return;

    setIsSavingGoal(true);
    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          org_partnership_goal: goalForm.trim() || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrganization({
          ...organization,
          partnership_goal: goalForm.trim() || null,
        });
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleSaveSuccessTargets = async () => {
    if (!userEmail || !organization) return;

    setIsSavingTargets(true);
    try {
      // Filter out empty strings
      const targets = successTargetsForm.filter((t) => t.trim() !== '');

      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          org_success_targets: targets.length > 0 ? targets : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrganization({
          ...organization,
          success_targets: targets.length > 0 ? targets : null,
        });
      }
    } catch (error) {
      console.error('Error saving success targets:', error);
    } finally {
      setIsSavingTargets(false);
    }
  };

  const handleAddTarget = () => {
    if (successTargetsForm.length < 6) {
      setSuccessTargetsForm([...successTargetsForm, '']);
    }
  };

  const handleRemoveTarget = (index: number) => {
    if (successTargetsForm.length > 1) {
      setSuccessTargetsForm(successTargetsForm.filter((_, i) => i !== index));
    }
  };

  const handleTargetChange = (index: number, value: string) => {
    const updated = [...successTargetsForm];
    updated[index] = value;
    setSuccessTargetsForm(updated);
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          ...metricsForm,
          metric_value: parseFloat(metricsForm.metric_value),
          building_id: metricsForm.building_id || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMetricSnapshots([data.metric, ...metricSnapshots]);
        setShowMetricsModal(false);
        setMetricsForm({
          metric_name: 'hub_login_pct',
          metric_value: '',
          snapshot_date: new Date().toISOString().split('T')[0],
          building_id: '',
          source: 'admin_manual',
        });
      }
    } catch (error) {
      console.error('Error adding metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/timeline-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          ...timelineForm,
          building_id: timelineForm.building_id || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setActivityLog([data.event, ...activityLog]);
        setShowTimelineModal(false);
        setTimelineForm({
          event_type: 'observation_day_completed',
          event_date: new Date().toISOString().split('T')[0],
          title: '',
          description: '',
          building_id: '',
        });
        // Reload to get updated session counts
        loadPartnership(userEmail);
      }
    } catch (error) {
      console.error('Error adding timeline event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/action-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          ...actionItemForm,
          due_date: actionItemForm.due_date || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setActionItems([data.actionItem, ...actionItems]);
        setShowActionItemModal(false);
        setActionItemForm({
          title: '',
          description: '',
          category: 'engagement',
          priority: 'medium',
          due_date: '',
        });
      }
    } catch (error) {
      console.error('Error adding action item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get latest metric values
  const getLatestMetric = (metricName: string) => {
    const metric = metricSnapshots.find((m) => m.metric_name === metricName);
    return metric?.metric_value ?? null;
  };

  // Access Denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-[#1e2749] mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to TDI team members.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading partnership...</p>
        </div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Partnership not found</p>
        </div>
      </div>
    );
  }

  const orgName = organization?.name || partnership.contact_name;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={140}
              height={42}
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm bg-[#1e2749] text-white px-3 py-1 rounded-full">
                TDI Admin
              </span>
              <span className="text-sm text-gray-600">Partnership Detail</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Back link */}
        <Link
          href="/admin/partnerships"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1e2749] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partnerships
        </Link>

        {/* Quick Info Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
              <div>
                <h1 className="text-2xl font-bold text-[#1e2749]">{orgName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex text-xs px-2 py-1 rounded-full border ${partnershipStatusColors[partnership.status]}`}
                  >
                    {partnershipStatusLabels[partnership.status]}
                  </span>
                  <span
                    className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${phaseColors[partnership.contract_phase]}`}
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
              {partnership.slug && partnership.status === 'active' && (
                <Link
                  href={`/${partnership.slug}-dashboard`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#80a4ed]/10 text-[#1e2749] rounded-lg hover:bg-[#80a4ed]/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Dashboard
                </Link>
              )}
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
                    style={{ color: statusColors[status] }}
                  >
                    {formatMetricValue(metric.value, value)}
                  </p>
                  <p className="text-xs" style={{ color: statusColors[status] }}>
                    {statusLabels[status]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Link
            href={`/admin/partnerships/${partnershipId}/surveys`}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#80a4ed] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1e2749]">Survey Data</p>
              <p className="text-xs text-gray-500">Enter survey responses</p>
            </div>
          </Link>

          <button
            onClick={() => setShowMetricsModal(true)}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#80a4ed] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1e2749]">Update Metrics</p>
              <p className="text-xs text-gray-500">Record new data point</p>
            </div>
          </button>

          <button
            onClick={() => setShowTimelineModal(true)}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#80a4ed] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1e2749]">Add Timeline Event</p>
              <p className="text-xs text-gray-500">Log a session or milestone</p>
            </div>
          </button>

          <button
            onClick={() => setShowActionItemModal(true)}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#80a4ed] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1e2749]">Add Action Item</p>
              <p className="text-xs text-gray-500">Create a task</p>
            </div>
          </button>

          <button
            onClick={() => {
              setEditForm(partnership);
              setIsEditing(true);
            }}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-[#80a4ed] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#1e2749]">Edit Partnership</p>
              <p className="text-xs text-gray-500">Update details</p>
            </div>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Partnership Details & Action Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Partnership Form */}
            {isEditing && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1e2749]">Edit Partnership</h2>
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
                      onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editForm.contact_email || ''}
                      onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editForm.status || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as Partnership['status'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    >
                      <option value="invited">Awaiting Accept</option>
                      <option value="setup_in_progress">Setup In Progress</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                    <select
                      value={editForm.contract_phase || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contract_phase: e.target.value as Partnership['contract_phase'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
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
                      onChange={(e) => setEditForm({ ...editForm, contract_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract End
                    </label>
                    <input
                      type="date"
                      value={editForm.contract_end || ''}
                      onChange={(e) => setEditForm({ ...editForm, contract_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observation Days (Total)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.observation_days_total || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          observation_days_total: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Virtual Sessions (Total)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.virtual_sessions_total || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          virtual_sessions_total: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Executive Sessions (Total)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.executive_sessions_total || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          executive_sessions_total: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50"
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

            {/* Dashboard Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#80a4ed]" />
                <h2 className="text-lg font-semibold text-[#1e2749]">Dashboard Content</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Customize the content displayed on the partner&apos;s Journey tab.
              </p>

              {/* Partnership Goal Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partnership Goal
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  This appears as a quote at the top of the Journey tab.
                </p>
                <textarea
                  value={goalForm}
                  onChange={(e) => setGoalForm(e.target.value)}
                  rows={3}
                  placeholder={`Equip educators across ${organization?.name || 'your organization'} with practical strategies and resources to confidently support students and each other.`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none resize-none text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveGoal}
                    disabled={isSavingGoal}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e2749] text-white text-sm rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                  >
                    {isSavingGoal ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save Goal
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Success Targets Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Targets
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  These appear as cards in the &quot;What Success Looks Like&quot; section (max 6).
                </p>
                <div className="space-y-2">
                  {successTargetsForm.map((target, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => handleTargetChange(index, e.target.value)}
                        placeholder="e.g., Staff report increased confidence in classroom strategies"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTarget(index)}
                        disabled={successTargetsForm.length <= 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button
                    type="button"
                    onClick={handleAddTarget}
                    disabled={successTargetsForm.length >= 6}
                    className="inline-flex items-center gap-1 text-sm text-[#80a4ed] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Target
                  </button>
                  <button
                    onClick={handleSaveSuccessTargets}
                    disabled={isSavingTargets}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e2749] text-white text-sm rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                  >
                    {isSavingTargets ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save Targets
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Service Usage */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Service Usage</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">
                    {partnership.observation_days_used || 0} / {partnership.observation_days_total}
                  </p>
                  <p className="text-sm text-gray-500">Observation Days</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">
                    {partnership.virtual_sessions_used || 0} / {partnership.virtual_sessions_total}
                  </p>
                  <p className="text-sm text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">
                    {partnership.executive_sessions_used || 0} /{' '}
                    {partnership.executive_sessions_total}
                  </p>
                  <p className="text-sm text-gray-500">Executive Sessions</p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1e2749]">Action Items</h2>
                <button
                  onClick={() => setShowActionItemModal(true)}
                  className="inline-flex items-center gap-1 text-sm text-[#80a4ed] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {actionItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No action items yet</p>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item) => (
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
                                : 'bg-blue-100 text-blue-600'
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
                          className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-[#1e2749]'}`}
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
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity Log */}
          <div className="space-y-6">
            {/* Recent Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1e2749]">Recent Metrics</h2>
                <button
                  onClick={() => setShowMetricsModal(true)}
                  className="inline-flex items-center gap-1 text-sm text-[#80a4ed] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

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
                          <p className="text-sm font-medium text-[#1e2749]">
                            {METRIC_TYPES.find((m) => m.value === metric.metric_name)?.label ||
                              metric.metric_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(metric.snapshot_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: statusColors[status] }}
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
                <h2 className="text-lg font-semibold text-[#1e2749]">Activity Log</h2>
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
                    activityLog.slice(0, 20).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1e2749]">
                            {formatAction(entry.action)}
                          </p>
                          {typeof entry.details?.title === 'string' && entry.details.title && (
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

            {/* Partnership Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Partnership Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="text-[#1e2749]">{partnership.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-[#1e2749] truncate ml-4">{partnership.contact_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-[#1e2749]">
                    {new Date(partnership.created_at).toLocaleDateString()}
                  </span>
                </div>
                {partnership.contract_start && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract Start</span>
                    <span className="text-[#1e2749]">
                      {new Date(partnership.contract_start).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {partnership.contract_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract End</span>
                    <span className="text-[#1e2749]">
                      {new Date(partnership.contract_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Update Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e2749]">Update Metrics</h2>
              <button
                onClick={() => setShowMetricsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMetric} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric *</label>
                <select
                  value={metricsForm.metric_name}
                  onChange={(e) => setMetricsForm({ ...metricsForm, metric_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                >
                  {METRIC_TYPES.map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={metricsForm.metric_value}
                  onChange={(e) => setMetricsForm({ ...metricsForm, metric_value: e.target.value })}
                  placeholder={
                    metricsForm.metric_name.includes('pct')
                      ? 'e.g., 85 for 85%'
                      : 'e.g., 2.5'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={metricsForm.snapshot_date}
                  onChange={(e) =>
                    setMetricsForm({ ...metricsForm, snapshot_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={metricsForm.source}
                  onChange={(e) => setMetricsForm({ ...metricsForm, source: e.target.value })}
                  placeholder="e.g., admin_manual, survey, hub_data"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMetricsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Metric'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Timeline Event Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e2749]">Add Timeline Event</h2>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                <select
                  value={timelineForm.event_type}
                  onChange={(e) => setTimelineForm({ ...timelineForm, event_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                >
                  {TIMELINE_EVENT_TYPES.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={timelineForm.title}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                  placeholder="e.g., Fall Observation Day at Lincoln Elementary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={timelineForm.event_date}
                  onChange={(e) => setTimelineForm({ ...timelineForm, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={timelineForm.description}
                  onChange={(e) =>
                    setTimelineForm({ ...timelineForm, description: e.target.value })
                  }
                  placeholder="Optional notes about this event..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTimelineModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Action Item Modal */}
      {showActionItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e2749]">Add Action Item</h2>
              <button
                onClick={() => setShowActionItemModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActionItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={actionItemForm.title}
                  onChange={(e) =>
                    setActionItemForm({ ...actionItemForm, title: e.target.value })
                  }
                  placeholder="e.g., Upload staff roster"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={actionItemForm.description}
                  onChange={(e) =>
                    setActionItemForm({ ...actionItemForm, description: e.target.value })
                  }
                  placeholder="Optional details about this task..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={actionItemForm.category}
                    onChange={(e) =>
                      setActionItemForm({ ...actionItemForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    {ACTION_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={actionItemForm.priority}
                    onChange={(e) =>
                      setActionItemForm({ ...actionItemForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={actionItemForm.due_date}
                  onChange={(e) =>
                    setActionItemForm({ ...actionItemForm, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActionItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Item'
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
