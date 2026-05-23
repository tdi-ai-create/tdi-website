'use client'

import { NoteComposer } from './NoteComposer'
import { NoteCard } from './NoteCard'
import type { OppNote } from '../OpportunityDetailPanel'

interface Props {
  notes: OppNote[]
  onAddNote: (text: string, type: string) => Promise<void>
  onDeleteNote: (noteId: string) => void
}

export function NotesTab({ notes, onAddNote, onDeleteNote }: Props) {
  return (
    <div className="p-4 space-y-4">
      <NoteComposer onSave={onAddNote} />
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No notes yet</p>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={note.id === 'legacy' ? undefined : () => onDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
