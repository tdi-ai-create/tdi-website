/**
 * Create the TDI voice accounts in the Hub project.
 *
 * These are accounts TDI owns. They post with the TDI chip beside the name.
 * No real member's account is ever used for this.
 *
 * Accounts are created through the GoTrue Admin API, never by SQL insert into
 * auth.users, which leaves required columns NULL and breaks sign in silently.
 *
 *   node scripts/create-tdi-voice-accounts.mjs            # dry run, writes nothing
 *   node scripts/create-tdi-voice-accounts.mjs --apply    # creates them
 *   node scripts/create-tdi-voice-accounts.mjs --apply --only "Marisol Aguirre"
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const SUPABASE_URL = env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const SERVICE_KEY = env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Hub Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// role values match what the Hub already stores: classroom_teacher, para, coach, school_leader
const VOICES = [
  ['Marisol Aguirre', 'classroom_teacher', '3-5', 'Literacy'],
  ['Tobias Rennert', 'classroom_teacher', '6-8', 'Math'],
  ['Deshawn Pryor', 'para', 'PK-2', 'Small groups'],
  ['Ingrid Vasquez-Lund', 'classroom_teacher', '9-12', 'Science'],
  ['Priya Raghunathan', 'coach', 'K-12', 'Coaching'],
  ['Callum Ferreira', 'classroom_teacher', 'PK-2', 'Early literacy'],
  ['Yolanda Betts', 'para', '3-5', 'Inclusion'],
  ['Marcus Oyelaran', 'classroom_teacher', '6-8', 'Social studies'],
  ['Rosalie Dunne', 'classroom_teacher', 'K-8', 'Special education'],
  ['Hana Sugimoto', 'classroom_teacher', '3-5', 'Math'],
  ['Everett Crane', 'para', '6-8', 'Behaviour support'],
  ['Nadia Belhassen', 'classroom_teacher', 'K-12', 'Multilingual learners'],
  ['Wendell Prosser', 'classroom_teacher', '9-12', 'Career and technical'],
  ['Simone Ashcroft', 'classroom_teacher', 'PK-2', 'Play based'],
  ['Deacon Mwangi', 'coach', '3-8', 'Coaching'],
  ['Lorna Stimpson', 'para', '9-12', 'Transition support'],
  ['Ravi Chandrasekar', 'classroom_teacher', '6-8', 'Science'],
  ['Bettina Kowalczyk', 'classroom_teacher', '3-5', 'Social emotional'],
  ['Jarrod Levins', 'school_leader', 'K-8', 'Leadership'],
  ['Ofelia Marchetti', 'para', 'PK-2', 'Early intervention'],
  ['Trevon Baptiste', 'classroom_teacher', '9-12', 'English'],
  ['Aurelia Nkemdirim', 'classroom_teacher', '3-5', 'Science'],
  ['Gus Halvorsen', 'classroom_teacher', 'K-8', 'PE and wellness'],
  ['Camille Thibodeaux', 'classroom_teacher', '6-8', 'Literacy'],
];

const slug = name => name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
const emailFor = name => `${slug(name)}@voices.teachersdeserveit.com`;

const apply = process.argv.includes('--apply');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const list = only ? VOICES.filter(v => v[0] === only) : VOICES;

if (only && list.length === 0) {
  console.error(`No voice named "${only}"`);
  process.exit(1);
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${list.length} account(s)\n`);

let created = 0;
let skipped = 0;

for (const [name, role, gradeBand, lane] of list) {
  const email = emailFor(name);

  const { data: existing } = await supabase
    .from('hub_profiles')
    .select('id, display_name')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log(`  skip    ${name.padEnd(22)} already exists (${existing.id})`);
    skipped++;
    continue;
  }

  if (!apply) {
    console.log(`  would   ${name.padEnd(22)} ${role.padEnd(18)} ${gradeBand.padEnd(6)} ${email}`);
    continue;
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: randomBytes(24).toString('base64url'),
    email_confirm: true,
    user_metadata: { display_name: name, tdi_voice: true },
  });

  if (authError) {
    console.log(`  FAILED  ${name.padEnd(22)} ${authError.message}`);
    continue;
  }

  const [firstName, ...rest] = name.split(' ');

  const { error: profileError } = await supabase.from('hub_profiles').insert({
    id: authUser.user.id,
    email,
    display_name: name,
    first_name: firstName,
    last_name: rest.join(' '),
    role,
    grade_band: gradeBand,
    onboarding_completed: true,
    is_test_account: false,
    is_tdi_voice: true,
    preferences: { tdi_voice_lane: lane },
  });

  if (profileError) {
    console.log(`  PARTIAL ${name.padEnd(22)} auth user made, profile failed: ${profileError.message}`);
    continue;
  }

  // Proof the account is real to GoTrue, not just a visible row.
  const { data: check, error: checkError } = await supabase.auth.admin.getUserById(authUser.user.id);
  const healthy = !checkError && check?.user?.aud === 'authenticated';

  console.log(`  created ${name.padEnd(22)} ${authUser.user.id}  admin lookup: ${healthy ? 'ok' : 'PROBLEM'}`);
  created++;
}

console.log(`\n${apply ? 'created' : 'would create'}: ${apply ? created : list.length - skipped}, skipped: ${skipped}`);
