import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * GET /api/cron/monthly-principal-email
 *
 * First Monday of each month, 9 AM CT. Sends each principal a warm,
 * personalized email highlighting their team's engagement. Written
 * by AI in Rae's voice, with real data points from the Hub.
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

    let sent = 0;

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

      // Build data context for AI
      const dataContext = {
        firstName,
        totalStaff,
        loggedIn,
        loginPct,
        phase: p.contract_phase,
        kpis: (kpis || []).map(k => `${k.kpi_label}: ${k.current_value}${k.target_unit} (target: ${k.target_value}${k.target_unit})`),
      };

      let emailBody: string;

      // Try AI-generated email if API key available
      if (ANTHROPIC_API_KEY) {
        try {
          const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 400,
              messages: [{
                role: 'user',
                content: `Write a short email (3-4 paragraphs) from Rae Hughart, CEO of Teachers Deserve It, to a school principal named ${firstName}. This is a monthly check-in about their TDI partnership.

Data: ${totalStaff} staff enrolled, ${loggedIn} have logged into the Hub (${loginPct}%), phase: ${dataContext.phase}.
${dataContext.kpis.length > 0 ? 'KPIs: ' + dataContext.kpis.join(', ') : 'No KPIs set yet.'}

Tone rules:
- Warm, direct, honest, no fluff
- Like a friend who happens to be an expert
- Never use em dashes. Use commas or periods instead.
- No emojis anywhere
- Lead with something positive
- End with a soft next step (not a hard ask)
- Sign off as just "Rae"
- Keep it under 150 words
- Do not use "Dear" or "Sincerely"

Write ONLY the email body, no subject line.`
              }],
            }),
          });

          const aiData = await aiResponse.json();
          emailBody = aiData.content?.[0]?.text || '';
        } catch {
          emailBody = '';
        }
      } else {
        emailBody = '';
      }

      // Fallback if AI fails
      if (!emailBody) {
        emailBody = `${firstName},

Just wanted to share a quick update on your team's TDI partnership.

${loginPct > 0
  ? `${loggedIn} of ${totalStaff} staff have logged into the Hub so far (${loginPct}%). ${loginPct >= 60 ? 'That is solid engagement. Your team is showing up.' : 'There is room to grow here, and we can help with that.'}`
  : `Your team has ${totalStaff} staff enrolled. Once they start logging into the Hub, you will see their activity reflected on your dashboard in real time.`}

${kpis && kpis.length > 0
  ? `On the KPIs we set together: ${kpis.map(k => `${k.kpi_label} is at ${k.current_value}${k.target_unit}`).join(', ')}. We are tracking these for you automatically.`
  : 'We have not set your partnership KPIs yet. When you are ready, we can pick 3-5 together on your dashboard.'}

Your dashboard is always live at teachersdeserveit.com/partners/${p.slug}. Take a look when you have a minute. And if anything comes up or you want to talk through what you are seeing, reply to this email. I read every one.

Rae`;
      }

      // Send the email
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
          subject: `${firstName}, a quick update on your team`,
          html: `
            <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
              ${emailBody.split('\n').filter(Boolean).map(para => `<p style="margin:0 0 14px;">${para}</p>`).join('')}
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
        // Log activity
        await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'monthly_email_sent',
          details: { to: p.contact_email, month: new Date().toISOString().slice(0, 7) },
        });
      }
    }

    console.log('[monthly-principal-email] Sent', sent, 'of', partnerships.length);
    return NextResponse.json({ success: true, sent, total: partnerships.length });
  } catch (error) {
    console.error('[monthly-principal-email] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
