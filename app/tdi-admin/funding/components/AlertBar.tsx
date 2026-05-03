'use client'

interface Alerts {
  olivia_actions: number
  stalled: number
  awarded_count: number
  awarded_total: number
  in_flight_count: number
  in_flight_total: number
}

export function AlertBar({ alerts }: { alerts: Alerts }) {
  const segments = [
    {
      label: 'What Olivia owes today',
      value: alerts.olivia_actions,
      sublabel: alerts.olivia_actions === 1 ? 'action item' : 'action items',
      bg: '#FEF3C7',
      border: '#F59E0B',
      color: '#854D0E',
    },
    {
      label: 'Stalled past threshold',
      value: alerts.stalled,
      sublabel: alerts.stalled === 1 ? 'pursuit' : 'pursuits',
      bg: alerts.stalled > 0 ? '#FEE2E2' : '#F0FDF4',
      border: alerts.stalled > 0 ? '#EF4444' : '#10B981',
      color: alerts.stalled > 0 ? '#991B1B' : '#065F46',
    },
    {
      label: 'Awarded YTD',
      value: `$${(alerts.awarded_total / 1000).toFixed(0)}K`,
      sublabel: `${alerts.awarded_count} ${alerts.awarded_count === 1 ? 'pursuit' : 'pursuits'}`,
      bg: '#F0FDF4',
      border: '#10B981',
      color: '#065F46',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
      {segments.map(s => (
        <div key={s.label} style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: 12,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            {s.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 4 }}>
            {s.sublabel}
          </div>
        </div>
      ))}
    </div>
  )
}
