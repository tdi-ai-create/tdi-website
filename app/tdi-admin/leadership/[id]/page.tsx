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
import { TDISuggestions } from '@/components/dashboard/shared/TDISuggestions'
import { STATIC_DEFAULTS } from '@/lib/dashboard/dashboardDefaults'
import { generateSuggestions, type TDISuggestion } from '@/lib/dashboard/generateSuggestions'
import { StaffRosterWithPhotos, StaffPhotoUpload, FindStaffSearch } from '@/components/tdi-admin/leadership/staff'
import { ArrowLeft, Loader2, Building2, Upload, ExternalLink, Calendar, Mail, Phone, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import OnboardingChecklist from '@/components/dashboard/leadership/OnboardingChecklist'
import StaffEngagementRoster from '@/components/dashboard/leadership/StaffEngagementRoster'
import ActivationReadinessScore from '@/components/dashboard/leadership/ActivationReadinessScore'
import CourseCompletionFunnel from '@/components/dashboard/leadership/CourseCompletionFunnel'
import LoginTrendChart from '@/components/dashboard/leadership/LoginTrendChart'
import ObservationImpactScorecard from '@/components/dashboard/leadership/ObservationImpactScorecard'

// Tab configuration - mirrors principal dashboard
const ADMIN_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: '90-days', label: '90 Days' },
  { key: 'our-partnership', label: 'Our Partnership' },
  { key: 'blueprint', label: 'Blueprint' },
  { key: 'next-year', label: 'Next Year' },
  { key: 'team', label: 'Team' },
  { key: 'billing', label: 'Billing' },
]

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
  const [suggestions, setSuggestions] = useState<TDISuggestion[]>([])
  const [hubStats, setHubStats] = useState<{
    has_real_data: boolean
    member_count: number
    logins_this_month: number | null
    active_users_7d: number | null
    hub_login_pct: number | null
    course_completions: number | null
    quick_wins_completed: number | null
    mood_avg_7d: number | null
    mood_avg_30d: number | null
    moment_mode_uses_7d: number | null
  } | null>(null)
  const [moodData, setMoodData] = useState<{
    has_data: boolean
    alert: { severity: string; message: string; recommendation: string } | null
    celebration: { message: string } | null
    trend: string | null
    avg_mood_7d: number | null
    avg_mood_14d: number | null
    check_in_count_7d: number
    week_change: number | null
  } | null>(null)
  const [reflections, setReflections] = useState<{
    has_data: boolean
    reflections: { text: string; quick_win_title: string; created_at: string }[]
  }>({ has_data: false, reflections: [] })
  const [observationImpact, setObservationImpact] = useState<{
    has_data: boolean
    observations: {
      observation_id: string
      observation_title: string
      observation_date: string
      active_users_before: number
      active_users_after: number
      engagement_change_pct: number | null
      mood_before: number | null
      mood_after: number | null
      mood_change: number | null
      quick_wins_before: number
      quick_wins_after: number
    }[]
  }>({ has_data: false, observations: [] })

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
  const [activeTab, setActiveTab] = useState('overview')
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    event_title: '',
    event_type: 'custom',
    status: 'upcoming',
    event_date: '',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Inline editing state for partnership goal
  const [editingField, setEditingField] = useState<string | null>(null)
  const [localGoal, setLocalGoal] = useState('')
  const [localYear2Notes, setLocalYear2Notes] = useState('')

  // Session records state (for Our Partnership tab)
  const [sessionRecords, setSessionRecords] = useState<any[]>([])

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership')
  const userEmail = teamMember?.email || ''

  function showToast(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      setSubmitSuccess(message)
      setSubmitError(null)
      setTimeout(() => setSubmitSuccess(null), 3000)
    } else {
      setSubmitError(message)
      setSubmitSuccess(null)
      setTimeout(() => setSubmitError(null), 4000)
    }
  }

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

      // Fetch Hub stats (separate from main data for real-time Hub analytics)
      try {
        const hubResponse = await fetch(`/api/partnerships/${partnershipId}/hub-stats`)
        if (hubResponse.ok) {
          const hubData = await hubResponse.json()
          setHubStats(hubData)
        }
      } catch (hubError) {
        console.error('Error fetching hub stats:', hubError)
        // Non-fatal - dashboard works without real-time Hub data
      }

      // Fetch mood trend, reflections, and observation impact in parallel - non-blocking
      Promise.all([
        fetch(`/api/partnerships/${partnershipId}/hub-mood`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/hub-reflections`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/hub-observation-impact`).then(r => r.ok ? r.json() : null),
      ]).then(([mood, refs, obsImpact]) => {
        if (mood) setMoodData(mood)
        if (refs) setReflections(refs)
        if (obsImpact) setObservationImpact(obsImpact)
      }).catch(err => console.error('Hub signal fetch error:', err))
    } finally {
      setLoading(false)
    }
  }, [partnershipId, userEmail, router])

  useEffect(() => {
    if (hasAccess && userEmail) {
      fetchData()
    }
  }, [hasAccess, userEmail, fetchData])

  // Sync local state when partnership loads
  useEffect(() => {
    if (partnership?.partnership_goal) {
      setLocalGoal(partnership.partnership_goal)
    }
    if (partnership?.year2_planning_notes) {
      setLocalYear2Notes(partnership.year2_planning_notes)
    }
  }, [partnership])

  // Generate suggestions when partnership data is loaded
  useEffect(() => {
    if (!partnership) return

    // Build partnership data for suggestion engine
    const partnershipData = {
      slug: partnership.slug || '',
      contract_phase: partnership.contract_phase || '',
      momentum_status: partnership.momentum_status || 'Active',
      staff_enrolled: partnership.staff_enrolled || 0,
      hub_login_pct: partnership.hub_login_pct,
      love_notes_count: partnership.love_notes_count,
      observation_days_used: partnership.observation_days_used || 0,
      observation_days_total: partnership.observation_days_total || 0,
      virtual_sessions_used: partnership.virtual_sessions_used || 0,
      virtual_sessions_total: partnership.virtual_sessions_total || 0,
      executive_sessions_used: partnership.executive_sessions_used || 0,
      executive_sessions_total: partnership.executive_sessions_total || 0,
      teacher_stress_score: partnership.teacher_stress_score,
      strategy_implementation_pct: partnership.strategy_implementation_pct,
      retention_intent_score: partnership.retention_intent_score,
      contract_end: partnership.contract_end,
      data_updated_at: partnership.data_updated_at,
    }

    // Convert timeline events to expected format
    const formattedEvents = timelineEvents.map(e => ({
      status: e.status,
      event_type: e.event_type,
      event_date: e.event_date || null,
    }))

    const generated = generateSuggestions(partnershipData, formattedEvents, actionItems, moodData)
    setSuggestions(generated)
  }, [partnership, timelineEvents, actionItems, moodData])

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
      showToast('Event added to timeline', 'success')
    } else {
      const err = await res.json().catch(() => ({}))
      showToast(err.message || 'Failed to add event - please try again', 'error')
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
      showToast('Event removed', 'success')
    } else {
      showToast('Failed to delete event - please try again', 'error')
    }
  }

  async function handleMoveEvent(eventId: string, newStatus: string) {
    if (!userEmail) return

    // Optimistic update - move immediately in UI
    const originalEvent = timelineEvents.find(e => e.id === eventId)
    setTimelineEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus as any } : e))
    )

    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({ event_id: eventId, status: newStatus }),
    })

    if (!res.ok) {
      // Revert the optimistic update on failure
      if (originalEvent) {
        setTimelineEvents((prev) =>
          prev.map((e) => (e.id === eventId ? originalEvent : e))
        )
      }
      showToast('Failed to move event - please try again', 'error')
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

  const schoolName = partnership.org_name || organization?.name || 'School'
  const phase = (partnership.contract_phase as 'IGNITE' | 'ACCELERATE' | 'SUSTAIN') || 'IGNITE'
  const observationsDone = timelineEvents.filter(
    (e) => e.event_type === 'observation' && e.status === 'completed'
  ).length

  const contactName = partnership.primary_contact_name || partnership.contact_name || 'the principal'

  return (
    <div className="min-h-screen" style={{ background: '#F4F4F2' }}>
      {/* Toast notifications */}
      {(submitSuccess || submitError) && (
        <div
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all"
          style={{ background: submitSuccess ? '#16A34A' : '#DC2626' }}
        >
          {submitSuccess || submitError}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/tdi-admin/leadership"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Leadership Dashboard
        </Link>

        {/* Admin Header Bar */}
        <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
              Admin View
            </span>
            <span className="text-sm font-semibold text-gray-900">{schoolName}</span>
            {partnership.data_updated_at && (
              <span className="text-xs text-gray-400">
                Last updated: {new Date(partnership.data_updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                editMode
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {editMode ? '✎ Editing' : '✎ Edit Data'}
            </button>
            <a
              href={`/partners/${partnership.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              View Client Dashboard
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Header with school info */}
        <DashboardHeader
          schoolName={schoolName}
          location={
            organization?.address_city && organization?.address_state
              ? `${organization.address_city}, ${organization.address_state}`
              : partnership.address
          }
          phase={phase}
          dataUpdatedAt={undefined}
          isAdminView={true}
          showAdminControls={false}
        />

        {/* Tab Bar - mirrors principal dashboard */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-violet-50 rounded-xl border border-violet-200">
            <span className="text-xs text-violet-700 font-semibold">✎ Edit Mode:</span>
            <span className="text-xs text-violet-600">Click edit buttons to modify fields. Changes save immediately and update what the client sees.</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            OVERVIEW TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* AI Guidance for Overview */}
            {editMode && (
              <div className="mb-4 p-4 rounded-xl border border-violet-200 bg-violet-50">
                <div className="flex items-start gap-2">
                  <span className="text-violet-500 text-lg flex-shrink-0">✦</span>
                  <div>
                    <p className="text-sm font-semibold text-violet-800 mb-1">AI Tip: Overview Tab</p>
                    <p className="text-sm text-violet-700 leading-relaxed">
                      The Overview is the first thing {contactName} sees when they log in.
                      Keep momentum status current and make sure the TDI Suggestions
                      reflect where this partnership actually is. If hub login % is low,
                      update it so the suggestion fires correctly.
                    </p>
                  </div>
                </div>
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
            hubStats={hubStats}
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

        {/* TDI Suggestions */}
        <TDISuggestions suggestions={suggestions} isAdminView={true} />

        {/* Teacher Voice - reflections from Quick Wins */}
        {reflections.has_data && reflections.reflections.length > 0 && (
          <div
            className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Teacher Voice</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  What teachers wrote after Quick Wins - unfiltered and unprompted
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: '#F0FDF4', color: '#16A34A' }}
              >
                {reflections.reflections.length} reflections
              </span>
            </div>

            <div className="space-y-3">
              {reflections.reflections.slice(0, 5).map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
                >
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    &quot;{r.text}&quot;
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{r.quick_win_title}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Use these as talking points before your next observation day
            </p>
          </div>
        )}

        {/* Observation Impact - before/after Hub data around observation days */}
        {observationImpact.has_data && observationImpact.observations.length > 0 && (
          <div
            className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Observation Impact</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hub activity 7 days before vs 7 days after each observation
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {observationImpact.observations.map((obs) => (
                <div
                  key={obs.observation_id}
                  className="rounded-lg p-4"
                  style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                      {obs.observation_title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(obs.observation_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Engagement change */}
                    <div className="text-center">
                      <div
                        className="text-lg font-bold"
                        style={{
                          color: obs.engagement_change_pct === null ? '#9CA3AF'
                            : obs.engagement_change_pct > 0 ? '#16A34A'
                            : obs.engagement_change_pct < 0 ? '#DC2626'
                            : '#6B7280'
                        }}
                      >
                        {obs.engagement_change_pct === null ? '-'
                          : obs.engagement_change_pct > 0 ? `+${obs.engagement_change_pct}%`
                          : `${obs.engagement_change_pct}%`}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Hub engagement</div>
                      <div className="text-xs text-gray-300 mt-0.5">
                        {obs.active_users_before} → {obs.active_users_after} active users
                      </div>
                    </div>

                    {/* Mood change */}
                    <div className="text-center">
                      <div
                        className="text-lg font-bold"
                        style={{
                          color: obs.mood_change === null ? '#9CA3AF'
                            : obs.mood_change > 0 ? '#16A34A'
                            : obs.mood_change < 0 ? '#DC2626'
                            : '#6B7280'
                        }}
                      >
                        {obs.mood_change === null ? '-'
                          : obs.mood_change > 0 ? `+${obs.mood_change}`
                          : `${obs.mood_change}`}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Avg mood score</div>
                      {obs.mood_before !== null && obs.mood_after !== null && (
                        <div className="text-xs text-gray-300 mt-0.5">
                          {obs.mood_before} → {obs.mood_after} /5
                        </div>
                      )}
                    </div>

                    {/* Quick wins */}
                    <div className="text-center">
                      <div
                        className="text-lg font-bold"
                        style={{
                          color: obs.quick_wins_after > obs.quick_wins_before ? '#16A34A'
                            : obs.quick_wins_after < obs.quick_wins_before ? '#DC2626'
                            : '#6B7280'
                        }}
                      >
                        {obs.quick_wins_after > obs.quick_wins_before
                          ? `+${obs.quick_wins_after - obs.quick_wins_before}`
                          : obs.quick_wins_after - obs.quick_wins_before}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Quick wins</div>
                      <div className="text-xs text-gray-300 mt-0.5">
                        {obs.quick_wins_before} → {obs.quick_wins_after} completed
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Use this data in renewal conversations to show the impact of in-person visits
            </p>
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
            hubStats={hubStats}
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
                hubStats={hubStats}
              />
            </SectionHighlight>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            OUR PARTNERSHIP TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'our-partnership' && (
          <>
            {/* AI Guidance for Our Partnership */}
            {editMode && (
              <div className="mb-4 p-4 rounded-xl border border-violet-200 bg-violet-50">
                <div className="flex items-start gap-2">
                  <span className="text-violet-500 text-lg flex-shrink-0">✦</span>
                  <div>
                    <p className="text-sm font-semibold text-violet-800 mb-1">AI Tip: Our Partnership Tab</p>
                    <p className="text-sm text-violet-700 leading-relaxed">
                      This tab shows the full partnership story. Make sure the Partnership Goal
                      is specific and measurable. Timeline events should be celebratory - instead of
                      &quot;Virtual Session 1&quot; try &quot;Virtual Session 1 - Hub onboarding + goals set.&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Partnership Goal - Editable */}
            <div
              className="bg-white rounded-xl border p-6 mb-4"
              style={{ borderColor: editMode ? '#8B5CF6' : '#F3F4F6' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#2D7D78' }} />
                  <h2 className="text-base font-semibold text-gray-900">Our Partnership Goal</h2>
                </div>
                {editMode && editingField !== 'partnership_goal' && (
                  <button
                    onClick={() => setEditingField('partnership_goal')}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    ✎ Edit
                  </button>
                )}
              </div>

              {editMode && editingField === 'partnership_goal' ? (
                <div>
                  <textarea
                    value={localGoal}
                    onChange={(e) => setLocalGoal(e.target.value)}
                    rows={3}
                    className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 mb-2"
                    placeholder="e.g. Support 19 educators with Hub access, building classroom strategies and reducing teacher stress during a 3-month pilot."
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={async () => {
                        await handleFieldUpdate('partnership_goal', localGoal)
                        setEditingField(null)
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: '#8B5CF6' }}
                    >
                      Save Goal
                    </button>
                    <button
                      onClick={() => {
                        setLocalGoal(partnership?.partnership_goal || '')
                        setEditingField(null)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  {/* AI Guidance */}
                  <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                    <p className="text-xs font-semibold text-violet-700 mb-1">✦ AI Guidance</p>
                    <p className="text-xs text-violet-600 leading-relaxed">
                      A strong partnership goal includes: (1) who is being served (staff count + role),
                      (2) the main outcome (what changes for them), and (3) the timeframe.
                      Keep it to 1-2 sentences. The principal will see this at the top of their Our Partnership tab.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed font-medium">
                  {partnership.partnership_goal || (
                    <span className="text-gray-400 italic text-sm">No goal set yet. Click Edit to add one.</span>
                  )}
                </p>
              )}
            </div>

            {/* Service Delivery Tracking - Admin Only, moved to Our Partnership tab */}
            {editMode && ((partnership.observation_days_total || 0) > 0 ||
              (partnership.virtual_sessions_total || 0) > 0 ||
              (partnership.executive_sessions_total || 0) > 0) && (
              <SectionHighlight
                sectionKey="service_delivery"
                highlights={highlights}
                isAdminView={editMode}
                onEdit={(key) => setEditingHighlight(key)}
              >
                <div
                  className="bg-white rounded-xl border border-violet-200 p-6 mb-4"
                  style={{ boxShadow: '0 1px 4px rgba(139,92,246,0.08)' }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <h2 className="text-base font-semibold text-gray-900">Mark Session Complete</h2>
                    <span className="ml-auto text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                      Admin Only
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <ServiceTracker
                      partnershipId={partnershipId}
                      label="Observation Days"
                      used={partnership.observation_days_used || 0}
                      total={partnership.observation_days_total || 0}
                      sessionType="observation"
                      color="#2D7D78"
                      userEmail={userEmail}
                      onCompleted={(result) => {
                        setPartnership((p: any) => ({
                          ...p,
                          observation_days_used: (p.observation_days_used || 0) + 1,
                          love_notes_count:
                            (p.love_notes_count || 0) + (result.sessionRecord?.love_notes_count || 0),
                        }))
                        fetchData()
                      }}
                    />
                    <ServiceTracker
                      partnershipId={partnershipId}
                      label="Virtual Sessions"
                      used={partnership.virtual_sessions_used || 0}
                      total={partnership.virtual_sessions_total || 0}
                      sessionType="virtual_session"
                      color="#8B5CF6"
                      userEmail={userEmail}
                      onCompleted={() => {
                        setPartnership((p: any) => ({
                          ...p,
                          virtual_sessions_used: (p.virtual_sessions_used || 0) + 1,
                        }))
                        fetchData()
                      }}
                    />
                    <ServiceTracker
                      partnershipId={partnershipId}
                      label="Executive Sessions"
                      used={partnership.executive_sessions_used || 0}
                      total={partnership.executive_sessions_total || 0}
                      sessionType="executive_session"
                      color="#D97706"
                      userEmail={userEmail}
                      onCompleted={() => {
                        setPartnership((p: any) => ({
                          ...p,
                          executive_sessions_used: (p.executive_sessions_used || 0) + 1,
                        }))
                        fetchData()
                      }}
                    />
                  </div>
                </div>
              </SectionHighlight>
            )}

            {/* Partnership Timeline with AI tip */}
            {editMode && (
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 mb-3">
                <p className="text-xs font-semibold text-violet-700 mb-1">✦ AI Guidance</p>
                <p className="text-xs text-violet-600 leading-relaxed">
                  Great timeline events are specific and celebratory. Instead of &quot;Virtual Session 1&quot;
                  try &quot;Virtual Session 1 - Hub onboarding + partnership goals set.&quot;
                  The Done column builds momentum for the principal. Keep Coming Soon honest -
                  only add dates you&apos;re confident about.
                </p>
              </div>
            )}

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
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BLUEPRINT TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'blueprint' && (
          <>
            {editMode && (
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 mb-4">
                <p className="text-xs text-violet-700">
                  ✦ Blueprint tab content is standard across all partnerships.
                  The &quot;You Are Here&quot; phase updates automatically when you change the contract phase
                  in School Information on the Team tab.
                </p>
              </div>
            )}

            {/* Blueprint content - simplified for admin view */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">The TDI Blueprint</h2>
              <p className="text-gray-600 mb-6">
                Our partnership follows a proven three-phase framework designed to create lasting change.
              </p>

              {/* Phase Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { phase: 'IGNITE', title: 'Build the Foundation', desc: 'Hub onboarding, first observations, baseline data collection' },
                  { phase: 'ACCELERATE', title: 'Scale to Full Staff', desc: 'Growth groups, expanded observations, mid-year review' },
                  { phase: 'SUSTAIN', title: 'Embed for Lasting Change', desc: 'Internal coaching capacity, full implementation, annual impact' },
                ].map((p) => (
                  <div
                    key={p.phase}
                    className={`p-5 rounded-xl border-2 ${
                      partnership.contract_phase === p.phase
                        ? 'border-[#4ecdc4] bg-[#4ecdc4]/10'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {partnership.contract_phase === p.phase && (
                      <span className="text-xs font-bold text-[#4ecdc4] mb-2 block">YOU ARE HERE</span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-1">{p.phase}</h3>
                    <p className="text-sm font-medium text-gray-700 mb-2">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            NEXT YEAR TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'next-year' && (
          <>
            {/* Admin-only Year 2 Planning Notes */}
            {editMode && (
              <div className="bg-white rounded-xl border border-violet-200 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-violet-500">✦</span>
                  <h3 className="text-sm font-semibold text-violet-900">Year 2 Planning Notes</h3>
                  <span className="text-xs text-violet-500 ml-auto">Admin only</span>
                </div>
                <InlineEditField
                  partnershipId={partnershipId}
                  field="year2_planning_notes"
                  value={partnership.year2_planning_notes}
                  type="textarea"
                  onSaved={(v) => setPartnership((p: any) => ({ ...p, year2_planning_notes: v }))}
                />
                <div className="mt-3 p-3 rounded-lg bg-violet-50">
                  <p className="text-xs text-violet-600 leading-relaxed">
                    ✦ AI Guidance: Note the renewal conversation status, any pricing discussions,
                    what phase they&apos;d move to, and any concerns. This is internal only -
                    the principal sees the standard Next Year content.
                  </p>
                </div>
              </div>
            )}

            {/* Standard Next Year content */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Your Growth Plan</h2>
              <p className="text-gray-600 mb-6">
                Building on this year&apos;s momentum, here&apos;s what Year 2 can look like for {schoolName}.
              </p>

              {/* Proposed Timeline */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Proposed 2026-27 Timeline</h3>
                <div className="space-y-3">
                  {[
                    { month: 'Aug', event: 'Leadership Planning Session' },
                    { month: 'Sep', event: 'On-Site Kickoff (full team)' },
                    { month: 'Oct', event: 'Virtual Session: Advanced strategies' },
                    { month: 'Nov', event: 'Observation Day: Expanded groups' },
                    { month: 'Jan', event: 'Mid-Year Check-in + Growth Group refresh' },
                    { month: 'Mar', event: 'Observation Day: Full implementation' },
                    { month: 'May', event: 'Executive Impact Session: Annual results + Year 3' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="font-semibold text-gray-900 w-10">{item.month}</span>
                      <span className="text-gray-600">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TEAM TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <>
            {/* AI Guidance for Team */}
            {editMode && (
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 mb-4">
                <p className="text-xs font-semibold text-violet-700 mb-1">✦ AI Guidance</p>
                <p className="text-xs text-violet-600 leading-relaxed">
                  Make sure the primary contact name and email are correct -
                  these show on the principal&apos;s Team tab. The phone number is helpful
                  for your records but isn&apos;t shown to the principal.
                </p>
              </div>
            )}

            {/* TDI Team */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your TDI Team</h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#1e2749]">Rae Hughart</p>
                  <p className="text-gray-500">Founder & CEO</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href="mailto:Rae@TeachersDeserveIt.com" className="text-blue-600 hover:underline">
                        Rae@TeachersDeserveIt.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href="tel:+18477215503" className="text-blue-600 hover:underline">847-721-5503</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Also available by text!</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFBA06] text-[#1e2749] rounded-lg font-medium hover:bg-[#e5a805] transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule a Call
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* School Information - editable in edit mode */}
            <div
              className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />
                <h2 className="text-sm font-semibold text-gray-900">School Information</h2>
                {editMode && (
                  <span className="ml-auto text-xs text-violet-500">Click any field to edit</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {/* School Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    School / District Name
                  </label>
                  {editMode ? (
                    <InlineEditField
                      partnershipId={partnershipId}
                      field="name"
                      value={organization?.name}
                      type="text"
                      onSaved={(v) => setOrganization((o: any) => ({ ...o, name: v }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{organization?.name || '—'}</p>
                  )}
                </div>

                {/* Primary Contact Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Primary Contact
                  </label>
                  {editMode ? (
                    <InlineEditField
                      partnershipId={partnershipId}
                      field="primary_contact_name"
                      value={partnership?.primary_contact_name}
                      type="text"
                      onSaved={(v) => setPartnership((p: any) => ({ ...p, primary_contact_name: v }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.primary_contact_name || '—'}</p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Contact Email
                  </label>
                  {editMode ? (
                    <InlineEditField
                      partnershipId={partnershipId}
                      field="primary_contact_email"
                      value={partnership?.primary_contact_email}
                      type="text"
                      onSaved={(v) => setPartnership((p: any) => ({ ...p, primary_contact_email: v }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.primary_contact_email || '—'}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Phone
                  </label>
                  {editMode ? (
                    <InlineEditField
                      partnershipId={partnershipId}
                      field="phone"
                      value={partnership?.phone}
                      type="text"
                      onSaved={(v) => setPartnership((p: any) => ({ ...p, phone: v }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.phone || '—'}</p>
                  )}
                </div>

                {/* Contract Phase */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Contract Phase
                  </label>
                  {editMode ? (
                    <InlineEditField
                      partnershipId={partnershipId}
                      field="contract_phase"
                      value={partnership?.contract_phase}
                      type="select"
                      options={['IGNITE', 'ACCELERATE', 'SUSTAIN']}
                      onSaved={(v) => setPartnership((p: any) => ({ ...p, contract_phase: v }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.contract_phase || '—'}</p>
                  )}
                </div>

                {/* Contract Dates */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                    Contract Period
                  </label>
                  <p className="text-sm text-gray-700">
                    {partnership?.contract_start || 'Not set'} — {partnership?.contract_end || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Roster with Photos */}
            <StaffRosterWithPhotos
              partnershipId={partnershipId}
              userEmail={userEmail}
              editMode={editMode}
            />

            {/* Bulk Photo Upload (edit mode only) */}
            {editMode && (
              <StaffPhotoUpload
                partnershipId={partnershipId}
                userEmail={userEmail}
              />
            )}

            {/* Find Staff - Walkthrough Search */}
            <FindStaffSearch
              partnershipId={partnershipId}
              userEmail={userEmail}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BILLING TAB
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'billing' && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Billing & Contract</h2>
              <p className="text-gray-600 mb-6">
                Contract and billing details for this partnership.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partnership Type</p>
                    <p className="font-medium text-[#1e2749] capitalize">{partnership.partnership_type || 'School'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Period</p>
                    <p className="font-medium text-[#1e2749]">
                      {partnership.contract_start
                        ? new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'Not set'}{' '}
                      —{' '}
                      {partnership.contract_end
                        ? new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Phase</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#4ecdc420', color: '#2D7D78' }}
                    >
                      {partnership.contract_phase || 'IGNITE'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Staff Enrolled</p>
                    <p className="font-medium text-[#1e2749]">{partnership.staff_enrolled || 0} educators</p>
                  </div>
                </div>
              </div>

              {/* Contact for billing questions */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Questions about billing? Contact{' '}
                  <a href="mailto:Rae@TeachersDeserveIt.com" className="text-violet-600 hover:underline">
                    Rae@TeachersDeserveIt.com
                  </a>
                </p>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            90 DAYS TAB — First 90 Days Framework Quick Wins
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === '90-days' && (
          <>
            <div className="mb-4 p-4 rounded-xl border border-teal-200 bg-teal-50">
              <div className="flex items-start gap-2">
                <span className="text-teal-500 text-lg flex-shrink-0">✦</span>
                <div>
                  <p className="text-sm font-semibold text-teal-800 mb-1">First 90 Days Dashboard</p>
                  <p className="text-sm text-teal-700 leading-relaxed">
                    Live Hub signals for the onboarding activation framework. Use the Activation
                    Readiness Score as the single readiness number for Phase 0 gate reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 1: Activation Score + Onboarding Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">
              <ActivationReadinessScore partnershipId={partnershipId} />
              <OnboardingChecklist partnershipId={partnershipId} />
            </div>

            {/* Row 2: Staff Engagement Roster (full width) */}
            <StaffEngagementRoster partnershipId={partnershipId} />

            {/* Row 3: Course Funnel + Login Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">
              <CourseCompletionFunnel partnershipId={partnershipId} />
              <LoginTrendChart partnershipId={partnershipId} />
            </div>

            {/* Row 4: Observation Impact Scorecard */}
            <ObservationImpactScorecard observations={observationImpact.observations} />
          </>
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

        {/* Add Event Modal */}
        {addEventOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="font-semibold text-gray-900 mb-4">Add Timeline Event</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.event_title}
                    onChange={(e) => setNewEvent((n) => ({ ...n, event_title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Virtual Session 4 - Growth Group strategies"
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
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Date (optional)</label>
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
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
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
      </div>
    </div>
  )
}
