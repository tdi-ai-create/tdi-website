'use client'

import { useEffect, useState } from 'react'
import { AlertBar } from './components/AlertBar'
import { PhaseTabs } from './components/PhaseTabs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PursuitCard } from './components/PursuitCard'
import { MyTasks } from './components/MyTasks'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens'
import { RadialGauge, DonutChart, DonutLegend, ProgressRing, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts'

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
  const roleEntries = Object.entries(impact.roleBreakdown).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ marginBottom: 24 }}>
      <LiveSectionHeader title="Impact Evidence" subtitle="Ready-to-use metrics for grant applications and impact reports" dotColor="#8B5CF6" badgeColor="#EDE9FE" badgeTextColor="#6D28D9" />

      {/* Gauges row: big visual indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialGauge value={m.statesReached} max={50} label="of 50 states" size={120} color="#2A9D8F" />
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialGauge value={m.totalEducators} max={Math.max(m.totalEducators * 1.3, 100)} label="educators" size={120} color="#8B5CF6" />
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialGauge value={Math.round(m.pdHoursDelivered)} max={Math.max(m.pdHoursDelivered * 1.3, 100)} label="PD hours" size={120} color="#EAB308" />
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialGauge value={m.certificatesEarned} max={Math.max(m.certificatesEarned * 1.3, 50)} label="certificates" size={120} color="#2563EB" />
        </div>
      </div>

      {/* Secondary metrics with progress rings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Tools Available', value: m.toolsAvailable, color: '#EC4899' },
          { label: 'Course Enrollments', value: m.totalEnrollments, color: '#F97316' },
          { label: 'Course Completions', value: m.courseCompletions, color: '#10B981' },
          { label: 'Community Posts', value: m.communityContributions, color: '#6366F1' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProgressRing value={item.value} max={Math.max(item.value * 1.3, 20)} size={40} color={item.color} />
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1e2749' }}>{item.value}</p>
              <p style={{ fontSize: 10, color: '#6B7280' }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role donut + states list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Educator Roles Served</p>
          {roleEntries.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <DonutChart
                data={roleEntries.slice(0, 6).map(([name, value]) => ({ name, value }))}
                size={140}
                innerRadius={38}
                outerRadius={58}
                centerValue={m.totalEducators}
                centerLabel="total"
              />
              <DonutLegend data={roleEntries.slice(0, 6).map(([name, value]) => ({ name, value }))} />
            </div>
          ) : <p style={{ color: '#9CA3AF', fontSize: 12 }}>No role data</p>}
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(139, 92, 246, 0.2)', padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>States Served ({impact.statesServed.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {impact.statesServed.map(state => (
              <span key={state} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#EDE9FE', color: '#6D28D9', fontWeight: 500 }}>
                {state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FundingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const [activePhase, setActivePhase] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPursuit, setNewPursuit] = useState({ districtName: '', totalAmount: '', implementationDate: '', clientName: '', clientEmail: '', clientPhone: '', clientRole: '' })
  const [addingPursuit, setAddingPursuit] = useState(false)

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
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/tdi-admin/funding/queue"
            style={{
              fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 8,
              border: '2px solid #8B5CF6', background: 'white', color: '#8B5CF6',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            My Queue
          </Link>
          <Link
            href="/tdi-admin/funding/settings"
            style={{
              fontSize: 12, padding: '10px 14px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: 'white', color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            Settings
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 8,
              border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
            }}
          >
            + Add Pursuit
          </button>
        </div>
      </div>

      {/* Add Pursuit Form */}
      {showAddForm && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e2749', marginBottom: 16 }}>New funding pursuit</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>School/District name</label>
              <input
                type="text"
                value={newPursuit.districtName}
                onChange={e => setNewPursuit(p => ({ ...p, districtName: e.target.value }))}
                placeholder="e.g. Allenwood Elementary"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Contract amount ($)</label>
              <input
                type="number"
                value={newPursuit.totalAmount}
                onChange={e => setNewPursuit(p => ({ ...p, totalAmount: e.target.value }))}
                placeholder="e.g. 56000"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Implementation date</label>
              <input
                type="date"
                value={newPursuit.implementationDate}
                onChange={e => setNewPursuit(p => ({ ...p, implementationDate: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }}
              />
            </div>
          </div>
          {/* Client contact fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Client contact name</label>
              <input type="text" value={newPursuit.clientName} onChange={e => setNewPursuit(p => ({ ...p, clientName: e.target.value }))}
                placeholder="e.g. Teri Hernandez" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Client email</label>
              <input type="email" value={newPursuit.clientEmail} onChange={e => setNewPursuit(p => ({ ...p, clientEmail: e.target.value }))}
                placeholder="e.g. name@school.org" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Client phone</label>
              <input type="tel" value={newPursuit.clientPhone} onChange={e => setNewPursuit(p => ({ ...p, clientPhone: e.target.value }))}
                placeholder="e.g. 301-555-0100" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Client role</label>
              <input type="text" value={newPursuit.clientRole} onChange={e => setNewPursuit(p => ({ ...p, clientRole: e.target.value }))}
                placeholder="e.g. Principal" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={async () => {
                if (!newPursuit.districtName) return
                setAddingPursuit(true)
                try {
                  const res = await fetch('/api/funding/pursuits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      districtName: newPursuit.districtName,
                      totalAmount: parseFloat(newPursuit.totalAmount) || 0,
                      contractGap: parseFloat(newPursuit.totalAmount) || 0,
                      implementationDate: newPursuit.implementationDate || null,
                      clientContactName: newPursuit.clientName || null,
                      clientContactEmail: newPursuit.clientEmail || null,
                      clientContactPhone: newPursuit.clientPhone || null,
                      clientContactRole: newPursuit.clientRole || null,
                    }),
                  })
                  const result = await res.json()
                  if (result.success) {
                    setShowAddForm(false)
                    setNewPursuit({ districtName: '', totalAmount: '', implementationDate: '', clientName: '', clientEmail: '', clientPhone: '', clientRole: '' })
                    // Reload data
                    window.location.reload()
                  }
                } catch {} finally { setAddingPursuit(false) }
              }}
              disabled={!newPursuit.districtName || addingPursuit}
              style={{ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', opacity: !newPursuit.districtName || addingPursuit ? 0.5 : 1 }}
            >
              {addingPursuit ? 'Creating...' : 'Create pursuit'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
            Auto-generates 6 standard funding opportunities (Title II-A, IDEA/CEIS, Title I, NEA, Community Schools, Walmart) and 9 action items with due dates calculated from implementation date. All assigned to Bella by default.
          </p>
        </div>
      )}

      {/* Impact Evidence from Hub */}
      <ImpactEvidence />

      {/* Alert bar */}
      <AlertBar alerts={data.alerts} />

      {/* My Tasks - cross-pursuit action items */}
      <MyTasks />

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
              onClick={() => router.push(`/tdi-admin/funding/${p.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  )
}
