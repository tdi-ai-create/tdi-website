// ---------------------------------------------------------------------------
// Shared side effects for publishing a creator note.
//
// A note becoming visible to a creator has to do two things beyond flipping
// the flag: tell the creator it exists, and bump the creator record so an
// in-flight re-engagement sequence does not nudge someone we just replied to.
//
// Three paths publish notes (manual add-note, the admin approval queue, and
// Paperclip's approve_draft). They drifted apart and the approval queue ended
// up doing neither. This is the one implementation all three share.
// ---------------------------------------------------------------------------

import type { SupabaseClient } from '@supabase/supabase-js';
import { creatorEmailTemplate } from './creator-email-template';

const NOTE_CC = ['creatorstudio@teachersdeserveit.com', 'bella@teachersdeserveit.com'];

export interface NoteNotifyResult {
  /** True only when Resend accepted the message. */
  sent: boolean;
  /** Present when sent is false, so callers can surface why. */
  reason?: string;
}

/**
 * Notify a creator that a note is waiting, and refresh their activity stamp.
 *
 * The updated_at bump runs even when the email fails, because the note is
 * already visible at that point and a re-engagement email would contradict it.
 *
 * @param source Caller label used in logs, e.g. 'creator-notes-approve'.
 * @param actor  Who published it, for the log line. Optional.
 */
export async function notifyCreatorOfNote(
  supabase: SupabaseClient,
  creatorId: string,
  { source, actor }: { source: string; actor?: string }
): Promise<NoteNotifyResult> {
  const { data: creator } = await supabase
    .from('creators')
    .select('id, name, email')
    .eq('id', creatorId)
    .single();

  await supabase
    .from('creators')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', creatorId);

  if (!creator) {
    console.error(`[${source}] Creator ${creatorId} not found, no email sent`);
    return { sent: false, reason: 'Creator not found' };
  }

  if (!creator.email) {
    console.error(`[${source}] Creator ${creatorId} has no email on file`);
    return { sent: false, reason: 'Creator has no email address' };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error(`[${source}] RESEND_API_KEY missing, creator was not notified`);
    return { sent: false, reason: 'Email is not configured on this environment' };
  }

  const firstName = (creator.name || '').trim().split(' ')[0] || 'there';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: [creator.email],
        cc: NOTE_CC,
        subject: 'Creator Studio | New note from your team',
        html: creatorEmailTemplate({
          firstName,
          tagline: 'A new note is waiting for you',
          body: `
            <p style="margin: 0 0 14px;">Hi ${firstName},</p>
            <p style="margin: 0 0 14px;">
              Your team just added a note to your Creator Studio profile. Log in to read it
              and pick up right where you left off.
            </p>
          `,
          ctaLabel: 'View My Creator Studio',
        }),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[${source}] Resend rejected the note email:`, detail);
      return { sent: false, reason: `Email provider returned ${response.status}` };
    }

    console.log(
      `[${source}] Note email sent to ${creator.email}${actor ? ` (published by ${actor})` : ''}`
    );
    return { sent: true };
  } catch (err) {
    console.error(`[${source}] Note email failed:`, err);
    return {
      sent: false,
      reason: err instanceof Error ? err.message : 'Unknown email error',
    };
  }
}
