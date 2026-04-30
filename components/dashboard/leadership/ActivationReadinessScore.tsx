'use client'

import { useEffect, useState } from 'react'

interface ScoreComponent {
  key: string
  label: string
  weight: number
  earned: number
  met: boolean
}

interface ScoreData {
  score: number
  tier: 'Ready' | 'Building' | 'Early' | 'Not Started'
  components: ScoreComponent[]
  metCount: number
  totalComponents: number
}

const TIER_CONFIG = {
  Ready: { color: '#16A34A', bg: '#F0FDF4', label: 'Activation Ready' },
  Building: { color: '#4ecdc4', bg: '#F0FDFA', label: 'Building Momentum' },
  Early: { color: '#F59E0B', bg: '#FFFBEB', label: 'Early Stage' },
  'Not Started': { color: '#9CA3AF', bg: '#F9FAFB', label: 'Not Started' },
}

function ScoreGauge({ score }: { score: number }) {
  const clamp = Math.min(100, Math.max(0, score))
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const dash = (clamp / 100) * circumference
  const color =
    clamp >= 85 ? '#16A34A' : clamp >= 60 ? '#4ecdc4' : clamp >= 30 ? '#F59E0B' : '#E5E7EB'

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1B2A4A">
        {clamp}
      </text>
    </svg>
  )
}

export default function ActivationReadinessScore({ partnershipId }: { partnershipId: string }) {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/partnerships/${partnershipId}/activation-score`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load activation score.')
        setLoading(false)
      })
  }, [partnershipId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Computing score…
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

  const tier = TIER_CONFIG[data.tier]

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Activation Readiness Score</h3>
          <p className="text-xs text-gray-400 mt-0.5">Composite 0–100 score across 7 milestones</p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: tier.bg, color: tier.color }}
        >
          {tier.label}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <ScoreGauge score={data.score} />
        <div>
          <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>
            {data.score}
            <span className="text-base font-normal text-gray-400">/100</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.metCount} of {data.totalComponents} milestones met
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {data.components.map((c) => (
          <div
            key={c.key}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${
              c.met ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                c.met ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              {c.met ? '✓' : ''}
            </div>
            <span
              className={`flex-1 text-xs font-medium ${
                c.met ? 'text-green-800' : 'text-gray-600'
              }`}
            >
              {c.label}
            </span>
            <span
              className={`text-xs font-semibold ${c.met ? 'text-green-600' : 'text-gray-400'}`}
            >
              {c.met ? `+${c.weight}` : `${c.weight} pts`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
