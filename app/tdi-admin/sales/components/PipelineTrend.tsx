'use client'

interface Snapshot {
  snapshot_date: string
  total_pipeline: number
  factored_pipeline: number
  active_count: number
}

export function PipelineTrend({ snapshots }: { snapshots: Snapshot[] }) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
        Pipeline trend requires at least 2 weekly snapshots.
        <br />
        First snapshot recorded today. Trend chart appears next week.
      </div>
    )
  }

  const max = Math.max(...snapshots.map(s => s.total_pipeline || 0))
  const w = 100 / (snapshots.length - 1)
  const points = snapshots.map((s, i) => {
    const x = i * w
    const y = 100 - ((s.total_pipeline || 0) / max) * 90
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: 200 }} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#6366F1" strokeWidth="0.5" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginTop: 8 }}>
        <span>{snapshots[0].snapshot_date}</span>
        <span>{snapshots[snapshots.length - 1].snapshot_date}</span>
      </div>
    </div>
  )
}
