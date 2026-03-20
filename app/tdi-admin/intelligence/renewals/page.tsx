'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { calculateRenewalHealth, renewalHealthBadge, RenewalHealth, RenewalTier } from '@/lib/tdi-admin/renewal-health'

type DistrictWithHealth = {
  id: string
  name: string
  state: string
  status: string
  health: RenewalHealth
  contracts: any[]
}

export default function RenewalsPage() {
  const supabase = getSupabase()
  const [districts, setDistricts] = useState<DistrictWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | RenewalTier>('all')

  useEffect(() => { loadDistricts() }, [])

  async function loadDistricts() {
    setLoading(true)
    const { data } = await supabase
      .from('districts')
      .select(`
        id, name, state, status,
        intelligence_contracts (*),
        intelligence_invoices (
          id, status,
          collections_workflow (risk_flag, current_stage)
        ),
        service_sessions (id, session_type, session_date, title),
        intelligence_tasks (id, status, due_date)
      `)
      .in('status', ['active', 'pilot'])
      .order('name')

    const withHealth: DistrictWithHealth[] = (data ?? []).map(d => ({
      id: d.id,
      name: d.name,
      state: d.state,
      status: d.status,
      contracts: d.intelligence_contracts ?? [],
      health: calculateRenewalHealth({
        contracts: d.intelligence_contracts ?? [],
        sessions: d.service_sessions ?? [],
        invoices: d.intelligence_invoices ?? [],
        tasks: d.intelligence_tasks ?? [],
      }),
    }))

    // Sort by score ascending (most at-risk first)
    withHealth.sort((a, b) => a.health.score - b.health.score)

    setDistricts(withHealth)
    setLoading(false)
  }

  const filtered = filter === 'all'
    ? districts
    : districts.filter(d => d.health.tier === filter)

  const tierCounts = {
    critical: districts.filter(d => d.health.tier === 'critical').length,
    at_risk: districts.filter(d => d.health.tier === 'at_risk').length,
    watch: districts.filter(d => d.health.tier === 'watch').length,
    strong: districts.filter(d => d.health.tier === 'strong').length,
  }

  const filters: { key: 'all' | RenewalTier; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: districts.length },
    { key: 'critical', label: 'Critical', count: tierCounts.critical },
    { key: 'at_risk', label: 'At Risk', count: tierCounts.at_risk },
    { key: 'watch', label: 'Watch', count: tierCounts.watch },
    { key: 'strong', label: 'Strong', count: tierCounts.strong },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Renewals</h1>
        <p className="text-sm text-gray-500 mt-1">Districts sorted by renewal health - most at-risk first</p>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tier: 'critical' as RenewalTier, label: 'Critical', count: tierCounts.critical, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
            { tier: 'at_risk' as RenewalTier, label: 'At Risk', count: tierCounts.at_risk, bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
            { tier: 'watch' as RenewalTier, label: 'Watch', count: tierCounts.watch, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
            { tier: 'strong' as RenewalTier, label: 'Strong', count: tierCounts.strong, bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
          ].map(card => (
            <button
              key={card.tier}
              onClick={() => setFilter(filter === card.tier ? 'all' : card.tier)}
              className={`border rounded-xl p-4 text-left hover:shadow-md transition-shadow ${card.bg} ${filter === card.tier ? 'ring-2 ring-offset-1 ring-amber-400' : ''}`}
            >
              <p className={`text-3xl font-bold ${card.text}`}>{card.count}</p>
              <p className={`text-sm font-semibold ${card.text} mt-1`}>{card.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">districts</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              filter === f.key ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label} {f.count > 0 && <span className="ml-1 text-xs text-gray-400">({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Districts list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm">No districts in this tier.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const badge = renewalHealthBadge(d.health.tier)
            const nextRenewal = d.contracts
              .filter((c: any) => c.renewal_deadline_date && c.status === 'active')
              .sort((a: any, b: any) => new Date(a.renewal_deadline_date).getTime() - new Date(b.renewal_deadline_date).getTime())[0]

            return (
              <div key={d.id} className={`bg-white border rounded-xl overflow-hidden ${d.health.border}`}>
                {/* Header row */}
                <div className="px-5 py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/tdi-admin/intelligence/districts/${d.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 text-lg"
                      >
                        {d.name}
                      </Link>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label} · {d.health.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {d.state}
                      {nextRenewal?.renewal_deadline_date && (
                        <span className="ml-3">
                          Renewal: {new Date(nextRenewal.renewal_deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {d.health.daysUntilRenewal !== null && (
                            <span className={`ml-1 font-medium ${d.health.daysUntilRenewal <= 30 ? 'text-red-500' : d.health.daysUntilRenewal <= 90 ? 'text-amber-600' : 'text-gray-500'}`}>
                              ({d.health.daysUntilRenewal}d)
                            </span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Score bar */}
                  <div className="w-24 flex-shrink-0">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.health.tier === 'strong' ? 'bg-green-500' :
                          d.health.tier === 'watch' ? 'bg-amber-400' :
                          d.health.tier === 'at_risk' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${d.health.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Signal pills */}
                <div className="px-5 pb-3 flex flex-wrap gap-2">
                  {d.health.signals.map(signal => (
                    <span
                      key={signal.label}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        signal.status === 'good' ? 'bg-green-100 text-green-700' :
                        signal.status === 'warn' ? 'bg-amber-100 text-amber-700' :
                        signal.status === 'bad' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {signal.label}: {signal.score}/{signal.max}
                    </span>
                  ))}
                </div>

                {/* Playbook */}
                {(d.health.tier === 'critical' || d.health.tier === 'at_risk' || d.health.tier === 'watch') && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Next Steps</p>
                    <ul className="space-y-0.5">
                      {d.health.playbook.slice(0, 2).map((action, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-amber-500 flex-shrink-0">→</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
