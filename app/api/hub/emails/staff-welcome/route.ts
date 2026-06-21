import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/hub/emails/staff-welcome
 *
 * Sends a branded welcome email to a staff member when they are
 * provisioned to the Hub through a partnership roster upload.
 *
 * Body: { email, firstName, schoolName }
 */
export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const { email, firstName, schoolName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const name = firstName || 'there';
    const school = schoolName || 'your school';
    const hubUrl = 'https://www.teachersdeserveit.com/hub/login';

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 14px;">${name},</p>

        <p style="margin:0 0 14px;">Your school has partnered with Teachers Deserve It, and you now have access to the TDI Learning Hub.</p>

        <p style="margin:0 0 14px;">This is not another thing on your plate. It is a collection of tools designed to make your day easier:</p>

        <ul style="margin:0 0 14px;padding-left:20px;">
          <li style="margin-bottom:6px;">Quick Wins that take 5 minutes and work the next class period</li>
          <li style="margin-bottom:6px;">Courses that count toward your PD hours</li>
          <li style="margin-bottom:6px;">Stress management tools for the hard days</li>
          <li style="margin-bottom:6px;">Classroom strategies built by real teachers</li>
        </ul>

        <p style="margin:0 0 14px;">Start with a Quick Win. Pick one that sounds interesting. Try it tomorrow. That is it.</p>

        <a href="${hubUrl}" style="display:inline-block;padding:14px 28px;background:#2A9D8F;color:white;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;margin:16px 0;">Open the Learning Hub</a>

        <p style="margin:0 0 14px;">You can log in with this email address using Google or a magic link. No password to remember.</p>

        <p style="margin:0 0 0;">The TDI Team</p>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          This email was sent by Teachers Deserve It. Your school, ${school}, has partnered with TDI to provide you with professional development support.
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
        subject: `${name}, you have access to the TDI Learning Hub`,
        html,
      }),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
