import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/welcome-email
 *
 * Sends a branded TDI welcome email to a partnership contact.
 * Bold & action-oriented design with 3 numbered steps,
 * "What is new this year" feature showcase, and gold accents.
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
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <div style="background:#1e2749;padding:32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#E8B84B;">New for 2026-27</p>
          <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:white;">Your Partnership Dashboard is Live</p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);">${school}</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 20px;">${name},</p>

          <p style="margin:0 0 16px;">We have built a <strong>brand-new onboarding experience</strong> to make getting started with TDI as easy as possible for you and your team. Everything happens through your dashboard in three simple steps.</p>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
            <tr>
              <td style="width:44px;vertical-align:top;">
                <div style="width:36px;height:36px;border-radius:50%;background:#1e2749;color:white;font-size:16px;font-weight:700;text-align:center;line-height:36px;">1</div>
              </td>
              <td style="vertical-align:top;padding-left:12px;">
                <p style="margin:0 0 2px;font-size:15px;font-weight:700;">Log in and look around</p>
                <p style="margin:0;font-size:14px;color:#64748B;">Your dashboard is your command center. It takes 2 minutes to explore. A guided tour will walk you through everything on your first visit.</p>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
            <tr>
              <td style="width:44px;vertical-align:top;">
                <div style="width:36px;height:36px;border-radius:50%;background:#1e2749;color:white;font-size:16px;font-weight:700;text-align:center;line-height:36px;">2</div>
              </td>
              <td style="vertical-align:top;padding-left:12px;">
                <p style="margin:0 0 2px;font-size:15px;font-weight:700;">Add your team</p>
                <p style="margin:0;font-size:14px;color:#64748B;">Upload your staff roster (CSV or type names in) and choose who gets Learning Hub access and who gets complimentary blog access. Your educators get a welcome email the same day.</p>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
            <tr>
              <td style="width:44px;vertical-align:top;">
                <div style="width:36px;height:36px;border-radius:50%;background:#1e2749;color:white;font-size:16px;font-weight:700;text-align:center;line-height:36px;">3</div>
              </td>
              <td style="vertical-align:top;padding-left:12px;">
                <p style="margin:0 0 2px;font-size:15px;font-weight:700;">Watch your team grow</p>
                <p style="margin:0;font-size:14px;color:#64748B;">As your educators explore the Hub, your dashboard fills with real data: who is active, what tools they love, PD hours earned, and how your team is feeling. It all happens automatically.</p>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin:0 0 28px;">
            <a href="${loginUrl}" style="display:inline-block;padding:16px 44px;background:#E8B84B;color:#1e2749;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;">Get Started</a>
          </div>

          <div style="background:#F8FAFC;border-radius:10px;padding:20px;margin:0 0 24px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">What is new this year</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>145+ Quick Wins</strong> that your teachers can use before their next class</td></tr>
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>9 Practice Games</strong> for team meetings or solo play</td></tr>
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>PD Certificates</strong> from courses that earn verifiable professional development hours</td></tr>
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>Wellness Tools</strong> including our "I Need a Moment" reset tool and weekly check-ins</td></tr>
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>Full Spanish Translation</strong> across the entire Learning Hub</td></tr>
              <tr><td style="padding:5px 0;font-size:14px;color:#334155;"><span style="color:#E8B84B;font-weight:700;margin-right:6px;">&#9679;</span> <strong>Streamlined Dashboard</strong> with reports, celebrations, and goal tracking in one place</td></tr>
            </table>
          </div>

          <div style="border-left:3px solid #E8B84B;padding-left:16px;margin:0 0 24px;">
            <p style="margin:0;font-size:14px;color:#64748B;">This new onboarding process was designed to make getting started as simple as possible. Need help at any step? Reply to this email or <a href="mailto:rae@teachersdeserveit.com" style="color:#2A9D8F;font-weight:600;">email Rae directly</a>. We are here for you every step of the way.</p>
          </div>

          <p style="margin:0;">The TDI Team</p>
        </div>
        <div style="background:#1e2749;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Teachers Deserve It | teachersdeserveit.com</p>
        </div>
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
        subject: `${name}, your new TDI dashboard is ready`,
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
