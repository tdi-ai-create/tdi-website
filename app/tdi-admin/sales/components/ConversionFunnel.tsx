'use client'

const STAGE_LABELS: Record<string, string> = {
  targeting: 'Targeting (5%)',
  engaged: 'Engaged (20%)',
  qualified: 'Qualified (45%)',
  likely_yes: 'Likely Yes (65%)',
  proposal_sent: 'Quote Sent (80%)',
  signed: 'Signed (95%)',
  paid: 'Paid (100%)',
}

interface FunnelStage {
  stage: string
  count: number
  value: number
}

export function ConversionFunnel({ funnel }: { funnel: FunnelStage[] }) {
  const maxCount = Math.max(...funnel.map(s => s.count), 1)
  const totalDeals = funnel.reduce((s, f) => s + f.count, 0)
  return (
    <div>
      {funnel.map((stage, i) => {
        const width = Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 8 : 2)
        const pctOfTotal = totalDeals > 0 ? Math.round((stage.count / totalDeals) * 100) : 0
        return (
          <div key={stage.stage} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 140, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              {STAGE_LABELS[stage.stage] || stage.stage}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                height: 32,
                background: '#E5E7EB',
                borderRadius: 6,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${width}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'white',
                  minWidth: 80,
                }}>
                  {stage.count} &middot; ${(stage.value / 1000).toFixed(0)}K
                </div>
              </div>
            </div>
            <div style={{ width: 50, fontSize: 11, color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>
              {stage.count > 0 ? `${pctOfTotal}%` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
