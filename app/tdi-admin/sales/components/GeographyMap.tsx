'use client'

import { useState, useMemo } from 'react'
import { USChoroplethMap, type MapStateData } from '@/components/tdi-admin/shared/USChoroplethMap'

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

export function GeographyMap({ byState }: { byState: Record<string, StateData> }) {
  const [activeSegments, setActiveSegments] = useState<Set<string>>(new Set(['current_client', 'new_inquiry', 'targeting_area']))

  const hasClassifications = Object.values(byState).some(s => s.byClassification && Object.keys(s.byClassification).length > 0)

  const filteredByState = useMemo(() => {
    const result: Record<string, MapStateData> = {}
    if (hasClassifications && activeSegments.size < 3) {
      Object.entries(byState).forEach(([state, data]) => {
        const cls = data.byClassification || {}
        let count = 0, value = 0
        activeSegments.forEach(seg => {
          if (cls[seg]) { count += cls[seg].count; value += cls[seg].value }
        })
        if (count > 0) result[state] = { count, value, won: data.won }
      })
    } else {
      Object.entries(byState).forEach(([state, data]) => {
        result[state] = { count: data.count, value: data.value, won: data.won }
      })
    }
    return result
  }, [byState, hasClassifications, activeSegments])

  const segmentTotals = useMemo(() => SEGMENTS.map(seg => {
    let count = 0, value = 0
    Object.values(byState).forEach(s => {
      const cls = s.byClassification?.[seg.key]
      if (cls) { count += cls.count; value += cls.value }
    })
    return { ...seg, count, value }
  }), [byState])

  function toggleSegment(key: string) {
    const next = new Set(activeSegments)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setActiveSegments(next)
  }

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
        </div>
      )}

      <USChoroplethMap
        byState={filteredByState}
        valueLabel="opps"
        accentColor="#10B981"
      />
    </div>
  )
}
