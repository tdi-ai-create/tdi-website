'use client'

import { useState } from 'react'
import { Calendar, Clock, X, Sparkles } from 'lucide-react'

interface ProjectedDateCountdownProps {
  creatorId: string
  creatorEmail: string
  projectedCompletionDate: string | null
  projectedPublishDate: string | null
  onDateUpdated: (newDate: string, publishDate: string) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export default function ProjectedDateCountdown({
  creatorId,
  creatorEmail,
  projectedCompletionDate,
  projectedPublishDate,
  onDateUpdated,
}: ProjectedDateCountdownProps) {
  const [showModal, setShowModal] = useState(false)
  const [dateInput, setDateInput] = useState(projectedCompletionDate || '')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const days = projectedCompletionDate ? daysFromNow(projectedCompletionDate) : null
  const isOverdue = days !== null && days < 0
  const isToday = days === 0
  const hasDate = projectedCompletionDate !== null

  function openModal() {
    setDateInput(projectedCompletionDate || todayStr())
    setShowModal(true)
    setSuccessMsg('')
  }

  async function handleSave() {
    if (!dateInput) return
    setSaving(true)

    try {
      const res = await fetch('/api/creator-portal/set-projected-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          projectedDate: dateInput,
          email: creatorEmail,
        }),
      })
      const data = await res.json()

      if (data.success) {
        const n = data.adjustmentNumber || 1
        if (n === 1) {
          setSuccessMsg("Got it — your date is saved! Take the time you need, we've got you.")
        } else if (n <= 3) {
          setSuccessMsg("Got it — your new date is saved. Take the time you need, we've got you!")
        } else {
          setSuccessMsg("Updated! As always — no problem, no pressure. If you're feeling stuck or want to talk through anything, just reach out. We're a team.")
        }
        onDateUpdated(dateInput, data.publishDate)
        setTimeout(() => {
          setShowModal(false)
          setSuccessMsg('')
        }, 2500)
      }
    } catch {
      // silently handle
    }
    setSaving(false)
  }

  // Preview publish date from the input
  const previewPublish = dateInput ? addDays(dateInput, 30) : null

  return (
    <>
      {/* Main card */}
      <div className={`p-6 rounded-xl border ${
        !hasDate
          ? 'bg-white border-gray-200'
          : isOverdue
            ? 'bg-amber-50/50 border-amber-200/60'
            : isToday
              ? 'bg-gradient-to-r from-[#ffba06]/10 to-[#80a4ed]/10 border-[#ffba06]/30'
              : 'bg-white border-[#80a4ed]/20'
      }`}>
        {!hasDate ? (
          /* Empty state */
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#80a4ed]/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-[#80a4ed]" />
            </div>
            <p className="text-[#1e2749] font-medium mb-2">
              Set your projected completion date
            </p>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
              This is your best guess for when you&apos;ll be ready to hand things off. You can change it anytime, no questions asked!
            </p>
            <button
              onClick={openModal}
              className="px-5 py-2.5 bg-[#1e2749] text-white rounded-xl text-sm font-medium hover:bg-[#2a3459] transition-colors"
            >
              Set my date
            </button>
          </div>
        ) : (
          /* Date is set */
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isOverdue ? 'bg-amber-100' : isToday ? 'bg-[#ffba06]/20' : 'bg-[#80a4ed]/10'
              }`}>
                {isToday ? (
                  <Sparkles className="w-6 h-6 text-[#ffba06]" />
                ) : (
                  <Clock className={`w-6 h-6 ${isOverdue ? 'text-amber-600' : 'text-[#80a4ed]'}`} />
                )}
              </div>
              <div>
                {isToday ? (
                  <>
                    <p className="text-[#1e2749] font-semibold text-xl">Today&apos;s the day!</p>
                    <p className="text-gray-600 text-sm">Your projected completion date.</p>
                  </>
                ) : isOverdue ? (
                  <>
                    <p className="text-amber-800 font-medium">
                      Your projected date was <span className="font-semibold">{Math.abs(days!)} days ago</span>
                    </p>
                    <p className="text-amber-700 text-sm">
                      Life happens — no pressure. Update your date whenever you&apos;re ready.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#1e2749] font-semibold text-2xl">
                      {days} {days === 1 ? 'day' : 'days'}
                      <span className="text-base font-normal text-gray-500 ml-2">until your projected completion</span>
                    </p>
                    <div className="flex gap-6 mt-1 text-sm text-gray-500">
                      <span>Done by <strong className="text-[#1e2749]">{formatDate(projectedCompletionDate!)}</strong></span>
                      {projectedPublishDate && (
                        <span>Launch by <strong className="text-[#1e2749]">{formatDate(projectedPublishDate)}</strong></span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={openModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                isOverdue
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-white/50 text-[#1e2749] hover:bg-white border border-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {isOverdue ? 'Update date' : 'Edit date'}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">
                  {hasDate ? 'Update your projected date' : 'Set your projected date'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/70 text-sm mt-2">
                Life happens, and timelines shift — that&apos;s totally okay. Pick a date that feels right for you. We&apos;re here to support you, not pressure you.
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {successMsg ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-[#1e2749] font-medium">{successMsg}</p>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you think you&apos;ll have everything ready to hand off to us?
                  </label>
                  <input
                    type="date"
                    value={dateInput}
                    min={todayStr()}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#80a4ed]/50 focus:border-[#80a4ed]"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    We add 30 days on our end for production and launch prep, so your publish date is automatically calculated.
                  </p>

                  {/* Live preview */}
                  {previewPublish && dateInput && (
                    <div className="mt-4 p-3 bg-[#80a4ed]/5 rounded-lg border border-[#80a4ed]/10">
                      <p className="text-sm text-gray-600">
                        Your publish date will be: <strong className="text-[#1e2749]">{formatDate(previewPublish)}</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !dateInput}
                      className="flex-1 px-4 py-2.5 bg-[#1e2749] text-white rounded-xl text-sm font-medium hover:bg-[#2a3459] disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save date'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
