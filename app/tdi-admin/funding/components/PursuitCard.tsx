'use client'

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
}

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#854D0E' },
  info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
}

export function PursuitCard({ pursuit, onClick }: { pursuit: Pursuit; onClick: () => void }) {
  const urgency = URGENCY_STYLES[pursuit.next_action_urgency || 'info'] || URGENCY_STYLES.info
  const sources = Array.isArray(pursuit.funding_sources) ? pursuit.funding_sources : []

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
          {pursuit.submission_deadline && (
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              Due {new Date(pursuit.submission_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Funding sources */}
      {sources.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {sources.map((s: any, i: number) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
              background: '#EEF2FF', color: '#4338CA',
            }}>
              {s.source} ${(s.amount / 1000).toFixed(0)}K
            </span>
          ))}
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

      {/* Stalled badge */}
      {pursuit.is_stalled && (
        <div style={{
          marginTop: 10, fontSize: 10, fontWeight: 700, color: '#991B1B',
          background: '#FEE2E2', padding: '4px 8px', borderRadius: 6,
          display: 'inline-block',
        }}>
          STALLED
        </div>
      )}
    </div>
  )
}
