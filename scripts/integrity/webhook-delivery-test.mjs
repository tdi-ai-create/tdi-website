// Proves /api/webhooks/resend actually records what happened to a creator email.
//
//   npm run dev            (in another terminal, with RESEND_WEBHOOK_SECRET set)
//   npx tsx scripts/integrity/webhook-delivery-test.mjs
//
// WRITES. Inserts one sandbox log row, posts real signed events at it, reads
// back what landed, then deletes the row. It never touches a real creator's mail:
// the row it creates carries a provider id of its own making.
//
// This exists because the billing half of this webhook shipped correct and dark,
// and nobody found out for months. Reading the code proves it compiles. Only
// posting a signed event at it proves it works.

import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const BASE = process.env.WEBHOOK_TEST_URL || 'http://localhost:3000';
const SECRET = process.env.RESEND_WEBHOOK_SECRET;

if (!SECRET) {
  console.error('RESEND_WEBHOOK_SECRET is not set here, so no event can be signed.');
  console.error('Set it in .env.local to the same value the running server uses, then rerun.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PROVIDER_ID = `test-${process.env.WEBHOOK_TEST_ID || 'delivery-check'}`;
const wh = new Webhook(SECRET);

let seq = 0;

async function post(type, data) {
  // Signed with the current time on purpose: svix rejects anything outside a
  // few minutes of now, so a fixed timestamp here would fail for a reason that
  // has nothing to do with the route being correct.
  const now = new Date();
  const payload = JSON.stringify({ type, created_at: now.toISOString(), data });
  const msgId = `msg_${type.replace(/\W/g, '')}_${seq++}`;

  // sign() returns the signature value alone, not the header set.
  const signature = wh.sign(msgId, now, payload);

  const res = await fetch(`${BASE}/api/webhooks/resend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'svix-id': msgId,
      'svix-timestamp': String(Math.floor(now.getTime() / 1000)),
      'svix-signature': signature,
    },
    body: payload,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function row() {
  const { data } = await supabase
    .from('creator_email_log')
    .select('last_event, delivered_at, bounced_at, bounce_reason')
    .eq('provider_id', PROVIDER_ID)
    .maybeSingle();
  return data;
}

// --- clean slate ------------------------------------------------------------
await supabase.from('creator_email_log').delete().eq('provider_id', PROVIDER_ID);

const { error: insErr } = await supabase.from('creator_email_log').insert({
  creator_name: 'Webhook Test',
  creator_email: 'webhook-test@teachersdeserveit.com',
  direction: 'to_creator',
  category: 'integrity_test',
  subject: 'Delivery tracking test',
  sent_by: 'script:webhook-delivery-test',
  dry_run: false,
  provider_id: PROVIDER_ID,
});
if (insErr) { console.error('Could not create the test row:', insErr.message); process.exit(1); }

let failures = 0;
const check = (label, pass, detail) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!pass) failures++;
};

// --- an unsigned event must be refused --------------------------------------
const unsigned = await fetch(`${BASE}/api/webhooks/resend`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'email.delivered', data: { email_id: PROVIDER_ID } }),
});
check('an unsigned event is rejected', unsigned.status === 401, `status ${unsigned.status}`);

// --- delivered ---------------------------------------------------------------
const d = await post('email.delivered', { email_id: PROVIDER_ID, to: ['webhook-test@teachersdeserveit.com'] });
check('a signed delivered event is accepted', d.status === 200, `status ${d.status}`);
check('it was matched to the creator row', d.body?.recorded === 'email.delivered', JSON.stringify(d.body));
const afterDelivered = await row();
check('delivered_at was written', Boolean(afterDelivered?.delivered_at), String(afterDelivered?.delivered_at));

// --- bounced -----------------------------------------------------------------
const b = await post('email.bounced', {
  email_id: PROVIDER_ID,
  to: ['webhook-test@teachersdeserveit.com'],
  bounce: { message: 'Mailbox does not exist' },
});
check('a signed bounce is accepted', b.status === 200, `status ${b.status}`);
const afterBounce = await row();
check('bounced_at was written', Boolean(afterBounce?.bounced_at));
check('the reason was kept', afterBounce?.bounce_reason === 'Mailbox does not exist', String(afterBounce?.bounce_reason));

// --- an event for a message that is not ours ---------------------------------
const stranger = await post('email.delivered', { email_id: 'not-a-tdi-message-at-all' });
check('an unknown message is ignored, not errored', stranger.status === 200 && stranger.body?.ignored, JSON.stringify(stranger.body));

// --- the contact gate must now refuse this address ---------------------------
const { loadContactGate } = await import('../../lib/creator-contact-budget.ts');
const gate = await loadContactGate(supabase);
const verdict = gate.may('webhook-test@teachersdeserveit.com');
// Asserting on the reason, not just on ok===false. This address has also never
// signed in, so the fortnight rule would hold it anyway and a bare ok===false
// would pass even if the bounce rule did nothing at all.
check(
  'a bounced address is held by the contact gate, for the bounce',
  verdict.ok === false && /bounced/i.test(verdict.reason ?? ''),
  verdict.reason
);
const forced = gate.may('webhook-test@teachersdeserveit.com', { deliberate: true });
check('a bounced address is held even on a deliberate send', forced.ok === false);

// --- tidy up -----------------------------------------------------------------
await supabase.from('creator_email_log').delete().eq('provider_id', PROVIDER_ID);
const { data: leftover } = await supabase
  .from('creator_email_log').select('id').eq('provider_id', PROVIDER_ID);
check('the test row was removed', (leftover ?? []).length === 0);

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
