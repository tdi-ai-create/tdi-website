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
import { computeNextActions, type NextAction } from '@/lib/funding-next-actions'

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
  const [pursuit, setPursuit] = useState<any>(null)

  useEffect(() => {
    if (!pursuitId) return
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else { setData(d); setPursuit(d.pursuit) }
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

  if (error || !data?.pursuit || !pursuit) {
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

  const p = pursuit
  const gate = data.gate

  const patchPursuit = async (fields: Record<string, unknown>) => {
    setPursuit((prev: any) => ({ ...prev, ...fields }))
    await fetch('/api/funding/pursuits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pursuitId, ...fields }),
    })
  }
  const nextActions = computeNextActions(
    p,
    data.opportunities || [],
    data.actionItems || [],
    gate,
    data.allocations || [],
  )
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
          <div style={{ flex: 1 }}>
            <EditableText
              value={p.pursuit_name}
              onSave={v => patchPursuit({ pursuit_name: v })}
              style={{ ...TYPE_PAGE_TITLE, margin: 0 }}
            />
            <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 4 }}>
              {p.district_name}{p.client_contact_name ? ` \u00b7 ${p.client_contact_name}` : ''}
            </p>
          </div>
        </div>

        {/* Phase chain */}
        <div style={{ marginBottom: 16 }}>
          <PhaseChain currentPhase={p.current_phase} isStalled={p.is_stalled} />
        </div>

        {/* Next Actions panel */}
        <NextActionsPanel actions={nextActions} onTabChange={setActiveTab} />

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

// ── Next Actions Panel ──

const URGENCY_STYLES: Record<string, { dot: string; bg: string }> = {
  critical: { dot: '#DC2626', bg: '#FEF2F2' },
  high: { dot: '#F59E0B', bg: '#FFFBEB' },
  normal: { dot: '#3B82F6', bg: 'white' },
  low: { dot: '#D1D5DB', bg: 'white' },
}

const OWNER_BADGES: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  bella: { emoji: '\uD83D\uDC64', label: 'Bella', color: '#6D28D9', bg: '#F5F3FF' },
  rae: { emoji: '\uD83D\uDC54', label: 'Rae', color: '#0F766E', bg: '#F0FDFA' },
  agent: { emoji: '\uD83E\uDD16', label: 'Agent', color: '#1D4ED8', bg: '#EFF6FF' },
  school: { emoji: '\uD83C\uDFEB', label: 'School', color: '#92400E', bg: '#FFFBEB' },
  auto: { emoji: '\u2699\uFE0F', label: 'Auto', color: '#6B7280', bg: '#F3F4F6' },
}

function NextActionsPanel({ actions, onTabChange }: { actions: NextAction[]; onTabChange: (tab: string) => void }) {
  const actionable = actions.filter(a => !a.inProgress)
  const inFlight = actions.filter(a => a.inProgress)
  const [showInFlight, setShowInFlight] = useState(false)

  return (
    <div style={{
      marginBottom: 16, padding: '16px 20px', background: 'white',
      borderRadius: 14, border: '1px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: actionable.length > 0 ? 12 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>What's Next</span>
        {actionable.length === 0 && (
          <span style={{ fontSize: 12, color: '#065F46' }}>
            Nothing needs you right now
          </span>
        )}
        {inFlight.length > 0 && (
          <button
            onClick={() => setShowInFlight(!showInFlight)}
            style={{ fontSize: 10, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
          >
            {showInFlight ? 'Hide' : 'Show'} {inFlight.length} in flight
          </button>
        )}
      </div>

      {/* Actionable items */}
      {actionable.map(action => {
        const urgency = URGENCY_STYLES[action.urgency] || URGENCY_STYLES.normal
        const owner = OWNER_BADGES[action.owner] || OWNER_BADGES.auto

        return (
          <div
            key={action.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 12px', borderRadius: 8, marginBottom: 4,
              background: urgency.bg,
              cursor: action.tab ? 'pointer' : 'default',
            }}
            onClick={() => action.tab && onTabChange(action.tab)}
          >
            {/* Urgency dot */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgency.dot, flexShrink: 0, marginTop: 5 }} />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{action.label}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{action.why}</div>
            </div>

            {/* Owner badge */}
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: owner.bg, color: owner.color, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {owner.emoji} {owner.label}
            </span>

            {/* Due date */}
            {action.dueDate && (
              <span style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {new Date(action.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        )
      })}

      {/* In-flight items (muted) */}
      {showInFlight && inFlight.map(action => {
        const owner = OWNER_BADGES[action.owner] || OWNER_BADGES.auto
        return (
          <div
            key={action.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '6px 12px', borderRadius: 8, marginBottom: 2,
              opacity: 0.55,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{action.label}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{action.why}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: owner.bg, color: owner.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {owner.emoji} {owner.label}
            </span>
          </div>
        )
      })}
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

// ── EditableText — click-to-edit text field ──

function EditableText({ value, onSave, style }: { value: string; onSave: (v: string) => void; style?: React.CSSProperties }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { if (draft !== value) onSave(draft); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') { if (draft !== value) onSave(draft); setEditing(false) } if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        autoFocus
        style={{ ...style, border: '2px solid #8B5CF6', borderRadius: 6, padding: '4px 8px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />
    )
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true) }}
      style={{ ...style, cursor: 'pointer' }}
      title="Click to edit"
    >
      {value}
    </div>
  )
}
