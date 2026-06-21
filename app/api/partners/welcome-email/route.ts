import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/welcome-email
 *
 * Sends a branded TDI welcome email to a partnership contact.
 * Called when "Send Invite" is clicked on the admin leadership page.
 *
 * Body: { email, firstName, schoolName, dashboardUrl, inviteUrl }
 */
export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const { email, firstName, schoolName, dashboardUrl, inviteUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const name = firstName || 'there';
    const school = schoolName || 'your school';
    const loginUrl = inviteUrl || dashboardUrl || 'https://www.teachersdeserveit.com/partners/login';

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 14px;">${name},</p>

        <p style="margin:0 0 14px;">Welcome to your TDI partnership. We are excited to work with ${school} this year.</p>

        <p style="margin:0 0 14px;">Your Leadership Dashboard is live. This is where you will:</p>

        <ul style="margin:0 0 14px;padding-left:20px;">
          <li style="margin-bottom:6px;">Track your team's engagement with the Learning Hub</li>
          <li style="margin-bottom:6px;">Schedule observation days and sessions</li>
          <li style="margin-bottom:6px;">Generate reports for your board, staff, and community</li>
          <li style="margin-bottom:6px;">Print certificates to celebrate your team</li>
          <li style="margin-bottom:6px;">Set goals and see real-time progress</li>
        </ul>

        <p style="margin:0 0 14px;">Your first step is to log in and complete the setup checklist. It takes about 5 minutes.</p>

        <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;margin:16px 0;">Open Your Dashboard</a>

        <p style="margin:0 0 14px;">When you are ready, upload your staff roster so your team gets Learning Hub access. Once they are in, your dashboard starts showing real engagement data.</p>

        <p style="margin:0 0 14px;">We are here for you every step of the way. Reply to this email anytime.</p>

        <p style="margin:0 0 0;">The TDI Team</p>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          This email was sent by Teachers Deserve It as part of your partnership with ${school}.
        </p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
        to: [email.toLowerCase()],
        subject: `${name}, welcome to your TDI partnership`,
        html,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('[welcome-email] Send failed:', err);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[welcome-email] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
