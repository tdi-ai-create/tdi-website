// Proves a creator can actually get in, end to end, before anyone is emailed.
//
//   npx tsx scripts/integrity/creator-login-e2e.mjs
//
// Uses a throwaway creator built for this and deleted afterwards, so no real
// creator's last_sign_in_at is falsified by our own test. The account is made
// through the GoTrue Admin API, never by SQL, because a direct insert leaves
// instance_id and the token columns NULL and breaks every sign-in silently.
//
// What it actually checks, in order:
//   1. an account can be created the way the product creates one
//   2. generateLink mints a link
//   3. following that link VERIFIES, rather than bouncing to an error
//   4. the sign in is real: last_sign_in_at moves from null to a timestamp
//   5. the dashboard returns a journey for them, which is what they land on

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const SITE = process.argv.includes('--live')
  ? 'https://www.teachersdeserveit.com'
  : 'http://localhost:3000';

const TEST_EMAIL = 'creatorstudio+enginetest@teachersdeserveit.com';
const TEST_NAME = 'Engine Test Creator';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures += 1; };
let failures = 0;
let authUserId = null;
let creatorId = null;
let projectId = null;

console.log(`Testing the creator login flow against ${SITE}\n`);

try {
  // ---- clean any leftover from a previous run --------------------------------
  {
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const old = data.users.find((u) => u.email === TEST_EMAIL);
    if (old) await sb.auth.admin.deleteUser(old.id);
    const { data: oldCreator } = await sb.from('creators').select('id').eq('email', TEST_EMAIL).maybeSingle();
    if (oldCreator) {
      await sb.from('creator_milestones').delete().eq('creator_id', oldCreator.id);
      await sb.from('creator_projects').delete().eq('creator_id', oldCreator.id);
      await sb.from('creators').delete().eq('id', oldCreator.id);
    }
  }

  // ---- 1. create the account the way the product does ------------------------
  const { data: created, error: createError } = await sb.auth.admin.createUser({
    email: TEST_EMAIL,
    email_confirm: true,
  });
  if (createError) { fail(`could not create the test account: ${createError.message}`); throw new Error('stop'); }
  authUserId = created.user.id;
  pass('account created through the Admin API');

  const { data: creator, error: creatorError } = await sb
    .from('creators')
    .insert({ name: TEST_NAME, email: TEST_EMAIL, status: 'active', content_path: 'download' })
    .select('id')
    .single();
  if (creatorError) { fail(`could not create the test creator: ${creatorError.message}`); throw new Error('stop'); }
  creatorId = creator.id;

  const { data: project, error: projectError } = await sb
    .from('creator_projects')
    .insert({ creator_id: creatorId, project_number: 1, content_path: 'download', status: 'active' })
    .select('id')
    .single();
  if (projectError) { fail(`could not create the test project: ${projectError.message}`); throw new Error('stop'); }
  projectId = project.id;

  const { data: steps } = await sb
    .from('milestones')
    .select('id')
    .is('retired_at', null)
    .is('is_collapsed_into', null)
    .contains('applies_to', ['download']);

  const { error: seedError } = await sb.from('creator_milestones').insert(
    steps.map((m, i) => ({
      creator_id: creatorId,
      project_id: projectId,
      milestone_id: m.id,
      status: i === 0 ? 'available' : 'locked',
    }))
  );
  if (seedError) { fail(`could not seed the board: ${seedError.message}`); throw new Error('stop'); }
  pass(`board seeded, ${steps.length} steps on the download path`);

  // ---- 2. mint the link ------------------------------------------------------
  const { data: linkData, error: linkError } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email: TEST_EMAIL,
    options: { redirectTo: `${SITE}/creator-portal/dashboard` },
  });
  if (linkError || !linkData?.properties?.action_link) {
    fail(`generateLink failed: ${linkError?.message ?? 'no link'}`);
    throw new Error('stop');
  }
  const link = linkData.properties.action_link;
  pass('sign in link minted');

  // ---- 3. follow it, and see whether it verifies -----------------------------
  const res = await fetch(link, { redirect: 'manual' });
  const location = res.headers.get('location') || '';
  const isError = /error|otp_expired|access_denied/i.test(location);
  const hasToken = /access_token=|code=/.test(location);

  if (res.status >= 300 && res.status < 400 && hasToken && !isError) {
    pass(`link verified, redirected with a session (HTTP ${res.status})`);
  } else if (isError) {
    fail(`link bounced to an error: ${location.slice(0, 120)}`);
  } else {
    fail(`unexpected response: HTTP ${res.status} -> ${location.slice(0, 120) || '(no location)'}`);
  }

  // ---- 4. did the sign in actually happen ------------------------------------
  const { data: after } = await sb.auth.admin.getUserById(authUserId);
  if (after?.user?.last_sign_in_at) {
    pass(`sign in recorded (${after.user.last_sign_in_at})`);
  } else {
    fail('the link verified but no sign in was recorded');
  }

  // ---- 5. what they land on --------------------------------------------------
  const dashRes = await fetch(`${SITE}/api/creator-portal/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL }),
  });
  const dash = await dashRes.json();

  if (!dashRes.ok) {
    fail(`the dashboard refused them: ${dash.error}`);
  } else if (!dash.journey) {
    fail('the dashboard loaded but built no journey');
  } else {
    pass(`dashboard loaded: ${dash.journey.stages.length} stages, open step "${dash.journey.openStep?.name}"`);
    if (dash.journey.openStepAction?.action_type) {
      pass(`the open step has a working control (${dash.journey.openStepAction.action_type})`);
    } else {
      fail('the open step has no action type, so nothing would render');
    }
  }
} catch (e) {
  if (e.message !== 'stop') fail(`unexpected: ${e.message}`);
} finally {
  // ---- clean up, always ------------------------------------------------------
  if (creatorId) {
    await sb.from('creator_milestones').delete().eq('creator_id', creatorId);
    await sb.from('creator_projects').delete().eq('creator_id', creatorId);
    await sb.from('creators').delete().eq('id', creatorId);
  }
  if (authUserId) await sb.auth.admin.deleteUser(authUserId);

  const { data: check } = await sb.from('creators').select('id').eq('email', TEST_EMAIL).maybeSingle();
  console.log(check ? '\n  WARNING  test creator was not removed' : '\n  Test creator removed.');
  console.log(failures === 0 ? '\nALL CHECKS PASSED. Safe to send.' : `\n${failures} CHECK(S) FAILED. Do not send.`);
  process.exit(failures === 0 ? 0 : 1);
}
