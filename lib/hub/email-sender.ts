import { Resend } from 'resend';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  generateEmailHTML,
  getEmailSubject,
  type EmailType,
  type WelcomeEmailData,
  type NudgeEmailData,
  type DigestEmailData,
  type ReplyNotificationEmailData,
  type AccessGrantedEmailData,
} from './emails';

// Initialize Resend with API key (will be null if not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// From email address
const FROM_EMAIL = 'Teachers Deserve It <noreply@teachersdeserveit.com>';

// Atomic check-and-lock to prevent duplicate emails.
// Uses hub_email_sent_log with a unique constraint on (user_id, email_type).
// Falls back to hub_activity_log check if the table doesn't exist yet.
async function claimEmailSend(userId: string, emailType: EmailType): Promise<boolean> {
  const supabase = getSupabase();

  try {
    // Try atomic insert into dedup table -- unique constraint prevents duplicates
    const { error } = await supabase
      .from('hub_email_sent_log')
      .insert({ user_id: userId, email_type: emailType });

    if (error) {
      if (error.code === '23505') {
        // Unique violation = already sent
        return false;
      }
      if (error.code === '42P01') {
        // Table doesn't exist yet, fall back to activity log check
        return !(await wasEmailSentFallback(userId, emailType));
      }
      console.error('claimEmailSend error:', error);
      return false;
    }
    return true; // Successfully claimed -- safe to send
  } catch {
    // Fallback to activity log check
    return !(await wasEmailSentFallback(userId, emailType));
  }
}

// Fallback duplicate check using activity log (not atomic, but better than nothing)
async function wasEmailSentFallback(userId: string, emailType: EmailType): Promise<boolean> {
  const supabase = getSupabase();
  try {
    const { data } = await supabase
      .from('hub_activity_log')
      .select('id')
      .eq('user_id', userId)
      .eq('action', 'email_sent')
      .eq('metadata->>email_type', emailType)
      .limit(1);
    return (data?.length || 0) > 0;
  } catch {
    return false;
  }
}

// Record that an email was sent (activity log for audit trail)
async function recordEmailSent(userId: string, emailType: EmailType): Promise<void> {
  const supabase = getSupabase();

  try {
    await supabase.from('hub_activity_log').insert({
      user_id: userId,
      action: 'email_sent',
      metadata: {
        email_type: emailType,
        sent_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to record email sent:', error);
  }
}

// Generic send email function
async function sendEmail(
  toEmail: string,
  emailType: EmailType,
  data: WelcomeEmailData | NudgeEmailData | DigestEmailData | ReplyNotificationEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - RESEND_API_KEY missing');
    return { success: false, error: 'Email provider not configured' };
  }

  try {
    const html = generateEmailHTML(emailType, data);
    const subject = getEmailSubject(emailType);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Send welcome email to new user
export async function sendWelcomeEmail(
  userId: string,
  email: string,
  displayName?: string
): Promise<boolean> {
  // Atomic claim -- prevents race condition duplicates
  if (!(await claimEmailSend(userId, 'welcome'))) {
    return false; // Already sent or claimed by another request
  }

  const data: WelcomeEmailData = {
    displayName: displayName || 'there',
  };

  const result = await sendEmail(email, 'welcome', data);

  if (result.success) {
    await recordEmailSent(userId, 'welcome');
  }

  return result.success;
}

// Send nudge email to inactive user
export async function sendNudgeEmail(
  userId: string,
  email: string,
  displayName?: string,
  courseCount?: number
): Promise<boolean> {
  // Atomic claim -- prevents race condition duplicates
  if (!(await claimEmailSend(userId, 'nudge'))) {
    return false;
  }

  const data: NudgeEmailData = {
    displayName: displayName || 'there',
    courseCount: courseCount || 10,
    recommendedCourseTitle: 'Stress Management for Educators',
    recommendedCourseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://teachersdeserveit.com'}/hub/courses`,
  };

  const result = await sendEmail(email, 'nudge', data);

  if (result.success) {
    await recordEmailSent(userId, 'nudge');
  }

  return result.success;
}

// Send weekly/monthly digest email
export async function sendDigestEmail(
  userId: string,
  email: string,
  data: DigestEmailData
): Promise<boolean> {
  const result = await sendEmail(email, 'digest', data);

  if (result.success) {
    await recordEmailSent(userId, 'digest');
  }

  return result.success;
}

// Send reply notification email
export async function sendReplyNotificationEmail(
  userId: string,
  email: string,
  data: ReplyNotificationEmailData
): Promise<boolean> {
  // Check if user has community_replies enabled
  const supabase = getSupabase();
  try {
    const { data: prefs } = await supabase
      .from('hub_notification_preferences')
      .select('community_replies, email_frequency')
      .eq('user_id', userId)
      .single();

    // If user explicitly disabled community replies, or set essentials_only, skip
    if (prefs?.community_replies === false || prefs?.email_frequency === 'essentials_only') {
      return false;
    }
  } catch {
    // No prefs row = defaults = notifications on
  }

  const result = await sendEmail(email, 'reply_notification', data);
  if (result.success) {
    await recordEmailSent(userId, 'reply_notification');
  }
  return result.success;
}

// Send access granted email to comped user
export async function sendAccessGrantedEmail(
  userId: string,
  email: string,
  data: AccessGrantedEmailData
): Promise<boolean> {
  // No dedup for access_granted -- admin may re-grant with new expiry
  const result = await sendEmail(email, 'access_granted', data);

  if (result.success) {
    await recordEmailSent(userId, 'access_granted');
  }

  return result.success;
}

// Check if email provider is configured
export function isEmailConfigured(): boolean {
  return !!resend;
}
