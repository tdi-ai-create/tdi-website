'use client'

import { useState } from 'react'
import { SessionCompleteModal } from './SessionCompleteModal'

interface ServiceTrackerProps {
  partnershipId: string
  label: string
  used: number
  total: number
  sessionType: 'observation' | 'virtual_session' | 'executive_session'
  color?: string
  userEmail: string
  onCompleted?: (result: { sessionRecord?: { love_notes_count?: number } }) => void
}

export function ServiceTracker({
  partnershipId,
  label,
  used,
  total,
  sessionType,
  color = '#8B5CF6',
  userEmail,
  onCompleted,
}: ServiceTrackerProps) {
  const [currentUsed, setCurrentUsed] = useState(used)
  const [showModal, setShowModal] = useState(false)

  // Hide entirely if nothing contracted
  if (total === 0) return null

  const pct = total > 0 ? (currentUsed / total) * 100 : 0
  const nextSessionNumber = currentUsed + 1

  function handleCompleted(result: { sessionRecord?: { love_notes_count?: number } }) {
    setCurrentUsed((prev) => prev + 1)
    onCompleted?.(result)
  }

  return (
    <>
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
            onClick={() => setShowModal(true)}
            className="w-full text-xs font-semibold py-1.5 rounded-lg transition-all text-white"
            style={{ background: color }}
          >
            + Mark{' '}
            {label.replace(' Days', ' Day').replace(' Sessions', ' Session')}{' '}
            {nextSessionNumber} Complete
          </button>
        )}
        {currentUsed >= total && (
          <div className="text-xs text-center font-semibold text-green-600">✓ All complete</div>
        )}
      </div>

      {showModal && (
        <SessionCompleteModal
          partnershipId={partnershipId}
          sessionType={sessionType}
          sessionNumber={nextSessionNumber}
          userEmail={userEmail}
          onComplete={handleCompleted}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
