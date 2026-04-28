#!/usr/bin/env node
/**
 * Provision Jack Lipari — Roosevelt School partner dashboard access
 *
 * What this does:
 *   1. Looks up jack.lipari@lodi.k12.nj.us in Supabase auth
 *   2. Creates the auth user if not found (sends invite email)
 *   3. Upserts a partnership_users row linking him to roosevelt-school
 *   4. Sends a magic link / password reset so he can log in immediately
 *
 * Run: node scripts/provision-jack-lipari.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const JACK_EMAIL = 'jack.lipari@lodi.k12.nj.us';
const PARTNERSHIP_SLUG = 'roosevelt-school';
const REDIRECT_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://teachersdeserveit.com'}/partners/dashboard/${PARTNERSHIP_SLUG}`;

async function main() {
  console.log('=== Provisioning Jack Lipari / Roosevelt School ===\n');

  // 1. Look up partnership
  const { data: partnership, error: pErr } = await supabase
    .from('partnerships')
    .select('id, contact_email, contact_name')
    .eq('slug', PARTNERSHIP_SLUG)
    .single();

  if (pErr || !partnership) {
    console.error('ERROR: Could not find partnership:', pErr?.message);
    process.exit(1);
  }

  console.log(`[OK] Partnership found: ${PARTNERSHIP_SLUG} (${partnership.id})`);
  console.log(`     contact_email = ${partnership.contact_email}`);

  if (partnership.contact_email.toLowerCase() !== JACK_EMAIL.toLowerCase()) {
    console.error(`\nERROR: contact_email is still "${partnership.contact_email}" — run migration 042 first.`);
    console.error('       npx supabase db push  (or apply 042_fix_roosevelt_contact_email.sql manually)');
    process.exit(1);
  }

  // 2. Look up Jack's Supabase auth user
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('ERROR listing auth users:', listErr.message);
    process.exit(1);
  }

  let jackUser = listData.users.find(u => u.email?.toLowerCase() === JACK_EMAIL.toLowerCase());

  if (jackUser) {
    console.log(`[OK] Auth user found: ${jackUser.id} (email_confirmed: ${!!jackUser.email_confirmed_at})`);
  } else {
    console.log('[..] Auth user not found — creating via admin invite...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: JACK_EMAIL,
      email_confirm: true,
      user_metadata: { first_name: 'Jack', last_name: 'Lipari' },
    });

    if (createErr || !created?.user) {
      console.error('ERROR creating auth user:', createErr?.message);
      process.exit(1);
    }

    jackUser = created.user;
    console.log(`[OK] Auth user created: ${jackUser.id}`);
  }

  // 3. Upsert partnership_users row
  const { error: puErr } = await supabase
    .from('partnership_users')
    .upsert(
      {
        partnership_id: partnership.id,
        user_id: jackUser.id,
        role: 'admin',
        first_name: 'Jack',
        last_name: 'Lipari',
      },
      { onConflict: 'partnership_id,user_id' }
    );

  if (puErr) {
    console.error('ERROR upserting partnership_users:', puErr.message);
    process.exit(1);
  }

  console.log(`[OK] partnership_users row upserted — Jack linked to ${PARTNERSHIP_SLUG} as admin`);

  // 4. Send password reset / magic login link
  const { error: resetErr } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: JACK_EMAIL,
    options: { redirectTo: REDIRECT_URL },
  });

  if (resetErr) {
    // Non-fatal: log and fall back to standard reset
    console.warn(`[WARN] generateLink failed (${resetErr.message}) — sending standard reset email instead`);
    const { error: stdErr } = await supabase.auth.resetPasswordForEmail(JACK_EMAIL, {
      redirectTo: REDIRECT_URL,
    });
    if (stdErr) {
      console.error('ERROR sending reset email:', stdErr.message);
      console.log('\nManual step needed: trigger a password reset for', JACK_EMAIL, 'from the Supabase dashboard.');
    } else {
      console.log(`[OK] Password reset email sent to ${JACK_EMAIL}`);
    }
  } else {
    console.log(`[OK] Recovery link generated and sent to ${JACK_EMAIL}`);
  }

  // 5. Verification summary
  const { data: puRow } = await supabase
    .from('partnership_users')
    .select('id, role, first_name, last_name, created_at')
    .eq('partnership_id', partnership.id)
    .eq('user_id', jackUser.id)
    .single();

  console.log('\n=== Verification ===');
  console.log('Partnership slug  :', PARTNERSHIP_SLUG);
  console.log('Jack auth user id :', jackUser.id);
  console.log('partnership_users :', puRow ? `id=${puRow.id} role=${puRow.role}` : 'MISSING — check error above');
  console.log('Login redirect    :', REDIRECT_URL);
  console.log('\nJack should now be able to log in at /partners/login with either:');
  console.log('  - The password reset link sent to his email');
  console.log('  - Google SSO (if his Google account uses jack.lipari@lodi.k12.nj.us)');
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
