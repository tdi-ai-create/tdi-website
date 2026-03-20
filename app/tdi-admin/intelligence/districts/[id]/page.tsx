'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Pencil, Plus, X, Check } from 'lucide-react'

type Tab = 'overview' | 'contracts' | 'contacts' | 'delivery'

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
    observation_days: '', virtual_sessions: '', executive_sessions: '',
    love_notes: '', keynotes: '',
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
      scope_json: {
        observation_days: parseInt(form.observation_days) || 0,
        virtual_sessions: parseInt(form.virtual_sessions) || 0,
        executive_sessions: parseInt(form.executive_sessions) || 0,
        love_notes: parseInt(form.love_notes) || 0,
        keynotes: parseInt(form.keynotes) || 0,
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
          <p className={labelClass}>Contracted Deliverables</p>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { key: 'observation_days', label: 'Observation Days' },
              { key: 'virtual_sessions', label: 'Virtual Sessions' },
              { key: 'executive_sessions', label: 'Exec Impact Sessions' },
              { key: 'love_notes', label: 'Love Notes' },
              { key: 'keynotes', label: 'Keynotes' },
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
  const [form, setForm] = useState({
    invoice_number: '', contract_id: '', invoice_date: '', amount: '',
    service_start_date: '', service_end_date: '', service_date_exact: '',
    status: 'draft', notes: '',
    ap_po_required: false, ap_w9_required: false, ap_vendor_packet: false, ap_exact_service_date: false,
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  async function handleSave() {
    if (!form.invoice_number.trim()) return
    setSaving(true)

    const { data: invoice } = await supabase.from('intelligence_invoices').insert({
      district_id: districtId,
      contract_id: form.contract_id || null,
      invoice_number: form.invoice_number.trim(),
      invoice_date: form.invoice_date || null,
      amount: form.amount ? parseFloat(form.amount) : null,
      service_start_date: form.service_start_date || null,
      service_end_date: form.service_end_date || null,
      service_date_exact: form.service_date_exact || null,
      status: form.status,
      notes: form.notes.trim() || null,
      ap_requirements_json: {
        po_required: form.ap_po_required,
        w9_required: form.ap_w9_required,
        vendor_packet: form.ap_vendor_packet,
        exact_service_date_needed: form.ap_exact_service_date,
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
          <div className="col-span-2"><label className={labelClass}>Invoice Number *</label><input className={inputClass} value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="e.g. TDI-2026-001" /></div>
          <div className="col-span-2">
            <label className={labelClass}>Contract (optional)</label>
            <select className={inputClass} value={form.contract_id} onChange={e => setForm(f => ({ ...f, contract_id: e.target.value }))}>
              <option value="">No contract linked</option>
              {contracts.map((c) => <option key={c.id} value={c.id}>{c.contract_name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} /></div>
          <div><label className={labelClass}>Amount ($)</label><input type="number" className={inputClass} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
          <div><label className={labelClass}>Service Start</label><input type="date" className={inputClass} value={form.service_start_date} onChange={e => setForm(f => ({ ...f, service_start_date: e.target.value }))} /></div>
          <div><label className={labelClass}>Service End</label><input type="date" className={inputClass} value={form.service_end_date} onChange={e => setForm(f => ({ ...f, service_end_date: e.target.value }))} /></div>
          <div className="col-span-2"><label className={labelClass}>Exact Service Date (if required by AP)</label><input type="date" className={inputClass} value={form.service_date_exact} onChange={e => setForm(f => ({ ...f, service_date_exact: e.target.value }))} /></div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </div>

        <div>
          <p className={labelClass}>AP Requirements</p>
          <div className="space-y-2 mt-1">
            {[
              { key: 'ap_po_required', label: 'PO required' },
              { key: 'ap_w9_required', label: 'W-9 required' },
              { key: 'ap_vendor_packet', label: 'Vendor packet required' },
              { key: 'ap_exact_service_date', label: 'Exact service date required' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={(form as Record<string, boolean | string>)[key] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div><label className={labelClass}>Notes</label><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.invoice_number.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg">
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
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)

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
  const delivered = getDeliveredCounts(sessions)
  const activeContract = contracts.find((c) => c.status === 'active')
  const deliveryAtRisk = isDeliveryAtRisk(contracted, delivered, activeContract?.end_date)
  const totalContracted = contracted.obs + contracted.virtual + contracted.exec + contracted.loveNotes + contracted.keynote

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'contracts', label: `Contracts + Invoices (${invoices.length})` },
    { key: 'contacts', label: `Contacts (${contacts.length})` },
    { key: 'delivery', label: `Delivery (${sessions.length})` },
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
                {sessions.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Last session: {new Date(sessions[0].session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {sessions[0].title}
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

          {/* Session Log */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Session Log</h3>
              <span className="text-xs text-gray-400">{sessions.length} sessions</span>
            </div>
            {sessions.length === 0 ? (
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
                {sessions.map((s) => {
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
                    <li key={s.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[s.session_type] ?? 'bg-gray-100 text-gray-600'}`}>
                              {typeLabels[s.session_type] ?? s.session_type}
                            </span>
                            <p className="text-sm font-medium text-gray-900">{s.title}</p>
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
    </div>
  )
}
