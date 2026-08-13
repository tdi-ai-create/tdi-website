import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';
import { creatorEmailTemplate } from '@/lib/creator-email-template';
import { guardCron } from '@/lib/cron-guard';
import { classifyRoster, GateVerdict } from '@/lib/agreement-gate';
import { AGREEMENT_GATE_ENABLED, AGREEMENT_GRACE_DAYS } from '@/lib/reengagement-config';

// ---------------------------------------------------------------------------
// The agreement gate
//
// A signed agreement is what makes someone a creator. This closes unsigned
// accounts that never started, so the roster reflects the people actually
// working with us rather than everyone who ever filled in a form.
//
// It never closes someone who is doing real work. Those are surfaced to Bella
// in the Re-engagement tab instead, because an unsigned creator who is building
// content is a conversation, not an automation.
//
// Supports ?dryRun=1 through lib/cron-guard, which reports every decision
// without sending or writing anything.
// ---------------------------------------------------------------------------

const EMAIL_FROM = 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>';
const REPLY_TO = 'bella@teachersdeserveit.com';

function closingEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `Creator Studio | Closing your spot for now, ${firstName}`,
    html: creatorEmailTemplate({
      firstName,
      tagline: 'The door stays open',
      body: `
        <p>Hey ${firstName},</p>
        <p>A while back you started the process of creating content with us, and it never quite got off the ground. That happens more often than you would think, and it is not a mark against you at all.</p>
        <p>So we are going to close out your Creator Studio spot for now. Nothing is lost, and this is not a no. It just means neither of us is carrying something that is not moving.</p>
        <p>If the timing gets better, at any point, reply to this email and I will get you set back up. No forms, no starting over, no explanation needed.</p>
        <p>Thank you for wanting to share what you know with other educators. That instinct is a good one, and I hope you get to act on it, with us or anywhere else.</p>
        <p>Warmly,<br/>Bella</p>
      `,
      showNominate: true,
    }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const guard = guardCron(request);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { dryRun } = guard;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Missing Supabase config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const roster = await classifyRoster(supabase, now);

    const toClose = roster.filter((v) => v.outcome === 'close');
    const flagged = roster.filter((v) => v.outcome === 'unsigned_working');

    const results = {
      dryRun,
      gateEnabled: AGREEMENT_GATE_ENABLED,
      graceDays: AGREEMENT_GRACE_DAYS,
      evaluated: roster.length,
      closed: 0,
      emailsSent: 0,
      flaggedForBella: flagged.map((v) => ({ name: v.name, reason: v.reason })),
      plan: [] as unknown[],
      errors: [] as string[],
    };

    for (const verdict of toClose) {
      if (dryRun || !AGREEMENT_GATE_ENABLED) {
        results.plan.push({
          name: verdict.name,
          email: verdict.email,
          reason: verdict.reason,
          wouldClose: true,
        });
        continue;
      }

      const closed = await closeCreator(supabase, verdict, resendApiKey, results);
      if (closed) results.closed++;
    }

    console.log(
      `[agreement-gate] ${dryRun ? 'DRY RUN ' : ''}evaluated ${roster.length}, closed ${results.closed}, flagged ${flagged.length}`
    );

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[agreement-gate] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function closeCreator(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  verdict: GateVerdict,
  resendApiKey: string | undefined,
  results: { emailsSent: number; errors: string[] }
): Promise<boolean> {
  const firstName = verdict.name?.split(' ')[0] || 'there';
  const { subject, html } = closingEmail(firstName);

  // Send before closing. If the send fails we leave the account alone and try
  // again tomorrow, rather than closing someone silently.
  if (verdict.email && resendApiKey) {
    const sent = await sendEmail(resendApiKey, verdict.email, subject, html);
    if (!sent) {
      results.errors.push(`Send failed for ${verdict.email}, not closing`);
      return false;
    }
    results.emailsSent++;
  } else {
    results.errors.push(`No email or no Resend key for ${verdict.name}, not closing`);
    return false;
  }

  const { error: statusError } = await supabase
    .from('creators')
    .update({
      status: 'withdrawn',
      display_on_website: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verdict.creatorId);

  if (statusError) {
    results.errors.push(`Close failed for ${verdict.name}: ${statusError.message}`);
    return false;
  }

  const { error: noteError } = await supabase.from('creator_notes').insert({
    creator_id: verdict.creatorId,
    content: `Closed by the agreement gate: ${verdict.reason}. A closing note was emailed and they can restart any time by replying.`,
    author: 'System',
    visible_to_creator: false,
  });

  if (noteError) {
    results.errors.push(`Audit note failed for ${verdict.name}: ${noteError.message}`);
  }

  await logCreatorEmail({
    creator_id: verdict.creatorId,
    creator_name: verdict.name || undefined,
    creator_email: verdict.email || undefined,
    direction: 'to_creator',
    category: 'agreement_gate_close',
    subject,
    sent_by: 'cron:creator-agreement-gate',
  });

  console.log(`[agreement-gate] Closed ${verdict.name} (${verdict.reason})`);
  return true;
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        bcc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });

    if (!res.ok) {
      console.error('[agreement-gate] Resend error:', await res.json());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[agreement-gate] Send error:', e);
    return false;
  }
}
