import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/partner-onboarding-reminders
 *
 * Runs daily at 9am CT. Checks for partners who:
 * 1. Were invited but haven't logged in (3, 7, 14 day reminders)
 * 2. Have incomplete onboarding steps
 * 3. Have upcoming session dates (2 months, 2 weeks, 2 days)
 *
 * Voice: TDI Team. Short, warm, direct. No em dashes.
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

    const now = new Date();
    let sent = 0;

    // Get all active partnerships
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, contact_email, slug, org_name, status, invite_sent_at, invite_accepted_at, staff_enrolled, observation_days_total, virtual_sessions_total, executive_sessions_total')
      .eq('status', 'active');

    if (!partnerships) return NextResponse.json({ success: true, sent: 0 });

    for (const p of partnerships) {
      if (!p.contact_email) continue;

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';
      const schoolName = p.org_name || p.contact_name || 'Your School';
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${p.slug}`;

      // === LOGIN REMINDERS ===
      if (p.invite_sent_at && !p.invite_accepted_at) {
        const inviteSent = new Date(p.invite_sent_at);
        const daysSinceInvite = Math.floor((now.getTime() - inviteSent.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we already sent this reminder
        const reminderKey = `login_reminder_day_${daysSinceInvite >= 14 ? 14 : daysSinceInvite >= 7 ? 7 : 3}`;
        const { data: existingLog } = await supabase
          .from('activity_log')
          .select('id')
          .eq('partnership_id', p.id)
          .eq('action', reminderKey)
          .limit(1);

        if (existingLog && existingLog.length > 0) continue;

        let reminderEmail: { subject: string; body: string } | null = null;

        if (daysSinceInvite === 3) {
          reminderEmail = {
            subject: `${firstName}, your TDI dashboard is waiting`,
            body: `${firstName},

We set up your partnership dashboard a few days ago and wanted to make sure you saw it. Everything is ready for you.

It takes about 2 minutes to look around. The setup checklist at the top walks you through the first steps.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Open Your Dashboard</a>

If you are having trouble logging in, just reply to this email and we will help.

The TDI Team`
          };
        } else if (daysSinceInvite === 7) {
          reminderEmail = {
            subject: `${firstName}, quick check-in from TDI`,
            body: `${firstName},

Just checking in. Your partnership dashboard has been live for a week and we want to make sure everything is working for you.

Your ${p.staff_enrolled || 0} educators are ready to get started on the Learning Hub as soon as you complete the setup checklist. The sooner they have access, the sooner they start benefiting.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Complete Your Setup</a>

Need help? Reply to this email or schedule a call and we will walk through it together.

The TDI Team`
          };
        } else if (daysSinceInvite === 14) {
          reminderEmail = {
            subject: `${firstName}, we want to make sure you are all set`,
            body: `${firstName},

It has been two weeks since we set up your dashboard and we have not seen you log in yet. We want to make sure nothing is blocking you.

Common questions we hear:
- "I did not get the invite email." We can resend it right now. Just reply.
- "I do not have time right now." Totally fine. When you are ready, it takes 2 minutes.
- "I am not sure what this is." Your dashboard shows real-time data about your team's engagement with TDI. It is where your partnership comes to life.

<a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:16px 0;">Log In Now</a>

We are here whenever you are ready.

The TDI Team`
          };
        }

        if (reminderEmail) {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
              to: [p.contact_email.toLowerCase()],
              subject: reminderEmail.subject,
              html: wrapEmail(reminderEmail.body, schoolName, dashboardUrl),
            }),
          });
          if (resp.ok) {
            sent++;
            await supabase.from('activity_log').insert({
              partnership_id: p.id, action: reminderKey, details: { day: daysSinceInvite },
            });
          }
        }
      }

      // === DATE REMINDERS (2 months, 2 weeks, 2 days before sessions) ===
      const { data: events } = await supabase
        .from('timeline_events')
        .select('id, event_title, event_date, status')
        .eq('partnership_id', p.id)
        .in('status', ['upcoming', 'in_progress'])
        .not('event_date', 'is', null);

      if (events) {
        for (const event of events) {
          if (!event.event_date) continue;
          const eventDate = new Date(event.event_date);
          const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let reminderType: string | null = null;
          let subject = '';
          let body = '';

          if (daysUntil === 60) {
            reminderType = 'date_reminder_2mo';
            subject = `${firstName}, ${event.event_title || 'your TDI session'} is 2 months out`;
            body = `${firstName},

Just a heads up that your ${event.event_title || 'TDI session'} is scheduled for ${eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. That is about 2 months from now.

No action needed right now. We will send you everything you need closer to the date. If you need to reschedule, just reply to this email.

The TDI Team`;
          } else if (daysUntil === 14) {
            reminderType = 'date_reminder_2wk';
            subject = `${firstName}, ${event.event_title || 'your TDI session'} is in 2 weeks`;
            body = `${firstName},

Your ${event.event_title || 'TDI session'} is coming up on ${eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Two weeks out.

${(event.event_title || '').toLowerCase().includes('observation') ? `Here is all you need to do:\n1. Let your staff know we are coming. A simple heads-up is fine.\n2. Keep your normal schedule. We want to see a real day.\n3. Block 30 minutes at the end of the day for our leadership debrief.\n\nThat is it. No special prep needed.` : 'We will follow up with any details you need before the session.'}

If you need to move the date, just reply.

The TDI Team`;
          } else if (daysUntil === 2) {
            reminderType = 'date_reminder_2day';
            subject = `${firstName}, ${event.event_title || 'your TDI session'} is this ${eventDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
            body = `${firstName},

Quick reminder that your ${event.event_title || 'TDI session'} is this ${eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.

${(event.event_title || '').toLowerCase().includes('observation') ? 'We will be there during the school day. Just run your normal schedule. Our team will check in with you when we arrive.\n\nEvery teacher we observe will receive a personalized Love Note within 24 hours.' : 'We are looking forward to it.'}

See you soon.

The TDI Team`;
          }

          if (reminderType) {
            // Check if already sent
            const { data: existing } = await supabase
              .from('activity_log')
              .select('id')
              .eq('partnership_id', p.id)
              .eq('action', reminderType)
              .eq('details->>event_id', event.id)
              .limit(1);

            if (existing && existing.length > 0) continue;

            const resp = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
                to: [p.contact_email.toLowerCase()],
                subject,
                html: wrapEmail(body, schoolName, dashboardUrl),
              }),
            });
            if (resp.ok) {
              sent++;
              await supabase.from('activity_log').insert({
                partnership_id: p.id, action: reminderType, details: { event_id: event.id, event_title: event.event_title },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('[partner-onboarding-reminders] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
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
