'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTDIAdmin } from '@/lib/tdi-admin/context'
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions'
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
import { TDISuggestions } from '@/components/dashboard/shared/TDISuggestions'
import { STATIC_DEFAULTS } from '@/lib/dashboard/dashboardDefaults'
import { generateSuggestions, type TDISuggestion } from '@/lib/dashboard/generateSuggestions'
import { StaffRosterWithPhotos, StaffPhotoUpload, FindStaffSearch } from '@/components/tdi-admin/leadership/staff'
import { ArrowLeft, Loader2, Building2, ExternalLink, Calendar, Mail, Phone, MessageCircle, Eye,
  FileText, BarChart3, Users, AlertTriangle, TrendingUp, Briefcase, Edit3, X, Target,
} from 'lucide-react'
import Image from 'next/image'
import ObservationImpactScorecard from '@/components/dashboard/leadership/ObservationImpactScorecard'
import PositionStrip from '@/components/tdi-admin/billing/PositionStrip'
import DeliverablesList from '@/components/tdi-admin/leadership/DeliverablesList'
import BriefingModal from '@/components/tdi-admin/leadership/BriefingModal'
import ActionItemsSidebar from '@/components/tdi-admin/leadership/ActionItemsSidebar'
import ErrorBoundary from '@/components/tdi-admin/leadership/ErrorBoundary'
import YourPeoplePanel from '@/components/tdi-admin/leadership/YourPeoplePanel'
import LogSessionPanel from '@/components/tdi-admin/leadership/LogSessionPanel'
import ObservationPanel from '@/components/tdi-admin/leadership/ObservationPanel'

const NOTE_TYPE_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  strategy: 'bg-blue-100 text-blue-700',
  concern: 'bg-red-100 text-red-700',
  win: 'bg-green-100 text-green-700',
  follow_up: 'bg-amber-100 text-amber-700',
}

const MEETING_TYPE_LABELS: Record<string, string> = {
  check_in: 'Check-in', onboarding: 'Onboarding', observation_debrief: 'Observation debrief',
  renewal: 'Renewal', strategy: 'Strategy', escalation: 'Escalation', other: 'Other',
}

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  IGNITE: { bg: '#FEF3C7', text: '#92400E' },
  ACCELERATE: { bg: '#DBEAFE', text: '#1E40AF' },
  SUSTAIN: { bg: '#D1FAE5', text: '#065F46' },
}

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

  // AI Extract modal state
  const [extractModal, setExtractModal] = useState<{
    open: boolean
    fileId: string
    filename: string
  }>({ open: false, fileId: '', filename: '' })

  // AI insight state
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [aiInsightLoading, setAiInsightLoading] = useState(false)

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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Internal tab state (notes + meetings)
  const [internalNotes, setInternalNotes] = useState<{ id: string; content: string; author: string; note_type: string; visible_to_partner: boolean; created_at: string }[]>([])
  const [openFlags, setOpenFlags] = useState<{ id: string; flag_key: string; severity: string; message: string; first_raised_at: string; last_seen_at: string }[]>([])
  const [internalMeetings, setInternalMeetings] = useState<{ id: string; meeting_date: string; meeting_type: string; attendees: string | null; summary: string | null; action_items: string | null; logged_by: string; created_at: string }[]>([])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteType, setNewNoteType] = useState('general')
  const [addingNote, setAddingNote] = useState(false)
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ date: '', type: 'check_in', attendees: '', summary: '', actionItems: '' })
  const [addingMeeting, setAddingMeeting] = useState(false)

  // KPI state
  const [kpiMenu, setKpiMenu] = useState<{ key: string; label: string; unit: string; benchmarkLow: number; benchmarkHigh: number; benchmarkLabel: string; dataSource: string; howTdiDelivers: string; suggestedTarget: number; category: string }[]>([])
  const [activeKpis, setActiveKpis] = useState<{ id: string; kpi_key: string; kpi_label: string; target_value: number; target_unit: string; current_value: number; benchmark_label: string; how_tdi_delivers: string; status: string }[]>([])
  const [selectedKpiKeys, setSelectedKpiKeys] = useState<Set<string>>(new Set())
  const [kpiTargets, setKpiTargets] = useState<Record<string, number>>({})
  const [savingKpis, setSavingKpis] = useState(false)
  const [provisioningRoster, setProvisioningRoster] = useState(false)
  const [provisionResult, setProvisionResult] = useState('')
  const [grantPursuits, setGrantPursuits] = useState<{ id: string; pursuit_name: string; current_phase: string; total_amount: number; total_awarded: number; funding_paths: string; contract_gap: number }[]>([])

  // V2 state: Timeline filter, expanded sidebar sections, slide-out panels
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'notes' | 'meetings' | 'actions'>('all')
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  const [show90DaysPanel, setShow90DaysPanel] = useState(false)
  const [showOverviewPanel, setShowOverviewPanel] = useState(false)
  const [showKpiSelector, setShowKpiSelector] = useState(false)
  const [showSchoolInfo, setShowSchoolInfo] = useState(false)
  const [showObservationPanel, setShowObservationPanel] = useState(false)

  // Opening one panel closes the others. Reports has no panel of its own, it
  // just scrolls to the report buttons that are already on the page.
  type DetailPanel = 'people' | 'observations' | 'reports' | 'team' | 'client' | 'record'
  function openPanel(panel: DetailPanel) {
    const next = {
      people: panel === 'people' ? !show90DaysPanel : false,
      observations: panel === 'observations' ? !showObservationPanel : false,
      team: panel === 'team' ? !showTeamPanel : false,
      client: panel === 'client' ? !showOverviewPanel : false,
      record: panel === 'record' ? !showSchoolInfo : false,
    }
    setShow90DaysPanel(next.people)
    setShowObservationPanel(next.observations)
    setShowTeamPanel(next.team)
    setShowOverviewPanel(next.client)
    setShowSchoolInfo(next.record)
    if (panel === 'reports') {
      document.getElementById('leadership-reports')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Inline editing state for partnership goal
  const [editingField, setEditingField] = useState<string | null>(null)
  const [localGoal, setLocalGoal] = useState('')
  const [localYear2Notes, setLocalYear2Notes] = useState('')

  // Inline editing state for timeline events (Fix 1)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingEventTitle, setEditingEventTitle] = useState('')

  // Inline editing state for notes (Fix 2)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')

  // Inline editing state for KPI current value (Fix 3)
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null)
  const [editingKpiValue, setEditingKpiValue] = useState('')

  // Briefing modal state (Fix 4)
  const [briefingData, setBriefingData] = useState<any>(null)
  const [briefingLoading, setBriefingLoading] = useState(false)

  // Timeline pagination (Fix 6)
  const [timelineLimit, setTimelineLimit] = useState(20)

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership')
  const userEmail = teamMember?.email || ''

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    if (type === 'success') {
      setSubmitSuccess(message)
      setSubmitError(null)
      toastTimerRef.current = setTimeout(() => setSubmitSuccess(null), 3000)
    } else {
      setSubmitError(message)
      setSubmitSuccess(null)
      toastTimerRef.current = setTimeout(() => setSubmitError(null), 4000)
    }
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!userEmail) return

    setLoading(true)
    try {
      const [pRes, tRes, aRes, dRes, fRes, notesRes, meetingsRes, kpiRes] = await Promise.all([
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
        fetch(`/api/tdi-admin/leadership/${partnershipId}/notes`),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/meetings`),
        fetch(`/api/tdi-admin/leadership/${partnershipId}/kpis`),
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

      if (notesRes.ok) {
        const nd = await notesRes.json()
        if (nd.notes) setInternalNotes(nd.notes)
        if (nd.flags) setOpenFlags(nd.flags)
      }
      if (meetingsRes.ok) {
        const md = await meetingsRes.json()
        if (md.meetings) setInternalMeetings(md.meetings)
      }
      if (kpiRes.ok) {
        const kd = await kpiRes.json()
        if (kd.menu) setKpiMenu(kd.menu)
        if (kd.kpis) {
          setActiveKpis(kd.kpis)
          setSelectedKpiKeys(new Set(kd.kpis.map((k: { kpi_key: string }) => k.kpi_key)))
          const targets: Record<string, number> = {}
          kd.kpis.forEach((k: { kpi_key: string; target_value: number }) => { targets[k.kpi_key] = k.target_value })
          setKpiTargets(targets)
        }
      }

      // Secondary data (non-blocking, parallel)
      setAiInsightLoading(true)
      Promise.all([
        fetch(`/api/partnerships/${partnershipId}/hub-stats`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/hub-mood`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/hub-reflections`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/hub-observation-impact`).then(r => r.ok ? r.json() : null),
        fetch(`/api/partnerships/${partnershipId}/ai-insight`).then(r => r.ok ? r.json() : null),
        fetch(`/api/funding/dashboard`).then(r => r.ok ? r.json() : null),
      ]).then(([hub, mood, refs, obsImpact, insight, funding]) => {
        if (hub) setHubStats(hub)
        if (mood) setMoodData(mood)
        if (refs) setReflections(refs)
        if (obsImpact) setObservationImpact(obsImpact)
        if (insight?.insight) setAiInsight(insight.insight)
        if (funding?.pursuits) {
          const linked = funding.pursuits.filter((p: any) => p.partnership_id === partnershipId)
          setGrantPursuits(linked)
        }
        setAiInsightLoading(false)
      }).catch(() => setAiInsightLoading(false))
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
      showToast(err.message || 'Failed to add event. Please try again.', 'error')
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
      showToast('Failed to delete event. Please try again.', 'error')
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
      showToast('Failed to move event. Please try again.', 'error')
    }
  }

  function handleEditEvent(event: { id: string; event_title: string; event_date?: string; notes?: string }) {
    setEditingEventId(event.id)
    setEditingEventTitle(event.event_title)
  }

  async function handleSaveEventTitle() {
    if (!userEmail || !editingEventId || editingEventTitle === '') return
    const originalEvent = timelineEvents.find(e => e.id === editingEventId)
    if (!originalEvent || editingEventTitle === originalEvent.event_title) {
      setEditingEventId(null)
      return
    }
    setTimelineEvents(prev => prev.map(e => e.id === editingEventId ? { ...e, event_title: editingEventTitle } : e))
    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/timeline`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
      body: JSON.stringify({ event_id: editingEventId, event_title: editingEventTitle }),
    })
    if (!res.ok) {
      setTimelineEvents(prev => prev.map(e => e.id === editingEventId ? originalEvent : e))
      showToast('Failed to update event title', 'error')
    }
    setEditingEventId(null)
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

  // ─── Computed: Smart Actions ───────────────────────────────────────
  const smartActions = useMemo(() => {
    if (!partnership) return []
    const actions: { label: string; description: string; variant: 'urgent' | 'primary' | 'secondary'; onClick: () => void }[] = []

    // Context-aware login threshold
    const partnershipAge = partnership.contract_start
      ? Math.floor((Date.now() - new Date(partnership.contract_start).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    const loginThreshold = partnershipAge < 30 ? 7 : 14

    // Check last login
    const lastLogin = partnership.last_principal_login
    const daysSinceLogin = lastLogin
      ? Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
      : null

    if (daysSinceLogin !== null && daysSinceLogin > loginThreshold) {
      actions.push({
        label: 'Schedule check-in',
        description: `Principal hasn't logged in for ${daysSinceLogin} days.`,
        variant: 'urgent',
        onClick: () => {
          window.open('https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat', '_blank')
        },
      })
    }

    // Prep for call (only show when there's an upcoming meeting or > 3 days since last contact)
    const lastNoteTs = internalNotes.length > 0 ? new Date(internalNotes[0].created_at).getTime() : 0
    const lastMeetingTs = internalMeetings.length > 0 ? new Date(internalMeetings[0].meeting_date).getTime() : 0
    const lastContactTs = Math.max(lastNoteTs, lastMeetingTs)
    const daysSinceLastContact = lastContactTs > 0 ? Math.floor((Date.now() - lastContactTs) / (1000 * 60 * 60 * 24)) : 999
    const hasUpcomingMeeting = internalMeetings.some(m => new Date(m.meeting_date).getTime() > Date.now())
    if (hasUpcomingMeeting || daysSinceLastContact > 3) {
    actions.push({
      label: briefingLoading ? 'Loading...' : 'Prep for Next Call',
      description: 'Generate a briefing with engagement data and talking points.',
      variant: 'primary',
      onClick: async () => {
        setBriefingLoading(true)
        try {
          const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/briefing`)
          const data = await res.json()
          setBriefingData(data)
        } catch { showToast('Failed to generate briefing', 'error') }
        finally { setBriefingLoading(false) }
      },
    })
    }

    // Renewal warning action
    if (partnership.contract_end) {
      const daysUntilEnd = Math.floor((new Date(partnership.contract_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilEnd <= 60 && daysUntilEnd > 0) {
        actions.push({
          label: 'Start renewal conversation',
          description: `Contract expires in ${daysUntilEnd} days.`,
          variant: daysUntilEnd <= 30 ? 'urgent' : 'secondary',
          onClick: () => {
            setNewNoteType('strategy')
            setNewNoteContent(`Renewal discussion: contract expires ${new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. `)
            document.querySelector('textarea')?.focus()
          },
        })
      }
    }

    // Overdue action items
    const overdueCount = actionItems.filter(a => a.status !== 'completed' && a.due_date && new Date(a.due_date) < new Date()).length
    if (overdueCount > 0) {
      actions.push({
        label: `${overdueCount} overdue item${overdueCount > 1 ? 's' : ''}`,
        description: 'Review and update overdue action items.',
        variant: 'urgent',
        onClick: () => {
          // Scroll to action items
          document.getElementById('sidebar-action-items')?.scrollIntoView({ behavior: 'smooth' })
        },
      })
    }

    return actions.slice(0, 4)
  }, [partnership, actionItems, partnershipId, internalNotes, internalMeetings, briefingLoading])

  // ─── Computed: Unified Timeline ────────────────────────────────────
  const unifiedTimeline = useMemo(() => {
    type UnifiedEntry = {
      id: string
      type: 'note' | 'meeting' | 'system'
      date: string
      author: string
      content: string
      meta?: any
      dotColor: string
    }

    const entries: UnifiedEntry[] = []

    // Notes
    internalNotes.forEach(n => {
      entries.push({
        id: `note-${n.id}`,
        type: 'note',
        date: n.created_at,
        author: n.author,
        content: n.content,
        meta: { note_type: n.note_type, visible_to_partner: n.visible_to_partner, noteId: n.id },
        dotColor: n.note_type === 'concern' ? '#EF4444' : n.note_type === 'win' ? '#10B981' : n.note_type === 'strategy' ? '#8B5CF6' : n.note_type === 'follow_up' ? '#F59E0B' : '#3B82F6',
      })
    })

    // Meetings
    internalMeetings.forEach(m => {
      entries.push({
        id: `meeting-${m.id}`,
        type: 'meeting',
        date: m.meeting_date,
        author: m.logged_by,
        content: m.summary || `${m.meeting_type.replace('_', ' ')} meeting`,
        meta: { meeting_type: m.meeting_type, attendees: m.attendees, action_items: m.action_items },
        dotColor: '#10B981',
      })
    })

    // Completed action items as system entries
    actionItems.filter(a => a.status === 'completed' && a.completed_at).forEach(a => {
      entries.push({
        id: `action-${a.id}`,
        type: 'system',
        date: a.completed_at || a.updated_at || a.created_at,
        author: 'System',
        content: `Action item completed: ${a.title}`,
        meta: { category: a.category },
        dotColor: '#D4AF37',
      })
    })

    // Sort by date, newest first
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Filter
    if (timelineFilter === 'notes') return entries.filter(e => e.type === 'note')
    if (timelineFilter === 'meetings') return entries.filter(e => e.type === 'meeting')
    if (timelineFilter === 'actions') return entries.filter(e => e.type === 'system')
    return entries
  }, [internalNotes, internalMeetings, actionItems, timelineFilter])

  // ─── Computed: Health Metrics ──────────────────────────────────────
  const healthMetrics = useMemo(() => {
    if (!partnership) return []
    const metrics: { label: string; value: string; color: string }[] = []

    // Last login
    const lastLogin = partnership.last_principal_login
    if (lastLogin) {
      const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
      const color = days <= 3 ? '#10B981' : days <= 14 ? '#EAB308' : '#EF4444'
      metrics.push({ label: 'Last Login', value: `${days}d`, color })
    } else {
      metrics.push({ label: 'Last Login', value: 'Never', color: '#EF4444' })
    }

    // Items due
    const pendingItems = actionItems.filter(a => a.status !== 'completed').length
    metrics.push({ label: 'Items Due', value: String(pendingItems), color: pendingItems > 5 ? '#EF4444' : pendingItems > 2 ? '#EAB308' : '#10B981' })

    // Direct Pay
    const directPay = partnership.direct_pay_amount || partnership.contract_value || 0
    metrics.push({ label: 'Direct Pay', value: directPay > 0 ? `$${Number(directPay).toLocaleString()}` : '$0', color: '#3B82F6' })

    // Grant
    const grantTotal = grantPursuits.reduce((s, g) => s + (g.total_awarded || 0), 0)
    metrics.push({ label: 'Grant', value: grantTotal > 0 ? `$${grantTotal.toLocaleString()}` : '$0', color: '#8B5CF6' })

    // Provisioned
    const enrolled = partnership.staff_enrolled || 0
    const totalStaff = hubStats?.member_count || partnership.total_staff || 0
    metrics.push({ label: 'Provisioned', value: totalStaff > 0 ? `${enrolled}/${totalStaff}` : 'N/A', color: totalStaff === 0 ? '#9CA3AF' : enrolled >= totalStaff ? '#10B981' : '#EAB308' })

    // Hub Login %
    const loginPct = hubStats?.hub_login_pct ?? partnership.hub_login_pct
    if (loginPct !== null && loginPct !== undefined) {
      const lColor = loginPct >= 60 ? '#10B981' : loginPct >= 30 ? '#EAB308' : '#EF4444'
      metrics.push({ label: 'Hub Login', value: `${loginPct}%`, color: lColor })
    }

    // Contract renewal countdown
    if (partnership.contract_end) {
      const daysUntilEnd = Math.floor((new Date(partnership.contract_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilEnd <= 90) {
        const rColor = daysUntilEnd <= 30 ? '#EF4444' : daysUntilEnd <= 60 ? '#EAB308' : '#3B82F6'
        metrics.push({ label: 'Renewal', value: daysUntilEnd <= 0 ? 'Expired' : `${daysUntilEnd}d`, color: rColor })
      }
    }

    // Last TDI contact
    const lastNoteDate = internalNotes.length > 0 ? new Date(internalNotes[0].created_at).getTime() : 0
    const lastMeetingDate = internalMeetings.length > 0 ? new Date(internalMeetings[0].meeting_date).getTime() : 0
    const lastContactMs = Math.max(lastNoteDate, lastMeetingDate)
    if (lastContactMs > 0) {
      const daysSinceContact = Math.floor((Date.now() - lastContactMs) / (1000 * 60 * 60 * 24))
      const cColor = daysSinceContact <= 7 ? '#10B981' : daysSinceContact <= 14 ? '#EAB308' : '#EF4444'
      metrics.push({ label: 'Last Contact', value: `${daysSinceContact}d`, color: cColor })
    }

    return metrics
  }, [partnership, actionItems, grantPursuits, hubStats, internalNotes, internalMeetings])

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
  const location = organization?.address_city && organization?.address_state
    ? `${organization.address_city}, ${organization.address_state}`
    : partnership.address || ''





  return (
    <ErrorBoundary>
    <>
      <div className="min-h-screen" style={{ background: '#F3F4F6' }} role="main">
      {/* Toast notifications */}
      {(submitSuccess || submitError) && (
        <div
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all"
          style={{ background: submitSuccess ? '#16A34A' : '#DC2626' }}
          aria-live="polite"
        >
          {submitSuccess || submitError}
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-5 py-5">
        {/* Breadcrumb */}
        <Link
          href="/tdi-admin/leadership"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Leadership Dashboard
        </Link>

        {/* ═════════════════════════════════════════════════════════════
            HEADER CARD (dark)
            ═════════════════════════════════════════════════════════════ */}
        <div style={{ background: '#1e2749' }} className="rounded-2xl p-7 mb-4">
          {/* Top row: name + phase + buttons */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}
              >
                {schoolName}
              </h1>
              <p className="text-sm text-gray-400">
                {location && <>{location} &middot; </>}
                {partnership.contract_start && (
                  <>
                    {new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {partnership.contract_end && (
                      <> to {new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Phase badge */}
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: PHASE_COLORS[phase]?.bg || '#F3F4F6',
                  color: PHASE_COLORS[phase]?.text || '#374151',
                }}
              >
                {phase}
              </span>
              {/* Client Dashboard link */}
              <a
                href={`/partners/${partnership.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
              >
                Client Dashboard
                <ExternalLink size={12} />
              </a>
              {/* Edit toggle */}
              <button
                onClick={() => setEditMode(!editMode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: editMode ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                  color: editMode ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
                }}
              >
                <Edit3 size={12} />
                {editMode ? 'Editing' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Health metrics chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {healthMetrics.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
                <span className="text-[10px] font-medium text-gray-400">{m.label}</span>
                <span className="text-xs font-bold text-white">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-violet-50 rounded-xl border border-violet-200">
            <Edit3 size={12} style={{ color: '#8B5CF6' }} />
            <span className="text-xs text-violet-700 font-semibold">Edit Mode:</span>
            <span className="text-xs text-violet-600">Click fields to modify. Changes save immediately and update what the client sees.</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            SMART ACTIONS BAR
            ═════════════════════════════════════════════════════════════ */}
        {smartActions.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {smartActions.map((action, i) => {
              const variantStyles = {
                urgent: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B' },
                primary: { bg: '#1e2749', border: '#1e2749', text: '#FFFFFF' },
                secondary: { bg: '#FFFFFF', border: '#E5E7EB', text: '#374151' },
              }
              const s = variantStyles[action.variant]
              return (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
                >
                  {action.variant === 'urgent' && <AlertTriangle size={14} />}
                  {action.variant === 'primary' && <Briefcase size={14} />}
                  <div className="text-left">
                    <div className="font-semibold text-xs">{action.label}</div>
                    <div className="text-[10px] opacity-70">{action.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TWO COLUMN LAYOUT
            ═════════════════════════════════════════════════════════════ */}
        <div className="grid gap-4 lg:grid-cols-[1fr_340px] grid-cols-1">

          {/* ═══════════════════════════════════════════════════════════
              MAIN COLUMN: UNIFIED TIMELINE
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Filter tabs */}
              <div className="flex items-center border-b border-gray-100 px-5 pt-4 pb-0" role="tablist" aria-label="Timeline filters">
                {(['all', 'notes', 'meetings', 'actions'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTimelineFilter(f)}
                    className="px-4 py-2.5 text-xs font-semibold capitalize transition-all border-b-2"
                    style={{
                      borderColor: timelineFilter === f ? '#1e2749' : 'transparent',
                      color: timelineFilter === f ? '#1e2749' : '#9CA3AF',
                    }}
                    role="tab"
                    aria-selected={timelineFilter === f}
                    aria-label={`Show ${f} entries`}
                  >
                    {f}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setShowMeetingForm(!showMeetingForm)}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    + Log meeting
                  </button>
                </div>
              </div>

              {/* Note input area */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1e2749' }}>
                    {(userEmail || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add a note about this partnership..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={newNoteType}
                        onChange={(e) => setNewNoteType(e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="general">General</option>
                        <option value="strategy">Strategy</option>
                        <option value="concern">Concern</option>
                        <option value="win">Win</option>
                        <option value="follow_up">Follow up</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (!newNoteContent.trim()) return
                          setAddingNote(true)
                          try {
                            const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/notes`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ content: newNoteContent, noteType: newNoteType }),
                            })
                            const data = await res.json()
                            if (data.success && data.note) {
                              setInternalNotes(prev => [data.note, ...prev])
                              setNewNoteContent('')
                            }
                          } catch { showToast('Failed to save note', 'error') } finally { setAddingNote(false) }
                        }}
                        disabled={!newNoteContent.trim() || addingNote}
                        className="ml-auto px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: '#1e2749' }}
                      >
                        {addingNote ? 'Saving...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting form (inline, toggleable) */}
              {showMeetingForm && (
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-700">Log a meeting</h4>
                    <button onClick={() => setShowMeetingForm(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-gray-500 font-medium">Date</label>
                      <input type="datetime-local" value={newMeeting.date} onChange={e => setNewMeeting(m => ({ ...m, date: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-medium">Type</label>
                      <select value={newMeeting.type} onChange={e => setNewMeeting(m => ({ ...m, type: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="check_in">Check-in</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="observation_debrief">Observation debrief</option>
                        <option value="renewal">Renewal conversation</option>
                        <option value="strategy">Strategy session</option>
                        <option value="escalation">Escalation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 font-medium">Attendees</label>
                    <input type="text" value={newMeeting.attendees} onChange={e => setNewMeeting(m => ({ ...m, attendees: e.target.value }))}
                      placeholder="Names of attendees"
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 font-medium">Summary</label>
                    <textarea value={newMeeting.summary} onChange={e => setNewMeeting(m => ({ ...m, summary: e.target.value }))}
                      placeholder="What was discussed?"
                      rows={2}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
                  </div>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 font-medium">Action items</label>
                    <textarea value={newMeeting.actionItems} onChange={e => setNewMeeting(m => ({ ...m, actionItems: e.target.value }))}
                      placeholder="What needs to happen next?"
                      rows={2}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
                  </div>
                  <button
                    onClick={async () => {
                      if (!newMeeting.date) return
                      setAddingMeeting(true)
                      try {
                        const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/meetings`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            meetingDate: newMeeting.date,
                            meetingType: newMeeting.type,
                            attendees: newMeeting.attendees || null,
                            summary: newMeeting.summary || null,
                            actionItems: newMeeting.actionItems || null,
                          }),
                        })
                        const data = await res.json()
                        if (data.success && data.meeting) {
                          setInternalMeetings(prev => [data.meeting, ...prev])
                          setNewMeeting({ date: '', type: 'check_in', attendees: '', summary: '', actionItems: '' })
                          setShowMeetingForm(false)
                        }
                      } catch { showToast('Failed to log meeting', 'error') } finally { setAddingMeeting(false) }
                    }}
                    disabled={!newMeeting.date || addingMeeting}
                    className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ background: '#1e2749' }}
                  >
                    {addingMeeting ? 'Saving...' : 'Log meeting'}
                  </button>
                </div>
              )}

              {/* Open flags. Their own stream, above the human timeline.
                  These used to be notes, and the cron wrote three new ones per
                  school every morning: St. Peter Chanel had 96 rows that were
                  really three concerns restated 32 times. One row per issue
                  now, so the age of a problem is visible instead of smeared
                  across dozens of duplicates. */}
              {openFlags.length > 0 && (
                <div className="mb-4 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Open flags</span>
                    <span className="text-[10px] font-semibold text-gray-400">{openFlags.length} open</span>
                  </div>
                  {openFlags.map((f) => {
                    const days = Math.floor((Date.now() - new Date(f.first_raised_at).getTime()) / 86400000)
                    const urgent = f.severity === 'urgent'
                    return (
                      <div key={f.id} className="flex items-start gap-2.5 px-3.5 py-2.5 border-b border-gray-50 last:border-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: urgent ? '#B03325' : '#9A6608' }}
                        />
                        <div className="min-w-0">
                          <p className="text-[12.5px] text-gray-700">{f.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            first raised {new Date(f.first_raised_at).toLocaleDateString()}
                            {days > 0 ? `, open ${days} day${days === 1 ? '' : 's'}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Timeline entries */}
              <div className="px-5 py-3" role="feed" aria-label="Partnership timeline">
                {unifiedTimeline.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No timeline entries yet. Add a note or log a meeting above.</p>
                )}
                {unifiedTimeline.slice(0, timelineLimit).map((entry) => (
                  <div key={entry.id} className="flex gap-3 py-3 group" style={{ borderBottom: '1px solid #F9FAFB' }}>
                    {/* Colored dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: entry.dotColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        {entry.type === 'note' && entry.meta?.note_type && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${NOTE_TYPE_COLORS[entry.meta.note_type] || NOTE_TYPE_COLORS.general}`}>
                            {entry.meta.note_type}
                          </span>
                        )}
                        {entry.type === 'meeting' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {MEETING_TYPE_LABELS[entry.meta?.meeting_type] || 'Meeting'}
                          </span>
                        )}
                        {entry.type === 'system' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            system
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">{entry.author}</span>
                        <span className="text-[10px] text-gray-300">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {entry.type === 'note' && entry.meta?.visible_to_partner && (
                          <Eye size={11} style={{ color: '#3B82F6' }} />
                        )}
                        {/* Edit/delete for notes */}
                        {entry.type === 'note' && (
                          <span className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingNoteId(entry.meta.noteId)
                                setEditingNoteContent(entry.content)
                              }}
                              className="text-[10px] text-gray-400 hover:text-blue-600 px-1"
                            >edit</button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this note?')) return
                                try {
                                  await fetch(`/api/tdi-admin/leadership/${partnershipId}/notes`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: entry.meta.noteId }),
                                  })
                                  setInternalNotes(prev => prev.filter(n => n.id !== entry.meta.noteId))
                                } catch {}
                              }}
                              className="text-[10px] text-gray-400 hover:text-red-600 px-1"
                            >delete</button>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      {entry.type === 'note' && editingNoteId === entry.meta?.noteId ? (
                        <textarea
                          autoFocus
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          onBlur={async () => {
                            if (editingNoteContent.trim() && editingNoteContent !== entry.content) {
                              try {
                                await fetch(`/api/tdi-admin/leadership/${partnershipId}/notes`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: entry.meta.noteId, content: editingNoteContent }),
                                })
                                setInternalNotes(prev => prev.map(n => n.id === entry.meta.noteId ? { ...n, content: editingNoteContent } : n))
                              } catch { showToast('Failed to update note', 'error') }
                            }
                            setEditingNoteId(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur() }
                            if (e.key === 'Escape') { setEditingNoteId(null) }
                          }}
                          rows={3}
                          className="w-full text-sm text-gray-700 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                      )}

                      {/* Meeting details */}
                      {entry.type === 'meeting' && entry.meta?.attendees && (
                        <p className="text-[10px] text-gray-400 mt-1">Attendees: {entry.meta.attendees}</p>
                      )}
                      {entry.type === 'meeting' && entry.meta?.action_items && (
                        <div className="mt-1.5 pl-3 border-l-2 border-gray-200">
                          <p className="text-[10px] font-medium text-gray-500 mb-0.5">Follow-up:</p>
                          <p className="text-xs text-gray-600 whitespace-pre-wrap">{entry.meta.action_items}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {unifiedTimeline.length > timelineLimit && (
                  <button
                    onClick={() => setTimelineLimit(prev => prev + 20)}
                    className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
                  >
                    Show more ({unifiedTimeline.length - timelineLimit} remaining)
                  </button>
                )}
              </div>
            </div>

            {/* AI Insight below timeline */}
            {(aiInsight || aiInsightLoading) && (
              <div
                className="rounded-2xl p-5 mt-4"
                style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #263554 100%)', borderLeft: '3px solid #E8B84B' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={aiInsightLoading ? 'animate-pulse' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B84B', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#E8B84B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    AI Partnership Insight
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 }}>
                  {aiInsightLoading ? 'Generating insight for this partnership...' : aiInsight}
                </p>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SIDEBAR (340px)
              ═══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-3">

            {/* ─── 1. Action Items ───────────────────────────────────── */}
            <ActionItemsSidebar
              partnershipId={partnershipId}
              actionItems={actionItems}
              onActionItemsChange={setActionItems}
              showToast={showToast}
            />

            {/* ─── 2. Contract Card ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: '#1e2749' }} />
                <h3 className="text-sm font-bold text-gray-900">Contract</h3>
              </div>

              {/* Deliverables summary */}
              <DeliverablesList partnershipId={partnershipId} userEmail={userEmail} />

              {/* Money position, read only. Billing is the only place that writes. */}
              <PositionStrip partnershipId={partnershipId} userEmail={userEmail || ''} />

              {/* Grant Pursuits */}
              {grantPursuits.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6' }} />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Grants</span>
                  </div>
                  {grantPursuits.map(pursuit => {
                    const phaseLabels: Record<string, string> = {
                      intake: 'Intake', researching: 'Researching', strategy: 'Strategy', writing: 'Writing',
                      in_review: 'In review', delivered: 'Delivered', submitted: 'Submitted',
                      awaiting_decision: 'Awaiting decision', awarded: 'Awarded', denied: 'Denied', on_hold: 'On hold',
                    }
                    return (
                      <div key={pursuit.id} className="flex items-center justify-between py-1.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{pursuit.pursuit_name}</p>
                          <p className="text-[10px] text-gray-400">${(pursuit.total_amount || 0).toLocaleString()}</p>
                        </div>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {phaseLabels[pursuit.current_phase] || pursuit.current_phase}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Service delivery (edit mode) */}
              {editMode && ((partnership.observation_days_total || 0) > 0 ||
                (partnership.virtual_sessions_total || 0) > 0 ||
                (partnership.executive_sessions_total || 0) > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mark Session Complete</p>
                  <div className="space-y-2">
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
                          love_notes_count: (p.love_notes_count || 0) + (result.sessionRecord?.love_notes_count || 0),
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
              )}
            </div>

            {/* ─── 3. Sales Coach Card ───────────────────────────────── */}
            {/* Observation Impact summary */}
            {observationImpact.has_data && observationImpact.observations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} style={{ color: '#1e2749' }} />
                  <h3 className="text-sm font-bold text-gray-900">Observation Impact</h3>
                </div>
                <div className="space-y-2">
                  {observationImpact.observations.slice(0, 3).map((obs) => (
                    <div key={obs.observation_id} className="rounded-lg p-2.5" style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-800">{obs.observation_title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(obs.observation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-bold" style={{ color: obs.engagement_change_pct === null ? '#9CA3AF' : obs.engagement_change_pct > 0 ? '#16A34A' : obs.engagement_change_pct < 0 ? '#DC2626' : '#6B7280' }}>
                            {obs.engagement_change_pct === null ? '-' : obs.engagement_change_pct > 0 ? `+${obs.engagement_change_pct}%` : `${obs.engagement_change_pct}%`}
                          </div>
                          <div className="text-[9px] text-gray-400">Engagement</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: obs.mood_change === null ? '#9CA3AF' : obs.mood_change > 0 ? '#16A34A' : obs.mood_change < 0 ? '#DC2626' : '#6B7280' }}>
                            {obs.mood_change === null ? '-' : obs.mood_change > 0 ? `+${obs.mood_change}` : `${obs.mood_change}`}
                          </div>
                          <div className="text-[9px] text-gray-400">Mood</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: obs.quick_wins_after > obs.quick_wins_before ? '#16A34A' : '#6B7280' }}>
                            {obs.quick_wins_after > obs.quick_wins_before ? `+${obs.quick_wins_after - obs.quick_wins_before}` : obs.quick_wins_after - obs.quick_wins_before}
                          </div>
                          <div className="text-[9px] text-gray-400">Quick Wins</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 4. Partnership KPIs ───────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} style={{ color: '#1e2749' }} />
                  <h3 className="text-sm font-bold text-gray-900">KPIs</h3>
                  {activeKpis.length > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">{activeKpis.length}</span>
                  )}
                </div>
                <button
                  onClick={() => setShowKpiSelector(!showKpiSelector)}
                  className="text-[10px] font-medium text-blue-600 hover:underline"
                >
                  {showKpiSelector ? 'Close' : activeKpis.length > 0 ? 'Edit' : 'Select'}
                </button>
              </div>

              {/* Active KPIs display */}
              {activeKpis.length > 0 && (
                <div className="space-y-2 mb-2">
                  {activeKpis.map(kpi => {
                    const pct = kpi.target_value > 0 ? Math.min(Math.round((kpi.current_value / kpi.target_value) * 100), 100) : 0
                    const barColor = pct >= 70 ? '#10B981' : pct >= 40 ? '#EAB308' : '#EF4444'
                    return (
                      <div key={kpi.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-900 truncate flex-1">{kpi.kpi_label}</p>
                          <div className="flex items-baseline gap-1 flex-shrink-0 ml-2">
                            {editingKpiId === kpi.id ? (
                              <input
                                autoFocus
                                type="number"
                                value={editingKpiValue}
                                onChange={(e) => setEditingKpiValue(e.target.value)}
                                onBlur={async () => {
                                  const num = parseFloat(editingKpiValue)
                                  if (!isNaN(num) && num !== kpi.current_value) {
                                    try {
                                      await fetch(`/api/tdi-admin/leadership/${partnershipId}/kpis`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ kpiId: kpi.id, currentValue: num }),
                                      })
                                      setActiveKpis(prev => prev.map(k => k.id === kpi.id ? { ...k, current_value: num } : k))
                                    } catch { showToast('Failed to update KPI value', 'error') }
                                  }
                                  setEditingKpiId(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { (e.target as HTMLInputElement).blur() }
                                  if (e.key === 'Escape') { setEditingKpiId(null) }
                                }}
                                className="w-16 text-sm font-bold text-[#1e2749] border border-blue-300 rounded px-1.5 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            ) : (
                              <button
                                onClick={() => { setEditingKpiId(kpi.id); setEditingKpiValue(String(kpi.current_value)) }}
                                className="text-sm font-bold text-[#1e2749] hover:text-blue-600 cursor-pointer"
                              >{kpi.current_value}{kpi.target_unit}</button>
                            )}
                            <span className="text-[10px] text-gray-400">/</span>
                            <span className="text-xs text-gray-500">{kpi.target_value}{kpi.target_unit}</span>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeKpis.length === 0 && !showKpiSelector && (
                <p className="text-[10px] text-gray-400 text-center py-2">No KPIs set yet.</p>
              )}

              {/* KPI selector (expandable) */}
              {showKpiSelector && kpiMenu.length > 0 && (
                <div className="mt-2 border-t border-gray-100 pt-3">
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {['implementation', 'wellness', 'baseline'].map(category => {
                      const catKpis = kpiMenu.filter(k => k.category === category)
                      if (catKpis.length === 0) return null
                      const catLabels: Record<string, string> = { implementation: 'Implementation', wellness: 'Wellness', baseline: 'Baseline' }
                      return (
                        <div key={category}>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">{catLabels[category]}</p>
                          {catKpis.map(kpi => {
                            const isSelected = selectedKpiKeys.has(kpi.key)
                            return (
                              <div key={kpi.key} className={`p-2 rounded-lg border transition-all cursor-pointer mb-1 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                onClick={() => {
                                  const next = new Set(selectedKpiKeys)
                                  if (next.has(kpi.key)) { next.delete(kpi.key) } else if (next.size < 5) { next.add(kpi.key) }
                                  setSelectedKpiKeys(next)
                                  if (!kpiTargets[kpi.key]) setKpiTargets(prev => ({ ...prev, [kpi.key]: kpi.suggestedTarget }))
                                }}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                      {isSelected && <span className="text-white text-[8px]">&#10003;</span>}
                                    </div>
                                    <p className="text-xs font-medium text-gray-900">{kpi.label}</p>
                                  </div>
                                  {isSelected && (
                                    <input
                                      type="number"
                                      value={kpiTargets[kpi.key] || ''}
                                      onChange={(e) => { e.stopPropagation(); setKpiTargets(prev => ({ ...prev, [kpi.key]: parseFloat(e.target.value) || 0 })) }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-16 text-right text-xs font-bold border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      placeholder="Target"
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={async () => {
                        if (selectedKpiKeys.size === 0) return
                        setSavingKpis(true)
                        try {
                          const selected = Array.from(selectedKpiKeys).map(key => ({ key, target: kpiTargets[key] || 0 }))
                          const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/kpis`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ selectedKpis: selected }),
                          })
                          const data = await res.json()
                          if (data.success) {
                            const reload = await fetch(`/api/tdi-admin/leadership/${partnershipId}/kpis`)
                            const reloadData = await reload.json()
                            if (reloadData.kpis) setActiveKpis(reloadData.kpis)
                            setShowKpiSelector(false)
                          }
                        } catch { showToast('Failed to save KPIs', 'error') } finally { setSavingKpis(false) }
                      }}
                      disabled={selectedKpiKeys.size === 0 || savingKpis}
                      className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg disabled:opacity-50"
                      style={{ background: '#1e2749' }}
                    >
                      {savingKpis ? 'Saving...' : `Save ${selectedKpiKeys.size} KPI${selectedKpiKeys.size !== 1 ? 's' : ''}`}
                    </button>
                    <span className="text-[10px] text-gray-400">{selectedKpiKeys.size}/5</span>
                  </div>
                </div>
              )}
            </div>

            {/* ─── 5. Reports Card ───────────────────────────────────── */}
            <div id="leadership-reports" className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} style={{ color: '#1e2749' }} />
                <h3 className="text-sm font-bold text-gray-900">Reports</h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { type: 'roster', label: 'Staff Roster', icon: Users },
                  { type: 'engagement', label: 'Hub Engagement', icon: BarChart3 },
                  { type: 'board_summary', label: 'Board Summary', icon: FileText },
                  // These three were built in the reports route and never had a
                  // button, so nobody could reach them. Courses and wellness
                  // also had no partnership filter until now: the course report
                  // pulled every enrolment in the Hub, so a report for one
                  // school listed other schools' educators.
                  { type: 'courses', label: 'Course Progress', icon: BarChart3 },
                  { type: 'kpi_standings', label: 'Goal Standings', icon: Target },
                  { type: 'wellness', label: 'Team Wellness', icon: Users },
                  { type: 'full_export', label: 'Full Export', icon: FileText },
                ].map(report => (
                  <button
                    key={report.type}
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/reports?type=${report.type}`)
                        const data = await res.json()
                        if (!data.hasData && data.emptyMessage) {
                          const action = data.emptyAction || ''
                          const doEmail = data.emailSubject && confirm(`${data.emptyMessage}\n\n${action}\n\nWould you like to send an email requesting this data?`)
                          if (doEmail && data.emailSubject) {
                            window.open(`mailto:${partnership?.contact_email || ''}?subject=${encodeURIComponent(data.emailSubject)}&body=${encodeURIComponent(data.emailBody || '')}`, '_blank')
                          }
                          return
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `TDI-${report.type}-${new Date().toISOString().split('T')[0]}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      } catch {
                        alert('Failed to generate report')
                      }
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left"
                  >
                    <report.icon size={13} style={{ color: '#6B7280' }} />
                    <span className="text-xs font-medium text-gray-800">{report.label}</span>
                  </button>
                ))}
              </div>

              {/* One panel at a time, as tabs rather than a stack of toggles.
                  These were six independent booleans, so any combination could
                  be open at once and the page had no sense of where you were.
                  Same panels, one place. */}
              <div className="mt-3 flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: '#F1F3F8' }}>
                {([
                  ['people', 'Your people'],
                  ['observations', 'Observations'],
                  ['reports', 'Reports'],
                  ['team', 'Roster'],
                  ['client', 'Client view'],
                  ['record', 'Record'],
                ] as const).map(([key, label]) => {
                  const active =
                    (key === 'people' && show90DaysPanel) ||
                    (key === 'observations' && showObservationPanel) ||
                    (key === 'team' && showTeamPanel) ||
                    (key === 'client' && showOverviewPanel) ||
                    (key === 'record' && showSchoolInfo);
                  return (
                    <button
                      key={key}
                      onClick={() => openPanel(key)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                      style={{
                        background: active ? '#FFFFFF' : 'transparent',
                        color: active ? '#2B3A67' : '#6B7280',
                        boxShadow: active ? '0 1px 3px rgba(27,42,74,.08)' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Hub provisioning */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={async () => {
                    setProvisioningRoster(true)
                    setProvisionResult('')
                    try {
                      const res = await fetch('/api/admin/provision-roster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ partnershipId }),
                      })
                      const data = await res.json()
                      setProvisionResult(data.message || data.error || 'Done')
                    } catch { setProvisionResult('Failed') }
                    finally { setProvisioningRoster(false) }
                  }}
                  disabled={provisioningRoster}
                  className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: '#E8B84B', color: '#1e2749' }}
                >
                  {provisioningRoster ? 'Provisioning...' : 'Provision Hub Accounts'}
                </button>
                {provisionResult && (
                  <p className="text-[10px] text-gray-600 mt-1.5">{provisionResult}</p>
                )}
              </div>
            </div>

            {/* ─── 6. Documents Card ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: '#1e2749' }} />
                <h3 className="text-sm font-bold text-gray-900">Documents</h3>
              </div>

              <FileUploadZone
                  partnershipId={partnershipId}
                  userEmail={userEmail}
                  files={uploadedFiles}
                  onFilesChange={async () => {
                    const fRes = await fetch(`/api/tdi-admin/leadership/${partnershipId}/upload`, {
                      headers: { 'x-user-email': userEmail },
                    })
                    if (fRes.ok) {
                      const fData = await fRes.json()
                      setUploadedFiles(fData.files || [])
                    }
                  }}
                  onExtract={(fileId, filename) => setExtractModal({ open: true, fileId, filename })}
                />
              </div>
            </div>

            {/* Teacher Voice (sidebar) */}
            {reflections.has_data && reflections.reflections.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={14} style={{ color: '#1e2749' }} />
                  <h3 className="text-sm font-bold text-gray-900">Teacher Voice</h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                    {reflections.reflections.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {reflections.reflections.slice(0, 3).map((r, i) => (
                    <div key={i} className="rounded-lg p-2.5" style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}>
                      <p className="text-xs text-gray-700 leading-relaxed italic">&quot;{r.text}&quot;</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">{r.quick_win_title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            EXPANDABLE PANELS (below two-column grid)
            ═════════════════════════════════════════════════════════════ */}

        {/* Billing Panel */}
        

        {/* Team Panel */}
        {showTeamPanel && (
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Staff Roster & Team</h2>
                <button onClick={() => setShowTeamPanel(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {/* TDI Team */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/rae-headshot.webp"
                      alt="Rae Hughart"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1e2749]">Rae Hughart</p>
                    <p className="text-xs text-gray-500">Founder & CEO</p>
                    <div className="flex items-center gap-3 mt-2">
                      <a href="mailto:Rae@TeachersDeserveIt.com" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Mail size={11} /> Email
                      </a>
                      <a href="tel:+18477215503" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Phone size={11} /> Call
                      </a>
                      <a
                        href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Calendar size={11} /> Schedule
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <StaffRosterWithPhotos
                partnershipId={partnershipId}
                userEmail={userEmail}
                editMode={editMode}
              />

              {editMode && (
                <StaffPhotoUpload
                  partnershipId={partnershipId}
                  userEmail={userEmail}
                />
              )}

              <FindStaffSearch
                partnershipId={partnershipId}
                userEmail={userEmail}
              />
            </div>
          </div>
        )}

        {/* 90 Days Panel */}
        {show90DaysPanel && (
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">First 90 Days</h2>
                <button onClick={() => setShow90DaysPanel(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {/* Onboarding status moved to the Leadership home, where the
                  matrix is the single definition. The two panels that used to
                  sit here could not return a correct answer: one queried Hub
                  tables through the portal client and joined an empty table,
                  the other selected a column that does not exist. */}

              {/* What this school's educators are actually doing in the Hub.
                  Replaces three widgets that each fetched a slice through a
                  route that asked the wrong database, so all three rendered
                  empty. This is one route and it carries the depth: courses
                  reached for, questions asked, recognitions earned, and who
                  has never opened it. */}
              <YourPeoplePanel partnershipId={partnershipId} userEmail={userEmail} />

              <ObservationImpactScorecard observations={observationImpact.observations} />
            </div>
          </div>
        )}

        {/* Overview Panel (Client View) */}
        {showOverviewPanel && (
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Overview (Client View)</h2>
                <button onClick={() => setShowOverviewPanel(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {editMode && (
                <div className="bg-violet-50 rounded-xl p-4 mb-4 border border-violet-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-sm font-semibold text-gray-900">Edit Momentum</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Status</label>
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
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Detail Text</label>
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

              <MomentumBar
                status={partnership.momentum_status}
                detail={partnership.momentum_detail}
                defaults={defaults}
              />

              <TDISuggestions suggestions={suggestions} isAdminView={true} />

              <InvestmentNumbers
                costPerEducator={partnership.cost_per_educator}
                hubLoginPct={partnership.hub_login_pct}
                loveNotesCount={partnership.love_notes_count}
                highEngagementPct={partnership.high_engagement_pct}
                perEducatorNote={partnership.per_educator_value_note}
                defaults={defaults}
                hubStats={hubStats}
              />

              <LoveNotesCallout
                loveNotesCount={partnership.love_notes_count}
                schoolName={schoolName}
                observationDays={observationsDone || 1}
                defaults={defaults}
              />

              <LeadingIndicators
                teacherStress={partnership.teacher_stress_score}
                strategyImplementation={partnership.strategy_implementation_pct}
                retentionIntent={partnership.retention_intent_score}
                defaults={defaults}
                hubStats={hubStats}
              />

              {/* Partnership Goal */}
              <div className="bg-gray-50 rounded-xl p-5 mt-4" style={{ borderColor: editMode ? '#8B5CF6' : '#F3F4F6' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">Partnership Goal</h2>
                  {editMode && editingField !== 'partnership_goal' && (
                    <button onClick={() => setEditingField('partnership_goal')} className="text-xs font-semibold text-violet-600 hover:text-violet-800">Edit</button>
                  )}
                </div>
                {editMode && editingField === 'partnership_goal' ? (
                  <div>
                    <textarea
                      value={localGoal}
                      onChange={(e) => setLocalGoal(e.target.value)}
                      rows={3}
                      className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => { await handleFieldUpdate('partnership_goal', localGoal); setEditingField(null) }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: '#8B5CF6' }}
                      >Save Goal</button>
                      <button
                        onClick={() => { setLocalGoal(partnership?.partnership_goal || ''); setEditingField(null) }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {partnership.partnership_goal || <span className="text-gray-400 italic text-sm">No goal set yet.</span>}
                  </p>
                )}
              </div>

              {/* Year 2 Planning (edit mode) */}
              {editMode && (
                <div className="bg-violet-50 rounded-xl p-5 mt-4 border border-violet-200">
                  <h3 className="text-sm font-semibold text-violet-900 mb-2">Year 2 Planning Notes (admin only)</h3>
                  <InlineEditField
                    partnershipId={partnershipId}
                    field="year2_planning_notes"
                    value={partnership.year2_planning_notes}
                    type="textarea"
                    onSaved={(v) => setPartnership((p: any) => ({ ...p, year2_planning_notes: v }))}
                  />
                </div>
              )}

              {/* Partnership Timeline */}
              <div className="mt-4">
                <PartnershipTimeline
                  events={timelineEvents}
                  isAdminView={editMode}
                  onAddEvent={() => setAddEventOpen(true)}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onMoveEvent={handleMoveEvent}
                />
              </div>
            </div>
          </div>
        )}

        {/* School Info Panel */}
        {showSchoolInfo && (
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">School Information</h2>
                <button onClick={() => setShowSchoolInfo(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">School / District Name</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="name" value={organization?.name} type="text" onSaved={(v) => setOrganization((o: any) => ({ ...o, name: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{organization?.name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Primary Contact</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="primary_contact_name" value={partnership?.primary_contact_name} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, primary_contact_name: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.primary_contact_name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Contact Email</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="primary_contact_email" value={partnership?.primary_contact_email} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, primary_contact_email: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.primary_contact_email || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Phone</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="phone" value={partnership?.phone} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, phone: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.phone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Contract Phase</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="contract_phase" value={partnership?.contract_phase} type="select" options={['IGNITE', 'ACCELERATE', 'SUSTAIN']} onSaved={(v) => setPartnership((p: any) => ({ ...p, contract_phase: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.contract_phase || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Contract Start</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="contract_start" value={partnership?.contract_start} type="date" onSaved={(v) => setPartnership((p: any) => ({ ...p, contract_start: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.contract_start || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Contract End</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="contract_end" value={partnership?.contract_end} type="date" onSaved={(v) => setPartnership((p: any) => ({ ...p, contract_end: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.contract_end || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Dashboard URL</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="slug" value={partnership?.slug} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, slug: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.slug ? `/partners/${partnership.slug}` : 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Address</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="address" value={partnership?.address} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, address: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{partnership?.address || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">City</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="address_city" value={(organization as any)?.address_city} type="text" onSaved={(v) => setOrganization((o: any) => ({ ...o, address_city: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{(organization as any)?.address_city || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">State</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="address_state" value={(organization as any)?.address_state} type="text" onSaved={(v) => setOrganization((o: any) => ({ ...o, address_state: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">{(organization as any)?.address_state || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Website</label>
                  {editMode ? (
                    <InlineEditField partnershipId={partnershipId} field="website" value={partnership?.website} type="text" onSaved={(v) => setPartnership((p: any) => ({ ...p, website: v }))} />
                  ) : (
                    <p className="text-sm text-gray-700">
                      {partnership?.website ? (
                        <a href={partnership.website.startsWith('http') ? partnership.website : `https://${partnership.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{partnership.website}</a>
                      ) : '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Partnership Actions (edit mode only) */}
              {editMode && (
                <div className="mt-6 pt-4 border-t border-red-100">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Partnership Actions</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        const newStatus = partnership?.status === 'active' ? 'paused' : 'active';
                        const label = newStatus === 'paused' ? 'Pause' : 'Reactivate';
                        if (!confirm(`${label} this partnership?`)) return;
                        await handleFieldUpdate('status', newStatus);
                      }}
                      className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors"
                      style={{ borderColor: '#EAB308', color: '#92400E', background: '#FFFBEB' }}
                    >
                      {partnership?.status === 'active' ? 'Pause partnership' : 'Reactivate partnership'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to permanently delete this partnership? This cannot be undone.')) return;
                        if (!confirm('This will delete all action items, timeline events, notes, meetings, and KPIs. Type "delete" in the next prompt to confirm.')) return;
                        const typed = prompt('Type "delete" to confirm:');
                        if (typed !== 'delete') return;
                        try {
                          const res = await fetch(`/api/admin/partnerships/${partnershipId}/delete`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail || '' },
                          });
                          if (res.ok) {
                            window.location.href = '/tdi-admin/leadership';
                          }
                        } catch {}
                      }}
                      className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors"
                      style={{ borderColor: '#EF4444', color: '#991B1B', background: '#FEF2F2' }}
                    >
                      Delete partnership
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showObservationPanel && (
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Observations & Love Notes</h2>
                <button onClick={() => setShowObservationPanel(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              {/* Recording a session is what fills the school's own dashboard.
                  complete-session has existed for months with zero callers,
                  which is why teacher_quotes is empty for every partnership and
                  0 of 62 deliverables are marked delivered. There was no
                  button. This is the button. */}
              <div className="mb-5">
                <LogSessionPanel
                  partnershipId={partnershipId}
                  contracted={{
                    observation: partnership?.observation_days_total || 0,
                    virtual: partnership?.virtual_sessions_total || 0,
                    executive: partnership?.executive_sessions_total || 0,
                  }}
                  onLogged={() => window.location.reload()}
                />
              </div>

              <ObservationPanel partnershipId={partnershipId} showToast={showToast} />
            </div>
          </div>
        )}

      {/* ═════════════════════════════════════════════════════════════
          MODALS
          ═════════════════════════════════════════════════════════════ */}

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
                  placeholder="e.g. Virtual Session 4, Growth Group strategies"
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
      {/* Briefing Modal */}
      {briefingData && (
        <BriefingModal data={briefingData} schoolName={schoolName} onClose={() => setBriefingData(null)} />
      )}
    </div>
    </>
    </ErrorBoundary>
  )
}
