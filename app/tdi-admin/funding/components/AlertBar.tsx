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
      borderColor: '#F59E0B',
    },
    {
      label: 'Stalled past threshold',
      value: alerts.stalled,
      sublabel: alerts.stalled === 1 ? 'pursuit' : 'pursuits',
      borderColor: alerts.stalled > 0 ? '#DC2626' : '#16A34A',
    },
    {
      label: 'Awarded YTD',
      value: `$${(alerts.awarded_total / 1000).toFixed(0)}K`,
      sublabel: `${alerts.awarded_count} ${alerts.awarded_count === 1 ? 'pursuit' : 'pursuits'}`,
      borderColor: '#16A34A',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
      {segments.map(s => (
        <div key={s.label} style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderLeft: `3px solid ${s.borderColor}`,
          borderRadius: 12,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            {s.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            {s.sublabel}
          </div>
        </div>
      ))}
    </div>
  )
}
