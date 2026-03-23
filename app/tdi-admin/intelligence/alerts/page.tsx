'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { calculateAlerts, Alert, AlertSeverity } from '@/lib/tdi-admin/alert-rules'

export default function AlertCenterPage() {
  const supabase = getSupabase()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all')

  useEffect(() => { loadAlerts() }, [])

  async function loadAlerts() {
    setLoading(true)

    const { data: districts } = await supabase
      .from('districts')
      .select(`
        id, name, state, status,
        intelligence_contracts(*),
        intelligence_invoices(
          id, invoice_number, amount, status, invoice_date,
          collections_workflow(risk_flag, current_stage, next_follow_up_at)
        ),
        intelligence_tasks(id, title, status, due_date),
        district_meetings(id, meeting_date)
      `)
      .in('status', ['active', 'pilot'])

    const districtIds = (districts ?? []).map((d: any) => d.id)

    const { data: deliveryData } = await supabase
      .from('district_delivery_events' as any)
      .select('district_id, session_type, session_date')
      .in('district_id', districtIds)

    const sessionsByDistrict: Record<string, any[]> = {}
    ;(deliveryData ?? []).forEach((s: any) => {
      if (!sessionsByDistrict[s.district_id]) sessionsByDistrict[s.district_id] = []
      sessionsByDistrict[s.district_id].push(s)
    })

    const calculated = calculateAlerts({
      districts: districts ?? [],
      sessionsByDistrict,
    })

    setAlerts(calculated)
    setLoading(false)
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  const counts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }

  const severityStyles: Record<AlertSeverity, { badge: string; border: string; icon: string }> = {
    critical: { badge: 'bg-red-100 text-red-700', border: 'border-red-200', icon: '🔴' },
    warning: { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200', icon: '🟡' },
    info: { badge: 'bg-gray-100 text-gray-600', border: 'border-gray-200', icon: '⚪' },
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="text-xs text-gray-400">
        <Link href="/tdi-admin/intelligence" className="hover:text-amber-600">Operations</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Alert Center</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} across all districts
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="text-xs text-amber-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'critical' as AlertSeverity, label: 'Critical', count: counts.critical, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
            { key: 'warning' as AlertSeverity, label: 'Warnings', count: counts.warning, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
            { key: 'info' as AlertSeverity, label: 'Info', count: counts.info, bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
          ].map(card => (
            <button
              key={card.key}
              onClick={() => setFilter(filter === card.key ? 'all' : card.key)}
              className={`border rounded-xl p-4 text-left transition-shadow hover:shadow-md ${card.bg} ${filter === card.key ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
            >
              <p className={`text-3xl font-bold ${card.text}`}>{card.count}</p>
              <p className={`text-sm font-semibold ${card.text} mt-1`}>{card.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'critical', 'warning', 'info'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === f ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? `All (${alerts.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f as AlertSeverity]})`}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-medium text-gray-700">
            {filter === 'all' ? 'No active alerts - all districts are on track.' : `No ${filter} alerts.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const styles = severityStyles[alert.severity]
            return (
              <div key={alert.id} className={`bg-white border rounded-xl p-5 ${styles.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
                        {styles.icon} {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{alert.category}</span>
                    </div>
                    <p className="font-semibold text-gray-900 mt-2">{alert.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-sm text-amber-600 mt-2">&rarr; {alert.action}</p>
                  </div>
                  <Link
                    href={alert.href}
                    className="text-xs text-amber-600 hover:underline shrink-0 mt-1"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
