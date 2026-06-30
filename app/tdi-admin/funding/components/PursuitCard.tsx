'use client'

import { useEffect, useState } from 'react'
import { PhaseChain } from './PhaseChain'
import { OwnerAvatar, ownerName } from './OwnerAvatar'

interface Pursuit {
  id: string
  pursuit_name: string
  district_name: string
  funder_label: string | null
  funding_sources: any[]
  total_amount: number
  current_phase: string
  is_stalled: boolean
  next_action_label: string | null
  next_action_owner_email: string | null
  next_action_urgency: string | null
  submission_deadline: string | null
  operational_owner_email: string | null
  // New fields from summary view
  contract_gap?: number
  total_awarded?: number
  total_pending?: number
  total_researching?: number
  remaining_gap?: number
  opportunity_count?: number
  waiting_on_client_count?: number
  next_deadline?: string | null
  overdue_action_count?: number
}

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#854D0E' },
  info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
}

const PLAN_COLORS: Record<string, string> = {
  A: '#0F766E', B: '#1B365D', C: '#7C3AED', D: '#B45309',
}

const STATUS_LABELS: Record<string, { bg: string; color: string }> = {
  not_started: { bg: '#F3F4F6', color: '#374151' },
  researching: { bg: '#EEF2FF', color: '#4338CA' },
  applied: { bg: '#DBEAFE', color: '#1D4ED8' },
  waiting: { bg: '#FEF3C7', color: '#92400E' },
  awarded: { bg: '#D1FAE5', color: '#065F46' },
  denied: { bg: '#FEE2E2', color: '#991B1B' },
  stalled: { bg: '#FEE2E2', color: '#991B1B' },
  backup: { bg: '#F3F4F6', color: '#6B7280' },
}

export function PursuitCard({ pursuit, onClick }: { pursuit: Pursuit; onClick: () => void }) {
  const urgency = URGENCY_STYLES[pursuit.next_action_urgency || 'info'] || URGENCY_STYLES.info

  // Fetch opportunities for status chips
  const [opps, setOpps] = useState<any[]>([])
  useEffect(() => {
    fetch(`/api/funding/opportunities?pursuitId=${pursuit.id}`)
      .then(r => r.json())
      .then(d => setOpps(d.opportunities || []))
      .catch(() => {})
  }, [pursuit.id])

  const gap = pursuit.contract_gap || pursuit.total_amount || 0
  const awarded = pursuit.total_awarded || 0
  const pending = pursuit.total_pending || 0
  const hasGapData = gap > 0
  const gapPct = hasGapData ? Math.round((awarded / gap) * 100) : 0

  // Next deadline countdown
  const nextDeadline = pursuit.next_deadline
  let deadlineDays: number | null = null
  if (nextDeadline) {
    deadlineDays = Math.ceil(
      (new Date(nextDeadline + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        padding: 20,
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Top row: name + amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0a0f1e' }}>{pursuit.pursuit_name}</div>
          {pursuit.funder_label && (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{pursuit.funder_label}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0a0f1e' }}>
            ${pursuit.total_amount.toLocaleString()}
          </div>
          {deadlineDays !== null && (
            <div style={{
              fontSize: 11, marginTop: 2, fontWeight: 600,
              color: deadlineDays <= 3 ? '#DC2626' : deadlineDays <= 7 ? '#D97706' : '#6B7280',
            }}>
              {deadlineDays <= 0 ? 'Deadline passed' : `Next deadline: ${deadlineDays}d`}
            </div>
          )}
        </div>
      </div>

      {/* Opportunity status chips */}
      {opps.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {opps.slice(0, 6).map((opp: any) => {
            const statusStyle = STATUS_LABELS[opp.status] || STATUS_LABELS.not_started
            const planColor = PLAN_COLORS[opp.plan_category] || '#6B7280'
            return (
              <span key={opp.id} style={{
                fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: statusStyle.bg, color: statusStyle.color,
                borderLeft: `3px solid ${planColor}`,
              }}>
                {opp.name}: {(opp.status || 'not_started').replace(/_/g, ' ')}
              </span>
            )
          })}
          {opps.length > 6 && (
            <span style={{ fontSize: 10, color: '#9CA3AF', padding: '3px 4px' }}>
              +{opps.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Funding gap progress bar */}
      {hasGapData && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#6B7280' }}>
              ${awarded.toLocaleString()} awarded{pending > 0 ? ` / $${pending.toLocaleString()} pending` : ''}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: gapPct >= 100 ? '#065F46' : '#6B7280' }}>
              {gapPct}% of ${gap.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
            {awarded > 0 && (
              <div style={{ height: '100%', width: `${Math.min((awarded / gap) * 100, 100)}%`, background: '#10B981', borderRadius: 3 }} />
            )}
            {pending > 0 && (
              <div style={{ height: '100%', width: `${Math.min((pending / gap) * 100, 100 - (awarded / gap) * 100)}%`, background: '#3B82F6' }} />
            )}
          </div>
        </div>
      )}

      {/* Phase chain */}
      <div style={{ marginBottom: 12 }}>
        <PhaseChain currentPhase={pursuit.current_phase} isStalled={pursuit.is_stalled} />
      </div>

      {/* Next action callout */}
      {pursuit.next_action_label && (
        <div style={{
          background: urgency.bg,
          border: `1px solid ${urgency.border}`,
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: urgency.text }}>
            {pursuit.next_action_label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: urgency.text }}>
              {ownerName(pursuit.next_action_owner_email)}
            </span>
            <OwnerAvatar email={pursuit.next_action_owner_email} size={22} />
          </div>
        </div>
      )}

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {pursuit.is_stalled && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#991B1B',
            background: '#FEE2E2', padding: '4px 8px', borderRadius: 6,
          }}>
            STALLED
          </span>
        )}
        {(pursuit.waiting_on_client_count ?? 0) > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#C2410C',
            background: '#FFF7ED', padding: '4px 8px', borderRadius: 6,
          }}>
            {pursuit.waiting_on_client_count} WAITING ON CLIENT
          </span>
        )}
        {(pursuit.overdue_action_count ?? 0) > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#DC2626',
            background: '#FEF2F2', padding: '4px 8px', borderRadius: 6,
          }}>
            {pursuit.overdue_action_count} OVERDUE
          </span>
        )}
      </div>
    </div>
  )
}
