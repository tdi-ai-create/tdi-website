// Runs the real placement engine in dry run against every live project and
// prints where each creator would land. Writes nothing.
//
//   node scripts/integrity/creator-placement-dryrun.mjs
//
// The point is not that the code compiles. It is that the step it chooses for
// each of the twenty one creators is the step a person would agree with.

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

const { placeProject } = await import('../../lib/creator-step-engine.ts');

// Joined in JS rather than embedded: creators references creator_projects twice
// (creator_id and active_project_id) so PostgREST cannot pick a relationship.
const { data: creators, error: cErr } = await supabase
  .from('creators')
  .select('id, name, status, lifecycle_state')
  .eq('status', 'active');

if (cErr) {
  console.error('Could not load creators:', cErr.message);
  process.exit(1);
}

const byId = new Map(creators.map((c) => [c.id, c]));

const { data: projects, error } = await supabase
  .from('creator_projects')
  .select('id, creator_id, project_number, content_path')
  .in('creator_id', creators.map((c) => c.id));

if (error) {
  console.error('Could not load projects:', error.message);
  process.exit(1);
}

const rows = [];
for (const p of projects) {
  p.creators = byId.get(p.creator_id);
  const paused = (p.creators.lifecycle_state ?? 'active') === 'paused';
  const result = await placeProject(supabase, p.id, { dryRun: true, startClock: !paused });
  rows.push({
    creator: p.creators.name.trim(),
    state: paused ? 'paused' : 'active',
    proj: p.project_number,
    path: p.content_path ?? '(none)',
    lands_on: result.openStep ? result.openStep.name : (result.ok ? 'BOARD CLOSES (finished)' : 'ERROR'),
    would_lock: result.locked,
    error: result.error ?? '',
  });
}

rows.sort((a, b) => a.state.localeCompare(b.state) || a.creator.localeCompare(b.creator));
console.table(rows);

const writes = rows.filter((r) => r.error);
console.log(`\nProjects evaluated: ${rows.length}`);
console.log(`Errors: ${writes.length}`);
console.log('Rows written this run: 0');
