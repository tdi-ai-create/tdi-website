// ============================================================
// TDI Alert Rules Engine
// Calculates specific actionable alerts per district
// Used by Command Center, Alert Center, and daily email digest
// ============================================================

export type AlertSeverity = 'critical' | 'warning' | 'info'

export type Alert = {
  id: string
  severity: AlertSeverity
  category: 'collections' | 'renewal' | 'delivery' | 'tasks' | 'meetings'
  district_id: string
  district_name: string
  title: string
  description: string
  action: string // recommended next step
  href: string // link to the relevant page
  created_at: Date
}

export function calculateAlerts(params: {
  districts: any[]
  sessionsByDistrict: Record<string, any[]>
}): Alert[] {
  const { districts, sessionsByDistrict } = params
  const alerts: Alert[] = []
  const today = new Date()

  districts.forEach(district => {
    const districtHref = `/tdi-admin/intelligence/districts/${district.id}`
    const invoices = district.intelligence_invoices ?? []
    const contracts = district.intelligence_contracts ?? []
    const tasks = district.intelligence_tasks ?? []
    const meetings = district.district_meetings ?? []
    const sessions = sessionsByDistrict[district.id] ?? []
    const activeContract = contracts.find((c: any) => c.status === 'active')

    // ---- COLLECTIONS ALERTS ----

    // Critical: invoice flagged critical
    const criticalInvoices = invoices.filter((inv: any) =>
      inv.collections_workflow?.some((cw: any) => cw.risk_flag === 'critical')
    )
    criticalInvoices.forEach((inv: any) => {
      alerts.push({
        id: `critical-${inv.id}`,
        severity: 'critical',
        category: 'collections',
        district_id: district.id,
        district_name: district.name,
        title: `Critical Collection - ${inv.invoice_number}`,
        description: `Invoice ${inv.invoice_number}${inv.amount ? ` ($${Number(inv.amount).toLocaleString()})` : ''} is flagged critical risk.`,
        action: 'Review collections workflow and escalate if needed.',
        href: `${districtHref}?tab=contracts`,
        created_at: today,
      })
    })

    // Warning: invoice overdue
    const overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue')
    overdueInvoices.forEach((inv: any) => {
      alerts.push({
        id: `overdue-${inv.id}`,
        severity: 'warning',
        category: 'collections',
        district_id: district.id,
        district_name: district.name,
        title: `Overdue Invoice - ${district.name}`,
        description: `Invoice ${inv.invoice_number}${inv.amount ? ` ($${Number(inv.amount).toLocaleString()})` : ''} is overdue.`,
        action: 'Contact AP office and log a payment event.',
        href: `${districtHref}?tab=contracts`,
        created_at: today,
      })
    })

    // Warning: follow-up date passed
    const pastFollowUps = invoices.flatMap((inv: any) =>
      (inv.collections_workflow ?? []).filter((cw: any) =>
        cw.next_follow_up_at && new Date(cw.next_follow_up_at) < today &&
        !['paid', 'void'].includes(inv.status)
      )
    )
    if (pastFollowUps.length > 0) {
      alerts.push({
        id: `followup-${district.id}`,
        severity: 'warning',
        category: 'collections',
        district_id: district.id,
        district_name: district.name,
        title: `Overdue Follow-up - ${district.name}`,
        description: `${pastFollowUps.length} invoice(s) have passed their follow-up date without contact.`,
        action: 'Log a payment event and update the next follow-up date.',
        href: `${districtHref}?tab=contracts`,
        created_at: today,
      })
    }

    // ---- RENEWAL ALERTS ----

    // Critical: renewal deadline within 30 days
    const urgentRenewals = contracts.filter((c: any) => {
      if (!c.renewal_deadline_date || c.status !== 'active') return false
      const days = (new Date(c.renewal_deadline_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return days >= 0 && days <= 30
    })
    urgentRenewals.forEach((c: any) => {
      const days = Math.round((new Date(c.renewal_deadline_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      alerts.push({
        id: `renewal-urgent-${c.id}`,
        severity: 'critical',
        category: 'renewal',
        district_id: district.id,
        district_name: district.name,
        title: `Renewal in ${days} Days - ${district.name}`,
        description: `Contract "${c.contract_name}" renews in ${days} days.`,
        action: 'Send renewal proposal and schedule executive impact session.',
        href: `${districtHref}?tab=contracts`,
        created_at: today,
      })
    })

    // Warning: renewal deadline within 60-90 days
    const approachingRenewals = contracts.filter((c: any) => {
      if (!c.renewal_deadline_date || c.status !== 'active') return false
      const days = (new Date(c.renewal_deadline_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return days > 30 && days <= 90
    })
    approachingRenewals.forEach((c: any) => {
      const days = Math.round((new Date(c.renewal_deadline_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      alerts.push({
        id: `renewal-approaching-${c.id}`,
        severity: 'warning',
        category: 'renewal',
        district_id: district.id,
        district_name: district.name,
        title: `Renewal in ${days} Days - ${district.name}`,
        description: `Contract "${c.contract_name}" renews in ${days} days.`,
        action: 'Begin renewal conversation and prepare proposal.',
        href: `${districtHref}?tab=contracts`,
        created_at: today,
      })
    })

    // ---- DELIVERY ALERTS ----

    if (activeContract?.end_date && activeContract.scope_json) {
      const daysUntilEnd = (new Date(activeContract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      const scope = activeContract.scope_json ?? {}
      const totalContracted =
        (parseInt(scope.observation_days ?? 0)) +
        (parseInt(scope.virtual_sessions ?? 0)) +
        (parseInt(scope.executive_sessions ?? 0)) +
        (parseInt(scope.love_notes ?? 0)) +
        (parseInt(scope.keynotes ?? 0))

      if (totalContracted > 0 && daysUntilEnd > 0) {
        const deliveryPct = sessions.length / totalContracted
        const timePct = 1 - (daysUntilEnd / 365)

        // Critical: less than 25% delivered with less than 30 days left
        if (deliveryPct < 0.25 && daysUntilEnd <= 30) {
          alerts.push({
            id: `delivery-critical-${district.id}`,
            severity: 'critical',
            category: 'delivery',
            district_id: district.id,
            district_name: district.name,
            title: `Delivery at Risk - ${district.name}`,
            description: `Only ${sessions.length} of ${totalContracted} contracted sessions delivered with ${Math.round(daysUntilEnd)} days remaining.`,
            action: 'Schedule remaining sessions immediately.',
            href: `${districtHref}?tab=delivery`,
            created_at: today,
          })
        }
        // Warning: behind pace
        else if (deliveryPct < 0.5 && timePct > 0.5 && daysUntilEnd <= 90) {
          alerts.push({
            id: `delivery-warning-${district.id}`,
            severity: 'warning',
            category: 'delivery',
            district_id: district.id,
            district_name: district.name,
            title: `Delivery Behind Pace - ${district.name}`,
            description: `${sessions.length} of ${totalContracted} sessions delivered. Contract ends in ${Math.round(daysUntilEnd)} days.`,
            action: 'Review delivery schedule and book upcoming sessions.',
            href: `${districtHref}?tab=delivery`,
            created_at: today,
          })
        }
      }
    }

    // ---- TASK ALERTS ----

    const overdueTasks = tasks.filter((t: any) =>
      t.status !== 'done' && t.due_date && new Date(t.due_date) < today
    )
    if (overdueTasks.length >= 2) {
      alerts.push({
        id: `tasks-${district.id}`,
        severity: 'warning',
        category: 'tasks',
        district_id: district.id,
        district_name: district.name,
        title: `${overdueTasks.length} Overdue Tasks - ${district.name}`,
        description: `${overdueTasks.length} tasks are past their due date.`,
        action: 'Review and complete or reschedule overdue tasks.',
        href: `${districtHref}?tab=overview`,
        created_at: today,
      })
    }

    // ---- MEETING ALERTS ----

    // Warning: no meeting in 60+ days for active district
    const sortedMeetings = [...meetings].sort((a: any, b: any) =>
      new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
    )
    const lastMeeting = sortedMeetings[0]
    const daysSinceLastMeeting = lastMeeting
      ? (today.getTime() - new Date(lastMeeting.meeting_date).getTime()) / (1000 * 60 * 60 * 24)
      : null

    if (district.status === 'active' && (daysSinceLastMeeting === null || daysSinceLastMeeting > 60)) {
      alerts.push({
        id: `meetings-${district.id}`,
        severity: 'info',
        category: 'meetings',
        district_id: district.id,
        district_name: district.name,
        title: `No Recent Meeting - ${district.name}`,
        description: daysSinceLastMeeting
          ? `Last meeting was ${Math.round(daysSinceLastMeeting)} days ago.`
          : 'No meetings logged for this district.',
        action: 'Schedule a check-in or executive impact session.',
        href: `${districtHref}?tab=meetings`,
        created_at: today,
      })
    }
  })

  // Sort: critical first, then warning, then info
  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })
}

// Format alerts for email digest
export function formatAlertsForEmail(alerts: Alert[], date: Date): string {
  if (alerts.length === 0) {
    return `<p>No active alerts today. All districts are on track.</p>`
  }

  const critical = alerts.filter(a => a.severity === 'critical')
  const warnings = alerts.filter(a => a.severity === 'warning')
  const info = alerts.filter(a => a.severity === 'info')

  const formatSection = (title: string, items: Alert[], color: string) => {
    if (items.length === 0) return ''
    return `
      <h3 style="color: ${color}; margin: 24px 0 12px;">${title} (${items.length})</h3>
      ${items.map(a => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
          <p style="font-weight: 600; margin: 0 0 4px; color: #111827;">${a.title}</p>
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 14px;">${a.description}</p>
          <p style="margin: 0; color: #f59e0b; font-size: 14px;">&rarr; ${a.action}</p>
        </div>
      `).join('')}
    `
  }

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">TDI Daily Alert Digest</h1>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">
          ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; margin: 0 0 16px;">
          <strong>${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}</strong> across your district portfolio.
        </p>
        ${formatSection('Critical', critical, '#dc2626')}
        ${formatSection('Warnings', warnings, '#d97706')}
        ${formatSection('Info', info, '#6b7280')}
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <a href="https://www.teachersdeserveit.com/tdi-admin/intelligence/alerts"
             style="background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View Alert Center &rarr;
          </a>
        </div>
      </div>
    </div>
  `
}
