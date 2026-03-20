'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, AlertTriangle, Clock, Calendar, FileCheck, TrendingDown } from 'lucide-react'
import { calculateRenewalHealth, renewalHealthBadge } from '@/lib/tdi-admin/renewal-health'

// Types
type AlertCard = {
  label: string
  value: number | string
  sub: string
  color: string
  href: string
  icon: React.ReactNode
}

type DistrictTask = {
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
  intelligence_invoices?: Invoice[]
  intelligence_contracts?: Contract[]
  service_sessions?: Session[]
  intelligence_tasks?: DistrictTask[]
}

type Invoice = {
  id: string
  amount: number | null
  status: string
  invoice_date: string | null
  collections_workflow?: CollectionsWorkflow[]
}

type Contract = {
  id: string
  renewal_deadline_date: string | null
  end_date: string | null
  status: string
  scope_json?: {
    observation_days?: number
    virtual_sessions?: number
    executive_sessions?: number
    love_notes?: number
    keynotes?: number
  }
}

type Session = {
  id: string
  session_type: string
  session_date: string
}

type CollectionsWorkflow = {
  risk_flag: string
  current_stage: string
  next_follow_up_at: string | null
  board_meeting_date: string | null
  expected_payment_date: string | null
}

type Task = {
  id: string
  title: string
  due_date: string | null
  priority: string
  related_type: string | null
  district_id: string | null
  districts?: { name: string } | null
}

export default function IntelligenceHubPage() {
  const supabase = getSupabase()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<AlertCard[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [openTasks, setOpenTasks] = useState<Task[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Fetch active districts with invoice + collections + sessions + tasks data
    const { data: districtData } = await supabase
      .from('districts')
      .select(`
        id, name, state, segment, status,
        intelligence_invoices (
          id, amount, status, invoice_date,
          collections_workflow (
            risk_flag, current_stage, next_follow_up_at, board_meeting_date, expected_payment_date
          )
        ),
        intelligence_contracts (
          id, renewal_deadline_date, end_date, status, scope_json
        ),
        service_sessions (
          id, session_type, session_date, title
        ),
        intelligence_tasks (
          id, status, due_date
        )
      `)
      .in('status', ['active', 'pilot'])
      .order('name')

    // Fetch open tasks
    const { data: taskData } = await supabase
      .from('intelligence_tasks')
      .select('id, title, due_date, priority, related_type, district_id, districts(name)')
      .eq('status', 'open')
      .order('due_date', { ascending: true })
      .limit(10)

    // Build alert cards
    const allInvoices = districtData?.flatMap(d => d.intelligence_invoices ?? []) ?? []
    const allCollections = allInvoices.flatMap(inv => inv.collections_workflow ?? [])

    const criticalCount = allCollections.filter(c => c.risk_flag === 'critical').length
    const atRiskCount = allCollections.filter(c => c.risk_flag === 'at_risk').length

    // Renewals within 90 days
    const today = new Date()
    const in90 = new Date(today)
    in90.setDate(today.getDate() + 90)
    const renewalsSoon = districtData?.flatMap(d => d.intelligence_contracts ?? [])
      .filter(c => c.renewal_deadline_date && new Date(c.renewal_deadline_date) <= in90 && c.status === 'active')
      .length ?? 0

    // Board approvals in next 30 days
    const in30 = new Date(today)
    in30.setDate(today.getDate() + 30)
    const boardPending = allCollections.filter(c =>
      c.board_meeting_date && new Date(c.board_meeting_date) <= in30 &&
      c.current_stage === 'board_approval_pending'
    ).length

    // Delivery at risk calculation
    const deliveryAtRiskCount = (districtData ?? []).filter(d => {
      const dContracts = d.intelligence_contracts ?? []
      const dSessions = d.service_sessions ?? []
      const activeContract = dContracts.find((c) => c.status === 'active')
      if (!activeContract?.end_date) return false

      const daysUntilEnd = (new Date(activeContract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysUntilEnd < 0 || daysUntilEnd > 90) return false // only flag if ending in 90 days

      const scope = activeContract.scope_json ?? {}
      const totalContracted =
        (parseInt(String(scope.observation_days ?? 0))) +
        (parseInt(String(scope.virtual_sessions ?? 0))) +
        (parseInt(String(scope.executive_sessions ?? 0))) +
        (parseInt(String(scope.love_notes ?? 0))) +
        (parseInt(String(scope.keynotes ?? 0)))

      if (totalContracted === 0) return false

      const totalDelivered = dSessions.length
      return (totalDelivered / totalContracted) < 0.5
    }).length

    setAlerts([
      {
        label: 'Critical Collections',
        value: criticalCount,
        sub: 'invoices flagged critical risk',
        color: 'bg-red-50 border-red-200',
        href: '/tdi-admin/intelligence/collections?filter=critical',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      },
      {
        label: 'At-Risk Invoices',
        value: atRiskCount,
        sub: 'need follow-up soon',
        color: 'bg-orange-50 border-orange-200',
        href: '/tdi-admin/intelligence/collections?filter=at_risk',
        icon: <Clock className="w-5 h-5 text-orange-500" />,
      },
      {
        label: 'Board Approvals',
        value: boardPending,
        sub: 'pending in next 30 days',
        color: 'bg-yellow-50 border-yellow-200',
        href: '/tdi-admin/intelligence/collections?filter=board',
        icon: <FileCheck className="w-5 h-5 text-yellow-600" />,
      },
      {
        label: 'Renewals Soon',
        value: renewalsSoon,
        sub: 'contracts renewing within 90 days',
        color: 'bg-blue-50 border-blue-200',
        href: '/tdi-admin/intelligence/districts?filter=renewals',
        icon: <Calendar className="w-5 h-5 text-blue-500" />,
      },
      {
        label: 'Delivery at Risk',
        value: deliveryAtRiskCount,
        sub: 'contracts ending soon, <50% delivered',
        color: 'bg-purple-50 border-purple-200',
        href: '/tdi-admin/intelligence/districts?filter=active',
        icon: <TrendingDown className="w-5 h-5 text-purple-500" />,
      },
    ])

    setDistricts((districtData as unknown as District[]) ?? [])
    setOpenTasks((taskData as unknown as Task[]) ?? [])
    setLoading(false)
  }

  // Derive summary row data per district
  function getDistrictMeta(d: District) {
    const invoices = d.intelligence_invoices ?? []
    const collections = invoices.flatMap((i) => i.collections_workflow ?? [])
    const topRisk = collections.some((c) => c.risk_flag === 'critical') ? 'critical'
      : collections.some((c) => c.risk_flag === 'at_risk') ? 'at_risk'
      : 'none'
    const openInvoices = invoices.filter((i) => !['paid', 'void'].includes(i.status)).length
    const contracts = d.intelligence_contracts ?? []
    const renewalDate = contracts
      .filter((c) => c.renewal_deadline_date && c.status === 'active')
      .sort((a, b) => new Date(a.renewal_deadline_date!).getTime() - new Date(b.renewal_deadline_date!).getTime())[0]
      ?.renewal_deadline_date

    // Delivery progress
    const sessions = d.service_sessions ?? []
    const activeContract = contracts.find((c) => c.status === 'active')
    let deliveryPct: number | null = null
    if (activeContract?.scope_json) {
      const scope = activeContract.scope_json
      const totalContracted =
        (parseInt(String(scope.observation_days ?? 0))) +
        (parseInt(String(scope.virtual_sessions ?? 0))) +
        (parseInt(String(scope.executive_sessions ?? 0))) +
        (parseInt(String(scope.love_notes ?? 0))) +
        (parseInt(String(scope.keynotes ?? 0)))
      if (totalContracted > 0) {
        deliveryPct = Math.round((sessions.length / totalContracted) * 100)
      }
    }

    // Renewal health score
    const health = calculateRenewalHealth({
      contracts,
      sessions,
      invoices,
      tasks: d.intelligence_tasks ?? [],
    })

    return { topRisk, openInvoices, renewalDate, deliveryPct, health }
  }

  const riskBadge = (flag: string) => {
    if (flag === 'critical') return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>
    if (flag === 'at_risk') return <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">At Risk</span>
    return <span className="text-xs text-gray-400">Clear</span>
  }

  const priorityBadge = (p: string) => {
    if (p === 'high') return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">High</span>
    if (p === 'med') return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Med</span>
    return <span className="text-xs text-gray-400">Low</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intelligence Hub</h1>
          <p className="text-sm text-gray-500 mt-1">District Command Center - Collections, Contracts, Pipeline</p>
        </div>
        <Link
          href="/tdi-admin/intelligence/districts/new"
          className="inline-flex items-center gap-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add District
        </Link>
      </div>

      {/* Alert Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {alerts.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                {card.icon}
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-1">{card.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Two-column layout: District Table + Open Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* District Table - 3/5 */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Active Districts</h2>
            <div className="flex items-center gap-4">
              <Link href="/tdi-admin/intelligence/renewals" className="text-xs text-amber-600 hover:underline">
                Renewals
              </Link>
              <Link href="/tdi-admin/intelligence/districts" className="text-xs text-amber-600 hover:underline">
                View all
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : districts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No active districts yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">District</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-left px-3 py-3">Collections</th>
                  <th className="text-left px-3 py-3">Delivery</th>
                  <th className="text-left px-3 py-3">Health</th>
                  <th className="text-left px-3 py-3">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {districts.map((d) => {
                  const meta = getDistrictMeta(d)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-5 py-3">
                        <Link href={`/tdi-admin/intelligence/districts/${d.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                          {d.name}
                        </Link>
                        <span className="ml-2 text-xs text-gray-400">{d.state}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          d.status === 'active' ? 'bg-green-100 text-green-700' :
                          d.status === 'pilot' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {riskBadge(meta.topRisk)}
                          {meta.openInvoices > 0 && (
                            <span className="text-xs text-gray-400">{meta.openInvoices} open</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {meta.deliveryPct !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  meta.deliveryPct >= 100 ? 'bg-green-500' :
                                  meta.deliveryPct >= 50 ? 'bg-amber-400' : 'bg-gray-300'
                                }`}
                                style={{ width: `${Math.min(100, meta.deliveryPct)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{meta.deliveryPct}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const badge = renewalHealthBadge(meta.health.tier)
                          return (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                              {badge.label} · {meta.health.score}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {meta.renewalDate
                          ? new Date(meta.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                          : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Open Tasks - 2/5 */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Open Tasks</h2>
            <span className="text-xs text-gray-400">{openTasks.length} open</span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : openTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No open tasks.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {openTasks.map((t) => (
                <li key={t.id} className="px-5 py-3 flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-gray-800 font-medium leading-snug">{t.title}</span>
                    {priorityBadge(t.priority)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {t.districts?.name && <span>{t.districts.name}</span>}
                    {t.due_date && (
                      <span className={new Date(t.due_date) < new Date() ? 'text-red-500 font-medium' : ''}>
                        Due {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
