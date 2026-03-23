'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

type ViewMode = 'kanban' | 'list'

type GHLStage = {
  id: string
  name: string
  position?: number
}

type GHLOpportunity = {
  id: string
  name: string
  monetaryValue?: number
  status: string
  pipelineStageId: string
  pipelineStageName?: string
  assignedTo?: string
  contact?: {
    name?: string
    email?: string
    company?: string
  }
  createdAt?: string
  updatedAt?: string
}

type LocalNote = {
  id: string
  ghl_opportunity_id: string
  note: string
  next_action_date: string | null
  needs_attention: boolean
  created_at: string
}

const STAGE_COLORS: Record<string, string> = {
  'Unassigned': 'bg-gray-100 border-gray-200 text-gray-600',
  'New': 'bg-slate-100 border-slate-200 text-slate-700',
  'Targeting': 'bg-blue-100 border-blue-200 text-blue-700',
  'Engaged': 'bg-indigo-100 border-indigo-200 text-indigo-700',
  'Qualified': 'bg-violet-100 border-violet-200 text-violet-700',
  'Likely Yes': 'bg-purple-100 border-purple-200 text-purple-700',
  'Proposal Sent': 'bg-amber-100 border-amber-200 text-amber-700',
  'Signed': 'bg-orange-100 border-orange-200 text-orange-700',
  'Paid': 'bg-green-100 border-green-200 text-green-700',
}

export default function SalesPage() {
  const supabase = getSupabase()
  const [view, setView] = useState<ViewMode>('list')
  const [stages, setStages] = useState<GHLStage[]>([])
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([])
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [activeNoteOpp, setActiveNoteOpp] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [newNextAction, setNewNextAction] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [hideUnassigned, setHideUnassigned] = useState(true) // default ON
  const [hideZeroValue, setHideZeroValue] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      // Fetch pipeline stages
      const pipelinesRes = await fetch('/api/ghl/pipelines')
      const pipelinesData = await pipelinesRes.json()

      if (pipelinesData.error) {
        setError(pipelinesData.error)
        setLoading(false)
        return
      }

      // Find the Sales Pipeline
      const salesPipeline = pipelinesData.pipelines?.find(
        (p: any) => p.name?.toLowerCase().includes('sales')
      ) ?? pipelinesData.pipelines?.[0]

      if (salesPipeline?.stages) {
        const sortedStages = [...salesPipeline.stages].sort(
          (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
        )
        setStages(sortedStages)
      }

      // Fetch opportunities
      const oppsRes = await fetch('/api/ghl/pipeline?limit=100')
      const oppsData = await oppsRes.json()

      if (oppsData.error) {
        setError(oppsData.error)
        setLoading(false)
        return
      }

      const opps: GHLOpportunity[] = oppsData.opportunities ?? oppsData.data ?? []
      setOpportunities(opps)
      setLastSynced(new Date())

      // Fetch local notes
      const { data: notesData } = await supabase
        .from('opportunity_notes')
        .select('*')
        .order('created_at', { ascending: false })

      setNotes(notesData ?? [])
    } catch (err) {
      setError('Failed to connect to GHL. Check your API credentials.')
    }

    setLoading(false)
  }

  async function saveNote(oppId: string, oppName: string) {
    if (!newNote.trim()) return
    setSavingNote(true)

    await supabase.from('opportunity_notes').insert({
      ghl_opportunity_id: oppId,
      ghl_opportunity_name: oppName,
      note: newNote.trim(),
      next_action_date: newNextAction || null,
      needs_attention: !!newNextAction && new Date(newNextAction) < new Date(),
    })

    const { data } = await supabase
      .from('opportunity_notes')
      .select('*')
      .order('created_at', { ascending: false })

    setNotes(data ?? [])
    setNewNote('')
    setNewNextAction('')
    setActiveNoteOpp(null)
    setSavingNote(false)
  }

  function getOppNotes(oppId: string) {
    return notes.filter(n => n.ghl_opportunity_id === oppId)
  }

  function getLatestNote(oppId: string) {
    return getOppNotes(oppId)[0] ?? null
  }

  function isNeedsAttention(oppId: string) {
    const latest = getLatestNote(oppId)
    if (!latest?.next_action_date) return false
    return new Date(latest.next_action_date) < new Date()
  }

  function getStageName(stageId: string) {
    return stages.find(s => s.id === stageId)?.name ?? stageId
  }

  function getStageColor(stageName: string) {
    const key = Object.keys(STAGE_COLORS).find(k =>
      stageName?.toLowerCase().includes(k.toLowerCase())
    )
    return key ? STAGE_COLORS[key] : 'bg-gray-100 border-gray-200 text-gray-600'
  }

  // Deduplicate by contact name - keep only the first occurrence (latest if sorted by date)
  const deduped = opportunities.filter((opp, index, self) => {
    if (!opp.name) return true
    return index === self.findIndex(o => o.name === opp.name)
  })

  // Preset filter functions
  const presetFilters: Record<string, (o: GHLOpportunity) => boolean> = {
    renewals: (o) => o.name?.toLowerCase().includes('renewal') ?? false,
    active: (o) => {
      const stage = getStageName(o.pipelineStageId)?.toLowerCase() ?? ''
      return ['qualified', 'likely yes', 'proposal sent', 'signed'].some(s => stage.includes(s))
    },
    attention: (o) => isNeedsAttention(o.id),
    recent: (o) => {
      const oppNotes = getOppNotes(o.id)
      if (oppNotes.length === 0) return false
      const hours = (Date.now() - new Date(oppNotes[0].created_at).getTime()) / (1000 * 60 * 60)
      return hours <= 24
    },
  }

  // Apply all filters
  const filtered = deduped.filter(opp => {
    // Stage filter dropdown
    if (selectedStage !== 'all' && opp.pipelineStageId !== selectedStage) return false

    // Search
    if (search && !opp.name?.toLowerCase().includes(search.toLowerCase()) &&
        !opp.contact?.company?.toLowerCase().includes(search.toLowerCase())) return false

    // Hide unassigned
    if (hideUnassigned) {
      const stageName = getStageName(opp.pipelineStageId)?.toLowerCase() ?? ''
      if (stageName.includes('unassigned')) return false
    }

    // Hide $0 value
    if (hideZeroValue && (!opp.monetaryValue || opp.monetaryValue === 0)) return false

    // Active preset
    if (activePreset && presetFilters[activePreset] && !presetFilters[activePreset](opp)) return false

    return true
  })

  // Group by stage for kanban
  const byStage: Record<string, GHLOpportunity[]> = {}
  stages.forEach(s => { byStage[s.id] = [] })
  filtered.forEach(opp => {
    if (!byStage[opp.pipelineStageId]) byStage[opp.pipelineStageId] = []
    byStage[opp.pipelineStageId].push(opp)
  })

  // Summary stats
  const totalValue = opportunities
    .filter(o => o.status !== 'lost')
    .reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0)
  const renewalCount = opportunities.filter(o =>
    o.name?.toLowerCase().includes('renewal')
  ).length
  const needsAttentionCount = opportunities.filter(o => isNeedsAttention(o.id)).length

  const OppCard = ({ opp }: { opp: GHLOpportunity }) => {
    const latestNote = getLatestNote(opp.id)
    const attention = isNeedsAttention(opp.id)
    const isRenewal = opp.name?.toLowerCase().includes('renewal')

    return (
      <div className={`bg-white border rounded-xl p-4 space-y-2 ${attention ? 'border-red-300' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{opp.name}</p>
            {opp.contact?.company && (
              <p className="text-xs text-gray-400 truncate">{opp.contact.company}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isRenewal && (
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

        {opp.monetaryValue ? (
          <p className="text-sm font-bold text-gray-700">
            ${opp.monetaryValue.toLocaleString()}
          </p>
        ) : null}

        {latestNote && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5">
            <p className="truncate">{latestNote.note}</p>
            {latestNote.next_action_date && (
              <p className={`mt-0.5 font-medium ${attention ? 'text-red-500' : 'text-gray-400'}`}>
                Action: {new Date(latestNote.next_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Log note toggle */}
        {activeNoteOpp === opp.id ? (
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
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                value={newNextAction}
                onChange={e => setNewNextAction(e.target.value)}
              />
              <button
                onClick={() => saveNote(opp.id, opp.name)}
                disabled={savingNote || !newNote.trim()}
                className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white px-2.5 py-1 rounded font-medium"
              >
                Save
              </button>
              <button
                onClick={() => { setActiveNoteOpp(null); setNewNote(''); setNewNextAction('') }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveNoteOpp(opp.id)}
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
            Go High Level pipeline - live sync
            {lastSynced && (
              <span className="ml-2 text-gray-400">
                Last synced {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total Opportunities</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-600">{renewalCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Renewal Opportunities</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-500">{needsAttentionCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Needs Attention</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Total Pipeline Value</p>
          </div>
        </div>
      )}

      {/* Smart filter presets + Search */}
      {!loading && !error && (
        <div className="space-y-3">
          {/* Preset filter buttons */}
          <div className="flex gap-2 flex-wrap items-center">
            {[
              { key: 'renewals', label: 'Renewals' },
              { key: 'active', label: 'Active Deals' },
              { key: 'attention', label: 'Needs Attention' },
              { key: 'recent', label: 'Recent Contact' },
            ].map(preset => (
              <button
                key={preset.key}
                onClick={() => setActivePreset(activePreset === preset.key ? null : preset.key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  activePreset === preset.key
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'border-gray-300 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {preset.label}
              </button>
            ))}

            {/* Toggle switches */}
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={hideUnassigned}
                onChange={e => setHideUnassigned(e.target.checked)}
                className="rounded"
              />
              Hide Unassigned
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hideZeroValue}
                onChange={e => setHideZeroValue(e.target.checked)}
                className="rounded"
              />
              Hide $0 Value
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
              {stages.map(s => (
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
                <th className="text-left px-4 py-3">Next Action</th>
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
                  const stageName = getStageName(opp.pipelineStageId)
                  const stageColor = getStageColor(stageName)
                  const latestNote = getLatestNote(opp.id)
                  const attention = isNeedsAttention(opp.id)
                  const isRenewal = opp.name?.toLowerCase().includes('renewal')

                  return (
                    <tr key={opp.id} className={`hover:bg-gray-50 ${attention ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{opp.name}</p>
                          {isRenewal && (
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
                        {opp.contact?.company && (
                          <p className="text-xs text-gray-400 mt-0.5">{opp.contact.company}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${stageColor}`}>
                          {stageName}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {opp.monetaryValue ? `$${opp.monetaryValue.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-48">
                        {latestNote ? (
                          <p className="truncate">{latestNote.note}</p>
                        ) : (
                          <span className="text-gray-300">No notes</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${attention ? 'text-red-500' : 'text-gray-500'}`}>
                        {latestNote?.next_action_date
                          ? new Date(latestNote.next_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {activeNoteOpp === opp.id ? (
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
                              <input
                                type="date"
                                className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none"
                                value={newNextAction}
                                onChange={e => setNewNextAction(e.target.value)}
                              />
                              <button
                                onClick={() => saveNote(opp.id, opp.name)}
                                disabled={savingNote || !newNote.trim()}
                                className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white px-2 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setActiveNoteOpp(null); setNewNote(''); setNewNextAction('') }}
                                className="text-xs text-gray-400 px-1 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveNoteOpp(opp.id)}
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
            {stages.map(stage => {
              const stageOpps = byStage[stage.id] ?? []
              const stageColor = getStageColor(stage.name)
              const stageValue = stageOpps.reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0)

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
                      stageOpps.map(opp => <OppCard key={opp.id} opp={opp} />)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
