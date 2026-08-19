import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { classifyClocks, STEP_REMINDERS_ENABLED, type ClockVerdict } from '@/lib/creator-clocks';
import { creatorEmailTemplate } from '@/lib/creator-email-template';
import { logCreatorEmail } from '@/lib/creator-email-log';
import { postCreatorMessage } from '@/lib/creator-slack';
import { SITE_URL } from '@/lib/reengagement-config';

// ---------------------------------------------------------------------------
// The creator side clock
//
// Nothing has ever told a creator they had stalled. Walter Cullin Jr went 182
// days, Amy Storer 83, Jay Jackson and Joe Vercellino around 71, each with one
// clear step in front of them and no date on it.
//
// This sends one warm reminder when a date passes, repeats no more than every
// ten days, and stops sending entirely once it is clear that reminders are not
// what is needed. At that point it becomes Bella's, because someone who has
// ignored three emails does not need a fourth.
//
// STEP_REMINDERS_ENABLED is false until Rae has read a dry run. Backdating the
// clocks honestly would have made five creators overdue on launch day, one of
// them by 168 days, and their first ever message from this system should not
// be an overdue notice.
//
// Supports ?dryRun=1 through lib/cron-guard.
// ---------------------------------------------------------------------------

const EMAIL_FROM = 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>';
const REPLY_TO = 'bella@teachersdeserveit.com';

function reminderEmail(v: ClockVerdict): { subject: string; html: string } {
  const firstName = v.creatorName.split(' ')[0];
  return {
    subject: `Creator Studio | Still here whenever you pick this back up, ${firstName}`,
    html: creatorEmailTemplate({
      firstName,
      tagline: 'No deadline, just a nudge',
      body: `
        <p>Hey ${firstName},</p>
        <p>Your next step in the Creator Studio is <strong>${v.step}</strong>, and the date we suggested for it has come and gone. That is genuinely fine. The dates we put on steps are our recommendation, never a deadline, and nothing has been lost.</p>
        <p>If you have ten minutes, the button below takes you straight to it.</p>
        <p>If the timing is wrong, there is a button on that page that says you need more time. It moves the date and asks you for nothing. Use it as often as you like.</p>
        <p>And if you are stuck on something rather than short of time, just reply to this and tell me what is in the way. That is usually faster than either of us waiting.</p>
        <p>No rush,<br/>Bella</p>
      `,
      ctaLabel: 'Open My Next Step',
      ctaUrl: `${SITE_URL}/creator-portal/dashboard`,
    }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const guard = guardCron(request);
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
    const { dryRun } = guard;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Missing Supabase config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const verdicts = await classifyClocks(supabase, now);
    const toNudge = verdicts.filter((v) => v.outcome === 'nudge');
    const toPerson = verdicts.filter((v) => v.outcome === 'person');

    const results = {
      dryRun,
      sendsEnabled: STEP_REMINDERS_ENABLED,
      evaluated: verdicts.length,
      wouldNudge: toNudge.map((v) => ({ creator: v.creatorName, step: v.step, days: v.daysPastDue, reason: v.reason })),
      needsAPerson: toPerson.map((v) => ({ creator: v.creatorName, step: v.step, days: v.daysPastDue, reason: v.reason })),
      sent: 0,
      errors: [] as string[],
    };

    const suppressed = dryRun || !STEP_REMINDERS_ENABLED;

    for (const v of toNudge) {
      if (suppressed || !v.creatorEmail) continue;

      const { subject, html } = reminderEmail(v);
      const ok = await send(subject, html, v.creatorEmail);
      if (!ok) {
        results.errors.push(`Send failed for ${v.creatorName}`);
        continue;
      }

      // Only stamp on a send that actually succeeded. Stamping regardless is
      // what let paused creators go months with no contact while the record
      // said they had been checked in on.
      await supabase
        .from('creator_milestones')
        .update({ last_nudged_at: now.toISOString() })
        .eq('id', v.milestoneRecordId);

      await logCreatorEmail({
        creator_id: v.creatorId,
        creator_name: v.creatorName,
        creator_email: v.creatorEmail,
        direction: 'to_creator',
        category: 'step_reminder',
        subject,
        sent_by: 'cron:creator-step-reminders',
      });

      results.sent++;
    }

    if (toPerson.length > 0 && !suppressed) {
      const lines = toPerson
        .map((v) => `\n\n*${v.creatorName}* · ${v.step}\n${v.reason}\n${SITE_URL}/tdi-admin/creators/${v.creatorId}`)
        .join('');
      await postCreatorMessage(
        `*Reminders are not working* | ${toPerson.length} ${toPerson.length === 1 ? 'creator' : 'creators'}\n` +
          `These have had their nudges. Another email will not help.${lines}`
      );
      for (const v of toPerson) {
        await supabase
          .from('creator_milestones')
          .update({ escalated_at: now.toISOString() })
          .eq('id', v.milestoneRecordId);
      }
    }

    console.log(
      `[step-reminders] ${suppressed ? 'REPORT ONLY ' : ''}evaluated ${verdicts.length}, nudge ${toNudge.length}, person ${toPerson.length}, sent ${results.sent}`
    );

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[step-reminders] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function send(subject: string, html: string, to: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        bcc: ['bella@teachersdeserveit.com'],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) {
      console.error('[step-reminders] Resend error:', await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[step-reminders] Send failed:', e);
    return false;
  }
}
