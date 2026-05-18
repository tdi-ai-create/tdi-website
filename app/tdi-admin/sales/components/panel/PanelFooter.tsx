'use client'

import { useState } from 'react'
import type { FullOpportunity } from '../OpportunityDetailPanel'

const LOST_REASONS = ['Not a fit', 'Budget', 'Timing', 'Competitor', 'No response', 'Other']

interface Props {
  opp: FullOpportunity
  onPatch: (changes: Partial<FullOpportunity>) => void
  onClose: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

export function PanelFooter({ opp, onPatch, onClose, showToast }: Props) {
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostReason, setLostReason] = useState('Not a fit')

  async function markWon() {
    await onPatch({ stage: 'paid' })
    showToast('Deal marked as Won', 'success')
    onClose()
  }

  async function markLost() {
    await onPatch({ stage: 'lost' })
    showToast('Deal marked as Lost', 'success')
    setShowLostModal(false)
    onClose()
  }

  if (opp.stage === 'lost') return null

  return (
    <>
      <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-3">
        {opp.stage !== 'paid' && (
          <button
            onClick={markWon}
            className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium transition-colors"
          >
            Mark as Won
          </button>
        )}
        <button
          onClick={() => setShowLostModal(true)}
          className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl font-medium border border-red-200 transition-colors"
        >
          Mark as Lost
        </button>
      </div>

      {showLostModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Mark as Lost</h3>
            <p className="text-sm text-gray-600 truncate">{opp.name}</p>
            <div>
              <label className="text-xs text-gray-500 font-medium">Reason</label>
              <select
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLostModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={markLost}
                className="flex-1 text-sm bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
              >
                Confirm Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
