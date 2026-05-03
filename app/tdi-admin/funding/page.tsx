'use client'

import { useEffect, useState } from 'react'
import { AlertBar } from './components/AlertBar'
import { PhaseTabs } from './components/PhaseTabs'
import { PursuitCard } from './components/PursuitCard'
import { PursuitDetailPanel } from './components/PursuitDetailPanel'

export default function FundingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePhase, setActivePhase] = useState('all')
  const [selectedPursuitId, setSelectedPursuitId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/funding/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Funding</h1>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 64, background: '#F3F4F6', borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Funding</h1>
        <div style={{ marginTop: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', color: '#991B1B', fontSize: 13 }}>
          Failed to load funding data{error ? `: ${error}` : ''}
        </div>
      </div>
    )
  }

  const pursuits = data.pursuits || []
  const filtered = activePhase === 'all'
    ? pursuits
    : pursuits.filter((p: any) => p.current_phase === activePhase)

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Funding</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            Grant Pursuits &middot; Federal, State, Foundation
          </p>
        </div>
        <button
          onClick={() => alert('Add Pursuit form ships in Phase B')}
          style={{
            fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 8,
            border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
          }}
        >
          + Add Pursuit
        </button>
      </div>

      {/* Alert bar */}
      <AlertBar alerts={data.alerts} />

      {/* Phase tabs */}
      <PhaseTabs
        activePhase={activePhase}
        onSelect={setActivePhase}
        counts={data.phase_counts || {}}
      />

      {/* In-flight summary */}
      {data.alerts.in_flight_count > 0 && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 10,
          padding: '12px 18px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: '#6D28D9', fontWeight: 500 }}>
            {data.alerts.in_flight_count} active {data.alerts.in_flight_count === 1 ? 'pursuit' : 'pursuits'} in flight
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#6D28D9' }}>
            ${data.alerts.in_flight_total.toLocaleString()} total
          </span>
        </div>
      )}

      {/* Pursuit cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No pursuits in this phase.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((p: any) => (
            <PursuitCard
              key={p.id}
              pursuit={p}
              onClick={() => setSelectedPursuitId(p.id)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selectedPursuitId && (
        <PursuitDetailPanel
          pursuitId={selectedPursuitId}
          onClose={() => setSelectedPursuitId(null)}
        />
      )}
    </div>
  )
}
