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

  // An unsigned webhook is an open door: anyone could mark an invoice delivered.
  if (secret) {
    try {
      new Webhook(secret).verify(raw, {
        'svix-id': request.headers.get('svix-id') ?? '',
        'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
        'svix-signature': request.headers.get('svix-signature') ?? '',
      });
    } catch {
      return NextResponse.json({ error: 'Bad signature' }, { status: 401 });
    }
  } else {
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET is not set, accepting unverified events');
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

  // Not one of ours. Resend carries other TDI mail too.
  if (!msg) return NextResponse.json({ ok: true, ignored: 'not a billing message' });

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
