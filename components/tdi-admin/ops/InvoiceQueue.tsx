'use client'

import { useState, useEffect } from 'react'

interface Deliverable {
  id: string
  label: string
  service_type: string
  quantity: number
  total_amount: number
  delivery_date: string
  delivery_status: string
  is_complimentary: boolean
  quote_id: string
  quotes: {
    quote_number: string
    title: string
    contact_name: string
    contact_email: string
    contact_organization: string
  }
  partnerships: {
    slug: string
    contact_name: string
  } | null
}

interface GroupedDeliverables {
  organization: string
  contact: string
  contactEmail: string
  quoteNumber: string
  quoteId: string
  items: Deliverable[]
  total: number
}

export function InvoiceQueue({ userEmail }: { userEmail: string }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/deliverables?invoice_ready=true', {
      headers: { 'x-user-email': userEmail },
    })
      .then(r => r.json())
      .then(d => {
        setDeliverables(d.deliverables || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userEmail])

  // Group by contract
  const grouped: GroupedDeliverables[] = []
  deliverables.forEach(d => {
    const existing = grouped.find(g => g.quoteId === d.quote_id)
    if (existing) {
      existing.items.push(d)
      existing.total += Number(d.total_amount)
    } else {
      grouped.push({
        organization: d.quotes.contact_organization || d.quotes.title,
        contact: d.quotes.contact_name,
        contactEmail: d.quotes.contact_email,
        quoteNumber: d.quotes.quote_number,
        quoteId: d.quote_id,
        items: [d],
        total: Number(d.total_amount),
      })
    }
  })

  async function handleGenerateInvoice(group: GroupedDeliverables) {
    setGenerating(group.quoteId)
    try {
      const res = await fetch('/api/admin/deliverables/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
        body: JSON.stringify({ deliverable_ids: group.items.map(i => i.id) }),
      })
      const result = await res.json()
      if (result.success) {
        setSuccessMsg(`${result.invoice.invoice_number} created -- $${result.invoice.amount.toLocaleString()}`)
        setDeliverables(prev => prev.filter(d => !group.items.some(gi => gi.id === d.id)))
        setTimeout(() => setSuccessMsg(''), 5000)
      }
    } catch { /* silent */ }
    setGenerating(null)
  }

  if (loading) return <div style={{ padding: 24, color: '#9CA3AF', textAlign: 'center' }}>Loading invoice queue...</div>

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Invoice Queue
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Services delivered but not yet invoiced
          </div>
        </div>
        {grouped.length > 0 && (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '4px 12px', borderRadius: 8 }}>
            {deliverables.length} ready
          </div>
        )}
      </div>

      {successMsg && (
        <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {grouped.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No services ready for invoicing. Delivered services will appear here automatically.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {grouped.map(group => (
            <div key={group.quoteId} style={{
              border: '1px solid #E5E7EB', borderLeft: '4px solid #F59E0B',
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{group.organization}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {group.quoteNumber} -- {group.contact}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>
                    ${group.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    {group.items.length} service{group.items.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4B5563', padding: '4px 8px', background: '#F9FAFB', borderRadius: 4 }}>
                    <span>{item.label}</span>
                    <span style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#9CA3AF' }}>
                        {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
                      </span>
                      <span style={{ fontWeight: 600 }}>${Number(item.total_amount).toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleGenerateInvoice(group)}
                  disabled={generating === group.quoteId}
                  style={{
                    fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                    border: 'none', background: '#10B981', color: 'white',
                    cursor: generating === group.quoteId ? 'wait' : 'pointer',
                    opacity: generating === group.quoteId ? 0.5 : 1,
                  }}
                >
                  {generating === group.quoteId ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
