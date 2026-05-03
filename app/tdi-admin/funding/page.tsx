'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

type FundingRecord = {
  id: string
  district_name: string
  district_id: string | null
  funding_source_type: string
  funding_source_name: string | null
  amount_pursued: number | null
  application_deadline: string | null
  status: string
  grant_writer: string | null
  notes: string | null
  created_at: string
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  title_ii_a: 'Title II-A',
  title_i: 'Title I',
  esser_arp: 'ESSER/ARP',
  state_grant: 'State Grant',
  foundation_grant: 'Foundation Grant',
  general_pd_budget: 'General PD Budget',
  corporate: 'Corporate',
  community: 'Community',
  diocesan: 'Diocesan',
  other: 'Other',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  researching: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Researching' },
  writing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Writing' },
  submitted: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Submitted' },
  awarded: { bg: 'bg-green-100', text: 'text-green-700', label: 'Awarded' },
  denied: { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied' },
  on_hold: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'On Hold' },
}

function AddFundingModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    district_name: '',
    funding_source_type: 'title_ii_a',
    funding_source_name: '',
    amount_pursued: '',
    application_deadline: '',
    status: 'researching',
    grant_writer: '',
    notes: '',
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  async function handleSave() {
    if (!form.district_name.trim()) return
    setSaving(true)

    await supabase.from('funding_records').insert({
      district_name: form.district_name.trim(),
      funding_source_type: form.funding_source_type,
      funding_source_name: form.funding_source_name.trim() || null,
      amount_pursued: form.amount_pursued ? parseFloat(form.amount_pursued) : null,
      application_deadline: form.application_deadline || null,
      status: form.status,
      grant_writer: form.grant_writer.trim() || null,
      notes: form.notes.trim() || null,
    })

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Funding Record</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div>
          <label className={labelClass}>District / School Name *</label>
          <input className={inputClass} value={form.district_name} onChange={e => setForm(f => ({ ...f, district_name: e.target.value }))} placeholder="e.g. Allenwood Elementary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Funding Source Type</label>
            <select className={inputClass} value={form.funding_source_type} onChange={e => setForm(f => ({ ...f, funding_source_type: e.target.value }))}>
              {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Specific Grant Name</label>
            <input className={inputClass} value={form.funding_source_name} onChange={e => setForm(f => ({ ...f, funding_source_name: e.target.value }))} placeholder="e.g. McCarthey Dressman" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Amount Pursued ($)</label>
            <input type="number" className={inputClass} value={form.amount_pursued} onChange={e => setForm(f => ({ ...f, amount_pursued: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Application Deadline</label>
            <input type="date" className={inputClass} value={form.application_deadline} onChange={e => setForm(f => ({ ...f, application_deadline: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS_STYLES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Grant Writer / Owner</label>
            <input className={inputClass} value={form.grant_writer} onChange={e => setForm(f => ({ ...f, grant_writer: e.target.value }))} placeholder="e.g. Rae, Jim" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes / Strategy</label>
          <textarea className={inputClass} rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Funding strategy, board approval needed, key contacts..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.district_name.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FundingPage() {
  const supabase = getSupabase()
  const [records, setRecords] = useState<FundingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { loadRecords() }, [statusFilter])

  async function loadRecords() {
    setLoading(true)
    let query = supabase
      .from('funding_records')
      .select('*')
      .order('application_deadline', { ascending: true, nullsFirst: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setRecords(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    await supabase.from('funding_records').update({ status }).eq('id', id)
    await loadRecords()
    setUpdatingId(null)
  }

  // Summary counts
  const counts = {
    total: records.length,
    active: records.filter(r => ['researching', 'writing', 'submitted'].includes(r.status)).length,
    awarded: records.filter(r => r.status === 'awarded').length,
    totalAwarded: records.filter(r => r.status === 'awarded').reduce((sum, r) => sum + (r.amount_pursued ?? 0), 0),
    upcomingDeadlines: records.filter(r => {
      if (!r.application_deadline) return false
      const days = (new Date(r.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return days >= 0 && days <= 14
    }).length,
  }

  const isUrgent = (deadline: string | null) => {
    if (!deadline) return false
    const days = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return days >= 0 && days <= 14
  }

  const isPast = (deadline: string | null) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-200"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-0 px-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'researching', label: 'Researching' },
            { key: 'writing', label: 'Writing' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'awarded', label: 'Awarded' },
            { key: 'denied', label: 'Denied' },
            { key: 'on_hold', label: 'On Hold' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: statusFilter === f.key ? '#111827' : '#6B7280',
                borderBottom: statusFilter === f.key ? '2px solid #10B981' : '2px solid transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

      {showAdd && (
        <AddFundingModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); loadRecords() }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 28, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Funding</h1>
          <p className="text-sm text-gray-500 mt-1">Grant tracking - districts we are actively helping fund</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Record
        </button>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-gray-900" style={{ fontSize: 28 }}>{counts.active}</p>
            <p className="text-sm text-gray-500 mt-0.5">Active pursuits</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-emerald-600" style={{ fontSize: 28 }}>{counts.awarded}</p>
            <p className="text-sm text-gray-500 mt-0.5">Grants awarded</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-gray-900" style={{ fontSize: 28 }}>
              {counts.totalAwarded > 0 ? `$${counts.totalAwarded.toLocaleString()}` : '-'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Total awarded</p>
          </div>
          <div className={`border rounded-xl p-4 ${counts.upcomingDeadlines > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <p className={`font-bold ${counts.upcomingDeadlines > 0 ? 'text-red-600' : 'text-gray-900'}`} style={{ fontSize: 28 }}>
              {counts.upcomingDeadlines}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Deadlines in 14 days</p>
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No funding records yet.</p>
            <button onClick={() => setShowAdd(true)} className="text-sm text-emerald-600 hover:underline mt-2 inline-block">
              Add your first record
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">District</th>
                <th className="text-left px-4 py-3">Funding Source</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Deadline</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(record => {
                const statusStyle = STATUS_STYLES[record.status] ?? STATUS_STYLES.researching
                const urgent = isUrgent(record.application_deadline)
                const past = isPast(record.application_deadline)

                return (
                  <tr key={record.id} className={`hover:bg-gray-50 ${urgent ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{record.district_name}</p>
                      {record.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">{record.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{SOURCE_TYPE_LABELS[record.funding_source_type]}</p>
                      {record.funding_source_name && (
                        <p className="text-xs text-gray-400">{record.funding_source_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {record.amount_pursued ? `$${Number(record.amount_pursued).toLocaleString()}` : '-'}
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${urgent ? 'text-red-600' : past && record.status !== 'awarded' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {record.application_deadline
                        ? new Date(record.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                      {urgent && <span className="ml-1 text-red-500">(!)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={record.status}
                        onChange={e => updateStatus(record.id, e.target.value)}
                        disabled={updatingId === record.id}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {Object.entries(STATUS_STYLES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {record.grant_writer ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reference - funding sources from TDI website */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-emerald-800 mb-1">Common Funding Sources TDI Helps With</p>
        <p className="text-xs text-emerald-700">
          Title II-A &middot; Title I &middot; ESSER/ARP &middot; State Grants &middot; Foundation Grants &middot; General PD Budgets &middot; Private & Public Funding &middot; Diocesan Sources &middot; Corporate Partnerships &middot; Community Foundations
        </p>
      </div>
      </div>
    </div>
  )
}
