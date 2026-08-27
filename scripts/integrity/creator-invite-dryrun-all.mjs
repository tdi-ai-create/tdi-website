// Shows what every locked-out creator would receive, without sending anything.
//
//   npx tsx scripts/integrity/creator-invite-dryrun-all.mjs
//
// Mints a real link per creator to prove one can be minted, then throws it away.
// Minting does not send. Sending happens when a person clicks in the portal.

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

const { data: creators, error: creatorsError } = await sb
  .from('creators')
  .select('id, name, email, lifecycle_state')
  .eq('status', 'active')
  .order('name');
if (creatorsError) { console.error('could not read creators:', creatorsError.message); process.exit(1); }

const authByEmail = new Map();
let page = 1;
for (;;) {
  const { data: users, error: usersError } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (usersError) { console.error('could not read accounts:', usersError.message); process.exit(1); }
  for (const u of users.users) if (u.email) authByEmail.set(u.email.toLowerCase(), u);
  if (users.users.length < 1000) break;
  page += 1;
}

const rows = [];
let noAccount = 0;
let linkFailures = 0;

for (const c of creators) {
  const auth = c.email ? authByEmail.get(c.email.toLowerCase()) : null;
  if (auth?.last_sign_in_at) continue;

  if (!auth) {
    rows.push({ creator: c.name.trim(), state: c.lifecycle_state ?? 'active', lands_on: '-', link: 'NO ACCOUNT', note: 'needs an account first' });
    noAccount += 1;
    continue;
  }

  const { data: step } = await sb
    .from('creator_milestones')
    .select('milestones!inner(name)')
    .eq('creator_id', c.id)
    .eq('status', 'available')
    .limit(1)
    .maybeSingle();

  const { data: link, error } = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email: c.email.toLowerCase(),
    options: { redirectTo: 'https://www.teachersdeserveit.com/creator-portal/dashboard' },
  });

  if (error || !link?.properties?.action_link) linkFailures += 1;

  rows.push({
    creator: c.name.trim(),
    state: (c.lifecycle_state ?? 'active'),
    lands_on: step?.milestones?.name ?? '(chooses their path)',
    link: error ? `FAILED: ${error.message}` : 'ok',
    note: '',
  });
}

console.table(rows);
console.log(`\nWould be emailed: ${rows.length - noAccount}`);
console.log(`Cannot be emailed yet (no account): ${noAccount}`);
console.log(`Link generation failures: ${linkFailures}`);
console.log('\nEmails sent this run: 0');
console.log('Rows written this run: 0');
