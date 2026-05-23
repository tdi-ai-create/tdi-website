'use client'

import { useState, useMemo } from 'react'

interface Opportunity {
  value: number | null
  probability: number
  stage: string
  name: string
}

const TIERS = [
  { prob: 5, label: 'Targeting', stages: ['targeting'] },
  { prob: 10, label: 'Engaged', stages: ['engaged'] },
  { prob: 30, label: 'Qualified', stages: ['qualified'] },
  { prob: 50, label: 'Likely Yes', stages: ['likely_yes'] },
  { prob: 70, label: 'Proposal Sent', stages: ['proposal_sent'] },
  { prob: 90, label: 'Signed', stages: ['signed'] },
]

export function FactoredCalculator({ opportunities }: { opportunities: Opportunity[] }) {
  // Default: 30%+ checked
  const [checkedTiers, setCheckedTiers] = useState<Set<number>>(new Set([30, 50, 70, 90]))

  // Count deals per tier
  const tierData = useMemo(() => {
    return TIERS.map(tier => {
      const deals = opportunities.filter(o => tier.stages.includes(o.stage) && (o.value || 0) > 0)
      const totalValue = deals.reduce((s, o) => s + (o.value || 0), 0)
      return { ...tier, deals: deals.length, totalValue }
    })
  }, [opportunities])

  // Calculate headline based on checked tiers
  const included = useMemo(() => {
    const includedDeals = opportunities.filter(o => {
      const tier = TIERS.find(t => t.stages.includes(o.stage))
      return tier && checkedTiers.has(tier.prob) && (o.value || 0) > 0
    })
    const totalValue = includedDeals.reduce((s, o) => s + (o.value || 0), 0)
    const uniqueNames = new Set(includedDeals.map(o => o.name.split(/ [-·] /)[0].trim()))
    return { count: includedDeals.length, value: totalValue, districts: uniqueNames.size }
  }, [opportunities, checkedTiers])

  function handleToggle(prob: number) {
    const next = new Set(checkedTiers)
    if (next.has(prob)) {
      next.delete(prob)
    } else {
      // Auto-check all higher tiers too
      TIERS.forEach(t => {
        if (t.prob >= prob) next.add(t.prob)
      })
    }
    setCheckedTiers(next)
  }

  const lowestChecked = TIERS.filter(t => checkedTiers.has(t.prob)).sort((a, b) => a.prob - b.prob)[0]

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
        What-If Revenue Calculator
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
        If deals at this probability or higher close, our revenue is:
      </div>

      {/* Headline */}
      <div style={{
        background: '#F9FAFB', borderRadius: 12, padding: '20px 24px',
        textAlign: 'center', marginBottom: 20,
      }}>
        {checkedTiers.size === 0 ? (
          <div style={{ fontSize: 14, color: '#9CA3AF' }}>$0 — select a threshold to begin</div>
        ) : (
          <>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0a0f1e', lineHeight: 1 }}>
              ${included.value >= 1000000
                ? `${(included.value / 1000000).toFixed(2)}M`
                : `${(included.value / 1000).toFixed(0)}K`
              }
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
              {included.count} deals · {included.districts} districts
            </div>
          </>
        )}
      </div>

      {/* Tier checkboxes */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Threshold
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tierData.map(tier => {
          const checked = checkedTiers.has(tier.prob)
          return (
            <label
              key={tier.prob}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: checked ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                border: checked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                transition: 'all 0.1s',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(tier.prob)}
                style={{ accentColor: '#10B981', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e', minWidth: 30 }}>{tier.prob}%</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>— {tier.label}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
                {tier.deals} deals · ${(tier.totalValue / 1000).toFixed(0)}K
              </span>
            </label>
          )
        })}
      </div>

      {/* Helper text */}
      {lowestChecked && (
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 14, fontStyle: 'italic' }}>
          Showing deals at {lowestChecked.prob}% probability or higher
        </div>
      )}
    </div>
  )
}
