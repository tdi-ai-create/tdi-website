// ============================================================
// TDI Renewal Health Score
// Single source of truth - used across all Intelligence Hub pages
// ============================================================

export type RenewalTier = 'strong' | 'watch' | 'at_risk' | 'critical' | 'unknown'

export type RenewalHealth = {
  score: number           // 0-100
  tier: RenewalTier
  label: string           // "Strong", "Watch", "At Risk", "Critical"
  color: string           // tailwind text color
  bg: string              // tailwind bg color
  border: string          // tailwind border color
  signals: RenewalSignal[]
  playbook: string[]      // recommended next actions
  daysUntilRenewal: number | null
}

export type RenewalSignal = {
  label: string
  score: number     // points earned for this signal (0 to max)
  max: number       // max points possible
  detail: string    // human-readable explanation
  status: 'good' | 'warn' | 'bad' | 'neutral'
}

// ---- Scoring weights ----
// Delivery completion:    30 pts
// Collections health:     25 pts
// Renewal proximity:      20 pts
// Next session scheduled: 15 pts
// Task backlog:           10 pts
// Total:                 100 pts

export function calculateRenewalHealth(params: {
  contracts: any[]
  sessions: any[]        // service_sessions OR merged district_delivery_events
  invoices: any[]        // intelligence_invoices with collections_workflow
  tasks: any[]           // intelligence_tasks
}): RenewalHealth {
  const { contracts, sessions, invoices, tasks } = params
  const signals: RenewalSignal[] = []

  // ---- 1. Delivery Completion (30 pts) ----
  const activeContracts = contracts.filter(c => c.status === 'active')
  let totalContracted = 0
  const totalDelivered = sessions.length

  activeContracts.forEach(c => {
    const s = c.scope_json ?? {}
    totalContracted +=
      (parseInt(s.observation_days ?? 0)) +
      (parseInt(s.virtual_sessions ?? 0)) +
      (parseInt(s.executive_sessions ?? 0)) +
      (parseInt(s.love_notes ?? 0)) +
      (parseInt(s.keynotes ?? 0))
  })

  let deliveryScore = 0
  let deliveryDetail = 'No contracted sessions found'
  let deliveryStatus: RenewalSignal['status'] = 'neutral'

  if (totalContracted > 0) {
    const pct = Math.min(1, totalDelivered / totalContracted)
    deliveryScore = Math.round(pct * 30)
    deliveryDetail = `${totalDelivered} of ${totalContracted} contracted sessions delivered (${Math.round(pct * 100)}%)`
    deliveryStatus = pct >= 0.75 ? 'good' : pct >= 0.4 ? 'warn' : 'bad'
  }

  signals.push({
    label: 'Delivery Completion',
    score: deliveryScore,
    max: 30,
    detail: deliveryDetail,
    status: deliveryStatus,
  })

  // ---- 2. Collections Health (25 pts) ----
  const allCollections = invoices.flatMap((inv: any) => inv.collections_workflow ?? [])
  const hasCritical = allCollections.some((c: any) => c.risk_flag === 'critical')
  const hasAtRisk = allCollections.some((c: any) => c.risk_flag === 'at_risk')
  const hasOverdue = invoices.some((inv: any) => inv.status === 'overdue')
  const openInvoices = invoices.filter((inv: any) => !['paid', 'void'].includes(inv.status))

  let collectionsScore = 25
  let collectionsDetail = 'No collection issues'
  let collectionsStatus: RenewalSignal['status'] = 'good'

  if (hasCritical) {
    collectionsScore = 0
    collectionsDetail = 'Critical collection issue - immediate attention needed'
    collectionsStatus = 'bad'
  } else if (hasAtRisk || hasOverdue) {
    collectionsScore = 10
    collectionsDetail = 'At-risk invoice or overdue payment - follow up needed'
    collectionsStatus = 'warn'
  } else if (openInvoices.length > 0) {
    collectionsScore = 20
    collectionsDetail = `${openInvoices.length} open invoice(s) - collections in progress`
    collectionsStatus = 'warn'
  }

  signals.push({
    label: 'Collections Health',
    score: collectionsScore,
    max: 25,
    detail: collectionsDetail,
    status: collectionsStatus,
  })

  // ---- 3. Renewal Deadline Proximity (20 pts) ----
  const today = new Date()
  const renewalDates = activeContracts
    .filter(c => c.renewal_deadline_date)
    .map(c => new Date(c.renewal_deadline_date))
    .sort((a, b) => a.getTime() - b.getTime())

  const nextRenewal = renewalDates[0] ?? null
  const daysUntilRenewal = nextRenewal
    ? Math.round((nextRenewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  let proximityScore = 10 // neutral if no renewal date set
  let proximityDetail = 'No renewal deadline set'
  let proximityStatus: RenewalSignal['status'] = 'neutral'

  if (daysUntilRenewal !== null) {
    if (daysUntilRenewal > 90) {
      proximityScore = 20
      proximityDetail = `${daysUntilRenewal} days until renewal - plenty of runway`
      proximityStatus = 'good'
    } else if (daysUntilRenewal > 30) {
      proximityScore = 12
      proximityDetail = `${daysUntilRenewal} days until renewal - start conversation soon`
      proximityStatus = 'warn'
    } else if (daysUntilRenewal > 0) {
      proximityScore = 4
      proximityDetail = `${daysUntilRenewal} days until renewal - urgent conversation needed`
      proximityStatus = 'bad'
    } else {
      proximityScore = 0
      proximityDetail = 'Renewal deadline has passed'
      proximityStatus = 'bad'
    }
  }

  signals.push({
    label: 'Renewal Timeline',
    score: proximityScore,
    max: 20,
    detail: proximityDetail,
    status: proximityStatus,
  })

  // ---- 4. Next Session Scheduled (15 pts) ----
  const futureSessions = sessions.filter(
    (s: any) => new Date(s.session_date) > today
  )
  const nextSession = futureSessions.sort(
    (a: any, b: any) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  )[0] ?? null

  let sessionScore = 0
  let sessionDetail = 'No upcoming sessions scheduled'
  let sessionStatus: RenewalSignal['status'] = 'bad'

  if (nextSession) {
    const daysUntilSession = Math.round(
      (new Date(nextSession.session_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    sessionScore = 15
    sessionDetail = `Next session in ${daysUntilSession} days - ${nextSession.title ?? nextSession.session_type}`
    sessionStatus = 'good'
  } else if (totalContracted === 0) {
    sessionScore = 15 // Hub-only or membership - no sessions expected
    sessionDetail = 'Hub-only partnership - no sessions required'
    sessionStatus = 'neutral'
  }

  signals.push({
    label: 'Next Session Scheduled',
    score: sessionScore,
    max: 15,
    detail: sessionDetail,
    status: sessionStatus,
  })

  // ---- 5. Task Backlog (10 pts) ----
  const openTasks = tasks.filter((t: any) => t.status !== 'done')
  const overdueTasks = openTasks.filter(
    (t: any) => t.due_date && new Date(t.due_date) < today
  )

  let taskScore = 10
  let taskDetail = 'No overdue tasks'
  let taskStatus: RenewalSignal['status'] = 'good'

  if (overdueTasks.length >= 3) {
    taskScore = 0
    taskDetail = `${overdueTasks.length} overdue tasks - follow-up backlog building`
    taskStatus = 'bad'
  } else if (overdueTasks.length > 0) {
    taskScore = 5
    taskDetail = `${overdueTasks.length} overdue task(s) - needs attention`
    taskStatus = 'warn'
  } else if (openTasks.length > 5) {
    taskScore = 7
    taskDetail = `${openTasks.length} open tasks - manageable but watch the backlog`
    taskStatus = 'warn'
  }

  signals.push({
    label: 'Task Backlog',
    score: taskScore,
    max: 10,
    detail: taskDetail,
    status: taskStatus,
  })

  // ---- Final Score + Tier ----
  const score = signals.reduce((sum, s) => sum + s.score, 0)

  let tier: RenewalTier
  let label: string
  let color: string
  let bg: string
  let border: string

  if (score >= 75) {
    tier = 'strong'
    label = 'Strong'
    color = 'text-green-700'
    bg = 'bg-green-50'
    border = 'border-green-200'
  } else if (score >= 50) {
    tier = 'watch'
    label = 'Watch'
    color = 'text-amber-700'
    bg = 'bg-amber-50'
    border = 'border-amber-200'
  } else if (score >= 25) {
    tier = 'at_risk'
    label = 'At Risk'
    color = 'text-orange-700'
    bg = 'bg-orange-50'
    border = 'border-orange-200'
  } else {
    tier = 'critical'
    label = 'Critical'
    color = 'text-red-700'
    bg = 'bg-red-50'
    border = 'border-red-200'
  }

  // ---- Playbook: recommended next actions based on weak signals ----
  const playbook: string[] = []

  if (deliveryScore < 15 && totalContracted > 0) {
    playbook.push('Schedule remaining contracted sessions before contract end date')
  }
  if (collectionsScore < 20) {
    playbook.push('Resolve outstanding invoice or collections issue before renewal conversation')
  }
  if (daysUntilRenewal !== null && daysUntilRenewal <= 90) {
    playbook.push('Initiate renewal conversation - send proposal and schedule exec session')
  }
  if (sessionScore === 0 && totalContracted > 0) {
    playbook.push('Log or schedule next service session to maintain momentum')
  }
  if (overdueTasks.length > 0) {
    playbook.push(`Clear ${overdueTasks.length} overdue task(s) to show follow-through`)
  }
  if (playbook.length === 0) {
    playbook.push('Partnership is on track - maintain current momentum and begin renewal conversation')
  }

  return {
    score,
    tier,
    label,
    color,
    bg,
    border,
    signals,
    playbook,
    daysUntilRenewal,
  }
}

// Compact badge for tables
export function renewalHealthBadge(tier: RenewalTier): { bg: string; text: string; label: string } {
  switch (tier) {
    case 'strong':   return { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Strong' }
    case 'watch':    return { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Watch' }
    case 'at_risk':  return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'At Risk' }
    case 'critical': return { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Critical' }
    default:         return { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Unknown' }
  }
}
