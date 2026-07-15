'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NudgePreviewModal } from '../components/panel/NudgePreviewModal'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
} from '@/components/tdi-admin/ui/design-tokens'

type Bucket = 'bella' | 'rae' | 'agent' | 'school'

const BUCKETS: { key: Bucket; emoji: string; label: string; muted?: boolean }[] = [
  { key: 'bella', emoji: '\uD83D\uDC64', label: 'Needs Bella' },
  { key: 'rae', emoji: '\uD83D\uDC54', label: 'Needs Rae' },
  { key: 'agent', emoji: '\uD83E\uDD16', label: 'With Agents', muted: true },
  { key: 'school', emoji: '\uD83C\uDFEB', label: 'Waiting on School', muted: true },
]

const URGENCY_DOT: Record<string, string> = {
  critical: '#DC2626', high: '#F59E0B', normal: '#3B82F6', low: '#D1D5DB',
}

const WINDOW_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'open', label: 'Open' },
  { value: 'closed_missed', label: 'Missed' },
  { value: 'closed_awarded', label: 'Awarded' },
  { value: 'closed_denied', label: 'Denied' },
]

function MetricPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color || '#0a0f1e' }}>{value}</div>
    </div>
  )
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#065F46', color: 'white', padding: '12px 20px',
      borderRadius: 10, fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s',
    }}>
      {message}
    </div>
  )
}

export default function QueuePage() {
  const [items, setItems] = useState<any[]>([])
  const [counts, setCounts] = useState({ bella: 0, rae: 0, agent: 0, school: 0 })
  const [metrics, setMetrics] = useState<{ pipeline: number; awarded: number; schools: number; overdue: number; fundedPct: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const initialBucket = (searchParams.get('owner') as Bucket) || 'bella'
  const [bucket, setBucket] = useState<Bucket>(initialBucket)
  const [nudgeActionId, setNudgeActionId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/funding/queue')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setCounts(d.counts || {}); setLoading(false) })
      .catch(() => setLoading(false))
    // Also fetch metrics
    fetch('/api/funding/dashboard')
      .then(r => r.json())
      .then(d => {
        const pursuits = d.pursuits || []
        const pipeline = d.alerts?.in_flight_total || pursuits.reduce((s: number, p: any) => s + (p.total_amount || 0), 0)
        const awarded = pursuits.reduce((s: number, p: any) => s + (p.total_awarded || 0), 0)
        const gap = pursuits.reduce((s: number, p: any) => s + (p.contract_gap || p.total_amount || 0), 0)
        setMetrics({
          pipeline,
          awarded,
          schools: pursuits.length,
          overdue: d.alerts?.overdue_actions || 0,
          fundedPct: gap > 0 ? Math.round((awarded / gap) * 100) : 0,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(item => {
    if (bucket === 'bella') return item.owner === 'bella' && !item.inProgress
    if (bucket === 'rae') return item.owner === 'rae' && !item.inProgress
    if (bucket === 'agent') return (item.owner === 'agent' || item.owner === 'auto')
    if (bucket === 'school') return item.owner === 'school'
    return false
  })

  const isMuted = bucket === 'agent' || bucket === 'school'

  // ── Inline action handlers ──

  const verifyContact = async (item: any) => {
    setActionLoading(item.id)
    await fetch(`/api/funding/pursuits/${item.pursuitId}/gate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitter_employment_verified_at: new Date().toISOString() }),
    })
    setActionLoading(null)
    setToast('Contact verified')
    load()
  }

  const approveDraft = async (item: any) => {
    if (!item.targetId) return
    setActionLoading(item.id)
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.targetId, narrative_status: 'ready' }),
    })
    setActionLoading(null)
    setToast('Draft approved')
    load()
  }

  const sendToQa = async (item: any) => {
    if (!item.targetId) return
    setActionLoading(item.id)
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.targetId, narrative_status: 'qa_review' }),
    })
    setActionLoading(null)
    setToast('Sent to QA review')
    load()
  }

  const markDone = async (item: any) => {
    if (!item.targetId) return
    setActionLoading(item.id)
    await fetch(`/api/funding/pursuits/${item.pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId: item.targetId, markDone: true }),
    })
    setActionLoading(null)
    setToast('Marked done')
    load()
  }

  const setWindowStatus = async (item: any, status: string) => {
    setActionLoading(item.id)
    // Apply to all unverified opps for this pursuit
    const pursuitOpps = items.filter(i => i.pursuitId === item.pursuitId && i.actionType === 'verify_window')
    // We don't have individual opp ids from the verify_window action, so open the pursuit
    // Actually — the verify_window action doesn't carry a single targetId, so link to pursuit
    setActionLoading(null)
  }

  const requestDraft = async (item: any, agent: string) => {
    if (!item.targetId) return
    setActionLoading(item.id)
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.targetId, narrative_status: 'requested', assigned_agent: agent }),
    })
    setActionLoading(null)
    setToast(`Draft requested from ${agent}`)
    load()
  }

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1000 }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Funding</h1>
          <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 4 }}>
            What needs doing right now
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/tdi-admin/funding/portfolio"
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: 'white', color: '#374151',
              textDecoration: 'none',
            }}
          >
            All Pursuits
          </Link>
          <Link
            href="/tdi-admin/funding/settings"
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: 'white', color: '#374151',
              textDecoration: 'none',
            }}
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Metrics bar */}
      {metrics && (
        <div style={{
          display: 'flex', gap: 24, padding: '12px 20px', marginBottom: 20,
          background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB',
          alignItems: 'center',
        }}>
          <MetricPill label="Pipeline" value={`$${(metrics.pipeline / 1000).toFixed(0)}K`} />
          <MetricPill label="Awarded" value={`$${(metrics.awarded / 1000).toFixed(0)}K`} color={metrics.awarded > 0 ? '#065F46' : undefined} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E5E7EB', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" style={{ position: 'absolute', top: -3, left: -3, transform: 'rotate(-90deg)' }}>
                <circle cx="16" cy="16" r="13" fill="none" stroke={metrics.fundedPct > 0 ? '#10B981' : 'transparent'} strokeWidth="3"
                  strokeDasharray={`${(metrics.fundedPct / 100) * 81.7} 81.7`} />
              </svg>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#0a0f1e' }}>{metrics.fundedPct}%</span>
            </div>
            <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Funded</span>
          </div>
          <MetricPill label="Schools" value={String(metrics.schools)} />
          {metrics.overdue > 0 && <MetricPill label="Overdue" value={String(metrics.overdue)} color="#DC2626" />}
        </div>
      )}

      {/* Bucket tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #E5E7EB', paddingBottom: 0 }}>
        {BUCKETS.map(b => (
          <button
            key={b.key}
            onClick={() => setBucket(b.key)}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 18px', cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: `3px solid ${bucket === b.key ? '#8B5CF6' : 'transparent'}`,
              color: bucket === b.key ? '#8B5CF6' : '#6B7280',
              marginBottom: -2,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>{b.emoji}</span>
            <span>{b.label}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
              background: bucket === b.key ? '#F5F3FF' : '#F3F4F6',
              color: bucket === b.key ? '#6D28D9' : '#6B7280',
            }}>
              {counts[b.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Loading queue...</div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          padding: '40px 24px', textAlign: 'center', background: 'white',
          borderRadius: 14, border: '1px solid #E5E7EB',
        }}>
          {bucket === 'bella' ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                Nothing needs you right now
              </div>
              {(counts.agent + counts.school) > 0 && (
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  {counts.agent > 0 && `${counts.agent} item${counts.agent !== 1 ? 's' : ''} with agents`}
                  {counts.agent > 0 && counts.school > 0 && ' / '}
                  {counts.school > 0 && `${counts.school} waiting on school`}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>No items in this bucket</div>
          )}
        </div>
      )}

      {/* Queue items — grouped by urgency */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {renderGrouped(filtered, isMuted)
            .map(item => item.type === 'separator' ? (
              <div key={item.key} style={{
                fontSize: 13, fontWeight: 800, color: item.color, textTransform: 'uppercase',
                letterSpacing: 0.5, padding: '12px 0 4px', marginTop: 12,
                borderBottom: `2px solid ${item.borderColor}`,
              }}>
                {item.label} ({item.count})
              </div>
            ) : (
            <QueueRow
              key={item.id}
              item={item}
              muted={isMuted}
              loading={actionLoading === item.id}
              onVerifyContact={() => verifyContact(item)}
              onApproveDraft={() => approveDraft(item)}
              onSendToQa={() => sendToQa(item)}
              onMarkDone={() => markDone(item)}
              onSendNudge={() => setNudgeActionId(item.targetId)}
              onRequestDraft={(agent: string) => requestDraft(item, agent)}
            />
          ))}
        </div>
      )}

      {/* Nudge modal */}
      {nudgeActionId && (
        <NudgePreviewModal
          actionId={nudgeActionId}
          onClose={() => setNudgeActionId(null)}
          onSent={() => { setNudgeActionId(null); load() }}
        />
      )}
    </div>
  )
}

// ── Queue row ──

// ── Group items by urgency with visual separators ──

const URGENCY_GROUPS: { key: string; label: string; color: string; borderColor: string }[] = [
  { key: 'critical', label: 'Critical', color: '#DC2626', borderColor: '#FECACA' },
  { key: 'high', label: 'High priority', color: '#D97706', borderColor: '#FDE68A' },
  { key: 'normal', label: 'Normal', color: '#374151', borderColor: '#E5E7EB' },
  { key: 'low', label: 'Low / In progress', color: '#6B7280', borderColor: '#F3F4F6' },
]

function renderGrouped(items: any[], muted: boolean): any[] {
  const result: any[] = []
  let lastUrgency = ''

  for (const item of items) {
    if (item.urgency !== lastUrgency) {
      const group = URGENCY_GROUPS.find(g => g.key === item.urgency)
      const count = items.filter(i => i.urgency === item.urgency).length
      if (group) {
        result.push({
          type: 'separator',
          key: `sep-${item.urgency}`,
          label: group.label,
          color: group.color,
          borderColor: group.borderColor,
          count,
        })
      }
      lastUrgency = item.urgency
    }
    result.push(item)
  }

  return result
}

function QueueRow({ item, muted, loading, onVerifyContact, onApproveDraft, onSendToQa, onMarkDone, onSendNudge, onRequestDraft }: {
  item: any
  muted: boolean
  loading: boolean
  onVerifyContact: () => void
  onApproveDraft: () => void
  onSendToQa: () => void
  onMarkDone: () => void
  onSendNudge: () => void
  onRequestDraft: (agent: string) => void
}) {
  const [showAgentPicker, setShowAgentPicker] = useState(false)
  const urgencyDot = URGENCY_DOT[item.urgency] || URGENCY_DOT.normal

  const renderAction = () => {
    if (loading) return <span style={{ fontSize: 10, color: '#9CA3AF' }}>...</span>

    switch (item.actionType) {
      case 'verify_contact':
        return <InlineBtn label="Verify employed" onClick={onVerifyContact} />

      case 'approve_draft':
        return <InlineBtn label="Approve" onClick={onApproveDraft} color="#10B981" />

      case 'send_to_qa':
        return <InlineBtn label="Send to QA" onClick={onSendToQa} color="#F59E0B" />

      case 'send_nudge':
        return <InlineBtn label="Send nudge" onClick={onSendNudge} />

      case 'complete_action':
        return item.owner !== 'school' ? <InlineBtn label="Done" onClick={onMarkDone} color="#10B981" /> : null

      case 'request_draft':
        return showAgentPicker ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <InlineBtn label="Vanessa" onClick={() => { onRequestDraft('vanessa'); setShowAgentPicker(false) }} />
            <InlineBtn label="Amara" onClick={() => { onRequestDraft('amara'); setShowAgentPicker(false) }} />
          </div>
        ) : (
          <InlineBtn label="Request draft" onClick={() => setShowAgentPicker(true)} />
        )

      case 'verify_window':
      case 'complete_gate':
      case 'allocate_award':
      case 'complete_profile':
      case 'prepare_submission':
      case 'request_research':
        return (
          <Link
            href={`/tdi-admin/funding/${item.pursuitId}`}
            style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              border: '1px solid #E5E7EB', background: 'white', color: '#8B5CF6',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Open pursuit
          </Link>
        )

      default:
        return null
    }
  }

  // Calculate days for display
  let daysLabel = ''
  if (item.dueDate) {
    const diff = Math.ceil(
      (new Date(item.dueDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diff < 0) daysLabel = `${Math.abs(diff)}d overdue`
    else if (diff === 0) daysLabel = 'Due today'
    else if (diff <= 7) daysLabel = `${diff}d left`
    else daysLabel = new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 18px', borderRadius: 12,
      background: item.urgency === 'critical' ? '#FEF2F2' : item.urgency === 'high' ? '#FFFBEB' : 'white',
      border: `1px solid ${item.urgency === 'critical' ? '#FECACA' : item.urgency === 'high' ? '#FDE68A' : '#E5E7EB'}`,
      borderLeft: `4px solid ${urgencyDot}`,
      opacity: muted ? 0.6 : 1,
    }}>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row: urgency label + school name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {item.urgency === 'critical' && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: '#DC2626', color: 'white', letterSpacing: 0.5 }}>
              OVERDUE
            </span>
          )}
          {item.urgency === 'high' && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 3, background: '#D97706', color: 'white', letterSpacing: 0.5 }}>
              URGENT
            </span>
          )}
          <Link
            href={`/tdi-admin/funding/${item.pursuitId}`}
            style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', textDecoration: 'none' }}
          >
            {item.pursuitName || item.districtName}
          </Link>
          {daysLabel && (
            <span style={{
              fontSize: 11, fontWeight: 600, marginLeft: 'auto',
              color: item.urgency === 'critical' ? '#DC2626' : item.urgency === 'high' ? '#D97706' : '#6B7280',
            }}>
              {daysLabel}
            </span>
          )}
        </div>

        {/* Action label — the main instruction */}
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0a0f1e', marginBottom: 2 }}>
          {item.label}
        </div>

        {/* Why — context */}
        <div style={{ fontSize: 13, color: '#6B7280' }}>
          {item.why}
        </div>
      </div>

      {/* Inline action — bigger button */}
      <div style={{ flexShrink: 0, marginTop: 6 }}>
        {renderAction()}
      </div>
    </div>
  )
}

function InlineBtn({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
        border: 'none', background: color || '#8B5CF6', color: 'white',
        cursor: 'pointer', whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {label}
    </button>
  )
}
