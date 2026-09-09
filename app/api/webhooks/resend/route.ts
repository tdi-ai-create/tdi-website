import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { getServiceSupabase } from '@/lib/supabase';
import { slackNotify } from '@/lib/slack-notify';

export const dynamic = 'force-dynamic';

/**
 * Delivery events from Resend.
 *
 * Resend accepting a message means "we handed it over", not "they received it".
 * Allenwood's invoice bounced off an address that did not exist and nothing told
 * anyone for three weeks, while the follow-up clock kept running. This is what
 * closes that: a bounce marks the message failed and posts to #financials within
 * seconds of it happening.
 *
 * Set RESEND_WEBHOOK_SECRET and point Resend at /api/webhooks/resend.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const raw = await request.text();

  // An unsigned webhook is an open door: anyone could post a fake "delivered" and
  // hide a bounce, which is precisely the failure this endpoint exists to prevent.
  // So it fails closed. No secret configured means no events accepted, rather than
  // events accepted from anyone.
  if (!secret) {
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET is not set. Refusing events.');
    return NextResponse.json(
      { error: 'Webhook is not configured. Set RESEND_WEBHOOK_SECRET and point Resend at this endpoint.' },
      { status: 503 },
    );
  }
  try {
    new Webhook(secret).verify(raw, {
      'svix-id': request.headers.get('svix-id') ?? '',
      'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      'svix-signature': request.headers.get('svix-signature') ?? '',
    });
  } catch {
    return NextResponse.json({ error: 'Bad signature' }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }); }

  const type: string = payload?.type ?? '';
  const data = payload?.data ?? {};
  const providerId: string | null = data.email_id ?? data.id ?? null;
  const occurredAt: string | null = payload?.created_at ?? data.created_at ?? null;
  const recipient: string | null = Array.isArray(data.to) ? data.to[0] : data.to ?? null;

  if (!providerId) return NextResponse.json({ ok: true, ignored: 'no message id' });

  const sb = getServiceSupabase();
  const { data: msg } = await sb
    .from('billing_outbox')
    .select('id, subject, to_email, kind, invoice_id, bounced_at, opened_at')
    .eq('provider_id', providerId)
    .maybeSingle();

  // Not an invoice. Before giving up, check the creator mail, which travels
  // through the same Resend account and was silently dropped here until now.
  if (!msg) return await recordCreatorEvent(sb, { providerId, type, occurredAt, data });

  // The audit trail is the point of this endpoint. If the insert fails we must know,
  // not carry on updating the summary as though the event was recorded.
  const { error: eventError } = await sb.from('billing_delivery_events').insert({
    outbox_id: msg.id, provider_id: providerId, event_type: type,
    occurred_at: occurredAt, recipient, detail: data,
  });
  // A duplicate is expected: providers retry, and the unique index is what makes that
  // safe. Anything else means the trail has a hole in it.
  const isDuplicate = eventError?.code === '23505';
  if (eventError && !isDuplicate) {
    console.error('[resend-webhook] could not record event:', eventError.message);
    slackNotify('financials',
      `Delivery tracking problem: a ${type} event for "${msg.subject}" could not be recorded. ` +
      `The message state in Billing may be out of date.`);
    return NextResponse.json({ error: 'Could not record event' }, { status: 500 });
  }
  // Already seen. Do not re-run the side effects, which would post to Slack twice.
  if (isDuplicate) return NextResponse.json({ ok: true, duplicate: type });

  const patch: Record<string, unknown> = { last_event: type, last_event_at: new Date().toISOString() };

  switch (type) {
    case 'email.delivered':
      patch.delivered_at = occurredAt ?? new Date().toISOString();
      break;

    case 'email.bounced':
    case 'email.delivery_delayed': {
      const hard = type === 'email.bounced';
      const reason = data.bounce?.message ?? data.reason ?? 'No reason given';
      if (hard) {
        patch.bounced_at = occurredAt ?? new Date().toISOString();
        patch.bounce_reason = reason;
        // It never arrived, so it is not sent. Anything counting days from the
        // send date is now counting from an event that did not happen.
        patch.status = 'failed';
        patch.send_result = `Bounced: ${String(reason).slice(0, 300)}`;
      }
      if (!msg.bounced_at) {
        slackNotify('financials',
          hard
            ? `BOUNCED. "${msg.subject}" never reached ${msg.to_email}. ${reason}. ` +
              `It is back in the Outbox as failed. The client has not seen this, so do not chase them for it.`
            : `Delayed: "${msg.subject}" to ${msg.to_email} has not been delivered yet. ${reason}`);
      }
      break;
    }

    case 'email.opened':
      // First open only. A client rereading an invoice is not news.
      if (!msg.opened_at) patch.opened_at = occurredAt ?? new Date().toISOString();
      break;

    case 'email.complained':
      patch.complained_at = occurredAt ?? new Date().toISOString();
      slackNotify('financials',
        `Marked as spam: "${msg.subject}" by ${msg.to_email}. Stop sending to this address until someone speaks to them.`);
      break;
  }

  const { error } = await sb.from('billing_outbox').update(patch).eq('id', msg.id);
  if (error) console.error('[resend-webhook] could not record event:', error.message);

  return NextResponse.json({ ok: true, recorded: type });
}

/**
 * What happened to a creator email.
 *
 * Until this existed, every creator event arriving here was answered with "not a
 * billing message" and thrown away. creator_email_log recorded that we sent and
 * never what happened next, which is how nine creators came to look as though
 * they had been ignoring us for months while nobody had checked whether a single
 * message reached them.
 *
 * A bounce here is the most valuable event we receive. It is the difference
 * between "they are not engaging" and "they have never seen anything we sent",
 * and those call for opposite responses.
 */
async function recordCreatorEvent(
  sb: ReturnType<typeof getServiceSupabase>,
  ev: { providerId: string; type: string; occurredAt: string | null; data: any },
) {
  const { providerId, type, occurredAt, data } = ev;

  const { data: msg, error: lookupError } = await sb
    .from('creator_email_log')
    .select('id, creator_name, creator_email, category, subject, bounced_at, opened_at')
    .eq('provider_id', providerId)
    .maybeSingle();

  if (lookupError) {
    // Returning 200 here would tell Resend the event was handled and stop it
    // retrying, losing the event for good.
    console.error('[resend-webhook] creator lookup failed:', lookupError.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  // Genuinely not ours. Resend carries other TDI mail too.
  if (!msg) return NextResponse.json({ ok: true, ignored: 'not a tracked message' });

  const at = occurredAt ?? new Date().toISOString();
  const patch: Record<string, unknown> = { last_event: type, last_event_at: at };
  const who = msg.creator_name || msg.creator_email;

  switch (type) {
    case 'email.delivered':
      patch.delivered_at = at;
      break;

    case 'email.bounced': {
      const reason = data.bounce?.message ?? data.reason ?? 'No reason given';
      patch.bounced_at = at;
      patch.bounce_reason = String(reason).slice(0, 500);
      // Only on the first bounce for this message: providers retry events, and
      // Bella does not need the same bad address three times.
      if (!msg.bounced_at) {
        slackNotify('bella',
          `Email never arrived: "${msg.subject}" to ${who} bounced. ${reason}. ` +
          `They have not seen it, so this is not them ignoring us. ` +
          `Nothing further will be sent to that address until it is fixed.`);
      }
      break;
    }

    case 'email.complained':
      patch.complained_at = at;
      slackNotify('bella',
        `Marked as spam: "${msg.subject}" by ${who}. Stop sending to this address until someone speaks to them.`);
      break;

    case 'email.opened':
      // First open only. Somebody rereading a reminder is not news.
      if (!msg.opened_at) patch.opened_at = at;
      break;
  }

  const { error } = await sb.from('creator_email_log').update(patch).eq('id', msg.id);
  if (error) {
    console.error('[resend-webhook] could not record creator event:', error.message);
    return NextResponse.json({ error: 'Could not record event' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, recorded: type, creator: who });
}
