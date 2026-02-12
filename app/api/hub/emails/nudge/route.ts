import { NextRequest, NextResponse } from 'next/server';
import { sendNudgeEmail, isEmailConfigured } from '@/lib/hub/email-sender';

/**
 * API endpoint for sending nudge emails to inactive users
 * POST /api/hub/emails/nudge
 * Body: { userId: string, email: string, displayName?: string, courseCount?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, displayName, courseCount } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          sent: false,
          message: 'Email provider not configured. Add RESEND_API_KEY to environment variables.',
        },
        { status: 200 }
      );
    }

    const success = await sendNudgeEmail(userId, email, displayName, courseCount);

    return NextResponse.json({
      success,
      sent: success,
      message: success
        ? 'Nudge email sent successfully'
        : 'Nudge email not sent (may already have been sent)',
    });
  } catch (error) {
    console.error('Error in nudge email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process nudge email request' },
      { status: 500 }
    );
  }
}
