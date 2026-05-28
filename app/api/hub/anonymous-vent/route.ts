import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Send via Resend
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TDI Learning Hub <notifications@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          subject: 'Anonymous Moment Mode Message',
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <p style="color: #6B7280; font-size: 13px;">An educator used Moment Mode and chose to share anonymously:</p>
              <div style="background: #F9FAFB; border-left: 4px solid #E8B84B; padding: 16px; margin: 16px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                ${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
              <p style="color: #9CA3AF; font-size: 12px;">This message was sent anonymously from Moment Mode. No identifying information is attached.</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Anonymous vent error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
