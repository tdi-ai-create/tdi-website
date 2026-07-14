'use client'
// v2 - sales intelligence with fit scoring
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { AnalyticsTab } from './components/AnalyticsTab'
import { StickyTopBar } from './components/StickyTopBar'
import { FilterPanel, EMPTY_FILTERS, type ActiveFilters } from './components/FilterPanel'
import { KanbanColumn } from './components/KanbanColumn'
import { SalesCard, type SalesCardOpp } from './components/SalesCard'
import AddLeadModal from '@/components/sales/AddLeadModal'
import { generateOutreachEmail } from '@/lib/salesEmailTemplates'
import * as XLSX from 'xlsx'
import { OpportunityDetailPanel, type FullOpportunity } from './components/OpportunityDetailPanel'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_STAT_VALUE,
  TYPE_CARD_TITLE,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens'
import { HorizontalBarChart, DonutChart, DonutLegend, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts'

type ViewMode = 'kanban' | 'list'
type PageTab = 'pipeline' | 'outreach' | 'analytics' | 'contracts' | 'hub-leads' | 'trash' | 'invoices'

interface QuoteRow {
  id: string
  quote_number: string
  title: string
  contact_name: string | null
  contact_email: string | null
  contact_organization: string | null
  status: string
  sent_at: string | null
  viewed_at: string | null
  view_count: number
  signed_by_name: string | null
  signed_at: string | null
  expires_at: string | null
  created_at: string
  quote_packages: { total_amount: number; package_name: string }[]
}

interface QuoteLineItem {
  label: string
  quantity: number
  unit_price: number
  total: number
  is_complimentary: boolean
}

interface QuoteFormData {
  id?: string
  title: string
  contact_name: string
  contact_email: string
  contact_organization: string
  intro_message: string
  service_start_date: string
  service_end_date: string
  payment_instructions: string
  package_name: string
  line_items: QuoteLineItem[]
}

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
  grant_support: boolean | null
  deleted_at: string | null
  deleted_by: string | null
  deletion_reason: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
  // AI enrichment fields (migration 063)
  lead_score: number | null
  score_breakdown: { fit?: number; pain?: number; funding?: number; warmth?: number } | null
  enrichment_data: Record<string, any> | null
  ai_strategic_brief: string | null
  enrichment_status: string | null
  enriched_at: string | null
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
  grantSupport: boolean
  deleted_at: string | null
  deleted_by: string | null
  deletion_reason: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
  city: string | null
  state: string | null
  // AI enrichment
  leadScore: number | null
  scoreBreakdown: { fit?: number; pain?: number; funding?: number; warmth?: number } | null
  enrichmentData: Record<string, any> | null
  strategicBrief: string | null
  enrichmentStatus: string | null
  enrichedAt: string | null
  tier: 'T1' | 'T2' | 'T3' | null
}

const STAGE_DISPLAY: Record<string, string> = {
  unassigned: 'Unassigned',
  targeting: 'Targeting (5%)',
  engaged: 'Engaged (20%)',
  qualified: 'Qualified (45%)',
  likely_yes: 'Likely Yes (65%)',
  proposal_sent: 'Quote Sent (80%)',
  signed: 'Signed (95%)',
  paid: 'Paid (100%)',
  lost: 'Lost',
}

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 5, engaged: 20, qualified: 45,
  likely_yes: 65, proposal_sent: 80, signed: 95, signed_no_grant: 95, signed_with_grant: 90, paid: 100, lost: 0,
}

const STAGE_LABELS: Record<string, string> = {
  targeting: 'Targeting',
  engaged: 'Engaged',
  qualified: 'Qualified',
  likely_yes: 'Likely Yes',
  proposal_sent: 'Quote Sent',
  signed: 'Signed',
  signed_no_grant: 'Signed (w/o Grant Support)',
  signed_with_grant: 'Signed (w/ Grant)',
  paid: 'Won',
}

const DEFAULT_KANBAN_STAGES = ['qualified', 'likely_yes', 'proposal_sent']
const ALL_ACTIVE_STAGES = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed_with_grant', 'signed_no_grant', 'paid']

function factoredRevenue(opp: Opportunity): number {
  return Math.round((opp.value || 0) * opp.probability / 100)
}

// Normalize school year to abbreviated format: '2026-2027' → '2026-27'
function normalizeSchoolYear(value: string | null | undefined): string {
  if (!value) return '2026-27'
  const match = value.match(/^(\d{4})-(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2].slice(2)}`
  }
  return value
}

function formatCurrencyFull(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function computeTier(leadScore: unknown): 'T1' | 'T2' | 'T3' | null {
  const score = typeof leadScore === 'number' ? leadScore : typeof leadScore === 'string' ? parseInt(leadScore) : null
  if (score == null || isNaN(score)) return null
  if (score >= 70) return 'T1'
  if (score >= 40) return 'T2'
  return 'T3'
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
    city: opp.city,
    state: opp.state,
    leadScore: opp.leadScore,
    tier: opp.tier,
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

  // Hub leads data
  const [hubLeads, setHubLeads] = useState<{
    warmLeads: { domain: string; freeUsers: number; school: string; district: string; state: string; sampleEmails: string[] }[];
    topDistricts: { name: string; paid: number; free: number; total: number; state: string }[];
    recentSignups: number;
    totalFreeUsers: number;
  } | null>(null)
  const [hubLeadsLoading, setHubLeadsLoading] = useState(false)

  // Read search param for cross-portal linking (e.g. from Leadership -> Sales)
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ ...EMPTY_FILTERS, search: initialSearch })
  const [showAllStages, setShowAllStages] = useState(true)
  const [showCallSheetOnly, setShowCallSheetOnly] = useState(false)

  // Add Lead modal state
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false)
  const [batchEnriching, setBatchEnriching] = useState(false)
  const [enrichProgress, setEnrichProgress] = useState('')
  const [detailPanelOppId, setDetailPanelOppId] = useState<string | null>(null)

  // Contracts/quotes state
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null)
  const [contractModalOpen, setContractModalOpen] = useState(false)
  const [contractForm, setContractForm] = useState<QuoteFormData>({
    title: '', contact_name: '', contact_email: '', contact_organization: '',
    intro_message: '', service_start_date: '2026-08-15', service_end_date: '2027-06-30',
    payment_instructions: 'NO PAYMENT DUE UNLESS GRANT IS AWARDED.\nIf grant funding is secured, TDI will invoice the funding source directly or coordinate payment through the district as appropriate.\nClient owes nothing out of pocket.',
    package_name: 'Grant-Funded Services', line_items: [{ label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }],
  })
  const [savingContract, setSavingContract] = useState(false)

  async function loadQuotes() {
    setQuotesLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select('id, quote_number, title, contact_name, contact_email, contact_organization, status, sent_at, viewed_at, view_count, signed_by_name, signed_at, expires_at, created_at, quote_packages(total_amount, package_name)')
      .order('created_at', { ascending: false })
    setQuotes((data as QuoteRow[]) || [])
    setQuotesLoading(false)
  }

  async function saveContract() {
    setSavingContract(true)
    try {
      const total = contractForm.line_items.reduce((s, li) => s + li.total, 0)
      const isEdit = !!contractForm.id

      if (isEdit) {
        // Update existing quote
        await supabase.from('quotes').update({
          title: contractForm.title,
          contact_name: contractForm.contact_name,
          contact_email: contractForm.contact_email,
          contact_organization: contractForm.contact_organization,
          intro_message: contractForm.intro_message,
          service_start_date: contractForm.service_start_date,
          service_end_date: contractForm.service_end_date,
          payment_instructions: contractForm.payment_instructions,
        }).eq('id', contractForm.id)

        // Delete old packages and recreate
        await supabase.from('quote_packages').delete().eq('quote_id', contractForm.id)
        await supabase.from('quote_packages').insert({
          quote_id: contractForm.id,
          package_index: 0,
          package_name: contractForm.package_name,
          total_amount: total,
          is_recommended: true,
          line_items: contractForm.line_items,
        })
      } else {
        // Create district first
        const { data: district } = await supabase.from('districts').insert({
          name: contractForm.contact_organization || contractForm.title,
          status: 'prospect',
        }).select().single()

        if (!district) throw new Error('Failed to create district')

        // Generate quote number
        const qNum = `TDI-Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`

        // Create quote
        const { data: quote } = await supabase.from('quotes').insert({
          district_id: district.id,
          quote_number: qNum,
          title: contractForm.title,
          contact_name: contractForm.contact_name,
          contact_email: contractForm.contact_email,
          contact_organization: contractForm.contact_organization,
          intro_message: contractForm.intro_message,
          service_start_date: contractForm.service_start_date,
          service_end_date: contractForm.service_end_date,
          payment_instructions: contractForm.payment_instructions,
          terms_of_service: 'This Grant Funding Services Agreement ("Agreement") is between Teachers Deserve It ("TDI") and the undersigned school or district ("Client").\n\n1. SCOPE: TDI will research, identify, and prepare grant applications and funding narratives on behalf of Client to secure funding for the professional development services outlined in this agreement.\n\n2. NO COST UNLESS FUNDED: Client is not obligated to pay any amount listed in this agreement unless and until grant funding is awarded and received. If no grant funding is secured, Client owes nothing.\n\n3. TDI RESPONSIBILITIES: TDI will identify applicable funding sources, draft grant narratives and supporting documents, prepare submission-ready packets, and provide pre-written forwarding emails for Client to submit.\n\n4. CLIENT RESPONSIBILITIES: Client agrees to forward pre-written emails to appropriate district or funding contacts as directed by TDI, provide school/district information as needed (EIN, enrollment data, etc.), and respond to TDI communications in a timely manner.\n\n5. SERVICES: Upon successful funding, TDI will deliver the professional development services listed in this agreement during the specified service period.\n\n6. TERM: This agreement is valid for the 2026-27 school year unless otherwise noted.\n\n7. CONFIDENTIALITY: Both parties agree to keep the terms of this agreement confidential.',
          status: 'sent',
          sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).select().single()

        if (!quote) throw new Error('Failed to create quote')

        // Create package
        await supabase.from('quote_packages').insert({
          quote_id: quote.id,
          package_index: 0,
          package_name: contractForm.package_name,
          total_amount: total,
          is_recommended: true,
          line_items: contractForm.line_items,
        })
      }

      setContractModalOpen(false)
      loadQuotes()
    } catch (err) {
      console.error('Save contract error:', err)
    }
    setSavingContract(false)
  }

  function openEditContract(q: QuoteRow) {
    const pkg = q.quote_packages?.[0]
    setContractForm({
      id: q.id,
      title: q.title,
      contact_name: q.contact_name || '',
      contact_email: q.contact_email || '',
      contact_organization: q.contact_organization || '',
      intro_message: '',
      service_start_date: '2026-08-15',
      service_end_date: '2027-06-30',
      payment_instructions: '',
      package_name: pkg?.package_name || 'Grant-Funded Services',
      line_items: [{ label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }],
    })
    // Load full quote + package data including line_items
    Promise.all([
      supabase.from('quotes').select('intro_message, payment_instructions, service_start_date, service_end_date').eq('id', q.id).single(),
      supabase.from('quote_packages').select('package_name, line_items, total_amount').eq('quote_id', q.id).order('package_index').limit(1).single(),
    ]).then(([{ data: quoteData }, { data: pkgData }]) => {
      setContractForm(prev => ({
        ...prev,
        intro_message: quoteData?.intro_message || '',
        payment_instructions: quoteData?.payment_instructions || '',
        service_start_date: quoteData?.service_start_date || '2026-08-15',
        service_end_date: quoteData?.service_end_date || '2027-06-30',
        package_name: pkgData?.package_name || prev.package_name,
        line_items: (pkgData?.line_items as QuoteLineItem[] | null)?.length
          ? (pkgData!.line_items as QuoteLineItem[])
          : [{ label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }],
      }))
    })
    setContractModalOpen(true)
  }

  function openNewContract() {
    setContractForm({
      title: '', contact_name: '', contact_email: '', contact_organization: '',
      intro_message: '', service_start_date: '2026-08-15', service_end_date: '2027-06-30',
      payment_instructions: 'NO PAYMENT DUE UNLESS GRANT IS AWARDED.\nIf grant funding is secured, TDI will invoice the funding source directly or coordinate payment through the district as appropriate.\nClient owes nothing out of pocket.',
      package_name: 'Grant-Funded Services', line_items: [{ label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }],
    })
    setContractModalOpen(true)
  }

  useEffect(() => {
    loadAll()
    loadQuotes()
  }, [])

  // Realtime: refresh when enrichment completes on any lead
  useEffect(() => {
    const channel = supabase
      .channel('leads-enrichment-updates')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sales_opportunities',
        },
        (payload: any) => {
          if (payload.new?.enrichment_status === 'complete' || payload.new?.enrichment_status === 'failed') {
            loadAll()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

      const mapped: Opportunity[] = (data || []).map((row: SalesOpportunity) => {
        try { return {
        id: row.ghl_opportunity_id || row.id,
        supabase_id: row.id,
        ghl_id: row.ghl_opportunity_id,
        name: row.name || 'Unnamed',
        stage: row.stage,
        stageName: STAGE_DISPLAY[row.stage] || row.stage,
        value: row.value,
        type: row.type,
        assignedTo: row.assigned_to_email,
        isRenewal: row.type === 'renewal' || (row.name || '').toLowerCase().includes('renewal'),
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
        grantSupport: row.grant_support || false,
        onCallSheet: row.on_jims_call_sheet || false,
        schoolYear: normalizeSchoolYear(row.contract_year || row.school_year),
        paymentReceived: row.payment_received || false,
        invoiceSentAt: row.invoice_sent_at,
        deleted_at: row.deleted_at,
        deleted_by: row.deleted_by,
        deletion_reason: row.deletion_reason,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        website: row.website,
        city: row.city,
        state: row.state,
        leadScore: row.lead_score,
        scoreBreakdown: row.score_breakdown,
        enrichmentData: row.enrichment_data,
        strategicBrief: row.ai_strategic_brief,
        enrichmentStatus: row.enrichment_status,
        enrichedAt: row.enriched_at,
        tier: computeTier(row.lead_score),
      } } catch (e) { console.error('Failed to map opportunity:', row.id, e); return null } }).filter(Boolean) as Opportunity[]

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
    if (!opp) return

    // Handle virtual signed columns
    let actualStage = toStage
    let grantSupport: boolean | undefined = undefined
    if (toStage === 'signed_no_grant') {
      actualStage = 'signed'
      grantSupport = false
    } else if (toStage === 'signed_with_grant') {
      actualStage = 'signed'
      grantSupport = true
    }

    if (opp.stage === actualStage && grantSupport === undefined) return
    if (opp.stage === actualStage && opp.grantSupport === grantSupport) return

    const newProb = STAGE_PROBABILITY[toStage] ?? opp.probability
    const oldStage = opp.stage
    const oldGrantSupport = opp.grantSupport

    // Optimistic update
    setOpportunities(prev => prev.map(o =>
      o.supabase_id === oppId
        ? { ...o, stage: actualStage, stageName: STAGE_DISPLAY[actualStage] || actualStage, probability: newProb, ...(grantSupport !== undefined ? { grantSupport } : {}) }
        : o
    ))

    const updatePayload: any = { stage: actualStage, probability: newProb, updated_at: new Date().toISOString() }
    if (grantSupport !== undefined) updatePayload.grant_support = grantSupport

    const { error: updateError } = await supabase
      .from('sales_opportunities')
      .update(updatePayload)
      .eq('id', oppId)

    if (updateError) {
      // Revert
      setOpportunities(prev => prev.map(o =>
        o.supabase_id === oppId
          ? { ...o, stage: oldStage, stageName: STAGE_DISPLAY[oldStage] || oldStage, probability: STAGE_PROBABILITY[oldStage] ?? opp.probability, grantSupport: oldGrantSupport }
          : o
      ))
      showToastMsg('Failed to update stage', 'error')
    } else {
      showToastMsg(`Moved to ${STAGE_LABELS[toStage] || STAGE_DISPLAY[actualStage] || actualStage}`, 'success')
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

    // Mirror note to sibling signed opportunities (same school, split grant/non-grant)
    const thisOpp = opportunities.find(o => o.supabase_id === quickNoteOppId)
    if (thisOpp?.stage === 'signed') {
      const baseName = thisOpp.name
        .replace(/\s*-\s*(grant funded|non-grant)$/i, '')
        .replace(/^\(renewal\)\s*/i, '')
        .trim()
      const siblings = opportunities.filter(o =>
        o.supabase_id !== quickNoteOppId &&
        o.stage === 'signed' &&
        o.name.toLowerCase().includes(baseName.toLowerCase())
      )
      if (siblings.length) {
        const mirrorInserts = siblings.map(s => ({
          opportunity_id: s.supabase_id,
          body: `[Mirrored] ${body}`,
          created_at: now,
          created_by: 'admin',
        }))
        await supabase.from('opportunity_notes').insert(mirrorInserts)
        // Update local note state for siblings
        setOppNotes(prev => {
          const updated = { ...prev }
          siblings.forEach(s => {
            updated[s.supabase_id] = [{ body: `[Mirrored] ${body}`, created_at: now }, ...(prev[s.supabase_id] || [])]
          })
          return updated
        })
      }
    }

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

  // --- Spreadsheet export helpers ---

  function exportToSheet(rows: Opportunity[], filename: string, sheetName: string, isJimsList: boolean) {
    let data: Record<string, string | number | null>[];
    let colWidths: Record<string, number>;

    if (isJimsList) {
      // Jim's call sheet format -- matches his Google Sheet exactly
      data = rows.map(o => ({
        'District / School': (o.name || '').replace(/\s*\([A-Z]{2}\)\s*-\s*PD Plan Inquiry\s*$/i, '').replace(/\s*\([A-Z]{2}\)\s*-\s*Nomination\s*$/i, '').replace(/\s*-\s*PD Plan Inquiry\s*$/i, '').replace(/\s*-\s*Nomination\s*$/i, '').trim(),
        'Contact Name': o.contactName || '',
        'Contact Email': o.contactEmail || '',
        'Phone': o.contactPhone || '',
        'State': o.state || '',
        'Source': o.source || '',
        'Contact Date &Subject': (o.notes || '').replace(/\n/g, ' '),
      }))
      colWidths = {
        'District / School': 40,
        'Contact Name': 22,
        'Contact Email': 30,
        'Phone': 18,
        'State': 7,
        'Source': 28,
        'Contact Date &Subject': 60,
      }
    } else {
      // Full export with all fields
      data = rows.map(o => ({
        'District / School': o.name || '',
        'Contact Name': o.contactName || '',
        'Contact Email': o.contactEmail || '',
        'Phone': o.contactPhone || '',
        'City': o.city || '',
        'State': o.state || '',
        'Stage': o.stageName || '',
        'Deal Value': o.value ?? '',
        'Heat': o.heat ? o.heat.charAt(0).toUpperCase() + o.heat.slice(1) : '',
        'Source': o.source || '',
        'Deal Type': o.type === 'new_business' ? 'New Business' : o.type === 'renewal' ? 'Renewal' : o.type || '',
        'Website': o.website || '',
        'School Year': o.schoolYear || '',
        'Notes': (o.notes || '').replace(/\n/g, ' '),
      }))
      colWidths = {
        'District / School': 35,
        'Contact Name': 22,
        'Contact Email': 30,
        'Phone': 18,
        'City': 16,
        'State': 7,
        'Stage': 20,
        'Deal Value': 12,
        'Heat': 8,
        'Source': 28,
        'Deal Type': 14,
        'Website': 35,
        'School Year': 12,
        'Notes': 60,
      }
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const headers = Object.keys(data[0] || {})
    ws['!cols'] = headers.map(h => ({ wch: colWidths[h] || 15 }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename)
  }

  function handleExportJimsList() {
    const rows = activeOpps
      .filter(o => !o.deleted_at && o.onCallSheet)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    exportToSheet(rows, `jims-call-list-${new Date().toISOString().split('T')[0]}.xlsx`, "Jim's Call List", true)
    showToastMsg(`Exported ${rows.length} Jim's list deals`, 'success')
  }

  function handleExport() {
    const rows = activeOpps
      .filter(o => !o.deleted_at)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    exportToSheet(rows, `tdi-pipeline-${new Date().toISOString().split('T')[0]}.xlsx`, 'Pipeline', false)
    showToastMsg(`Exported ${rows.length} deals`, 'success')
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
      if (f.search) {
        const q = f.search.toLowerCase()
        const searchable = [opp.name, opp.contactName, opp.contactEmail, opp.city, opp.state, opp.notes].filter(Boolean).join(' ').toLowerCase()
        if (!searchable.includes(q)) return false
      }
      if (f.deal_types.length > 0 && !f.deal_types.includes(opp.type)) return false
      if (f.sources.length > 0 && !f.sources.includes(opp.source || 'Other')) return false
      if (f.tiers.length > 0) {
        const oppTier = opp.tier || 'unscored'
        if (!f.tiers.includes(oppTier)) return false
      }
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

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeOpps.forEach(o => {
      const t = o.tier || 'unscored'
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [activeOpps])

  // Stats for sticky top bar (exclude Targeting from pipeline totals — cold outbound, 5% probability)
  const stats = useMemo(() => {
    const pipelineOpps = activeOpps.filter(o => o.stage !== 'targeting')
    const callSheetOpps = activeOpps.filter(o => o.onCallSheet)
    return {
      totalPipeline: pipelineOpps.reduce((s, o) => s + (o.value ?? 0), 0),
      activeCount: pipelineOpps.length,
      hotCount: pipelineOpps.filter(o => o.heat === 'hot').length,
      invoiceCount: opportunities.filter(o => o.needs_invoice && !o.deleted_at).length,
      callSheetCount: callSheetOpps.length,
      callSheetValue: callSheetOpps.reduce((s, o) => s + (o.value ?? 0), 0),
      tier1Count: pipelineOpps.filter(o => o.tier === 'T1').length,
    }
  }, [activeOpps, opportunities])

  const stagesToShow = showAllStages ? ALL_ACTIVE_STAGES : DEFAULT_KANBAN_STAGES

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Sales</h1>
          {lastSynced && (
            <p style={{ ...TYPE_SMALL, margin: '4px 0 0' }}>
              Last loaded {lastSynced.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadAll} style={{ fontSize: 12, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>
            Refresh
          </button>
          <button
            onClick={async () => {
              showToastMsg('Syncing contacts from GHL...', 'success')
              try {
                const res = await fetch('/api/ghl/sync-contacts', { method: 'POST' })
                const data = await res.json()
                if (data.success) {
                  showToastMsg(`Synced ${data.updated} contacts from GHL`, 'success')
                  loadAll()
                } else {
                  showToastMsg(data.error || 'Sync failed', 'error')
                }
              } catch { showToastMsg('Sync failed', 'error') }
            }}
            style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sync Contacts
          </button>
          <button
            disabled={batchEnriching}
            onClick={async () => {
              const unscored = opportunities.filter(o => !o.deleted_at && !o.leadScore && o.stage !== 'lost' && o.stage !== 'paid')
              if (unscored.length === 0) {
                showToastMsg('All active leads already have scores', 'success')
                return
              }
              setBatchEnriching(true)
              const batch = unscored.slice(0, 20)
              setEnrichProgress(`0/${batch.length}`)
              let done = 0
              // Process in parallel batches of 5 for speed
              for (let i = 0; i < batch.length; i += 5) {
                const chunk = batch.slice(i, i + 5)
                await Promise.allSettled(chunk.map(opp =>
                  fetch('/api/leads/enrich', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_id: opp.supabase_id }),
                  }).catch(() => {})
                ))
                done += chunk.length
                setEnrichProgress(`${done}/${batch.length}`)
                loadAll() // refresh after each batch
              }
              showToastMsg(`Enrichment complete for ${done} leads.`, 'success')
              setBatchEnriching(false)
              setEnrichProgress('')
              loadAll()
            }}
            style={{
              fontSize: 11, fontWeight: 600, cursor: batchEnriching ? 'wait' : 'pointer',
              background: batchEnriching ? '#E5E7EB' : '#EEF2FF', color: batchEnriching ? '#9CA3AF' : '#4F46E5',
              border: '1px solid ' + (batchEnriching ? '#D1D5DB' : '#C7D2FE'),
              borderRadius: 6, padding: '4px 10px',
            }}
          >
            {batchEnriching ? `Enriching ${enrichProgress}...` : 'Enrich All'}
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
          { id: 'outreach' as PageTab, label: 'Outreach Queue' },
          { id: 'analytics' as PageTab, label: 'Analytics' },
          { id: 'contracts' as PageTab, label: `Contracts (${quotes.length})${outstandingInvoices.length > 0 ? ` \u00b7 ${outstandingInvoices.length} unpaid` : ''}` },
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

      {/* Outreach Queue Tab */}
      {pageTab === 'outreach' && (() => {
        const now = Date.now()
        const staleLeads = activeOpps
          .filter(o => !o.deleted_at && o.stage !== 'lost' && o.stage !== 'paid' && o.contactEmail)
          .map(o => {
            const daysSince = o.lastActivityAt ? Math.floor((now - new Date(o.lastActivityAt).getTime()) / 86400000) : 999
            const tierWeight = o.tier === 'T1' ? 30 : o.tier === 'T2' ? 20 : 10
            const priority = tierWeight + Math.min(daysSince, 60) + Math.min((o.value || 0) / 5000, 10)
            let action = 'Initial outreach'
            if (daysSince < 7) action = 'Follow up if no response'
            else if (daysSince < 14) action = 'Follow-up email -- been a week'
            else if (daysSince < 30) action = 'Re-engagement needed'
            else if (daysSince >= 30) action = 'Dormant -- re-engage or archive'
            if (!o.lastActivityAt) action = 'No contact yet -- initial outreach'
            return { ...o, daysSince, priority, action, needsOutreach: daysSince >= 14 || !o.lastActivityAt }
          })
          .filter(o => o.needsOutreach)
          .sort((a, b) => b.priority - a.priority)

        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a0f1e', margin: 0 }}>Outreach Queue</h2>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{staleLeads.length} leads needing outreach -- sorted by priority (tier + staleness + value)</p>
              </div>
            </div>
            {staleLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>All leads are contacted. Nice work.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {staleLeads.slice(0, 30).map(lead => (
                  <div
                    key={lead.supabase_id}
                    onClick={() => setDetailPanelOppId(lead.supabase_id)}
                    style={{
                      background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 16px',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderLeft: `3px solid ${lead.tier === 'T1' ? '#10B981' : lead.tier === 'T2' ? '#F59E0B' : '#D1D5DB'}`,
                      transition: 'border-color 0.1s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#0a0f1e' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0f1e' }}>{lead.name}</span>
                        {lead.tier && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: lead.tier === 'T1' ? '#D1FAE5' : lead.tier === 'T2' ? '#FEF3C7' : '#F3F4F6', color: lead.tier === 'T1' ? '#065F46' : lead.tier === 'T2' ? '#854D0E' : '#374151' }}>{lead.tier}</span>
                        )}
                        {lead.value && <span style={{ fontSize: 11, color: '#6B7280' }}>${(lead.value / 1000).toFixed(0)}K</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {lead.contactName || 'No contact'} {lead.contactEmail ? `-- ${lead.contactEmail}` : ''} {lead.state ? `(${lead.state})` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: lead.daysSince >= 30 ? '#EF4444' : lead.daysSince >= 14 ? '#F59E0B' : '#6B7280' }}>
                          {lead.daysSince === 999 ? 'Never contacted' : `${lead.daysSince}d ago`}
                        </div>
                        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{lead.action}</div>
                      </div>
                      {lead.contactEmail && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const templateType = lead.daysSince >= 30 ? 're_engagement' as const : lead.daysSince >= 14 ? 'follow_up' as const : 'initial' as const
                            const email = generateOutreachEmail({
                              name: lead.name,
                              contactName: lead.contactName,
                              state: lead.state,
                              city: lead.city,
                              tier: lead.tier,
                            }, templateType)
                            const mailto = `mailto:${lead.contactEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
                            window.open(mailto, '_blank')
                            // Auto-log the outreach
                            fetch(`/api/sales/opportunities/${lead.supabase_id}/notes`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                note_text: `Drafted ${templateType} email to ${lead.contactEmail}: "${email.subject}"`,
                                note_type: 'email',
                              }),
                            }).catch(() => {})
                          }}
                          style={{
                            fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                            background: '#4F46E5', color: 'white', border: 'none', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Draft Email
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

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
                onAddLead={() => setAddLeadModalOpen(true)}
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
                tierCounts={tierCounts}
              />

              {/* KANBAN VIEW */}
              {view === 'kanban' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      {showAllStages ? 'All stages' : '3 most active stages'}
                      {!showAllStages && ' · Hidden: Targeting, Engaged, Signed (both)'}
                    </span>
                    <button
                      onClick={() => setShowAllStages(!showAllStages)}
                      style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer' }}
                    >
                      {showAllStages ? 'Show 3 most active' : 'Show all stages'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
                    {stagesToShow.map(stage => {
                      const oppsForStage = stage === 'signed_no_grant'
                        ? filtered.filter(o => o.stage === 'signed' && !o.grantSupport)
                        : stage === 'signed_with_grant'
                        ? filtered.filter(o => o.stage === 'signed' && o.grantSupport)
                        : filtered.filter(o => o.stage === stage)
                      return (
                      <KanbanColumn
                        key={stage}
                        stage={stage}
                        label={`${STAGE_LABELS[stage] || stage} (${STAGE_PROBABILITY[stage] || 0}%)`}
                        opportunities={oppsForStage.map(toCardOpp)}
                        onCardClick={(opp) => setDetailPanelOppId(opp.id)}
                        onDrop={handleStageDrop}
                        onCardContextMenu={handleCardContextMenu}
                        onFieldSaved={handleFieldSaved}
                        onToggleCallSheet={handleToggleCallSheet}
                        onAddNote={(oppId) => setQuickNoteOppId(oppId)}
                        getNoteForOpp={getLatestNoteForOpp}
                      />
                    )})}
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
                          onClick={() => setDetailPanelOppId(opp.supabase_id)}
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

      {/* Outstanding Invoices -- now shown inside Contracts tab */}
      {false && (
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

      {/* Contracts Tab */}
      {pageTab === 'contracts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={openNewContract}
              style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 700 }}
            >
              + Create Contract
            </button>
          </div>
          {quotesLoading ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Loading contracts...</p>
          ) : quotes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>No contracts created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quotes.map(q => {
                const pkg = q.quote_packages?.[0]
                const amount = pkg?.total_amount || 0
                const url = `https://www.teachersdeserveit.com/invoice/${q.id}`
                const isExpired = q.expires_at && new Date(q.expires_at) < new Date()
                const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                  draft: { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' },
                  sent: { bg: '#DBEAFE', text: '#1E40AF', label: 'Sent' },
                  viewed: { bg: '#FEF3C7', text: '#854D0E', label: 'Viewed' },
                  signed: { bg: '#D1FAE5', text: '#065F46', label: 'Signed' },
                  declined: { bg: '#FEE2E2', text: '#991B1B', label: 'Declined' },
                  expired: { bg: '#FEE2E2', text: '#991B1B', label: 'Expired' },
                }
                const displayStatus = isExpired && q.status !== 'signed' ? 'expired' : q.status
                const sc = statusColors[displayStatus] || statusColors.draft
                const borderColor = displayStatus === 'signed' ? '#10B981' : displayStatus === 'viewed' ? '#F59E0B' : '#E5E7EB'

                return (
                  <div key={q.id} style={{
                    background: 'white', border: '1px solid #E5E7EB',
                    borderLeft: `4px solid ${borderColor}`, borderRadius: 10, padding: '14px 18px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{q.title}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                          {q.contact_name && <span>{q.contact_name}</span>}
                          {q.contact_organization && <span> · {q.contact_organization}</span>}
                          {q.contact_email && <span> · {q.contact_email}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                          {q.quote_number}
                          {q.sent_at && ` · Sent ${new Date(q.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          {q.view_count > 0 && ` · Viewed ${q.view_count}x`}
                          {q.viewed_at && ` (last ${new Date(q.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                          {q.signed_at && ` · Signed by ${q.signed_by_name} on ${new Date(q.signed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          {q.expires_at && !q.signed_at && ` · Expires ${new Date(q.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 140 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>
                          ${Number(amount).toLocaleString()}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                          background: sc.bg, color: sc.text,
                        }}>
                          {sc.label.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => { navigator.clipboard.writeText(url); setCopiedQuoteId(q.id); setTimeout(() => setCopiedQuoteId(null), 2000) }}
                        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', background: copiedQuoteId === q.id ? '#D1FAE5' : 'white', color: copiedQuoteId === q.id ? '#065F46' : '#6B7280', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {copiedQuoteId === q.id ? 'Copied!' : 'Copy link'}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #3B82F6', background: 'white', color: '#3B82F6', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => openEditContract(q)}
                        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', color: '#6B7280', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Contract Create/Edit Modal */}
      {contractModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setContractModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'relative', background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0f1e', marginBottom: 20 }}>
              {contractForm.id ? 'Edit Contract' : 'Create Contract'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Title</label>
                <input value={contractForm.title} onChange={e => setContractForm(p => ({ ...p, title: e.target.value }))} placeholder="Grant Funding Services Agreement -- School Name" style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Organization</label>
                <input value={contractForm.contact_organization} onChange={e => setContractForm(p => ({ ...p, contact_organization: e.target.value }))} placeholder="School or District Name" style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Contact Name</label>
                <input value={contractForm.contact_name} onChange={e => setContractForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="First Last" style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Contact Email</label>
                <input value={contractForm.contact_email} onChange={e => setContractForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="email@school.org" style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Service Start</label>
                <input type="date" value={contractForm.service_start_date} onChange={e => setContractForm(p => ({ ...p, service_start_date: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Service End</label>
                <input type="date" value={contractForm.service_end_date} onChange={e => setContractForm(p => ({ ...p, service_end_date: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4 }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Intro Message</label>
              <textarea value={contractForm.intro_message} onChange={e => setContractForm(p => ({ ...p, intro_message: e.target.value }))} rows={4} placeholder="Hi [Name],\n\nThis is our Grant Funding Services Agreement..." style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Payment Instructions</label>
              <textarea value={contractForm.payment_instructions} onChange={e => setContractForm(p => ({ ...p, payment_instructions: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, marginTop: 4, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Line Items</label>
                <button onClick={() => setContractForm(p => ({ ...p, line_items: [...p.line_items, { label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }] }))} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #D1D5DB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>+ Add line</button>
              </div>
              {contractForm.line_items.map((li, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 90px 90px 30px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <input value={li.label} onChange={e => { const items = [...contractForm.line_items]; items[idx] = { ...items[idx], label: e.target.value }; setContractForm(p => ({ ...p, line_items: items })) }} placeholder="Service name" style={{ padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 12 }} />
                  <input type="number" value={li.quantity} onChange={e => { const items = [...contractForm.line_items]; const qty = parseInt(e.target.value) || 1; items[idx] = { ...items[idx], quantity: qty, total: qty * items[idx].unit_price }; setContractForm(p => ({ ...p, line_items: items })) }} placeholder="Qty" style={{ padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 12, textAlign: 'center' }} />
                  <input type="number" value={li.unit_price} onChange={e => { const items = [...contractForm.line_items]; const price = parseFloat(e.target.value) || 0; items[idx] = { ...items[idx], unit_price: price, total: items[idx].quantity * price }; setContractForm(p => ({ ...p, line_items: items })) }} placeholder="Price" style={{ padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 12 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e' }}>${li.total.toLocaleString()}</div>
                  <button onClick={() => { const items = contractForm.line_items.filter((_, i) => i !== idx); setContractForm(p => ({ ...p, line_items: items.length ? items : [{ label: '', quantity: 1, unit_price: 0, total: 0, is_complimentary: false }] })) }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 16 }}>x</button>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0a0f1e', marginTop: 8, paddingRight: 40 }}>
                Total: ${contractForm.line_items.reduce((s, li) => s + li.total, 0).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
              <button onClick={() => setContractModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={saveContract} disabled={savingContract || !contractForm.title || !contractForm.contact_name} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: savingContract ? 0.5 : 1 }}>
                {savingContract ? 'Saving...' : contractForm.id ? 'Save Changes' : 'Create & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash -- removed as tab, accessible via pipeline filter */}
      {false && (
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
            <h3 style={{ ...TYPE_CARD_TITLE, margin: '0 0 4px' }}>Add Note</h3>
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
            <div style={{ ...TYPE_CARD_TITLE, color: '#0a0f1e', marginBottom: 4 }}>Add Note</div>
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

      {/* Detail Panel */}
      <OpportunityDetailPanel
        opportunityId={detailPanelOppId}
        onClose={() => setDetailPanelOppId(null)}
        onUpdate={(id, changes) => {
          setOpportunities(prev => prev.map(o => {
            if (o.supabase_id !== id) return o
            return {
              ...o,
              ...(changes.stage ? { stage: changes.stage, stageName: STAGE_DISPLAY[changes.stage] || changes.stage, probability: STAGE_PROBABILITY[changes.stage] ?? o.probability } : {}),
              ...(changes.value !== undefined ? { value: changes.value } : {}),
              ...(changes.assigned_to_email !== undefined ? { assignedTo: changes.assigned_to_email } : {}),
              ...(changes.name ? { name: changes.name } : {}),
            }
          }))
        }}
        onDelete={(id) => {
          const opp = opportunities.find(o => o.supabase_id === id)
          if (opp) handleDeleteOpp(opp)
        }}
        showToast={showToastMsg}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={addLeadModalOpen}
        onClose={() => setAddLeadModalOpen(false)}
        onLeadCreated={() => {
          // Realtime subscription will handle the UI update when enrichment completes.
          // Immediately refetch so the new card appears in the pipeline.
          loadAll()
        }}
      />

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

