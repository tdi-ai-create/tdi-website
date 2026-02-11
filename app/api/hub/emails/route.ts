import { NextRequest, NextResponse } from 'next/server';
import { generateEmailHTML, getEmailSubject, type EmailType, type EmailData } from '@/lib/hub/emails';

/**
 * API endpoint for generating email HTML
 *
 * NOTE: This does NOT send emails yet. It only generates the HTML.
 * Email sending will be configured later with a provider like Resend or SendGrid.
 *
 * POST /api/hub/emails
 * Body: { type: 'welcome' | 'nudge' | 'digest', data: EmailData }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body as { type: EmailType; data: EmailData };

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    const validTypes = ['welcome', 'nudge', 'digest'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid email type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const html = generateEmailHTML(type, data);
    const subject = getEmailSubject(type);

    return NextResponse.json({
      success: true,
      type,
      subject,
      html,
      // Placeholder for when email sending is configured
      sent: false,
      message: 'Email generated but not sent. Email provider not yet configured.',
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
