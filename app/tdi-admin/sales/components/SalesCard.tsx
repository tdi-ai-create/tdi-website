'use client'

import React from 'react'
import { InlineText, InlineSelect } from './InlineEdit'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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
  upsell: '#1e2749',
  reactivation: '#2563EB',
}

export interface SalesCardOpp {
  id: string
  name: string
  value: number | null
  probability: number
  type: string
  assignedTo: string | null
  onCallSheet: boolean
  notes: string | null
  needs_invoice: boolean
  stage: string
  source: string | null
  lastActivityAt: string | null
  heat: string
  contract_year?: string | null
  city?: string | null
  state?: string | null
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

const HEAT_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
  { value: 'parked', label: 'Parked' },
]

const SOURCE_OPTIONS_CACHE: { value: string; label: string }[] = []

export function SalesCard({ opp, onClick, draggable = false, onContextMenu, onFieldSaved, onToggleCallSheet, onAddNote, latestNote }: {
  opp: SalesCardOpp
  onClick?: () => void
  draggable?: boolean
  onContextMenu?: (e: React.MouseEvent) => void
  onFieldSaved?: (oppId: string, field: string, newValue: any) => void
  onToggleCallSheet?: (oppId: string) => void
  onAddNote?: (oppId: string) => void
  latestNote?: { body: string; created_at: string } | null
}) {
  const heat = HEAT_STYLES[opp.heat || 'warm'] || HEAT_STYLES.warm
  const typeColor = TYPE_COLORS[opp.type] || '#6B7280'
  const factored = (opp.value || 0) * (opp.probability || 0) / 100
  const subtitle = extractSubtitle(opp)

  function handleSaved(field: string, newValue: any) {
    if (onFieldSaved) onFieldSaved(opp.id, field, newValue)
  }

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={draggable ? (e) => {
        e.dataTransfer.setData('text/plain', opp.id)
        e.dataTransfer.effectAllowed = 'move'
        ;(e.currentTarget as HTMLElement).style.opacity = '0.5'
      } : undefined}
      onDragEnd={draggable ? (e) => {
        ;(e.currentTarget as HTMLElement).style.opacity = '1'
      } : undefined}
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderLeft: `3px solid ${typeColor}`,
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
        cursor: draggable ? 'grab' : 'pointer',
        transition: 'border-color 0.1s, opacity 0.15s',
      }}
      onContextMenu={onContextMenu}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#0a0f1e' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
    >
      {/* Line 1: Title + action buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0a0f1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {shortName(opp.name)}
          {opp.type === 'renewal' && (
            <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#FEF3C7', color: '#854D0E', fontWeight: 700 }}>renewal</span>
          )}
        </p>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }} onClick={(e) => e.stopPropagation()}>
          {/* Notes button */}
          {onAddNote && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddNote(opp.id) }}
              title="Add note"
              style={{
                width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: latestNote ? '#EFF6FF' : '#F3F4F6',
                color: latestNote ? '#2563EB' : '#9CA3AF',
                transition: 'all 0.1s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
          {/* Jim's list toggle */}
          {onToggleCallSheet && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCallSheet(opp.id) }}
              title={opp.onCallSheet ? "Remove from Jim's list" : "Add to Jim's list"}
              style={{
                width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: opp.onCallSheet ? '#D1FAE5' : '#F3F4F6',
                color: opp.onCallSheet ? '#059669' : '#9CA3AF',
                transition: 'all 0.1s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* City, State */}
      {(opp.city || opp.state) && (
        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#9CA3AF', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[opp.city, opp.state].filter(Boolean).join(', ')}
        </p>
      )}

      {/* Line 2: Contextual subtitle or latest note */}
      {latestNote ? (
        <p style={{ margin: 0, fontSize: 11, color: '#2563EB', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {latestNote.body.length > 60 ? latestNote.body.slice(0, 57) + '...' : latestNote.body}
          <span style={{ color: '#9CA3AF', marginLeft: 4 }}>{timeAgo(latestNote.created_at)}</span>
        </p>
      ) : subtitle ? (
        <p style={{ margin: 0, fontSize: 11, color: '#6B7280', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitle}
        </p>
      ) : null}

      {/* Line 3: Money + heat pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          <InlineText
            oppId={opp.id}
            field="value"
            value={opp.value}
            onSaved={handleSaved}
            format="currency"
            placeholder="$0"
            style={{ fontSize: 12, fontWeight: 600 }}
          />
          <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: 6 }}>&middot; ${(factored / 1000).toFixed(0)}K factored</span>
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {opp.needs_invoice && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}>invoice</span>
          )}
          <InlineSelect
            oppId={opp.id}
            field="heat"
            value={opp.heat || 'warm'}
            options={HEAT_OPTIONS}
            onSaved={handleSaved}
            renderValue={(val) => (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: (HEAT_STYLES[val || 'warm'] || HEAT_STYLES.warm).bg, color: (HEAT_STYLES[val || 'warm'] || HEAT_STYLES.warm).color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: (HEAT_STYLES[val || 'warm'] || HEAT_STYLES.warm).dot, display: 'inline-block' }} />
                {val || 'warm'}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  )
}
