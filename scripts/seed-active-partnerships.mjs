#!/usr/bin/env node
/**
 * Seed Active Partnerships Script
 * Seeds 7 active partner schools into the partnerships database
 * Run: node scripts/seed-active-partnerships.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Partnership data for all 7 active partners
const partnerships = [
  {
    partnership_type: 'school',
    slug: 'allenwood-elementary',
    contact_name: 'Dr. Sharon H. Porter',
    contact_email: 'porter@pgcps.org',
    primary_contact_name: 'Dr. Sharon H. Porter',
    primary_contact_email: 'porter@pgcps.org',
    contract_phase: 'ACCELERATE',
    contract_start: '2025-09-01',
    contract_end: '2026-06-30',
    building_count: 1,
    observation_days_total: 2,
    virtual_sessions_total: 4,
    executive_sessions_total: 2,
    status: 'active',
    legacy_dashboard_url: '/Allenwood-Dashboard',
    website: 'pgcps.org',
    address: 'Allenwood Elementary School, Prince George\'s County, MD',
  },
  {
    partnership_type: 'district',
    slug: 'addison-school-district-4',
    contact_name: 'Janet Diaz',
    contact_email: 'jdiaz@asd4.org',
    primary_contact_name: 'Janet Diaz',
    primary_contact_email: 'jdiaz@asd4.org',
    contract_phase: 'IGNITE',
    contract_start: '2026-01-01',
    contract_end: '2026-05-31',
    building_count: 3,
    observation_days_total: 2,
    virtual_sessions_total: 4,
    executive_sessions_total: 2,
    status: 'active',
    legacy_dashboard_url: '/asd4-dashboard',
    website: 'asd4.org',
    address: '222 N. Kennedy Dr., Addison, IL 60101',
  },
  {
    partnership_type: 'school',
    slug: 'st-peter-chanel',
    contact_name: 'Paula Poche',
    contact_email: 'ppoche@stpeterchanel.org',
    primary_contact_name: 'Paula Poche',
    primary_contact_email: 'ppoche@stpeterchanel.org',
    contract_phase: 'ACCELERATE',
    contract_start: '2025-08-01',
    contract_end: '2026-05-31',
    building_count: 1,
    observation_days_total: 2,
    virtual_sessions_total: 4,
    executive_sessions_total: 2,
    status: 'active',
    legacy_dashboard_url: '/stpchanel-dashboard',
    website: 'stpeterchanel.org',
    address: 'St. Peter Chanel Catholic School',
  },
  {
    partnership_type: 'district',
    slug: 'wego-district-94',
    contact_name: 'Juan Suarez',
    contact_email: 'jsuarez@wego94.org',
    primary_contact_name: 'Juan Suarez',
    primary_contact_email: 'jsuarez@wego94.org',
    contract_phase: 'ACCELERATE',
    contract_start: '2025-08-01',
    contract_end: '2026-05-31',
    building_count: 2,
    observation_days_total: 4,
    virtual_sessions_total: 6,
    executive_sessions_total: 4,
    status: 'active',
    legacy_dashboard_url: '/wego-dashboard',
    website: 'wegsd94.org',
    address: 'WEGO Community Unit School District 94, IL',
  },
  {
    partnership_type: 'school',
    slug: 'saunemin-ccsd-438',
    contact_name: 'Gary Doughan',
    contact_email: 'gdoughan@saunemin438.org',
    primary_contact_name: 'Gary Doughan',
    primary_contact_email: 'gdoughan@saunemin438.org',
    contract_phase: 'ACCELERATE',
    contract_start: '2025-08-01',
    contract_end: '2026-05-31',
    building_count: 1,
    observation_days_total: 2,
    virtual_sessions_total: 4,
    executive_sessions_total: 2,
    status: 'active',
    legacy_dashboard_url: '/saunemin-dashboard',
    website: 'saunemin438.org',
    address: 'Saunemin CCSD #438, Saunemin, IL',
  },
  {
    partnership_type: 'district',
    slug: 'glen-ellyn-d41',
    contact_name: 'Dee Neukirch',
    contact_email: 'dneukirch@d41.org',
    primary_contact_name: 'Dee Neukirch',
    primary_contact_email: 'dneukirch@d41.org',
    contract_phase: 'IGNITE',
    contract_start: '2025-09-01',
    contract_end: '2026-05-31',
    building_count: 1,
    observation_days_total: 2,
    virtual_sessions_total: 4,
    executive_sessions_total: 2,
    status: 'active',
    legacy_dashboard_url: '/D41-dashboard',
    website: 'd41.org',
    address: 'Glen Ellyn School District 41, Glen Ellyn, IL',
  },
  {
    partnership_type: 'school',
    slug: 'tidioute-community-charter',
    contact_name: 'Melissa Mahaney',
    contact_email: 'mmahaney@tccs.org',
    primary_contact_name: 'Melissa Mahaney',
    primary_contact_email: 'mmahaney@tccs.org',
    contract_phase: 'IGNITE',
    contract_start: '2025-09-01',
    contract_end: '2026-05-31',
    building_count: 1,
    observation_days_total: 0,
    virtual_sessions_total: 4,
    executive_sessions_total: 0,
    status: 'active',
    legacy_dashboard_url: '/tccs-dashboard',
    website: 'tidioute.org',
    address: 'Tidioute Community Charter School, Tidioute, PA',
  },
];

async function seedPartnerships() {
  console.log('Starting partnership seeding...\n');

  for (const partnership of partnerships) {
    // Check if partnership already exists by slug
    const { data: existing } = await supabase
      .from('partnerships')
      .select('id, slug')
      .eq('slug', partnership.slug)
      .maybeSingle();

    if (existing) {
      console.log(`[SKIP] ${partnership.slug} already exists (ID: ${existing.id})`);
      continue;
    }

    // Insert new partnership
    const { data, error } = await supabase
      .from('partnerships')
      .insert(partnership)
      .select()
      .single();

    if (error) {
      console.error(`[ERROR] Failed to insert ${partnership.slug}:`, error.message);
      continue;
    }

    console.log(`[OK] Created ${partnership.slug} (ID: ${data.id})`);
  }

  console.log('\n--- Verification ---');

  // Verify all 7 exist
  const { data: allPartnerships, error: verifyError } = await supabase
    .from('partnerships')
    .select('slug, partnership_type, contract_phase, status, legacy_dashboard_url')
    .in('slug', partnerships.map(p => p.slug))
    .order('created_at', { ascending: true });

  if (verifyError) {
    console.error('Verification failed:', verifyError.message);
    return;
  }

  console.log(`\nFound ${allPartnerships?.length || 0} of 7 expected partnerships:\n`);

  allPartnerships?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.slug}`);
    console.log(`   Type: ${p.partnership_type} | Phase: ${p.contract_phase} | Status: ${p.status}`);
    console.log(`   Legacy URL: ${p.legacy_dashboard_url}`);
  });
}

// Also seed organizations table if it exists
async function seedOrganizations() {
  console.log('\n--- Seeding Organizations ---\n');

  // Check if organizations table exists and has data
  const { data: testOrgs, error: testError } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  if (testError && testError.code === '42P01') {
    console.log('[SKIP] Organizations table does not exist');
    return;
  }

  // Get partnership IDs
  const { data: partnershipData } = await supabase
    .from('partnerships')
    .select('id, slug, partnership_type, contact_name')
    .in('slug', partnerships.map(p => p.slug));

  if (!partnershipData) {
    console.log('[SKIP] No partnerships found to link organizations');
    return;
  }

  const orgNameMap = {
    'allenwood-elementary': 'Allenwood Elementary School',
    'addison-school-district-4': 'Addison School District 4',
    'st-peter-chanel': 'St. Peter Chanel Catholic School',
    'wego-district-94': 'WEGO District 94',
    'saunemin-ccsd-438': 'Saunemin CCSD #438',
    'glen-ellyn-d41': 'Glen Ellyn School District 41',
    'tidioute-community-charter': 'Tidioute Community Charter School',
  };

  for (const p of partnershipData) {
    // Check if org already exists for this partnership
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('partnership_id', p.id)
      .maybeSingle();

    if (existingOrg) {
      console.log(`[SKIP] Organization for ${p.slug} already exists`);
      continue;
    }

    const orgData = {
      partnership_id: p.id,
      name: orgNameMap[p.slug] || p.contact_name,
      org_type: p.partnership_type === 'district' ? 'district' : 'school',
    };

    const { error: orgError } = await supabase
      .from('organizations')
      .insert(orgData);

    if (orgError) {
      console.error(`[ERROR] Failed to create org for ${p.slug}:`, orgError.message);
    } else {
      console.log(`[OK] Created organization for ${p.slug}`);
    }
  }
}

async function main() {
  try {
    await seedPartnerships();
    await seedOrganizations();
    console.log('\nSeeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
