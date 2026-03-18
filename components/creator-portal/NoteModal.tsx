'use client';

import { useState } from 'react';
import { X, Loader2, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { RichTextDisplay } from './RichTextDisplay';
import type { CreatorNote } from '@/types/creator-portal';

interface NoteModalProps {
  note: CreatorNote;
  creatorId: string;
  creatorName: string;
  onClose: () => void;
  onReplySuccess?: () => void;
  showReplyButton?: boolean;
}

/**
 * Modal for displaying full note content with optional reply capability.
 * - Admin view: showReplyButton=false (view only)
 * - Creator view: showReplyButton=true (can reply)
 */
export function NoteModal({
  note,
  creatorId,
  creatorName,
  onClose,
  onReplySuccess,
  showReplyButton = false,
}: NoteModalProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/reply-to-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          creatorName,
          parentNoteId: note.id,
          originalNoteContent: note.content,
          replyContent: replyText.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowConfirmation(true);
        setShowReplyInput(false);
        setReplyText('');
        onReplySuccess?.();

        // Auto-close modal after showing confirmation
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setError(result.error || 'Failed to send reply. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !showReplyInput) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !showReplyInput) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
    >
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#80a4ed]" />
            <h3 id="note-modal-title" className="text-lg font-semibold text-[#1e2749]">
              Team Note
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note content */}
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#80a4ed] mb-4">
          <RichTextDisplay content={note.content} className="text-gray-700" />
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <span>{note.author}</span>
            <span>{new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Confirmation message */}
        {showConfirmation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-in fade-in duration-300">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Your reply has been sent!</p>
            <p className="text-green-600 text-sm mt-1">
              The TDI team will receive your message shortly.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Reply section (creator view only) */}
        {showReplyButton && !showConfirmation && (
          <>
            {!showReplyInput ? (
              <button
                onClick={() => setShowReplyInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#80a4ed] hover:text-[#80a4ed] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Reply to this note
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the TDI team..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent resize-none"
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyText('');
                      setError(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
