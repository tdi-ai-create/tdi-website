'use client'

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: '🚨' },
  warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#854D0E', icon: '⚠️' },
  info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' },
}

interface Alert {
  type: string
  severity: string
  title: string
  detail: string
}

export function AlertsBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts || alerts.length === 0) return null

  const sorted = [...alerts].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, warning: 1, info: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      {sorted.map((alert, i) => {
        const s = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
        return (
          <div key={i} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{alert.title}</div>
              <div style={{ fontSize: 12, color: s.text, opacity: 0.85, marginTop: 2 }}>{alert.detail}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
