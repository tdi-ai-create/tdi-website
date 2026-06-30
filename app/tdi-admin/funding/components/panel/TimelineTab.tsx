'use client'

import { useEffect, useState } from 'react'

interface TimelineTabProps {
  pursuitId: string
}

export function TimelineTab({ pursuitId }: TimelineTabProps) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        setTimeline(d.timeline || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pursuitId])

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  if (timeline.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>
        No timeline events yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#E5E7EB' }} />

      {timeline.map((evt: any) => {
        const dotColor = evt.status === 'complete' ? '#10B981'
          : evt.status === 'active' ? '#EF4444'
          : '#D1D5DB'

        return (
          <div key={evt.id} style={{ display: 'flex', gap: 14, paddingBottom: 14, position: 'relative' }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: dotColor, flexShrink: 0,
              border: '2px solid white', zIndex: 1,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{evt.event_title}</span>
                <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
                  {evt.event_date
                    ? new Date(evt.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''}
                </span>
              </div>
              {evt.event_detail && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{evt.event_detail}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
