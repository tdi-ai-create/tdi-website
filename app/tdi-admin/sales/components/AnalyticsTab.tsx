'use client'

import { useEffect, useState } from 'react'
import { ConversionFunnel } from './ConversionFunnel'
import { SourceAttribution } from './SourceAttribution'
import { GeographyMap } from './GeographyMap'
import { PipelineTrend } from './PipelineTrend'
import { TeamPerformance } from './TeamPerformance'
import { SegmentBreakdown } from './SegmentBreakdown'

interface AnalyticsData {
  pulse: {
    totalPipeline: number
    factored: number
    activeCount: number
    avgDealSize: number
    wonValue: number
    wonCount: number
    winRate: number
  }
  funnel: { stage: string; count: number; value: number }[]
  bySource: Record<string, { count: number; value: number; factored: number; won: number }>
  byState: Record<string, { count: number; value: number; won: number }>
  byOwner: Record<string, { count: number; value: number; factored: number; won: number; lost: number }>
  byType: Record<string, { count: number; value: number; factored: number }>
  snapshots: { snapshot_date: string; total_pipeline: number; factored_pipeline: number; active_count: number }[]
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/sales/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
        }
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading analytics...</div>
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Failed to load: {error}</div>
  if (!data) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PulseSection pulse={data.pulse} />

      <Section title="Conversion Funnel" subtitle="Where deals stall and where they progress">
        <ConversionFunnel funnel={data.funnel} />
      </Section>

      <Section title="Lead Sources" subtitle="Which channels drive the strongest pipeline">
        <SourceAttribution bySource={data.bySource} />
      </Section>

      <Section title="Geography" subtitle="Where TDI is winning by state">
        <GeographyMap byState={data.byState} />
      </Section>

      <Section title="Pipeline Trend" subtitle="How the pipeline has grown over time">
        <PipelineTrend snapshots={data.snapshots} />
      </Section>

      <Section title="Team Performance" subtitle="Pipeline and conversion by owner">
        <TeamPerformance byOwner={data.byOwner} />
      </Section>

      <Section title="Deal Type Mix" subtitle="Renewals vs new business vs expansion">
        <SegmentBreakdown byType={data.byType} />
      </Section>
    </div>
  )
}

function PulseSection({ pulse }: { pulse: AnalyticsData['pulse'] }) {
  const cards = [
    { label: 'Pipeline', value: `$${(pulse.totalPipeline / 1000).toFixed(0)}K`, color: '#6366F1' },
    { label: 'Factored', value: `$${(pulse.factored / 1000).toFixed(0)}K`, color: '#6366F1' },
    { label: 'Active deals', value: String(pulse.activeCount), color: '#6366F1' },
    { label: 'Avg deal size', value: `$${(pulse.avgDealSize / 1000).toFixed(0)}K`, color: '#6366F1' },
    { label: 'Win rate', value: `${pulse.winRate}%`, color: '#10B981' },
    { label: 'Won YTD', value: `$${(pulse.wonValue / 1000).toFixed(0)}K`, color: '#10B981' },
  ]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 8,
    }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: 'white',
          border: '1px solid #F3F4F6',
          borderTop: '3px solid #6366F1',
          borderRadius: 12,
          padding: '16px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: c.color, lineHeight: 1 }}>
            {c.value}
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  )
}
