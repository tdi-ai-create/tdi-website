// Places every active creator on exactly one step, using the real engine.
//
//   npx tsx scripts/integrity/creator-place-all.mjs            dry run, writes nothing
//   npx tsx scripts/integrity/creator-place-all.mjs --commit   writes, after snapshotting
//
// Paused creators get a correct board and NO clock. Repairing a board and
// starting a deadline are two different things, and a paused creator waking to
// an overdue step is the reason step reminders are still off.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const COMMIT = process.argv.includes('--commit');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { placeProject } = await import('../../lib/creator-step-engine.ts');

const { data: creators, error: cErr } = await sb
  .from('creators')
  .select('id, name, status, lifecycle_state')
  .eq('status', 'active');
if (cErr) { console.error('could not load creators:', cErr.message); process.exit(1); }

const byId = new Map(creators.map((c) => [c.id, c]));

const { data: projects, error: pErr } = await sb
  .from('creator_projects')
  .select('id, creator_id, project_number, content_path')
  .in('creator_id', creators.map((c) => c.id));
if (pErr) { console.error('could not load projects:', pErr.message); process.exit(1); }

if (COMMIT) {
  // The snapshot is taken in SQL before this runs. Restoring from it needs two
  // passes, because set_step_clock re-stamps dates on any transition into
  // available, so a single restore leaves due dates behind.
  console.log('COMMIT MODE. Writing.\n');
} else {
  console.log('DRY RUN. Nothing will be written.\n');
}

const rows = [];
for (const p of projects) {
  const c = byId.get(p.creator_id);
  const paused = (c.lifecycle_state ?? 'active') === 'paused';

  const result = await placeProject(sb, p.id, { dryRun: !COMMIT, startClock: !paused });

  rows.push({
    creator: c.name.trim(),
    state: paused ? 'paused' : 'active',
    proj: p.project_number,
    lands_on: result.openStep ? result.openStep.name : (result.ok ? 'board closes' : 'ERROR'),
    locked: result.locked,
    clock: paused ? 'off (paused)' : (result.openStep ? 'on' : '-'),
    error: result.error ?? '',
  });
}

rows.sort((a, b) => a.state.localeCompare(b.state) || a.creator.localeCompare(b.creator));
console.table(rows);

const failed = rows.filter((r) => r.error);
console.log(`\nProjects: ${rows.length}   Errors: ${failed.length}`);
console.log(COMMIT ? 'Rows were written.' : 'Rows written this run: 0');
