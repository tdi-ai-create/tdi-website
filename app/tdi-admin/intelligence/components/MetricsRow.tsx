'use client'

interface Metrics {
  invoicesOwed: number
  activeContracts: number
  activeRenewals: number
  criticalAccounts: number
  meetingsLocked: number
}

export function MetricsRow({ metrics }: { metrics: Metrics }) {
  const cards = [
    { label: 'Invoices Owed', value: metrics.invoicesOwed, sublabel: '25-26 work to bill', color: metrics.invoicesOwed > 0 ? '#EF4444' : '#10B981' },
    { label: 'Active Contracts', value: metrics.activeContracts, sublabel: 'signed + paid', color: '#0a0f1e' },
    { label: 'Active Renewals', value: metrics.activeRenewals, sublabel: '26-27 in conversation', color: '#3B82F6' },
    { label: 'Critical Accounts', value: metrics.criticalAccounts, sublabel: 'contact issues / blockers', color: metrics.criticalAccounts > 0 ? '#F59E0B' : '#10B981' },
    { label: 'Meetings Locked', value: metrics.meetingsLocked, sublabel: 'scheduled this cycle', color: '#10B981' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 8 }}>{c.label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{c.sublabel}</div>
        </div>
      ))}
    </div>
  )
}
