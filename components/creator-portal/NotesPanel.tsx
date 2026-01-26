'use client';

import { MessageSquare } from 'lucide-react';
import type { CreatorNote } from '@/types/creator-portal';

interface NotesPanelProps {
  notes: CreatorNote[];
}

export function NotesPanel({ notes }: NotesPanelProps) {
  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#80a4ed]" />
          <h3 className="font-semibold text-[#1e2749]">Team Notes</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          No notes from the team yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#80a4ed]" />
        <h3 className="font-semibold text-[#1e2749]">Team Notes</h3>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#80a4ed]"
          >
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{note.created_by}</span>
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
