'use client'

import { useEffect, useState } from 'react'

interface ChecklistItem {
  key: string
  label: string
  description: string
  done: boolean
  points: number
}

interface ChecklistData {
  items: ChecklistItem[]
  completed: number
  total: number
  score: number
}

export default function OnboardingChecklist({ partnershipId }: { partnershipId: string }) {
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/partnerships/${partnershipId}/onboarding-checklist`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load checklist data.')
        setLoading(false)
      })
  }, [partnershipId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Loading checklist…
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

  const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Onboarding Progress</h3>
          <p className="text-xs text-gray-400 mt-0.5">Phase 0 activation readiness gate</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
            {data.completed}
          </span>
          <span className="text-sm text-gray-400">/{data.total} complete</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? '#16A34A' : pct >= 60 ? '#4ecdc4' : '#F59E0B',
          }}
        />
      </div>

      <div className="space-y-2">
        {data.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              item.done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                item.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {item.done ? '✓' : ''}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  item.done ? 'text-green-800' : 'text-gray-700'
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.description}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                item.done
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {item.done ? `+${item.points}` : `${item.points} pts`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
