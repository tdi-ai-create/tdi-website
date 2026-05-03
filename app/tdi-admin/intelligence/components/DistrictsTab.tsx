'use client'

interface DistrictRow {
  name: string
  activeCount: number
  totalValue: number
  daysSinceContact: number | null
  status: string
  source: string | null
  type: string | null
}

export function DistrictsTab({ districtsData }: { districtsData: DistrictRow[] }) {
  if (districtsData.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No active districts.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {districtsData.map(d => (
        <div key={d.name} style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderLeft: `4px solid ${d.status === 'attention_needed' ? '#EF4444' : '#10B981'}`,
          borderRadius: 10, padding: '14px 18px',
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 16, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {d.source || 'unknown source'} · {d.type || 'unspecified'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Active opps</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{d.activeCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Total value</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>${(d.totalValue / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Last contact</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: (d.daysSinceContact ?? 999) > 30 ? '#EF4444' : '#0a0f1e' }}>
              {d.daysSinceContact !== null ? `${d.daysSinceContact}d ago` : '—'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
