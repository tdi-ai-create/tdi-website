'use client'
import { useState } from 'react'
import { updateDashboardField } from '@/lib/dashboard/updateDashboardField'

interface ServiceTrackerProps {
  partnershipId: string
  label:         string
  used:          number
  total:         number
  field:         string
  color?:        string
}

export function ServiceTracker({
  partnershipId, label, used, total, field, color = '#8B5CF6'
}: ServiceTrackerProps) {
  const [currentUsed, setCurrentUsed] = useState(used)
  const [saving, setSaving] = useState(false)

  const handleMarkComplete = async () => {
    if (currentUsed >= total) return
    setSaving(true)
    const newVal = currentUsed + 1
    const result = await updateDashboardField(partnershipId, field, newVal)
    setSaving(false)
    if (result.success) setCurrentUsed(newVal)
  }

  const pct = total > 0 ? (currentUsed / total) * 100 : 0

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {currentUsed}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {currentUsed < total && (
        <button
          onClick={handleMarkComplete}
          disabled={saving}
          className="w-full text-xs font-semibold py-1.5 rounded-lg transition-all text-white"
          style={{ background: saving ? '#C4B5FD' : color }}
        >
          {saving ? 'Saving...' : '+ Mark Complete'}
        </button>
      )}
      {currentUsed >= total && (
        <div className="text-xs text-center font-semibold text-green-600">
          ✓ All complete
        </div>
      )}
    </div>
  )
}
