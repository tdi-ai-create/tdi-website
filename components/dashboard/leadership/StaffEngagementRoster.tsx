'use client'

import { useEffect, useState } from 'react'

type EngagementStatus = 'active' | 'inactive' | 'dormant' | 'not_enrolled'

interface StaffRow {
  userId: string
  name: string
  email: string
  roleGroup: string | null
  status: EngagementStatus
  lastActivityAt: string | null
  daysSinceActivity: number | null
}

interface Summary {
  total: number
  active: number
  inactive: number
  dormant: number
  not_enrolled: number
}

interface RosterData {
  staff: StaffRow[]
  summary: Summary
}

const STATUS_CONFIG: Record<EngagementStatus, { label: string; className: string; order: number }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700', order: 0 },
  inactive: { label: 'Inactive', className: 'bg-yellow-100 text-yellow-700', order: 1 },
  dormant: { label: 'Dormant', className: 'bg-red-100 text-red-700', order: 2 },
  not_enrolled: { label: 'Not Enrolled', className: 'bg-gray-100 text-gray-500', order: 3 },
}

export default function StaffEngagementRoster({ partnershipId }: { partnershipId: string }) {
  const [data, setData] = useState<RosterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EngagementStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`/api/partnerships/${partnershipId}/staff-engagement`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load engagement data.')
        setLoading(false)
      })
  }, [partnershipId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Loading roster…
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

  const { staff, summary } = data

  const filtered = staff
    .filter((s) => filter === 'all' || s.status === filter)
    .filter((s) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.roleGroup || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 mb-4"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Staff Engagement Roster</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Active = logged in ≤7 days · Inactive = 8–30 days · Dormant = &gt;30 days
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(Object.entries(STATUS_CONFIG) as [EngagementStatus, typeof STATUS_CONFIG[EngagementStatus]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`text-center p-2 rounded-lg border transition-all ${
                filter === key ? 'ring-2 ring-offset-1 ring-blue-400' : ''
              } ${cfg.className.replace('text-', 'border-').replace('-100', '-200').split(' ')[0]}`}
              style={{ borderColor: 'transparent' }}
            >
              <div className={`text-lg font-bold ${cfg.className.split(' ')[1]}`}>
                {summary[key]}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{cfg.label}</div>
            </button>
          )
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search staff…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium hidden sm:table-cell">Role</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400 text-xs">
                  No staff match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.status]
                return (
                  <tr key={s.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-gray-900 leading-snug">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell text-gray-500 text-xs">
                      {s.roleGroup || '—'}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-xs text-gray-400">
                      {s.daysSinceActivity !== null
                        ? s.daysSinceActivity === 0
                          ? 'Today'
                          : `${s.daysSinceActivity}d ago`
                        : s.status === 'not_enrolled'
                        ? '—'
                        : 'Never'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Showing {filtered.length} of {summary.total} staff
        </p>
      )}
    </div>
  )
}
