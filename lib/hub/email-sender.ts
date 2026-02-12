import { Resend } from 'resend';
import { getSupabase } from '@/lib/supabase';
import {
  generateEmailHTML,
  getEmailSubject,
  type EmailType,
  type WelcomeEmailData,
  type NudgeEmailData,
  type DigestEmailData,
} from './emails';

// Initialize Resend with API key (will be null if not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// From email address
const FROM_EMAIL = 'Teachers Deserve It <noreply@teachersdeserveit.com>';

// Check if email was already sent to prevent duplicates
async function wasEmailSent(userId: string, emailType: EmailType): Promise<boolean> {
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

// Record that an email was sent
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
  data: WelcomeEmailData | NudgeEmailData | DigestEmailData
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
  // Check if already sent
  if (await wasEmailSent(userId, 'welcome')) {
    return false; // Already sent, skip
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
  // Check if already sent (only send one nudge per user)
  if (await wasEmailSent(userId, 'nudge')) {
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

// Check if email provider is configured
export function isEmailConfigured(): boolean {
  return !!resend;
}
