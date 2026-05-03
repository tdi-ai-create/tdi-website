'use client'

interface SourceData {
  count: number
  value: number
  factored: number
  won: number
}

export function SourceAttribution({ bySource }: { bySource: Record<string, SourceData> }) {
  const sorted = Object.entries(bySource)
    .sort(([, a], [, b]) => b.value - a.value)
    .slice(0, 10)
  const max = sorted[0]?.[1].value || 1

  return (
    <div>
      {sorted.map(([source, data]) => {
        const conversionRate = data.count > 0 ? Math.round((data.won / data.count) * 100) : 0
        return (
          <div key={source} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{source}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {data.count} opps &middot; ${(data.value / 1000).toFixed(0)}K &middot; {conversionRate}% won
              </div>
            </div>
            <div style={{
              height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(data.value / max) * 100}%`,
                background: '#10B981',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
