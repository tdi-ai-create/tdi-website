// What the board offers for a filed grant, run against production data.
//
//   npx tsx scripts/integrity/next-actions-check.mjs
//
// Reads only. Written for Allenwood's NEA card, which Bella screenshotted
// asking what should come after "approved". The answer was nothing.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { computeNextActions } = await import('../../lib/funding-next-actions.ts');

const PURSUIT = process.argv[2] ?? 'b69c6219-0e41-4717-9c7a-94dfe8e4570e'; // Allenwood

const [{ data: pursuit }, { data: opps }, { data: actions }, { data: gate }, { data: allocations }] =
  await Promise.all([
    sb.from('funding_pursuits').select('*').eq('id', PURSUIT).single(),
    sb.from('funding_opportunities').select('*').eq('pursuit_id', PURSUIT),
    sb.from('funding_action_items').select('*').eq('pursuit_id', PURSUIT),
    sb.from('pursuit_gate').select('*').eq('pursuit_id', PURSUIT).maybeSingle(),
    sb.from('funding_allocations').select('*').eq('pursuit_id', PURSUIT),
  ]);

const filed = (opps ?? []).filter(
  (o) => o.client_submitted === true || ['applied', 'submitted'].includes(o.status)
);

console.log(`${pursuit.pursuit_name}`);
console.log(`Filed grants: ${filed.length}`);
for (const f of filed) console.log(`  ${f.name}  [${f.status}]`);

const next = computeNextActions(pursuit, opps ?? [], actions ?? [], gate, allocations ?? []);

const relevant = next.filter((a) => filed.some((f) => f.id === a.targetId));
console.log(`\nWhat the board now says about those:`);
if (relevant.length === 0) console.log('  nothing, which is the bug');
for (const a of relevant) {
  console.log(`  [${a.urgency}] ${a.label}`);
  console.log(`     ${a.why}`);
}
