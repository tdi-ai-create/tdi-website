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
 */

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

function Row({ label, reason, value, max }: { label: string; reason: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '116px 1fr 34px', gap: 10, alignItems: 'center', padding: '6px 0' }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0a0f1e' }}>{label}</div>
        <div style={{ fontSize: 9.5, color: '#9CA3AF' }}>{reason}</div>
      </div>
      <div style={{ height: 7, background: '#F0F2F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: value > 0 ? '#1e2749' : '#E1E5EE', borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: value > 0 ? 700 : 600, color: value > 0 ? '#0a0f1e' : '#9CA3AF', textAlign: 'right' }}>
        {value}
      </div>
    </div>
  )
}

export function MuckBar({ score }: { score: MuckPanelScore | null }) {
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
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e' }}>
            {score.perPoint != null ? `${score.perPoint} per point` : 'No value recorded'}
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

      <div style={{ display: 'flex', gap: 22, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          Yours <b style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', marginLeft: 4 }}>{score.rae}</b>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          Bella&apos;s <b style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', marginLeft: 4 }}>{score.bella}</b>
        </div>
      </div>

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
        reason={score.travelTier ? TRAVEL_LABEL[score.travelTier] : 'No state recorded'}
        value={b.travel}
        max={MAX.travel}
      />
    </div>
  )
}
