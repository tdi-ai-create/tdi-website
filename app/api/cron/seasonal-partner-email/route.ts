import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/seasonal-partner-email
 *
 * Runs on the 15th of each month. Sends a seasonal email to each
 * active partnership contact with content relevant to what schools
 * are experiencing that month.
 *
 * Voice: TDI Team. Short, warm, direct. No em dashes. No emojis.
 * From: Teachers Deserve It Team <hello@teachersdeserveit.com>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const month = new Date().getMonth(); // 0-indexed: 0=Jan, 6=Jul

    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, contact_email, contract_phase, staff_enrolled, slug, org_name, observation_days_total, executive_sessions_total, virtual_sessions_total')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active partnerships.' });
    }

    let sent = 0;

    for (const p of partnerships) {
      if (!p.contact_email) continue;

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';
      const schoolName = p.org_name || p.contact_name || 'Your School';
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${p.slug}`;
      const hubUrl = 'https://www.teachersdeserveit.com/hub';

      const email = getSeasonalEmail(month, firstName, schoolName, dashboardUrl, hubUrl, p);

      if (!email) continue; // No email for this month (Jun)

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: [p.contact_email.toLowerCase()],
          subject: email.subject,
          html: wrapEmail(email.body, schoolName, dashboardUrl),
        }),
      });

      if (emailResponse.ok) {
        sent++;
        await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'seasonal_email_sent',
          details: { month: month + 1, subject: email.subject },
        });
      }
    }

    return NextResponse.json({ success: true, sent, total: partnerships?.length || 0, month: month + 1 });
  } catch (error) {
    console.error('[seasonal-partner-email] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

interface Partnership {
  staff_enrolled: number;
  observation_days_total: number;
  executive_sessions_total: number;
  virtual_sessions_total: number;
}

function getSeasonalEmail(
  month: number,
  firstName: string,
  schoolName: string,
  dashboardUrl: string,
  hubUrl: string,
  partnership: Partnership
): { subject: string; body: string } | null {
  const staff = partnership.staff_enrolled || 0;
  const hasObservations = (partnership.observation_days_total || 0) > 0;

  switch (month) {
    case 6: // July
      return {
        subject: `${firstName}, your TDI dashboard is live`,
        body: `${firstName},

Your partnership dashboard is ready. This is where you will track your team's growth, schedule sessions, generate reports, and see what your educators are doing on the Learning Hub.

Take two minutes to look around. Start with the setup checklist at the top of the Overview tab. It walks you through everything.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Open Your Dashboard</a>

If anything looks off or you have questions, just reply to this email. We are here.

The TDI Team`
      };

    case 7: // August
      return {
        subject: `${firstName}, time to get your team set up`,
        body: `${firstName},

School is almost here. Now is the perfect time to make sure your ${staff} educators have Learning Hub access before the first day.

Here is what to do:
1. Upload your staff roster if you have not already (Team tab on your dashboard)
2. Share a quick note with your staff letting them know they have access
3. Start your first staff meeting with a 5-minute Quick Win from the Hub

We have a copy-paste email template ready for you in the Newsletter section of your Reports tab.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Open Your Dashboard</a>

The TDI Team`
      };

    case 8: // September
      return {
        subject: `${firstName}, your team is starting to explore`,
        body: `${firstName},

The first few weeks of school are behind you. Your dashboard is starting to show real data as your team explores the Learning Hub.

Check the Overview tab to see:
- How many of your staff have logged in
- What tools they are exploring
- Your partnership momentum score

The most popular tool across all TDI schools right now is in the Quick Wins section. It takes 5 minutes. Try sharing it at your next staff meeting.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">See Your Team's Progress</a>

The TDI Team`
      };

    case 9: // October
      return {
        subject: `${firstName}, tools for the tough months`,
        body: `${firstName},

October is when the honeymoon ends. Behavior challenges spike, routines get tested, and your team starts feeling the weight of the year.

This is exactly what the Hub was built for. Right now, your team has access to classroom management strategies, de-escalation tools, and quick wins that take 5 minutes and make the next class period better.

${hasObservations ? 'If you have an observation day coming up, check the "Your Plan" tab on your dashboard. It explains exactly what to expect and how to prepare (spoiler: almost nothing).' : ''}

Share this with your team: the most effective tools are the ones they use when things get hard, not when things are easy.

<a href="${hubUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Explore Classroom Tools</a>

The TDI Team`
      };

    case 10: // November
      return {
        subject: `${firstName}, your staff needs this right now`,
        body: `${firstName},

November is hard. Your teachers are running on fumes and the break feels far away. This is the moment when a small gesture makes a big difference.

Two things you can do this week:

1. Print a few Staff Celebration Certificates from your Reports tab. Drop one in a teacher's mailbox with a handwritten note. It takes 2 minutes and they will remember it all year.

2. Share a wellness Quick Win at your next staff meeting. The stress management tools on the Hub are the most-used content this time of year for a reason.

Your team does not need more to do. They need to know someone sees them.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Print Certificates</a>

The TDI Team`
      };

    case 11: // December
      return {
        subject: `${firstName}, celebrate before the break`,
        body: `${firstName},

You made it to December. So did your team. That is worth celebrating.

Before everyone leaves for break, consider:

- Generate a Teacher Highlights report from your Reports tab. It lists what your team has accomplished this semester. Read a few highlights at your last staff meeting.

- Print certificates for your whole team. We have 65 award categories, from "Calm in the Storm" to "Friday Survivor." Your staff will love it.

- Take a minute for yourself. Open the Hub and try the wellness check-in. You deserve it too.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Celebrate Your Team</a>

Have a restful break.

The TDI Team`
      };

    case 0: // January
      return {
        subject: `${firstName}, here is what is working`,
        body: `${firstName},

New year, fresh start. Your dashboard has a full semester of data now.

Generate a Quarterly Progress Report from your Reports tab. It shows:
- Your metrics vs targets
- What your team has accomplished
- What is coming next

This is a great document to share with your leadership team or keep for your own planning. It takes one click to generate.

If you set goals at the start of the year, check the gauges on your Overview tab. If you have not set goals yet, the goal-setting wizard makes it easy. Pick what matters most and we will track it together.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">See Your Mid-Year Data</a>

The TDI Team`
      };

    case 1: // February
      return {
        subject: `${firstName}, your impact data is ready`,
        body: `${firstName},

If you have a board presentation coming up, or if you need to justify your PD investment for next year's budget, your dashboard has everything you need.

Generate a Board Presentation Report or Impact & ROI Report from your Reports tab. Each one includes:
- Key metrics with visual charts
- Cost per educator analysis
- Educator testimonials
- Comparison to national benchmarks
- Renewal recommendation

These are designed to be shared as-is. Print them, email them, or present them. The data speaks for itself.

${hasObservations ? 'Your observation impact data is also on your Overview tab, showing before-and-after engagement changes around your school visits.' : ''}

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Generate Board Report</a>

The TDI Team`
      };

    case 2: // March
      return {
        subject: `${firstName}, keep the momentum going`,
        body: `${firstName},

Testing season is here. Stress goes up, patience goes down, and your team needs support more than ever.

The Hub has tools built specifically for this stretch:
- Stress management Quick Wins (5 minutes, use between classes)
- The "I need a moment" feature for when things feel heavy
- Wellness check-ins that help you spot who is struggling before they tell you

The best thing you can do for your team right now is not add more to their plate. Instead, take something off. Share a 5-minute tool and tell them it is okay to use it.

<a href="${hubUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Share Wellness Tools</a>

The TDI Team`
      };

    case 3: // April
      return {
        subject: `${firstName}, almost there, and looking ahead`,
        body: `${firstName},

The final stretch. Your team has grown this year, even on the days it did not feel like it.

Two things worth doing this month:

First, take care of right now. Share a wellness tool from the Hub at your next meeting. Your team needs to hear that someone sees how hard they are working.

Second, start thinking about next year. Your dashboard has a "Next Year" tab where you can begin planning. What worked this year? What do you want more of? What goals matter for Year 2?

We will reach out soon to talk through options. No pressure, just a conversation about what makes sense for your school.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Open Your Dashboard</a>

The TDI Team`
      };

    case 4: // May
      return {
        subject: `${firstName}, look what your team accomplished`,
        body: `${firstName},

What a year.

Generate a full year report from your Reports tab. Share it at your last staff meeting. Let your team see the numbers: how many tools they explored, how their engagement grew, what they accomplished together.

Then print some certificates. We have 65 award categories. "Unsung Hero," "Friday Survivor," "The Encourager." Your team deserves to end the year feeling seen.

And when you are ready, let us talk about next year. Your "Next Year" tab has everything we have discussed so far. We can build on what worked and adjust what did not.

Thank you for trusting us with your team this year. It means everything.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">See Your Year in Review</a>

The TDI Team`
      };

    case 5: // June - no email
      return null;

    default:
      return null;
  }
}

function wrapEmail(body: string, schoolName: string, dashboardUrl: string): string {
  return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
      ${body.split('\n').filter(Boolean).map(para => {
        if (para.includes('<a href=')) return para;
        return `<p style="margin:0 0 14px;">${para}</p>`;
      }).join('')}
      <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
      <p style="font-size:12px;color:#9CA3AF;margin:0;">
        This email was sent by Teachers Deserve It as part of your partnership with ${schoolName}.
        <a href="${dashboardUrl}" style="color:#9CA3AF;">Open your dashboard</a>
      </p>
    </div>
  `;
}
