'use client'

import { useEffect, useState } from 'react'

interface WeekPoint {
  weekLabel: string
  weekStart: string
  activeUsers: number
}

interface TrendData {
  weeks: WeekPoint[]
  has_data: boolean
  member_count: number
}

export default function LoginTrendChart({ partnershipId }: { partnershipId: string }) {
  const [data, setData] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ week: WeekPoint; x: number; y: number } | null>(null)

  useEffect(() => {
    fetch(`/api/partnerships/${partnershipId}/login-trend`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load login trend.')
        setLoading(false)
      })
  }, [partnershipId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Loading trend data…
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

  const { weeks, has_data, member_count } = data

  const W = 560
  const H = 140
  const PAD_X = 8
  const PAD_Y = 16

  const maxVal = Math.max(...weeks.map((w) => w.activeUsers), 1)
  const colWidth = (W - PAD_X * 2) / (weeks.length || 1)

  const points = weeks.map((w, i) => ({
    x: PAD_X + i * colWidth + colWidth / 2,
    y: H - PAD_Y - ((w.activeUsers / maxVal) * (H - PAD_Y * 2)),
    week: w,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const fillD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${H - PAD_Y} L ${points[0].x} ${H - PAD_Y} Z`
      : ''

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">12-Week Login Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Weekly active Hub users · {member_count} total members
          </p>
        </div>
        {has_data && (
          <span className="text-xs text-gray-400">
            Peak:{' '}
            <span className="font-semibold text-gray-700">
              {Math.max(...weeks.map((w) => w.activeUsers))}
            </span>{' '}
            users
          </span>
        )}
      </div>

      {!has_data ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No Hub activity recorded yet for this partnership.
        </div>
      ) : (
        <div className="relative" onMouseLeave={() => setTooltip(null)}>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="overflow-visible"
          >
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = H - PAD_Y - frac * (H - PAD_Y * 2)
              return (
                <line
                  key={frac}
                  x1={PAD_X}
                  y1={y}
                  x2={W - PAD_X}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )
            })}

            {/* Fill area */}
            {fillD && (
              <path d={fillD} fill="rgba(78,205,196,0.12)" />
            )}

            {/* Line */}
            {pathD && (
              <path d={pathD} fill="none" stroke="#4ecdc4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#4ecdc4"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ week: p.week, x: p.x, y: p.y })}
              />
            ))}

            {/* X-axis labels — every 3rd week to avoid crowding */}
            {points
              .filter((_, i) => i % 3 === 0 || i === points.length - 1)
              .map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={H - 2}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9CA3AF"
                >
                  {p.week.weekLabel}
                </text>
              ))}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg"
              style={{
                left: `calc(${(tooltip.x / W) * 100}% - 48px)`,
                top: `${(tooltip.y / H) * 100}%`,
                transform: 'translateY(-140%)',
              }}
            >
              <p className="font-semibold">{tooltip.week.weekLabel}</p>
              <p>{tooltip.week.activeUsers} active users</p>
              {member_count > 0 && (
                <p className="text-gray-300">
                  {Math.round((tooltip.week.activeUsers / member_count) * 100)}% of members
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
