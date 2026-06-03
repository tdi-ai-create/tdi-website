import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// POST -- send a test email via Resend
export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    const { to, subject, html, template } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing to or subject' }, { status: 400 });
    }

    // Template bodies
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: 'Welcome to the TDI Learning Hub!',
        html: `<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #1e2749; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">Welcome to the Hub</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">We built something for you. The TDI Learning Hub is a free space where you can find tools, resources, and a community of people who believe, like you do, that teachers deserve better.</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Your account is ready -- no credit card, no commitment. Just visit <a href="https://teachersdeserveit.com/hub" style="color: #E8B84B;">teachersdeserveit.com/hub</a> to get started.</p>
            <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">-- The TDI Team</p>
          </div>
        </div>`,
      },
      nudge: {
        subject: 'We miss you at the Learning Hub!',
        html: `<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #1e2749; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">Quick Check-In</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">It has been a little while since you logged in to the TDI Learning Hub. We have added new Quick Wins and tools since your last visit.</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Take 5 minutes to explore what is new: <a href="https://teachersdeserveit.com/hub" style="color: #E8B84B;">Open the Hub</a></p>
            <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">-- The TDI Team</p>
          </div>
        </div>`,
      },
      digest: {
        subject: 'Your Weekly TDI Update',
        html: `<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #1e2749; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">This Week on the Hub</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Here is what happened on the TDI Learning Hub this week. New tools were added, educators shared their stories, and the community grew.</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">See what is new: <a href="https://teachersdeserveit.com/hub" style="color: #E8B84B;">Open the Hub</a></p>
            <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">-- The TDI Team</p>
          </div>
        </div>`,
      },
    };

    const emailSubject = subject || templates[template]?.subject || 'TDI Learning Hub';
    const emailHtml = html || templates[template]?.html || '<p>Test email from TDI Admin</p>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Learning Hub <hello@teachersdeserveit.com>',
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[Hub Email] Resend error:', result);
      return NextResponse.json({ error: result.message || 'Send failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('[Hub Email]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
