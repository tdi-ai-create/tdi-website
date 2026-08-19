'use client'

/**
 * Impact Evidence, lifted out of the Portfolio page when that page was folded
 * into the main funding page. It is reference material a person reaches for
 * while writing an application, so it belongs alongside the schools rather than
 * on a page of its own.
 */

import { useEffect, useState } from 'react'
import { RadialGauge, DonutChart, DonutLegend, ProgressRing, LiveSectionHeader } from '@/components/tdi-admin/hub-charts/HubCharts'

export function ImpactEvidence() {
  const [expanded, setExpanded] = useState(false)
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
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: expanded ? 0 : 0 }}
      >
        <LiveSectionHeader title="Impact Evidence" subtitle="Ready-to-use metrics for grant applications and impact reports" dotColor="#8B5CF6" badgeColor="#EDE9FE" badgeTextColor="#6D28D9" />
        <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 'auto', paddingRight: 8 }}>
          {expanded ? 'Collapse' : 'Expand'}
        </span>
      </div>

      {!expanded ? null : <>
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
      </>}
    </div>
  )
}
