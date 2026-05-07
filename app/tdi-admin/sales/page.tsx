'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

type ViewMode = 'kanban' | 'list'

// Supabase sales_opportunities row shape
interface SalesOpportunity {
  id: string
  ghl_opportunity_id: string | null
  name: string
  type: 'new_business' | 'renewal' | 'upsell' | 'reactivation' | 'expansion' | 'pilot'
  stage: string
  value: number | null
  probability: number | null
  assigned_to_email: string | null
  source: string | null
  notes: string | null
  last_activity_at: string | null
  is_contact_only: boolean
  needs_invoice: boolean | null
  invoice_amount: number | null
  invoice_notes: string | null
  contract_year: string | null
  on_jims_call_sheet: boolean | null
  created_at: string
  updated_at: string
}

// UI Opportunity shape
interface Opportunity {
  id: string
  supabase_id: string
  ghl_id: string | null
  name: string
  stage: string
  stageName: string
  value: number | null
  type: string
  assignedTo: string | null
  isRenewal: boolean
  isContactOnly: boolean
  lastActivityAt: string | null
  probability: number
  source: string | null
  notes: string | null
  needs_invoice: boolean
  invoice_amount: number | null
  invoice_notes: string | null
  contract_year: string | null
  onJimsList: boolean
}

interface ActivityNote {
  id: string
  opportunity_id: string
  activity_type: string
  body: string
  activity_date: string
  created_at: string
}

// Stage display name map
const STAGE_DISPLAY: Record<string, string> = {
  unassigned: 'Unassigned',
  targeting: 'Targeting (0%)',
  engaged: 'Engaged (10%)',
  qualified: 'Qualified (30%)',
  likely_yes: 'Likely Yes (50%)',
  proposal_sent: 'Proposal Sent (70%)',
  signed: 'Signed (90%)',
  paid: 'Paid (100%)',
  lost: 'Lost',
}

// Stage order for kanban columns and dropdown
const STAGE_OPTIONS = [
  { id: 'unassigned', name: 'Unassigned' },
  { id: 'targeting', name: 'Targeting (0%)' },
  { id: 'engaged', name: 'Engaged (10%)' },
  { id: 'qualified', name: 'Qualified (30%)' },
  { id: 'likely_yes', name: 'Likely Yes (50%)' },
  { id: 'proposal_sent', name: 'Proposal Sent (70%)' },
  { id: 'signed', name: 'Signed (90%)' },
  { id: 'paid', name: 'Paid (100%)' },
  { id: 'lost', name: 'Lost' },
]

const STAGE_COLORS: Record<string, string> = {
  'unassigned': 'bg-gray-100 border-gray-200 text-gray-600',
  'targeting': 'bg-blue-100 border-blue-200 text-blue-700',
  'engaged': 'bg-indigo-100 border-indigo-200 text-indigo-700',
  'qualified': 'bg-violet-100 border-violet-200 text-violet-700',
  'likely_yes': 'bg-purple-100 border-purple-200 text-purple-700',
  'proposal_sent': 'bg-amber-100 border-amber-200 text-amber-700',
  'signed': 'bg-orange-100 border-orange-200 text-orange-700',
  'paid': 'bg-green-100 border-green-200 text-green-700',
  'lost': 'bg-red-100 border-red-200 text-red-700',
}

// Probability map for weighted value
const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 0, engaged: 10, qualified: 30,
  likely_yes: 50, proposal_sent: 70, signed: 90, paid: 100, lost: 0,
}

const DEAL_TYPES = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'new_business', label: 'New Business' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'pilot', label: 'Pilot' },
]

const STAGE_GROUPS: Record<string, { label: string; stages: string[]; color: string; textColor: string; description: string }> = {
  pipeline: {
    label: 'Pipeline',
    stages: ['targeting', 'engaged'],
    color: '#B4B2A9',
    textColor: '#2C2C2A',
    description: 'Top of funnel',
  },
  active: {
    label: 'Active Deals',
    stages: ['qualified', 'likely_yes'],
    color: '#FAC775',
    textColor: '#412402',
    description: 'Real conversations',
  },
  closing: {
    label: 'Closing',
    stages: ['proposal_sent', 'signed'],
    color: '#97C459',
    textColor: '#173404',
    description: 'Final stretch',
  },
}

function factoredRevenue(opp: Opportunity): number {
  const value = opp.value || 0
  return Math.round(value * opp.probability / 100)
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${n}`
}

function formatCurrencyFull(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function opportunitySubtitle(opp: Opportunity): string {
  const parts: string[] = []
  if (opp.needs_invoice) parts.push(`${opp.contract_year || ''} invoice owed`.trim())
  if (opp.notes) {
    const meetingMatch = opp.notes.match(/Meeting (?:LOCKED|locked|set)[^.]*/i)
    if (meetingMatch && parts.length < 2) {
      parts.push(meetingMatch[0].toLowerCase())
    }
  }
  if (opp.source && parts.length < 2) {
    parts.push(opp.source.toLowerCase())
  }
  return parts.slice(0, 3).join(' · ')
}

export default function SalesPage() {
  const supabase = getSupabase()
  const [view, setView] = useState<ViewMode>('list')
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [notes, setNotes] = useState<ActivityNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [activeNoteOpp, setActiveNoteOpp] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [hideUnassigned, setHideUnassigned] = useState(true)
  const [hideZeroValue, setHideZeroValue] = useState(true)
  const [hideContactOnly, setHideContactOnly] = useState(true)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [updatingOpportunity, setUpdatingOpportunity] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedStageGroup, setSelectedStageGroup] = useState<string | null>(null)
  const [showInvoiceOnly, setShowInvoiceOnly] = useState(false)
  const [sortByFactored, setSortByFactored] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const { data, error: fetchError } = await supabase
        .from('sales_opportunities')
        .select('*')
        .not('stage', 'eq', 'lost')
        .order('value', { ascending: false, nullsFirst: false })

      if (fetchError) throw fetchError

      const mapped: Opportunity[] = (data || []).map((row: SalesOpportunity) => ({
        id: row.ghl_opportunity_id || row.id,
        supabase_id: row.id,
        ghl_id: row.ghl_opportunity_id,
        name: row.name,
        stage: row.stage,
        stageName: STAGE_DISPLAY[row.stage] || row.stage,
        value: row.value,
        type: row.type,
        assignedTo: row.assigned_to_email,
        isRenewal: row.type === 'renewal' || row.name.toLowerCase().includes('renewal'),
        isContactOnly: row.is_contact_only || false,
        lastActivityAt: row.last_activity_at,
        probability: row.probability ?? STAGE_PROBABILITY[row.stage] ?? 0,
        source: row.source,
        notes: row.notes,
        needs_invoice: row.needs_invoice || false,
        invoice_amount: row.invoice_amount,
        invoice_notes: row.invoice_notes,
        contract_year: row.contract_year,
        onJimsList: row.on_jims_call_sheet || false,
      }))

      setOpportunities(mapped)
      setLastSynced(new Date())

      const { data: notesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('activity_type', 'note')
        .order('activity_date', { ascending: false })

      setNotes(notesData ?? [])
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities')
    }

    setLoading(false)
  }

  async function saveNote(supabaseId: string) {
    if (!newNote.trim()) return
    setSavingNote(true)

    const { error: insertError } = await supabase.from('activity_log').insert({
      opportunity_id: supabaseId,
      activity_type: 'note',
      subject: 'Note',
      body: newNote.trim(),
      logged_by_email: 'admin@teachersdeserveit.com',
      activity_date: new Date().toISOString(),
    })

    if (!insertError) {
      const { data: notesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('activity_type', 'note')
        .order('activity_date', { ascending: false })

      setNotes(notesData ?? [])

      await supabase
        .from('sales_opportunities')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', supabaseId)

      setOpportunities(prev => prev.map(opp =>
        opp.supabase_id === supabaseId
          ? { ...opp, lastActivityAt: new Date().toISOString() }
          : opp
      ))
    }

    setNewNote('')
    setActiveNoteOpp(null)
    setSavingNote(false)
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleJimsList(supabaseId: string) {
    const opp = opportunities.find(o => o.supabase_id === supabaseId)
    if (!opp) return
    const newVal = !opp.onJimsList
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === supabaseId ? { ...o, onJimsList: newVal } : o
    ))
    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update({ on_jims_call_sheet: newVal, updated_at: new Date().toISOString() })
      .eq('id', supabaseId)
    if (updateError) {
      setOpportunities(prev => prev.map(o =>
        o.supabase_id === supabaseId ? { ...o, onJimsList: !newVal } : o
      ))
      showToast('Failed to update', 'error')
    } else {
      showToast(newVal ? "Added to Jim's list" : "Removed from Jim's list", 'success')
    }
  }

  function exportCsv(rows: Opportunity[], filename: string) {
    const escape = (v: any) => {
      if (v === null || v === undefined) return ''
      const s = String(v)
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const header = 'Name,Amount,Stage,Source,Notes'
    const lines = rows.map(r =>
      [r.name, r.value ? `$${r.value.toLocaleString()}` : '', r.stageName, r.source || '', (r.notes || '').replace(/\n/g, ' ').slice(0, 300)]
        .map(escape).join(',')
    )
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportJimsList() {
    const jimsOpps = activeOpps.filter(o => o.onJimsList)
    const today = new Date().toISOString().split('T')[0]
    exportCsv(jimsOpps, `jims-call-list-${today}.csv`)
  }

  function exportAllActive() {
    const today = new Date().toISOString().split('T')[0]
    exportCsv(activeOpps, `all-active-pipeline-${today}.csv`)
  }

  async function updateStage(supabaseId: string, ghlId: string | null, newStageId: string, newStageName: string) {
    const originalOpp = opportunities.find(o => o.supabase_id === supabaseId)
    const originalStage = originalOpp?.stage
    const originalStageName = originalOpp?.stageName

    setOpportunities(prev => prev.map(opp =>
      opp.supabase_id === supabaseId
        ? { ...opp, stage: newStageId, stageName: newStageName }
        : opp
    ))

    setUpdatingOpportunity(supabaseId)

    try {
      const { error: supabaseError } = await supabase
        .from('sales_opportunities')
        .update({ stage: newStageId, updated_at: new Date().toISOString() })
        .eq('id', supabaseId)

      if (supabaseError) throw new Error('Supabase update failed: ' + supabaseError.message)

      if (ghlId) {
        try {
          await fetch(`/api/ghl/opportunity/${ghlId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pipelineStageId: newStageId,
              pipelineId: 'tdi-crm',
            }),
          })
        } catch {
          console.warn('GHL write-back failed - Supabase updated successfully')
        }
      }

      showToast(`Stage updated to "${newStageName}"`, 'success')
    } catch (err: any) {
      setOpportunities(prev => prev.map(opp =>
        opp.supabase_id === supabaseId
          ? { ...opp, stage: originalStage ?? '', stageName: originalStageName ?? '' }
          : opp
      ))
      showToast('Failed to update stage - please try again', 'error')
    } finally {
      setUpdatingOpportunity(null)
    }
  }

  function getOppNotes(supabaseId: string) {
    return notes.filter(n => n.opportunity_id === supabaseId)
  }

  function getLatestNote(supabaseId: string) {
    return getOppNotes(supabaseId)[0] ?? null
  }

  function isNeedsAttention(opp: Opportunity) {
    if (!opp.lastActivityAt) return true
    const daysSinceActivity = (Date.now() - new Date(opp.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceActivity > 14
  }

  function getStageColor(stage: string) {
    return STAGE_COLORS[stage] || 'bg-gray-100 border-gray-200 text-gray-600'
  }

  // ─── FILTER PRESETS ───────────────────────────────────────────────────────
  const PRESETS = [
    {
      id: 'renewals',
      label: 'Renewals',
      description: 'All active renewal opportunities',
      filter: (o: Opportunity) =>
        o.isRenewal && o.stage !== 'paid' && o.stage !== 'lost',
    },
    {
      id: 'hot',
      label: 'Hot Deals',
      description: 'Likely Yes + Proposal Sent + Signed',
      filter: (o: Opportunity) =>
        ['likely_yes', 'proposal_sent', 'signed'].includes(o.stage),
    },
    {
      id: 'new_prospects',
      label: 'New Prospects',
      description: 'Targeting + Engaged - active outreach',
      filter: (o: Opportunity) =>
        ['targeting', 'engaged'].includes(o.stage),
    },
    {
      id: 'needs_attention',
      label: 'Needs Attention',
      description: 'No activity in 14+ days',
      filter: (o: Opportunity) => isNeedsAttention(o),
    },
    {
      id: 'closing_soon',
      label: 'Closing Soon',
      description: 'Signed + Likely Yes - revenue to close',
      filter: (o: Opportunity) =>
        ['signed', 'likely_yes'].includes(o.stage),
    },
    {
      id: 'full_pipeline',
      label: 'Full Pipeline',
      description: 'Everything active (no paid/lost)',
      filter: (o: Opportunity) =>
        o.stage !== 'paid' && o.stage !== 'lost' && !o.isContactOnly,
    },
    {
      id: 'won',
      label: 'Won',
      description: 'Paid - closed deals',
      filter: (o: Opportunity) => o.stage === 'paid',
    },
    {
      id: 'stale',
      label: 'Stale',
      description: 'No activity in 21+ days',
      filter: (o: Opportunity) => {
        if (!o.lastActivityAt) return true
        const days = (Date.now() - new Date(o.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
        return days > 21 && o.stage !== 'paid' && o.stage !== 'lost'
      },
    },
  ]

  const presetFilter = activePreset
    ? PRESETS.find(p => p.id === activePreset)?.filter
    : null

  // Apply all filters
  const filteredUnsorted = opportunities.filter(opp => {
    if (hideContactOnly && opp.isContactOnly) return false
    if (hideUnassigned && opp.stage === 'unassigned') return false
    if (hideZeroValue && !opp.value) return false
    if (presetFilter && !presetFilter(opp)) return false
    if (search && !opp.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedStage !== 'all' && opp.stage !== selectedStage) return false
    if (selectedTypes.length > 0 && !selectedTypes.includes(opp.type)) return false
    if (selectedSources.length > 0 && !selectedSources.includes(opp.source || 'Other')) return false
    if (selectedStageGroup) {
      const group = STAGE_GROUPS[selectedStageGroup]
      if (group && !group.stages.includes(opp.stage)) return false
    }
    if (showInvoiceOnly && !opp.needs_invoice) return false
    return true
  })

  const filtered = sortByFactored
    ? [...filteredUnsorted].sort((a, b) => factoredRevenue(b) - factoredRevenue(a))
    : filteredUnsorted

  const baseFiltered = opportunities.filter(opp => {
    if (hideContactOnly && opp.isContactOnly) return false
    return true
  })

  const presetCounts = Object.fromEntries(
    PRESETS.map(p => [p.id, baseFiltered.filter(p.filter).length])
  )

  // Kanban grouping
  const kanbanStages = STAGE_OPTIONS.filter(s => s.id !== 'lost')
  const byStage: Record<string, Opportunity[]> = {}
  kanbanStages.forEach(s => { byStage[s.id] = [] })
  filtered.forEach(opp => {
    if (byStage[opp.stage]) byStage[opp.stage].push(opp)
  })

  // Pipeline stats
  const activeOpps = opportunities.filter(o => !o.isContactOnly && !['lost', 'paid'].includes(o.stage))
  const pipelineValue = activeOpps.reduce((sum, o) => sum + (o.value ?? 0), 0)
  const pipelineFactored = activeOpps.reduce((sum, o) => sum + factoredRevenue(o), 0)
  const renewalOpps = activeOpps.filter(o => o.type === 'renewal')
  const renewalFactored = renewalOpps.reduce((sum, o) => sum + factoredRevenue(o), 0)
  const invoiceCount = opportunities.filter(o => o.needs_invoice).length
  const jimsListCount = activeOpps.filter(o => o.onJimsList).length

  // Source counts for dynamic filter chips
  const sourceCounts = activeOpps.reduce((acc, o) => {
    const src = o.source || 'Other'
    acc[src] = (acc[src] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const OppCard = ({ opp }: { opp: Opportunity }) => {
    const latestNote = getLatestNote(opp.supabase_id)
    const attention = isNeedsAttention(opp)

    return (
      <div className={`bg-white border rounded-xl p-4 space-y-2 relative ${attention ? 'border-red-300' : 'border-gray-100'}`} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {/* Jim's list toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleJimsList(opp.supabase_id) }}
          title={opp.onJimsList ? "Remove from Jim's list" : "Add to Jim's list"}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            opp.onJimsList
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </button>

        <div className="flex items-start justify-between gap-2 pr-8">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{opp.name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {opp.isRenewal && (
              <span className="text-xs font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                Renewal
              </span>
            )}
            {attention && (
              <span className="text-xs font-medium bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
          </div>
        </div>

        {opp.value ? (
          <p className="text-sm font-bold text-gray-700">
            ${opp.value.toLocaleString()}
          </p>
        ) : null}

        {latestNote && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5">
            <p className="truncate">{latestNote.body}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <select
            value={opp.stage}
            disabled={updatingOpportunity === opp.supabase_id}
            onChange={e => {
              const selected = STAGE_OPTIONS.find(s => s.id === e.target.value)
              if (selected) updateStage(opp.supabase_id, opp.ghl_id, selected.id, selected.name)
            }}
            className={`text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 cursor-pointer hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors ${
              updatingOpportunity === opp.supabase_id ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {STAGE_OPTIONS.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          {updatingOpportunity === opp.supabase_id && (
            <span className="text-xs text-indigo-500 animate-pulse">Syncing...</span>
          )}
        </div>

        {activeNoteOpp === opp.supabase_id ? (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
              rows={2}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Note or next step..."
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveNote(opp.supabase_id)}
                disabled={savingNote || !newNote.trim()}
                className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white px-2.5 py-1 rounded font-medium"
              >
                Save
              </button>
              <button
                onClick={() => { setActiveNoteOpp(null); setNewNote('') }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveNoteOpp(opp.supabase_id)}
            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
          >
            + Log note
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            TDI CRM Pipeline
            {lastSynced && (
              <span className="ml-2 text-gray-400">
                Last loaded {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportJimsList}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Export Jim&apos;s List
          </button>
          <button
            onClick={exportAllActive}
            className="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Export All
          </button>
          <button
            onClick={loadAll}
            className="text-xs text-indigo-600 hover:underline"
          >
            Refresh
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('list')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                view === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                view === 'kanban' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Hero summary row */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          {/* Hero: Pipeline Value */}
          <div style={{
            background: 'linear-gradient(135deg, #FFBA06 0%, #FF8C00 100%)',
            borderRadius: 16,
            padding: '24px 28px',
            color: '#0a0f1e',
            boxShadow: '0 4px 12px rgba(255,186,6,0.2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, opacity: 0.7 }}>
              Pipeline Value
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
              {formatCurrencyFull(pipelineValue)}
            </div>
            <div style={{ fontSize: 13, marginTop: 10, opacity: 0.85 }}>
              Factored: <strong>{formatCurrencyFull(pipelineFactored)}</strong>
              {' · '}
              {activeOpps.length} active
            </div>
          </div>

          {/* Renewals card */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280', marginBottom: 8 }}>
              Renewals
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0a0f1e' }}>
              {renewalOpps.length}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              {formatCurrency(renewalFactored)} factored
            </div>
          </div>

          {/* Needs Invoicing card */}
          <div
            onClick={() => setShowInvoiceOnly(!showInvoiceOnly)}
            style={{
              background: showInvoiceOnly ? '#FEF3C7' : '#FFFBEB',
              borderRadius: 12,
              padding: '20px 24px',
              border: showInvoiceOnly ? '2px solid #F59E0B' : '1px solid #FCD34D',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#92400E', marginBottom: 8 }}>
              Needs Invoicing
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#92400E' }}>
              {invoiceCount}
            </div>
            <div style={{ fontSize: 12, color: '#92400E', marginTop: 6 }}>
              25-26 AR outstanding
            </div>
          </div>
        </div>
      )}

      {/* Stage Group bar */}
      {!loading && !error && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Pipeline by Stage Group
          </div>

          {(() => {
            const groupData = Object.entries(STAGE_GROUPS).map(([key, g]) => {
              const groupOpps = activeOpps.filter(o => g.stages.includes(o.stage))
              const groupValue = groupOpps.reduce((s, o) => s + (o.value ?? 0), 0)
              return { key, ...g, opps: groupOpps, value: groupValue }
            })
            const totalValue = groupData.reduce((s, g) => s + g.value, 0) || 1

            return (
              <>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 4, height: 48, borderRadius: 8, overflow: 'hidden' }}>
                  {groupData.map(g => (
                    <div
                      key={g.key}
                      onClick={() => setSelectedStageGroup(selectedStageGroup === g.key ? null : g.key)}
                      style={{
                        flex: g.value / totalValue,
                        minWidth: g.value > 0 ? 60 : 0,
                        background: g.color,
                        color: g.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: selectedStageGroup && selectedStageGroup !== g.key ? 0.4 : 1,
                        transition: 'opacity 0.15s',
                      }}
                      title={`${g.label}: ${formatCurrencyFull(g.value)} across ${g.opps.length} opportunities`}
                    >
                      {g.label} · {formatCurrency(g.value)}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: '#6B7280' }}>
                  {groupData.map(g => (
                    <span key={g.key}>{g.opps.length} {g.description.toLowerCase()}</span>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Smart filter presets + Search */}
      {!loading && !error && (
        <div className="space-y-3">
          {/* Filter preset bar */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(activePreset === preset.id ? null : preset.id)}
                title={preset.description}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activePreset === preset.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
                {presetCounts[preset.id] > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    activePreset === preset.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}>
                    {presetCounts[preset.id]}
                  </span>
                )}
              </button>
            ))}
            {activePreset && (
              <button
                onClick={() => setActivePreset(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Active filter summary */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {opportunities.filter(o => !o.isContactOnly).length} opportunities
            </span>
            {hideUnassigned && <span className="bg-slate-100 px-2 py-0.5 rounded">Hiding unassigned</span>}
            {hideZeroValue && <span className="bg-slate-100 px-2 py-0.5 rounded">Hiding $0</span>}
            {hideContactOnly && <span className="bg-slate-100 px-2 py-0.5 rounded">Hiding contact-only</span>}
            {activePreset && (
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                {PRESETS.find(p => p.id === activePreset)?.label} filter active
              </span>
            )}
            {showInvoiceOnly && (
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Invoice filter active</span>
            )}
          </div>

          {/* Toggle switches */}
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideContactOnly}
                onChange={e => setHideContactOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-600">Hide contact-only rows</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideUnassigned}
                onChange={e => setHideUnassigned(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-600">Hide Unassigned</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideZeroValue}
                onChange={e => setHideZeroValue(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-600">Hide $0 Value</span>
            </label>
          </div>

          {/* Search + Stage filter */}
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
            />
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Stages</option>
              {STAGE_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Deal Type + Source filter rows */}
          <div style={{ marginTop: 4, padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
            {/* Deal Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, minWidth: 70 }}>
                Deal Type:
              </span>
              {DEAL_TYPES.map(t => {
                const active = selectedTypes.includes(t.value)
                const count = activeOpps.filter(o => o.type === t.value).length
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTypes(prev =>
                      active ? prev.filter(x => x !== t.value) : [...prev, t.value]
                    )}
                    style={{
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: active ? '#0a0f1e' : 'white',
                      color: active ? 'white' : '#0a0f1e',
                      border: '1px solid #0a0f1e',
                      borderRadius: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label} · {count}
                  </button>
                )
              })}
            </div>

            {/* Source filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, minWidth: 70 }}>
                Source:
              </span>
              {topSources.map(([source, count]) => {
                const active = selectedSources.includes(source)
                return (
                  <button
                    key={source}
                    onClick={() => setSelectedSources(prev =>
                      active ? prev.filter(x => x !== source) : [...prev, source]
                    )}
                    style={{
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      background: active ? '#FFBA06' : 'white',
                      color: active ? '#0a0f1e' : '#6B7280',
                      border: active ? '1px solid #FFBA06' : '1px solid #D1D5DB',
                      borderRadius: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {source} · {count}
                  </button>
                )
              })}
            </div>

            {/* Clear filters */}
            {(selectedTypes.length > 0 || selectedSources.length > 0 || selectedStageGroup || showInvoiceOnly) && (
              <button
                onClick={() => {
                  setSelectedTypes([])
                  setSelectedSources([])
                  setSelectedStageGroup(null)
                  setShowInvoiceOnly(false)
                }}
                style={{
                  marginTop: 10,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'transparent',
                  color: '#6B7280',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && !error && view === 'list' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Opportunity
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Stage
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Value
                </th>
                <th
                  onClick={() => setSortByFactored(!sortByFactored)}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 700,
                    color: sortByFactored ? '#FFBA06' : '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Factored {sortByFactored && '↓'}
                </th>
                <th style={{ padding: '12px 16px', width: 80 }} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No opportunities match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(opp => {
                  const stageColor = getStageColor(opp.stage)
                  const subtitle = opportunitySubtitle(opp)

                  return (
                    <tr key={opp.supabase_id} className="hover:bg-gray-50">
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0f1e', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {opp.name}
                          {opp.isRenewal && (
                            <span style={{ fontSize: 10, padding: '2px 6px', background: '#FEF3C7', color: '#92400E', borderRadius: 8, fontWeight: 700 }}>
                              RENEWAL
                            </span>
                          )}
                          {opp.needs_invoice && (
                            <span style={{ fontSize: 10, padding: '2px 6px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontWeight: 700 }}>
                              INVOICE
                            </span>
                          )}
                        </div>
                        {subtitle && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                            {subtitle}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex items-center gap-2">
                          <select
                            value={opp.stage}
                            disabled={updatingOpportunity === opp.supabase_id}
                            onChange={e => {
                              const selected = STAGE_OPTIONS.find(s => s.id === e.target.value)
                              if (selected) updateStage(opp.supabase_id, opp.ghl_id, selected.id, selected.name)
                            }}
                            className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors ${stageColor} ${
                              updatingOpportunity === opp.supabase_id ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300'
                            }`}
                          >
                            {STAGE_OPTIONS.map(stage => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                          {updatingOpportunity === opp.supabase_id && (
                            <span className="text-xs text-indigo-500 animate-pulse">Syncing...</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#0a0f1e' }}>
                        {opp.value ? formatCurrencyFull(opp.value) : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0f1e' }}>
                          {formatCurrencyFull(factoredRevenue(opp))}
                        </div>
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                          {opp.probability}%
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {activeNoteOpp === opp.supabase_id ? (
                          <div className="space-y-1 min-w-48">
                            <textarea
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              rows={2}
                              value={newNote}
                              onChange={e => setNewNote(e.target.value)}
                              placeholder="Note..."
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => saveNote(opp.supabase_id)}
                                disabled={savingNote || !newNote.trim()}
                                className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white px-2 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setActiveNoteOpp(null); setNewNote('') }}
                                className="text-xs text-gray-400 px-1 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveNoteOpp(opp.supabase_id)}
                            className="text-xs text-indigo-500 hover:underline whitespace-nowrap"
                          >
                            + Note
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN VIEW */}
      {!loading && !error && view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {kanbanStages.map(stage => {
              const stageOpps = byStage[stage.id] ?? []
              const stageColor = getStageColor(stage.id)
              const stageValue = stageOpps.reduce((sum, o) => sum + (o.value ?? 0), 0)

              return (
                <div key={stage.id} className="w-72 flex-shrink-0">
                  <div className={`rounded-t-xl px-3 py-2 border ${stageColor} flex items-center justify-between`}>
                    <span className="text-xs font-semibold">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      {stageValue > 0 && (
                        <span className="text-xs">${stageValue.toLocaleString()}</span>
                      )}
                      <span className="text-xs font-bold">{stageOpps.length}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl p-2 space-y-2 min-h-24 max-h-screen overflow-y-auto">
                    {stageOpps.length === 0 ? (
                      <p className="text-xs text-gray-300 text-center py-4">No opportunities</p>
                    ) : (
                      stageOpps.map(opp => <OppCard key={opp.supabase_id} opp={opp} />)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
