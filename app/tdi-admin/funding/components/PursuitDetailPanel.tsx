'use client'

import { useEffect, useState } from 'react'
import { PanelShell } from './panel/PanelShell'

interface PanelProps {
  pursuitId: string
  onClose: () => void
}

export function PursuitDetailPanel({ pursuitId, onClose }: PanelProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [pursuitId, onClose])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 580,
        background: 'white', boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
        overflowY: 'auto', zIndex: 501, padding: 0,
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
        ) : !data?.pursuit ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#991B1B' }}>Failed to load pursuit.</div>
        ) : (
          <PanelShell pursuit={data.pursuit} pursuitId={pursuitId} onClose={onClose} gate={data.gate} partnershipHealth={data.partnershipHealth} renewalEligible={data.renewalEligible} contract1={data.contract1} contract2={data.contract2} contract2LineItems={data.contract2LineItems} />
        )}
      </div>
    </>
  )
}
