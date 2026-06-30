'use client'

function getDaysUntil(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(deadline + 'T00:00:00')
  const diff = target.getTime() - today.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function DeadlineCountdown({ deadline }: { deadline: string | null | undefined }) {
  if (!deadline) {
    return <span style={{ fontSize: 11, color: '#9CA3AF' }}>--</span>
  }

  const days = getDaysUntil(deadline)

  let color = '#6B7280'
  let bg = 'transparent'
  let fontWeight: number = 600
  let label = `${days} days`

  if (days < 0) {
    color = '#DC2626'
    bg = '#FEF2F2'
    fontWeight = 800
    label = `${Math.abs(days)} days overdue`
  } else if (days === 0) {
    color = '#DC2626'
    bg = '#FEF2F2'
    fontWeight = 800
    label = 'today'
  } else if (days <= 3) {
    color = '#DC2626'
    bg = '#FEF2F2'
    fontWeight = 800
    label = `${days} days`
  } else if (days <= 7) {
    color = '#C2410C'
    bg = '#FFF7ED'
    label = `${days} days`
  } else if (days <= 14) {
    color = '#D97706'
    bg = '#FFFBEB'
    label = `${days} days`
  }

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight,
        padding: '2px 8px',
        borderRadius: 6,
        display: 'inline-block',
        color,
        background: bg,
      }}
    >
      {label}
    </span>
  )
}
