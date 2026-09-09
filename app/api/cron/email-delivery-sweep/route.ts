import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { guardCron } from '@/lib/cron-guard';
import { slackNotify } from '@/lib/slack-notify';
import { getResendStatus, SILENCE_BEFORE_ASKING_MINUTES } from '@/lib/resend-status';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/email-delivery-sweep
 *
 * Chases up every creator email that went quiet.
 *
 * The webhook handles the normal case within seconds. This exists for the case
 * a webhook structurally cannot report: Resend's suppression list. Sending to a
 * suppressed address returns 200 with a real message id, delivers nothing, and
 * fires no event ever. Silence and success look identical, and stay that way.
 *
 * Found on 8 September 2026 with forty addresses suppressed, eleven of them one
 * district, and nothing anywhere in the product showing it.
 *
 * So anything still silent after a quarter of an hour gets asked about directly.
 *
 * ?dryRun=1 reads Resend and reports every verdict while writing nothing.
 */
export async function GET(request: NextRequest) {
  const guard = guardCron(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 });
  }
  const { dryRun } = guard;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'RESEND_API_KEY is not set' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  const now = Date.now();

  // Old enough that silence is meaningful, recent enough that Resend still has
  // it and a person could still act on the answer.
  const olderThan = new Date(now - SILENCE_BEFORE_ASKING_MINUTES * 60_000).toISOString();
  const newerThan = new Date(now - 7 * 86_400_000).toISOString();

  const { data: silent, error: readError } = await supabase
    .from('creator_email_log')
    .select('id, creator_name, creator_email, subject, sent_at, provider_id')
    .eq('dry_run', false)
    .not('provider_id', 'is', null)
    .is('last_event', null)
    .is('status_checked_at', null)
    .gte('sent_at', newerThan)
    .lte('sent_at', olderThan)
    .order('sent_at', { ascending: true })
    .limit(200);

  if (readError) {
    console.error('[delivery-sweep] Could not read the log:', readError.message);
    return NextResponse.json({ success: false, error: readError.message }, { status: 500 });
  }

  const results = {
    examined: (silent ?? []).length,
    suppressed: [] as string[],
    bounced: [] as string[],
    delivered: 0,
    stillSilent: 0,
    errors: [] as string[],
  };

  for (const row of silent ?? []) {
    const status = await getResendStatus(row.provider_id as string, apiKey);

    if (status.error) {
      // Deliberately not stamped as checked. A failed lookup is not an answer,
      // and stamping it would retire the row having learned nothing.
      results.errors.push(status.error);
      continue;
    }

    const who = row.creator_name || row.creator_email;
    const patch: Record<string, unknown> = { status_checked_at: new Date().toISOString() };

    if (status.lastEvent) patch.last_event = status.lastEvent;

    if (status.suppressed) {
      patch.suppressed_at = new Date().toISOString();
      results.suppressed.push(`${who} (${row.creator_email}): "${row.subject}"`);
    } else if (status.bounced) {
      patch.bounced_at = new Date().toISOString();
      patch.bounce_reason = 'Reported by Resend on a status check, not by webhook';
      results.bounced.push(`${who} (${row.creator_email})`);
    } else if (status.delivered) {
      patch.delivered_at = new Date().toISOString();
      results.delivered += 1;
    } else {
      results.stillSilent += 1;
    }

    if (dryRun) continue;

    const { error: writeError } = await supabase
      .from('creator_email_log')
      .update(patch)
      .eq('id', row.id);

    // A dropped write here means this row is asked about again next run, which
    // is harmless, and reporting it beats a sweep that quietly learns nothing.
    if (writeError) {
      results.errors.push(`Could not record status for ${who}: ${writeError.message}`);
    }
  }

  // Our own addresses are not somebody's work. The sandbox creator and the test
  // accounts live on teachersdeserveit.com and are deliberately suppressed, so
  // telling Bella about them is noise that teaches her to skim these.
  const suppressedForAPerson = results.suppressed.filter(
    (line) => !line.includes('@teachersdeserveit.com')
  );

  // Suppression is the one a person has to act on: nothing we send reaches them
  // and no amount of resending changes that.
  if (!dryRun && suppressedForAPerson.length > 0) {
    slackNotify(
      'bella',
      `${suppressedForAPerson.length} email${suppressedForAPerson.length === 1 ? '' : 's'} never left our email provider. ` +
        `The address is on Resend's suppression list, so nothing we send arrives and sending again will not help. ` +
        `These people have not seen anything from us:\n${suppressedForAPerson.map((s) => `\n- ${s}`).join('')}` +
        `\n\nThey need a working address, or the suppression lifted in Resend once the mailbox is known good.`
    );
  }

  console.log(
    `[delivery-sweep] ${dryRun ? 'DRY RUN ' : ''}examined ${results.examined}, ` +
      `suppressed ${results.suppressed.length}, bounced ${results.bounced.length}, ` +
      `delivered ${results.delivered}, still silent ${results.stillSilent}`
  );

  return NextResponse.json({ success: true, dryRun, ...results });
}
