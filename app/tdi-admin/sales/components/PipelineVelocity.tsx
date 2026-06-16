'use client'

const STAGE_LABELS: Record<string, string> = {
  targeting: 'Targeting',
  engaged: 'Engaged',
  qualified: 'Qualified',
  likely_yes: 'Likely Yes',
  proposal_sent: 'Quote Sent',
  signed: 'Signed',
  paid: 'Paid',
}

interface VelocityData {
  stage: string
  avgDays: number
  count: number
}

export function PipelineVelocity({ velocity }: { velocity: VelocityData[] }) {
  if (!velocity.length) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF', fontSize: 13 }}>
        Not enough stage transition data yet. Velocity will appear as leads move through stages.
      </div>
    )
  }

  const maxDays = Math.max(...velocity.map(v => v.avgDays), 1)
  const totalAvg = velocity.reduce((s, v) => s + v.avgDays, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{totalAvg}d</span>
        <span style={{ fontSize: 13, color: '#6B7280' }}>avg total cycle time (sum of stage averages)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {velocity.map((v) => {
          const pct = (v.avgDays / maxDays) * 100
          const isBottleneck = v.avgDays >= maxDays * 0.8 && velocity.length > 1
          return (
            <div key={v.stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 100, fontSize: 12, fontWeight: 500, color: '#374151', textAlign: 'right', flexShrink: 0 }}>
                {STAGE_LABELS[v.stage] || v.stage}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 24, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(pct, 4)}%`,
                    background: isBottleneck
                      ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                      : 'linear-gradient(90deg, #10B981, #059669)',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }}
                />
                <div style={{
                  position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)',
                  fontSize: 11, fontWeight: 600, color: pct > 20 ? 'white' : '#374151',
                }}>
                  {v.avgDays}d avg
                </div>
              </div>
              <div style={{ width: 60, fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
                {v.count} deal{v.count !== 1 ? 's' : ''}
              </div>
              {isBottleneck && (
                <div style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                  background: '#FEF3C7', color: '#92400E',
                }}>
                  BOTTLENECK
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
