'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTDIAdmin } from '@/lib/tdi-admin/context'
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions'
import { DashboardHeader } from '@/components/dashboard/shared/DashboardHeader'
import { StatCards } from '@/components/dashboard/shared/StatCards'
import { MomentumBar } from '@/components/dashboard/shared/MomentumBar'
import { PartnershipTimeline } from '@/components/dashboard/shared/PartnershipTimeline'
import { InvestmentNumbers } from '@/components/dashboard/shared/InvestmentNumbers'
import { LoveNotesCallout } from '@/components/dashboard/shared/LoveNotesCallout'
import { LeadingIndicators } from '@/components/dashboard/shared/LeadingIndicators'
import { ServiceTracker } from '@/components/dashboard/admin/ServiceTracker'
import { InlineEditField } from '@/components/dashboard/admin/InlineEditField'
import { FileUploadZone } from '@/components/dashboard/admin/FileUploadZone'
import { AIExtractModal } from '@/components/dashboard/admin/AIExtractModal'
import { HighlightControls } from '@/components/dashboard/admin/HighlightControls'
import { SectionHighlight } from '@/components/dashboard/shared/SectionHighlight'
import { STATIC_DEFAULTS } from '@/lib/dashboard/dashboardDefaults'
import { ArrowLeft, Loader2, Building2, Upload } from 'lucide-react'

interface UploadedFile {
  id: string
  filename: string
  content_type: string
  file_size: number
  uploaded_by?: string
  extracted_at?: string
  created_at: string
}

interface TimelineEvent {
  id: string
  event_title: string
  event_date?: string
  event_type: string
  status: 'completed' | 'in_progress' | 'upcoming'
  notes?: string
}

export default function AdminPartnershipDetailPage() {
  const router = useRouter()
  const params = useParams()
  const partnershipId = params.id as string
  const { permissions, isOwner, teamMember } = useTDIAdmin()

  // Data state
  const [partnership, setPartnership] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [actionItems, setActionItems] = useState<any[]>([])
  const [defaults, setDefaults] = useState<Record<string, string>>(STATIC_DEFAULTS)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [highlights, setHighlights] = useState<any[]>([])

  // Highlight controls modal state
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null)

  // AI Extract modal state
  const [extractModal, setExtractModal] = useState<{
    open: boolean
    fileId: string
    filename: string
  }>({ open: false, fileId: '', filename: '' })

  // UI state
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_type: 'custom',
    status: 'upcoming',
    event_date: '',
  })

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership')
  const userEmail = teamMember?.email || ''

  const fetchData = useCallback(async () => {
    if (!userEmail) return

    setLoading(true)
    try {
      const [pRes, tRes, aRes, dRes, fRes, hRes] = await Promise.all([
        fetch(`/api/tdi-admin/leadership/${partnershipId}`, {
          headers: { 'x-user-email': userEmail },
        }),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
          headers: { 'x-user-email': userEmail },
        }),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/action-items`, {
          headers: { 'x-user-email': userEmail },
        }),
        fetch('/api/dashboard-defaults'),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/upload`, {
          headers: { 'x-user-email': userEmail },
        }),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/highlights`, {
          headers: { 'x-user-email': userEmail },
        }),
      ])

      if (pRes.ok) {
        const pData = await pRes.json()
        setPartnership(pData.partnership)
        setOrganization(pData.organization)
      } else if (pRes.status === 404) {
        router.push('/tdi-admin/leadership')
        return
      }

      if (tRes.ok) {
        const tData = await tRes.json()
        setTimelineEvents(tData.events || [])
      }

      if (aRes.ok) {
        const aData = await aRes.json()
        setActionItems(aData.items || [])
      }

      if (dRes.ok) {
        const dData = await dRes.json()
        setDefaults(dData.defaults || STATIC_DEFAULTS)
      }

      if (fRes.ok) {
        const fData = await fRes.json()
        setUploadedFiles(fData.files || [])
      }

      if (hRes.ok) {
        const hData = await hRes.json()
        setHighlights(hData.highlights || [])
      }
    } finally {
      setLoading(false)
    }
  }, [partnershipId, userEmail, router])

  useEffect(() => {
    if (hasAccess && userEmail) {
      fetchData()
    }
  }, [hasAccess, userEmail, fetchData])

  async function handleFieldUpdate(field: string, value: any) {
    if (!userEmail) return

    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ field, value }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.partnership) {
        setPartnership(data.partnership)
      } else {
        setPartnership((prev: any) => ({ ...prev, [field]: value }))
      }
    }
  }

  async function handleAddEvent() {
    if (!userEmail || !newEvent.event_title) return

    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify(newEvent),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.event) {
        setTimelineEvents((prev) => [...prev, data.event])
      }
      setAddEventOpen(false)
      setNewEvent({ event_title: '', event_type: 'custom', status: 'upcoming', event_date: '' })
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!userEmail) return

    const res = await fetch(
      `/api/tdi-admin/leadership/${partnershipId}/timeline?event_id=${eventId}`,
      {
        method: 'DELETE',
        headers: { 'x-user-email': userEmail },
      }
    )

    if (res.ok) {
      setTimelineEvents((prev) => prev.filter((e) => e.id !== eventId))
    }
  }

  async function handleMoveEvent(eventId: string, newStatus: string) {
    if (!userEmail) return

    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ event_id: eventId, status: newStatus }),
    })

    if (res.ok) {
      setTimelineEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus as any } : e))
      )
    }
  }

  async function handleApplyExtracted(data: Record<string, any>) {
    // Apply each extracted field
    const updates: Promise<void>[] = []

    for (const [field, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        updates.push(
          handleFieldUpdate(field, value).then(() => {
            setPartnership((p: any) => ({ ...p, [field]: value }))
          })
        )
      }
    }

    await Promise.all(updates)
    setExtractModal({ open: false, fileId: '', filename: '' })
    // Refresh files to show extracted status
    const fRes = await fetch(`/api/tdi-admin/leadership/${partnershipId}/upload`, {
      headers: { 'x-user-email': userEmail },
    })
    if (fRes.ok) {
      const fData = await fRes.json()
      setUploadedFiles(fData.files || [])
    }
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Building2 size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1 className="font-bold mb-3 text-2xl" style={{ color: '#1B2A4A' }}>
            Access Restricted
          </h1>
          <p className="mb-6 text-gray-500">
            You don&apos;t have permission to view this partnership.
          </p>
          <Link
            href="/tdi-admin/leadership"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#FFBA06', color: '#1B2A4A' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D97706' }} />
      </div>
    )
  }

  // Not found
  if (!partnership) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Partnership not found.</p>
          <Link href="/tdi-admin/leadership" className="text-violet-600 text-sm hover:underline">
            Back to Leadership Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const schoolName = organization?.name || partnership.contact_name || 'School'
  const phase = (partnership.contract_phase as 'IGNITE' | 'ACCELERATE' | 'SUSTAIN') || 'IGNITE'
  const observationsDone = timelineEvents.filter(
    (e) => e.event_type === 'observation' && e.status === 'completed'
  ).length

  return (
    <div className="min-h-screen" style={{ background: '#F4F4F2' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/tdi-admin/leadership"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Leadership Dashboard
        </Link>

        {/* Header with edit toggle */}
        <DashboardHeader
          schoolName={schoolName}
          location={
            organization?.address_city && organization?.address_state
              ? `${organization.address_city}, ${organization.address_state}`
              : partnership.address
          }
          phase={phase}
          dataUpdatedAt={
            partnership.data_updated_at
              ? new Date(partnership.data_updated_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : undefined
          }
          isAdminView={true}
          legacyUrl={partnership.legacy_dashboard_url}
          editMode={editMode}
          onEditToggle={() => setEditMode(!editMode)}
        />

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-violet-50 rounded-xl border border-violet-200">
            <span className="text-xs text-violet-700 font-semibold">* Edit Mode:</span>
            <span className="text-xs text-violet-600">Click the * button on any section to add highlights, callouts, or NEW badges</span>
          </div>
        )}

        {/* Stat Cards */}
        <SectionHighlight
          sectionKey="stat_cards"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <StatCards
            staffEnrolled={partnership.staff_enrolled}
            hubLoginPct={partnership.hub_login_pct}
            observationsUsed={partnership.observation_days_used || 0}
            observationsTotal={partnership.observation_days_total || 6}
            virtualUsed={partnership.virtual_sessions_used || 0}
            virtualTotal={partnership.virtual_sessions_total || 4}
            executiveUsed={partnership.executive_sessions_used || 0}
            executiveTotal={partnership.executive_sessions_total || 2}
            phase={phase}
            defaults={defaults}
          />
        </SectionHighlight>

        {/* Momentum Bar */}
        <SectionHighlight
          sectionKey="momentum"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <MomentumBar
            status={partnership.momentum_status}
            detail={partnership.momentum_detail}
            defaults={defaults}
          />
        </SectionHighlight>

        {/* Edit mode - momentum fields */}
        {editMode && (
          <div
            className="bg-white rounded-xl border border-violet-200 p-5 mb-4"
            style={{ boxShadow: '0 1px 4px rgba(139,92,246,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-sm font-semibold text-gray-900">Edit Momentum</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Status
                </label>
                <InlineEditField
                  partnershipId={partnershipId}
                  field="momentum_status"
                  value={partnership.momentum_status}
                  type="select"
                  options={['Strong', 'Building', 'Needs Attention']}
                  onSaved={(v) => setPartnership((p: any) => ({ ...p, momentum_status: v }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Detail Text
                </label>
                <InlineEditField
                  partnershipId={partnershipId}
                  field="momentum_detail"
                  value={partnership.momentum_detail}
                  type="textarea"
                  onSaved={(v) => setPartnership((p: any) => ({ ...p, momentum_detail: v }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Partnership Timeline */}
        <SectionHighlight
          sectionKey="timeline"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <PartnershipTimeline
            events={timelineEvents}
            isAdminView={editMode}
            onAddEvent={() => setAddEventOpen(true)}
            onDeleteEvent={handleDeleteEvent}
            onMoveEvent={handleMoveEvent}
          />
        </SectionHighlight>

        {/* Add Event Modal */}
        {addEventOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="font-semibold text-gray-900 mb-4">Add Timeline Event</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.event_title}
                    onChange={(e) => setNewEvent((n) => ({ ...n, event_title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Virtual Session 4 complete"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                    <select
                      value={newEvent.event_type}
                      onChange={(e) => setNewEvent((n) => ({ ...n, event_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="custom">Custom</option>
                      <option value="observation">Observation</option>
                      <option value="virtual_session">Virtual Session</option>
                      <option value="executive_session">Executive Session</option>
                      <option value="love_notes">Love Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                    <select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent((n) => ({ ...n, status: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="completed">Done</option>
                      <option value="in_progress">In Progress</option>
                      <option value="upcoming">Coming Soon</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent((n) => ({ ...n, event_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.event_title}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: '#8B5CF6' }}
                >
                  Add Event
                </button>
                <button
                  onClick={() => setAddEventOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Investment Numbers */}
        <SectionHighlight
          sectionKey="investment"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <InvestmentNumbers
            costPerEducator={partnership.cost_per_educator}
            hubLoginPct={partnership.hub_login_pct}
            loveNotesCount={partnership.love_notes_count}
            highEngagementPct={partnership.high_engagement_pct}
            perEducatorNote={partnership.per_educator_value_note}
            defaults={defaults}
          />
        </SectionHighlight>

        {/* Love Notes Callout */}
        <SectionHighlight
          sectionKey="love_notes"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <LoveNotesCallout
            loveNotesCount={partnership.love_notes_count}
            schoolName={schoolName}
            observationDays={observationsDone || 1}
            defaults={defaults}
          />
        </SectionHighlight>

        {/* Leading Indicators */}
        <SectionHighlight
          sectionKey="leading_indicators"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <LeadingIndicators
            teacherStress={partnership.teacher_stress_score}
            strategyImplementation={partnership.strategy_implementation_pct}
            retentionIntent={partnership.retention_intent_score}
            defaults={defaults}
          />
        </SectionHighlight>

        {/* ADMIN ONLY: Service Delivery Tracking */}
        <SectionHighlight
          sectionKey="service_delivery"
          highlights={highlights}
          isAdminView={editMode}
          onEdit={(key) => setEditingHighlight(key)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <h2 className="text-base font-semibold text-gray-900">Service Delivery Tracking</h2>
              <span className="ml-auto text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                Admin Only
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ServiceTracker
                partnershipId={partnershipId}
                label="Observation Days"
                used={partnership.observation_days_used || 0}
                total={partnership.observation_days_total || 6}
                field="observation_days_used"
                color="#2D7D78"
              />
              <ServiceTracker
                partnershipId={partnershipId}
                label="Virtual Sessions"
                used={partnership.virtual_sessions_used || 0}
                total={partnership.virtual_sessions_total || 4}
                field="virtual_sessions_used"
                color="#8B5CF6"
              />
              <ServiceTracker
                partnershipId={partnershipId}
                label="Executive Sessions"
                used={partnership.executive_sessions_used || 0}
                total={partnership.executive_sessions_total || 2}
                field="executive_sessions_used"
                color="#D97706"
              />
            </div>
          </div>
        </SectionHighlight>

        {/* ADMIN ONLY: Data Upload Panel - visible in edit mode */}
        {editMode && (
          <div className="bg-violet-50 rounded-xl border border-violet-200 p-6 mb-4">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-violet-600">↑</span>
              <h2 className="text-base font-semibold text-violet-900">Update Dashboard Data</h2>
              <span className="ml-auto text-xs text-violet-500">Changes save immediately</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Hub Login %', field: 'hub_login_pct', type: 'number', suffix: '%' },
                { label: 'Staff Enrolled', field: 'staff_enrolled', type: 'number' },
                { label: 'Love Notes Delivered', field: 'love_notes_count', type: 'number' },
                { label: 'High Engagement %', field: 'high_engagement_pct', type: 'number', suffix: '%' },
                { label: 'Cost Per Educator', field: 'cost_per_educator', type: 'number', prefix: '$' },
                { label: 'Teacher Stress Score', field: 'teacher_stress_score', type: 'number', suffix: '/10' },
                { label: 'Strategy Implementation %', field: 'strategy_implementation_pct', type: 'number', suffix: '%' },
                { label: 'Retention Intent Score', field: 'retention_intent_score', type: 'number', suffix: '/10' },
              ].map(({ label, field, type, prefix, suffix }) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1 block">
                    {label}
                  </label>
                  <InlineEditField
                    partnershipId={partnershipId}
                    field={field}
                    value={partnership[field]}
                    type={type as any}
                    prefix={prefix}
                    suffix={suffix}
                    onSaved={(v) => setPartnership((p: any) => ({ ...p, [field]: v }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-violet-200">
              <p className="text-xs text-violet-600">
                Changes save immediately and update what the client sees on their dashboard.
              </p>
            </div>

            {/* File Upload Zone */}
            <div className="mt-6 pt-6 border-t border-violet-200">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-violet-900">Upload & Extract</h3>
              </div>
              <p className="text-xs text-violet-600 mb-4">
                Upload reports, screenshots, or data exports. Use AI to automatically extract metrics.
              </p>
              <FileUploadZone
                partnershipId={partnershipId}
                userEmail={userEmail}
                files={uploadedFiles}
                onFilesChange={() => {
                  fetch(`/api/tdi-admin/leadership/${partnershipId}/upload`, {
                    headers: { 'x-user-email': userEmail },
                  })
                    .then((res) => res.json())
                    .then((data) => setUploadedFiles(data.files || []))
                }}
                onExtract={(fileId, filename) =>
                  setExtractModal({ open: true, fileId, filename })
                }
              />
            </div>
          </div>
        )}

        {/* AI Extract Modal */}
        {extractModal.open && (
          <AIExtractModal
            partnershipId={partnershipId}
            fileId={extractModal.fileId}
            filename={extractModal.filename}
            userEmail={userEmail}
            onClose={() => setExtractModal({ open: false, fileId: '', filename: '' })}
            onApply={handleApplyExtracted}
          />
        )}

        {/* Highlight Controls Modal */}
        {editingHighlight && (
          <HighlightControls
            partnershipId={partnershipId}
            sectionKey={editingHighlight}
            sectionLabel={editingHighlight}
            highlights={highlights}
            userEmail={userEmail}
            onUpdate={setHighlights}
            onClose={() => setEditingHighlight(null)}
          />
        )}

        {/* Partnership Info */}
        <div
          className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <h2 className="text-sm font-semibold text-gray-900">Partnership Info</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Contact</span>
              <span className="font-medium text-gray-700">
                {partnership.primary_contact_name || partnership.contact_name || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-gray-700">
                {partnership.primary_contact_email || partnership.contact_email || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="font-medium text-gray-700 capitalize">
                {partnership.partnership_type || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phase</span>
              <span className="font-medium text-gray-700">{partnership.contract_phase || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Start</span>
              <span className="font-medium text-gray-700">{partnership.contract_start || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contract End</span>
              <span className="font-medium text-gray-700">{partnership.contract_end || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
