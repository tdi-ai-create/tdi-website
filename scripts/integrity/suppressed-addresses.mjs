// Who is on Resend's suppression list, and what have we been recording as sent
// to them.
//
//   npx tsx scripts/integrity/suppressed-addresses.mjs
//
// Reads only.
//
// A suppressed address is one Resend refuses to send to, normally after a hard
// bounce. Our code cannot see that: the API still answers 200, the send site
// records a row, and every report says the message went. It did not leave the
// building.
//
// Paste the list from https://resend.com/emails/suppressions below. There is no
// public API for it, so this is deliberately a hand-fed list with the date it
// was taken, rather than something that silently goes stale pretending to be live.

const CAPTURED_ON = '8 September 2026';

const SUPPRESSED = [
  'ycasillas@asd4.org', 'nluna@asd4.org', 'mperez@asd4.org', 'emartinez@asd4.org',
  'xvazquez@asd4.org', 'hmirela@asd4.org', 'lhawkins@asd4.org', 'mgarcia@asd4.org',
  'kcruz@asd4.org', 'achaudry@asd4.org', 'nanweiler-stanford@asd4.org',
  'test2@teachersdeserveit.com', 'jesica.bigos@lodi.k12.nj.us',
  'schaka@hamilton.k12.wi.us', 'alexander.summerlot@pgcps.org',
  'samunoz@dallasisd.org', 'demo.creator@teachersdeserveit.com',
  'ppoche@stpeterchanel.org', 'mmahaney@tccs.org', 'porter@pgcps.org',
  'ehubbard@marcellusschools.org', 'caine.vanessa@ryeschools.org',
  'adokken@isd1.org', 'acheron@dleacs.org', 'apoag@mauryk12.org',
  'ccummings@lakelandschools.org', 'cynthia.randolph@sumter.k12.fl.us',
  'cfugazi@stocktonusd.net', 'cpovall@htps.us', 'bmueller@newfieldschools.org',
  'christopher.bone@vbschools.com', 'cathleen.collazo@southbronxcommunity.org',
  'cmiller@atlanta.k12.ga.us', 'mobrien@smithtec.org', 'cgraber@garwoodschools.org',
  'dcappuccio@buena.k12.nj.us', 'dwinner@ldsd.org', 'dvaldivia@dist50.net',
  'dnehlsen@malverne.k12.ny.us', 'marquisseet@crcsd.org',
];

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const set = new Set(SUPPRESSED.map((e) => e.toLowerCase()));

console.log(`${SUPPRESSED.length} addresses on the Resend suppression list, captured ${CAPTURED_ON}.`);
console.log('Resend refuses to send to these. Our code cannot see it: the API still answers 200.\n');

// By domain, because the shape of the damage is per organisation.
const byDomain = new Map();
for (const e of set) {
  const d = e.split('@')[1];
  byDomain.set(d, (byDomain.get(d) ?? 0) + 1);
}
console.log('By domain:');
for (const [d, n] of [...byDomain.entries()].sort((a, b) => b[1] - a[1])) {
  if (n > 1) console.log(`  ${n}  ${d}`);
}
console.log(`  (and ${[...byDomain.values()].filter((n) => n === 1).length} domains with one each)\n`);

// --- Who are they to us -----------------------------------------------------

async function lookup(table, emailCol, label, extra = '') {
  const { data, error } = await sb.from(table).select(`${emailCol}${extra}`);
  if (error) {
    console.log(`${label}: could not read (${error.message})`);
    return [];
  }
  const hits = (data ?? []).filter((r) => {
    const v = r[emailCol];
    return v && set.has(String(v).trim().toLowerCase());
  });
  console.log(`${label}: ${hits.length} of ${SUPPRESSED.length} suppressed addresses appear here`);
  return hits;
}

const creators = await lookup('creators', 'email', 'creators', ', name, status');
for (const c of creators) console.log(`    ${c.name} (${c.status}) ${c.email}`);

await lookup('partner_educators', 'email', 'partner_educators');
await lookup('sales_leads', 'email', 'sales_leads');

// --- What we told ourselves we sent them ------------------------------------

const { data: log, error: logErr } = await sb
  .from('creator_email_log')
  .select('creator_email, subject, sent_at')
  .eq('dry_run', false);

if (logErr) {
  console.log(`\ncreator_email_log: could not read (${logErr.message})`);
} else {
  const wasted = (log ?? []).filter(
    (r) => r.creator_email && set.has(r.creator_email.trim().toLowerCase())
  );
  console.log(`\ncreator_email_log rows recorded as really sent to a suppressed address: ${wasted.length}`);
  const perPerson = new Map();
  for (const r of wasted) {
    const k = r.creator_email.toLowerCase();
    perPerson.set(k, (perPerson.get(k) ?? 0) + 1);
  }
  for (const [who, n] of [...perPerson.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${n} email${n === 1 ? '' : 's'} recorded to ${who}, none of which left Resend`);
  }
}

console.log('\nA suppressed address cannot be fixed by sending again. Somebody has to');
console.log('get a working address, or ask Resend to remove the suppression once the');
console.log('mailbox is known good.');
