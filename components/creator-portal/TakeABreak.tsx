'use client'

import { useState } from 'react'
import { X, Pause } from 'lucide-react'

interface TakeABreakButtonProps {
  creatorId: string
  creatorEmail: string
  onPaused: () => void
}

export function TakeABreakButton({ creatorId, creatorEmail, onPaused }: TakeABreakButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    try {
      const res = await fetch('/api/creator/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, email: creatorEmail, reason: reason.trim() || null }),
      })
      const data = await res.json()
      if (data.success) {
        onPaused()
      }
    } catch {
      // silently handle
    }
    setSaving(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Pause className="w-3.5 h-3.5" />
        Take a Break
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Need a break? We&apos;ve got you.</h2>
                <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-5 text-sm text-gray-700">
                <p className="flex gap-2"><span className="text-green-600">&#10003;</span> Your work stays saved exactly where it is</p>
                <p className="flex gap-2"><span className="text-green-600">&#10003;</span> Your affiliate link keeps earning passively</p>
                <p className="flex gap-2"><span className="text-green-600">&#10003;</span> No emails, no nudges, no pressure</p>
                <p className="flex gap-2"><span className="text-green-600">&#10003;</span> You can come back anytime</p>
              </div>
              <label className="block text-sm text-gray-600 mb-2">
                Want to share what made you take a break? (Totally optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Anything you want us to know..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#80a4ed]/50"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#1e2749] text-white rounded-xl text-sm font-medium hover:bg-[#2a3459] disabled:opacity-50"
                >
                  {saving ? 'Pausing...' : 'Confirm Pause'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
