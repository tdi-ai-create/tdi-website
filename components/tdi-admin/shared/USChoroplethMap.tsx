'use client'

import { useState, useEffect, useMemo } from 'react'
import { geoAlbersUsa, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { FIPS_TO_STATE, STATE_NAMES } from './us-states'

export interface MapStateData {
  count: number
  value: number
  won?: number
  label?: string
}

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

interface StateFeature {
  abbr: string
  path: string
  centroid: [number, number]
}

function getColor(value: number, maxValue: number, accentColor: string): string {
  if (value === 0) return '#F1F5F9'
  const ratio = Math.min(value / maxValue, 1)
  // Use green gradient by default, works for all sections
  if (ratio < 0.15) return '#D1FAE5'
  if (ratio < 0.3) return '#A7F3D0'
  if (ratio < 0.5) return '#6EE7B7'
  if (ratio < 0.7) return '#34D399'
  if (ratio < 0.85) return '#10B981'
  return '#059669'
}

export function USChoroplethMap({
  byState,
  title = 'Geography',
  subtitle = 'Distribution by state',
  valueLabel = 'pipeline',
  accentColor = '#10B981',
}: {
  byState: Record<string, MapStateData>
  title?: string
  subtitle?: string
  valueLabel?: string
  accentColor?: string
}) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [stateFeatures, setStateFeatures] = useState<StateFeature[]>([])
  const [mapLoading, setMapLoading] = useState(true)

  useEffect(() => {
    fetch(TOPO_URL)
      .then(r => r.json())
      .then(topology => {
        const geojson = feature(topology, topology.objects.states) as any
        const projection = geoAlbersUsa().fitSize([960, 600], geojson)
        const pathGen = geoPath().projection(projection)
        const features: StateFeature[] = geojson.features
          .map((f: any) => {
            const fips = String(f.id).padStart(2, '0')
            const abbr = FIPS_TO_STATE[fips]
            if (!abbr) return null
            const d = pathGen(f)
            const centroid = pathGen.centroid(f)
            if (!d || !centroid) return null
            return { abbr, path: d, centroid }
          })
          .filter(Boolean) as StateFeature[]
        setStateFeatures(features)
        setMapLoading(false)
      })
      .catch(() => setMapLoading(false))
  }, [])

  const sorted = useMemo(() =>
    Object.entries(byState)
      .filter(([s]) => s !== 'Unknown' && s !== 'TBD' && s !== 'null' && s !== 'Other')
      .sort(([, a], [, b]) => b.value - a.value),
    [byState]
  )

  const maxValue = sorted.length > 0 ? sorted[0][1].value : 1
  const stateDataMap = Object.fromEntries(sorted)
  const hoveredData = hoveredState ? stateDataMap[hoveredState] : null

  return (
    <div>
      {/* Map */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 960, margin: '0 auto' }}>
        {mapLoading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Loading map...
          </div>
        ) : (
          <svg viewBox="0 0 960 600" style={{ width: '100%', height: 'auto' }}>
            {stateFeatures.map(({ abbr, path, centroid }) => {
              const data = stateDataMap[abbr]
              const value = data?.value || 0
              const fill = getColor(value, maxValue, accentColor)
              const hasData = value > 0
              const isHovered = hoveredState === abbr
              return (
                <g
                  key={abbr}
                  onMouseEnter={() => setHoveredState(abbr)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={path}
                    fill={fill}
                    stroke={isHovered ? '#0a0f1e' : '#CBD5E1'}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    style={{ transition: 'fill 0.15s' }}
                  />
                  {hasData && (
                    <text
                      x={centroid[0]}
                      y={centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: abbr === 'AK' || abbr === 'HI' ? 9 : 10,
                        fontWeight: 700,
                        fill: value / maxValue > 0.5 ? 'white' : '#1E293B',
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
        )}

        {hoveredState && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 180, zIndex: 5,
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0a0f1e' }}>
              {STATE_NAMES[hoveredState] || hoveredState}
            </div>
            {hoveredData ? (
              <>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
                  {hoveredData.value >= 1000
                    ? `$${(hoveredData.value / 1000).toFixed(0)}K`
                    : hoveredData.value > 0
                    ? `$${hoveredData.value.toLocaleString()}`
                    : String(hoveredData.value)
                  }
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  {hoveredData.count} {hoveredData.label || valueLabel}
                  {hoveredData.won !== undefined && ` · ${hoveredData.won} won`}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>No activity</div>
            )}
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

      {/* Top states */}
      {sorted.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Top States by Value
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {sorted.slice(0, 10).map(([state, data]) => (
              <div
                key={state}
                style={{
                  padding: '10px 12px', background: hoveredState === state ? '#F0FDF4' : '#F9FAFB',
                  borderRadius: 8, borderLeft: `3px solid ${getColor(data.value, maxValue, accentColor)}`,
                  transition: 'background 0.1s', cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{state}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>
                  ${(data.value / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>
                  {data.count} {data.label || valueLabel}
                  {data.won !== undefined && ` · ${data.won} won`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
