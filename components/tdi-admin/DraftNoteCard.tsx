'use client';

import { useState } from 'react';
import {
  Loader2,
  PauseCircle,
  Clock,
  CalendarClock,
  NotebookPen,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// One of Anne Marie's draft check-in notes, awaiting review.
//
// Four things happen on this card beyond approve and reject:
//   - A paused creator is called out before anything is sent, because a draft
//     written while someone was active can sit here until after they pause.
//   - Approval and sending are separable. "Send Monday 9am" is a real answer.
//   - Rejections record why, so a wording problem and a business decision are
//     not the same signal when reviewing what the agent produces.
//   - Internal notes and a follow-up date attach to the creator, so context
//     written here outlives the draft.
// ---------------------------------------------------------------------------

export interface DraftNote {
  id: string;
  creator_id: string;
  creator_name?: string;
  course_title?: string;
  content?: string;
  draft_reason?: string;
  lifecycle_state?: string | null;
  creator_status?: string | null;
  paused_at?: string | null;
  pause_reason?: string | null;
  contact_blocked?: boolean;
  contact_blocked_reason?: string | null;
  scheduled_send_at?: string | null;
  internal_note?: {
    id: string;
    content: string;
    author: string;
    created_at: string;
    reminder_at: string | null;
    reminder_completed_at: string | null;
  } | null;
}

export type DraftNoteAction = 'approve' | 'approve_edited' | 'reject';

export interface DraftNoteActionPayload {
  content?: string;
  scheduled_send_at?: string;
  override_paused?: boolean;
  rejection_category?: string;
  rejection_reason?: string;
}

const REJECTION_OPTIONS = [
  { value: 'note_content', label: 'The note itself', hint: 'Wording, tone, or facts were wrong' },
  { value: 'system_decision', label: 'We decided not to send', hint: 'Note was fine, the outreach was not right' },
  { value: 'creator_state', label: 'Should not be contacted', hint: 'Paused, withdrawn, or on hold' },
  { value: 'already_handled', label: 'Already handled', hint: 'Someone reached out another way' },
  { value: 'other', label: 'Other', hint: '' },
];

/** datetime-local needs a local-time string, not an ISO UTC one. */
function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function nextWeekdayMorning() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  // Skip to Monday if tomorrow lands on a weekend.
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return toLocalInputValue(d);
}

export function DraftNoteCard({
  note,
  loading,
  onAction,
  onSaveInternalNote,
}: {
  note: DraftNote;
  loading: boolean;
  onAction: (note: DraftNote, action: DraftNoteAction, payload?: DraftNoteActionPayload) => Promise<void>;
  onSaveInternalNote: (note: DraftNote, content: string, reminderAt: string | null) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<'idle' | 'editing' | 'scheduling' | 'rejecting'>('idle');
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [scheduleAt, setScheduleAt] = useState(nextWeekdayMorning());
  const [rejectCategory, setRejectCategory] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [internalOpen, setInternalOpen] = useState(false);
  const [internalContent, setInternalContent] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [internalSaving, setInternalSaving] = useState(false);

  const blocked = !!note.contact_blocked;
  const existingInternal = note.internal_note;

  const reset = () => {
    setMode('idle');
    setRejectCategory('');
    setRejectReason('');
  };

  const send = async (override: boolean) => {
    await onAction(note, 'approve', override ? { override_paused: true } : undefined);
  };

  const saveInternal = async () => {
    if (!internalContent.trim()) return;
    setInternalSaving(true);
    const ok = await onSaveInternalNote(note, internalContent.trim(), reminderAt || null);
    setInternalSaving(false);
    if (ok) {
      setInternalContent('');
      setReminderAt('');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>
              {note.creator_name}
            </span>
            {note.course_title && <span className="text-xs text-gray-400">{note.course_title}</span>}
            {blocked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">
                <PauseCircle className="w-3 h-3" />
                {note.lifecycle_state === 'paused' ? 'Paused' : note.creator_status}
              </span>
            )}
          </div>

          {note.draft_reason && <p className="text-xs text-gray-500 mb-2">{note.draft_reason}</p>}

          {blocked && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-900 font-medium">
                {note.contact_blocked_reason}. Sending a check-in may be unwanted.
              </p>
              {note.pause_reason && (
                <p className="text-[11px] text-amber-700 mt-0.5">Reason on file: {note.pause_reason}</p>
              )}
            </div>
          )}

          {mode === 'editing' ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 mb-2"
              rows={4}
            />
          ) : (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-gray-700">
              <span className="font-medium text-blue-600">Anne Marie&apos;s draft: </span>
              {note.content}
            </div>
          )}

          {/* Schedule picker */}
          {mode === 'scheduling' && (
            <div className="mt-2 px-3 py-3 rounded-lg bg-gray-50 border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Approve now, send at
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  min={toLocalInputValue(new Date(Date.now() + 60_000))}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                />
                <button
                  onClick={async () => {
                    await onAction(note, 'approve', {
                      scheduled_send_at: new Date(scheduleAt).toISOString(),
                      ...(blocked ? { override_paused: true } : {}),
                    });
                    reset();
                  }}
                  disabled={loading || !scheduleAt}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: '#1e2749' }}
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Schedule'}
                </button>
                <button onClick={reset} className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 bg-gray-100">
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                The note stays hidden until then. If the creator pauses before it sends, it returns
                to this queue instead of going out.
              </p>
            </div>
          )}

          {/* Reject with a reason */}
          {mode === 'rejecting' && (
            <div className="mt-2 px-3 py-3 rounded-lg bg-red-50 border border-red-200">
              <label className="block text-xs font-medium text-red-900 mb-1.5">
                Why is this being rejected?
              </label>
              <div className="space-y-1 mb-2">
                {REJECTION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`reject-${note.id}`}
                      value={opt.value}
                      checked={rejectCategory === opt.value}
                      onChange={(e) => setRejectCategory(e.target.value)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-gray-800">
                      {opt.label}
                      {opt.hint && <span className="text-gray-500"> ({opt.hint})</span>}
                    </span>
                  </label>
                ))}
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Anything worth recording (optional)"
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-red-200 rounded-lg mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await onAction(note, 'reject', {
                      rejection_category: rejectCategory,
                      rejection_reason: rejectReason,
                    });
                    reset();
                  }}
                  disabled={loading || !rejectCategory}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reject'}
                </button>
                <button onClick={reset} className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Internal documentation, kept on the creator */}
          <div className="mt-2">
            <button
              onClick={() => setInternalOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700"
            >
              <NotebookPen className="w-3 h-3" />
              Internal notes
              {existingInternal && <span className="text-gray-400">(1 saved)</span>}
              {internalOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {internalOpen && (
              <div className="mt-1.5 px-3 py-3 rounded-lg bg-gray-50 border border-gray-200">
                {existingInternal && (
                  <div className="mb-2.5 pb-2.5 border-b border-gray-200">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{existingInternal.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {existingInternal.author} on{' '}
                      {new Date(existingInternal.created_at).toLocaleDateString()}
                      {existingInternal.reminder_at && !existingInternal.reminder_completed_at && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-amber-700 font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          Follow up {new Date(existingInternal.reminder_at).toLocaleDateString()}
                        </span>
                      )}
                      {existingInternal.reminder_completed_at && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-green-700 font-medium">
                          <Check className="w-2.5 h-2.5" />
                          Followed up
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <textarea
                  value={internalContent}
                  onChange={(e) => setInternalContent(e.target.value)}
                  placeholder="Only TDI sees this. Why the note is being held, what was decided, what to watch for."
                  rows={2}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg mb-2"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                    <CalendarClock className="w-3 h-3" />
                    Remind me on
                    <input
                      type="date"
                      value={reminderAt}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setReminderAt(e.target.value)}
                      className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                    />
                  </label>
                  <button
                    onClick={saveInternal}
                    disabled={internalSaving || !internalContent.trim()}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: '#1e2749' }}
                  >
                    {internalSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save note'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Saved to {note.creator_name}&apos;s record, so it stays after this draft is gone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {mode === 'editing' ? (
            <>
              <button
                onClick={async () => {
                  await onAction(note, 'approve_edited', {
                    content: editedContent,
                    ...(blocked ? { override_paused: true } : {}),
                  });
                  reset();
                }}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#16a34a' }}
              >
                {loading ? 'Saving...' : 'Save & Send'}
              </button>
              <button
                onClick={reset}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 bg-gray-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => send(blocked)}
                disabled={loading || mode !== 'idle'}
                title={blocked ? 'This creator is paused. Sending is deliberate.' : undefined}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: blocked ? '#B45309' : '#16a34a' }}
              >
                {loading ? 'Sending...' : blocked ? 'Send anyway' : 'Approve & Send'}
              </button>
              <button
                onClick={() => setMode('scheduling')}
                disabled={loading || mode !== 'idle'}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Schedule
              </button>
              <button
                onClick={() => {
                  setEditedContent(note.content || '');
                  setMode('editing');
                }}
                disabled={loading || mode !== 'idle'}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => setMode('rejecting')}
                disabled={loading || mode !== 'idle'}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
