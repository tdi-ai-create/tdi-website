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
}

export async function logCreatorEmail(entry: EmailLogEntry): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await supabase.from('creator_email_log').insert({
      creator_id: entry.creator_id || null,
      creator_name: entry.creator_name || null,
      creator_email: entry.creator_email || null,
      direction: entry.direction,
      category: entry.category,
      subject: entry.subject,
      step: entry.step ?? null,
      sent_by: entry.sent_by || 'system',
      metadata: entry.metadata || null,
    });
  } catch (e) {
    // Non-blocking — never fail the parent operation over logging
    console.error('[email-log] Failed to log email:', e);
  }
}
