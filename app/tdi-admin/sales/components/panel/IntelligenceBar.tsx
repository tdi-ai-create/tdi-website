'use client'

import type { FullOpportunity } from '../OpportunityDetailPanel'

const SCORE_DIMENSIONS = [
  { key: 'score_fit', breakdownKey: 'fit', label: 'Fit', max: 25 },
  { key: 'score_pain', breakdownKey: 'pain', label: 'Pain Signals', max: 25 },
  { key: 'score_funding', breakdownKey: 'funding', label: 'Funding', max: 25 },
  { key: 'score_warmth', breakdownKey: 'warmth', label: 'Warmth', max: 25 },
] as const

const DIMENSION_TOOLTIPS: Record<string, string> = {
  score_fit: 'How well this school matches TDI\'s model. Considers district size, staff types, and PD structure.',
  score_pain: 'How acute is their need? Retention issues, culture gaps, SpEd challenges, and staff frustration level.',
  score_funding: 'Is there a realistic path to budget? Title II, ESSER, grants, or existing PD budget.',
  score_warmth: 'How engaged is this lead? Reply speed, meeting attendance, proactive outreach, and relationship strength.',
}

function getBarColor(value: number, max: number): string {
  const pct = (value / max) * 100
  if (pct >= 70) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#22C55E'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

interface Props {
  opp: FullOpportunity
  onExpandIntelligence: () => void
}

export function IntelligenceBar({ opp, onExpandIntelligence }: Props) {
  // Read from BOTH scoring systems:
  // 1. AI enrichment: lead_score (0-100) + score_breakdown (JSON with fit, pain, funding, warmth)
  // 2. Manual sliders: score_fit, score_pain, score_funding, score_warmth, score_total (each 0-25)

  const leadScore = (opp.lead_score as number) || 0
  const scoreBreakdown = (opp.score_breakdown as Record<string, any>) || null
  const manualTotal = (opp.score_total as number) || 0

  // Use whichever system has data. Prefer lead_score (AI) if available, fall back to manual.
  const hasAIScore = leadScore > 0
  const hasManualScore = manualTotal > 0 || SCORE_DIMENSIONS.some(d => {
    const val = opp[d.key]
    return typeof val === 'number' && val > 0
  })
  const hasData = hasAIScore || hasManualScore

  // Determine which total to show
  const displayTotal = hasAIScore ? leadScore : manualTotal

  // Determine tier
  const scoreTier = (opp.score_tier as string) || ''
  const displayTier = scoreTier || (displayTotal >= 70 ? 'T1' : displayTotal >= 50 ? 'T2' : 'T3')

  // Get dimension values from breakdown or manual scores
  const dimensions = SCORE_DIMENSIONS.map(d => {
    // Try score_breakdown first (from AI enrichment)
    if (scoreBreakdown && scoreBreakdown[d.breakdownKey] !== undefined) {
      return { ...d, value: Number(scoreBreakdown[d.breakdownKey]) || 0 }
    }
    // Fall back to manual score fields
    const val = (opp[d.key] as number) || 0
    return { ...d, value: val }
  })

  if (!hasData) {
    return (
      <div style={{
        padding: '10px 28px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: '#FAFAFA',
      }}>
        <div title="Score this lead to see a composite fit score and priority tier" style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '2px dashed #D1D5DB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#9CA3AF', fontSize: 14, fontWeight: 700,
        }}>?</div>
        <div style={{ flex: 1 }}>
          <span title="Score this lead to see a composite fit score and priority tier" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#9CA3AF' }}>Fit Score</span>
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>No fit assessment yet. Score this lead to see intelligence here.</span>
        </div>
        <button
          onClick={onExpandIntelligence}
          title="Score this lead across 4 dimensions to generate a fit score and strategic recommendations"
          style={{
            fontSize: 11, fontWeight: 600, padding: '6px 14px',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            background: '#1B2A4A', color: 'white',
          }}
        >
          Run Fit Assessment
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding: '10px 28px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      background: '#FAFAFA',
    }}>
      {/* Score circle */}
      <div style={{ textAlign: 'center' as const, flexShrink: 0 }}>
        <div title="Composite fit score out of 100. Combines Fit, Pain Signals, Funding, and Warmth. Green = strong fit (70+). Amber = moderate fit (50 to 69). Red = weak fit (under 50)." style={{
          width: 48, height: 48, borderRadius: '50%',
          border: `3px solid ${getScoreColor(displayTotal)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column' as const,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(displayTotal), lineHeight: 1 }}>{displayTotal}</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#9CA3AF', marginTop: 2 }}>
          Fit Score
        </div>
      </div>

      {/* Tier badge */}
      {displayTier && (
        <div title="Tier 1 = highest priority, best fit. Tier 2 = good fit, worth pursuing. Tier 3 = lower fit, consider parking." style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          background: displayTier === 'T1' || displayTier === 'tier1' ? '#D1FAE5' : (displayTier === 'T2' || displayTier === 'tier2') ? '#FEF3C7' : '#F3F4F6',
          color: displayTier === 'T1' || displayTier === 'tier1' ? '#065F46' : (displayTier === 'T2' || displayTier === 'tier2') ? '#854D0E' : '#374151',
        }}>
          {displayTier === 'T1' || displayTier === 'tier1' ? 'Tier 1' : (displayTier === 'T2' || displayTier === 'tier2') ? 'Tier 2' : 'Tier 3'}
        </div>
      )}

      {/* Vertical divider */}
      <div style={{ width: 1, height: 40, background: '#E5E7EB', flexShrink: 0 }} />

      {/* Dimension bars */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 16px' }}>
        {dimensions.map(d => {
          const pct = (d.value / d.max) * 100
          return (
            <div key={d.key} title={DIMENSION_TOOLTIPS[d.key] || ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: '#6B7280' }}>{d.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{d.value}/{d.max}</span>
              </div>
              <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: getBarColor(d.value, d.max), borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Full Analysis button */}
      <button
        onClick={onExpandIntelligence}
        title="Open the full intelligence section with detailed scoring and AI strategic brief"
        style={{
          fontSize: 11, fontWeight: 600, padding: '6px 14px',
          borderRadius: 6, border: '1px solid #1B2A4A', cursor: 'pointer',
          background: 'white', color: '#1B2A4A', whiteSpace: 'nowrap' as const, flexShrink: 0,
        }}
      >
        Full Analysis
      </button>
    </div>
  )
}
