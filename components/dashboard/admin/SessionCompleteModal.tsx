'use client'

import { useState } from 'react'

interface Quote {
  quote_text: string
  teacher_role: string
}

interface SessionCompleteModalProps {
  partnershipId: string
  sessionType: 'observation' | 'virtual_session' | 'executive_session'
  sessionNumber: number
  userEmail: string
  onComplete: (result: { sessionRecord?: { love_notes_count?: number } }) => void
  onClose: () => void
}

const SESSION_LABELS = {
  observation: 'Observation Day',
  virtual_session: 'Virtual Session',
  executive_session: 'Executive Session',
}

export function SessionCompleteModal({
  partnershipId,
  sessionType,
  sessionNumber,
  userEmail,
  onComplete,
  onClose,
}: SessionCompleteModalProps) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [loveNotes, setLoveNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [quotes, setQuotes] = useState<Quote[]>([{ quote_text: '', teacher_role: '' }])
  const [saving, setSaving] = useState(false)

  const label = SESSION_LABELS[sessionType]

  function addQuote() {
    setQuotes((q) => [...q, { quote_text: '', teacher_role: '' }])
  }

  function updateQuote(index: number, field: keyof Quote, value: string) {
    setQuotes((q) => q.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeQuote(index: number) {
    setQuotes((q) => q.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!sessionDate) return
    setSaving(true)

    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/complete-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify({
        sessionType,
        sessionNumber,
        sessionDate,
        loveNotesCount: parseInt(loveNotes) || 0,
        internalNotes: internalNotes || null,
        quotes: quotes.filter((q) => q.quote_text.trim()),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (data.success) {
      onComplete(data)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Mark {label} {sessionNumber} Complete
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                This will update the timeline and dashboard automatically
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Love Notes - only for observation days */}
          {sessionType === 'observation' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Love Notes Delivered
              </label>
              <input
                type="number"
                value={loveNotes}
                onChange={(e) => setLoveNotes(e.target.value)}
                placeholder="How many Love Notes were delivered?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be added to the total Love Notes count on the dashboard
              </p>
            </div>
          )}

          {/* Teacher Quotes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Teacher Quotes
              </label>
              <span className="text-xs text-gray-400">Visible to principal on dashboard</span>
            </div>
            <div className="space-y-3">
              {quotes.map((quote, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <textarea
                    value={quote.quote_text}
                    onChange={(e) => updateQuote(i, 'quote_text', e.target.value)}
                    placeholder="What did a teacher say about their experience?"
                    className="w-full bg-transparent text-sm text-gray-700 resize-none focus:outline-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <input
                      type="text"
                      value={quote.teacher_role}
                      onChange={(e) => updateQuote(i, 'teacher_role', e.target.value)}
                      placeholder="Role (e.g. 3rd Grade Teacher)"
                      className="text-xs text-gray-500 bg-transparent focus:outline-none border-b border-gray-200 pb-0.5 w-48"
                    />
                    {quotes.length > 1 && (
                      <button
                        onClick={() => removeQuote(i)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addQuote}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                + Add another quote
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Internal Notes
              </label>
              <span className="text-xs text-gray-400">Admin only - not visible to principal</span>
            </div>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notes for the TDI team - classroom observations, areas of growth, follow-up items..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !sessionDate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: saving ? '#C4B5FD' : '#8B5CF6' }}
          >
            {saving ? 'Saving...' : `Mark ${label} ${sessionNumber} Complete`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
