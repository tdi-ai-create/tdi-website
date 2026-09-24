'use client'

import React from 'react'
import { InlineText, InlineSelect } from './InlineEdit'
import { URGENCY_COLOR, hasFollowup, shortDate, urgency, type Followup } from '@/lib/sales/followup'
import { NO_CALLER, SALES_TEAM, callerOf, teamLabel } from '@/lib/sales/team'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const TYPE_COLORS: Record<string, string> = {
  renewal: '#10B981',
  new_business: '#3B82F6',
  expansion: '#8B5CF6',
  pilot: '#F59E0B',
  upsell: '#1e2749',
  reactivation: '#2563EB',
}

export type MuckBand = 'light' | 'moderate' | 'heavy'

const BAND_FILL: Record<MuckBand, number> = { light: 1, moderate: 2, heavy: 3 }

/**
 * Muck reads as bars, not a dot.
 *
 * The heat pill on this card already owns the coloured dot. A second dot beside
 * it would read as another version of the same measurement rather than a
 * different one, so magnitude is shown as a filling meter instead.
 */
function MuckPill({ total, band }: { total: number; band: MuckBand }) {
  const filled = BAND_FILL[band]
  const heights = [4, 6.5, 9]
  return (
    <span
      title={`Muck points: how much work this lead is predicted to take. ${band === 'heavy' ? 'Heavy, top fifth of the board.' : band === 'moderate' ? 'Moderate.' : 'Light.'} Open the lead to see what made it this heavy.`}
      style={{
        fontSize: 9, fontWeight: 700, padding: '1px 5px 1px 4px', borderRadius: 4,
        background: '#EEF1F8', color: '#1e2749',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1.5, height: 9 }}>
        {heights.map((h, i) => (
          <span
            key={i}
            style={{
              width: 2.5, height: h, borderRadius: 0.5, display: 'block',
              background: i < filled ? '#1e2749' : '#C3CADB',
            }}
          />
        ))}
      </span>
      {total}
    </span>
  )
}

export interface SalesCardOpp {
  id: string
  name: string
  value: number | null
  probability: number
  type: string
  assignedTo: string | null
  onCallSheet: boolean
  /** Email of whoever is making the call. Null means nobody is. */
  callOwner?: string | null
  notes: string | null
  needs_invoice: boolean
  stage: string
  source: string | null
  lastActivityAt: string | null
  heat: string
  contract_year?: string | null
  city?: string | null
  state?: string | null
  /** The live follow-up alert, if anything is owed on this lead. */
  followup?: Followup | null
  /** Muck points. Null total means the offering is unknown, not that it is light. */
  muck?: {
    total: number | null
    band: MuckBand | null
    /** Best prediction of the deal value. A contract figure once signed. */
    value?: number | null
    valuePredicted?: boolean
  } | null
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
  const typeColor = TYPE_COLORS[opp.type] || '#6B7280'
  // Until a contract exists the deal value is a prediction, so the board shows
  // the predicted figure rather than a stale import. Rae, 17 September 2026.
  const shownValue = opp.muck?.value ?? opp.value
  const predicted = Boolean(opp.muck?.valuePredicted)
  const factored = (shownValue || 0) * (opp.probability || 0) / 100
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
          {opp.source && /pd.plan|website/i.test(opp.source) && (
            <span title="Submitted a PD Plan Request via the website" style={{ marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}>PD Plan</span>
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
          {/* Who is on the phones for this lead.
              Was a plain on/off toggle, so the board could say a lead needed a
              call and never who was making it. Rae, 24 September 2026: it
              should "indicate who is assigned to that call ... that way we can
              scan and filter quickly to see who's in charge of calls".
              The initial is always drawn, not just the colour, because two of
              the four colours she chose are red and green. */}
          <InlineSelect
            oppId={opp.id}
            field="call_owner"
            value={opp.callOwner ?? ''}
            options={[
              { value: '', label: 'Nobody, take it off the call list' },
              ...SALES_TEAM.map(m => ({ value: m.email, label: `${m.label} is calling` })),
            ]}
            onSaved={handleSaved}
            renderValue={(val) => {
              const who = callerOf(val)
              return (
                <span
                  title={who ? `${who.label} is making this call. Click to change.` : 'Nobody is on this call. Click to put a name on it.'}
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: who ? who.dot : NO_CALLER.dot,
                    color: who ? who.ink : NO_CALLER.ink,
                    fontSize: 10, fontWeight: 800, lineHeight: 1,
                  }}
                >
                  {who ? who.label.charAt(0) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                </span>
              )
            }}
          />
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

      {/* Line 3: money */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          <InlineText
            oppId={opp.id}
            field="value"
            value={shownValue}
            onSaved={handleSaved}
            format="currency"
            placeholder="$0"
            style={{ fontSize: 12, fontWeight: 600 }}
          />
          {predicted && (
            <span
              title="No contract yet, so this is a prediction. Where the recorded figure contradicted the offering it falls back to list price."
              style={{ marginLeft: 5, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: '#FFF4D6', color: '#7A5A00', padding: '1px 4px', borderRadius: 3 }}
            >
              pred
            </span>
          )}
          <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: 6 }}>&middot; ${(factored / 1000).toFixed(0)}K factored</span>
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {opp.muck?.total != null && opp.muck.band && (
            <MuckPill total={opp.muck.total} band={opp.muck.band} />
          )}
          {opp.needs_invoice && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}>invoice</span>
          )}
          {/* Heat is gone. Rae, 24 September 2026: "remove hot warm and cold.
              we dont need that. its just creating confusion." The column stays
              in the database and chaseOrder still reads it as a tiebreak after
              value per muck point, which almost never ties, so nothing on the
              board depends on a signal nobody can see. Same treatment the
              retired T1 fit score got. */}
        </div>
      </div>

      {/* Line 4: what is owed next, and who owes it. Only rendered when there
          is an alert, so a card with nothing outstanding is unchanged. */}
      {hasFollowup(opp.followup) && (() => {
        const state = urgency(opp.followup?.due)
        const tone = URGENCY_COLOR[state]
        const when = shortDate(opp.followup?.due)
        return (
          <div
            title={opp.followup?.text ?? ''}
            style={{
              marginTop: 6, display: 'flex', alignItems: 'center', gap: 5,
              background: tone.bg, border: `1px solid ${tone.border}`, borderRadius: 6,
              padding: '3px 6px', fontSize: 9, fontWeight: 700, color: tone.fg,
              textTransform: 'uppercase', letterSpacing: '0.03em',
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}
          >
            {/* Person first. The card answers "whose job is this" before it
                answers "by when", because on a board of 166 that is the thing
                being scanned for. */}
            <span aria-hidden>&#9873;</span>
            <span>{opp.followup?.owner ? teamLabel(opp.followup.owner) : 'UNCLAIMED'}</span>
            <span style={{ opacity: 0.5 }}>&middot;</span>
            <span style={{ fontWeight: 600 }}>{opp.followup?.kind ?? 'follow up'}</span>
            {when && <><span style={{ opacity: 0.5 }}>&middot;</span><span style={{ fontWeight: 600 }}>{state === 'overdue' ? `past due ${when}` : when}</span></>}
          </div>
        )
      })()}
    </div>
  )
}
