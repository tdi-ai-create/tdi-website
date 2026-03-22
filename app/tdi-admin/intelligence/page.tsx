'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, AlertTriangle, Clock, Calendar, FileCheck, TrendingDown, X, Mail, DollarSign, CheckCircle, Phone, Copy } from 'lucide-react'
import { calculateRenewalHealth, renewalHealthBadge } from '@/lib/tdi-admin/renewal-health'

type Tab = 'districts' | 'invoices'

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
  partnership_id: string | null
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

type InvoiceWithDetails = {
  id: string
  invoice_number: string
  invoice_date: string | null
  due_date: string | null
  amount: number | null
  status: string
  service_start_date: string | null
  service_end_date: string | null
  notes: string | null
  ap_requirements_json: Record<string, unknown> | null
  districts: { id: string; name: string; state: string | null; district_contacts?: { name: string; email: string | null; is_primary: boolean }[] } | null
  intelligence_contracts: { id: string; contract_name: string; scope_json?: Record<string, unknown> } | null
  collections_workflow: CollectionsWorkflow[] | null
  payment_events?: PaymentEvent[] | null
}

type PaymentEvent = {
  id: string
  event_type: string
  event_date: string
  summary: string | null
  payment_method?: string | null
  check_number?: string | null
  amount_received?: number | null
  created_at: string
}

type InvoiceSummary = {
  totalOutstanding: number
  totalOverdue: number
  dueThisMonth: number
  paidYTD: number
}

export default function IntelligenceHubPage() {
  const supabase = getSupabase()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('districts')
  const [alerts, setAlerts] = useState<AlertCard[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [openTasks, setOpenTasks] = useState<Task[]>([])
  const [deliveryByDistrict, setDeliveryByDistrict] = useState<Record<string, unknown[]>>({})

  // Invoices tab state
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary>({ totalOutstanding: 0, totalOverdue: 0, dueThisMonth: 0, paidYTD: 0 })
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Fetch active districts with invoice + collections + sessions + tasks data
    const { data: districtData } = await supabase
      .from('districts')
      .select(`
        id, name, state, segment, status, partnership_id,
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

    // Fetch merged delivery data from district_delivery_events view
    // This combines legacy timeline_events + service_sessions for accurate totals
    const { data: deliveryData } = await supabase
      .from('district_delivery_events' as any)
      .select('*')
      .not('session_date', 'is', null)
      .order('session_date', { ascending: false })

    // Group delivery data by district_id
    const deliveryMap: Record<string, any[]> = {}
    ;(deliveryData ?? []).forEach((d: any) => {
      if (!deliveryMap[d.district_id]) deliveryMap[d.district_id] = []
      deliveryMap[d.district_id].push(d)
    })
    setDeliveryByDistrict(deliveryMap)

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

    // Delivery at risk calculation - uses merged delivery data for accuracy
    const deliveryAtRiskCount = (districtData ?? []).filter(d => {
      const dContracts = d.intelligence_contracts ?? []
      // Use merged delivery data if available, fall back to service_sessions
      const dSessions = deliveryMap[d.id]?.length > 0 ? deliveryMap[d.id] : (d.service_sessions ?? [])
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

    // Load all invoices for the Invoices tab
    const { data: invoicesData } = await supabase
      .from('intelligence_invoices')
      .select(`
        *,
        districts (id, name, state, district_contacts (*)),
        intelligence_contracts (id, contract_name, scope_json),
        collections_workflow (*),
        payment_events (*)
      `)
      .order('invoice_date', { ascending: false })

    // Calculate invoice summary
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    let totalOutstanding = 0
    let totalOverdue = 0
    let dueThisMonth = 0
    let paidYTD = 0

    for (const inv of (invoicesData ?? [])) {
      const amount = parseFloat(String(inv.amount)) || 0
      const dueDate = inv.due_date ? new Date(inv.due_date) : null
      const paidDate = inv.status === 'paid' && inv.payment_events?.length > 0
        ? new Date(inv.payment_events.find((e: PaymentEvent) => e.event_type === 'paid')?.event_date ?? inv.invoice_date)
        : null

      if (inv.status === 'paid') {
        if (paidDate && paidDate >= startOfYear) {
          paidYTD += amount
        }
      } else if (!['void', 'draft'].includes(inv.status)) {
        totalOutstanding += amount
        if (dueDate && dueDate < now) {
          totalOverdue += amount
        }
        if (dueDate && dueDate >= startOfMonth && dueDate <= endOfMonth) {
          dueThisMonth += amount
        }
      }
    }

    setInvoices((invoicesData as unknown as InvoiceWithDetails[]) ?? [])
    setInvoiceSummary({ totalOutstanding, totalOverdue, dueThisMonth, paidYTD })
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

    // Delivery progress - use merged data if available
    const mergedSessions = deliveryByDistrict[d.id] ?? []
    const sessions = mergedSessions.length > 0 ? mergedSessions : (d.service_sessions ?? [])
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

    // Renewal health score - uses merged sessions for accuracy
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('districts')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === 'districts' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Districts
          </button>
          <button
            onClick={() => setTab('invoices')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === 'invoices' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Tab: Districts */}
      {tab === 'districts' && (
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
      )}

      {/* Tab: Invoices */}
      {tab === 'invoices' && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${invoiceSummary.totalOutstanding.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Outstanding</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">${invoiceSummary.totalOverdue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">${invoiceSummary.dueThisMonth.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Due This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${invoiceSummary.paidYTD.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Paid YTD</p>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">All Invoices</h2>
              <span className="text-xs text-gray-400">{invoices.length} invoices</span>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No invoices yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">District</th>
                      <th className="text-left px-3 py-3">Invoice #</th>
                      <th className="text-left px-3 py-3">Amount</th>
                      <th className="text-left px-3 py-3">Due Date</th>
                      <th className="text-left px-3 py-3">Status</th>
                      <th className="text-left px-3 py-3">Stage</th>
                      <th className="text-left px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => {
                      const cw = inv.collections_workflow?.[0]
                      const dueDate = inv.due_date ? new Date(inv.due_date) : null
                      const isOverdue = dueDate && dueDate < new Date() && !['paid', 'void'].includes(inv.status)
                      const daysOverdue = isOverdue ? Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

                      return (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <Link href={`/tdi-admin/intelligence/districts/${inv.districts?.id}`} className="font-medium text-gray-900 hover:text-amber-600">
                              {inv.districts?.name ?? 'Unknown'}
                            </Link>
                            <span className="ml-2 text-xs text-gray-400">{inv.districts?.state}</span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="font-medium text-amber-600 hover:underline"
                            >
                              {inv.invoice_number}
                            </button>
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {inv.amount != null ? `$${Number(inv.amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-3">
                            {dueDate ? (
                              <div>
                                <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                  {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                </span>
                                {isOverdue && (
                                  <span className="block text-xs text-red-500">{daysOverdue} days overdue</span>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                              inv.status === 'overdue' || isOverdue ? 'bg-red-100 text-red-700' :
                              inv.status === 'approved' ? 'bg-teal-100 text-teal-700' :
                              inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              inv.status === 'void' ? 'bg-gray-100 text-gray-500 line-through' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 capitalize">
                                {cw?.current_stage?.replace(/_/g, ' ') ?? '-'}
                              </span>
                              {cw?.risk_flag === 'critical' && (
                                <span className="text-xs font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">!</span>
                              )}
                              {cw?.risk_flag === 'at_risk' && (
                                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">!</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {inv.status === 'draft' && (
                                <button
                                  onClick={async () => {
                                    await supabase.from('intelligence_invoices').update({ status: 'sent' }).eq('id', inv.id)
                                    loadData()
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Mark Sent
                                </button>
                              )}
                              {!['paid', 'void'].includes(inv.status) && (
                                <button
                                  onClick={() => { setSelectedInvoice(inv); setShowMarkPaidModal(true) }}
                                  className="text-xs text-green-600 hover:underline"
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="text-xs text-gray-500 hover:underline"
                              >
                                View
                              </button>
                            </div>
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
      )}

      {/* Invoice Detail Slide-over Panel */}
      {selectedInvoice && !showMarkPaidModal && (
        <InvoiceDetailPanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={() => { setShowMarkPaidModal(true) }}
          onGenerateEmail={() => { setShowEmailModal(true) }}
          onRefresh={loadData}
        />
      )}

      {/* Mark Paid Modal */}
      {showMarkPaidModal && selectedInvoice && (
        <MarkPaidModal
          invoice={selectedInvoice}
          onClose={() => { setShowMarkPaidModal(false); setSelectedInvoice(null) }}
          onSaved={() => { setShowMarkPaidModal(false); setSelectedInvoice(null); loadData() }}
        />
      )}

      {/* Email Generation Modal */}
      {showEmailModal && selectedInvoice && (
        <EmailGeneratorModal
          invoice={selectedInvoice}
          onClose={() => { setShowEmailModal(false) }}
        />
      )}
    </div>
  )
}

// ---- Invoice Detail Slide-over Panel ----
function InvoiceDetailPanel({ invoice, onClose, onMarkPaid, onGenerateEmail, onRefresh }: {
  invoice: InvoiceWithDetails
  onClose: () => void
  onMarkPaid: () => void
  onGenerateEmail: () => void
  onRefresh: () => void
}) {
  const supabase = getSupabase()
  const cw = invoice.collections_workflow?.[0]
  const events = (invoice.payment_events ?? []).sort((a, b) =>
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  )
  const [showLogEvent, setShowLogEvent] = useState(false)
  const [logForm, setLogForm] = useState({ event_type: 'email_sent', event_date: new Date().toISOString().split('T')[0], summary: '' })
  const [saving, setSaving] = useState(false)

  const stages = ['submitted', 'ap_review', 'board_approval_pending', 'check_issued', 'paid']
  const currentStageIndex = stages.indexOf(cw?.current_stage ?? 'submitted')

  async function handleLogEvent() {
    if (!logForm.summary.trim()) return
    setSaving(true)
    await supabase.from('payment_events').insert({
      invoice_id: invoice.id,
      event_type: logForm.event_type,
      event_date: logForm.event_date,
      summary: logForm.summary.trim(),
    })
    await supabase.from('collections_workflow').update({
      last_contacted_at: new Date().toISOString()
    }).eq('invoice_id', invoice.id)
    setLogForm({ event_type: 'email_sent', event_date: new Date().toISOString().split('T')[0], summary: '' })
    setShowLogEvent(false)
    setSaving(false)
    onRefresh()
  }

  async function updateStage(newStage: string) {
    await supabase.from('collections_workflow').update({
      current_stage: newStage,
      last_contacted_at: new Date().toISOString()
    }).eq('invoice_id', invoice.id)
    onRefresh()
  }

  async function updateRiskFlag(flag: string) {
    await supabase.from('collections_workflow').update({
      risk_flag: flag
    }).eq('invoice_id', invoice.id)
    onRefresh()
  }

  const inputClass = "border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h2>
            <p className="text-sm text-gray-500">{invoice.districts?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-semibold text-gray-900">${Number(invoice.amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-medium text-gray-900">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Contract</p>
              <p className="font-medium text-gray-900">{invoice.intelligence_contracts?.contract_name ?? '-'}</p>
            </div>
          </div>

          {/* Service Period */}
          {(invoice.service_start_date || invoice.service_end_date) && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Service Period</p>
              <p className="text-sm text-gray-700">
                {invoice.service_start_date && new Date(invoice.service_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {invoice.service_start_date && invoice.service_end_date && ' - '}
                {invoice.service_end_date && new Date(invoice.service_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* AP Requirements */}
          {invoice.ap_requirements_json && Object.keys(invoice.ap_requirements_json).length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">AP Requirements</p>
              <div className="text-sm text-gray-700 space-y-1">
                {invoice.ap_requirements_json.po_required && <p>PO required</p>}
                {invoice.ap_requirements_json.board_approval_required && <p>Board approval required</p>}
                {invoice.ap_requirements_json.requirements_text && (
                  <p className="text-gray-600">{String(invoice.ap_requirements_json.requirements_text)}</p>
                )}
              </div>
            </div>
          )}

          {/* Collections Stage Tracker */}
          <div>
            <p className="text-xs text-gray-500 mb-3">Collections Stage</p>
            <div className="flex items-center gap-1">
              {stages.map((stage, idx) => (
                <div key={stage} className="flex items-center flex-1">
                  <button
                    onClick={() => updateStage(stage)}
                    className={`flex-1 py-2 px-1 text-xs text-center rounded transition-colors ${
                      idx <= currentStageIndex
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {stage.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Flag */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Risk Flag</p>
            <div className="flex gap-2">
              {['none', 'at_risk', 'critical'].map(flag => (
                <button
                  key={flag}
                  onClick={() => updateRiskFlag(flag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    cw?.risk_flag === flag
                      ? flag === 'critical' ? 'bg-red-500 text-white' :
                        flag === 'at_risk' ? 'bg-orange-500 text-white' :
                        'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {flag === 'none' ? 'Clear' : flag.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {!['paid', 'void'].includes(invoice.status) && (
              <button
                onClick={onMarkPaid}
                className="inline-flex items-center gap-1.5 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg"
              >
                <DollarSign className="w-4 h-4" />
                Mark Paid
              </button>
            )}
            <button
              onClick={() => setShowLogEvent(true)}
              className="inline-flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg"
            >
              <Phone className="w-4 h-4" />
              Log Contact
            </button>
            <button
              onClick={onGenerateEmail}
              className="inline-flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg"
            >
              <Mail className="w-4 h-4" />
              Generate Email
            </button>
          </div>

          {/* Log Event Form */}
          {showLogEvent && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <select className={inputClass} value={logForm.event_type} onChange={e => setLogForm(f => ({ ...f, event_type: e.target.value }))}>
                  <option value="email_sent">Email Sent</option>
                  <option value="call_made">Call Made</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="board_approval">Board Approval</option>
                  <option value="check_reissued">Check Reissued</option>
                  <option value="check_received">Check Received</option>
                  <option value="escalated">Escalated</option>
                  <option value="note">Note</option>
                </select>
                <input type="date" className={inputClass} value={logForm.event_date} onChange={e => setLogForm(f => ({ ...f, event_date: e.target.value }))} />
              </div>
              <input
                className={`${inputClass} w-full`}
                value={logForm.summary}
                onChange={e => setLogForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="Brief summary..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLogEvent}
                  disabled={saving || !logForm.summary.trim()}
                  className="text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Log Event'}
                </button>
                <button onClick={() => setShowLogEvent(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Collections Timeline */}
          <div>
            <p className="text-xs text-gray-500 mb-3">Collections Timeline</p>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400">No events logged yet.</p>
            ) : (
              <div className="space-y-3 border-l-2 border-amber-200 pl-4">
                {events.map((e) => (
                  <div key={e.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-sm font-medium text-gray-800 capitalize">{e.event_type.replace(/_/g, ' ')}</p>
                    {e.summary && <p className="text-sm text-gray-600">{e.summary}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Mark Paid Modal ----
function MarkPaidModal({ invoice, onClose, onSaved }: {
  invoice: InvoiceWithDetails
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = getSupabase()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount_received: String(invoice.amount || ''),
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'check',
    check_number: '',
    notes: '',
  })

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  async function handleSave() {
    setSaving(true)

    // Update invoice status
    await supabase.from('intelligence_invoices').update({ status: 'paid' }).eq('id', invoice.id)

    // Update collections workflow
    await supabase.from('collections_workflow').update({
      current_stage: 'paid',
      risk_flag: 'none'
    }).eq('invoice_id', invoice.id)

    // Create payment event
    const summary = [
      `Received $${parseFloat(form.amount_received || '0').toLocaleString()}`,
      form.payment_method ? `via ${form.payment_method}` : null,
      form.check_number ? `(Check #${form.check_number})` : null,
      form.notes ? `- ${form.notes}` : null,
    ].filter(Boolean).join(' ')

    await supabase.from('payment_events').insert({
      invoice_id: invoice.id,
      event_type: 'paid',
      event_date: form.payment_date,
      summary,
      payment_method: form.payment_method || null,
      check_number: form.check_number.trim() || null,
      amount_received: form.amount_received ? parseFloat(form.amount_received) : null,
    })

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Mark Invoice Paid</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
          <p className="text-sm text-gray-500">{invoice.districts?.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Amount Received ($)</label>
            <input type="number" className={inputClass} value={form.amount_received} onChange={e => setForm(f => ({ ...f, amount_received: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Date Received</label>
            <input type="date" className={inputClass} value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Payment Method</label>
            <select className={inputClass} value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
              <option value="check">Check</option>
              <option value="ach">ACH</option>
              <option value="wire">Wire</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Check Number</label>
            <input className={inputClass} value={form.check_number} onChange={e => setForm(f => ({ ...f, check_number: e.target.value }))} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {saving ? 'Saving...' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Email Generator Modal ----
function EmailGeneratorModal({ invoice, onClose }: {
  invoice: InvoiceWithDetails
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const primaryContact = invoice.districts?.district_contacts?.find(c => c.is_primary) ?? invoice.districts?.district_contacts?.[0]
  const contactName = primaryContact?.name ?? 'AP Team'
  const scope = invoice.intelligence_contracts?.scope_json
  const scopeSummary = scope ? Object.entries(scope)
    .filter(([, v]) => v && Number(v) > 0)
    .map(([k, v]) => `${v} ${k.replace(/_/g, ' ')}`)
    .join(', ') : ''

  const serviceRange = invoice.service_start_date && invoice.service_end_date
    ? `${new Date(invoice.service_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(invoice.service_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : ''

  const apReqs = invoice.ap_requirements_json
  const poLine = apReqs?.po_required ? '\n\nPlease reference PO #_______ when processing payment.' : ''
  const boardLine = apReqs?.board_approval_required ? '\n\nPlease confirm board approval date so we can track expected payment.' : ''

  const subject = `Invoice ${invoice.invoice_number} - ${invoice.districts?.name} - Due ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}`

  const body = `Hi ${contactName},

Please find attached invoice ${invoice.invoice_number} for ${invoice.districts?.name} in the amount of $${Number(invoice.amount || 0).toLocaleString()}, due ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'upon receipt'}.

This invoice covers: ${serviceRange}${scopeSummary ? ` - ${scopeSummary}` : ''}${poLine}${boardLine}

Payment can be made by check payable to Teachers Deserve It:
Teachers Deserve It
[ADDRESS LINE 1]
[ADDRESS LINE 2]

Questions? Contact billing@teachersdeserveit.com

Thank you,
[RAE/OMAR NAME]
Teachers Deserve It`

  function handleCopy() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Generate Invoice Email</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Subject</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">{subject}</div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Body</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono">{body}</div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Close</button>
          <button onClick={handleCopy} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-lg inline-flex items-center gap-2">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}
