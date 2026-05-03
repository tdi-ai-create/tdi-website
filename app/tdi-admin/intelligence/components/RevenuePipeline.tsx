'use client'

interface Revenue {
  currentYearContracted: number
  currentYearOutstanding: number
  outstandingCount: number
  outstandingTBDCount: number
  renewal26_27Pipeline: number
  renewal26_27Factored: number
  renewal26_27Count: number
}

export function RevenuePipeline({ revenue }: { revenue: Revenue }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Revenue Pipeline</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 18, background: '#F0FDF4', borderRadius: 12, borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: 12, color: '#15803D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>25-26 Contracted</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', marginTop: 6 }}>${(revenue.currentYearContracted / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Signed + paid current year</div>
        </div>

        <div style={{ padding: 18, background: revenue.currentYearOutstanding > 0 ? '#FEE2E2' : '#F9FAFB', borderRadius: 12, borderLeft: `4px solid ${revenue.currentYearOutstanding > 0 ? '#EF4444' : '#9CA3AF'}` }}>
          <div style={{ fontSize: 12, color: revenue.currentYearOutstanding > 0 ? '#991B1B' : '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>25-26 Invoices Owed</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', marginTop: 6 }}>
            {revenue.currentYearOutstanding > 0 ? `$${revenue.currentYearOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0'}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            {revenue.outstandingCount} accounts{revenue.outstandingTBDCount > 0 && ` (${revenue.outstandingTBDCount} TBD)`}
          </div>
        </div>

        <div style={{ padding: 18, background: '#FEF3C7', borderRadius: 12, borderLeft: '4px solid #FFBA06' }}>
          <div style={{ fontSize: 12, color: '#854D0E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>26-27 Renewal Pipeline</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', marginTop: 6 }}>${(revenue.renewal26_27Pipeline / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{revenue.renewal26_27Count} renewals · ${(revenue.renewal26_27Factored / 1000).toFixed(0)}K factored</div>
        </div>

        <div style={{ padding: 18, background: 'linear-gradient(135deg, #FFBA06 0%, #FF8C00 100%)', borderRadius: 12, color: '#0a0f1e' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 }}>Forecast Total</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>${((revenue.currentYearContracted + revenue.renewal26_27Factored) / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>Contracted + factored renewal</div>
        </div>
      </div>
    </div>
  )
}
