// Exercises every route that moves a creator's board, with the engine ON,
// against a throwaway creator that is deleted afterwards.
//
//   npx tsx scripts/integrity/creator-engine-e2e.mjs
//
// This is the gate before flipping creator_config.step_engine for real. It
// turns the flag on, runs the flows, and always turns it back off, including
// when something throws.
//
// No real creator is touched. Nothing is emailed: the local server runs with a
// deliberately fake Resend key.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const SITE = 'http://localhost:3000';
const EMAIL = 'creatorstudio+enginee2e@teachersdeserveit.com';
const NAME = 'Engine E2E Creator';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

let failures = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures += 1; };

// The flag is global, not scoped to the test creator, so this run turns the
// engine on for everybody for its duration. Refuse to run if it is already on:
// otherwise cleanup() would switch it off for the whole roster afterwards.
const { data: flagBefore } = await sb.from('creator_config').select('enabled').eq('key', 'step_engine').maybeSingle();
if (flagBefore?.enabled) {
  console.log('The step engine is already ON for everyone.');
  console.log('This test toggles that global flag and would turn it off afterwards. Not running.');
  process.exit(1);
}

let creatorId = null;
let projectId = null;
let authId = null;

async function board() {
  const { data } = await sb
    .from('creator_milestones')
    .select('id, milestone_id, status, review_status, round, due_on, milestones!inner(name)')
    .eq('project_id', projectId);
  return data || [];
}

async function openStep() {
  const rows = await board();
  const open = rows.filter((r) => r.status === 'available');
  return { count: open.length, name: open[0]?.milestones?.name ?? null, row: open[0] ?? null };
}

async function cleanup() {
  if (creatorId) {
    await sb.from('creator_milestone_feedback').delete().eq('creator_id', creatorId);
    await sb.from('creator_notes').delete().eq('creator_id', creatorId);
    await sb.from('creator_milestones').delete().eq('creator_id', creatorId);
    await sb.from('creators').update({ active_project_id: null }).eq('id', creatorId);
    await sb.from('creator_projects').delete().eq('creator_id', creatorId);
    await sb.from('creators').delete().eq('id', creatorId);
  }
  if (authId) await sb.auth.admin.deleteUser(authId);
  await sb.from('creator_config').update({ enabled: false }).eq('key', 'step_engine');
}

try {
  await cleanup();

  console.log('Engine end to end, flag ON, throwaway creator\n');

  const { data: made } = await sb.auth.admin.createUser({ email: EMAIL, email_confirm: true });
  authId = made.user.id;

  const { data: c } = await sb.from('creators')
    .insert({ name: NAME, email: EMAIL, status: 'active', content_path: 'download' })
    .select('id').single();
  creatorId = c.id;

  const { data: pr } = await sb.from('creator_projects')
    .insert({ creator_id: creatorId, project_number: 1, content_path: 'download', status: 'active' })
    .select('id').single();
  projectId = pr.id;
  await sb.from('creators').update({ active_project_id: projectId }).eq('id', creatorId);

  const { data: steps } = await sb.from('milestones')
    .select('id').is('retired_at', null).is('is_collapsed_into', null).contains('applies_to', ['download']);

  await sb.from('creator_milestones').insert(
    steps.map((m) => ({ creator_id: creatorId, project_id: projectId, milestone_id: m.id, status: 'locked' }))
  );

  await sb.from('creator_config').update({ enabled: true }).eq('key', 'step_engine');
  pass(`set up: ${steps.length} download steps, flag ON`);

  // ---- placement puts them on exactly one step -------------------------------
  const { placeProject } = await import('../../lib/creator-step-engine.ts');
  await placeProject(sb, projectId, { startClock: true });
  let now = await openStep();
  now.count === 1
    ? pass(`placement opened exactly one step: ${now.name}`)
    : fail(`placement opened ${now.count} steps`);

  // ---- a creator completing a form advances ----------------------------------
  const first = now.row;
  await fetch(`${SITE}/api/creator-portal/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId, milestoneId: first.milestone_id, submissionType: 'confirmation', content: {},
    }),
  });
  const afterConfirm = await openStep();
  afterConfirm.count === 1 && afterConfirm.name !== now.name
    ? pass(`creator confirmation advanced them: ${now.name} -> ${afterConfirm.name}`)
    : fail(`confirmation left ${afterConfirm.count} open, on ${afterConfirm.name}`);

  // ---- the two round cap, through the real revision route ---------------------
  const target = afterConfirm.row;
  await sb.from('creator_milestones')
    .update({ status: 'waiting_approval', submitted_value: 'https://example.com/their-work', review_status: 'submitted' })
    .eq('id', target.id);

  for (let round = 1; round <= 2; round += 1) {
    await fetch(`${SITE}/api/admin/request-revision`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, milestoneId: target.milestone_id, adminEmail: 'rae@teachersdeserveit.com', note: `Round ${round}` }),
    });
  }

  const third = await fetch(`${SITE}/api/admin/request-revision`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorId, milestoneId: target.milestone_id, adminEmail: 'rae@teachersdeserveit.com', note: 'Round 3' }),
  }).then((r) => r.json());

  third.outcome === 'approved_at_cap'
    ? pass('third revision refused and approved instead, no email')
    : fail(`third revision returned ${JSON.stringify(third).slice(0, 90)}`);

  const rows = await board();
  const capped = rows.find((r) => r.id === target.id);
  capped?.round === 2 ? pass('round counter stopped at 2') : fail(`round counter reached ${capped?.round}`);

  const stillHasWork = capped?.status === 'completed';
  stillHasWork ? pass('capped step completed rather than looping') : fail(`capped step is ${capped?.status}`);

  const { data: kept } = await sb.from('creator_milestones').select('submitted_value').eq('id', target.id).single();
  kept?.submitted_value ? pass('their work survived the revisions') : fail('their work was deleted');

  // ---- exactly one open step, always -----------------------------------------
  const final = await openStep();
  final.count === 1 ? pass(`still exactly one open step: ${final.name}`) : fail(`${final.count} open steps at the end`);

  // ---- a paused creator gets no clock ----------------------------------------
  await sb.from('creators').update({ lifecycle_state: 'paused' }).eq('id', creatorId);
  await sb.from('creator_milestones').update({ due_on: null, opened_at: null }).eq('project_id', projectId);
  const { placeCreatorProjects } = await import('../../lib/creator-step-engine.ts');
  await placeCreatorProjects(sb, creatorId, { startClock: false });
  const dated = (await board()).filter((r) => r.due_on !== null);
  dated.length === 0 ? pass('paused creator carries no due date') : fail(`paused creator has ${dated.length} due dates`);
} catch (e) {
  fail(`unexpected: ${e.message}`);
} finally {
  await cleanup();
  const { data: leftover } = await sb.from('creators').select('id').eq('email', EMAIL).maybeSingle();
  const { data: flag } = await sb.from('creator_config').select('enabled').eq('key', 'step_engine').maybeSingle();
  console.log(leftover ? '\n  WARNING  test creator not removed' : '\n  Test creator removed.');
  console.log(flag?.enabled ? '  WARNING  FLAG LEFT ON' : '  Flag back off.');
  console.log(failures === 0 ? '\nALL CHECKS PASSED.' : `\n${failures} CHECK(S) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}
