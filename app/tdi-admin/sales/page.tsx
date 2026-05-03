'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { AnalyticsTab } from './components/AnalyticsTab'
import { StickyTopBar } from './components/StickyTopBar'
import { FilterPanel, EMPTY_FILTERS, type ActiveFilters } from './components/FilterPanel'
import { KanbanColumn } from './components/KanbanColumn'
import { SalesCard, type SalesCardOpp } from './components/SalesCard'

type ViewMode = 'kanban' | 'list'
type PageTab = 'pipeline' | 'analytics'

interface SalesOpportunity {
  id: string
  ghl_opportunity_id: string | null
  name: string
  type: string
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
  heat: string | null
  created_at: string
  updated_at: string
}

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
  heat: string
}

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

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 5, engaged: 10, qualified: 30,
  likely_yes: 50, proposal_sent: 70, signed: 90, paid: 100, lost: 0,
}

const STAGE_LABELS: Record<string, string> = {
  targeting: 'Targeting',
  engaged: 'Engaged',
  qualified: 'Qualified',
  likely_yes: 'Likely Yes',
  proposal_sent: 'Proposal Sent',
  signed: 'Signed',
}

const DEFAULT_KANBAN_STAGES = ['qualified', 'likely_yes', 'proposal_sent']
const ALL_ACTIVE_STAGES = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed']

function factoredRevenue(opp: Opportunity): number {
  return Math.round((opp.value || 0) * opp.probability / 100)
}

function formatCurrencyFull(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function toCardOpp(opp: Opportunity): SalesCardOpp {
  return {
    id: opp.supabase_id,
    name: opp.name,
    value: opp.value,
    probability: opp.probability,
    type: opp.type,
    assignedTo: opp.assignedTo,
    notes: opp.notes,
    needs_invoice: opp.needs_invoice,
    stage: opp.stage,
    source: opp.source,
    lastActivityAt: opp.lastActivityAt,
    heat: opp.heat,
    contract_year: opp.contract_year,
  }
}

export default function SalesPage() {
  const supabase = getSupabase()
  const [pageTab, setPageTab] = useState<PageTab>('pipeline')
  const [view, setView] = useState<ViewMode>('kanban')
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [showAllStages, setShowAllStages] = useState(true)

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
        heat: row.heat || 'warm',
      }))

      setOpportunities(mapped)
      setLastSynced(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities')
    }
    setLoading(false)
  }

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; opp: Opportunity } | null>(null)
  const [noteModal, setNoteModal] = useState<Opportunity | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  function showToastMsg(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Drag-and-drop: move opp to new stage
  async function handleStageDrop(oppId: string, toStage: string) {
    const opp = opportunities.find(o => o.supabase_id === oppId)
    if (!opp || opp.stage === toStage) return

    const newProb = STAGE_PROBABILITY[toStage] ?? opp.probability
    const oldStage = opp.stage

    // Optimistic update
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === oppId
        ? { ...o, stage: toStage, stageName: STAGE_DISPLAY[toStage] || toStage, probability: newProb }
        : o
    ))

    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update({ stage: toStage, probability: newProb, updated_at: new Date().toISOString() })
      .eq('id', oppId)

    if (updateError) {
      // Revert
      setOpportunities(prev => prev.map(o =>
        o.supabase_id === oppId
          ? { ...o, stage: oldStage, stageName: STAGE_DISPLAY[oldStage] || oldStage, probability: STAGE_PROBABILITY[oldStage] ?? opp.probability }
          : o
      ))
      showToastMsg('Failed to update stage', 'error')
    } else {
      showToastMsg(`Moved to ${STAGE_DISPLAY[toStage] || toStage}`, 'success')
    }
  }

  // Context menu: move to stage
  async function handleMoveToStage(opp: Opportunity, toStage: string) {
    setContextMenu(null)
    await handleStageDrop(opp.supabase_id, toStage)
  }

  // Context menu: delete (mark as lost)
  async function handleDeleteOpp(opp: Opportunity) {
    setContextMenu(null)
    setOpportunities(prev => prev.filter(o => o.supabase_id !== opp.supabase_id))

    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update({ stage: 'lost', updated_at: new Date().toISOString() })
      .eq('id', opp.supabase_id)

    if (updateError) {
      loadAll()
      showToastMsg('Failed to remove deal', 'error')
    } else {
      showToastMsg(`"${opp.name}" marked as lost`, 'success')
    }
  }

  // Context menu: add note
  async function handleSaveNote() {
    if (!noteModal || !noteText.trim()) return
    setSavingNote(true)

    await supabase.from('activity_log').insert({
      opportunity_id: noteModal.supabase_id,
      activity_type: 'note',
      subject: 'Note',
      body: noteText.trim(),
      logged_by_email: 'admin@teachersdeserveit.com',
      activity_date: new Date().toISOString(),
    })

    await supabase
      .from('sales_opportunities')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', noteModal.supabase_id)

    setOpportunities(prev => prev.map(o =>
      o.supabase_id === noteModal.supabase_id
        ? { ...o, lastActivityAt: new Date().toISOString() }
        : o
    ))

    setSavingNote(false)
    setNoteText('')
    setNoteModal(null)
    showToastMsg('Note saved', 'success')
  }

  // Handle right-click on card
  function handleCardContextMenu(e: React.MouseEvent, oppId: string) {
    e.preventDefault()
    const opp = opportunities.find(o => o.supabase_id === oppId)
    if (opp) {
      setContextMenu({ x: e.clientX, y: e.clientY, opp })
    }
  }

  // Active opps (exclude contact-only, paid, lost)
  const activeOpps = useMemo(() =>
    opportunities.filter(o => !o.isContactOnly && !['lost', 'paid'].includes(o.stage)),
    [opportunities]
  )

  // Unique sources for filter panel
  const uniqueSources = useMemo(() => {
    const counts: Record<string, number> = {}
    activeOpps.forEach(o => {
      const src = o.source || 'Other'
      counts[src] = (counts[src] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s)
  }, [activeOpps])

  // Apply filters
  const filtered = useMemo(() => {
    return activeOpps.filter(opp => {
      const f = activeFilters
      if (f.search && !opp.name.toLowerCase().includes(f.search.toLowerCase())) return false
      if (f.deal_types.length > 0 && !f.deal_types.includes(opp.type)) return false
      if (f.sources.length > 0 && !f.sources.includes(opp.source || 'Other')) return false
      return true
    })
  }, [activeOpps, activeFilters])

  // Counts for filter chips
  const dealTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeOpps.forEach(o => {
      const t = o.type || 'Unknown'
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [activeOpps])

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeOpps.forEach(o => {
      const src = o.source || 'Other'
      counts[src] = (counts[src] || 0) + 1
    })
    return counts
  }, [activeOpps])

  // Stats for sticky top bar
  const stats = useMemo(() => {
    const raeOpps = activeOpps.filter(o => !o.assignedTo?.includes('jim'))
    const jimOpps = activeOpps.filter(o => o.assignedTo?.includes('jim'))
    return {
      totalPipeline: activeOpps.reduce((s, o) => s + (o.value ?? 0), 0),
      factored: activeOpps.reduce((s, o) => s + factoredRevenue(o), 0),
      activeCount: activeOpps.length,
      raeValue: raeOpps.reduce((s, o) => s + factoredRevenue(o), 0),
      raeCount: raeOpps.length,
      jimValue: jimOpps.reduce((s, o) => s + factoredRevenue(o), 0),
      jimCount: jimOpps.length,
      hotCount: activeOpps.filter(o => o.heat === 'hot').length,
      invoiceCount: opportunities.filter(o => o.needs_invoice).length,
    }
  }, [activeOpps, opportunities])

  const stagesToShow = showAllStages ? ALL_ACTIVE_STAGES : DEFAULT_KANBAN_STAGES

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Sales</h1>
          {lastSynced && (
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              Last loaded {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadAll} style={{ fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer' }}>
            Refresh
          </button>
          <div style={{ display: 'flex', background: '#EEF2FF', borderRadius: 8, padding: 2 }}>
            {(['list', 'kanban'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                  border: 'none', cursor: 'pointer',
                  background: view === v ? 'white' : 'transparent',
                  color: view === v ? '#4338CA' : '#6B7280',
                  boxShadow: view === v ? '0 1px 3px rgba(99,102,241,0.15)' : 'none',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 20, gap: 0 }}>
        {(['pipeline', 'analytics'] as PageTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setPageTab(tab)}
            style={{
              padding: '12px 24px', fontSize: 14, background: 'transparent', border: 'none',
              fontWeight: pageTab === tab ? 700 : 500,
              color: pageTab === tab ? '#0a0f1e' : '#6B7280',
              borderBottom: pageTab === tab ? '2px solid #6366F1' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {pageTab === 'analytics' && <AnalyticsTab />}

      {/* Pipeline Tab */}
      {pageTab === 'pipeline' && (
        <>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#991B1B', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: 48, background: '#F3F4F6', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <>
              {/* Sticky Top Bar */}
              <StickyTopBar
                stats={stats}
                onAddLead={() => showToastMsg('Add Lead UI ships in the next CCP', 'success')}
              />

              {/* Inline Filter Row */}
              <FilterPanel
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                sources={uniqueSources}
                dealTypeCounts={dealTypeCounts}
                sourceCounts={sourceCounts}
              />

              {/* KANBAN VIEW */}
              {view === 'kanban' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      {showAllStages ? 'All stages' : '3 most active stages'}
                      {!showAllStages && ' · Hidden: Targeting, Engaged, Signed'}
                    </span>
                    <button
                      onClick={() => setShowAllStages(!showAllStages)}
                      style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer' }}
                    >
                      {showAllStages ? 'Show 3 most active' : 'Show all stages'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
                    {stagesToShow.map(stage => (
                      <KanbanColumn
                        key={stage}
                        stage={stage}
                        label={`${STAGE_LABELS[stage] || stage} (${STAGE_PROBABILITY[stage] || 0}%)`}
                        opportunities={filtered.filter(o => o.stage === stage).map(toCardOpp)}
                        onCardClick={(opp) => showToastMsg(`Detail panel for "${opp.name}" ships in next CCP`, 'success')}
                        onDrop={handleStageDrop}
                        onCardContextMenu={handleCardContextMenu}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* LIST VIEW */}
              {view === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40, fontSize: 13 }}>
                      No opportunities match your filters.
                    </p>
                  ) : (
                    [...filtered]
                      .sort((a, b) => factoredRevenue(b) - factoredRevenue(a))
                      .map(opp => (
                        <SalesCard
                          key={opp.supabase_id}
                          opp={toCardOpp(opp)}
                          onClick={() => showToastMsg(`Detail panel for "${opp.name}" ships in next CCP`, 'success')}
                        />
                      ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div onClick={() => setContextMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 300 }} />
          <div style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 301,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            padding: '6px 0',
            minWidth: 200,
          }}>
            <div style={{ padding: '6px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {contextMenu.opp.name.length > 30 ? contextMenu.opp.name.slice(0, 28) + '...' : contextMenu.opp.name}
            </div>
            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />

            <div style={{ padding: '4px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Move to stage</div>
            {ALL_ACTIVE_STAGES.filter(s => s !== contextMenu.opp.stage).map(s => (
              <button
                key={s}
                onClick={() => handleMoveToStage(contextMenu.opp, s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', fontSize: 13, color: '#0a0f1e',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F3F4F6' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none' }}
              >
                {STAGE_LABELS[s] || s} ({STAGE_PROBABILITY[s]}%)
              </button>
            ))}

            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />

            <button
              onClick={() => { setContextMenu(null); setNoteModal(contextMenu.opp); setNoteText('') }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 13, color: '#0a0f1e',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F3F4F6' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none' }}
            >
              + Add note
            </button>

            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />

            <button
              onClick={() => handleDeleteOpp(contextMenu.opp)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 13, color: '#EF4444',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#FEF2F2' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none' }}
            >
              Mark as lost
            </button>
          </div>
        </>
      )}

      {/* Note Modal */}
      {noteModal && (
        <>
          <div onClick={() => { setNoteModal(null); setNoteText('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: 16, padding: 24, width: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 401,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Add Note</h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 16px' }}>{noteModal.name}</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Note or next step..."
              autoFocus
              rows={4}
              style={{
                width: '100%', border: '1px solid #D1D5DB', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => { setNoteModal(null); setNoteText('') }}
                style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !noteText.trim()}
                style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8,
                  border: 'none', background: '#0a0f1e', color: 'white', cursor: 'pointer',
                  opacity: savingNote || !noteText.trim() ? 0.5 : 1,
                }}
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 500,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

