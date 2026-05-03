'use client'

interface StateData {
  count: number
  value: number
  won: number
}

export function GeographyMap({ byState }: { byState: Record<string, StateData> }) {
  const sorted = Object.entries(byState)
    .filter(([s]) => s !== 'Unknown' && s !== 'TBD' && s !== 'null')
    .sort(([, a], [, b]) => b.value - a.value)
    .slice(0, 15)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {sorted.map(([state, data]) => (
        <div key={state} style={{
          padding: 14,
          background: '#F9FAFB',
          borderRadius: 10,
          borderLeft: '4px solid #FFBA06',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{state}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
            ${(data.value / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
            {data.count} opps &middot; {data.won} won
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', gridColumn: '1 / -1' }}>
          No geographic data available. State info comes from linked district records.
        </div>
      )}
    </div>
  )
}
