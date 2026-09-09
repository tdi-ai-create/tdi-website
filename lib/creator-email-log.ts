import { createClient } from '@supabase/supabase-js';

// Centralized email logging for the Creator Studio.
// Every email sent to or about a creator gets logged here,
// powering Bella's dashboard feed and weekly digest.

export interface EmailLogEntry {
  creator_id?: string;
  creator_name?: string;
  creator_email?: string;
  direction: 'to_creator' | 'to_admin';
  category: string;
  subject: string;
  step?: number;
  sent_by?: string;
  metadata?: Record<string, unknown>;
  /**
   * True when the send was suppressed by a config flag and only recorded.
   * Nothing reached the creator. Powers the "would have sent" queue in the
   * admin Re-engagement tab.
   */
  dry_run?: boolean;
  /**
   * The message id Resend returned at send time, from the send response body.
   *
   * This is the only thing that can ever tie a delivery event back to this row,
   * so a send site that does not pass it produces a log entry whose fate can
   * never be known. Resend accepting a message means "we took it", not "they
   * got it": /api/webhooks/resend fills in what happened next.
   */
  provider_id?: string | null;
}

/**
 * Pulls the message id out of a Resend send response.
 *
 * Every creator send site checks res.ok and then throws the body away, which is
 * why the id has never been recorded anywhere. Reading it must never be able to
 * break a send that already succeeded, so this swallows everything and returns
 * null: a missing id costs us delivery tracking on one message, while a throw
 * here would cost the creator the email itself.
 */
export async function resendMessageId(res: Response): Promise<string | null> {
  try {
    const body = await res.clone().json();
    const id = body?.id ?? body?.data?.id ?? null;
    return typeof id === 'string' ? id : null;
  } catch {
    return null;
  }
}

export async function logCreatorEmail(entry: EmailLogEntry): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabase.from('creator_email_log').insert({
      creator_id: entry.creator_id || null,
      creator_name: entry.creator_name || null,
      creator_email: entry.creator_email || null,
      direction: entry.direction,
      category: entry.category,
      subject: entry.subject,
      step: entry.step ?? null,
      sent_by: entry.sent_by || 'system',
      metadata: entry.metadata || null,
      dry_run: entry.dry_run ?? false,
      provider_id: entry.provider_id || null,
    });

    // Still non-blocking: a logging failure must not cost the creator their
    // email. But it must not be invisible either. An unknown column here makes
    // PostgREST reject the whole statement, so a single bad field would erase
    // the record of every creator email we send and read as a quiet week.
    if (error) {
      console.error(
        `[email-log] Could not record "${entry.subject}" to ${entry.creator_email}: ${error.message}`
      );
    }
  } catch (e) {
    // Non-blocking — never fail the parent operation over logging
    console.error('[email-log] Failed to log email:', e);
  }
}
