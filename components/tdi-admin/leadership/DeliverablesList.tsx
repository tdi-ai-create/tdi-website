'use client'

import { useState, useEffect } from 'react'

export default function DeliverablesList({ partnershipId, userEmail }: { partnershipId: string; userEmail: string }) {
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/deliverables?partnership_id=${partnershipId}`, {
      headers: { 'x-user-email': userEmail },
    })
      .then(r => r.json())
      .then(d => { setDeliverables(d.deliverables || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [partnershipId, userEmail])

  if (loading) return <div className="text-center text-gray-400 text-xs py-3">Loading deliverables...</div>
  if (deliverables.length === 0) return null

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#F3F4F6', text: '#6B7280', label: 'Pending' },
    pending_funding: { bg: '#EDE9FE', text: '#7C3AED', label: 'Awaiting Grant' },
    scheduled: { bg: '#DBEAFE', text: '#1E40AF', label: 'Scheduled' },
    delivered: { bg: '#FEF3C7', text: '#854D0E', label: 'Delivered' },
    invoiced: { bg: '#DBEAFE', text: '#1E40AF', label: 'Invoiced' },
    paid: { bg: '#D1FAE5', text: '#065F46', label: 'Paid' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
  }

  const directItems = deliverables.filter((d: any) => d.funding_type === 'direct')
  const grantItems = deliverables.filter((d: any) => d.funding_type !== 'direct')

  const renderGroup = (items: any[], title: string, accentColor: string) => {
    if (items.length === 0) return null
    const totalValue = items.reduce((s: number, d: any) => s + Number(d.total_amount || 0), 0)
    const deliveredCount = items.filter((d: any) => ['delivered', 'invoiced', 'paid'].includes(d.delivery_status)).length

    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor }} />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          </div>
          <span className="text-[10px] text-gray-400">{deliveredCount}/{items.length} delivered, ${totalValue.toLocaleString()}</span>
        </div>
        <div className="space-y-1">
          {items.map((d: any) => {
            const sc = statusConfig[d.delivery_status] || statusConfig.pending
            return (
              <div key={d.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors" style={{ borderLeft: `3px solid ${accentColor}` }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">{d.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {d.delivery_date && `Delivered ${new Date(d.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    {d.delivered_by && ` by ${d.delivered_by.split('@')[0]}`}
                    {!d.delivery_date && d.is_complimentary && 'Complimentary'}
                    {!d.delivery_date && !d.is_complimentary && d.delivery_status === 'pending' && 'Not yet scheduled'}
                    {!d.delivery_date && d.delivery_status === 'pending_funding' && 'Waiting on grant funding'}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!d.is_complimentary && Number(d.total_amount) > 0 && (
                    <span className="text-xs font-bold text-gray-700">${Number(d.total_amount).toLocaleString()}</span>
                  )}
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: sc.bg, color: sc.text }}>
                    {sc.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">
            ${deliverables.filter((d: any) => !d.is_complimentary).reduce((s: number, d: any) => s + Number(d.total_amount || 0), 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400">total contract value</div>
        </div>
      </div>

      {renderGroup(directItems, 'Direct Pay', '#10B981')}
      {renderGroup(grantItems, 'Grant Funded', '#8B5CF6')}
    </div>
  )
}
