'use client'

import { useState } from 'react'

const LOST_REASONS = ['Not a fit', 'Budget', 'Timing', 'Competitor', 'No response', 'Other']

interface Props {
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function LostReasonModal({ onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('Not a fit')

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Mark as Lost</h3>
        <div>
          <label className="text-xs text-gray-500 font-medium">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 text-sm bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
