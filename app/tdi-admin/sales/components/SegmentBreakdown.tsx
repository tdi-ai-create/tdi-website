'use client'

const TYPE_LABELS: Record<string, string> = {
  renewal: 'Renewals',
  new_business: 'New Business',
  expansion: 'Expansion',
  pilot: 'Pilots',
  upsell: 'Upsell',
  reactivation: 'Reactivation',
}

interface TypeData {
  count: number
  value: number
  factored: number
}

export function SegmentBreakdown({ byType }: { byType: Record<string, TypeData> }) {
  const total = Object.values(byType).reduce((s, t) => s + t.value, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      {Object.entries(byType).map(([type, data]) => {
        const pct = total > 0 ? Math.round((data.value / total) * 100) : 0
        return (
          <div key={type} style={{
            padding: 18,
            background: '#F9FAFB',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{TYPE_LABELS[type] || type}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
              ${(data.value / 1000).toFixed(0)}K
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
              {data.count} opps &middot; {pct}% of pipeline
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              Factored: <strong>${(data.factored / 1000).toFixed(0)}K</strong>
            </div>
          </div>
        )
      })}
    </div>
  )
}
