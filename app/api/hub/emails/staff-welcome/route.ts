import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUB_URL = 'https://www.teachersdeserveit.com/hub';

// Role-based Quick Win recommendations
// Each role gets a specific starting point that matches their daily reality
const ROLE_RECOMMENDATIONS: Record<string, { title: string; slug: string; why: string }> = {
  para: {
    title: 'What Should I Be Doing Right Now? A Para Guide for Teacher Support',
    slug: 'what-should-i-be-doing-right-now-para-guide',
    why: 'It covers exactly what to do during every part of the lesson cycle',
  },
  teacher: {
    title: 'The First 10 Minutes Framework',
    slug: 'first-10-minutes-framework',
    why: 'It gives you a repeatable routine that sets the tone for every class period',
  },
  leader: {
    title: 'The Culture-First Leadership Framework',
    slug: 'culture-first-leadership-framework',
    why: 'It is a practical framework for putting school culture before programs',
  },
  coach: {
    title: 'PA Observation Guide',
    slug: 'pa-observation-guide',
    why: 'It gives you a structured approach to classroom walkthroughs',
  },
};

function getRecommendation(roleTitle: string | null | undefined): typeof ROLE_RECOMMENDATIONS['teacher'] {
  if (!roleTitle) return ROLE_RECOMMENDATIONS.teacher;

  const role = roleTitle.toLowerCase();
  if (role.includes('para') || role.includes('aide') || role.includes('assistant') || role.includes('ta ') || role === 'ta') {
    return ROLE_RECOMMENDATIONS.para;
  }
  if (role.includes('principal') || role.includes('admin') || role.includes('director') || role.includes('superintendent') || role.includes('dean')) {
    return ROLE_RECOMMENDATIONS.leader;
  }
  if (role.includes('coach') || role.includes('mentor') || role.includes('specialist') || role.includes('coordinator')) {
    return ROLE_RECOMMENDATIONS.coach;
  }
  return ROLE_RECOMMENDATIONS.teacher;
}

/**
 * POST /api/hub/emails/staff-welcome
 *
 * Sends a branded welcome email to a staff member when they are
 * provisioned to the Hub through a partnership roster upload.
 * Includes a personalized Quick Win recommendation based on their role.
 *
 * Body: { email, firstName, schoolName, roleTitle? }
 */
export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const { email, firstName, schoolName, roleTitle } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const name = firstName || 'there';
    const school = schoolName || 'your school';
    const hubLoginUrl = `${HUB_URL}/login`;
    const rec = getRecommendation(roleTitle);
    const recUrl = `${HUB_URL}/quick-wins/${rec.slug}`;

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

        <div style="background:#F8FAFC;border-radius:10px;padding:18px 20px;margin:20px 0;border-left:3px solid #2A9D8F;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Start Here</p>
          <p style="margin:0 0 6px;"><a href="${recUrl}" style="font-size:16px;font-weight:700;color:#1e2749;text-decoration:none;">${rec.title}</a></p>
          <p style="margin:0;font-size:14px;color:#64748B;">We picked this one for you because ${rec.why}. It takes less than 5 minutes.</p>
        </div>

        <a href="${hubLoginUrl}" style="display:inline-block;padding:14px 28px;background:#2A9D8F;color:white;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;margin:16px 0;">Open the Learning Hub</a>

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
