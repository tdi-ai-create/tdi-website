export interface TDISuggestion {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: 'engagement' | 'scheduling' | 'celebration' | 'renewal' | 'action'
  title: string
  body: string
  cta?: string
  ctaUrl?: string
  icon: string
}

interface PartnershipData {
  slug: string
  contract_phase: string
  momentum_status: string
  staff_enrolled: number
  hub_login_pct: number | null
  love_notes_count: number | null
  observation_days_used: number
  observation_days_total: number
  virtual_sessions_used: number
  virtual_sessions_total: number
  executive_sessions_used: number
  executive_sessions_total: number
  teacher_stress_score: number | null
  strategy_implementation_pct: number | null
  retention_intent_score: number | null
  contract_end: string | null
  data_updated_at: string | null
}

interface TimelineEvent {
  status: string
  event_type: string
  event_date: string | null
}

interface ActionItem {
  status: string
  priority: string
  title: string
}

export function generateSuggestions(
  partnership: PartnershipData,
  timelineEvents: TimelineEvent[],
  _actionItems: ActionItem[]
): TDISuggestion[] {
  const suggestions: TDISuggestion[] = []
  const now = new Date()

  // ── ENGAGEMENT SUGGESTIONS ──────────────────────────────────

  // Low Hub login
  if (partnership.hub_login_pct !== null && partnership.hub_login_pct < 70) {
    suggestions.push({
      id: 'low-hub-login',
      priority: partnership.hub_login_pct < 50 ? 'high' : 'medium',
      category: 'engagement',
      icon: '📚',
      title: 'Hub engagement needs a boost',
      body: `${partnership.hub_login_pct}% of staff are logging into the Hub - below the 87% TDI partner average. A quick re-engagement email or shoutout at the next staff meeting often moves the needle significantly.`,
      cta: 'Schedule a check-in',
      ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    })
  }

  // High Hub login - celebrate
  if (partnership.hub_login_pct !== null && partnership.hub_login_pct >= 95) {
    suggestions.push({
      id: 'high-hub-login',
      priority: 'low',
      category: 'celebration',
      icon: '🎉',
      title: `${partnership.hub_login_pct}% Hub login - outstanding`,
      body: `Nearly every educator is activated on the Hub. This is the foundation for everything else TDI delivers. Your team is showing up.`,
    })
  }

  // ── SCHEDULING SUGGESTIONS ──────────────────────────────────

  // No upcoming sessions scheduled
  const upcomingEvents = timelineEvents.filter((e) => e.status === 'upcoming')
  if (upcomingEvents.length === 0 && partnership.observation_days_total > 0) {
    suggestions.push({
      id: 'no-upcoming-sessions',
      priority: 'high',
      category: 'scheduling',
      icon: '📅',
      title: 'No upcoming sessions on the calendar',
      body: `There are no upcoming sessions scheduled for this partnership. Getting dates on the calendar keeps momentum strong and gives your team something to work toward.`,
      cta: 'Schedule now',
      ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    })
  }

  // Behind on deliverables
  const totalUsed =
    partnership.observation_days_used +
    partnership.virtual_sessions_used +
    partnership.executive_sessions_used
  const totalContracted =
    partnership.observation_days_total +
    partnership.virtual_sessions_total +
    partnership.executive_sessions_total

  if (totalContracted > 0 && partnership.contract_end) {
    const contractEnd = new Date(partnership.contract_end)
    const daysRemaining = Math.floor(
      (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const pctDelivered = totalUsed / totalContracted
    const pctTimeElapsed = 1 - daysRemaining / 365

    if (pctDelivered < pctTimeElapsed - 0.2 && daysRemaining < 120) {
      suggestions.push({
        id: 'behind-deliverables',
        priority: 'high',
        category: 'scheduling',
        icon: '⚡',
        title: `${totalContracted - totalUsed} contracted sessions still to deliver`,
        body: `With ${daysRemaining} days left in the contract, there are ${totalContracted - totalUsed} sessions remaining. Let's get these on the calendar now to make sure the full partnership is delivered.`,
        cta: 'Schedule remaining sessions',
        ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      })
    }
  }

  // ── LOVE NOTES SUGGESTIONS ──────────────────────────────────

  // Observation days done but no love notes
  if (
    partnership.observation_days_used > 0 &&
    (partnership.love_notes_count === null || partnership.love_notes_count === 0)
  ) {
    suggestions.push({
      id: 'missing-love-notes',
      priority: 'medium',
      category: 'action',
      icon: '💌',
      title: 'Love Notes not yet logged',
      body: `${partnership.observation_days_used} observation ${partnership.observation_days_used === 1 ? 'day has' : 'days have'} been completed but no Love Notes are recorded. Log them via the session completion flow so the dashboard reflects the full impact.`,
    })
  }

  // ── MOMENTUM SUGGESTIONS ──────────────────────────────────

  // Needs Attention momentum
  if (partnership.momentum_status === 'Needs Attention') {
    suggestions.push({
      id: 'momentum-needs-attention',
      priority: 'high',
      category: 'action',
      icon: '🔔',
      title: 'Partnership momentum needs attention',
      body: `This partnership is flagged as Needs Attention. Review the current state, update the momentum detail, and consider scheduling a check-in call to get things back on track.`,
      cta: 'Schedule a check-in',
      ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    })
  }

  // ── SURVEY / INDICATOR SUGGESTIONS ──────────────────────────

  // High teacher stress
  if (partnership.teacher_stress_score !== null && partnership.teacher_stress_score >= 7) {
    suggestions.push({
      id: 'high-stress',
      priority: 'high',
      category: 'action',
      icon: '🧠',
      title: 'Teacher stress score is elevated',
      body: `Survey data shows teacher stress at ${partnership.teacher_stress_score}/10 - above the TDI partner average of 6.0. This is a key signal to address in the next session. Consider focusing Hub recommendations on stress-reduction strategies.`,
    })
  }

  // Low retention intent
  if (partnership.retention_intent_score !== null && partnership.retention_intent_score < 6) {
    suggestions.push({
      id: 'low-retention',
      priority: 'high',
      category: 'action',
      icon: '🚨',
      title: 'Retention intent is below target',
      body: `Retention intent is ${partnership.retention_intent_score}/10 - below the TDI partner average of 7.2. This partnership needs proactive relationship work. Schedule a leadership conversation soon.`,
      cta: 'Schedule leadership call',
      ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    })
  }

  // Low strategy implementation
  if (
    partnership.strategy_implementation_pct !== null &&
    partnership.strategy_implementation_pct < 20
  ) {
    suggestions.push({
      id: 'low-implementation',
      priority: 'medium',
      category: 'engagement',
      icon: '📊',
      title: 'Strategy implementation below average',
      body: `${partnership.strategy_implementation_pct}% implementation rate - below the TDI average of 65%. Focus the next virtual session on practical application of Hub strategies. Consider a subgroup focused on implementation.`,
    })
  }

  // ── RENEWAL SUGGESTIONS ──────────────────────────────────

  // Contract ending within 90 days
  if (partnership.contract_end) {
    const contractEnd = new Date(partnership.contract_end)
    const daysRemaining = Math.floor(
      (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysRemaining <= 90 && daysRemaining > 0) {
      suggestions.push({
        id: 'renewal-window',
        priority: daysRemaining <= 30 ? 'high' : 'medium',
        category: 'renewal',
        icon: '🔄',
        title: `Contract ends in ${daysRemaining} days - renewal conversation`,
        body: `The current contract ends ${contractEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Now is the time to open the 2026-27 planning conversation. Schools that start this conversation early have a 3x higher renewal rate.`,
        cta: 'Start renewal conversation',
        ctaUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      })
    }
  }

  // ── ALL CAUGHT UP ──────────────────────────────────────────

  // No suggestions = everything is on track
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'all-good',
      priority: 'low',
      category: 'celebration',
      icon: '✓',
      title: 'This partnership is on track',
      body: `Hub engagement is strong, sessions are being delivered, and momentum is building. Keep going.`,
    })
  }

  // Sort: high first, then medium, then low
  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}
