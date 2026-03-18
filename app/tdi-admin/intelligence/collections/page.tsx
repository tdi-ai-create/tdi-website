'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'

type CollectionsItem = {
  id: string
  current_stage: string
  board_meeting_date: string | null
  next_follow_up_at: string | null
  expected_payment_date: string | null
  risk_flag: string
  intelligence_invoices: {
    id: string
    invoice_number: string
    amount: number | null
    status: string
    invoice_date: string | null
    districts: {
      id: string
      name: string
      state: string | null
    } | null
    payment_events?: PaymentEvent[]
  } | null
}

type PaymentEvent = {
  id: string
  event_type: string
  event_date: string
  summary: string | null
}

function CollectionsQueueContent() {
  const supabase = getSupabase()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [items, setItems] = useState<CollectionsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'at_risk' | 'board'>(
    (filterParam as 'all' | 'critical' | 'at_risk' | 'board') ?? 'all'
  )

  useEffect(() => { loadCollections() }, [filter])

  async function loadCollections() {
    setLoading(true)
    const { data } = await supabase
      .from('collections_workflow')
      .select(`
        *,
        intelligence_invoices(
          id, invoice_number, amount, status, invoice_date,
          districts(id, name, state),
          payment_events(id, event_type, event_date, summary)
        )
      `)
      .order('created_at', { ascending: false })

    let filtered = (data as CollectionsItem[]) ?? []
    if (filter === 'critical') filtered = filtered.filter(c => c.risk_flag === 'critical')
    if (filter === 'at_risk') filtered = filtered.filter(c => c.risk_flag === 'at_risk')
    if (filter === 'board') filtered = filtered.filter(c => c.current_stage === 'board_approval_pending')

    setItems(filtered)
    setLoading(false)
  }

  const stageLabel = (s: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Collections Queue</h1>
        <p className="text-sm text-gray-500 mt-1">{items.length} {filter === 'all' ? 'total' : filter.replace('_', ' ')} items</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'critical', 'at_risk', 'board'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === f ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'at_risk' ? 'At Risk' : f === 'board' ? 'Board Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Collections Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No items in this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">District</th>
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Stage</th>
                  <th className="text-left px-4 py-3">Risk</th>
                  <th className="text-left px-4 py-3">Board Date</th>
                  <th className="text-left px-4 py-3">Next Follow-up</th>
                  <th className="text-left px-4 py-3">Expected Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(c => {
                  const inv = c.intelligence_invoices
                  const district = inv?.districts
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        {district ? (
                          <Link href={`/tdi-admin/intelligence/districts/${district.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                            {district.name}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv?.invoice_number ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {inv?.amount != null ? `$${Number(inv.amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{stageLabel(c.current_stage)}</td>
                      <td className="px-4 py-3">
                        {c.risk_flag === 'critical' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>}
                        {c.risk_flag === 'at_risk' && <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>}
                        {c.risk_flag === 'none' && <span className="text-xs text-gray-400">Clear</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.board_meeting_date ? new Date(c.board_meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${
                        c.next_follow_up_at && new Date(c.next_follow_up_at) < new Date() ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {c.next_follow_up_at ? new Date(c.next_follow_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.expected_payment_date ? new Date(c.expected_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CollectionsQueuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm animate-pulse">Loading collections...</div>}>
      <CollectionsQueueContent />
    </Suspense>
  )
}
