'use client'

interface Alerts {
  // Legacy fields (keep for backward compat)
  olivia_actions?: number
  // New fields
  waiting_on_client?: number
  overdue_actions?: number
  stalled: number
  awarded_count: number
  awarded_total: number
  in_flight_count: number
  in_flight_total: number
  total_gap?: number
  upcoming_deadlines?: any[]
}

export function AlertBar({ alerts }: { alerts: Alerts }) {
  const deadlinesThisWeek = (alerts.upcoming_deadlines || []).filter(d => {
    if (!d.application_closes) return false
    const daysUntil = Math.ceil(
      (new Date(d.application_closes + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil <= 7
  }).length

  const segments = [
    {
      label: 'Waiting on Client',
      value: alerts.waiting_on_client ?? alerts.olivia_actions ?? 0,
      sublabel: 'opportunities need client action',
      borderColor: (alerts.waiting_on_client ?? 0) > 0 ? '#C2410C' : '#16A34A',
    },
    {
      label: 'Deadlines This Week',
      value: deadlinesThisWeek,
      sublabel: deadlinesThisWeek === 1 ? 'application closing' : 'applications closing',
      borderColor: deadlinesThisWeek > 0 ? '#DC2626' : '#16A34A',
    },
    {
      label: 'Overdue Actions',
      value: alerts.overdue_actions ?? alerts.stalled,
      sublabel: 'past due date',
      borderColor: (alerts.overdue_actions ?? alerts.stalled) > 0 ? '#DC2626' : '#16A34A',
    },
    {
      label: 'Awarded YTD',
      value: `$${(alerts.awarded_total / 1000).toFixed(0)}K`,
      sublabel: `${alerts.awarded_count} ${alerts.awarded_count === 1 ? 'pursuit' : 'pursuits'}`,
      borderColor: '#16A34A',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
      {segments.map(s => (
        <div key={s.label} style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderLeft: `4px solid ${s.borderColor}`,
          borderRadius: 14,
          padding: '20px 24px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
            {s.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>
            {s.sublabel}
          </div>
        </div>
      ))}
    </div>
  )
}
