'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface HighlightControlsProps {
  partnershipId: string
  sectionKey:    string
  sectionLabel:  string
  highlights:    any[]
  userEmail:     string
  onUpdate:      (highlights: any[]) => void
  onClose:       () => void
}

const SECTION_LABELS: Record<string, string> = {
  stat_cards:         'Stat Cards',
  momentum:           'Momentum Bar',
  timeline:           'Partnership Timeline',
  investment:         'Investment Numbers',
  love_notes:         'Love Notes',
  action_items:       'Action Items',
  leading_indicators: 'Leading Indicators',
  planning:           '2026-27 Planning',
  service_delivery:   'Service Delivery',
}

const CALLOUT_STYLE_OPTIONS = [
  { value: 'info',        label: 'Info (blue)',        preview: '#1E40AF' },
  { value: 'success',     label: 'Success (green)',    preview: '#166534' },
  { value: 'celebration', label: 'Celebration (orange)', preview: '#9A3412' },
  { value: 'action',      label: 'Action needed (red)', preview: '#9F1239' },
]

export function HighlightControls({
  partnershipId, sectionKey, sectionLabel, highlights, userEmail, onUpdate, onClose
}: HighlightControlsProps) {
  const existing = highlights.filter(h => h.section_key === sectionKey)
  const existingCallout  = existing.find(h => h.highlight_type === 'callout')
  const existingNewBadge = existing.find(h => h.highlight_type === 'new_badge')
  const existingPinned   = existing.find(h => h.highlight_type === 'pinned')

  const [calloutEnabled,  setCalloutEnabled]  = useState(!!existingCallout)
  const [calloutText,     setCalloutText]     = useState(existingCallout?.callout_text || '')
  const [calloutStyle,    setCalloutStyle]    = useState(existingCallout?.callout_style || 'info')
  const [newBadgeEnabled, setNewBadgeEnabled] = useState(!!existingNewBadge)
  const [pinnedEnabled,   setPinnedEnabled]   = useState(!!existingPinned)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)

    const headers = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    }

    // Helper to add or remove a highlight type
    async function toggle(type: string, enabled: boolean, extra: any = {}) {
      if (enabled) {
        await fetch(`/api/tdi-admin/leadership/${partnershipId}/highlights`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            section_key:    sectionKey,
            highlight_type: type,
            ...extra,
          }),
        })
      } else {
        await fetch(`/api/tdi-admin/leadership/${partnershipId}/highlights`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ section_key: sectionKey, highlight_type: type }),
        })
      }
    }

    await toggle('callout', calloutEnabled && !!calloutText, {
      callout_text:  calloutText,
      callout_style: calloutStyle,
    })
    await toggle('new_badge', newBadgeEnabled)
    await toggle('pinned', pinnedEnabled)

    // Refresh highlights
    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/highlights`, {
      headers: { 'x-user-email': userEmail },
    })
    const data = await res.json()
    onUpdate(data.highlights || [])

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Highlight Section</h2>
              <p className="text-xs text-gray-400 mt-0.5">{sectionLabel || SECTION_LABELS[sectionKey] || sectionKey}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Pinned */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">* Feature this section</p>
              <p className="text-xs text-gray-400">Adds a violet glow border to draw attention</p>
            </div>
            <button
              onClick={() => setPinnedEnabled(!pinnedEnabled)}
              className="w-10 h-6 rounded-full transition-all flex items-center px-1"
              style={{ background: pinnedEnabled ? '#8B5CF6' : '#E5E7EB' }}
            >
              <div className="w-4 h-4 rounded-full bg-white transition-all"
                style={{ transform: pinnedEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
            </button>
          </div>

          {/* New badge */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">NEW badge</p>
              <p className="text-xs text-gray-400">Shows a "NEW" pill so principals notice updates</p>
            </div>
            <button
              onClick={() => setNewBadgeEnabled(!newBadgeEnabled)}
              className="w-10 h-6 rounded-full transition-all flex items-center px-1"
              style={{ background: newBadgeEnabled ? '#8B5CF6' : '#E5E7EB' }}
            >
              <div className="w-4 h-4 rounded-full bg-white transition-all"
                style={{ transform: newBadgeEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
            </button>
          </div>

          {/* Callout banner */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Callout message</p>
                <p className="text-xs text-gray-400">A banner shown above this section</p>
              </div>
              <button
                onClick={() => setCalloutEnabled(!calloutEnabled)}
                className="w-10 h-6 rounded-full transition-all flex items-center px-1"
                style={{ background: calloutEnabled ? '#8B5CF6' : '#E5E7EB' }}
              >
                <div className="w-4 h-4 rounded-full bg-white transition-all"
                  style={{ transform: calloutEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
              </button>
            </div>

            {calloutEnabled && (
              <div className="space-y-3">
                <textarea
                  value={calloutText}
                  onChange={e => setCalloutText(e.target.value)}
                  placeholder="e.g. Great news! Observation Day 2 is confirmed for March 19."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  rows={2}
                />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Style:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CALLOUT_STYLE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setCalloutStyle(opt.value)}
                        className="text-xs px-2 py-1.5 rounded-lg border-2 font-medium transition-all text-left"
                        style={{
                          borderColor: calloutStyle === opt.value ? opt.preview : '#E5E7EB',
                          color: calloutStyle === opt.value ? opt.preview : '#6B7280',
                          background: calloutStyle === opt.value ? `${opt.preview}10` : 'white',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: saving ? '#C4B5FD' : '#8B5CF6' }}
          >
            {saving ? 'Saving...' : 'Save Highlights'}
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
