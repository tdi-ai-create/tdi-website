'use client'

/**
 * Muck points for one lead, broken into the four dimensions that made it.
 *
 * Replaces the IntelligenceBar, which showed the T1 fit score. That score was
 * written once when a lead was created and never recomputed, and it labelled
 * 41 percent of the board top tier with exactly one lead in the bottom one.
 *
 * Every row names the reason beside the number, so a score that feels wrong can
 * be traced to the dimension that caused it rather than only distrusted.
 *
 * Collapsed by default. A person opening a lead is usually there to log a call
 * or read what happened last, and the score answers a board-level question
 * ("which of these do I chase first") that is already settled by the time the
 * card is open. The summary line carries the whole answer; the breakdown is one
 * click away for the times the score looks wrong.
 *
 * It no longer splits the score between Rae and Bella. `rae` and `bella` are
 * still on the model, so this is a display change only, but the panel read
 * "Yours 40" off the `rae` field regardless of who was signed in, which told
 * Bella that Rae's load was hers and named her own in the third person. Rae's
 * rule of 15 September 2026: Bella and Rae are one role, and neither name
 * belongs in a label. The model should stop carrying the split too; that is a
 * muck.ts change and it waits for the 28 September review.
 */

import { useState }  from 'react'

export type MuckBand = 'light' | 'moderate' | 'heavy'

export interface MuckPanelScore {
  total: number | null
  band: MuckBand | null
  breakdown: { delivery: number; grant: number; drag: number; travel: number }
  rae: number
  bella: number
  value: number | null
  valuePredicted: boolean
  perPoint: number | null
  noteCount: number
  stageMedian: number
  offering: string | null
  travelTier: 'drive' | 'long_drive' | 'fly' | null
}

const MAX = { delivery: 40, grant: 25, drag: 20, travel: 15 } as const

const OFFERING_LABEL: Record<string, string> = {
  PULSE: 'The Pulse',
  FOCUS: 'The Focus',
  COHORT: 'The Cohort',
  BLUEPRINT: 'The Blueprint',
}

const TRAVEL_LABEL: Record<string, string> = {
  drive: 'A morning drive',
  long_drive: 'Long drive or short flight',
  fly: 'Flight and hotel',
}

const BAND_LABEL: Record<MuckBand, string> = {
  light: 'Light',
  moderate: 'Moderate',
  heavy: 'Heavy',
}

function Row({
  label,
  reason,
  value,
  max,
  unknown = false,
}: { label: string; reason: string; value: number; max: number; unknown?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '116px 1fr 62px', gap: 10, alignItems: 'center', padding: '6px 0' }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0a0f1e' }}>{label}</div>
        <div style={{ fontSize: 9.5, color: '#9CA3AF' }}>{reason}</div>
      </div>
      <div style={{ height: 7, background: '#F0F2F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: value > 0 ? '#1e2749' : '#E1E5EE', borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: value > 0 ? 700 : 600, color: value > 0 ? '#0a0f1e' : '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {/* A dimension we cannot measure reads as "not known", never as 0. A
            zero here says the lead costs nothing on this axis, which is a
            claim, and it is the claim that made an unscored lead outrank a
            heavy one in the outreach queue. */}
        {unknown ? <span style={{ fontSize: 10 }}>not known</span> : <>{value} <span style={{ fontWeight: 500, color: '#B6BCC8' }}>/ {max}</span></>}
      </div>
    </div>
  )
}

export function MuckBar({ score }: { score: MuckPanelScore | null }) {
  const [open, setOpen] = useState(false)

  if (!score || score.total == null) {
    return (
      <div style={{ padding: '12px 28px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF' }}>
          Muck
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>
          No offering recorded, so the largest part of the score is unknown. This is not the same as light.
        </span>
      </div>
    )
  }

  const b = score.breakdown

  return (
    <div style={{ padding: '14px 28px 16px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#0a0f1e' }}>
          {score.total}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280' }}>
            {score.band ? BAND_LABEL[score.band] : 'Unbanded'}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            {score.band === 'heavy' ? 'Top fifth of the board' : 'Muck points, out of 100'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div
            title="Deal value divided by muck points. It is the order of the outreach queue: a higher number is more money for the same effort."
            style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e' }}
          >
            {score.perPoint != null ? `$${score.perPoint.toLocaleString('en-US')} per muck point` : 'No value recorded'}
          </div>
          <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>
            {score.value != null ? `$${score.value.toLocaleString('en-US')}` : ''}
            {score.valuePredicted && score.value != null && (
              <span
                title="Before a contract exists the deal value is a prediction, so the list price for the offering is used."
                style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#FFF4D6', color: '#7A5A00', padding: '1px 5px', borderRadius: 4 }}
              >
                predicted
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: '#4F46E5',
        }}
      >
        {open ? 'Hide what makes this score' : 'What makes this score'}
      </button>

      {open && (<div style={{ marginTop: 8 }}>
      <Row
        label="Delivery load"
        reason={score.offering ? (OFFERING_LABEL[score.offering] ?? score.offering) : 'Offering unknown'}
        value={b.delivery}
        max={MAX.delivery}
      />
      <Row
        label="Grant"
        reason={b.grant > 0 ? 'Confirmed with the school' : 'Not confirmed'}
        value={b.grant}
        max={MAX.grant}
      />
      <Row
        label="Relationship drag"
        reason={`${score.noteCount} notes, stage median ${score.stageMedian}`}
        value={b.drag}
        max={MAX.drag}
      />
      <Row
        label="Travel"
        reason={score.travelTier ? TRAVEL_LABEL[score.travelTier] : 'No state recorded, so distance is unknown'}
        value={b.travel}
        max={MAX.travel}
        unknown={score.travelTier == null}
      />
      </div>)}
    </div>
  )
}
