'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PhaseChain } from '../components/PhaseChain'
import { OverviewTab } from '../components/panel/OverviewTab'
import { OpportunitiesTab } from '../components/panel/OpportunitiesTab'
import { ActionsTab } from '../components/panel/ActionsTab'
import { TimelineTab } from '../components/panel/TimelineTab'
import { EmailsTab } from '../components/panel/EmailsTab'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
} from '@/components/tdi-admin/ui/design-tokens'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'actions', label: 'Actions' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'emails', label: 'Emails' },
]

export default function PursuitDetailPage() {
  const params = useParams()
  const pursuitId = params.pursuitId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!pursuitId) return
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [pursuitId])

  if (loading) {
    return (
      <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
            &larr; Back to Funding
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 48, background: '#F3F4F6', borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data?.pursuit) {
    return (
      <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
            &larr; Back to Funding
          </Link>
        </div>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', color: '#991B1B', fontSize: 13 }}>
          Failed to load pursuit{error ? `: ${error}` : ''}
        </div>
      </div>
    )
  }

  const p = data.pursuit
  const gate = data.gate
  const awarded = p.total_awarded || 0
  const gap = p.contract_gap || p.total_amount || 0
  const remaining = gap - awarded
  const gapPct = gap > 0 ? Math.round((awarded / gap) * 100) : 0

  return (
    <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1100 }}>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          &larr; Back to Funding
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>{p.pursuit_name}</h1>
            <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 4 }}>
              {p.district_name}{p.client_contact_name ? ` \u00b7 ${p.client_contact_name}` : ''}
            </p>
          </div>
        </div>

        {/* Phase chain */}
        <div style={{ marginBottom: 16 }}>
          <PhaseChain currentPhase={p.current_phase} isStalled={p.is_stalled} />
        </div>

        {/* Key stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="Contract" value={`$${(p.total_amount || 0).toLocaleString()}`} />
          <StatCard label="Awarded" value={`$${awarded.toLocaleString()}`} color={awarded > 0 ? '#065F46' : undefined} />
          <StatCard label="Remaining gap" value={`$${remaining.toLocaleString()}`} color={remaining > 0 ? '#92400E' : '#065F46'} />
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Funded</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>{gapPct}%</div>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(gapPct, 100)}%`, background: gapPct >= 100 ? '#10B981' : '#3B82F6', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 28,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 24px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === tab.id ? '#8B5CF6' : 'transparent'}`,
              color: activeTab === tab.id ? '#8B5CF6' : '#6B7280',
              marginBottom: -2,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — full width */}
      <div style={{ minHeight: 400 }}>
        {activeTab === 'overview' && (
          <OverviewTab
            pursuit={p}
            gate={gate}
            onGateUpdate={() => {}}
            partnershipHealth={data.partnershipHealth}
            renewalEligible={data.renewalEligible}
            contract1={data.contract1}
            contract2={data.contract2}
            contract2LineItems={data.contract2LineItems}
          />
        )}
        {activeTab === 'opportunities' && (
          <OpportunitiesTab
            pursuitId={pursuitId}
            gateOpen={gate?.gate_open === true}
            contract2LineItems={data.contract2LineItems}
            contract2QuotePackageId={data.contract2LineItems?.[0]?.id}
          />
        )}
        {activeTab === 'actions' && <ActionsTab pursuitId={pursuitId} />}
        {activeTab === 'timeline' && <TimelineTab pursuitId={pursuitId} />}
        {activeTab === 'emails' && <EmailsTab pursuitId={pursuitId} pursuit={p} />}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
      <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || '#0a0f1e', marginTop: 4 }}>{value}</div>
    </div>
  )
}
