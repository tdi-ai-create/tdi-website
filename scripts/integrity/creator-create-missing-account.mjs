// Creates auth accounts for active creators who have none.
//
//   npx tsx scripts/integrity/creator-create-missing-account.mjs            dry run
//   npx tsx scripts/integrity/creator-create-missing-account.mjs --commit   creates
//
// Through the GoTrue Admin API, never by SQL. A direct insert leaves
// instance_id, aud, role and the token columns NULL, which breaks every
// sign-in silently and is what locked fifteen accounts out earlier this month.
//
// Creating an account sends nothing. The invite is a separate, human action.

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

const { data: creators } = await sb
  .from('creators')
  .select('id, name, email')
  .eq('status', 'active');

const have = new Set();
const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
for (const u of users.users) if (u.email) have.add(u.email.toLowerCase());

const missing = creators.filter((c) => c.email && !have.has(c.email.trim().toLowerCase()));

if (missing.length === 0) {
  console.log('Every active creator already has an account.');
  process.exit(0);
}

console.log(COMMIT ? 'COMMIT MODE\n' : 'DRY RUN, nothing will be created\n');

for (const c of missing) {
  const email = c.email.trim().toLowerCase();
  if (!COMMIT) {
    console.log(`  would create: ${c.name.trim()}  <${email}>`);
    continue;
  }

  const { data, error } = await sb.auth.admin.createUser({ email, email_confirm: true });
  if (error) {
    console.log(`  FAILED  ${c.name.trim()}: ${error.message}`);
    continue;
  }

  // Prove it, rather than trusting the create call. Repairing or creating a row
  // is not the same as the auth service being able to find it.
  const { data: check, error: checkError } = await sb.auth.admin.getUserById(data.user.id);
  if (checkError || !check?.user) {
    console.log(`  CREATED BUT NOT READABLE  ${c.name.trim()}: ${checkError?.message ?? 'not found'}`);
    continue;
  }
  console.log(`  created and verified: ${c.name.trim()}  <${email}>  id ${data.user.id}`);
}

console.log(`\nAccounts ${COMMIT ? 'created' : 'that would be created'}: ${missing.length}`);
console.log('Emails sent this run: 0');
