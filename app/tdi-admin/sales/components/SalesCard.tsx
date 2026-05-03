'use client'

import React from 'react'

const HEAT_STYLES: Record<string, { bg: string; color: string; emoji: string }> = {
  hot: { bg: '#FEE2E2', color: '#991B1B', emoji: '\uD83D\uDD25' },
  warm: { bg: '#FEF3C7', color: '#854D0E', emoji: '\uD83D\uDFE1' },
  cold: { bg: '#DBEAFE', color: '#1E40AF', emoji: '\u2744\uFE0F' },
  parked: { bg: '#F3F4F6', color: '#374151', emoji: '\uD83C\uDD7F\uFE0F' },
}

const TYPE_COLORS: Record<string, string> = {
  renewal: '#10B981',
  new_business: '#3B82F6',
  expansion: '#8B5CF6',
  pilot: '#F59E0B',
  upsell: '#EC4899',
  reactivation: '#6366F1',
}

interface SalesCardOpp {
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
}

function extractSubtitle(opp: SalesCardOpp): string {
  if (!opp.notes) return opp.source || 'No context'
  const meetingMatch = opp.notes.match(/[Mm]eeting (?:LOCKED|locked|scheduled|set)[^.]*/i)
  if (meetingMatch) return meetingMatch[0]
  const firstSentence = opp.notes.split('.')[0]
  return firstSentence.length > 60 ? firstSentence.slice(0, 57) + '...' : firstSentence
}

function getHeat(opp: SalesCardOpp): string {
  if (['signed', 'proposal_sent', 'likely_yes'].includes(opp.stage)) return 'hot'
  if (!opp.lastActivityAt) return 'cold'
  const days = (Date.now() - new Date(opp.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 7) return 'hot'
  if (days <= 30) return 'warm'
  if (days <= 90) return 'cold'
  return 'parked'
}

function Tag({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, padding: '2px 6px',
      borderRadius: 6, background: bg, color: color,
    }}>{children}</span>
  )
}

export function SalesCard({ opp, compact = false }: { opp: SalesCardOpp; compact?: boolean }) {
  const heat = HEAT_STYLES[getHeat(opp)] || HEAT_STYLES.warm
  const heatLabel = getHeat(opp)
  const typeColor = TYPE_COLORS[opp.type] || '#6B7280'
  const ownerInitial = opp.assignedTo ? opp.assignedTo.charAt(0).toUpperCase() : '?'
  const ownerColor = opp.assignedTo?.includes('jim') ? '#F59E0B' : '#3B82F6'
  const factored = (opp.value || 0) * (opp.probability || 0) / 100
  const subtitle = extractSubtitle(opp)

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderLeft: `3px solid ${typeColor}`,
      borderRadius: 8,
      padding: compact ? 10 : 14,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e', lineHeight: 1.3 }}>
          {opp.name}
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: ownerColor + '20',
          color: ownerColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>
          {ownerInitial}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>
        {subtitle}
      </div>

      {(opp.type || opp.needs_invoice) && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {opp.type === 'renewal' && <Tag color="#854D0E" bg="#FEF3C7">renewal</Tag>}
          {opp.type === 'pilot' && <Tag color="#854D0E" bg="#FEF3C7">pilot</Tag>}
          {opp.type === 'expansion' && <Tag color="#5B21B6" bg="#EDE9FE">expansion</Tag>}
          {opp.needs_invoice && <Tag color="#DC2626" bg="#FEE2E2">invoice</Tag>}
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          ${((opp.value || 0) / 1000).toFixed(0)}K
          <span style={{ color: '#6B7280', fontWeight: 500, marginLeft: 6 }}>
            ${(factored / 1000).toFixed(0)}K
          </span>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
          background: heat.bg, color: heat.color,
        }}>
          {heat.emoji} {heatLabel}
        </div>
      </div>
    </div>
  )
}
