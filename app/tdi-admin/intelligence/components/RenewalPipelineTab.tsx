'use client'

interface RenewalRow {
  id: string
  name: string
  stage: string
  probability: number
  value: number
  factored: number
  heat: string
  expected_close: string | null
  next_step: string | null
  assigned_to: string | null
  relationship_signal: string | null
}

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  qualified: { bg: '#FEF3C7', text: '#854D0E' },
  likely_yes: { bg: '#FBCFE8', text: '#9F1239' },
  proposal_sent: { bg: '#DBEAFE', text: '#1E40AF' },
  signed: { bg: '#D1FAE5', text: '#065F46' },
}

const HEAT_DOT: Record<string, string> = { hot: '#EF4444', warm: '#F59E0B', cold: '#3B82F6', parked: '#9CA3AF' }

export function RenewalPipelineTab({ renewalsData }: { renewalsData: RenewalRow[] }) {
  const totalValue = renewalsData.reduce((s, r) => s + r.value, 0)
  const totalFactored = renewalsData.reduce((s, r) => s + r.factored, 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <SummaryCard label="Total Pipeline" value={`$${(totalValue / 1000).toFixed(0)}K`} />
        <SummaryCard label="Factored" value={`$${(totalFactored / 1000).toFixed(0)}K`} color="#10B981" />
        <SummaryCard label="Active Renewals" value={String(renewalsData.length)} />
      </div>

      {renewalsData.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No active renewals.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {renewalsData.map(r => {
            const stageStyle = STAGE_COLORS[r.stage] || { bg: '#F3F4F6', text: '#374151' }
            const ownerName = r.assigned_to ? r.assigned_to.split('@')[0] : '—'
            return (
              <div key={r.id} style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
                padding: '14px 18px',
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: 16, alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{r.name}</div>
                  {r.next_step && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{r.next_step}</div>}
                  {r.relationship_signal === 'contact_changed' && (
                    <div style={{ fontSize: 10, color: '#991B1B', background: '#FEE2E2', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>
                      contact changed
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: stageStyle.bg, color: stageStyle.text, fontWeight: 600 }}>
                    {r.stage.replace('_', ' ')} ({r.probability}%)
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>${(r.value / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>${(r.factored / 1000).toFixed(0)}K</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: HEAT_DOT[r.heat] || '#F59E0B', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{ownerName}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color = '#0a0f1e' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  )
}
