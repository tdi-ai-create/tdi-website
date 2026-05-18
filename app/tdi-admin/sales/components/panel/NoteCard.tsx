'use client'

import { useState } from 'react'
import type { OppNote } from '../OpportunityDetailPanel'

const TYPE_LABELS: Record<string, string> = {
  call: 'Call', email: 'Email', meeting: 'Meeting',
  demo: 'Demo', update: 'Update', system: 'System',
}

interface Props {
  note: OppNote
  onDelete?: () => void
}

export function NoteCard({ note, onDelete }: Props) {
  const [showAll, setShowAll] = useState(false)
  const isLong = note.note_text.length > 500
  const display = isLong && !showAll ? note.note_text.slice(0, 500) + '...' : note.note_text

  return (
    <div className="border border-gray-100 rounded-xl p-3 bg-white space-y-1.5 group">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span className="font-medium text-gray-700">
            {note.author_email.split('@')[0]}
          </span>
          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
            {TYPE_LABELS[note.note_type] ?? note.note_type}
          </span>
          <span>
            {new Date(note.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: '2-digit',
            })}
          </span>
        </div>
        {onDelete && note.id !== 'legacy' && (
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{display}</p>
      {isLong && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-indigo-500 hover:underline"
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
