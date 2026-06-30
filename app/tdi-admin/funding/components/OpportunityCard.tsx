'use client'

import { WaitingOnBadge } from './WaitingOnBadge'
import { DeadlineCountdown } from './DeadlineCountdown'

interface Opportunity {
  id: string
  name: string
  amount: number | null
  status: string
  plan_category?: string | null
  waiting_on?: string | null
  application_closes?: string | null
  contact_name?: string | null
  narrative_status?: string | null
  client_submitted?: boolean
  notes?: any[]
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onStatusChange: (id: string, status: string) => void
  onExpand: (id: string) => void
}

const PLAN_COLORS: Record<string, string> = {
  A: '#0F766E',
  B: '#1B365D',
  C: '#7C3AED',
  D: '#B45309',
}

const STATUS_OPTIONS = [
  'not_started',
  'researching',
  'applied',
  'waiting',
  'awarded',
  'denied',
  'stalled',
  'backup',
]

const NARRATIVE_DOT_COLORS: Record<string, string> = {
  not_started: '#DC2626',
  drafting: '#F59E0B',
  review: '#F59E0B',
  ready: '#10B981',
}

function formatAmount(n: number | null): string {
  if (n == null) return '--'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function displayStatus(s: string): string {
  return s.replace(/_/g, ' ')
}

export function OpportunityCard({ opportunity, onStatusChange, onExpand }: OpportunityCardProps) {
  const planKey = opportunity.plan_category?.replace(/^plan\s*/i, '').toUpperCase() || null
  const borderColor = (planKey && PLAN_COLORS[planKey]) || '#6B7280'
  const planLabel = planKey ? `Plan ${planKey}` : null
  const narrativeDotColor = NARRATIVE_DOT_COLORS[opportunity.narrative_status || ''] || '#D1D5DB'
  const waitingOn = (opportunity.waiting_on || 'none') as 'tdi' | 'client' | 'funder' | 'none'

  return (
    <div
      onClick={() => onExpand(opportunity.id)}
      style={{
        background: 'white',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${borderColor}`,
        cursor: 'pointer',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {planLabel && (
          <span style={{ fontSize: 10, fontWeight: 700, color: borderColor, whiteSpace: 'nowrap' }}>
            {planLabel}
          </span>
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#0a0f1e',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {opportunity.name}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', whiteSpace: 'nowrap' }}>
          {formatAmount(opportunity.amount)}
        </span>
      </div>

      {/* Middle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <select
          value={opportunity.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            onStatusChange(opportunity.id, e.target.value)
          }}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 6,
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#0a0f1e',
            cursor: 'pointer',
            textTransform: 'capitalize',
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {displayStatus(s)}
            </option>
          ))}
        </select>
        <WaitingOnBadge waitingOn={waitingOn} />
        <DeadlineCountdown deadline={opportunity.application_closes} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {opportunity.contact_name && (
          <span style={{ fontSize: 11, color: '#6B7280' }}>{opportunity.contact_name}</span>
        )}
        {opportunity.narrative_status && (
          <span
            title={opportunity.narrative_status}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: narrativeDotColor,
              display: 'inline-block',
            }}
          />
        )}
        {opportunity.client_submitted && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>
            &#10003; Submitted
          </span>
        )}
      </div>
    </div>
  )
}
