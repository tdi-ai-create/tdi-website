'use client'

import { useState } from 'react'

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

// Simplified US state paths (center coordinates for label placement + SVG paths)
// Using a stylized hex/grid map for clean rendering without heavy D3 dependency
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  AK: { x: 80, y: 460 }, HI: { x: 200, y: 460 },
  WA: { x: 105, y: 50 }, OR: { x: 95, y: 105 }, CA: { x: 75, y: 210 },
  NV: { x: 135, y: 175 }, ID: { x: 170, y: 100 }, MT: { x: 240, y: 55 },
  WY: { x: 240, y: 130 }, UT: { x: 175, y: 195 }, CO: { x: 265, y: 210 },
  AZ: { x: 165, y: 285 }, NM: { x: 240, y: 290 },
  ND: { x: 340, y: 60 }, SD: { x: 340, y: 115 }, NE: { x: 345, y: 165 },
  KS: { x: 365, y: 220 }, OK: { x: 370, y: 275 }, TX: { x: 340, y: 350 },
  MN: { x: 400, y: 75 }, IA: { x: 410, y: 155 }, MO: { x: 430, y: 225 },
  AR: { x: 440, y: 290 }, LA: { x: 440, y: 350 },
  WI: { x: 455, y: 85 }, IL: { x: 470, y: 175 }, MS: { x: 480, y: 310 },
  MI: { x: 520, y: 105 }, IN: { x: 520, y: 185 }, AL: { x: 525, y: 300 },
  OH: { x: 565, y: 175 }, KY: { x: 555, y: 230 }, TN: { x: 535, y: 260 },
  GA: { x: 560, y: 310 }, FL: { x: 580, y: 380 },
  WV: { x: 595, y: 210 }, VA: { x: 625, y: 225 }, NC: { x: 620, y: 265 },
  SC: { x: 600, y: 295 },
  PA: { x: 625, y: 155 }, NJ: { x: 665, y: 175 }, DE: { x: 665, y: 205 },
  MD: { x: 645, y: 195 }, DC: { x: 655, y: 215 },
  NY: { x: 650, y: 115 }, CT: { x: 680, y: 135 }, RI: { x: 695, y: 140 },
  MA: { x: 690, y: 120 }, VT: { x: 660, y: 75 }, NH: { x: 675, y: 80 },
  ME: { x: 700, y: 55 },
}

function getColor(value: number, maxValue: number): string {
  if (value === 0) return '#F3F4F6'
  const ratio = Math.min(value / maxValue, 1)
  // Interpolate from light green to deep green
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

  // Check if classification data exists
  const hasClassifications = Object.values(byState).some(s => s.byClassification && Object.keys(s.byClassification).length > 0)

  // Filter state data by active segments
  const filteredByState: Record<string, StateData> = {}
  if (hasClassifications && activeSegments.size < 3) {
    Object.entries(byState).forEach(([state, data]) => {
      const cls = data.byClassification || {}
      let count = 0, value = 0, won = 0
      activeSegments.forEach(seg => {
        if (cls[seg]) {
          count += cls[seg].count
          value += cls[seg].value
        }
      })
      if (count > 0) filteredByState[state] = { count, value, won: data.won, byClassification: cls }
    })
  } else {
    Object.assign(filteredByState, byState)
  }

  // Compute segment totals for labels
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
  const stateMap = Object.fromEntries(sorted)
  const hoveredData = hoveredState ? stateMap[hoveredState] : null

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

      {/* Map */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 780, margin: '0 auto' }}>
        <svg viewBox="0 0 780 500" style={{ width: '100%', height: 'auto' }}>
          {/* State hexagons */}
          {Object.entries(STATE_POSITIONS).map(([abbr, pos]) => {
            const data = stateMap[abbr]
            const value = data?.value || 0
            const fill = getColor(value, maxValue)
            const hasData = value > 0
            const isHovered = hoveredState === abbr

            return (
              <g
                key={abbr}
                onMouseEnter={() => hasData && setHoveredState(abbr)}
                onMouseLeave={() => setHoveredState(null)}
                style={{ cursor: hasData ? 'pointer' : 'default' }}
              >
                <rect
                  x={pos.x - 22}
                  y={pos.y - 16}
                  width={44}
                  height={32}
                  rx={6}
                  fill={fill}
                  stroke={isHovered ? '#0a0f1e' : hasData ? '#059669' : '#E5E7EB'}
                  strokeWidth={isHovered ? 2 : 1}
                  opacity={hasData ? 1 : 0.5}
                />
                <text
                  x={pos.x}
                  y={pos.y - 2}
                  textAnchor="middle"
                  style={{
                    fontSize: hasData ? 11 : 9,
                    fontWeight: hasData ? 700 : 500,
                    fill: hasData ? '#0a0f1e' : '#9CA3AF',
                    pointerEvents: 'none',
                  }}
                >
                  {abbr}
                </text>
                {hasData && (
                  <text
                    x={pos.x}
                    y={pos.y + 11}
                    textAnchor="middle"
                    style={{ fontSize: 8, fontWeight: 600, fill: '#6B7280', pointerEvents: 'none' }}
                  >
                    ${(value / 1000).toFixed(0)}K
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredState && hoveredData && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 160,
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
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16 }}>
        <span style={{ fontSize: 10, color: '#6B7280', marginRight: 4 }}>$0</span>
        {['#F3F4F6', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'].map((c, i) => (
          <div key={i} style={{ width: 28, height: 10, background: c, borderRadius: 2 }} />
        ))}
        <span style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>
          ${(maxValue / 1000).toFixed(0)}K+
        </span>
      </div>

      {/* Top states table below map */}
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
                background: hoveredState === state ? '#FFFBEB' : '#F9FAFB',
                borderRadius: 8,
                borderLeft: `3px solid ${getColor(data.value, maxValue)}`,
                transition: 'background 0.1s',
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

      {sorted.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
          No geographic data available.
        </div>
      )}
    </div>
  )
}
