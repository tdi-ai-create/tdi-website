'use client'

import { useState } from 'react'
import { US_STATES } from './us-states'

interface StateData {
  count: number
  value: number
  won: number
  byClassification?: Record<string, { count: number; value: number }>
}

const SEGMENTS = [
  { key: 'current_client', label: 'Current Clients', sublabel: 'renewing / expanded' },
  { key: 'new_inquiry', label: 'New Inquiries', sublabel: 'inbound' },
  { key: 'targeting_area', label: 'Targeting Areas', sublabel: 'outbound' },
] as const

function getColor(value: number, maxValue: number): string {
  if (value === 0) return '#F1F5F9'
  const ratio = Math.min(value / maxValue, 1)
  if (ratio < 0.15) return '#D1FAE5'
  if (ratio < 0.3) return '#A7F3D0'
  if (ratio < 0.5) return '#6EE7B7'
  if (ratio < 0.7) return '#34D399'
  if (ratio < 0.85) return '#10B981'
  return '#059669'
}

export function GeographyMap({ byState }: { byState: Record<string, StateData> }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [activeSegments, setActiveSegments] = useState<Set<string>>(new Set(['current_client', 'new_inquiry', 'targeting_area']))

  const hasClassifications = Object.values(byState).some(s => s.byClassification && Object.keys(s.byClassification).length > 0)

  // Filter state data by active segments
  const filteredByState: Record<string, StateData> = {}
  if (hasClassifications && activeSegments.size < 3) {
    Object.entries(byState).forEach(([state, data]) => {
      const cls = data.byClassification || {}
      let count = 0, value = 0
      activeSegments.forEach(seg => {
        if (cls[seg]) { count += cls[seg].count; value += cls[seg].value }
      })
      if (count > 0) filteredByState[state] = { count, value, won: data.won, byClassification: cls }
    })
  } else {
    Object.assign(filteredByState, byState)
  }

  const segmentTotals = SEGMENTS.map(seg => {
    let count = 0, value = 0
    Object.values(byState).forEach(s => {
      const cls = s.byClassification?.[seg.key]
      if (cls) { count += cls.count; value += cls.value }
    })
    return { ...seg, count, value }
  })

  function toggleSegment(key: string) {
    const next = new Set(activeSegments)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setActiveSegments(next)
  }

  const sorted = Object.entries(filteredByState)
    .filter(([s]) => s !== 'Unknown' && s !== 'TBD' && s !== 'null' && s !== 'Other')
    .sort(([, a], [, b]) => b.value - a.value)

  const maxValue = sorted.length > 0 ? sorted[0][1].value : 1
  const stateDataMap = Object.fromEntries(sorted)
  const hoveredData = hoveredState ? stateDataMap[hoveredState] : null

  return (
    <div>
      {/* Segmentation toggle */}
      {hasClassifications && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {segmentTotals.map(seg => {
              const active = activeSegments.has(seg.key)
              return (
                <label
                  key={seg.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                    background: active ? 'rgba(16, 185, 129, 0.06)' : '#F9FAFB',
                    border: active ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #E5E7EB',
                    transition: 'all 0.1s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSegment(seg.key)}
                    style={{ accentColor: '#10B981', width: 14, height: 14 }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0f1e' }}>{seg.label}</div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>
                      {seg.sublabel} · ${(seg.value / 1000).toFixed(0)}K · {seg.count} deals
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
          {activeSegments.size < 3 && activeSegments.size > 0 && (
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8, fontStyle: 'italic' }}>
              Showing {activeSegments.size} of 3 segments: {SEGMENTS.filter(s => activeSegments.has(s.key)).map(s => s.label).join(' + ')}
            </div>
          )}
          {activeSegments.size === 0 && (
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, textAlign: 'center', padding: 20 }}>
              Select a segment to view
            </div>
          )}
        </div>
      )}

      {/* US Choropleth Map */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 960, margin: '0 auto' }}>
        <svg viewBox="0 0 960 600" style={{ width: '100%', height: 'auto' }}>
          {Object.entries(US_STATES).map(([abbr, state]) => {
            const data = stateDataMap[abbr]
            const value = data?.value || 0
            const fill = getColor(value, maxValue)
            const hasData = value > 0
            const isHovered = hoveredState === abbr

            return (
              <g
                key={abbr}
                onMouseEnter={() => setHoveredState(abbr)}
                onMouseLeave={() => setHoveredState(null)}
                style={{ cursor: hasData ? 'pointer' : 'default' }}
              >
                <path
                  d={state.path}
                  fill={fill}
                  stroke={isHovered ? '#0a0f1e' : '#E2E8F0'}
                  strokeWidth={isHovered ? 2 : 0.75}
                  style={{ transition: 'fill 0.15s' }}
                />
                {hasData && (
                  <text
                    x={state.labelX}
                    y={state.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fill: value / maxValue > 0.5 ? 'white' : '#1B365D',
                      pointerEvents: 'none',
                      textShadow: value / maxValue > 0.5 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    {abbr}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredState && hoveredData && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 160, zIndex: 5,
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>{hoveredState}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
              ${(hoveredData.value / 1000).toFixed(0)}K
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
              {hoveredData.count} opps · {hoveredData.won} won
            </div>
          </div>
        )}

        {/* Tooltip for states with no data */}
        {hoveredState && !hoveredData && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 5,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#9CA3AF' }}>{hoveredState}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>No pipeline activity</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16 }}>
        <span style={{ fontSize: 10, color: '#6B7280', marginRight: 4 }}>$0</span>
        {['#F1F5F9', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'].map((c, i) => (
          <div key={i} style={{ width: 28, height: 10, background: c, borderRadius: 2 }} />
        ))}
        <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>
          ${(maxValue / 1000).toFixed(0)}K+
        </span>
      </div>

      {/* Top states table */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Top States by Pipeline Value
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {sorted.slice(0, 10).map(([state, data]) => (
            <div
              key={state}
              style={{
                padding: '10px 12px',
                background: hoveredState === state ? '#F0FDF4' : '#F9FAFB',
                borderRadius: 8,
                borderLeft: `3px solid ${getColor(data.value, maxValue)}`,
                transition: 'background 0.1s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredState(state)}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{state}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>
                ${(data.value / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: 10, color: '#6B7280' }}>
                {data.count} opps · {data.won} won
              </div>
            </div>
          ))}
        </div>
      </div>

      {sorted.length === 0 && activeSegments.size > 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
          No geographic data available.
        </div>
      )}
    </div>
  )
}
