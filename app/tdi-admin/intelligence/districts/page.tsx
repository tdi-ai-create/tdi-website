'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { calculateRenewalHealth, renewalHealthBadge } from '@/lib/tdi-admin/renewal-health'

type Session = {
  id: string
  session_type: string
  session_date: string
  title: string | null
}

type Task = {
  id: string
  status: string
  due_date: string | null
}

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
  service_sessions?: Session[]
  intelligence_tasks?: Task[]
}

type Contact = {
  id: string
  name: string
  title: string | null
  email: string | null
  is_primary: boolean
}

type Contract = {
  id: string
  renewal_deadline_date: string | null
  status: string
  total_value: number | null
}

type Invoice = {
  id: string
  status: string
  amount: number | null
  collections_workflow?: CollectionsWorkflow[]
}

type CollectionsWorkflow = {
  risk_flag: string
  current_stage: string
  next_follow_up_at: string | null
}

export default function DistrictsPage() {
  const supabase = getSupabase()
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pilot' | 'prospect' | 'churned'>('all')

  useEffect(() => { loadDistricts() }, [filter])

  async function loadDistricts() {
    setLoading(true)
    let query = supabase
      .from('districts')
      .select(`id, name, state, segment, status, notes,
        district_contacts(id, name, title, email, is_primary),
        intelligence_contracts(id, renewal_deadline_date, status, total_value, scope_json),
        intelligence_invoices(id, status, amount,
          collections_workflow(risk_flag, current_stage, next_follow_up_at)
        ),
        service_sessions(id, session_type, session_date, title),
        intelligence_tasks(id, status, due_date)
      `)
      .order('name')

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query
    setDistricts((data as District[]) ?? [])
    setLoading(false)
  }

  const statusFilters = ['all', 'active', 'pilot', 'prospect', 'churned'] as const

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Districts</h1>
          <p className="text-sm text-gray-500 mt-1">{districts.length} {filter === 'all' ? 'total' : filter}</p>
        </div>
        <Link
          href="/tdi-admin/intelligence/districts/new"
          className="inline-flex items-center gap-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add District
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {statusFilters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === f
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : districts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">No districts found.</p>
            <Link href="/tdi-admin/intelligence/districts/new" className="text-sm text-amber-600 hover:underline mt-2 inline-block">
              Add your first district
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">District</th>
                <th className="text-left px-4 py-3">State</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Primary Contact</th>
                <th className="text-left px-4 py-3">Collections Risk</th>
                <th className="text-left px-4 py-3">Renewal Health</th>
                <th className="text-left px-4 py-3">Renewal Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {districts.map(d => {
                const primary = d.district_contacts?.find((c) => c.is_primary) ?? d.district_contacts?.[0]
                const invoices = d.intelligence_invoices ?? []
                const collections = invoices.flatMap((i) => i.collections_workflow ?? [])
                const topRisk = collections.some((c) => c.risk_flag === 'critical') ? 'critical'
                  : collections.some((c) => c.risk_flag === 'at_risk') ? 'at_risk' : 'none'
                const contracts = d.intelligence_contracts ?? []
                const renewal = contracts
                  .filter((c) => c.renewal_deadline_date && c.status === 'active')
                  .sort((a, b) => new Date(a.renewal_deadline_date!).getTime() - new Date(b.renewal_deadline_date!).getTime())[0]

                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/tdi-admin/intelligence/districts/${d.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                        {d.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.state}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.status === 'active' ? 'bg-green-100 text-green-700' :
                        d.status === 'pilot' ? 'bg-blue-100 text-blue-700' :
                        d.status === 'prospect' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {primary ? `${primary.name}${primary.title ? ` - ${primary.title}` : ''}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {topRisk === 'critical' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>}
                      {topRisk === 'at_risk' && <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>}
                      {topRisk === 'none' && <span className="text-xs text-gray-400">Clear</span>}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const health = calculateRenewalHealth({
                          contracts,
                          sessions: d.service_sessions ?? [],
                          invoices,
                          tasks: d.intelligence_tasks ?? [],
                        })
                        const badge = renewalHealthBadge(health.tier)
                        return (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label} · {health.score}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {renewal?.renewal_deadline_date
                        ? new Date(renewal.renewal_deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/tdi-admin/intelligence/districts/${d.id}`} className="text-xs text-amber-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
