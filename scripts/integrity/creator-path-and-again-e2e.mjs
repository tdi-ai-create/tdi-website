// The two things the 27 Aug review caught, neither of which was covered before.
//
//   npx tsx scripts/integrity/creator-path-and-again-e2e.mjs
//
// 1. Choosing a path must put the creator on the board for THAT path. The path
//    was written only to creators.content_path while the engine reads
//    creator_projects.content_path, and nothing syncs them. The projects that
//    have a path today were backfilled by hand, so the next creator to choose
//    one would have been placed on a pathless board.
//
// 2. Answering "yes, create again" must leave the new project with an open step.
//    The step update had no project filter, so it marked create_again complete
//    on both projects, and the engine then locked the whole new board.
//
// Throwaway creator, deleted afterwards.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const SITE = 'http://localhost:3000';
const EMAIL = 'creatorstudio+pathtest@teachersdeserveit.com';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

let failures = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures += 1; };

const { data: flagBefore } = await sb.from('creator_config').select('enabled').eq('key', 'step_engine').maybeSingle();
if (flagBefore?.enabled) { console.log('Engine already ON for everyone. Not running.'); process.exit(1); }

let creatorId = null;
let authId = null;

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

async function openOn(projectId) {
  const { data } = await sb
    .from('creator_milestones')
    .select('status, milestones!inner(name)')
    .eq('project_id', projectId)
    .eq('status', 'available');
  return { count: data?.length ?? 0, name: data?.[0]?.milestones?.name ?? null };
}

try {
  await cleanup();
  console.log('Path selection and create-again, flag ON\n');

  const { data: made } = await sb.auth.admin.createUser({ email: EMAIL, email_confirm: true });
  authId = made.user.id;

  // A creator who has NOT chosen a path, which is where Celia, Denis, Keelie
  // and Nancy are sitting right now.
  const { data: c } = await sb.from('creators')
    .insert({ name: 'Path Test Creator', email: EMAIL, status: 'active' })
    .select('id').single();
  creatorId = c.id;

  const { data: p1 } = await sb.from('creator_projects')
    .insert({ creator_id: creatorId, project_number: 1, status: 'active' })
    .select('id').single();
  await sb.from('creators').update({ active_project_id: p1.id }).eq('id', creatorId);

  const { data: all } = await sb.from('milestones')
    .select('id').is('retired_at', null).is('is_collapsed_into', null);
  await sb.from('creator_milestones').insert(
    all.map((m) => ({ creator_id: creatorId, project_id: p1.id, milestone_id: m.id, status: 'locked' }))
  );
  await sb.from('creator_config').update({ enabled: true }).eq('key', 'step_engine');

  const { placeProject } = await import('../../lib/creator-step-engine.ts');
  await placeProject(sb, p1.id, { startClock: true });
  pass('set up: creator with no path chosen');

  // ---- 1. choose COURSE -------------------------------------------------------
  await fetch(`${SITE}/api/creator-portal/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId, milestoneId: 'content_path_selection',
      submissionType: 'path_selection', content: { selected_path: 'course' },
    }),
  });

  const { data: projAfter } = await sb.from('creator_projects').select('content_path').eq('id', p1.id).single();
  projAfter?.content_path === 'course'
    ? pass('the path was written to the PROJECT, which is what the engine reads')
    : fail(`project path is ${projAfter?.content_path ?? 'still empty'}, engine would use the wrong board`);

  const afterPath = await openOn(p1.id);
  afterPath.count === 1
    ? pass(`placed on one course step: ${afterPath.name}`)
    : fail(`${afterPath.count} open steps after choosing a path`);

  const { data: journeyRes } = await fetch(`${SITE}/api/creator-portal/dashboard`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL }),
  }).then((r) => r.json()).then((d) => ({ data: d }));

  const j = journeyRes?.journey;
  j?.path === 'course' && j.stages.length === 8
    ? pass(`their journey renders: course, ${j.stages.length} stages, ${j.totalSteps} steps`)
    : fail(`journey came back as ${j?.path ?? 'null'} with ${j?.stages?.length ?? 0} stages`);

  // ---- 2. blog must be refused ------------------------------------------------
  const blogTry = await fetch(`${SITE}/api/creator-portal/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId, milestoneId: 'content_path_selection',
      submissionType: 'path_selection', content: { selected_path: 'blog' },
    }),
  });
  blogTry.status === 400 ? pass('the retired blog path is refused') : fail(`blog accepted with HTTP ${blogTry.status}`);

  // ---- 3. create again leaves the NEW project workable ------------------------
  const rows = await sb.from('creator_milestones').select('id, milestone_id').eq('project_id', p1.id);
  const done = rows.data.filter((r) => r.milestone_id !== 'create_again').map((r) => r.id);
  await sb.from('creator_milestones').update({ status: 'completed', completed_at: new Date().toISOString() }).in('id', done);
  await sb.from('creator_milestones').update({ status: 'available' })
    .eq('project_id', p1.id).eq('milestone_id', 'create_again');

  await fetch(`${SITE}/api/creator-portal/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId, milestoneId: 'create_again',
      submissionType: 'create_again_choice', content: { choice: 'yes' },
    }),
  });

  const { data: projects } = await sb.from('creator_projects')
    .select('id, project_number').eq('creator_id', creatorId).order('project_number');

  if (projects.length !== 2) {
    fail(`expected 2 projects after saying yes, found ${projects.length}`);
  } else {
    pass('a second project was created');
    const second = await openOn(projects[1].id);
    second.count === 1
      ? pass(`the new project has an open step: ${second.name}`)
      : fail(`the new project has ${second.count} open steps, so they are stuck`);
  }
} catch (e) {
  fail(`unexpected: ${e.message}`);
} finally {
  await cleanup();
  const { data: left } = await sb.from('creators').select('id').eq('email', EMAIL).maybeSingle();
  const { data: flag } = await sb.from('creator_config').select('enabled').eq('key', 'step_engine').maybeSingle();
  console.log(left ? '\n  WARNING  test creator not removed' : '\n  Test creator removed.');
  console.log(flag?.enabled ? '  WARNING  FLAG LEFT ON' : '  Flag back off.');
  console.log(failures === 0 ? '\nALL CHECKS PASSED.' : `\n${failures} CHECK(S) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}
