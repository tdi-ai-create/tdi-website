/**
 * Computes the prioritized "What's Next" action list for a funding pursuit.
 * Pure function — no side effects, no DB calls.
 *
 * Ownership model:
 *   bella  — the operator (verify, approve, send, mark done)
 *   rae    — decisions only (allocate awards, contract values, final escalation)
 *   agent  — automatic (drafting, research, QA, engine)
 *   school — ball in client's court (nudged, waiting)
 *   auto   — engine handles it (reminders, escalations)
 */

export type ActionOwner = 'bella' | 'rae' | 'agent' | 'school' | 'auto'
export type ActionUrgency = 'critical' | 'high' | 'normal' | 'low'

export interface NextAction {
  id: string
  label: string
  why: string
  owner: ActionOwner
  urgency: ActionUrgency
  dueDate?: string | null
  actionType: string
  targetId?: string | null
  tab?: string // which tab to navigate to
  inProgress?: boolean // visually mute — no human action needed
}

export function computeNextActions(
  pursuit: any,
  opportunities: any[],
  actions: any[],
  gate: any,
  allocations: any[],
): NextAction[] {
  const result: NextAction[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Detect unstarted pursuits: no opportunities, no gate, no action items
  const isUnstarted = opportunities.length === 0 && !gate && actions.length === 0
  if (isUnstarted) {
    const contactName = pursuit.client_contact_name || 'the school contact'
    const contactEmail = pursuit.client_contact_email || ''
    const schoolName = pursuit.district_name || pursuit.pursuit_name || 'this school'
    result.push({
      id: `intro-${pursuit.id}`,
      label: `Send intro email to ${contactName}`,
      why: `Introduce yourself as their TDI funding contact${contactEmail ? ` (${contactEmail})` : ''}. Let them know you'll be identifying grant opportunities for ${schoolName}.`,
      owner: 'bella',
      urgency: 'normal',
      actionType: 'setup_pursuit',
      tab: 'overview',
    })
    result.push({
      id: `map-${pursuit.id}`,
      label: 'Add grant opportunities for this school',
      why: `Open the pursuit, go to Grant Opportunities section, and add 3-5 grants this school is eligible for (Walmart Spark, Title II-A, NEA, local foundations). Set plan categories A-D.`,
      owner: 'bella',
      urgency: 'low',
      actionType: 'setup_pursuit',
      tab: 'opportunities',
    })
    return result
  }

  // Detect whether pursuit is in-flight (has opportunities or gate) for profile noise gating
  const isInFlight = opportunities.length > 0 || !!gate

  const pendingActions = actions.filter((a: any) =>
    a.status === 'pending' || a.status === 'in_progress'
  )

  // ── CRITICAL ──

  // Overdue action items
  for (const a of pendingActions) {
    if (!a.due_date) continue
    const due = new Date(a.due_date + 'T00:00:00')
    if (due >= today) continue

    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    const isClientOwned = a.owner_type === 'client'
    const alreadyNudged = (a.nudge_count || 0) > 0

    result.push({
      id: `overdue-${a.id}`,
      label: a.client_label || a.title,
      why: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue${isClientOwned && alreadyNudged ? ' — nudged, waiting on school' : ''}`,
      owner: isClientOwned && alreadyNudged ? 'school' : isClientOwned ? 'bella' : 'bella',
      urgency: 'critical',
      dueDate: a.due_date,
      actionType: isClientOwned && !alreadyNudged ? 'send_nudge' : 'complete_action',
      targetId: a.id,
      tab: 'actions',
      inProgress: isClientOwned && alreadyNudged,
    })
  }

  // Contact not employment-verified
  if (gate && !gate.submitter_employment_verified_at && gate.submitter_name) {
    result.push({
      id: 'verify-contact',
      label: `Verify ${gate.submitter_name} is still employed`,
      why: 'The gate depends on it — unverified contacts are how pursuits stall',
      owner: 'bella',
      urgency: 'critical',
      actionType: 'verify_contact',
      tab: 'overview',
    })
  } else if (gate?.submitter_employment_verified_at) {
    const verified = new Date(gate.submitter_employment_verified_at)
    const daysSince = Math.floor((today.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 90) {
      result.push({
        id: 'reverify-contact',
        label: `Re-verify ${gate.submitter_name} (${daysSince}d since last check)`,
        why: 'Verification is stale — confirm the contact hasn\'t changed',
        owner: 'bella',
        urgency: 'critical',
        actionType: 'verify_contact',
        tab: 'overview',
      })
    }
  }

  // Deadline within 7 days with submission not ready
  for (const opp of opportunities) {
    if (['awarded', 'denied'].includes(opp.status)) continue
    const deadline = opp.internal_deadline || opp.application_closes
    if (!deadline) continue
    const due = new Date(deadline + 'T00:00:00')
    const daysLeft = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft > 7 || daysLeft < 0) continue
    if (opp.client_submitted) continue

    result.push({
      id: `deadline-${opp.id}`,
      label: `${opp.name} deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      why: `Submission not ready — ${opp.narrative_status !== 'ready' ? 'narrative not approved' : opp.forwarding_email_status !== 'sent' ? 'forwarding email not sent' : 'not yet submitted'}`,
      owner: 'bella',
      urgency: 'critical',
      dueDate: deadline,
      actionType: 'prepare_submission',
      targetId: opp.id,
      tab: 'opportunities',
    })
  }

  // ── HIGH ──

  // Gate not satisfied
  if (gate && !gate.gate_open) {
    const missing: string[] = []
    if (!gate.submitter_name || !gate.submitter_email) missing.push('name submitter')
    if (!gate.backup_name || !gate.backup_email) missing.push('name backup')
    if (!gate.admin_sponsor_name || !gate.admin_sponsor_email) missing.push('name admin sponsor')
    if (!gate.contract1_signed) missing.push('sign Contract 1')
    if (!gate.contract2_signed) missing.push('sign Contract 2')

    if (missing.length > 0) {
      const hasContractGap = missing.some(m => m.includes('Contract'))
      result.push({
        id: 'gate-incomplete',
        label: `Gate not satisfied — ${missing.length} condition${missing.length !== 1 ? 's' : ''} remaining`,
        why: missing.join(', '),
        owner: hasContractGap ? 'bella' : 'bella',
        urgency: 'high',
        actionType: 'complete_gate',
        tab: 'overview',
      })
    }
  }

  // Funding windows unverified
  const unverifiedWindows = opportunities.filter(
    (o: any) => !['awarded', 'denied'].includes(o.status) && (o.window_status || 'unknown') === 'unknown'
  )
  if (unverifiedWindows.length > 0) {
    result.push({
      id: 'verify-windows',
      label: `${unverifiedWindows.length} funding window${unverifiedWindows.length !== 1 ? 's' : ''} unverified`,
      why: 'Nothing can proceed — agents won\'t draft and the engine won\'t nudge until a window is confirmed open',
      owner: 'bella',
      urgency: 'high',
      actionType: 'verify_window',
      tab: 'opportunities',
    })
  }

  // Narrative in 'review' → needs QA
  for (const opp of opportunities) {
    if (opp.narrative_status === 'review') {
      result.push({
        id: `qa-${opp.id}`,
        label: `"${opp.name}" narrative needs QA`,
        why: 'Draft is ready — send to QA for review before approval',
        owner: 'bella',
        urgency: 'high',
        actionType: 'send_to_qa',
        targetId: opp.id,
        tab: 'opportunities',
      })
    }
  }

  // Narrative QA passed → needs approval
  for (const opp of opportunities) {
    if (opp.narrative_status === 'qa_review' && opp.qa_passed === true) {
      result.push({
        id: `approve-${opp.id}`,
        label: `Approve "${opp.name}" narrative (QA passed)`,
        why: `QA passed${opp.qa_reviewer ? ` by ${opp.qa_reviewer}` : ''} — ready for final approval`,
        owner: 'bella',
        urgency: 'high',
        actionType: 'approve_draft',
        targetId: opp.id,
        tab: 'opportunities',
      })
    }
  }

  // Award recorded but unallocated
  for (const opp of opportunities) {
    if (opp.status !== 'awarded') continue
    const oppAllocs = allocations.filter((a: any) => a.funding_opportunity_id === opp.id)
    const allocatedTotal = oppAllocs.reduce((s: number, a: any) => s + (a.allocated_amount || 0), 0)
    const awardedAmt = opp.awarded_amount ?? opp.amount ?? 0
    if (awardedAmt > 0 && allocatedTotal < awardedAmt) {
      result.push({
        id: `allocate-${opp.id}`,
        label: `Allocate $${(awardedAmt - allocatedTotal).toLocaleString()} from "${opp.name}"`,
        why: 'Money decision with the client — map award to line items',
        owner: 'rae',
        urgency: 'high',
        actionType: 'allocate_award',
        targetId: opp.id,
        tab: 'opportunities',
      })
    }
  }

  // ── NORMAL ──

  // No fast funding source (diversification)
  const tiers: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const opp of opportunities) {
    const cat = (opp.plan_category || '').toUpperCase()
    if (tiers[cat] !== undefined) tiers[cat]++
  }
  const hasSlow = tiers.A > 0 || tiers.B > 0
  const hasFast = tiers.C > 0 || tiers.D > 0
  if (opportunities.length > 0 && hasSlow && !hasFast) {
    result.push({
      id: 'diversify',
      label: 'No fast funding sources (Plan C/D)',
      why: 'Consider requesting research for a local/foundation source to hedge the timeline',
      owner: 'bella',
      urgency: 'normal',
      actionType: 'request_research',
      tab: 'opportunities',
    })
  }

  // Profile incomplete (only for in-flight pursuits — don't spam for unstarted ones)
  if (isInFlight) {
    let profileFields = 0
    let profileFilled = 0
    try {
      const sp = typeof pursuit.school_profile === 'string' ? JSON.parse(pursuit.school_profile) : (pursuit.school_profile || {})
      const required = ['school_name', 'district', 'educator_count', 'title_i_status', 'frl_pct', 'budget_holder', 'atsi_status']
      profileFields = required.length
      profileFilled = required.filter(k => sp[k] != null && sp[k] !== '' && sp[k] !== false).length
    } catch {}
    if (profileFields > 0 && profileFilled < profileFields) {
      result.push({
        id: 'complete-profile',
        label: `School profile ${Math.round((profileFilled / profileFields) * 100)}% complete`,
        why: `${profileFields - profileFilled} field${profileFields - profileFilled !== 1 ? 's' : ''} need verification`,
        owner: 'bella',
        urgency: 'normal',
        actionType: 'complete_profile',
        tab: 'overview',
      })
    }
  }

  // Opportunities with open window + gate open but narrative not started
  if (gate?.gate_open) {
    for (const opp of opportunities) {
      if (['awarded', 'denied'].includes(opp.status)) continue
      if (opp.window_status !== 'open') continue
      if (opp.narrative_status && opp.narrative_status !== 'not_started') continue
      result.push({
        id: `start-draft-${opp.id}`,
        label: `Request draft for "${opp.name}"`,
        why: 'Window is open and gate is satisfied — ready to draft',
        owner: 'bella',
        urgency: 'normal',
        actionType: 'request_draft',
        targetId: opp.id,
        tab: 'opportunities',
      })
    }
  }

  // ── IN-PROGRESS (show so nobody waits, but not actionable) ──

  for (const opp of opportunities) {
    if (opp.narrative_status === 'requested') {
      result.push({
        id: `drafting-wait-${opp.id}`,
        label: `"${opp.name}" — draft requested`,
        why: `Waiting for ${opp.assigned_agent || 'agent'} to start drafting`,
        owner: 'agent',
        urgency: 'low',
        actionType: 'waiting',
        targetId: opp.id,
        tab: 'opportunities',
        inProgress: true,
      })
    }
    if (opp.narrative_status === 'drafting') {
      result.push({
        id: `drafting-${opp.id}`,
        label: `"${opp.name}" — ${opp.assigned_agent || 'agent'} is drafting`,
        why: 'No action needed — agent is working',
        owner: 'agent',
        urgency: 'low',
        actionType: 'waiting',
        targetId: opp.id,
        tab: 'opportunities',
        inProgress: true,
      })
    }
    if (opp.narrative_status === 'qa_review' && opp.qa_passed !== true) {
      result.push({
        id: `qa-wait-${opp.id}`,
        label: `"${opp.name}" — in QA review`,
        why: 'Waiting for QA pass/fail',
        owner: 'agent',
        urgency: 'low',
        actionType: 'waiting',
        targetId: opp.id,
        tab: 'opportunities',
        inProgress: true,
      })
    }
    if (opp.research_status === 'requested' || opp.research_status === 'in_progress') {
      result.push({
        id: `research-${opp.id}`,
        label: `"${opp.name}" — ${opp.assigned_agent || 'agent'} researching funders`,
        why: 'No action needed — agent is researching',
        owner: 'agent',
        urgency: 'low',
        actionType: 'waiting',
        targetId: opp.id,
        tab: 'opportunities',
        inProgress: true,
      })
    }
  }

  // Client-owned actions already nudged
  for (const a of pendingActions) {
    if (a.owner_type !== 'client') continue
    if ((a.nudge_count || 0) === 0) continue
    const due = a.due_date ? new Date(a.due_date + 'T00:00:00') : null
    if (due && due < today) continue // already in critical overdue list
    result.push({
      id: `waiting-client-${a.id}`,
      label: a.client_label || a.title,
      why: `Nudged ${a.nudge_count}x — waiting on school`,
      owner: 'school',
      urgency: 'low',
      actionType: 'waiting',
      targetId: a.id,
      tab: 'actions',
      inProgress: true,
    })
  }

  // Sort: critical first, then high, normal, low.
  // Within same urgency, sort by due date (oldest/most overdue first), then no-date items last.
  const urgencyOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 }
  result.sort((a, b) => {
    const ua = urgencyOrder[a.urgency] ?? 2
    const ub = urgencyOrder[b.urgency] ?? 2
    if (ua !== ub) return ua - ub
    // Within same urgency, sort by due date (earliest first, null last)
    const da = a.dueDate ? new Date(a.dueDate + 'T00:00:00').getTime() : Infinity
    const db = b.dueDate ? new Date(b.dueDate + 'T00:00:00').getTime() : Infinity
    return da - db
  })

  return result
}
