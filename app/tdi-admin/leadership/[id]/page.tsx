'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import {
  StatCard,
  TimelineEvent,
  TimelineEventData,
  ServiceTracker,
  InvestmentStat,
  DataUploadField,
  LEGACY_COLORS,
} from '@/components/tdi-admin/leadership';
import {
  ArrowLeft,
  Building2,
  School,
  Loader2,
  ExternalLink,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  CalendarPlus,
  Edit2,
  X,
  Plus,
  TrendingUp,
  Sparkles,
  Heart,
  Award,
  FileText,
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
  staff_enrolled?: number;
  hub_login_pct?: number;
  momentum_status?: string;
  momentum_detail?: string;
  cost_per_educator?: number;
  love_notes_count?: number;
  high_engagement_pct?: number;
  data_updated_at?: string;
  status: 'invited' | 'setup_in_progress' | 'active' | 'paused' | 'completed';
  created_at: string;
  legacy_dashboard_url?: string;
}

interface Organization {
  id: string;
  name: string;
  org_type: string;
  address_city?: string;
  address_state?: string;
}

// Phase badge colors
const phaseColors: Record<string, { bg: string; text: string; label: string }> = {
  IGNITE: { bg: 'bg-amber-500', text: 'text-white', label: 'Year 1: IGNITE' },
  ACCELERATE: { bg: 'bg-teal-500', text: 'text-white', label: 'Year 2: ACCELERATE' },
  SUSTAIN: { bg: 'bg-green-500', text: 'text-white', label: 'Year 3: SUSTAIN' },
};

// Momentum status colors
const momentumColors: Record<string, string> = {
  'Building': LEGACY_COLORS.amber,
  'Growing': LEGACY_COLORS.teal,
  'Thriving': LEGACY_COLORS.green,
  'Needs Attention': '#DC2626',
};

export default function PartnershipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnershipId = params.id as string;
  const { permissions, isOwner, teamMember } = useTDIAdmin();

  // Data state
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventData[]>([]);
  const [staffCount, setStaffCount] = useState(0);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_date: '',
    event_type: 'milestone',
    status: 'upcoming',
  });

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
          setStaffCount(data.staffCount || 0);
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

  const loadTimeline = useCallback(async () => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
        headers: {
          'x-user-email': teamMember.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTimelineEvents(data.events || []);
        }
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  }, [partnershipId, teamMember?.email]);

  useEffect(() => {
    if (hasAccess) {
      loadPartnership();
      loadTimeline();
    }
  }, [hasAccess, loadPartnership, loadTimeline]);

  // Save field update
  const handleFieldSave = async (field: string, value: string | number) => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': teamMember.email,
        },
        body: JSON.stringify({ field, value }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.partnership) {
          setPartnership(data.partnership);
        }
      }
    } catch (error) {
      console.error('Failed to save field:', error);
    }
  };

  // Add timeline event
  const handleAddEvent = async () => {
    if (!teamMember?.email || !newEvent.event_title) return;

    try {
      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': teamMember.email,
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        await loadTimeline();
        setShowAddEvent(false);
        setNewEvent({ event_title: '', event_date: '', event_type: 'milestone', status: 'upcoming' });
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  // Update timeline event
  const handleUpdateEvent = async (eventId: string, updates: Partial<TimelineEventData>) => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': teamMember.email,
        },
        body: JSON.stringify({ event_id: eventId, ...updates }),
      });

      if (response.ok) {
        await loadTimeline();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  // Delete timeline event
  const handleDeleteEvent = async (eventId: string) => {
    if (!teamMember?.email) return;

    try {
      const response = await fetch(
        `/api/tdi-admin/leadership/${partnershipId}/timeline?event_id=${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-email': teamMember.email,
          },
        }
      );

      if (response.ok) {
        await loadTimeline();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  // Mark service complete
  const handleServiceComplete = async (field: string, used: number, total: number) => {
    const newUsed = Math.min(used + 1, total);
    await handleFieldSave(field, newUsed);
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
          <h1 className="font-bold mb-3 text-2xl" style={{ color: LEGACY_COLORS.navy }}>
            Access Restricted
          </h1>
          <p className="mb-6 text-gray-500">
            You don&apos;t have permission to view this partnership.
          </p>
          <Link
            href="/tdi-admin/leadership"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: LEGACY_COLORS.gold, color: LEGACY_COLORS.navy }}
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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LEGACY_COLORS.amber }} />
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-600">Partnership not found</p>
        <Link href="/tdi-admin/leadership" className="inline-block mt-4 text-amber-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const orgName = organization?.name || partnership.contact_name;
  const phase = phaseColors[partnership.contract_phase] || phaseColors.IGNITE;

  // Calculate deliverables used
  const totalDeliverables =
    partnership.observation_days_total +
    partnership.virtual_sessions_total +
    partnership.executive_sessions_total;
  const usedDeliverables =
    (partnership.observation_days_used || 0) +
    (partnership.virtual_sessions_used || 0) +
    (partnership.executive_sessions_used || 0);

  // Group timeline events by status
  const completedEvents = timelineEvents.filter((e) => e.status === 'completed');
  const inProgressEvents = timelineEvents.filter((e) => e.status === 'in_progress');
  const upcomingEvents = timelineEvents.filter((e) => e.status === 'upcoming');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Link */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6">
        <Link
          href="/tdi-admin/leadership"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leadership Dashboard
        </Link>
      </div>

      {/* Navy Gradient Header */}
      <div
        className="mt-4 mx-4 md:mx-6 rounded-2xl p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, ${LEGACY_COLORS.navy} 0%, ${LEGACY_COLORS.navyMid} 100%)`,
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                {partnership.partnership_type === 'district' ? (
                  <Building2 className="w-7 h-7 text-white" />
                ) : (
                  <School className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{orgName}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${phase.bg} ${phase.text}`}>
                    {phase.label}
                  </span>
                  {organization?.address_city && organization?.address_state && (
                    <span className="text-white/70 text-sm">
                      {organization.address_city}, {organization.address_state}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {partnership.legacy_dashboard_url && (
                <a
                  href={partnership.legacy_dashboard_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white/10 text-white hover:bg-white/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  Legacy Dashboard
                </a>
              )}
              {partnership.slug && partnership.status === 'active' && (
                <Link
                  href={`/partners/${partnership.slug}-dashboard`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: LEGACY_COLORS.gold, color: LEGACY_COLORS.navy }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Partner Dashboard
                </Link>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  editMode ? 'bg-violet-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {editMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editMode ? 'Exit Edit' : 'Edit Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={partnership.staff_enrolled || staffCount}
            label="Staff Enrolled"
            sublabel="in TDI Hub"
            color={LEGACY_COLORS.teal}
            editMode={editMode}
            onEdit={(v) => handleFieldSave('staff_enrolled', parseInt(v) || 0)}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            value={`${usedDeliverables}/${totalDeliverables}`}
            label="Deliverables"
            sublabel="completed"
            color={LEGACY_COLORS.amber}
            progress={totalDeliverables > 0 ? (usedDeliverables / totalDeliverables) * 100 : 0}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            value={`${partnership.hub_login_pct || 0}%`}
            label="Hub Engagement"
            sublabel="login rate"
            color={LEGACY_COLORS.blue}
            editMode={editMode}
            onEdit={(v) => handleFieldSave('hub_login_pct', parseFloat(v) || 0)}
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            value={partnership.contract_phase}
            label="Current Phase"
            sublabel={`${partnership.contract_start ? new Date(partnership.contract_start).getFullYear() : 'TBD'}-${partnership.contract_end ? new Date(partnership.contract_end).getFullYear() : 'TBD'}`}
            color={LEGACY_COLORS.violet}
          />
        </div>

        {/* Partnership Momentum Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${momentumColors[partnership.momentum_status || 'Building']}20` }}
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: momentumColors[partnership.momentum_status || 'Building'] }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: LEGACY_COLORS.navy }}>
                  Partnership Momentum
                </h3>
                <p className="text-sm text-gray-500">
                  {partnership.momentum_detail || 'Making steady progress on implementation goals'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {editMode ? (
                <select
                  value={partnership.momentum_status || 'Building'}
                  onChange={(e) => handleFieldSave('momentum_status', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="Building">Building</option>
                  <option value="Growing">Growing</option>
                  <option value="Thriving">Thriving</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              ) : (
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${momentumColors[partnership.momentum_status || 'Building']}20`,
                    color: momentumColors[partnership.momentum_status || 'Building'],
                  }}
                >
                  {partnership.momentum_status || 'Building'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Partnership Timeline - 3 Columns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: LEGACY_COLORS.navy }}>
              Partnership Timeline
            </h2>
            {editMode && (
              <button
                onClick={() => setShowAddEvent(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>

          {/* Add Event Form */}
          {showAddEvent && (
            <div className="mb-6 p-4 border border-violet-200 rounded-lg bg-violet-50">
              <div className="grid md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Event title..."
                  value={newEvent.event_title}
                  onChange={(e) => setNewEvent({ ...newEvent, event_title: e.target.value })}
                  className="px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white"
                />
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white"
                />
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                  className="px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 px-3 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Done Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" style={{ color: LEGACY_COLORS.green }} />
                <h3 className="font-semibold text-sm" style={{ color: LEGACY_COLORS.green }}>
                  Done ({completedEvents.length})
                </h3>
              </div>
              <div className="space-y-2">
                {completedEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No completed events</p>
                ) : (
                  completedEvents.map((event) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      editMode={editMode}
                      onUpdate={(updates) => handleUpdateEvent(event.id, updates)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" style={{ color: LEGACY_COLORS.amber }} />
                <h3 className="font-semibold text-sm" style={{ color: LEGACY_COLORS.amber }}>
                  In Progress ({inProgressEvents.length})
                </h3>
              </div>
              <div className="space-y-2">
                {inProgressEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nothing in progress</p>
                ) : (
                  inProgressEvents.map((event) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      editMode={editMode}
                      onUpdate={(updates) => handleUpdateEvent(event.id, updates)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Coming Soon Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarPlus className="w-5 h-5" style={{ color: LEGACY_COLORS.blue }} />
                <h3 className="font-semibold text-sm" style={{ color: LEGACY_COLORS.blue }}>
                  Coming Soon ({upcomingEvents.length})
                </h3>
              </div>
              <div className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      editMode={editMode}
                      onUpdate={(updates) => handleUpdateEvent(event.id, updates)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Investment By The Numbers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6" style={{ color: LEGACY_COLORS.navy }}>
            Investment By The Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InvestmentStat
              value={partnership.cost_per_educator || 0}
              label="Cost Per Educator"
              sublabel="Investment efficiency"
              prefix="$"
              editMode={editMode}
              onEdit={(v) => handleFieldSave('cost_per_educator', parseFloat(v) || 0)}
            />
            <InvestmentStat
              value={partnership.love_notes_count || 0}
              label="Love Notes"
              sublabel="Positive feedback collected"
              editMode={editMode}
              onEdit={(v) => handleFieldSave('love_notes_count', parseInt(v) || 0)}
            />
            <InvestmentStat
              value={`${partnership.high_engagement_pct || 0}%`}
              label="High Engagement"
              sublabel="Staff actively using TDI Hub"
              editMode={editMode}
              onEdit={(v) => handleFieldSave('high_engagement_pct', parseFloat(v.replace('%', '')) || 0)}
            />
            <InvestmentStat
              value={staffCount}
              label="Total Educators"
              sublabel="Staff in partnership"
            />
          </div>
        </div>

        {/* Service Delivery Tracking - Admin Only */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6" style={{ color: LEGACY_COLORS.navy }}>
            Service Delivery Tracking
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ServiceTracker
              label="Observation Days"
              used={partnership.observation_days_used || 0}
              total={partnership.observation_days_total}
              color={LEGACY_COLORS.teal}
              editMode={editMode}
              onMarkComplete={() =>
                handleServiceComplete(
                  'observation_days_used',
                  partnership.observation_days_used || 0,
                  partnership.observation_days_total
                )
              }
            />
            <ServiceTracker
              label="Virtual Sessions"
              used={partnership.virtual_sessions_used || 0}
              total={partnership.virtual_sessions_total}
              color={LEGACY_COLORS.blue}
              editMode={editMode}
              onMarkComplete={() =>
                handleServiceComplete(
                  'virtual_sessions_used',
                  partnership.virtual_sessions_used || 0,
                  partnership.virtual_sessions_total
                )
              }
            />
            <ServiceTracker
              label="Executive Sessions"
              used={partnership.executive_sessions_used || 0}
              total={partnership.executive_sessions_total}
              color={LEGACY_COLORS.violet}
              editMode={editMode}
              onMarkComplete={() =>
                handleServiceComplete(
                  'executive_sessions_used',
                  partnership.executive_sessions_used || 0,
                  partnership.executive_sessions_total
                )
              }
            />
          </div>
        </div>

        {/* Data Upload Controls - Admin Only, Edit Mode */}
        {editMode && (
          <div className="bg-violet-50 rounded-xl border-2 border-violet-200 border-dashed p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-violet-800">Admin Data Controls</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <DataUploadField
                label="Staff Enrolled"
                field="staff_enrolled"
                type="number"
                value={partnership.staff_enrolled}
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Hub Login %"
                field="hub_login_pct"
                type="number"
                value={partnership.hub_login_pct}
                unit="%"
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Momentum Status"
                field="momentum_status"
                type="select"
                value={partnership.momentum_status}
                options={['Building', 'Growing', 'Thriving', 'Needs Attention']}
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Cost Per Educator"
                field="cost_per_educator"
                type="number"
                value={partnership.cost_per_educator}
                unit="$"
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Love Notes Count"
                field="love_notes_count"
                type="number"
                value={partnership.love_notes_count}
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="High Engagement %"
                field="high_engagement_pct"
                type="number"
                value={partnership.high_engagement_pct}
                unit="%"
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Momentum Detail"
                field="momentum_detail"
                type="text"
                value={partnership.momentum_detail}
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Contract Start"
                field="contract_start"
                type="date"
                value={partnership.contract_start}
                onSave={handleFieldSave}
              />
              <DataUploadField
                label="Contract End"
                field="contract_end"
                type="date"
                value={partnership.contract_end}
                onSave={handleFieldSave}
              />
            </div>

            {partnership.data_updated_at && (
              <p className="text-xs text-violet-500 mt-4">
                Last data update: {new Date(partnership.data_updated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Partnership Info Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Contact: {partnership.contact_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Email: {partnership.contact_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(partnership.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
