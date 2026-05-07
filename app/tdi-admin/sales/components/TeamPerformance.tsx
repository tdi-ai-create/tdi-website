'use client'

interface OwnerData {
  count: number
  value: number
  factored: number
  won: number
  lost: number
}

function Metric({ label, value, color = '#0a0f1e' }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

export function TeamPerformance({ byOwner }: { byOwner: Record<string, OwnerData> }) {
  const owners = Object.entries(byOwner)
    .filter(([k]) => k !== 'unassigned')
    .sort(([, a], [, b]) => b.value - a.value)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: owners.length > 1 ? '1fr 1fr' : '1fr', gap: 16 }}>
      {owners.map(([email, data]) => {
        const name = email.includes('@') ? email.split('@')[0] : email
        const winRate = (data.won + data.lost) > 0
          ? Math.round((data.won / (data.won + data.lost)) * 100)
          : 0
        return (
          <div key={email} style={{
            padding: 20, background: '#F9FAFB', borderRadius: 12,
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'capitalize' }}>{name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <Metric label="Active Pipeline" value={`$${(data.value / 1000).toFixed(0)}K`} />
              <Metric label="Factored" value={`$${(data.factored / 1000).toFixed(0)}K`} />
              <Metric label="Active Opps" value={data.count} />
              <Metric label="Win Rate" value={`${winRate}%`} />
              <Metric label="Won" value={data.won} color="#10B981" />
              <Metric label="Lost" value={data.lost} color="#6B7280" />
            </div>
          </div>
        )
      })}
      {owners.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
          No owner-assigned opportunities found.
        </div>
      )}
    </div>
  )
}
