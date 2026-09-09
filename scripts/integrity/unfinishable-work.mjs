// Work a person could not finish if they opened it right now.
//
//   npx tsx scripts/integrity/unfinishable-work.mjs
//
// Reads only. Exists because every other check in this repo tests a property of
// the code or the state of the data, and none of them asks whether a person can
// actually complete what is in front of them. Bella has been that check, in
// production, one item at a time.

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

const { findUnfinishableWork, groupUnfinishable } = await import('../../lib/unfinishable-work.ts');

const { findings, errors } = await findUnfinishableWork(supabase);

for (const e of errors) console.log(`RULE FAILED: ${e}`);

if (findings.length === 0) {
  console.log('Nothing open that a person could not finish.');
  process.exit(0);
}

for (const [rule, items] of groupUnfinishable(findings)) {
  console.log(`\n${rule}  (${items.length})`);
  console.log(`  ${items[0].why}`);
  for (const i of items) console.log(`    ${i.what}`);
}

console.log(`\n${findings.length} item(s) a person could not finish, across ${groupUnfinishable(findings).size} rule(s).`);
