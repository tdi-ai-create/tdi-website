'use client'

const CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  client: { bg: '#FFF7ED', text: '#C2410C', label: 'Waiting on Client' },
  tdi: { bg: '#F5F3FF', text: '#6D28D9', label: 'Waiting on TDI' },
  funder: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Waiting on Funder' },
}

export function WaitingOnBadge({ waitingOn }: { waitingOn: 'tdi' | 'client' | 'funder' | 'none' }) {
  if (waitingOn === 'none') return null
  const c = CONFIG[waitingOn]
  if (!c) return null

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        background: c.bg,
        color: c.text,
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  )
}
