import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { courseTitle, courseSlug, userEmail, userName } = await request.json();

    if (!courseTitle) {
      return NextResponse.json({ error: 'Course title required' }, { status: 400 });
    }

    // Send notification to team
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
          subject: `Course Interest: ${courseTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2 style="color: #1e2749;">Someone wants this course!</h2>
              <p><strong>${userName || 'An educator'}</strong> clicked "Notify me" on:</p>
              <div style="background: #F9FAFB; border-left: 4px solid #ffba06; padding: 16px; margin: 16px 0;">
                <strong style="color: #1e2749;">${courseTitle}</strong><br>
                <span style="color: #6B7280; font-size: 13px;">Slug: ${courseSlug || 'unknown'}</span>
              </div>
              ${userEmail ? `<p style="color: #6B7280; font-size: 13px;">User email: ${userEmail}</p>` : ''}
              <p style="color: #9CA3AF; font-size: 12px;">This means someone is actively waiting for this course to go live.</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notify course interest error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
