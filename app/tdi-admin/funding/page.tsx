'use client'

import { useEffect, useState } from 'react'
import { AlertBar } from './components/AlertBar'
import { PhaseTabs } from './components/PhaseTabs'
import { PursuitCard } from './components/PursuitCard'
import { PursuitDetailPanel } from './components/PursuitDetailPanel'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens'

// Impact Evidence from Hub
function ImpactEvidence() {
  const [impact, setImpact] = useState<{
    impactMetrics: {
      totalEducators: number; statesReached: number; pdHoursDelivered: number;
      certificatesEarned: number; totalEnrollments: number; courseCompletions: number;
      communityContributions: number; toolsAvailable: number;
    };
    roleBreakdown: Record<string, number>;
    statesServed: string[];
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tdi-admin/hub-connections?section=funding')
      .then(r => r.json())
      .then(d => { setImpact(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading impact data...</div>
  if (!impact) return null

  const m = impact.impactMetrics

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impact Evidence</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: '#EDE9FE', color: '#6D28D9' }}>LIVE FROM HUB</span>
      </div>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Ready-to-use metrics for grant applications and impact reports</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#8B5CF6' }}>{m.totalEducators.toLocaleString()}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Total Educators</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#2A9D8F' }}>{m.statesReached}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>States Reached</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#EAB308' }}>{m.pdHoursDelivered.toFixed(0)}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>PD Hours Delivered</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>{m.certificatesEarned}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Certificates Earned</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{m.toolsAvailable}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Tools Available</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{m.totalEnrollments}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Course Enrollments</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{m.courseCompletions}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Course Completions</p>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{m.communityContributions}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Community Posts</p>
        </div>
      </div>

      {/* Role breakdown + states */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Educator Roles Served</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(impact.roleBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([role, count]) => (
              <span key={role} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: '#F3F4F6', color: '#374151' }}>
                {role}: {count}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>States Served ({impact.statesServed.length})</p>
          <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>
            {impact.statesServed.join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}

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
        <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Funding</h1>
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
        <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Funding</h1>
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
          <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Funding</h1>
          <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 4 }}>
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

      {/* Impact Evidence from Hub */}
      <ImpactEvidence />

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
