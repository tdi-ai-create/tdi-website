'use client'

import { useEffect } from 'react'
import { NoteComposer } from '../panel/NoteComposer'

interface Props {
  opportunityName: string
  onSave: (text: string, type: string) => Promise<void>
  onClose: () => void
}

export function QuickNoteModal({ opportunityName, onSave, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(text: string, type: string) {
    await onSave(text, type)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Add Note</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 truncate">{opportunityName}</p>
        <NoteComposer onSave={handleSave} autoFocus onCancel={onClose} />
      </div>
    </div>
  )
}
