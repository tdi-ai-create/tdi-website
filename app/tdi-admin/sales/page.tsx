'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { AnalyticsTab } from './components/AnalyticsTab'
import { StickyTopBar } from './components/StickyTopBar'
import { FilterPanel, countActiveFilters, EMPTY_FILTERS, type ActiveFilters } from './components/FilterPanel'
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

const STAGE_GROUP_MAP: Record<string, string[]> = {
  pipeline: ['targeting', 'engaged'],
  active_deals: ['qualified', 'likely_yes'],
  closing: ['proposal_sent', 'signed'],
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
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [showAllStages, setShowAllStages] = useState(false)

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

  function showToastMsg(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
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
      if (f.heat.length > 0 && !f.heat.includes(opp.heat)) return false
      if (f.owners.length > 0 && !f.owners.includes(opp.assignedTo || '')) return false
      if (f.sources.length > 0 && !f.sources.includes(opp.source || 'Other')) return false
      if (f.needs_invoice && !opp.needs_invoice) return false
      if (f.stage_groups.length > 0) {
        const allowedStages = f.stage_groups.flatMap(g => STAGE_GROUP_MAP[g] || [])
        if (!allowedStages.includes(opp.stage)) return false
      }
      return true
    })
  }, [activeOpps, activeFilters])

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
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 2 }}>
            {(['list', 'kanban'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6,
                  border: 'none', cursor: 'pointer',
                  background: view === v ? 'white' : 'transparent',
                  color: view === v ? '#0a0f1e' : '#6B7280',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
              borderBottom: pageTab === tab ? '2px solid #FFBA06' : '2px solid transparent',
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
                onToggleFilters={() => setShowFilters(true)}
                activeFilterCount={countActiveFilters(activeFilters)}
              />

              {/* Filter Panel (slide-in) */}
              <FilterPanel
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                sources={uniqueSources}
              />

              {/* Search bar */}
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={activeFilters.search}
                  onChange={e => setActiveFilters({ ...activeFilters, search: e.target.value })}
                  placeholder="Search opportunities..."
                  style={{
                    border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 12px',
                    fontSize: 13, width: 280, outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {filtered.length} of {activeOpps.length} opportunities
                </span>
              </div>

              {/* Active filter pills */}
              {countActiveFilters(activeFilters) > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {activeFilters.deal_types.map(t => (
                    <FilterPill key={`dt-${t}`} label={t} onRemove={() => setActiveFilters({ ...activeFilters, deal_types: activeFilters.deal_types.filter(x => x !== t) })} />
                  ))}
                  {activeFilters.heat.map(h => (
                    <FilterPill key={`h-${h}`} label={h} onRemove={() => setActiveFilters({ ...activeFilters, heat: activeFilters.heat.filter(x => x !== h) })} />
                  ))}
                  {activeFilters.stage_groups.map(s => (
                    <FilterPill key={`sg-${s}`} label={s.replace('_', ' ')} onRemove={() => setActiveFilters({ ...activeFilters, stage_groups: activeFilters.stage_groups.filter(x => x !== s) })} />
                  ))}
                  {activeFilters.owners.map(o => (
                    <FilterPill key={`o-${o}`} label={o.split('@')[0]} onRemove={() => setActiveFilters({ ...activeFilters, owners: activeFilters.owners.filter(x => x !== o) })} />
                  ))}
                  {activeFilters.sources.map(s => (
                    <FilterPill key={`s-${s}`} label={s} onRemove={() => setActiveFilters({ ...activeFilters, sources: activeFilters.sources.filter(x => x !== s) })} />
                  ))}
                  {activeFilters.needs_invoice && (
                    <FilterPill label="Needs Invoice" onRemove={() => setActiveFilters({ ...activeFilters, needs_invoice: false })} />
                  )}
                  <button
                    onClick={() => setActiveFilters(EMPTY_FILTERS)}
                    style={{ fontSize: 11, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear all
                  </button>
                </div>
              )}

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
                        label={STAGE_LABELS[stage] || stage}
                        opportunities={filtered.filter(o => o.stage === stage).map(toCardOpp)}
                        onCardClick={(opp) => showToastMsg(`Detail panel for "${opp.name}" ships in next CCP`, 'success')}
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

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', fontSize: 11, fontWeight: 600,
      background: '#EEF2FF', color: '#4338CA', borderRadius: 12,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#4338CA', padding: 0, lineHeight: 1 }}
      >
        ×
      </button>
    </span>
  )
}
