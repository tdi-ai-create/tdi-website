'use client';

import { useState } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
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
 * Shows original notes with any replies threaded beneath them.
 */
export function NotesPanel({
  notes,
  creatorId,
  creatorName,
  onNoteReply,
}: NotesPanelProps) {
  const [expandedNote, setExpandedNote] = useState<CreatorNote | null>(null);

  // Separate main notes and replies
  const mainNotes = notes.filter((n) => !n.is_reply);
  const replies = notes.filter((n) => n.is_reply);

  // Group replies by parent note ID
  const repliesByParent = replies.reduce<Record<string, CreatorNote[]>>((acc, reply) => {
    const parentId = reply.parent_note_id || '';
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(reply);
    return acc;
  }, {});

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
          {mainNotes.map((note) => {
            const noteReplies = repliesByParent[note.id] || [];
            return (
              <div key={note.id}>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#80a4ed]">
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
                {/* Show replies threaded under the parent note */}
                {noteReplies.map((reply) => (
                  <div key={reply.id} className="ml-6 mt-2 bg-emerald-50 rounded-lg p-3 border-l-4 border-emerald-400">
                    <div className="flex items-center gap-1 text-xs text-emerald-700 mb-1">
                      <Reply className="w-3 h-3" />
                      <span className="font-medium">Your reply</span>
                    </div>
                    <NotePreview
                      content={reply.content}
                      maxLines={2}
                      onReadMore={() => setExpandedNote(note)}
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
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
