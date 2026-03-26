'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

type ViewMode = 'kanban' | 'list'

// Supabase sales_opportunities row shape
interface SalesOpportunity {
  id: string
  ghl_opportunity_id: string | null
  name: string
  type: 'new_business' | 'renewal' | 'upsell' | 'reactivation'
  stage: string
  value: number | null
  probability: number | null
  assigned_to_email: string | null
  source: string | null
  notes: string | null
  last_activity_at: string | null
  is_contact_only: boolean
  created_at: string
  updated_at: string
}

// UI Opportunity shape - keeps rendering code unchanged
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
  targeting: 'Targeting (5%)',
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
  { id: 'targeting', name: 'Targeting (5%)' },
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

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      // Fetch opportunities from Supabase
      const { data, error: fetchError } = await supabase
        .from('sales_opportunities')
        .select('*')
        .not('stage', 'eq', 'lost')
        .order('value', { ascending: false, nullsFirst: false })

      if (fetchError) throw fetchError

      // Map Supabase rows to UI Opportunity shape
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
      }))

      setOpportunities(mapped)
      setLastSynced(new Date())

      // Fetch activity notes
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
      // Refresh notes
      const { data: notesData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('activity_type', 'note')
        .order('activity_date', { ascending: false })

      setNotes(notesData ?? [])

      // Update last_activity_at on the opportunity
      await supabase
        .from('sales_opportunities')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', supabaseId)

      // Update local state
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

  async function updateStage(supabaseId: string, ghlId: string | null, newStageId: string, newStageName: string) {
    const originalOpp = opportunities.find(o => o.supabase_id === supabaseId)
    const originalStage = originalOpp?.stage
    const originalStageName = originalOpp?.stageName

    // Optimistic UI update
    setOpportunities(prev => prev.map(opp =>
      opp.supabase_id === supabaseId
        ? { ...opp, stage: newStageId, stageName: newStageName }
        : opp
    ))

    setUpdatingOpportunity(supabaseId)

    try {
      // 1. Update Supabase (primary - source of truth)
      const { error: supabaseError } = await supabase
        .from('sales_opportunities')
        .update({ stage: newStageId, updated_at: new Date().toISOString() })
        .eq('id', supabaseId)

      if (supabaseError) throw new Error('Supabase update failed: ' + supabaseError.message)

      // 2. Write back to GHL if we have a GHL ID (secondary - keeps GHL in sync)
      if (ghlId) {
        try {
          await fetch(`/api/ghl/opportunity/${ghlId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pipelineStageId: newStageId,
              pipelineId: 'tdi-crm', // placeholder for GHL compatibility
            }),
          })
          // GHL failure is non-blocking - Supabase is source of truth
        } catch {
          console.warn('GHL write-back failed - Supabase updated successfully')
        }
      }

      showToast(`Stage updated to "${newStageName}"`, 'success')
    } catch (err: any) {
      // Revert optimistic update on Supabase failure
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
    // Needs attention if no activity in 14 days
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

  // Active preset filter function
  const presetFilter = activePreset
    ? PRESETS.find(p => p.id === activePreset)?.filter
    : null

  // Apply all filters to get the visible opportunities list
  const filtered = opportunities.filter(opp => {
    if (hideContactOnly && opp.isContactOnly) return false
    if (hideUnassigned && opp.stage === 'unassigned') return false
    if (hideZeroValue && !opp.value) return false
    if (presetFilter && !presetFilter(opp)) return false
    if (search && !opp.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedStage !== 'all' && opp.stage !== selectedStage) return false
    return true
  })

  // Count per preset (applied against base-filtered list, ignoring active preset)
  const baseFiltered = opportunities.filter(opp => {
    if (hideContactOnly && opp.isContactOnly) return false
    return true
  })

  const presetCounts = Object.fromEntries(
    PRESETS.map(p => [p.id, baseFiltered.filter(p.filter).length])
  )

  // Group by stage for kanban (exclude lost)
  const kanbanStages = STAGE_OPTIONS.filter(s => s.id !== 'lost')
  const byStage: Record<string, Opportunity[]> = {}
  kanbanStages.forEach(s => { byStage[s.id] = [] })
  filtered.forEach(opp => {
    if (byStage[opp.stage]) byStage[opp.stage].push(opp)
  })

  // Probability map for weighted value
  const STAGE_PROBABILITY: Record<string, number> = {
    unassigned: 0, targeting: 5, engaged: 10, qualified: 30,
    likely_yes: 50, proposal_sent: 70, signed: 90, paid: 100, lost: 0,
  }

  // Summary stats - pipeline-wide (excluding contact-only)
  const pipelineOpps = opportunities.filter(o => !o.isContactOnly && o.stage !== 'paid' && o.stage !== 'lost')
  const totalValue = pipelineOpps.reduce((sum, o) => sum + (o.value ?? 0), 0)
  const weightedValue = pipelineOpps.reduce((sum, o) => {
    const prob = STAGE_PROBABILITY[o.stage] || 0
    return sum + ((o.value || 0) * prob / 100)
  }, 0)
  const renewalCount = opportunities.filter(o => o.isRenewal && !o.isContactOnly && o.stage !== 'paid' && o.stage !== 'lost').length
  const needsAttentionCount = pipelineOpps.filter(o => isNeedsAttention(o)).length

  const OppCard = ({ opp }: { opp: Opportunity }) => {
    const latestNote = getLatestNote(opp.supabase_id)
    const attention = isNeedsAttention(opp)

    return (
      <div className={`bg-white border rounded-xl p-4 space-y-2 ${attention ? 'border-red-300' : 'border-gray-100'}`} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between gap-2">
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

        {/* Move to stage dropdown */}
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

        {/* Log note toggle */}
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

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="h-0.5 w-full bg-indigo-500" />
            <div className="p-4">
              <p className="text-2xl font-bold text-indigo-600">{opportunities.length}</p>
              <p className="text-sm text-gray-500 mt-0.5">Total Opportunities</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="h-0.5 w-full bg-indigo-500" />
            <div className="p-4">
              <p className="text-2xl font-bold text-amber-600">{renewalCount}</p>
              <p className="text-sm text-gray-500 mt-0.5">Renewal Opportunities</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="h-0.5 w-full bg-indigo-500" />
            <div className="p-4">
              <p className="text-2xl font-bold text-red-500">{needsAttentionCount}</p>
              <p className="text-sm text-gray-500 mt-0.5">Needs Attention</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="h-0.5 w-full bg-indigo-500" />
            <div className="p-4">
              <p className="text-2xl font-bold text-green-600">
                ${totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Pipeline Value</p>
              <p className="text-xs text-gray-400 mt-1">
                ${Math.round(weightedValue).toLocaleString()} weighted
              </p>
            </div>
          </div>
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
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Opportunity</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Latest Note</th>
                <th className="text-left px-4 py-3">Last Activity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No opportunities match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(opp => {
                  const stageColor = getStageColor(opp.stage)
                  const latestNote = getLatestNote(opp.supabase_id)
                  const attention = isNeedsAttention(opp)

                  return (
                    <tr key={opp.supabase_id} className={`hover:bg-gray-50 ${attention ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{opp.name}</p>
                          {opp.isRenewal && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Renewal
                            </span>
                          )}
                          {attention && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {opp.value ? `$${opp.value.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-48">
                        {latestNote ? (
                          <p className="truncate">{latestNote.body}</p>
                        ) : (
                          <span className="text-gray-300">No notes</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${attention ? 'text-red-500' : 'text-gray-500'}`}>
                        {opp.lastActivityAt
                          ? new Date(opp.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
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
                  {/* Stage header */}
                  <div className={`rounded-t-xl px-3 py-2 border ${stageColor} flex items-center justify-between`}>
                    <span className="text-xs font-semibold">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      {stageValue > 0 && (
                        <span className="text-xs">${stageValue.toLocaleString()}</span>
                      )}
                      <span className="text-xs font-bold">{stageOpps.length}</span>
                    </div>
                  </div>

                  {/* Cards */}
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
