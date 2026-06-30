// ============================================================
// Funding Alert Rules Engine
// Calculates actionable alerts for the funding dashboard
// Pattern: /lib/tdi-admin/alert-rules.ts
// ============================================================

export type FundingAlertSeverity = 'critical' | 'warning' | 'info'

export interface FundingAlert {
  id: string
  severity: FundingAlertSeverity
  category: 'deadline' | 'stalled' | 'client_action' | 'tdi_action' | 'submission' | 'email'
  pursuit_id: string
  pursuit_name: string
  opportunity_id?: string
  opportunity_name?: string
  title: string
  description: string
  action: string
}

export function calculateFundingAlerts(params: {
  opportunities: any[]
  actionItems: any[]
  pursuits: any[]
}): FundingAlert[] {
  const { opportunities, actionItems, pursuits } = params
  const alerts: FundingAlert[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build pursuit name lookup
  const pursuitNames: Record<string, string> = {}
  pursuits.forEach(p => { pursuitNames[p.id] = p.pursuit_name || p.district_name || 'Unknown' })

  // ---- DEADLINE ALERTS ----
  opportunities.forEach(opp => {
    if (!opp.application_closes) return
    if (['awarded', 'denied'].includes(opp.status)) return

    const deadline = new Date(opp.application_closes + 'T00:00:00')
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const pursuitName = pursuitNames[opp.pursuit_id] || 'Unknown'

    if (daysUntil <= 3 && !opp.client_submitted) {
      alerts.push({
        id: `deadline-critical-${opp.id}`,
        severity: 'critical',
        category: 'deadline',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} deadline in ${daysUntil <= 0 ? 'PAST DUE' : `${daysUntil} days`}`,
        description: `Client has not submitted. Application closes ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
        action: 'Send urgent nudge email to client',
      })
    } else if (daysUntil <= 14 && daysUntil > 3) {
      alerts.push({
        id: `deadline-warning-${opp.id}`,
        severity: 'warning',
        category: 'deadline',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} deadline in ${daysUntil} days`,
        description: `Application closes ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
        action: opp.client_submitted ? 'Confirm submission received' : 'Send reminder to client',
      })
    }
  })

  // ---- STALLED OPPORTUNITY ALERTS ----
  opportunities.forEach(opp => {
    if (['awarded', 'denied'].includes(opp.status)) return
    if (!opp.last_activity_at) return

    const lastActivity = new Date(opp.last_activity_at)
    const daysSinceActivity = Math.ceil((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    const pursuitName = pursuitNames[opp.pursuit_id] || 'Unknown'

    if (daysSinceActivity >= 21 && opp.waiting_on === 'client') {
      alerts.push({
        id: `stalled-critical-${opp.id}`,
        severity: 'critical',
        category: 'stalled',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} stalled ${daysSinceActivity} days (waiting on client)`,
        description: `No activity since ${lastActivity.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
        action: 'Escalate: call client directly',
      })
    } else if (daysSinceActivity >= 14) {
      alerts.push({
        id: `stalled-warning-${opp.id}`,
        severity: 'warning',
        category: 'stalled',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} no activity for ${daysSinceActivity} days`,
        description: `Last activity: ${lastActivity.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
        action: 'Check in on status',
      })
    }
  })

  // ---- OVERDUE ACTION ITEM ALERTS ----
  actionItems.forEach(item => {
    if (['done', 'skipped'].includes(item.status)) return
    if (!item.due_date) return

    const dueDate = new Date(item.due_date + 'T00:00:00')
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const pursuitName = pursuitNames[item.pursuit_id] || 'Unknown'

    if (daysOverdue > 0) {
      const category = item.owner_type === 'client' ? 'client_action' : 'tdi_action'
      alerts.push({
        id: `overdue-${item.id}`,
        severity: item.owner_type === 'client' ? 'critical' : 'warning',
        category,
        pursuit_id: item.pursuit_id,
        pursuit_name: pursuitName,
        title: `${item.owner_type === 'client' ? 'Client' : 'TDI'} action overdue: ${item.title}`,
        description: `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${daysOverdue} days ago). Owner: ${item.owner_name || item.owner_email || 'Unassigned'}`,
        action: item.owner_type === 'client' ? 'Send nudge to client' : 'Complete or reassign',
      })
    }
  })

  // Sort: critical first, then warning, then info
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return alerts
}
