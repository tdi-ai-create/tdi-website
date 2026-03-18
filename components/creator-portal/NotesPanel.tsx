'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { NotePreview } from './NotePreview';
import { NoteModal } from './NoteModal';
import type { CreatorNote } from '@/types/creator-portal';

interface NotesPanelProps {
  notes: CreatorNote[];
  creatorId: string;
  creatorName: string;
  onNoteReply?: () => void;
}

/**
 * Displays team notes to creators with expandable modals and reply capability.
 */
export function NotesPanel({
  notes,
  creatorId,
  creatorName,
  onNoteReply,
}: NotesPanelProps) {
  const [expandedNote, setExpandedNote] = useState<CreatorNote | null>(null);

  // Filter out replies for main view - show only original team notes
  // Replies are saved but not displayed in the creator view
  const mainNotes = notes.filter((n) => !n.is_reply);

  if (mainNotes.length === 0) {
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
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#80a4ed]" />
          <h3 className="font-semibold text-[#1e2749]">Team Notes</h3>
        </div>

        <div className="space-y-4">
          {mainNotes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#80a4ed]"
            >
              <NotePreview
                content={note.content}
                maxLines={3}
                onReadMore={() => setExpandedNote(note)}
              />
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{note.author}</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded note modal with reply capability */}
      {expandedNote && (
        <NoteModal
          note={expandedNote}
          creatorId={creatorId}
          creatorName={creatorName}
          onClose={() => setExpandedNote(null)}
          onReplySuccess={onNoteReply}
          showReplyButton={true}
        />
      )}
    </>
  );
}
