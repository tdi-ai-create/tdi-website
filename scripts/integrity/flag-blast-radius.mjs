// What flipping creator_config.step_engine would actually do to the real roster.
//
//   npx tsx scripts/integrity/flag-blast-radius.mjs
//
// Reads only. Never turns the flag on.
//
// The question this answers is not "does the engine work", which is proven
// elsewhere. It is "does turning it on move anybody by itself". If placement is
// already idempotent for every live project, flipping the flag changes nothing
// until a person or a creator takes an action, and that is what makes it safe.

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

const { placeProject } = await import('../../lib/creator-step-engine.ts');

const { data: flag } = await sb.from('creator_config').select('enabled').eq('key', 'step_engine').maybeSingle();
console.log(`Flag is currently: ${flag?.enabled ? 'ON' : 'OFF'}\n`);

const { data: creators } = await sb
  .from('creators')
  .select('id, name, lifecycle_state')
  .eq('status', 'active');
const byId = new Map(creators.map((c) => [c.id, c]));

const { data: projects } = await sb
  .from('creator_projects')
  .select('id, creator_id, project_number')
  .in('creator_id', creators.map((c) => c.id));

const rows = [];
let wouldMove = 0;

for (const p of projects) {
  const c = byId.get(p.creator_id);
  const paused = (c.lifecycle_state ?? 'active') === 'paused';

  // What is open right now.
  const { data: openNow } = await sb
    .from('creator_milestones')
    .select('id, milestones!inner(name)')
    .eq('project_id', p.id)
    .eq('status', 'available');

  const current = openNow?.[0]?.milestones?.name ?? null;
  const currentCount = openNow?.length ?? 0;

  // What the engine would choose, without writing.
  const would = await placeProject(sb, p.id, { dryRun: true, startClock: !paused });
  const target = would.openStep?.name ?? null;

  const moves = current !== target || currentCount !== (target ? 1 : 0);
  if (moves) wouldMove += 1;

  rows.push({
    creator: c.name.trim(),
    proj: p.project_number,
    open_now: currentCount === 0 ? '(closed)' : currentCount > 1 ? `${currentCount} OPEN` : current,
    engine_would_open: target ?? '(closes)',
    changes: moves ? 'YES' : 'no',
  });
}

rows.sort((a, b) => (a.changes === b.changes ? a.creator.localeCompare(b.creator) : a.changes === 'YES' ? -1 : 1));
console.table(rows);

console.log(`\nProjects checked: ${rows.length}`);
console.log(`Projects the engine would move: ${wouldMove}`);
console.log(
  wouldMove === 0
    ? '\nFlipping the flag moves nobody. The engine agrees with the board as it stands,\nso nothing changes until a creator or an admin takes an action.'
    : `\nFlipping the flag would move ${wouldMove} project(s). Read the rows above before flipping.`
);
console.log('\nRows written this run: 0');
