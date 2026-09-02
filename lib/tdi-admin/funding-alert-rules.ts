// ============================================================
// Funding Alert Rules Engine
// Calculates actionable alerts for the funding dashboard
// Pattern: /lib/tdi-admin/alert-rules.ts
// ============================================================

// Same threshold the queue uses to decide QA has gone quiet, imported rather
// than restated so the digest and the queue can never disagree about it.
import { QA_SILENCE_HOURS as QA_STALLED_HOURS } from '@/lib/funding-qa'

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

    // A closed window is not a deadline alert, and the distinction is not
    // cosmetic.
    //
    // The rule below was `daysUntil <= 3` with no lower bound, so a deadline
    // stayed critical forever once it passed, and its action stayed "send an
    // urgent nudge email to client". The reminders cron drafts a client email
    // for every critical alert in the deadline category, so on 1 September it
    // wrote two emails telling schools that a Walmart window was "closing
    // soon". It had closed on 31 August. Telling a school to hurry toward a
    // door that already shut is worse than saying nothing.
    //
    // Once the date passes there is nothing left to ask the school for, so this
    // becomes internal work: record what actually happened. Filing it under
    // tdi_action rather than deadline is also what stops the drafting, because
    // the cron only drafts for the deadline category.
    if (daysUntil < 0 && !opp.client_submitted) {
      const closedAgo = Math.abs(daysUntil)
      alerts.push({
        id: `deadline-closed-${opp.id}`,
        severity: 'critical',
        category: 'tdi_action',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} closed ${closedAgo} day${closedAgo === 1 ? '' : 's'} ago`,
        description: `The window closed ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} and nothing was submitted. Until the outcome is recorded this keeps being chased.`,
        action: 'Record the outcome: submitted late, missed, or no longer applicable',
      })
    } else if (daysUntil >= 0 && daysUntil <= 3 && !opp.client_submitted) {
      alerts.push({
        id: `deadline-critical-${opp.id}`,
        severity: 'critical',
        category: 'deadline',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} deadline in ${daysUntil === 0 ? 'TODAY' : `${daysUntil} days`}`,
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

  // ---- AWAITING A FUNDER DECISION ----
  //
  // The 'submission' category existed in the type union above from the day this
  // file was written and was never once emitted. The effect was that the
  // pipeline pushed applications out to funders and had no way to pull the
  // answer back: the moment waiting_on became 'funder' nothing watched the row
  // again. Allenwood's NEA application sat 63 days with no item tracking it and
  // no alert naming it.
  //
  // The clock here is days since the school submitted, not last_activity_at.
  // Activity timestamps move whenever any cron touches a row, so they measure
  // how recently the system looked at something rather than how long the school
  // has been waiting, which is the number that matters.
  opportunities.forEach(opp => {
    if (['awarded', 'denied'].includes(opp.status)) return
    if (!opp.client_submitted || opp.waiting_on !== 'funder') return
    if (!opp.client_submitted_at) return

    const submitted = new Date(opp.client_submitted_at)
    const daysWaiting = Math.ceil((today.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
    const pursuitName = pursuitNames[opp.pursuit_id] || 'Unknown'
    const submittedLabel = submitted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // The school is the applicant on nearly every one of these, so the funder
    // replies to them and not to us. Asking the school what they have heard is
    // the step that actually produces an answer; contacting the funder directly
    // is the fallback, not the opener.
    if (daysWaiting >= 60) {
      alerts.push({
        id: `submission-critical-${opp.id}`,
        severity: 'critical',
        category: 'submission',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} has been with the funder ${daysWaiting} days`,
        description: `Submitted ${submittedLabel}. No decision recorded. Most funders decide well inside this window, so an answer may already exist that we have not captured.`,
        action: 'Ask the school whether they have heard back, then record the award or denial',
      })
    } else if (daysWaiting >= 30) {
      alerts.push({
        id: `submission-warning-${opp.id}`,
        severity: 'warning',
        category: 'submission',
        pursuit_id: opp.pursuit_id,
        pursuit_name: pursuitName,
        opportunity_id: opp.id,
        opportunity_name: opp.name,
        title: `${opp.name} awaiting a decision for ${daysWaiting} days`,
        description: `Submitted ${submittedLabel}.`,
        action: 'Check in with the school on whether the funder has responded',
      })
    }
  })

  // ---- STALLED OPPORTUNITY ALERTS ----
  opportunities.forEach(opp => {
    if (['awarded', 'denied'].includes(opp.status)) return
    if (!opp.last_activity_at) return

    // Rows waiting on a funder belong to the rule above. Without this the same
    // opportunity produces two alerts that say different things: one measuring
    // the wait for a decision, one measuring how recently a cron touched the
    // row. Bella would have to work out which number meant anything.
    if (opp.client_submitted && opp.waiting_on === 'funder') return

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

  // ---- STALLED QA ALERTS ----
  //
  // QA belongs to Julie alone. Nobody grades a narrative in her place, so a
  // stuck reviewer has to be loud: without this, a narrative in qa_review with
  // no verdict is indistinguishable from one being actively reviewed, and
  // silence reads as progress. The fix is always to unblock Julie.
  opportunities.forEach(opp => {
    if (opp.narrative_status !== 'qa_review' || opp.qa_passed === true) return
    if (['awarded', 'denied', 'closed'].includes(opp.status)) return

    const since = opp.narrative_status_changed_at || opp.updated_at
    if (!since) return

    const hoursWaiting = Math.floor((Date.now() - new Date(since).getTime()) / 3600000)
    if (hoursWaiting < QA_STALLED_HOURS) return

    alerts.push({
      id: `qa-stalled-${opp.id}`,
      severity: 'critical',
      category: 'stalled',
      pursuit_id: opp.pursuit_id,
      pursuit_name: pursuitNames[opp.pursuit_id] || 'Unknown',
      opportunity_id: opp.id,
      opportunity_name: opp.name,
      title: `${opp.name} has sat in QA for ${hoursWaiting} hours with no verdict`,
      description: `Julie has not passed or failed it. Attempt ${(opp.qa_attempt_count ?? 0) + 1}.`,
      action: 'Check whether Julie is running and unblock her. Do not grade it in her place.',
    })
  })

  // Sort: critical first, then warning, then info
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return alerts
}
