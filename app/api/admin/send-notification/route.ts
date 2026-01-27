import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const {
      creatorId,
      creatorName,
      creatorEmail,
      milestoneId,
      notificationType,
      title,
      message,
    } = await request.json();

    if (!creatorId || !notificationType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Save notification to database
    const { error: dbError } = await supabase.from('admin_notifications').insert({
      creator_id: creatorId,
      milestone_id: milestoneId || null,
      notification_type: notificationType,
      title,
      message: message || null,
    });

    if (dbError) {
      console.error('[send-notification] Failed to save notification:', dbError);
      // Continue anyway to try sending email
    }

    // 2. Send email notification
    const emailBody = `
Hi Team,

A new action is needed in the Creator Portal:

Creator: ${creatorName || 'Unknown'} (${creatorEmail || 'No email'})
Action: ${title}
${message ? `Details: ${message}` : ''}

Sign in to the Admin Portal to take action:
https://www.teachersdeserveit.com/admin/creators/${creatorId}

- TDI Creator Studio
    `.trim();

    // Using Resend (simple email API)
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
            subject: `[Action Needed] ${title}`,
            text: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('[send-notification] Email send failed:', errorData);
        } else {
          console.log('[send-notification] Email sent successfully');
        }
      } catch (emailError) {
        console.error('[send-notification] Email error:', emailError);
      }
    } else {
      // Fallback: log the email for now
      console.log('[send-notification] Email notification (no RESEND_API_KEY):');
      console.log('To: rachel@teachersdeserveit.com, rae@teachersdeserveit.com');
      console.log('Subject: [Action Needed]', title);
      console.log('Body:', emailBody);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-notification] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
