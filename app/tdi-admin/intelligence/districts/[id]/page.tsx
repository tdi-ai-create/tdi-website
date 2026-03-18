'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Pencil, Plus } from 'lucide-react'

type Tab = 'overview' | 'contracts' | 'contacts'

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

export default function DistrictDetailPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = getSupabase()
  const [district, setDistrict] = useState<District | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

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
        intelligence_tasks(*)
      `)
      .eq('id', id)
      .single()
    setDistrict(data as District)
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading district...</div>
  if (!district) return <div className="p-8 text-gray-500 text-sm">District not found.</div>

  const invoices = district.intelligence_invoices ?? []
  const openInvoices = invoices.filter((i) => !['paid', 'void'].includes(i.status))
  const contracts = district.intelligence_contracts ?? []
  const contacts = district.district_contacts ?? []
  const tasks = district.intelligence_tasks ?? []
  const openTasks = tasks.filter((t) => t.status !== 'done')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'contracts', label: `Contracts + Invoices (${invoices.length})` },
    { key: 'contacts', label: `Contacts (${contacts.length})` },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

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

          {/* Open Tasks */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Open Tasks</h3>
              <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Plus className="w-3 h-3" />
                Add Task
              </button>
            </div>
            {openTasks.length === 0 ? (
              <div className="p-5 text-sm text-gray-400">No open tasks.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {openTasks.map((t) => (
                  <li key={t.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <span className="text-gray-800">{t.title}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {t.due_date && <span>{new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        t.priority === 'high' ? 'bg-red-50 text-red-600' :
                        t.priority === 'med' ? 'bg-yellow-50 text-yellow-700' :
                        'text-gray-400'
                      }`}>{t.priority}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
              <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Plus className="w-3 h-3" />
                Add Contract
              </button>
            </div>
            {contracts.length === 0 ? (
              <div className="p-5 text-sm text-gray-400">No contracts yet.</div>
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
              <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Plus className="w-3 h-3" />
                Add Invoice
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="p-5 text-sm text-gray-400">No invoices yet.</div>
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

                      {/* Collections stage */}
                      {cw && (
                        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                          <span>Stage: <span className="font-medium text-gray-700">{cw.current_stage?.replace(/_/g, ' ')}</span></span>
                          {cw.board_meeting_date && <span>Board: <span className="font-medium text-gray-700">{new Date(cw.board_meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                          {cw.next_follow_up_at && <span>Follow-up: <span className="font-medium text-gray-700">{new Date(cw.next_follow_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                          {cw.expected_payment_date && <span>Expected: <span className="font-medium text-gray-700">{new Date(cw.expected_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>}
                        </div>
                      )}

                      {/* Payment events timeline (last 3) */}
                      {events.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-l-2 border-amber-200 pl-3">
                          {events.slice(0, 3).map((e) => (
                            <div key={e.id} className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{e.event_type.replace(/_/g, ' ')}</span>
                              {e.summary && ` - ${e.summary}`}
                              <span className="ml-2 text-gray-400">
                                {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          ))}
                          {events.length > 3 && (
                            <p className="text-xs text-amber-600 hover:underline cursor-pointer">+ {events.length - 3} more events</p>
                          )}
                        </div>
                      )}
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
            <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
              <Plus className="w-3 h-3" />
              Add Contact
            </button>
          </div>
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No contacts yet.</div>
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
    </div>
  )
}
