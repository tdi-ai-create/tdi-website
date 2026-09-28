#!/usr/bin/env node
/**
 * Hub account desk. Fix a Hub login while the person is still in the room.
 *
 * Every lever here talks to the Learning Hub project directly. It deliberately
 * does NOT go through /api/admin/hub-memberships, which resolves its client
 * from NEXT_PUBLIC_SUPABASE_URL and therefore writes to the Creator Portal
 * copy of hub_memberships (1 row) instead of the real one. That route reports
 * success and changes nothing.
 *
 * Accounts are never created or repaired with SQL. auth.users rows written by
 * SQL come out with NULL instance_id/aud/role and NULL token columns, which
 * breaks every sign-in path silently. Everything below uses the GoTrue Admin
 * API, and every write is read back before it reports success.
 *
 * Usage:
 *   node scripts/hub-account-desk.mjs look <email-or-fragment>
 *   node scripts/hub-account-desk.mjs roster <partnership-slug>
 *   node scripts/hub-account-desk.mjs seat <email> [--partnership <id>]
 *   node scripts/hub-account-desk.mjs password <email> --yes [--password <pw>]
 *   node scripts/hub-account-desk.mjs create <email> --first <f> --last <l> [--partnership <id>] [--seat]
 *   node scripts/hub-account-desk.mjs fixemail <old> <new> --yes
 *   node scripts/hub-account-desk.mjs selftest
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    let raw;
    try {
      raw = readFileSync(resolve(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim().replace(/\s+#.*$/, '');
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
loadEnv();

const HUB_URL =
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const HUB_SERVICE_KEY =
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY ||
  process.env.LEARNING_HUB_SUPABASE_SERVICE_ROLE_KEY;
const HUB_ANON_KEY = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY;

// No fallback to SUPABASE_SERVICE_ROLE_KEY on purpose. Falling back to the
// portal key is exactly how a write ends up in the wrong project looking fine.
if (!HUB_URL || !HUB_SERVICE_KEY) {
  console.error(
    'Missing Hub credentials. Need NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL and LEARNING_HUB_SUPABASE_SERVICE_KEY in .env.local.'
  );
  process.exit(1);
}

const hub = createClient(HUB_URL, HUB_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// The portal project, only for contracted seat counts. Optional.
const PORTAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PORTAL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const portal =
  PORTAL_URL && PORTAL_KEY
    ? createClient(PORTAL_URL, PORTAL_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const GLEN_ELLYN = {
  partnershipId: '6884a5e5-f934-4f92-a348-839bdae1dd00',
  slug: 'glen-ellyn-d41',
};

// ---------------------------------------------------------------- helpers

const argv = process.argv.slice(2);
const command = argv[0];
const positional = argv.slice(1).filter((a) => !a.startsWith('--'));
function flag(name) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}
const day = (v) => (v ? String(v).slice(0, 10) : '--');

function makePassword() {
  // Readable out loud across a table. No ambiguous characters.
  const words = ['Anchor', 'Harbor', 'Lantern', 'Meadow', 'Compass', 'Willow', 'Beacon', 'Cedar'];
  const word = words[Math.floor(Math.random() * words.length)];
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return `TDI-${word}-${n}`;
}

/** Find Hub accounts by email fragment. hub_profiles carries the email. */
async function findProfiles(query) {
  const { data, error } = await hub
    .from('hub_profiles')
    .select(
      'id, email, first_name, last_name, role, school_name, district, partnership_id, partnership_slug, onboarding_completed'
    )
    .ilike('email', `%${query}%`)
    .order('email');
  if (error) throw new Error(`hub_profiles read failed: ${error.message}`);
  return data || [];
}

async function membershipFor(userId) {
  const { data, error } = await hub
    .from('hub_memberships')
    .select('tier, source, status, partnership_id, org_id, expires_at, granted_by, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(`hub_memberships read failed: ${error.message}`);
  return data;
}

async function activityFor(userId) {
  const [acts, lessons] = await Promise.all([
    hub.from('hub_activity_log').select('created_at', { count: 'exact', head: true }).eq('user_id', userId),
    hub.from('hub_lesson_progress').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  return { activities: acts.count ?? 0, lessons: lessons.count ?? 0 };
}

/**
 * The verification the NULL-column bug taught us to do. Columns looking right
 * in SQL is not proof; a 200 from the admin endpoint is.
 */
async function authRecord(userId) {
  const { data, error } = await hub.auth.admin.getUserById(userId);
  if (error || !data?.user) {
    return { ok: false, reason: error?.message || 'user_not_found' };
  }
  const u = data.user;
  return {
    ok: true,
    email: u.email,
    confirmed: Boolean(u.email_confirmed_at),
    lastSignIn: u.last_sign_in_at,
    createdAt: u.created_at,
    providers: (u.identities || []).map((i) => i.provider),
  };
}

function diagnose({ auth, membership, profile, activity }) {
  const notes = [];
  if (!auth.ok) {
    notes.push(
      `BROKEN AUTH RECORD (${auth.reason}). Admin API cannot see this user. Do not try to repair it with SQL. Recreate through create.`
    );
    return notes;
  }
  if (!membership) {
    notes.push('No membership row at all. Hub will treat them as having no access. Run: seat <email>');
  } else if (membership.tier !== 'all_access') {
    notes.push(
      `On the ${membership.tier} tier (source ${membership.source}). They will sign in fine and see the free Hub, not the partner Hub. Run: seat <email>`
    );
  } else if (membership.status !== 'active') {
    notes.push(`Seat is all_access but status is ${membership.status}. Run: seat <email>`);
  } else if (membership.expires_at && new Date(membership.expires_at) < new Date()) {
    notes.push(`Seat expired ${day(membership.expires_at)}. Run: seat <email>`);
  }
  if (membership?.tier === 'all_access' && !membership.partnership_id && !profile.partnership_id) {
    notes.push(
      'Paid seat with no partnership link on either the membership or the profile. They have access but fall out of every school report.'
    );
  }
  if (!auth.confirmed) {
    notes.push('Email never confirmed. Confirmation is required before sign-in works.');
  }
  if (!auth.lastSignIn && activity.activities === 0) {
    notes.push('Never signed in and no activity. Expect first-time login, not a broken account.');
  }
  if (!profile.first_name && !profile.last_name) {
    notes.push('No name on the profile. They will show as a blank row in the school roster.');
  }
  if (notes.length === 0) notes.push('Healthy. Paid partner seat, confirmed, signs in.');
  return notes;
}

// ---------------------------------------------------------------- commands

async function cmdLook(query) {
  if (!query) throw new Error('Usage: look <email-or-fragment>');
  const profiles = await findProfiles(query);
  if (profiles.length === 0) {
    console.log(`\nNo Hub account matches "${query}".`);
    console.log('If they are standing in front of you, that means no account exists yet.');
    console.log(`Run: node scripts/hub-account-desk.mjs create <email> --first <f> --last <l> --seat\n`);
    return;
  }
  for (const p of profiles) {
    const [auth, membership, activity] = await Promise.all([
      authRecord(p.id),
      membershipFor(p.id),
      activityFor(p.id),
    ]);
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || '(no name on profile)';
    console.log(`\n${'='.repeat(64)}`);
    console.log(`${p.email}   ${name}`);
    console.log(`${'='.repeat(64)}`);
    console.log(`  user id       ${p.id}`);
    console.log(`  auth record   ${auth.ok ? 'admin API 200' : `FAILED (${auth.reason})`}`);
    if (auth.ok) {
      console.log(`  confirmed     ${auth.confirmed ? 'yes' : 'NO'}`);
      console.log(`  sign-in ways  ${auth.providers.join(', ') || 'email only'}`);
      console.log(`  created       ${day(auth.createdAt)}`);
      console.log(`  last sign-in  ${day(auth.lastSignIn)}`);
    }
    console.log(
      `  membership    ${membership ? `${membership.tier} / ${membership.status} / ${membership.source}` : 'NONE'}`
    );
    console.log(`  partnership   membership=${membership?.partnership_id || '--'}`);
    console.log(`                profile=${p.partnership_id || '--'} slug=${p.partnership_slug || '--'}`);
    console.log(`  role          ${p.role || '--'}`);
    console.log(`  activity      ${activity.activities} actions, ${activity.lessons} lessons`);
    console.log('  --');
    for (const note of diagnose({ auth, membership, profile: p, activity })) {
      console.log(`  > ${note}`);
    }
  }
  console.log('');
}

async function cmdRoster(slugArg) {
  const slug = slugArg || GLEN_ELLYN.slug;
  let partnershipId = GLEN_ELLYN.partnershipId;
  let orgName = 'Glen Ellyn School District 41';
  let contracted = null;

  if (portal) {
    const { data } = await portal
      .from('partnerships')
      .select('id, org_name, slug, base_staff_enrolled, staff_enrolled, contact_name, contact_email')
      .eq('slug', slug)
      .maybeSingle();
    if (data) {
      partnershipId = data.id;
      orgName = data.org_name;
      contracted = data.base_staff_enrolled;
    }
  }

  const { data: seats, error } = await hub
    .from('hub_memberships')
    .select('user_id, tier, status, source, expires_at')
    .eq('partnership_id', partnershipId);
  if (error) throw new Error(`hub_memberships read failed: ${error.message}`);

  const { data: claimed } = await hub
    .from('hub_profiles')
    .select('id, email, first_name, last_name, role')
    .or(`partnership_id.eq.${partnershipId},partnership_slug.eq.${slug}`);

  const seatByUser = new Map((seats || []).map((s) => [s.user_id, s]));
  const live = (seats || []).filter(
    (s) => s.tier === 'all_access' && s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > new Date())
  );

  console.log(`\n${orgName}  (${slug})`);
  console.log(`partnership id   ${partnershipId}`);
  console.log(`live paid seats  ${live.length}${contracted ? ` of ${contracted} contracted` : ''}`);
  console.log(`on the roster    ${(claimed || []).length} profiles carry this partnership\n`);

  const rows = [];
  for (const p of claimed || []) {
    const seat = seatByUser.get(p.id);
    let tier = seat ? `${seat.tier}/${seat.status}` : null;
    if (!seat) {
      const m = await membershipFor(p.id);
      tier = m ? `${m.tier}/${m.status}` : 'NO MEMBERSHIP';
    }
    rows.push({ email: p.email, name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '--', role: p.role, tier });
  }
  rows.sort((a, b) => (a.tier === b.tier ? a.email.localeCompare(b.email) : a.tier.localeCompare(b.tier)));
  for (const r of rows) {
    const mark = r.tier.startsWith('all_access') ? '  ' : '!!';
    console.log(`${mark} ${r.email.padEnd(30)} ${String(r.tier).padEnd(18)} ${r.role || ''}  ${r.name}`);
  }
  const short = rows.filter((r) => !r.tier.startsWith('all_access'));
  if (short.length) {
    console.log(
      `\n!! ${short.length} people are attached to this school but are NOT on a paid seat.`
    );
    console.log('   They can sign in. They will see the free Hub. Fix with: seat <email>');
  }
  console.log('');
}

async function cmdSeat(email) {
  if (!email) throw new Error('Usage: seat <email> [--partnership <id>]');
  const partnershipId = flag('partnership') || GLEN_ELLYN.partnershipId;
  const slug = flag('slug') || (partnershipId === GLEN_ELLYN.partnershipId ? GLEN_ELLYN.slug : null);

  const profiles = await findProfiles(email);
  const profile = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
  if (!profile) throw new Error(`No Hub account for ${email}. Use create instead.`);

  const auth = await authRecord(profile.id);
  if (!auth.ok) throw new Error(`Auth record unusable (${auth.reason}). Do not patch it, recreate the account.`);

  const before = await membershipFor(profile.id);
  const now = new Date().toISOString();

  const { error } = await hub.from('hub_memberships').upsert(
    {
      user_id: profile.id,
      tier: 'all_access',
      source: 'district_partner',
      status: 'active',
      partnership_id: partnershipId,
      starts_at: before?.starts_at || now,
      expires_at: null,
      cancelled_at: null,
      granted_by: 'hub-account-desk',
      updated_at: now,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(`Seat write failed: ${error.message}`);

  // Keep the profile side in step, or they hold a seat and still miss reports.
  await hub
    .from('hub_profiles')
    .update({ partnership_id: partnershipId, ...(slug ? { partnership_slug: slug } : {}) })
    .eq('id', profile.id);

  const after = await membershipFor(profile.id);
  console.log(`\n${email}`);
  console.log(`  before  ${before ? `${before.tier}/${before.status}/${before.source}` : 'no membership'}`);
  console.log(`  after   ${after.tier}/${after.status}/${after.source}  partnership=${after.partnership_id}`);
  if (after.tier !== 'all_access' || after.status !== 'active') {
    console.log('  WRITE DID NOT STICK. Do not tell anyone this is fixed.');
    process.exitCode = 1;
    return;
  }
  console.log('  verified by read-back. Have them refresh the Hub.\n');
}

async function cmdPassword(email) {
  if (!email) throw new Error('Usage: password <email> --yes [--password <pw>]');
  if (flag('yes') !== true) {
    console.error('This overwrites their current password. Re-run with --yes to confirm.');
    process.exit(1);
  }
  const profiles = await findProfiles(email);
  const profile = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
  if (!profile) throw new Error(`No Hub account for ${email}.`);

  const password = typeof flag('password') === 'string' ? flag('password') : makePassword();
  const { error } = await hub.auth.admin.updateUserById(profile.id, {
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Password set failed: ${error.message}`);

  const check = await verifySignIn(email, password);
  console.log(`\n${email}`);
  console.log(`  password   ${password}`);
  console.log(`  sign-in    ${check.ok ? 'verified, token issued' : `FAILED (${check.reason})`}`);
  if (!check.ok) {
    console.log('  Do not hand this out. The account has a deeper problem. Run look on it.');
    process.exitCode = 1;
    return;
  }
  console.log('  Give them this at teachersdeserveit.com/hub/login, then have them change it.\n');
}

/** Proof the credential works, not just that the write returned 200. */
async function verifySignIn(email, password) {
  if (!HUB_ANON_KEY) return { ok: false, reason: 'no anon key in env to test with' };
  const res = await fetch(`${HUB_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: HUB_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase(), password }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, reason: `${res.status} ${body.slice(0, 160)}` };
  }
  const json = await res.json();
  return { ok: Boolean(json.access_token), reason: 'no access_token in response' };
}

async function cmdCreate(email) {
  if (!email) throw new Error('Usage: create <email> --first <f> --last <l> [--seat]');
  const first = typeof flag('first') === 'string' ? flag('first') : null;
  const last = typeof flag('last') === 'string' ? flag('last') : null;
  const role = typeof flag('role') === 'string' ? flag('role') : 'para';
  const partnershipId = flag('partnership') || GLEN_ELLYN.partnershipId;

  const existing = await findProfiles(email);
  if (existing.some((p) => p.email?.toLowerCase() === email.toLowerCase())) {
    throw new Error(`${email} already has a Hub account. Run look on it instead of creating a second one.`);
  }

  const password = typeof flag('password') === 'string' ? flag('password') : makePassword();
  const { data, error } = await hub.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { first_name: first, last_name: last },
  });
  if (error) throw new Error(`Create failed: ${error.message}`);
  const userId = data.user.id;

  await hub.from('hub_profiles').upsert(
    {
      id: userId,
      email: email.toLowerCase(),
      first_name: first,
      last_name: last,
      role,
      partnership_id: partnershipId,
      partnership_slug: partnershipId === GLEN_ELLYN.partnershipId ? GLEN_ELLYN.slug : null,
    },
    { onConflict: 'id' }
  );

  if (flag('seat')) {
    const now = new Date().toISOString();
    await hub.from('hub_memberships').upsert(
      {
        user_id: userId,
        tier: 'all_access',
        source: 'district_partner',
        status: 'active',
        partnership_id: partnershipId,
        starts_at: now,
        granted_by: 'hub-account-desk',
        updated_at: now,
      },
      { onConflict: 'user_id' }
    );
  }

  const auth = await authRecord(userId);
  const membership = await membershipFor(userId);
  const check = await verifySignIn(email, password);

  console.log(`\n${email}`);
  console.log(`  user id     ${userId}`);
  console.log(`  auth        ${auth.ok ? 'admin API 200' : `FAILED (${auth.reason})`}`);
  console.log(`  membership  ${membership ? `${membership.tier}/${membership.status}` : 'none (pass --seat to grant one)'}`);
  console.log(`  password    ${password}`);
  console.log(`  sign-in     ${check.ok ? 'verified, token issued' : `FAILED (${check.reason})`}`);
  console.log('');
  if (!check.ok) process.exitCode = 1;
  return { userId, password };
}

async function cmdFixEmail(oldEmail, newEmail) {
  if (!oldEmail || !newEmail) throw new Error('Usage: fixemail <old> <new> --yes');
  if (flag('yes') !== true) {
    console.error('This changes the address they sign in with. Re-run with --yes to confirm.');
    process.exit(1);
  }
  const profiles = await findProfiles(oldEmail);
  const profile = profiles.find((p) => p.email?.toLowerCase() === oldEmail.toLowerCase());
  if (!profile) throw new Error(`No Hub account for ${oldEmail}.`);

  const clash = await findProfiles(newEmail);
  if (clash.some((p) => p.email?.toLowerCase() === newEmail.toLowerCase())) {
    throw new Error(`${newEmail} already exists. Two accounts, not a rename. Decide which one keeps the seat.`);
  }

  const { error } = await hub.auth.admin.updateUserById(profile.id, {
    email: newEmail.toLowerCase(),
    email_confirm: true,
  });
  if (error) throw new Error(`Email change failed: ${error.message}`);
  await hub.from('hub_profiles').update({ email: newEmail.toLowerCase() }).eq('id', profile.id);

  const auth = await authRecord(profile.id);
  console.log(`\n  ${oldEmail} -> ${auth.email}`);
  console.log(`  ${auth.email === newEmail.toLowerCase() ? 'verified by read-back' : 'DID NOT STICK'}\n`);
}

/**
 * Dry run every lever on a throwaway account, then delete it. A lever you have
 * not run is not a lever that works.
 */
async function cmdSelftest() {
  const stamp = Date.now();
  const email = `hub-desk-selftest+${stamp}@teachersdeserveit.com`;
  console.log(`\nSelf-test account: ${email}`);
  let userId;
  try {
    const password = makePassword();
    const { data, error } = await hub.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`create: ${error.message}`);
    userId = data.user.id;
    console.log(`  [1/6] create via Admin API      ok  (${userId})`);

    const auth = await authRecord(userId);
    console.log(`  [2/6] admin API read back       ${auth.ok ? 'ok' : `FAILED ${auth.reason}`}`);

    const signIn = await verifySignIn(email, password);
    console.log(`  [3/6] password sign-in          ${signIn.ok ? 'ok, token issued' : `FAILED ${signIn.reason}`}`);

    const now = new Date().toISOString();
    const { error: seatErr } = await hub.from('hub_memberships').upsert(
      {
        user_id: userId,
        tier: 'all_access',
        source: 'district_partner',
        status: 'active',
        partnership_id: GLEN_ELLYN.partnershipId,
        starts_at: now,
        granted_by: 'hub-account-desk-selftest',
        updated_at: now,
      },
      { onConflict: 'user_id' }
    );
    if (seatErr) throw new Error(`seat: ${seatErr.message}`);
    const membership = await membershipFor(userId);
    console.log(
      `  [4/6] grant seat + read back    ${membership?.tier === 'all_access' && membership.status === 'active' ? 'ok' : 'FAILED'}`
    );

    const newPassword = makePassword();
    const { error: pwErr } = await hub.auth.admin.updateUserById(userId, { password: newPassword });
    if (pwErr) throw new Error(`password: ${pwErr.message}`);
    const reSignIn = await verifySignIn(email, newPassword);
    console.log(`  [5/6] password reset + sign-in  ${reSignIn.ok ? 'ok, token issued' : `FAILED ${reSignIn.reason}`}`);
  } finally {
    if (userId) {
      await hub.from('hub_memberships').delete().eq('user_id', userId);
      await hub.from('hub_profiles').delete().eq('id', userId);
      const { error } = await hub.auth.admin.deleteUser(userId);
      console.log(`  [6/6] cleanup                   ${error ? `FAILED ${error.message}` : 'ok, account removed'}`);
    }
    console.log('');
  }
}

// ---------------------------------------------------------------- dispatch

const commands = {
  look: () => cmdLook(positional[0]),
  roster: () => cmdRoster(positional[0]),
  seat: () => cmdSeat(positional[0]),
  password: () => cmdPassword(positional[0]),
  create: () => cmdCreate(positional[0]),
  fixemail: () => cmdFixEmail(positional[0], positional[1]),
  selftest: () => cmdSelftest(),
};

if (!command || !commands[command]) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(19, 28).join('\n'));
  process.exit(command ? 1 : 0);
}

commands[command]().catch((err) => {
  console.error(`\n${err.message}\n`);
  process.exit(1);
});
