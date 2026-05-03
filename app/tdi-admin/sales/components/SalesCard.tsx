'use client'

import React from 'react'

const HEAT_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  hot: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  warm: { bg: '#FEF3C7', color: '#854D0E', dot: '#F59E0B' },
  cold: { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  parked: { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
}

const TYPE_COLORS: Record<string, string> = {
  renewal: '#10B981',
  new_business: '#3B82F6',
  expansion: '#8B5CF6',
  pilot: '#F59E0B',
  upsell: '#EC4899',
  reactivation: '#6366F1',
}

export interface SalesCardOpp {
  id: string
  name: string
  value: number | null
  probability: number
  type: string
  assignedTo: string | null
  notes: string | null
  needs_invoice: boolean
  stage: string
  source: string | null
  lastActivityAt: string | null
  heat: string
  contract_year?: string | null
}

function extractSubtitle(opp: SalesCardOpp): string {
  if (opp.needs_invoice) {
    const yr = opp.contract_year ? `${opp.contract_year} ` : ''
    return `${yr}invoice owed`
  }
  if (!opp.notes) return opp.source?.toLowerCase() || ''
  const meetingMatch = opp.notes.match(/[Mm]eeting (?:LOCKED|locked|scheduled|set)[^.]*/i)
  if (meetingMatch) return meetingMatch[0].toLowerCase()
  const firstSentence = opp.notes.split('.')[0]
  return firstSentence.length > 55 ? firstSentence.slice(0, 52) + '...' : firstSentence
}

function shortName(name: string): string {
  if (!name) return 'Unnamed'
  const parts = name.split(/ [·\-] /)
  return parts[0].length > 35 ? parts[0].slice(0, 33) + '…' : parts[0]
}

export function SalesCard({ opp, onClick }: { opp: SalesCardOpp; onClick?: () => void }) {
  const heat = HEAT_STYLES[opp.heat || 'warm'] || HEAT_STYLES.warm
  const typeColor = TYPE_COLORS[opp.type] || '#6B7280'
  const isJim = opp.assignedTo?.includes('jim')
  const ownerColor = isJim ? '#F59E0B' : '#3B82F6'
  const ownerInitial = isJim ? 'J' : opp.assignedTo ? 'R' : '?'
  const factored = (opp.value || 0) * (opp.probability || 0) / 100
  const subtitle = extractSubtitle(opp)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderLeft: `3px solid ${typeColor}`,
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'border-color 0.1s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#0a0f1e' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
    >
      {/* Line 1: Title + owner avatar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0a0f1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {shortName(opp.name)}
          {opp.type === 'renewal' && (
            <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#FEF3C7', color: '#854D0E', fontWeight: 700 }}>renewal</span>
          )}
        </p>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: ownerColor + '20', color: ownerColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 6,
        }}>{ownerInitial}</div>
      </div>

      {/* Line 2: Contextual subtitle */}
      {subtitle && (
        <p style={{ margin: 0, fontSize: 11, color: '#6B7280', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitle}
        </p>
      )}

      {/* Line 3: Money + heat pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {opp.value ? `$${(opp.value / 1000).toFixed(0)}K` : '-'}
          <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: 6 }}>· ${(factored / 1000).toFixed(0)}K factored</span>
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {opp.needs_invoice && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}>invoice</span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: heat.bg, color: heat.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: heat.dot, display: 'inline-block' }} />
            {opp.heat || 'warm'}
          </span>
        </div>
      </div>
    </div>
  )
}
