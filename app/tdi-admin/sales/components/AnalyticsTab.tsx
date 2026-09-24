'use client'

import { useEffect, useState } from 'react'
import { ConversionFunnel } from './ConversionFunnel'
import { SourceAttribution } from './SourceAttribution'
import { GeographyMap } from './GeographyMap'
import { PipelineTrend } from './PipelineTrend'
import { PipelineVelocity } from './PipelineVelocity'
import { SegmentBreakdown } from './SegmentBreakdown'
import { FactoredCalculator } from './FactoredCalculator'

interface AnalyticsData {
  pulse: {
    totalPipeline: number
    factored: number
    activeCount: number
    avgDealSize: number
    wonValue: number
    wonCount: number
    unvaluedCount: number
    staleLeads: number
    needsFollowUp: number
    signedCount: number
  }
  funnel: { stage: string; count: number; value: number }[]
  bySource: Record<string, { count: number; value: number; factored: number; won: number }>
  byState: Record<string, { count: number; value: number; won: number }>
  byOwner: Record<string, { count: number; value: number; factored: number; won: number; lost: number }>
  byType: Record<string, { count: number; value: number; factored: number }>
  snapshots: { snapshot_date: string; total_pipeline: number; factored_pipeline: number; active_count: number }[]
  velocity: { stage: string; avgDays: number; count: number }[]
}

export function AnalyticsTab({ opportunities = [] }: { opportunities?: { value: number | null; probability: number; stage: string; name: string }[] }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportCopied, setReportCopied] = useState(false)
  const [reportError, setReportError] = useState('')

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

  /**
   * Generate Board Report.
   *
   * This swallowed everything: a failed request, a non-200, a response with no
   * text in it, and a clipboard the browser refused. All four looked identical
   * from the outside, which is the button going back to normal and nothing on
   * the clipboard. Now every one of them says what happened.
   */
  async function generateReport() {
    setReportLoading(true)
    setReportError('')
    try {
      const res = await fetch('/api/sales/board-report')
      if (!res.ok) throw new Error(`The report did not build (${res.status}).`)
      const report = await res.json()
      if (!report.plainText) throw new Error('The report came back empty.')
      await navigator.clipboard.writeText(report.plainText)
      setReportCopied(true)
      setTimeout(() => setReportCopied(false), 3000)
    } catch (e) {
      setReportError(e instanceof Error ? e.message : 'The report did not build.')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
        {reportError && (
          <span style={{ fontSize: 12, color: '#B91C1C' }}>{reportError}</span>
        )}
        <button
          onClick={generateReport}
          disabled={reportLoading}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 8,
            background: reportCopied ? '#10B981' : '#0a0f1e', color: 'white',
            border: 'none', cursor: reportLoading ? 'wait' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {reportCopied ? 'Copied to clipboard' : reportLoading ? 'Generating...' : 'Generate Board Report'}
        </button>
      </div>
      <PulseSection pulse={data.pulse} />

      {opportunities.length > 0 && (
        <FactoredCalculator opportunities={opportunities} />
      )}

      <Section title="Conversion Funnel" subtitle="Where deals stall and where they progress">
        <ConversionFunnel funnel={data.funnel} />
      </Section>

      <Section title="Lead Sources" subtitle="Which channels drive the strongest pipeline">
        <SourceAttribution bySource={data.bySource} />
      </Section>

      <Section title="Geography" subtitle="Where TDI is winning by state">
        <GeographyMap byState={data.byState} />
      </Section>

      <Section title="Pipeline Velocity" subtitle="How long deals spend in each stage -- highlights bottlenecks">
        <PipelineVelocity velocity={data.velocity || []} />
      </Section>

      <Section title="Pipeline Trend" subtitle="How the pipeline has grown over time">
        <PipelineTrend snapshots={data.snapshots} />
      </Section>

      <Section title="Deal Type Mix" subtitle="Renewals vs new business vs expansion">
        <SegmentBreakdown byType={data.byType} />
      </Section>
    </div>
  )
}

function PulseSection({ pulse }: { pulse: AnalyticsData['pulse'] }) {
  const pipelineCards = [
    { label: 'Total Pipeline', value: `$${(pulse.totalPipeline / 1000).toFixed(0)}K`, color: '#2B3A67', accent: '#2B3A67', tip: `The same figure as the pipeline headline, computed by the same scorer. Until a contract is signed the number is a prediction, so a recorded figure that contradicts the offering falls back to list price. ${pulse.unvaluedCount} leads have no offering recorded and count as zero rather than as their stale imported value. Targeting is excluded.` },
    { label: 'Factored Revenue', value: `$${(pulse.factored / 1000).toFixed(0)}K`, color: '#10B981', accent: '#10B981', tip: 'Pipeline weighted by each deal\'s close probability. A $20K deal at 45% (Qualified) counts as $9K. Uses the same predicted value as the figure beside it.' },
    { label: 'Active Deals', value: String(pulse.activeCount), color: '#2B3A67', accent: '#6B7280', tip: 'Open opportunities behind the pipeline figure beside it. Same population, so the two always agree. Excludes Targeting, paid and contact-only records.' },
    { label: 'Avg Deal Size', value: `$${(pulse.avgDealSize / 1000).toFixed(1)}K`, color: '#2B3A67', accent: '#6B7280', tip: `Pipeline divided by the leads that carry a value. The ${pulse.unvaluedCount} with no offering recorded are left out of both halves rather than dragging the average down.` },
    { label: 'Signed', value: String(pulse.signedCount), color: '#6366F1', accent: '#6366F1', tip: 'Deals with a signed contract. These are committed but may not have paid yet.' },
  ]
  // Win Rate is gone. It was (signed + paid) / (signed + paid + lost), and TDI
  // never marks a lead lost, so the denominator could not carry a loss and the
  // tile read 100 percent forever. A metric that cannot report bad news is not
  // a health metric.
  const healthCards = [
    { label: 'Signed and Paid', value: `$${(pulse.wonValue / 1000).toFixed(0)}K`, color: pulse.wonValue > 0 ? '#10B981' : '#9CA3AF', accent: pulse.wonValue > 0 ? '#10B981' : '#D1D5DB', tip: `Contract value across the ${pulse.wonCount} deals that are signed or paid this year. Signed counts: the contract exists whether or not the invoice has cleared. These use the contract figure, not a prediction.` },
    { label: 'Needs Follow-up', value: String(pulse.needsFollowUp), color: pulse.needsFollowUp > 20 ? '#EF4444' : pulse.needsFollowUp > 10 ? '#F59E0B' : '#10B981', accent: pulse.needsFollowUp > 20 ? '#EF4444' : pulse.needsFollowUp > 10 ? '#F59E0B' : '#10B981', tip: 'Engaged, Qualified, or Likely Yes deals with no CRM activity logged in 14+ days. These are warm leads going cold -- someone should reach out.' },
    { label: 'Stale (30d+)', value: String(pulse.staleLeads), color: pulse.staleLeads > 40 ? '#EF4444' : pulse.staleLeads > 20 ? '#F59E0B' : '#10B981', accent: pulse.staleLeads > 40 ? '#EF4444' : pulse.staleLeads > 20 ? '#F59E0B' : '#10B981', tip: 'Any active deal with no CRM update in 30+ days. This doesn\'t mean no one is working on it -- it means no one has logged activity. Could be a data hygiene issue or a truly cold lead.' },
  ]

  const renderRow = (cards: typeof pipelineCards, title: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} title={c.tip} style={{
            background: 'white',
            border: '1px solid #F3F4F6',
            borderLeft: `3px solid ${c.accent}`,
            borderRadius: 10,
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'help',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 4 }}>
              {c.label}
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#F3F4F6', color: '#9CA3AF', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>?</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color, lineHeight: 1 }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      {renderRow(pipelineCards, 'Pipeline')}
      {renderRow(healthCards, 'Health')}
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
