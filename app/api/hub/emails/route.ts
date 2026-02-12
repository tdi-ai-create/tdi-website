import { NextRequest, NextResponse } from 'next/server';
import { generateEmailHTML, getEmailSubject, type EmailType, type EmailData } from '@/lib/hub/emails';
import { isEmailConfigured } from '@/lib/hub/email-sender';

/**
 * API endpoint for generating or previewing email HTML
 *
 * POST /api/hub/emails
 * Body: { type: 'welcome' | 'nudge' | 'digest', data: EmailData }
 *
 * For actual sending, use the specific endpoints:
 * - POST /api/hub/emails/welcome
 * - POST /api/hub/emails/nudge
 * - POST /api/hub/emails/digest
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
      emailConfigured: isEmailConfigured(),
      message: isEmailConfigured()
        ? 'Email preview generated. Use specific endpoint to send.'
        : 'Email preview generated. Resend not configured (add RESEND_API_KEY).',
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
