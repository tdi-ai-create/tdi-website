// What the contact gate would say about every active creator, right now.
//
//   npx tsx scripts/integrity/contact-budget-check.mjs
//
// Reads only. Exists because a cron's dry run can only prove the gate on a day
// that cron happens to be sending, and the decision is worth checking on any
// day. Fourteen active creators have never signed in and some have had ten
// emails in ninety days.

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

const { loadContactGate } = await import('../../lib/creator-contact-budget.ts');

const gate = await loadContactGate(supabase);

const { data: creators } = await supabase
  .from('creators')
  .select('name, email, status')
  .eq('status', 'active')
  .order('name');

let held = 0;
let allowed = 0;

for (const c of creators ?? []) {
  const v = gate.may(c.email);
  if (v.ok) {
    allowed += 1;
  } else {
    held += 1;
    console.log(`HELD     ${c.name}`);
    console.log(`         ${v.reason}`);
  }
}

console.log(`\n${allowed} would be allowed, ${held} held back.`);
console.log(`${gate.signedInCount} accounts across the whole project have ever signed in.`);
console.log('\nAn admin pressing send is never held: gate.may(email, { deliberate: true }).');

// Prove the deliberate escape hatch actually works, rather than asserting it.
const firstHeld = (creators ?? []).find((c) => !gate.may(c.email).ok);
if (firstHeld) {
  const forced = gate.may(firstHeld.email, { deliberate: true });
  console.log(`Checked on ${firstHeld.name}: deliberate send allowed = ${forced.ok}`);
}
