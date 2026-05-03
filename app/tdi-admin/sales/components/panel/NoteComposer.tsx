'use client'

import { useState } from 'react'

const NOTE_TYPES = ['call', 'email', 'meeting', 'demo', 'update'] as const
type NoteType = typeof NOTE_TYPES[number]

interface Props {
  onSave: (text: string, type: string) => Promise<void>
  autoFocus?: boolean
  onCancel?: () => void
}

export function NoteComposer({ onSave, autoFocus, onCancel }: Props) {
  const [text, setText] = useState('')
  const [type, setType] = useState<NoteType>('update')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await onSave(text.trim(), type)
    setText('')
    setSaving(false)
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
        }}
        placeholder="Add a note... (Cmd+Enter to save)"
        rows={3}
        autoFocus={autoFocus}
        className="w-full text-sm text-gray-800 resize-none outline-none placeholder-gray-400"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap">
          {NOTE_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`text-xs px-2 py-0.5 rounded-full capitalize transition-colors ${
                type === t
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
