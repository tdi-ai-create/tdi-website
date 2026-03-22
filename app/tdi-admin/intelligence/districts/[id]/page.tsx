'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Pencil, Plus, X, Check, Calendar, Users } from 'lucide-react'
import { calculateRenewalHealth } from '@/lib/tdi-admin/renewal-health'

type Tab = 'overview' | 'contracts' | 'contacts' | 'delivery' | 'meetings'

type District = {
  id: string
  name: string
  state: string | null
  segment: string
  status: string
  notes: string | null
  district_contacts?: Contact[]
  intelligence_contracts?: Contract[]
  intelligence_invoices?: Invoice[]
  intelligence_tasks?: Task[]
  service_sessions?: Session[]
}

type Contact = {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  department: string | null
  is_primary: boolean
}

type Contract = {
  id: string
  contract_name: string
  start_date: string | null
  end_date: string | null
  total_value: number | null
  renewal_deadline_date: string | null
  status: string
  scope_json?: {
    observation_days?: number
    virtual_sessions?: number
    executive_sessions?: number
    love_notes?: number
    keynotes?: number
    notes?: string
  }
}

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string | null
  amount: number | null
  status: string
  collections_workflow?: CollectionsWorkflow[]
  payment_events?: PaymentEvent[]
}

type CollectionsWorkflow = {
  id: string
  current_stage: string
  board_meeting_date: string | null
  next_follow_up_at: string | null
  expected_payment_date: string | null
  risk_flag: string
}

type PaymentEvent = {
  id: string
  event_type: string
  event_date: string
  summary: string | null
}

type Task = {
  id: string
  title: string
  due_date: string | null
  priority: string
  status: string
}

type Session = {
  id: string
  session_type: string
  session_date: string
  title: string | null
  attendees_count: number | null
  buildings_visited: string[] | null
  notes: string | null
}

type Meeting = {
  id: string
  meeting_type: string
  meeting_date: string
  attendees_json: { name: string; role?: string; email?: string }[]
  summary: string | null
  score: number | null
  follow_up_notes: string | null
  next_meeting_date: string | null
}

// ---- Delivery Helper Functions ----
function getContractedTotals(contracts: Contract[]) {
  const active = contracts.filter((c) => c.status === 'active')
  let obs = 0, virtual = 0, exec = 0, loveNotes = 0, keynote = 0
  active.forEach((c) => {
    const s = c.scope_json ?? {}
    obs += parseInt(String(s.observation_days ?? 0))
    virtual += parseInt(String(s.virtual_sessions ?? 0))
    exec += parseInt(String(s.executive_sessions ?? 0))
    loveNotes += parseInt(String(s.love_notes ?? 0))
    keynote += parseInt(String(s.keynotes ?? 0))
  })
  return { obs, virtual, exec, loveNotes, keynote }
}

function getDeliveredCounts(sessions: Session[]) {
  const count = (type: string) => sessions.filter((s) => s.session_type === type).length
  return {
    obs: count('observation'),
    virtual: count('virtual_session'),
    exec: count('executive_impact'),
    loveNotes: count('love_notes'),
    keynote: count('keynote'),
  }
}

function isDeliveryAtRisk(
  contracted: ReturnType<typeof getContractedTotals>,
  delivered: ReturnType<typeof getDeliveredCounts>,
  contractEndDate?: string | null
): boolean {
  if (!contractEndDate) return false
  const daysUntilEnd = (new Date(contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysUntilEnd < 0) return false
  const pctTimeLeft = daysUntilEnd / 365
  const totalContracted = contracted.obs + contracted.virtual + contracted.exec + contracted.loveNotes + contracted.keynote
  const totalDelivered = delivered.obs + delivered.virtual + delivered.exec + delivered.loveNotes + delivered.keynote
  if (totalContracted === 0) return false
  const deliveryPct = totalDelivered / totalContracted
  return deliveryPct < 0.5 && pctTimeLeft < 0.3
}

// ---- Modal: Add Contract ----
function AddContractModal({ districtId, onClose, onSaved }: { districtId: string, onClose: () => void, onSaved: () => void }) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    contract_name: '', start_date: '', end_date: '', total_value: '',
    renewal_deadline_date: '', signed_doc_url: '', status: 'active',
    payment_terms: '', payment_schedule: '', notes: '',
    observation_days: '', virtual_sessions: '', executive_sessions: '',
    hub_memberships: '', books: '',
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  async function handleSave() {
    if (!form.contract_name.trim()) return
    setSaving(true)
    await supabase.from('intelligence_contracts').insert({
      district_id: districtId,
      contract_name: form.contract_name.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      total_value: form.total_value ? parseFloat(form.total_value) : null,
      renewal_deadline_date: form.renewal_deadline_date || null,
      signed_doc_url: form.signed_doc_url.trim() || null,
      status: form.status,
      payment_terms: form.payment_terms || null,
      payment_schedule: form.payment_schedule || null,
      notes: form.notes.trim() || null,
      scope_json: {
        observation_days: parseInt(form.observation_days) || 0,
        virtual_sessions: parseInt(form.virtual_sessions) || 0,
        executive_sessions: parseInt(form.executive_sessions) || 0,
        hub_memberships: parseInt(form.hub_memberships) || 0,
        books: parseInt(form.books) || 0,
      },
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Contract</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div><label className={labelClass}>Contract Name *</label><input className={inputClass} value={form.contract_name} onChange={e => setForm(f => ({ ...f, contract_name: e.target.value }))} placeholder="e.g. ACCELERATE Year 2 - 2025-26" /></div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>Start Date</label><input type="date" className={inputClass} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
          <div><label className={labelClass}>End Date</label><input type="date" className={inputClass} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
          <div><label className={labelClass}>Total Value ($)</label><input type="number" className={inputClass} value={form.total_value} onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))} placeholder="0.00" /></div>
          <div><label className={labelClass}>Renewal Deadline</label><input type="date" className={inputClass} value={form.renewal_deadline_date} onChange={e => setForm(f => ({ ...f, renewal_deadline_date: e.target.value }))} /></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Payment Terms</label>
            <select className={inputClass} value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}>
              <option value="">Select...</option>
              <option value="net_15">Net 15</option>
              <option value="net_30">Net 30</option>
              <option value="net_45">Net 45</option>
              <option value="net_60">Net 60</option>
              <option value="upfront">Upfront</option>
              <option value="split">Split</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Payment Schedule</label>
            <select className={inputClass} value={form.payment_schedule} onChange={e => setForm(f => ({ ...f, payment_schedule: e.target.value }))}>
              <option value="">Select...</option>
              <option value="annual">Annual</option>
              <option value="semester">Semester</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="renewed">Renewed</option>
          </select>
        </div>

        <div><label className={labelClass}>Signed Doc URL</label><input className={inputClass} value={form.signed_doc_url} onChange={e => setForm(f => ({ ...f, signed_doc_url: e.target.value }))} placeholder="https://..." /></div>

        <div>
          <p className={labelClass}>Contracted Scope</p>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { key: 'observation_days', label: 'Observation Days' },
              { key: 'virtual_sessions', label: 'Virtual Sessions' },
              { key: 'executive_sessions', label: 'Exec Impact Sessions' },
              { key: 'hub_memberships', label: 'Hub Memberships' },
              { key: 'books', label: 'Books' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="number"
                  className={inputClass}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={e => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div><label className={labelClass}>Notes</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contract notes, special terms, etc..." /></div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.contract_name.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg">
            {saving ? 'Saving...' : 'Save Contract'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal: Add Invoice ----
function AddInvoiceModal({ districtId, contracts, onClose, onSaved }: { districtId: string, contracts: Contract[], onClose: () => void, onSaved: () => void }) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [loadingNumber, setLoadingNumber] = useState(true)
  const [form, setForm] = useState({
    invoice_number: '', contract_id: '', invoice_date: new Date().toISOString().split('T')[0],
    due_date: '', amount: '',
    service_start_date: '', service_end_date: '',
    status: 'draft', notes: '', ap_requirements: '',
    ap_po_required: false, ap_board_approval: false,
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  // Auto-generate invoice number on mount
  useEffect(() => {
    async function generateInvoiceNumber() {
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('intelligence_invoices')
        .select('*', { count: 'exact', head: true })
        .ilike('invoice_number', `TDI-${year}-%`)

      const nextNum = String((count || 0) + 1).padStart(3, '0')
      const suggestedNumber = `TDI-${year}-${nextNum}`
      setForm(f => ({ ...f, invoice_number: suggestedNumber }))
      setLoadingNumber(false)
    }
    generateInvoiceNumber()
  }, [supabase])

  // Auto-calculate due date from invoice date (default Net 30)
  useEffect(() => {
    if (form.invoice_date && !form.due_date) {
      const invoiceDate = new Date(form.invoice_date)
      invoiceDate.setDate(invoiceDate.getDate() + 30)
      setForm(f => ({ ...f, due_date: invoiceDate.toISOString().split('T')[0] }))
    }
  }, [form.invoice_date])

  async function handleSave() {
    if (!form.invoice_number.trim()) return
    setSaving(true)

    const { data: invoice } = await supabase.from('intelligence_invoices').insert({
      district_id: districtId,
      contract_id: form.contract_id || null,
      invoice_number: form.invoice_number.trim(),
      invoice_date: form.invoice_date || null,
      due_date: form.due_date || null,
      amount: form.amount ? parseFloat(form.amount) : null,
      service_start_date: form.service_start_date || null,
      service_end_date: form.service_end_date || null,
      status: form.status,
      notes: form.notes.trim() || null,
      ap_requirements_json: {
        po_required: form.ap_po_required,
        board_approval_required: form.ap_board_approval,
        requirements_text: form.ap_requirements.trim() || null,
      }
    }).select().single()

    if (invoice) {
      await supabase.from('collections_workflow').insert({
        invoice_id: invoice.id,
        current_stage: 'submitted',
        risk_flag: 'none',
      })
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Invoice Number *</label>
            <input
              className={inputClass}
              value={form.invoice_number}
              onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))}
              placeholder={loadingNumber ? 'Generating...' : 'e.g. TDI-2026-001'}
              disabled={loadingNumber}
            />
            <p className="text-xs text-gray-400 mt-1">Auto-generated, but editable</p>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Contract (optional)</label>
            <select className={inputClass} value={form.contract_id} onChange={e => setForm(f => ({ ...f, contract_id: e.target.value }))}>
              <option value="">No contract linked</option>
              {contracts.filter(c => c.status === 'active').map((c) => <option key={c.id} value={c.id}>{c.contract_name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} /></div>
          <div><label className={labelClass}>Due Date</label><input type="date" className={inputClass} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
          <div><label className={labelClass}>Amount ($)</label><input type="number" className={inputClass} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
          <div><label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>

        <div>
          <p className={labelClass}>Service Period</p>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div><label className={labelClass}>Start</label><input type="date" className={inputClass} value={form.service_start_date} onChange={e => setForm(f => ({ ...f, service_start_date: e.target.value }))} /></div>
            <div><label className={labelClass}>End</label><input type="date" className={inputClass} value={form.service_end_date} onChange={e => setForm(f => ({ ...f, service_end_date: e.target.value }))} /></div>
          </div>
        </div>

        <div>
          <p className={labelClass}>AP Requirements</p>
          <div className="space-y-2 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.ap_po_required} onChange={e => setForm(f => ({ ...f, ap_po_required: e.target.checked }))} className="rounded" />
              PO required
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.ap_board_approval} onChange={e => setForm(f => ({ ...f, ap_board_approval: e.target.checked }))} className="rounded" />
              Board approval required
            </label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.ap_requirements}
              onChange={e => setForm(f => ({ ...f, ap_requirements: e.target.value }))}
              placeholder="Specific contact, special instructions, etc..."
            />
          </div>
        </div>

        <div><label className={labelClass}>Notes</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.invoice_number.trim() || loadingNumber} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg">
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal: Log Session ----
function LogSessionModal({ districtId, contracts, onClose, onSaved }: {
  districtId: string
  contracts: Contract[]
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    session_type: 'observation',
    session_date: new Date().toISOString().split('T')[0],
    title: '',
    contract_id: '',
    attendees_count: '',
    buildings_visited: '',
    notes: '',
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  const sessionTypeLabels: Record<string, string> = {
    observation: 'In-Person Observation Day',
    virtual_session: 'Virtual Session',
    executive_impact: 'Executive Impact Session',
    love_notes: 'Love Notes',
    keynote: 'Keynote',
    custom: 'Custom',
  }

  async function handleSave() {
    if (!form.session_date) return
    setSaving(true)

    const buildings = form.buildings_visited
      .split(',')
      .map(b => b.trim())
      .filter(Boolean)

    await supabase.from('service_sessions').insert({
      district_id: districtId,
      contract_id: form.contract_id || null,
      session_type: form.session_type,
      session_date: form.session_date,
      title: form.title.trim() || sessionTypeLabels[form.session_type],
      attendees_count: form.attendees_count ? parseInt(form.attendees_count) : null,
      buildings_visited: buildings.length > 0 ? buildings : null,
      notes: form.notes.trim() || null,
    })

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Log Service Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className={labelClass}>Session Type</label>
          <select className={inputClass} value={form.session_type} onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))}>
            <option value="observation">In-Person Observation Day</option>
            <option value="virtual_session">Virtual Session</option>
            <option value="executive_impact">Executive Impact Session</option>
            <option value="love_notes">Love Notes</option>
            <option value="keynote">Keynote</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" className={inputClass} value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Attendees</label>
            <input type="number" className={inputClass} value={form.attendees_count} onChange={e => setForm(f => ({ ...f, attendees_count: e.target.value }))} placeholder="0" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Title (optional - auto-fills if blank)</label>
          <input className={inputClass} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Observation Day 1 - Building A" />
        </div>

        <div>
          <label className={labelClass}>Contract (optional)</label>
          <select className={inputClass} value={form.contract_id} onChange={e => setForm(f => ({ ...f, contract_id: e.target.value }))}>
            <option value="">No contract linked</option>
            {contracts.map((c) => <option key={c.id} value={c.id}>{c.contract_name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Buildings Visited (comma-separated)</label>
          <input className={inputClass} value={form.buildings_visited} onChange={e => setForm(f => ({ ...f, buildings_visited: e.target.value }))} placeholder="e.g. Lincoln Elementary, Jefferson Middle" />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key observations, highlights, follow-ups needed..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.session_date}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Log Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal: Log Meeting ----
function LogMeetingModal({ districtId, onClose, onSaved }: {
  districtId: string
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    meeting_type: 'check_in',
    meeting_date: new Date().toISOString().split('T')[0],
    attendees: '',
    summary: '',
    score: '',
    follow_up_notes: '',
    next_meeting_date: '',
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  const meetingTypeLabels: Record<string, string> = {
    exec_impact: 'Executive Impact Review',
    renewal: 'Renewal Conversation',
    check_in: 'Check-in',
    board_presentation: 'Board Presentation',
  }

  async function handleSave() {
    if (!form.meeting_date) return
    setSaving(true)

    // Parse attendees into JSON array
    const attendeesJson = form.attendees
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)
      .map(name => ({ name }))

    await supabase.from('district_meetings').insert({
      district_id: districtId,
      meeting_type: form.meeting_type,
      meeting_date: form.meeting_date,
      attendees_json: attendeesJson,
      summary: form.summary.trim() || null,
      score: form.score ? parseInt(form.score) : null,
      follow_up_notes: form.follow_up_notes.trim() || null,
      next_meeting_date: form.next_meeting_date || null,
    })

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Log Meeting</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className={labelClass}>Meeting Type</label>
          <select className={inputClass} value={form.meeting_type} onChange={e => setForm(f => ({ ...f, meeting_type: e.target.value }))}>
            <option value="check_in">Check-in</option>
            <option value="exec_impact">Executive Impact Review</option>
            <option value="renewal">Renewal Conversation</option>
            <option value="board_presentation">Board Presentation</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date *</label>
            <input type="date" className={inputClass} value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Score (0-10)</label>
            <input type="number" min="0" max="10" className={inputClass} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="0-10" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Attendees (comma-separated)</label>
          <input className={inputClass} value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="e.g. Dr. Smith, Jane Doe, Principal Johnson" />
        </div>

        <div>
          <label className={labelClass}>Summary</label>
          <textarea className={inputClass} rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Key discussion points, outcomes, stakeholder sentiment..." />
        </div>

        <div>
          <label className={labelClass}>Follow-up Notes</label>
          <textarea className={inputClass} rows={2} value={form.follow_up_notes} onChange={e => setForm(f => ({ ...f, follow_up_notes: e.target.value }))} placeholder="Action items, next steps..." />
        </div>

        <div>
          <label className={labelClass}>Next Meeting Date (optional)</label>
          <input type="date" className={inputClass} value={form.next_meeting_date} onChange={e => setForm(f => ({ ...f, next_meeting_date: e.target.value }))} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.meeting_date}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Log Meeting'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Inline: Log Payment Event ----
function LogEventPanel({ invoiceId, onSaved }: { invoiceId: string, onSaved: () => void }) {
  const supabase = getSupabase()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ event_type: 'email_sent', event_date: new Date().toISOString().split('T')[0], summary: '' })

  const inputClass = "border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"

  async function handleSave() {
    if (!form.summary.trim()) return
    setSaving(true)
    await supabase.from('payment_events').insert({
      invoice_id: invoiceId,
      event_type: form.event_type,
      event_date: form.event_date,
      summary: form.summary.trim(),
    })
    setForm({ event_type: 'email_sent', event_date: new Date().toISOString().split('T')[0], summary: '' })
    setOpen(false)
    onSaved()
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline mt-2">
      <Plus className="w-3 h-3" />
      Log Event
    </button>
  )

  return (
    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
      <div className="flex gap-2 flex-wrap">
        <select className={inputClass} value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
          <option value="email_sent">Email Sent</option>
          <option value="call_made">Call Made</option>
          <option value="voicemail">Voicemail</option>
          <option value="board_approval">Board Approval</option>
          <option value="check_reissued">Check Reissued</option>
          <option value="check_received">Check Received</option>
          <option value="paid">Paid</option>
          <option value="escalated">Escalated</option>
          <option value="note">Note</option>
        </select>
        <input type="date" className={inputClass} value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
      </div>
      <input className={`${inputClass} w-full`} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Brief summary of what happened..." />
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || !form.summary.trim()} className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium">
          {saving ? 'Saving...' : 'Log Event'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  )
}

// ---- Inline: Edit Collections Workflow ----
function EditCollectionsWorkflow({ workflow, onSaved }: { workflow: CollectionsWorkflow | undefined, onSaved: () => void }) {
  const supabase = getSupabase()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    current_stage: workflow?.current_stage ?? 'submitted',
    risk_flag: workflow?.risk_flag ?? 'none',
    board_meeting_date: workflow?.board_meeting_date ?? '',
    expected_payment_date: workflow?.expected_payment_date ?? '',
    next_follow_up_at: workflow?.next_follow_up_at ? workflow.next_follow_up_at.split('T')[0] : '',
  })

  const inputClass = "border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "text-xs font-medium text-gray-600"

  async function handleSave() {
    setSaving(true)
    if (workflow?.id) {
      await supabase.from('collections_workflow').update({
        current_stage: form.current_stage,
        risk_flag: form.risk_flag,
        board_meeting_date: form.board_meeting_date || null,
        expected_payment_date: form.expected_payment_date || null,
        next_follow_up_at: form.next_follow_up_at ? `${form.next_follow_up_at}T00:00:00Z` : null,
        last_contacted_at: new Date().toISOString(),
      }).eq('id', workflow.id)
    }
    setOpen(false)
    onSaved()
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 mt-1">
      <Pencil className="w-3 h-3" />
      Edit collections status
    </button>
  )

  return (
    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={labelClass}>Stage</p>
          <select className={`${inputClass} w-full mt-1`} value={form.current_stage} onChange={e => setForm(f => ({ ...f, current_stage: e.target.value }))}>
            <option value="submitted">Submitted</option>
            <option value="ap_review">AP Review</option>
            <option value="board_approval_pending">Board Approval Pending</option>
            <option value="check_issued">Check Issued</option>
            <option value="stop_payment">Stop Payment</option>
            <option value="reissue">Reissue</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <p className={labelClass}>Risk Flag</p>
          <select className={`${inputClass} w-full mt-1`} value={form.risk_flag} onChange={e => setForm(f => ({ ...f, risk_flag: e.target.value }))}>
            <option value="none">Clear</option>
            <option value="at_risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <p className={labelClass}>Board Meeting Date</p>
          <input type="date" className={`${inputClass} w-full mt-1`} value={form.board_meeting_date} onChange={e => setForm(f => ({ ...f, board_meeting_date: e.target.value }))} />
        </div>
        <div>
          <p className={labelClass}>Expected Payment</p>
          <input type="date" className={`${inputClass} w-full mt-1`} value={form.expected_payment_date} onChange={e => setForm(f => ({ ...f, expected_payment_date: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <p className={labelClass}>Next Follow-up Date</p>
          <input type="date" className={`${inputClass} w-full mt-1`} value={form.next_follow_up_at} onChange={e => setForm(f => ({ ...f, next_follow_up_at: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium">
          {saving ? 'Saving...' : 'Update'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  )
}

// ---- Main Page ----
export default function DistrictDetailPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = getSupabase()
  const [district, setDistrict] = useState<District | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [showAddContract, setShowAddContract] = useState(false)
  const [showAddInvoice, setShowAddInvoice] = useState(false)
  const [showLogSession, setShowLogSession] = useState(false)
  const [showLogMeeting, setShowLogMeeting] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [mergedSessions, setMergedSessions] = useState<any[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])

  useEffect(() => { if (id) loadDistrict() }, [id])

  async function loadDistrict() {
    setLoading(true)
    const { data } = await supabase
      .from('districts')
      .select(`
        *,
        district_contacts(*),
        intelligence_contracts(*),
        intelligence_invoices(
          *,
          collections_workflow(*),
          payment_events(*)
        ),
        intelligence_tasks(*),
        service_sessions(*)
      `)
      .eq('id', id)
      .single()
    setDistrict(data as District)

    // Fetch merged delivery events (combines legacy timeline_events + service_sessions)
    const { data: deliveryData } = await supabase
      .from('district_delivery_events' as any)
      .select('*')
      .eq('district_id', id)
      .not('session_date', 'is', null)
      .order('session_date', { ascending: false })

    setMergedSessions(deliveryData ?? [])

    // Fetch district meetings
    const { data: meetingsData } = await supabase
      .from('district_meetings')
      .select('*')
      .eq('district_id', id)
      .order('meeting_date', { ascending: false })

    setMeetings((meetingsData ?? []) as Meeting[])
    setLoading(false)
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    await supabase.from('intelligence_tasks').insert({
      district_id: id,
      title: newTaskTitle.trim(),
      related_type: 'district',
      related_id: id,
      status: 'open',
      priority: 'med',
    })
    setNewTaskTitle('')
    setAddingTask(false)
    loadDistrict()
  }

  async function markTaskDone(taskId: string) {
    await supabase.from('intelligence_tasks').update({ status: 'done' }).eq('id', taskId)
    loadDistrict()
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading district...</div>
  if (!district) return <div className="p-8 text-gray-500 text-sm">District not found.</div>

  const invoices = district.intelligence_invoices ?? []
  const openInvoices = invoices.filter((i) => !['paid', 'void'].includes(i.status))
  const contracts = district.intelligence_contracts ?? []
  const contacts = district.district_contacts ?? []
  const tasks = district.intelligence_tasks ?? []
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const sessions = (district.service_sessions ?? []).sort((a, b) =>
    new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  )
  const contracted = getContractedTotals(contracts)
  // Use merged sessions (dashboard + manual) for delivery counts if available
  const sessionsForCounts = mergedSessions.length > 0 ? mergedSessions : sessions
  const delivered = getDeliveredCounts(sessionsForCounts as Session[])
  const activeContract = contracts.find((c) => c.status === 'active')
  const deliveryAtRisk = isDeliveryAtRisk(contracted, delivered, activeContract?.end_date)
  const totalContracted = contracted.obs + contracted.virtual + contracted.exec + contracted.loveNotes + contracted.keynote

  const renewalHealth = calculateRenewalHealth({
    contracts,
    sessions: mergedSessions.length > 0 ? mergedSessions : sessions,
    invoices,
    tasks,
    meetings,
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'contracts', label: `Contracts + Invoices (${invoices.length})` },
    { key: 'contacts', label: `Contacts (${contacts.length})` },
    { key: 'delivery', label: `Delivery (${mergedSessions.length > 0 ? mergedSessions.length : sessions.length})` },
    { key: 'meetings', label: `Meetings (${meetings.length})` },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {showAddContract && (
        <AddContractModal
          districtId={id}
          onClose={() => setShowAddContract(false)}
          onSaved={() => { setShowAddContract(false); loadDistrict() }}
        />
      )}

      {showAddInvoice && (
        <AddInvoiceModal
          districtId={id}
          contracts={contracts}
          onClose={() => setShowAddInvoice(false)}
          onSaved={() => { setShowAddInvoice(false); loadDistrict() }}
        />
      )}

      {showLogSession && (
        <LogSessionModal
          districtId={id}
          contracts={contracts}
          onClose={() => setShowLogSession(false)}
          onSaved={() => { setShowLogSession(false); loadDistrict() }}
        />
      )}

      {showLogMeeting && (
        <LogMeetingModal
          districtId={id}
          onClose={() => setShowLogMeeting(false)}
          onSaved={() => { setShowLogMeeting(false); loadDistrict() }}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Link href="/tdi-admin/intelligence" className="hover:text-amber-600">Intelligence Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/tdi-admin/intelligence/districts" className="hover:text-amber-600">Districts</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">{district.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{district.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">{district.state}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              district.status === 'active' ? 'bg-green-100 text-green-700' :
              district.status === 'pilot' ? 'bg-blue-100 text-blue-700' :
              district.status === 'prospect' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {district.status.charAt(0).toUpperCase() + district.status.slice(1)}
            </span>
          </div>
        </div>
        <Link
          href={`/tdi-admin/intelligence/districts/${id}/edit`}
          className="inline-flex items-center gap-2 text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{openInvoices.length}</p>
          <p className="text-sm text-gray-500">Open invoices</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{contracts.filter((c) => c.status === 'active').length}</p>
          <p className="text-sm text-gray-500">Active contracts</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{openTasks.length}</p>
          <p className="text-sm text-gray-500">Open tasks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">

          {/* Notes */}
          {district.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-semibold text-amber-800 mb-1">Notes</p>
              <p>{district.notes}</p>
            </div>
          )}

          {/* Renewal Health Score */}
          <div className={`border rounded-xl overflow-hidden ${renewalHealth.border}`}>
            <div className={`px-5 py-4 ${renewalHealth.bg} border-b ${renewalHealth.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Renewal Health</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Composite score across delivery, collections, timeline, and tasks</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${renewalHealth.color}`}>{renewalHealth.score}</p>
                  <p className={`text-sm font-semibold ${renewalHealth.color}`}>{renewalHealth.label}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    renewalHealth.tier === 'strong' ? 'bg-green-500' :
                    renewalHealth.tier === 'watch' ? 'bg-amber-400' :
                    renewalHealth.tier === 'at_risk' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${renewalHealth.score}%` }}
                />
              </div>
            </div>

            {/* Signal breakdown */}
            <div className="px-5 py-4 bg-white space-y-2">
              {renewalHealth.signals.map(signal => (
                <div key={signal.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      signal.status === 'good' ? 'bg-green-400' :
                      signal.status === 'warn' ? 'bg-amber-400' :
                      signal.status === 'bad' ? 'bg-red-400' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-600">{signal.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden sm:block">{signal.detail}</span>
                    <span className={`text-xs font-semibold ${
                      signal.score === signal.max ? 'text-green-600' :
                      signal.score > 0 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {signal.score}/{signal.max}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Playbook */}
            {renewalHealth.playbook.length > 0 && (
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2">Recommended Next Steps</p>
                <ul className="space-y-1">
                  {renewalHealth.playbook.map((action, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Delivery Summary */}
          {totalContracted > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Delivery Progress</h3>
                <div className="flex items-center gap-3">
                  {deliveryAtRisk && (
                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>
                  )}
                  <button
                    onClick={() => setShowLogSession(true)}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Log Session
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Observation Days', delivered: delivered.obs, contracted: contracted.obs },
                    { label: 'Virtual Sessions', delivered: delivered.virtual, contracted: contracted.virtual },
                    { label: 'Exec Impact Sessions', delivered: delivered.exec, contracted: contracted.exec },
                    { label: 'Love Notes', delivered: delivered.loveNotes, contracted: contracted.loveNotes },
                    { label: 'Keynotes', delivered: delivered.keynote, contracted: contracted.keynote },
                  ].filter(row => row.contracted > 0).map(row => (
                    <div key={row.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{row.label}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {row.delivered}
                        <span className="text-sm font-normal text-gray-400"> / {row.contracted}</span>
                      </p>
                      <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            row.delivered >= row.contracted ? 'bg-green-500' :
                            row.delivered / row.contracted >= 0.5 ? 'bg-amber-400' : 'bg-gray-300'
                          }`}
                          style={{ width: `${Math.min(100, (row.delivered / row.contracted) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {mergedSessions.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Last session: {new Date(mergedSessions[0].session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {mergedSessions[0].title}
                    {mergedSessions[0].source === 'dashboard' && <span className="ml-1 text-gray-300">(dashboard)</span>}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Open Tasks */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Open Tasks</h3>
            </div>
            <div className="p-5 space-y-3">
              {openTasks.length === 0 ? (
                <p className="text-sm text-gray-400">No open tasks.</p>
              ) : (
                <ul className="space-y-2">
                  {openTasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{t.title}</span>
                      <div className="flex items-center gap-3">
                        {t.due_date && (
                          <span className={`text-xs ${new Date(t.due_date) < new Date() ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.priority === 'high' ? 'bg-red-50 text-red-600' :
                          t.priority === 'med' ? 'bg-yellow-50 text-yellow-700' :
                          'text-gray-400'
                        }`}>{t.priority}</span>
                        <button onClick={() => markTaskDone(t.id)} className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                          <Check className="w-3 h-3" />
                          Done
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add task inline */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Add a task and press Enter..."
                />
                <button
                  onClick={addTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Collections snapshot - critical invoices */}
          {openInvoices.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Collections Snapshot</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {openInvoices.map((inv) => {
                  const cw = inv.collections_workflow?.[0]
                  return (
                    <li key={inv.id} className="px-5 py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cw?.current_stage?.replace(/_/g, ' ') ?? 'No stage set'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700">
                          {inv.amount != null ? `$${Number(inv.amount).toLocaleString()}` : '-'}
                        </span>
                        {cw?.risk_flag === 'critical' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>}
                        {cw?.risk_flag === 'at_risk' && <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab: Contracts + Invoices */}
      {tab === 'contracts' && (
        <div className="space-y-6">
          {/* Contracts */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Contracts</h3>
              <button onClick={() => setShowAddContract(true)} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Plus className="w-3 h-3" />
                Add Contract
              </button>
            </div>
            {contracts.length === 0 ? (
              <div className="p-5 text-sm text-gray-400">No contracts yet. <button onClick={() => setShowAddContract(true)} className="text-amber-600 hover:underline">Add one.</button></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-2">Contract</th>
                    <th className="text-left px-4 py-2">Value</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Renewal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{c.contract_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.total_value != null ? `$${Number(c.total_value).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.renewal_deadline_date
                          ? new Date(c.renewal_deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Invoices + Collections Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Invoices + Collections</h3>
              <button onClick={() => setShowAddInvoice(true)} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Plus className="w-3 h-3" />
                Add Invoice
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="p-5 text-sm text-gray-400">No invoices yet. <button onClick={() => setShowAddInvoice(true)} className="text-amber-600 hover:underline">Add one.</button></div>
            ) : (
              <div className="divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const cw = inv.collections_workflow?.[0]
                  const events = (inv.payment_events ?? []).sort((a, b) =>
                    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
                  )
                  return (
                    <div key={inv.id} className="px-5 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{inv.invoice_number}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            {inv.amount != null ? ` - $${Number(inv.amount).toLocaleString()}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            inv.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{inv.status}</span>
                          {cw?.risk_flag === 'critical' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>}
                          {cw?.risk_flag === 'at_risk' && <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>}
                        </div>
                      </div>

                      {cw && (
                        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                          <span>Stage: <span className="font-medium text-gray-700">{cw.current_stage?.replace(/_/g, ' ')}</span></span>
                          {cw.board_meeting_date && <span>Board: <span className="font-medium text-gray-700">{new Date(cw.board_meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                          {cw.next_follow_up_at && <span>Follow-up: <span className="font-medium text-gray-700">{new Date(cw.next_follow_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                          {cw.expected_payment_date && <span>Expected: <span className="font-medium text-gray-700">{new Date(cw.expected_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                        </div>
                      )}

                      {cw && <EditCollectionsWorkflow workflow={cw} onSaved={loadDistrict} />}

                      {events.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-l-2 border-amber-200 pl-3">
                          {events.slice(0, 5).map((e) => (
                            <div key={e.id} className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{e.event_type.replace(/_/g, ' ')}</span>
                              {e.summary && ` - ${e.summary}`}
                              <span className="ml-2 text-gray-400">
                                {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ))}
                          {events.length > 5 && (
                            <p className="text-xs text-gray-400">+ {events.length - 5} more events</p>
                          )}
                        </div>
                      )}

                      <LogEventPanel invoiceId={inv.id} onSaved={loadDistrict} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Contacts */}
      {tab === 'contacts' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Contacts</h3>
            <Link href={`/tdi-admin/intelligence/districts/${id}/edit`} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
              <Pencil className="w-3 h-3" />
              Edit contacts
            </Link>
          </div>
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No contacts yet. <Link href={`/tdi-admin/intelligence/districts/${id}/edit`} className="text-amber-600 hover:underline">Add contacts.</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <li key={c.id} className="px-5 py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                      {c.is_primary && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    {c.title && <p className="text-xs text-gray-500 mt-0.5">{c.title}</p>}
                    {c.department && <p className="text-xs text-gray-400">{c.department}</p>}
                  </div>
                  <div className="text-right text-xs text-gray-500 space-y-0.5">
                    {c.email && <p><a href={`mailto:${c.email}`} className="text-amber-600 hover:underline">{c.email}</a></p>}
                    {c.phone && <p>{c.phone}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tab: Delivery */}
      {tab === 'delivery' && (
        <div className="space-y-6">

          {/* Contracted vs Delivered summary */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Contracted vs. Delivered</h3>
              <button
                onClick={() => setShowLogSession(true)}
                className="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
              >
                + Log Session
              </button>
            </div>
            <div className="px-5 py-4">
              {totalContracted === 0 ? (
                <p className="text-sm text-gray-400">No contracted sessions found. Add scope details to a contract to see delivery tracking.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Observation Days', delivered: delivered.obs, contracted: contracted.obs, key: 'observation' },
                    { label: 'Virtual Sessions', delivered: delivered.virtual, contracted: contracted.virtual, key: 'virtual_session' },
                    { label: 'Exec Impact Sessions', delivered: delivered.exec, contracted: contracted.exec, key: 'executive_impact' },
                    { label: 'Love Notes', delivered: delivered.loveNotes, contracted: contracted.loveNotes, key: 'love_notes' },
                    { label: 'Keynotes', delivered: delivered.keynote, contracted: contracted.keynote, key: 'keynote' },
                  ].filter(row => row.contracted > 0).map(row => {
                    const pct = row.contracted > 0 ? Math.min(100, (row.delivered / row.contracted) * 100) : 0
                    const complete = row.delivered >= row.contracted
                    return (
                      <div key={row.label} className={`rounded-xl p-4 border ${complete ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <p className="text-xs font-medium text-gray-500 mb-2">{row.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {row.delivered}
                          <span className="text-base font-normal text-gray-400"> / {row.contracted}</span>
                        </p>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${complete ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-gray-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {complete && <p className="text-xs text-green-600 font-medium mt-1">Complete</p>}
                        {!complete && row.contracted - row.delivered > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{row.contracted - row.delivered} remaining</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Session Log - merged data from dashboard + manual entries */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Session Log</h3>
                {mergedSessions.length > 0 && mergedSessions.some((s: any) => s.source === 'dashboard') && (
                  <p className="text-xs text-gray-400 mt-0.5">Includes sessions from partner dashboard</p>
                )}
              </div>
              <span className="text-xs text-gray-400">{mergedSessions.length > 0 ? mergedSessions.length : sessions.length} sessions</span>
            </div>

            {(mergedSessions.length > 0 ? mergedSessions.length : sessions.length) === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No sessions logged yet.</p>
                <button
                  onClick={() => setShowLogSession(true)}
                  className="text-sm text-amber-600 hover:underline mt-2 inline-block"
                >
                  Log your first session
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {(mergedSessions.length > 0 ? mergedSessions : sessions).map((s: any) => {
                  const typeColors: Record<string, string> = {
                    observation: 'bg-blue-100 text-blue-700',
                    virtual_session: 'bg-purple-100 text-purple-700',
                    executive_impact: 'bg-green-100 text-green-700',
                    love_notes: 'bg-pink-100 text-pink-700',
                    keynote: 'bg-orange-100 text-orange-700',
                    custom: 'bg-gray-100 text-gray-600',
                  }
                  const typeLabels: Record<string, string> = {
                    observation: 'Observation',
                    virtual_session: 'Virtual',
                    executive_impact: 'Exec Impact',
                    love_notes: 'Love Notes',
                    keynote: 'Keynote',
                    custom: 'Custom',
                  }
                  return (
                    <li key={`${s.source ?? 'manual'}-${s.event_id ?? s.id}`} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[s.session_type] ?? 'bg-gray-100 text-gray-600'}`}>
                              {typeLabels[s.session_type] ?? s.session_type}
                            </span>
                            <p className="text-sm font-medium text-gray-900">{s.title}</p>
                            {s.source === 'dashboard' && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                From Dashboard
                              </span>
                            )}
                          </div>
                          {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
                          {s.buildings_visited && s.buildings_visited.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Buildings: {s.buildings_visited.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500 shrink-0">
                          <p className="font-medium">{new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          {s.attendees_count != null && <p className="text-gray-400">{s.attendees_count} attendees</p>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Tab: Meetings */}
      {tab === 'meetings' && (
        <div className="space-y-6">

          {/* Meeting Log */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Meeting Log</h3>
                <p className="text-xs text-gray-400 mt-0.5">Track exec impact reviews, renewal conversations, check-ins</p>
              </div>
              <button
                onClick={() => setShowLogMeeting(true)}
                className="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
              >
                + Log Meeting
              </button>
            </div>

            {meetings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No meetings logged yet.</p>
                <button
                  onClick={() => setShowLogMeeting(true)}
                  className="text-sm text-amber-600 hover:underline mt-2 inline-block"
                >
                  Log your first meeting
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {meetings.map((m) => {
                  const typeColors: Record<string, string> = {
                    exec_impact: 'bg-green-100 text-green-700',
                    renewal: 'bg-purple-100 text-purple-700',
                    check_in: 'bg-blue-100 text-blue-700',
                    board_presentation: 'bg-orange-100 text-orange-700',
                  }
                  const typeLabels: Record<string, string> = {
                    exec_impact: 'Exec Impact',
                    renewal: 'Renewal',
                    check_in: 'Check-in',
                    board_presentation: 'Board',
                  }
                  const attendees = m.attendees_json ?? []
                  return (
                    <li key={m.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[m.meeting_type] ?? 'bg-gray-100 text-gray-600'}`}>
                              {typeLabels[m.meeting_type] ?? m.meeting_type}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(m.meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {m.score != null && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                m.score >= 8 ? 'bg-green-100 text-green-700' :
                                m.score >= 5 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {m.score}/10
                              </span>
                            )}
                          </div>

                          {m.summary && (
                            <p className="text-sm text-gray-600 mt-2">{m.summary}</p>
                          )}

                          {attendees.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                              <Users className="w-3.5 h-3.5" />
                              <span>{attendees.map((a: any) => a.name).join(', ')}</span>
                            </div>
                          )}

                          {m.follow_up_notes && (
                            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              <p className="text-xs font-semibold text-amber-700 mb-0.5">Follow-up</p>
                              <p className="text-xs text-gray-600">{m.follow_up_notes}</p>
                            </div>
                          )}

                          {m.next_meeting_date && (
                            <p className="text-xs text-gray-400 mt-2">
                              Next meeting: {new Date(m.next_meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Meeting Stats */}
          {meetings.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Meetings', value: meetings.length, color: 'text-gray-700' },
                { label: 'Exec Reviews', value: meetings.filter(m => m.meeting_type === 'exec_impact').length, color: 'text-green-700' },
                { label: 'Renewal Convos', value: meetings.filter(m => m.meeting_type === 'renewal').length, color: 'text-purple-700' },
                { label: 'Avg Score', value: (() => {
                  const scored = meetings.filter(m => m.score != null)
                  if (scored.length === 0) return '-'
                  const avg = scored.reduce((sum, m) => sum + (m.score ?? 0), 0) / scored.length
                  return avg.toFixed(1)
                })(), color: 'text-amber-700' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
