// Asks every live project the one question the journey could not answer before:
// is anything open that the road is not allowed to draw?
//
//   npx tsx scripts/integrity/creator-stranded-steps.mjs
//
// tsx rather than node, unlike its neighbours in this folder. creator-journey.ts
// imports './creator-phases' without a file extension, which is fine for Next
// and which Node's own TypeScript loader refuses to resolve. Running it with
// plain node fails with ERR_MODULE_NOT_FOUND on that import, not on anything
// this script did wrong.
//
// Reads only. The point is to prove that a board reporting "nothing open" is
// actually finished, rather than hiding a retired, collapsed, off path or
// unmapped step behind that sentence. On 2 September a retired step was opened
// on Catherine Dorian's project, and her page and her portal both read "every
// applicable step is finished" until this was written.

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

const { getJourney } = await import('../../lib/creator-journey.ts');

const { data: projects, error } = await supabase
  .from('creator_projects')
  .select('id, creator_id, content_path, status')
  .neq('status', 'cancelled');

if (error) {
  console.error('Could not load projects:', error.message);
  process.exit(1);
}

const { data: creators } = await supabase
  .from('creators')
  .select('id, name, status, lifecycle_state');

const nameOf = new Map((creators ?? []).map((c) => [c.id, c]));

let stranded = 0;
let finished = 0;
let working = 0;
let noJourney = 0;

for (const p of projects) {
  const c = nameOf.get(p.creator_id);
  if (c?.status !== 'active') continue;

  const journey = await getJourney(supabase, p.id);
  if (!journey) {
    noJourney += 1;
    console.log(`NO JOURNEY  ${c.name} (${p.id})`);
    continue;
  }

  if (journey.openStep) {
    working += 1;
    continue;
  }

  if (journey.strandedOpen > 0) {
    stranded += 1;
    console.log(
      `STRANDED    ${c.name}: reports nothing open while ${journey.strandedOpen} ` +
        `step(s) are open off the road: ${journey.strandedNames.join(', ')}`
    );
    continue;
  }

  finished += 1;
  console.log(`FINISHED    ${c.name}: genuinely nothing open`);
}

console.log(
  `\n${working} on a step, ${finished} genuinely finished, ` +
    `${stranded} reporting finished while not finished, ${noJourney} with no journey.`
);

if (stranded > 0) {
  console.log('\nA stranded board is repaired by placement. Run the sweep:');
  console.log('  curl -H "Authorization: Bearer $CRON_SECRET" \\');
  console.log('    "https://www.teachersdeserveit.com/api/cron/creator-board-sweep?dryRun=1"');
}
