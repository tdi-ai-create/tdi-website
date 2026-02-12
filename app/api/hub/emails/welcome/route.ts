import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, isEmailConfigured } from '@/lib/hub/email-sender';

/**
 * API endpoint for sending welcome emails
 * POST /api/hub/emails/welcome
 * Body: { userId: string, email: string, displayName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, displayName } = body;

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

    const success = await sendWelcomeEmail(userId, email, displayName);

    return NextResponse.json({
      success,
      sent: success,
      message: success
        ? 'Welcome email sent successfully'
        : 'Welcome email not sent (may already have been sent)',
    });
  } catch (error) {
    console.error('Error in welcome email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process welcome email request' },
      { status: 500 }
    );
  }
}
