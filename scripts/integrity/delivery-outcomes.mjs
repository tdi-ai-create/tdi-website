// What actually happened to the creator mail we sent.
//
//   npx tsx scripts/integrity/delivery-outcomes.mjs
//
// Reads only. Answers the question creator_email_log could not answer until
// migration 140: not "did we send", but "did it arrive".
//
// Exists because /api/webhooks/resend was written for invoices, was correct, and
// had recorded zero events since the day it shipped. Nothing noticed, because a
// component that silently does nothing looks exactly like one with nothing to do.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const since = new Date(Date.now() - 30 * 86400000).toISOString();

const { data: mail, error } = await supabase
  .from('creator_email_log')
  .select('creator_name, creator_email, category, subject, sent_at, provider_id, last_event, delivered_at, bounced_at, bounce_reason, complained_at, opened_at')
  .eq('dry_run', false)
  .gte('sent_at', since)
  .order('sent_at', { ascending: false });

if (error) {
  console.error('Could not read the log:', error.message);
  process.exit(1);
}

const real = mail ?? [];
const withId = real.filter((r) => r.provider_id);
const withEvent = real.filter((r) => r.last_event);
const delivered = real.filter((r) => r.delivered_at);
const bounced = real.filter((r) => r.bounced_at);
const complained = real.filter((r) => r.complained_at);

console.log(`Real creator emails in the last 30 days: ${real.length}`);
console.log(`  message id recorded at send time:      ${withId.length}`);
console.log(`  any outcome received back:             ${withEvent.length}`);
console.log(`    delivered:                           ${delivered.length}`);
console.log(`    bounced:                             ${bounced.length}`);
console.log(`    reported as spam:                    ${complained.length}`);

if (bounced.length) {
  console.log('\nNever arrived. These people have not been ignoring us:');
  for (const b of bounced) {
    console.log(`  ${b.creator_name || b.creator_email}  "${b.subject}"`);
    console.log(`    ${b.bounce_reason ?? 'no reason given'}`);
  }
}

// The honest read on whether the pipe is connected, rather than an assumption.
console.log('');
if (real.length < 3) {
  console.log('Too few real sends to judge whether delivery tracking is working.');
} else if (withId.length === 0) {
  console.log('DARK: no send site is recording the Resend message id. No outcome can ever be matched.');
} else if (withEvent.length === 0) {
  console.log('DARK: ids are recorded but nothing is coming back.');
  console.log('Resend is not reaching /api/webhooks/resend. Check RESEND_WEBHOOK_SECRET is set');
  console.log('in Vercel and the endpoint is configured in the Resend dashboard.');
} else {
  console.log(`Delivery tracking is live: ${withEvent.length} of ${withId.length} tracked sends have reported back.`);
}

// Anyone we must stop writing to. This is what the contact gate now enforces.
const dead = new Set();
for (const r of [...bounced, ...complained]) if (r.creator_email) dead.add(r.creator_email.toLowerCase());
if (dead.size) {
  console.log(`\n${dead.size} address${dead.size === 1 ? '' : 'es'} the contact gate will now refuse to write to:`);
  for (const d of dead) console.log(`  ${d}`);
}
