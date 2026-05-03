'use client'

const STAGE_LABELS: Record<string, string> = {
  targeting: 'Targeting (5%)',
  engaged: 'Engaged (10%)',
  qualified: 'Qualified (30%)',
  likely_yes: 'Likely Yes (50%)',
  proposal_sent: 'Proposal Sent (70%)',
  signed: 'Signed (90%)',
  paid: 'Paid (100%)',
}

interface FunnelStage {
  stage: string
  count: number
  value: number
}

export function ConversionFunnel({ funnel }: { funnel: FunnelStage[] }) {
  const top = funnel[0]?.count || 1
  return (
    <div>
      {funnel.map((stage, i) => {
        const width = Math.max((stage.count / top) * 100, 5)
        const conversionRate = i > 0 && funnel[i - 1].count > 0
          ? Math.round((stage.count / funnel[i - 1].count) * 100)
          : null
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
                  background: 'linear-gradient(90deg, #6366F1 0%, #4338CA 100%)',
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
              {conversionRate !== null ? `${conversionRate}%` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
