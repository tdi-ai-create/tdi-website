'use client'

interface Observation {
  observation_id: string
  observation_title: string
  observation_date: string
  active_users_before: number
  active_users_after: number
  engagement_change_pct: number | null
  mood_before: number | null
  mood_after: number | null
  mood_change: number | null
  quick_wins_before: number
  quick_wins_after: number
}

interface Props {
  observations: Observation[]
}

function ChangeCell({ value, unit = '%' }: { value: number | null; unit?: string }) {
  if (value === null)
    return <span className="text-gray-300 text-lg font-bold">—</span>

  const color = value > 0 ? '#16A34A' : value < 0 ? '#DC2626' : '#6B7280'
  const prefix = value > 0 ? '+' : ''

  return (
    <span className="text-lg font-bold" style={{ color }}>
      {prefix}{value}{unit}
    </span>
  )
}

export default function ObservationImpactScorecard({ observations }: Props) {
  if (observations.length === 0) {
    return (
      <div
        className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Observation Impact</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-4">
          Hub activity 7 days before vs 7 days after each observation day
        </p>
        <p className="text-sm text-gray-400 text-center py-6">
          No completed observations with Hub data yet.
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Observation Impact</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Hub activity 7 days before vs 7 days after each observation day
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: '#EEF2FF', color: '#6366F1' }}
        >
          {observations.length} observation{observations.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {observations.map((obs) => (
          <div
            key={obs.observation_id}
            className="rounded-lg p-4"
            style={{ background: '#FAFAF8', border: '0.5px solid #E9E7E2' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                {obs.observation_title}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(obs.observation_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Hub engagement */}
              <div>
                <ChangeCell value={obs.engagement_change_pct} />
                <p className="text-xs text-gray-400 mt-0.5">Hub engagement</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {obs.active_users_before} → {obs.active_users_after} active users
                </p>
              </div>

              {/* Mood change */}
              <div>
                {obs.mood_change !== null ? (
                  <ChangeCell value={obs.mood_change} unit="" />
                ) : (
                  <span className="text-gray-300 text-lg font-bold">—</span>
                )}
                <p className="text-xs text-gray-400 mt-0.5">Mood score</p>
                {obs.mood_before !== null && obs.mood_after !== null && (
                  <p className="text-xs text-gray-300 mt-0.5">
                    {obs.mood_before} → {obs.mood_after}
                  </p>
                )}
              </div>

              {/* Quick wins */}
              <div>
                <ChangeCell
                  value={obs.quick_wins_after - obs.quick_wins_before}
                  unit=""
                />
                <p className="text-xs text-gray-400 mt-0.5">Quick wins</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {obs.quick_wins_before} → {obs.quick_wins_after}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
