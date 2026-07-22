'use client'

import type { FullOpportunity } from '../OpportunityDetailPanel'

const FIT_DIMENSIONS = [
  { key: 'fit_district_size', label: 'District Size' },
  { key: 'fit_turnover_signal', label: 'Turnover' },
  { key: 'fit_pd_investment', label: 'PD Invest' },
  { key: 'fit_budget_timing', label: 'Budget' },
  { key: 'fit_leadership_stability', label: 'Leadership' },
  { key: 'fit_tdi_alignment', label: 'Alignment' },
] as const

function getScoreColor(value: number, max: number): string {
  const pct = (value / max) * 100
  if (pct >= 70) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

function getCompositeColor(score: number): string {
  if (score >= 70) return '#22C55E'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

function getCompositeClass(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function hasAnyFitData(opp: FullOpportunity): boolean {
  return FIT_DIMENSIONS.some(d => {
    const val = opp[d.key]
    return typeof val === 'number' && val > 0
  })
}

interface Props {
  opp: FullOpportunity
  onExpandIntelligence: () => void
}

export function IntelligenceBar({ opp, onExpandIntelligence }: Props) {
  const hasFitData = hasAnyFitData(opp)

  // Compute composite: if fit_composite_score exists, use it; otherwise sum dimensions and scale to 0-100
  const compositeRaw = opp.fit_composite_score as number | null | undefined
  let compositeScore = 0
  if (typeof compositeRaw === 'number' && compositeRaw > 0) {
    compositeScore = compositeRaw
  } else if (hasFitData) {
    // Sum of 6 dimensions (each 0-10, max 60), scale to 0-100
    const sum = FIT_DIMENSIONS.reduce((acc, d) => {
      const v = opp[d.key]
      return acc + (typeof v === 'number' ? v : 0)
    }, 0)
    compositeScore = Math.round((sum / 60) * 100)
  }

  // No fit data state
  if (!hasFitData) {
    return (
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px dashed #D1D5DB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14, color: '#D1D5DB', fontWeight: 700 }}>?</span>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
              Fit Score
            </div>
          </div>
        </div>
        <div style={{ width: 1, height: 36, background: '#E5E7EB', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            No fit assessment yet. Score this lead to see intelligence here.
          </span>
        </div>
        <button
          onClick={onExpandIntelligence}
          style={{
            flexShrink: 0,
            background: '#1B2A4A',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
          }}
        >
          Run Fit Assessment
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}>
      {/* Composite score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1,
            color: getCompositeColor(compositeScore),
          }}>
            {compositeScore}
          </div>
          <div style={{
            fontSize: 10,
            color: '#9CA3AF',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
          }}>
            Fit Score
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: 1,
        height: 36,
        background: '#E5E7EB',
        flexShrink: 0,
      }} />

      {/* Mini sliders grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px 16px',
      }}>
        {FIT_DIMENSIONS.map(dim => {
          const rawVal = opp[dim.key]
          const val = typeof rawVal === 'number' ? rawVal : 0
          // Dimension values are 0-10, display as percentage for the bar
          const pct = (val / 10) * 100
          // For the displayed value, scale to match mockup (0-100 display)
          const displayVal = val * 10
          const barColor = getScoreColor(val, 10)

          return (
            <div key={dim.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                fontSize: 10,
                color: '#6B7280',
                whiteSpace: 'nowrap' as const,
                minWidth: 60,
              }}>
                {dim.label}
              </span>
              <div style={{
                flex: 1,
                height: 4,
                background: '#E5E7EB',
                borderRadius: 2,
                overflow: 'hidden',
                minWidth: 40,
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 2,
                  background: barColor,
                }} />
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#374151',
                minWidth: 20,
                textAlign: 'right' as const,
              }}>
                {displayVal}
              </span>
            </div>
          )
        })}
      </div>

      {/* Full Analysis button */}
      <button
        onClick={onExpandIntelligence}
        style={{
          flexShrink: 0,
          background: '#1B2A4A',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 14px',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap' as const,
        }}
      >
        Full Analysis
      </button>
    </div>
  )
}
