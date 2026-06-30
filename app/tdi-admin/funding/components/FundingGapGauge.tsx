'use client'

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

interface FundingGapGaugeProps {
  gap: number
  awarded: number
  pending: number
  researching: number
}

export function FundingGapGauge({ gap, awarded, pending, researching }: FundingGapGaugeProps) {
  if (gap === 0) {
    return (
      <div
        style={{
          padding: 14,
          background: 'white',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>Fully funded</span>
      </div>
    )
  }

  const total = gap
  const awardedPct = total > 0 ? (awarded / total) * 100 : 0
  const pendingPct = total > 0 ? (pending / total) * 100 : 0
  const researchingPct = total > 0 ? (researching / total) * 100 : 0
  const filledPct = total > 0 ? ((awarded + pending + researching) / total) * 100 : 0

  return (
    <div
      style={{
        padding: 14,
        background: 'white',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
      }}
    >
      <div
        style={{
          height: 10,
          borderRadius: 5,
          background: '#F3F4F6',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {awardedPct > 0 && (
          <div style={{ width: `${awardedPct}%`, background: '#10B981', height: '100%' }} />
        )}
        {pendingPct > 0 && (
          <div style={{ width: `${pendingPct}%`, background: '#3B82F6', height: '100%' }} />
        )}
        {researchingPct > 0 && (
          <div style={{ width: `${researchingPct}%`, background: '#D1D5DB', height: '100%' }} />
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#6B7280' }}>
        <span style={{ fontWeight: 700, color: '#0a0f1e' }}>{fmt(awarded)}</span> awarded /{' '}
        <span style={{ fontWeight: 700, color: '#0a0f1e' }}>{fmt(gap)}</span> gap{' '}
        <span style={{ color: '#9CA3AF' }}>({Math.round(filledPct)}%)</span>
      </div>
    </div>
  )
}
