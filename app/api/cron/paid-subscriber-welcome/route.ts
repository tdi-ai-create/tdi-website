import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/paid-subscriber-welcome
 *
 * One-time send: emails paid Substack subscribers about their
 * Essentials Hub access. Only sends to members with source
 * 'substack_paid' who haven't received this email yet.
 *
 * Self-disabling: does nothing once all have been notified.
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

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    if (!hubUrl || !hubKey) return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get paid Substack subscribers who haven't been notified
    const { data: members } = await hubSupabase
      .from('hub_memberships')
      .select('id, user_id')
      .eq('source', 'substack_paid')
      .eq('tier', 'essentials');

    if (!members || members.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No paid subscribers to notify' });
    }

    let sent = 0;

    for (const m of members) {
      // Check if already notified
      const { data: alreadySent } = await hubSupabase
        .from('hub_activity_log')
        .select('id')
        .eq('user_id', m.user_id)
        .eq('action', 'paid_subscriber_welcome_sent')
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      // Get email
      const { data: profile } = await hubSupabase
        .from('hub_profiles')
        .select('email, display_name')
        .eq('id', m.user_id)
        .single();

      if (!profile?.email) continue;

      const html = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
          <div style="background:#1e2749;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#F5A623;">For Paid Subscribers</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:white;">You have access to something new</p>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;">Hi there,</p>

            <p style="margin:0 0 16px;">Because you are a paid subscriber, our team has set up an <strong>Essentials account</strong> for you on the TDI Learning Hub. It is already active and waiting for you.</p>

            <p style="margin:0 0 16px;">This gives you access to tools that most educators do not have yet:</p>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
              <tr><td style="padding:6px 0;font-size:14px;"><span style="color:#F5A623;font-weight:700;margin-right:6px;">&#9679;</span> <strong>100+ Quick Wins</strong> across 12 categories</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;"><span style="color:#F5A623;font-weight:700;margin-right:6px;">&#9679;</span> <strong>9 Practice Games</strong> to sharpen classroom instincts</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;"><span style="color:#F5A623;font-weight:700;margin-right:6px;">&#9679;</span> <strong>Community Q&A</strong> with educators across the country</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;"><span style="color:#F5A623;font-weight:700;margin-right:6px;">&#9679;</span> <strong>"I Need a Moment"</strong> wellness reset tool</td></tr>
            </table>

            <p style="margin:0 0 16px;">Log in with the email you are reading this on. No password needed, just use the magic link.</p>

            <div style="text-align:center;margin:24px 0;">
              <a href="https://www.teachersdeserveit.com/hub/login" style="display:inline-block;padding:16px 44px;background:#F5A623;color:#1e2749;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;">Open the Learning Hub</a>
            </div>

            <p style="margin:0 0 16px;font-size:14px;color:#64748B;">This is included with your paid subscription. No extra cost, nothing to sign up for. We took care of it.</p>

            <p style="margin:0;">The TDI Team</p>
          </div>
          <div style="background:#1e2749;padding:14px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Teachers Deserve It | teachersdeserveit.com</p>
          </div>
        </div>
      `;

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: profile.email,
          subject: 'You have access to something new on the TDI Learning Hub',
          html,
        }),
      });

      if (resp.ok) {
        await hubSupabase.from('hub_activity_log').insert({
          user_id: m.user_id,
          action: 'paid_subscriber_welcome_sent',
          metadata: { email: profile.email },
        });
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('[paid-subscriber-welcome] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
