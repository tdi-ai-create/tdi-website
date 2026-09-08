// Work that exists and reaches nobody.
//
//   npx tsx scripts/integrity/orphaned-work.mjs
//
// tsx rather than node: lib/orphaned-work.ts imports './funding-window-work'
// without a file extension, which Next resolves and Node's TypeScript loader
// refuses to.
//
// Reads only. This is the check nobody had: every dry run tested one job on its
// own, and the failure that reached Bella lived between two of them.

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

const { findOrphanedWork, groupByRule } = await import('../../lib/orphaned-work.ts');

const { findings, errors } = await findOrphanedWork(supabase);

for (const e of errors) console.error(`COULD NOT CHECK  ${e}`);

if (findings.length === 0) {
  console.log('Nothing stranded. Every open item has a party who can do it.');
  process.exit(errors.length === 0 ? 0 : 1);
}

for (const [rule, list] of groupByRule(findings)) {
  console.log(`\n${rule}  (${list.length})`);
  console.log(`  ${list[0].why}`);
  for (const f of list) console.log(`    ${f.where}  ${f.what}`);
}

console.log(`\n${findings.length} stranded item(s) across ${groupByRule(findings).size} rule(s).`);
process.exit(1);
