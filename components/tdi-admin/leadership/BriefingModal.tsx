'use client'

import { X } from 'lucide-react'

interface BriefingModalProps {
  data: any
  schoolName: string
  onClose: () => void
}

export default function BriefingModal({ data, schoolName, onClose }: BriefingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{data.briefing?.orgName || schoolName}</h2>
            <p className="text-xs text-gray-500">{data.briefing?.location} | {data.briefing?.phase} | Day {data.briefing?.daysSinceStart || '?'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Hub Engagement', value: `${data.briefing?.loginPct || 0}%` },
              { label: 'Staff', value: data.briefing?.totalStaff || 0 },
              { label: 'Observations', value: `${data.briefing?.observationsUsed || 0}/${data.briefing?.observationsTotal || 0}` },
              { label: 'Virtual', value: `${data.briefing?.virtualSessionsUsed || 0}/${data.briefing?.virtualSessionsTotal || 0}` },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-[10px] text-gray-500 font-medium uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* KPI Progress */}
          {data.kpis?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">KPI Progress</h3>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 font-semibold text-gray-600">KPI</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Current</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Target</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.kpis.map((k: any, i: number) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-3 py-2 text-gray-700">{k.label}</td>
                        <td className="px-3 py-2 font-bold text-gray-900">{k.current}</td>
                        <td className="px-3 py-2 text-gray-500">{k.target}</td>
                        <td className="px-3 py-2 font-bold" style={{ color: k.status === 'at_risk' ? '#EF4444' : k.pct >= 70 ? '#22c55e' : '#EAB308' }}>{k.pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Talking Points */}
          {data.talkingPoints?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Talking Points</h3>
              <ul className="space-y-2">
                {data.talkingPoints.map((t: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B84B', marginTop: 6, flexShrink: 0 }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Open Items */}
          {data.pendingItems?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Open Items</h3>
              <ul className="space-y-1">
                {data.pendingItems.map((t: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Notes */}
          {data.recentNotes?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Notes</h3>
              <div className="space-y-2">
                {data.recentNotes.map((n: { type: string; content: string }, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{n.type}</span>
                    <p className="text-sm text-gray-700 mt-1">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
