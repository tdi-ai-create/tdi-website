// Does the welcome email's sign-in button actually work?
//
// Generating a link does NOT send anything. Nothing here reaches a creator.
//
//   npx tsx scripts/integrity/creator-invite-linktest.mjs

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

const { data: c, error: cErr } = await sb
  .from('creators')
  .select('name, email')
  .eq('name', 'Walter Cullin Jr')
  .single();

if (cErr) { console.error('could not load creator:', cErr.message); process.exit(1); }

console.log('Testing the welcome email link for:', c.name);
console.log('');

for (const type of ['magiclink', 'recovery', 'invite']) {
  const { data, error } = await sb.auth.admin.generateLink({
    type,
    email: c.email,
    options: { redirectTo: 'https://www.teachersdeserveit.com/creator-portal/dashboard' },
  });

  if (error) {
    console.log(`  ${type.padEnd(10)} FAILED  ${error.message} (status ${error.status})`);
    continue;
  }

  const link = data?.properties?.action_link;
  if (!link) { console.log(`  ${type.padEnd(10)} no action_link returned`); continue; }

  const u = new URL(link);
  console.log(`  ${type.padEnd(10)} ok      host=${u.host}  type=${u.searchParams.get('type')}`);
}

console.log('');
console.log('No email was sent. generateLink only mints a URL.');
