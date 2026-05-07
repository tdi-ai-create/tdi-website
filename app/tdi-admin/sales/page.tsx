'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSupabase } from '@/lib/supabase'
import { AnalyticsTab } from './components/AnalyticsTab'
import { StickyTopBar } from './components/StickyTopBar'
import { FilterPanel, EMPTY_FILTERS, type ActiveFilters } from './components/FilterPanel'
import { KanbanColumn } from './components/KanbanColumn'
import { SalesCard, type SalesCardOpp } from './components/SalesCard'

type ViewMode = 'kanban' | 'list'
type PageTab = 'pipeline' | 'analytics' | 'trash' | 'invoices'

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
  school_year: string | null
  heat: string | null
  on_jims_call_sheet: boolean | null
  payment_received: boolean | null
  invoice_sent_at: string | null
  deleted_at: string | null
  deleted_by: string | null
  deletion_reason: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
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
  onCallSheet: boolean
  schoolYear: string
  paymentReceived: boolean
  invoiceSentAt: string | null
  deleted_at: string | null
  deleted_by: string | null
  deletion_reason: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
}

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

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 0, engaged: 10, qualified: 30,
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
    onCallSheet: opp.onCallSheet,
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
  const [oppNotes, setOppNotes] = useState<Record<string, { body: string; created_at: string }[]>>({})
  const [quickNoteOppId, setQuickNoteOppId] = useState<string | null>(null)
  const [quickNoteText, setQuickNoteText] = useState('')
  const [savingQuickNote, setSavingQuickNote] = useState(false)

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [showAllStages, setShowAllStages] = useState(true)
  const [showCallSheetOnly, setShowCallSheetOnly] = useState(false)

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
        onCallSheet: row.on_jims_call_sheet || false,
        schoolYear: row.contract_year || row.school_year || '2026-27',
        paymentReceived: row.payment_received || false,
        invoiceSentAt: row.invoice_sent_at,
        deleted_at: row.deleted_at,
        deleted_by: row.deleted_by,
        deletion_reason: row.deletion_reason,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        website: row.website,
      }))

      setOpportunities(mapped)
      setLastSynced(new Date())

      // Load notes
      const { data: notesData } = await supabase
        .from('sales_opportunity_notes')
        .select('opportunity_id, body, created_at')
        .order('created_at', { ascending: false })
      if (notesData) {
        const grouped: Record<string, { body: string; created_at: string }[]> = {}
        notesData.forEach((n: any) => {
          if (!grouped[n.opportunity_id]) grouped[n.opportunity_id] = []
          grouped[n.opportunity_id].push({ body: n.body, created_at: n.created_at })
        })
        setOppNotes(grouped)
      }
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

  // Context menu: soft delete (move to trash)
  async function handleDeleteOpp(opp: Opportunity) {
    setContextMenu(null)
    // Optimistic: mark as deleted locally
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === opp.supabase_id
        ? { ...o, deleted_at: new Date().toISOString(), deleted_by: 'admin', deletion_reason: null }
        : o
    ))

    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update({ deleted_at: new Date().toISOString(), deleted_by: 'admin', updated_at: new Date().toISOString() })
      .eq('id', opp.supabase_id)

    if (updateError) {
      loadAll()
      showToastMsg('Failed to delete deal', 'error')
    } else {
      showToastMsg(`"${opp.name}" moved to Trash`, 'success')
    }
  }

  // Restore from trash
  async function handleRestoreOpp(opp: Opportunity) {
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === opp.supabase_id
        ? { ...o, deleted_at: null, deleted_by: null, deletion_reason: null }
        : o
    ))

    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update({ deleted_at: null, deleted_by: null, deletion_reason: null, updated_at: new Date().toISOString() })
      .eq('id', opp.supabase_id)

    if (updateError) {
      loadAll()
      showToastMsg('Failed to restore deal', 'error')
    } else {
      showToastMsg(`"${opp.name}" restored to pipeline`, 'success')
    }
  }

  // Permanent delete
  async function handlePermanentDelete(opp: Opportunity) {
    if (!confirm(`Permanently delete "${opp.name}"? This cannot be undone.`)) return

    setOpportunities(prev => prev.filter(o => o.supabase_id !== opp.supabase_id))

    const { error: deleteError } = await supabase
      .from('sales_opportunities')
      .delete()
      .eq('id', opp.supabase_id)

    if (deleteError) {
      loadAll()
      showToastMsg('Failed to permanently delete', 'error')
    } else {
      showToastMsg(`"${opp.name}" permanently deleted`, 'success')
    }
  }

  // Mark invoice as paid
  async function handleMarkPaid(opp: Opportunity) {
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === opp.supabase_id
        ? { ...o, paymentReceived: true }
        : o
    ))
    await supabase
      .from('sales_opportunities')
      .update({ payment_received: true, payment_received_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', opp.supabase_id)
    showToastMsg(`"${opp.name}" marked as paid`, 'success')
  }

  // Toggle call sheet flag on an opp
  async function handleToggleCallSheet(oppId: string) {
    const opp = opportunities.find(o => o.supabase_id === oppId)
    if (!opp) return
    const newVal = !opp.onCallSheet
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === oppId ? { ...o, onCallSheet: newVal } : o
    ))
    await supabase
      .from('sales_opportunities')
      .update({ on_jims_call_sheet: newVal, updated_at: new Date().toISOString() })
      .eq('id', oppId)
  }

  // Quick-add note
  async function handleQuickNoteSave() {
    if (!quickNoteOppId || !quickNoteText.trim()) return
    setSavingQuickNote(true)
    const body = quickNoteText.trim()
    const now = new Date().toISOString()

    await supabase.from('opportunity_notes').insert({
      opportunity_id: quickNoteOppId,
      body,
      created_at: now,
      created_by: 'admin',
    })

    // Update local state
    setOppNotes(prev => ({
      ...prev,
      [quickNoteOppId]: [{ body, created_at: now }, ...(prev[quickNoteOppId] || [])],
    }))

    // Update last_activity_at
    await supabase
      .from('sales_opportunities')
      .update({ last_activity_at: now, updated_at: now })
      .eq('id', quickNoteOppId)

    setOpportunities(prev => prev.map(o =>
      o.supabase_id === quickNoteOppId ? { ...o, lastActivityAt: now } : o
    ))

    setSavingQuickNote(false)
    setQuickNoteText('')
    setQuickNoteOppId(null)
    showToastMsg('Note saved', 'success')
  }

  function getLatestNoteForOpp(oppId: string): { body: string; created_at: string } | null {
    return oppNotes[oppId]?.[0] || null
  }

  // Export Jim's list to CSV
  function csvDownload(rows: string[], filename: string) {
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function esc(v: any): string {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  function exportRows(rows: Opportunity[], filename: string) {
    const headers = 'Name,Contact Name,Phone,Email,Website,Stage,Amount,Source,Notes'
    const csvRows = [
      headers,
      ...rows.map(o => [
        esc(o.name),
        esc(o.contactName),
        esc(o.contactPhone),
        esc(o.contactEmail),
        esc(o.website),
        esc(o.stageName),
        o.value ? `$${o.value.toLocaleString()}` : '',
        esc(o.source),
        esc((o.notes || '').replace(/\n/g, ' ').slice(0, 300)),
      ].join(','))
    ]
    csvDownload(csvRows, filename)
  }

  function handleExportJimsList() {
    const rows = activeOpps
      .filter(o => !o.deleted_at && o.onCallSheet)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    exportRows(rows, `jims-call-list-${new Date().toISOString().split('T')[0]}.csv`)
    showToastMsg(`Exported ${rows.length} Jim's list deals to CSV`, 'success')
  }

  // Export all active pipeline to CSV
  function handleExport() {
    const rows = activeOpps
      .filter(o => !o.deleted_at)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    exportRows(rows, `tdi-pipeline-${new Date().toISOString().split('T')[0]}.csv`)
    showToastMsg(`Exported ${rows.length} deals to CSV`, 'success')
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

  // Handle inline field edit from SalesCard
  function handleFieldSaved(oppId: string, field: string, newValue: any) {
    setOpportunities(prev => prev.map(o => {
      if (o.supabase_id !== oppId) return o
      const updated = { ...o }
      if (field === 'value') updated.value = newValue
      else if (field === 'heat') updated.heat = newValue
      else if (field === 'notes') updated.notes = newValue
      else if (field === 'source') updated.source = newValue
      else if (field === 'stage') {
        updated.stage = newValue
        updated.stageName = STAGE_DISPLAY[newValue] || newValue
        updated.probability = STAGE_PROBABILITY[newValue] ?? updated.probability
      }
      return updated
    }))
  }

  // Active opps: 26-27 only, exclude contact-only, paid, lost, deleted
  const activeOpps = useMemo(() =>
    opportunities.filter(o =>
      !o.isContactOnly && !['lost', 'paid'].includes(o.stage) && !o.deleted_at
      && o.schoolYear === '2026-27'
    ),
    [opportunities]
  )

  // Trashed opps
  const trashedOpps = useMemo(() =>
    opportunities.filter(o => o.deleted_at),
    [opportunities]
  )

  // Outstanding invoices: prior year, unpaid
  const outstandingInvoices = useMemo(() =>
    opportunities.filter(o =>
      !o.deleted_at
      && o.schoolYear !== '2026-27'
      && !o.paymentReceived
      && (o.needs_invoice || (o.invoice_amount && o.invoice_amount > 0) || o.stage === 'paid')
    ),
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
      if (showCallSheetOnly && !opp.onCallSheet) return false
      return true
    })
  }, [activeOpps, activeFilters, showCallSheetOnly])

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
    const callSheetOpps = activeOpps.filter(o => o.onCallSheet)
    return {
      totalPipeline: activeOpps.reduce((s, o) => s + (o.value ?? 0), 0),
      activeCount: activeOpps.length,
      hotCount: activeOpps.filter(o => o.heat === 'hot').length,
      invoiceCount: opportunities.filter(o => o.needs_invoice && !o.deleted_at).length,
      callSheetCount: callSheetOpps.length,
      callSheetValue: callSheetOpps.reduce((s, o) => s + (o.value ?? 0), 0),
    }
  }, [activeOpps, opportunities])

  const stagesToShow = showAllStages ? ALL_ACTIVE_STAGES : DEFAULT_KANBAN_STAGES

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2B3A67', margin: 0, fontFamily: "'Source Serif 4', Georgia, serif" }}>Sales</h1>
          {lastSynced && (
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              Last loaded {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadAll} style={{ fontSize: 12, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>
            Refresh
          </button>
          <div style={{ display: 'flex', background: '#ECFDF5', borderRadius: 8, padding: 2 }}>
            {(['list', 'kanban'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                  border: 'none', cursor: 'pointer',
                  background: view === v ? 'white' : 'transparent',
                  color: view === v ? '#047857' : '#6B7280',
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
        {([
          { id: 'pipeline' as PageTab, label: 'Pipeline' },
          { id: 'analytics' as PageTab, label: 'Analytics' },
          ...(outstandingInvoices.length > 0 ? [{ id: 'invoices' as PageTab, label: `Outstanding Invoices (${outstandingInvoices.length})` }] : []),
          ...(trashedOpps.length > 0 ? [{ id: 'trash' as PageTab, label: `Trash (${trashedOpps.length})` }] : []),
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setPageTab(tab.id)}
            style={{
              padding: '12px 24px', fontSize: 14, background: 'transparent', border: 'none',
              fontWeight: pageTab === tab.id ? 700 : 500,
              color: pageTab === tab.id ? '#0a0f1e' : '#6B7280',
              borderBottom: pageTab === tab.id ? '2px solid #10B981' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {pageTab === 'analytics' && <AnalyticsTab opportunities={activeOpps.map(o => ({ value: o.value, probability: o.probability, stage: o.stage, name: o.name }))} />}

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
                onExport={handleExport}
                onExportJimsList={handleExportJimsList}
                showCallSheetOnly={showCallSheetOnly}
                onToggleCallSheet={() => setShowCallSheetOnly(!showCallSheetOnly)}
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
                        onFieldSaved={handleFieldSaved}
                        onToggleCallSheet={handleToggleCallSheet}
                        onAddNote={(oppId) => setQuickNoteOppId(oppId)}
                        getNoteForOpp={getLatestNoteForOpp}
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
                          onFieldSaved={handleFieldSaved}
                          onToggleCallSheet={handleToggleCallSheet}
                          onAddNote={(oppId) => setQuickNoteOppId(oppId)}
                          latestNote={getLatestNoteForOpp(opp.supabase_id)}
                        />
                      ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Outstanding Invoices Tab */}
      {pageTab === 'invoices' && (
        <div>
          {(() => {
            const totalOwed = outstandingInvoices.reduce((s, o) => s + (o.invoice_amount || o.value || 0), 0)
            return (
              <>
                <div style={{
                  background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12,
                  padding: '16px 20px', marginBottom: 20,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#854D0E' }}>
                    {outstandingInvoices.length} invoices outstanding · ${totalOwed.toLocaleString('en-US', { minimumFractionDigits: 0 })} total
                  </div>
                  <div style={{ fontSize: 12, color: '#854D0E', opacity: 0.85, marginTop: 4 }}>
                    Prior-year contracts where payment has not yet been received. These do NOT count toward current 26-27 pipeline.
                  </div>
                </div>

                {outstandingInvoices.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>No outstanding invoices.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {outstandingInvoices.map(opp => {
                      const amount = opp.invoice_amount || opp.value || 0
                      const daysOutstanding = opp.invoiceSentAt
                        ? Math.floor((Date.now() - new Date(opp.invoiceSentAt).getTime()) / 86400000)
                        : null
                      return (
                        <div key={opp.supabase_id} style={{
                          background: 'white', border: '1px solid #E5E7EB',
                          borderLeft: '4px solid #F59E0B', borderRadius: 10, padding: '14px 18px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{opp.name}</div>
                              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                                {opp.schoolYear}
                                {opp.invoiceSentAt && ` · Invoice sent ${new Date(opp.invoiceSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                {daysOutstanding !== null && ` · ${daysOutstanding} days outstanding`}
                              </div>
                              {opp.notes && (
                                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6, fontStyle: 'italic' }}>
                                  {opp.notes.length > 200 ? opp.notes.slice(0, 197) + '...' : opp.notes}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', minWidth: 120 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>
                                ${amount.toLocaleString()}
                              </div>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                background: '#FEE2E2', color: '#991B1B',
                              }}>
                                UNPAID
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                              onClick={() => handleMarkPaid(opp)}
                              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #10B981', background: 'white', color: '#10B981', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Mark paid
                            </button>
                            <button
                              onClick={() => handleDeleteOpp(opp)}
                              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', color: '#6B7280', cursor: 'pointer' }}
                            >
                              Move to Trash
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Trash Tab */}
      {pageTab === 'trash' && (
        <div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, fontStyle: 'italic' }}>
            Items in Trash are hidden from the pipeline but can be restored.
          </div>
          {trashedOpps.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Trash is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trashedOpps.map(opp => (
                <div key={opp.supabase_id} style={{
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
                  padding: '14px 18px', opacity: 0.7,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0f1e' }}>{opp.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {opp.value ? `$${opp.value.toLocaleString()}` : '-'}
                      {opp.deleted_by && ` · Deleted by ${opp.deleted_by}`}
                      {opp.deleted_at && ` on ${new Date(opp.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      {opp.deletion_reason && ` · ${opp.deletion_reason}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleRestoreOpp(opp)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #10B981', background: 'white', color: '#10B981', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(opp)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #EF4444', background: 'white', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Delete forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {/* Quick-add note modal */}
      {quickNoteOppId && (
        <>
          <div onClick={() => { setQuickNoteOppId(null); setQuickNoteText('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 150 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)', zIndex: 151,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0f1e', marginBottom: 4 }}>Add Note</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
              {opportunities.find(o => o.supabase_id === quickNoteOppId)?.name || ''}
            </div>
            {/* Show recent notes */}
            {oppNotes[quickNoteOppId] && oppNotes[quickNoteOppId].length > 0 && (
              <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 12, padding: 8, background: '#F9FAFB', borderRadius: 8 }}>
                {oppNotes[quickNoteOppId].slice(0, 3).map((n, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                    <span style={{ color: '#374151' }}>{n.body}</span>
                    <span style={{ marginLeft: 6, color: '#9CA3AF' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              placeholder="Type a note... (e.g. 'called - left voicemail')"
              autoFocus
              rows={3}
              style={{
                width: '100%', padding: 10, border: '1.5px solid #D1D5DB', borderRadius: 8,
                fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickNoteSave() }
                if (e.key === 'Escape') { setQuickNoteOppId(null); setQuickNoteText('') }
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => { setQuickNoteOppId(null); setQuickNoteText('') }}
                style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={handleQuickNoteSave}
                disabled={savingQuickNote || !quickNoteText.trim()}
                style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: savingQuickNote || !quickNoteText.trim() ? 0.5 : 1 }}
              >
                {savingQuickNote ? 'Saving...' : 'Save Note'}
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

