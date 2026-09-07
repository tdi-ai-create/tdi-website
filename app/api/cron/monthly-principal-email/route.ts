import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { monthlyTools, roleLabel } from '@/lib/hub/monthly-tools';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/monthly-principal-email
 *
 * First Monday of each month, 9 AM CT. Sends each principal a warm,
 * personalized email highlighting their team's engagement, with
 * real data points from the Hub.
 *
 * Tone: warm, direct, honest, no fluff. Like a friend who happens
 * to be an expert. No em dashes. No emojis. 2026 for dates.
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

    // A rehearsal that still sends is not a rehearsal. This route had no dry run
    // at all, which meant the only way to see what a partner would receive was
    // to send it to them.
    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

    // Quick Wins live in the Learning Hub project, not the one this route reads
    // for partnerships and staff. Two databases, two clients.
    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    const hub = hubUrl && hubKey
      ? createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all active partnerships with contact emails
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, contact_email, contract_phase, staff_enrolled, slug')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active partnerships.' });
    }

    // Fetched once, not per partner: every leader gets the same month.
    // A failure here must not stop the engagement email going out, so the tools
    // section simply does not render if the Hub is unreachable.
    let released: Awaited<ReturnType<typeof monthlyTools>> | null = null;
    if (hub) {
      try {
        released = await monthlyTools(hub);
      } catch (e) {
        console.error('[monthly-principal-email] Could not load this month\'s tools:', e);
      }
    }

    const site = 'https://www.teachersdeserveit.com';

    // Grouped by category, with the role each tool is tagged for underneath.
    // The roles come from the tags Julie's QA gate already refuses to publish
    // without, so nobody writes a sentence per tool and it cannot drift from
    // what the tool actually is.
    const toolsHtml = !released || released.total === 0 ? '' : `
              <div style="margin-top:28px;border-top:1px solid #E5E7EB;padding-top:22px;">
                <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e2749;">New in the Hub this month</p>
                <p style="margin:0 0 16px;font-size:14px;color:#6B7280;">${released.total === 1 ? 'One new tool' : `${released.total} new tools`} your team can use, grouped by what they help with.</p>
                ${released.groups.map(g => `
                <p style="margin:18px 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6B7280;">${g.category}</p>
                ${g.tools.map(t => `
                <div style="margin:0 0 12px;padding-left:12px;border-left:3px solid #E5E7EB;">
                  <a href="${site}/hub/quick-wins/${t.slug}" style="font-size:15px;font-weight:600;color:#1e2749;text-decoration:none;">${t.title}</a>
                  ${roleLabel(t.roles) ? `<p style="margin:2px 0 0;font-size:13px;color:#1e6355;font-weight:600;">Good for your ${roleLabel(t.roles)}</p>` : ''}
                  ${t.description ? `<p style="margin:4px 0 0;font-size:13.5px;color:#6B7280;line-height:1.55;">${t.description}</p>` : ''}
                </div>`).join('')}`).join('')}
              </div>`;

    let sent = 0;
    const wouldSend: Array<{ to: string; subject: string }> = [];
    // Reported rather than swallowed. A send that failed and a send that was
    // never logged are both invisible otherwise, and this email goes to clients.
    const sendFailures: Array<{ to: string; status: number }> = [];
    const logFailures: Array<{ partnership_id: string; to: string; reason: string }> = [];

    for (const p of partnerships) {
      if (!p.contact_email) continue;

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';

      // Get engagement data
      const { data: staff } = await supabase
        .from('staff_members')
        .select('hub_login_date')
        .eq('partnership_id', p.id);

      const totalStaff = staff?.length || p.staff_enrolled || 0;
      const loggedIn = staff?.filter(s => s.hub_login_date).length || 0;
      const loginPct = totalStaff > 0 ? Math.round((loggedIn / totalStaff) * 100) : 0;

      // Get KPI data
      const { data: kpis } = await supabase
        .from('partnership_kpis')
        .select('kpi_label, current_value, target_value, target_unit')
        .eq('partnership_id', p.id)
        .eq('status', 'active')
        .limit(3);

      const emailBody = `${firstName},

Just wanted to share a quick update on your team's TDI partnership.

${loginPct > 0
  ? `${loggedIn} of ${totalStaff} staff have logged into the Hub so far (${loginPct}%). ${loginPct >= 60 ? 'That is solid engagement. Your team is showing up.' : 'There is room to grow here, and we can help with that.'}`
  : `Your team has ${totalStaff} staff enrolled. Once they start logging into the Hub, you will see their activity reflected on your dashboard in real time.`}

${kpis && kpis.length > 0
  ? `On the KPIs we set together: ${kpis.map(k => `${k.kpi_label} is at ${k.current_value}${k.target_unit}`).join(', ')}. We are tracking these for you automatically.`
  : 'We have not set your partnership KPIs yet. When you are ready, we can pick 3-5 together on your dashboard.'}

Your dashboard is always live at teachersdeserveit.com/partners/${p.slug}. Take a look when you have a minute. And if anything comes up or you want to talk through what you are seeing, reply to this email. I read every one.

Rae`;

      // Send the email
      const subject = `${firstName}, a quick update on your team`;

      if (dryRun) {
        wouldSend.push({ to: p.contact_email.toLowerCase(), subject });
        continue;
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Rae Hughart <notifications@teachersdeserveit.com>',
          to: [p.contact_email.toLowerCase()],
          cc: ['rae@teachersdeserveit.com'],
          subject,
          html: `
            <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
              ${emailBody.split('\n').filter(Boolean).map(para => `<p style="margin:0 0 14px;">${para}</p>`).join('')}
              ${toolsHtml}
              <div style="margin-top:24px;">
                <a href="https://www.teachersdeserveit.com/partners/${p.slug}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  Open your dashboard
                </a>
              </div>
              <p style="margin-top:24px;font-size:13px;color:#9CA3AF;">
                This is your monthly partnership update from Teachers Deserve It.
              </p>
            </div>
          `,
        }),
      });

      if (emailResponse.ok) {
        sent++;
        // This row is the only record that a partner was emailed this month.
        // If the insert fails silently we lose that, and nothing downstream can
        // tell a partner who was contacted from one who was missed. Pre-existing
        // unchecked write, caught by check:writes when this file changed.
        const { error: logError } = await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'monthly_email_sent',
          details: { to: p.contact_email, month: new Date().toISOString().slice(0, 7) },
        });
        if (logError) {
          console.error(
            `[monthly-principal-email] Email sent to ${p.contact_email} but the activity log insert failed:`,
            logError.message
          );
          logFailures.push({ partnership_id: p.id, to: p.contact_email, reason: logError.message });
        }
      } else {
        const body = await emailResponse.text().catch(() => '');
        console.error(`[monthly-principal-email] Send failed for ${p.contact_email}:`, emailResponse.status, body.slice(0, 200));
        sendFailures.push({ to: p.contact_email, status: emailResponse.status });
      }
    }

    if (dryRun) {
      // Rendered once so the copy can actually be read, rather than described.
      const samplePartner = partnerships.find(x => x.contact_email) ?? null;
      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldSend: wouldSend.length,
        recipients: wouldSend,
        month: released?.monthLabel ?? null,
        toolsThisMonth: released?.total ?? 0,
        categories: released?.groups.map(g => ({ category: g.category, count: g.tools.length })) ?? [],
        toolsSectionRendered: toolsHtml.length > 0,
        previewFor: samplePartner?.contact_email ?? null,
        toolsHtml,
      });
    }

    console.log('[monthly-principal-email] Sent', sent, 'of', partnerships.length);
    return NextResponse.json({
      success: sendFailures.length === 0 && logFailures.length === 0,
      sent,
      total: partnerships.length,
      sendFailures,
      logFailures,
    });
  } catch (error) {
    console.error('[monthly-principal-email] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
