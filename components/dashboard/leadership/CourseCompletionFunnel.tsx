'use client'

import { useEffect, useState } from 'react'

interface FunnelData {
  enrolled: number
  started: number
  in_progress: number
  completed: number
  has_data: boolean
}

interface FunnelStage {
  label: string
  count: number
  color: string
  bg: string
}

export default function CourseCompletionFunnel({ partnershipId }: { partnershipId: string }) {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/partnerships/${partnershipId}/course-funnel`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load course data.')
        setLoading(false)
      })
  }, [partnershipId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Loading course data…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {error || 'No data available.'}
      </div>
    )
  }

  const stages: FunnelStage[] = [
    {
      label: 'In Hub',
      count: data.enrolled,
      color: '#6366F1',
      bg: '#EEF2FF',
    },
    {
      label: 'Enrolled in Course',
      count: data.started,
      color: '#4ecdc4',
      bg: '#F0FDFA',
    },
    {
      label: 'Making Progress',
      count: data.in_progress,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      label: 'Completed ≥1 Course',
      count: data.completed,
      color: '#16A34A',
      bg: '#F0FDF4',
    },
  ]

  const max = data.enrolled || 1

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Course Completion Funnel</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Hub members → enrolled → in progress → completed
        </p>
      </div>

      {!data.has_data || data.enrolled === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No Hub members linked to this partnership yet.
        </p>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const pct = max > 0 ? Math.round((stage.count / max) * 100) : 0
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{pct}%</span>
                    <span className="text-sm font-bold" style={{ color: stage.color }}>
                      {stage.count}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${pct}%`,
                      background: stage.color,
                      minWidth: stage.count > 0 ? '2rem' : '0',
                    }}
                  >
                    {pct > 15 && (
                      <span className="text-white text-xs font-semibold">{stage.count}</span>
                    )}
                  </div>
                </div>
                {i < stages.length - 1 && stage.count > 0 && stages[i + 1].count > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5 text-right">
                    {Math.round((stages[i + 1].count / stage.count) * 100)}% advance →
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
