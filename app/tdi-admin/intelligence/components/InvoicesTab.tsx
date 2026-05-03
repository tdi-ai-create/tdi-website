'use client'

interface InvoiceRow {
  id: string
  district: string
  contact: string | null
  amount: number | null
  contract_year: string | null
  notes: string | null
  needs_action: boolean
  blocked_reason: string | null
}

export function InvoicesTab({ invoicesData }: { invoicesData: InvoiceRow[] }) {
  if (invoicesData.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No invoices owed currently.</div>
  }

  const totalKnown = invoicesData.filter(i => i.amount).reduce((s, i) => s + (i.amount || 0), 0)
  const tbdCount = invoicesData.filter(i => !i.amount).length

  return (
    <div>
      <div style={{
        background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#854D0E' }}>
            {invoicesData.length} invoices need to be sent
          </div>
          <div style={{ fontSize: 12, color: '#854D0E', opacity: 0.85, marginTop: 2 }}>
            {totalKnown > 0 ? `$${totalKnown.toLocaleString('en-US', { minimumFractionDigits: 2 })} confirmed` : ''}
            {tbdCount > 0 ? `${totalKnown > 0 ? ' + ' : ''}${tbdCount} TBD` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {invoicesData.map(inv => (
          <div key={inv.id} style={{
            background: 'white',
            border: `1px solid ${inv.needs_action ? '#F59E0B' : '#E5E7EB'}`,
            borderLeft: `4px solid ${inv.needs_action ? '#F59E0B' : '#10B981'}`,
            borderRadius: 10, padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{inv.district}</div>
                {inv.contact && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{inv.contact}</div>}
                {inv.blocked_reason && (
                  <div style={{
                    fontSize: 11, color: '#991B1B', background: '#FEE2E2',
                    padding: '4px 8px', borderRadius: 6, display: 'inline-block',
                    marginTop: 8, fontWeight: 600,
                  }}>
                    ⚠️ {inv.blocked_reason}
                  </div>
                )}
                {inv.notes && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8, fontStyle: 'italic' }}>
                    {inv.notes.length > 150 ? inv.notes.slice(0, 147) + '...' : inv.notes}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', minWidth: 120 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>
                  {inv.amount ? `$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'TBD'}
                </div>
                {inv.contract_year && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{inv.contract_year}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
