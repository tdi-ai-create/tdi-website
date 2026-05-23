import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// POST /api/creators/send-email
// Sends an email on behalf of Teachers Deserve It Team to a creator.
// Used by Creator Studio agents for welcome emails,
// follow-ups, and creator communications.
//
// Auth: Authorization: Bearer ${CRON_SECRET}
// Requires: RESEND_API_KEY env var
//
// Body: { to: string | string[], subject: string, body: string, replyTo?: string }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      {
        error:
          'Email service not configured. Add RESEND_API_KEY to environment variables.',
        setup: 'See https://resend.com — create an account, verify teachersdeserveit.com domain, get API key.',
      },
      { status: 503 }
    );
  }

  try {
    const { to, subject, body, replyTo } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: 'Teachers Deserve It Team <creatorstudio@teachersdeserveit.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      text: body,
      replyTo: replyTo ?? 'creatorstudio@teachersdeserveit.com',
    });

    if (error) {
      console.error('[creators/send-email] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[creators/send-email] Sent to', to, '| id:', data?.id);
    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('[creators/send-email] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
