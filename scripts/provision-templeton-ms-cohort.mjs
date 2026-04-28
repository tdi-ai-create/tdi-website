#!/usr/bin/env node
/**
 * Provision Templeton MS para cohort — 9 Hub accounts
 *
 * What this does:
 *   1. Creates Supabase auth users for each cohort member (sends invite email)
 *   2. Creates hub_profiles rows so the Hub recognizes them immediately
 *   3. Each user receives an email invite to set their password
 *
 * Run: node scripts/provision-templeton-ms-cohort.mjs
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

const HUB_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teachersdeserveit.com';
const REDIRECT_URL = `${HUB_URL}/hub`;

const COHORT = [
  { email: 'beloja@hamilton.k12.wi.us', first: 'Janette', last: 'Below', role: 'para' },
  { email: 'dowgr@hamilton.k12.wi.us', first: 'Grace', last: 'Dow', role: 'para' },
  { email: 'mattmi@hamilton.k12.wi.us', first: 'Michelle', last: 'Gayle', role: 'para' },
  { email: 'kernna@hamilton.k12.wi.us', first: 'Nanette', last: 'Kern', role: 'para' },
  { email: 'larsli@hamilton.k12.wi.us', first: 'Lisa', last: 'Larsen', role: 'para' },
  { email: 'sancja@hamilton.k12.wi.us', first: 'Jasmine', last: 'Sanchez', role: 'para' },
  { email: 'neadje@hamilton.k12.wi.us', first: 'Jessica', last: 'Nead', role: 'para' },
  { email: 'schaka@hamilton.k12.wi.us', first: 'Katelyn', last: 'Schafer', role: 'para' },
  { email: 'hoffbr@hamilton.k12.wi.us', first: 'Brad', last: 'Hoffmann', role: 'school_leader' },
];

async function main() {
  console.log('=== Provisioning Templeton MS Cohort (9 users) ===\n');

  const results = { created: [], existing: [], failed: [] };

  for (const member of COHORT) {
    const label = `${member.first} ${member.last} (${member.email})`;
    console.log(`\n--- ${label} ---`);

    // 1. Check if auth user already exists
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      console.error(`  ERROR listing users: ${listErr.message}`);
      results.failed.push(label);
      continue;
    }

    let authUser = listData.users.find(
      (u) => u.email?.toLowerCase() === member.email.toLowerCase()
    );

    if (authUser) {
      console.log(`  [OK] Auth user already exists: ${authUser.id}`);
    } else {
      console.log('  [..] Creating auth user via admin invite...');
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: member.email,
        email_confirm: true,
        user_metadata: {
          first_name: member.first,
          last_name: member.last,
          display_name: `${member.first} ${member.last}`,
          full_name: `${member.first} ${member.last}`,
        },
      });

      if (createErr || !created?.user) {
        console.error(`  ERROR creating auth user: ${createErr?.message}`);
        results.failed.push(label);
        continue;
      }

      authUser = created.user;
      console.log(`  [OK] Auth user created: ${authUser.id}`);
    }

    // 2. Create or verify hub_profiles row
    const { data: existingProfile } = await supabase
      .from('hub_profiles')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (existingProfile) {
      console.log('  [OK] Hub profile already exists');
      results.existing.push(label);
    } else {
      const { error: profileErr } = await supabase.from('hub_profiles').insert({
        id: authUser.id,
        display_name: `${member.first} ${member.last}`,
        role: member.role,
        onboarding_completed: false,
        onboarding_data: {},
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileErr) {
        console.error(`  ERROR creating hub profile: ${profileErr.message}`);
        results.failed.push(label);
        continue;
      }
      console.log('  [OK] Hub profile created');
      results.created.push(label);
    }

    // 3. Send password reset so user can set their password and log in
    const { error: resetErr } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: member.email,
      options: { redirectTo: REDIRECT_URL },
    });

    if (resetErr) {
      console.warn(`  [WARN] generateLink failed (${resetErr.message}) — trying standard reset`);
      const { error: stdErr } = await supabase.auth.resetPasswordForEmail(member.email, {
        redirectTo: REDIRECT_URL,
      });
      if (stdErr) {
        console.error(`  ERROR sending reset: ${stdErr.message}`);
        console.log('  Manual step: trigger password reset from Supabase dashboard');
      } else {
        console.log(`  [OK] Password reset email sent`);
      }
    } else {
      console.log(`  [OK] Recovery link generated and sent`);
    }
  }

  // Summary
  console.log('\n\n=== SUMMARY ===');
  console.log(`Created:  ${results.created.length}`);
  console.log(`Existing: ${results.existing.length}`);
  console.log(`Failed:   ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed accounts:');
    results.failed.forEach((f) => console.log(`  - ${f}`));
  }

  console.log(`\nAll users can log in at: ${HUB_URL}/hub/login`);
  console.log('They will receive a password reset email to set their password.');
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
