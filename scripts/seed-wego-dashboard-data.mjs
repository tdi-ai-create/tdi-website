#!/usr/bin/env node
/**
 * Seed WEGO Dashboard Data Script
 * Seeds real WEGO data from the legacy dashboard into the database
 * Run: node scripts/seed-wego-dashboard-data.mjs
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

async function seedWEGOData() {
  console.log('Starting WEGO dashboard data seeding...\n');

  // Get WEGO partnership
  const { data: partnership, error: pError } = await supabase
    .from('partnerships')
    .select('id, slug')
    .eq('slug', 'wego-district-94')
    .single();

  if (pError || !partnership) {
    console.error('WEGO partnership not found:', pError?.message);
    process.exit(1);
  }

  console.log(`Found WEGO partnership: ${partnership.id}\n`);

  // Update WEGO with real dashboard data from legacy file
  console.log('Updating partnership with dashboard data...');
  const { error: updateError } = await supabase
    .from('partnerships')
    .update({
      observation_days_total: 4,
      observation_days_used: 3,
      virtual_sessions_total: 6,
      virtual_sessions_used: 2,
      executive_sessions_total: 4,
      executive_sessions_used: 0,
      contract_start: '2025-07-31',
      contract_end: '2026-05-30',
      primary_contact_name: 'Juan Suarez',
      primary_contact_email: 'jsuarez@wego94.org',
      staff_enrolled: 19,
      hub_login_pct: 89,
      momentum_status: 'Strong',
      momentum_detail: '100% Hub login rate - all 19 PAs activated · 3 observation days + 3 on-site coachings complete · 21 personalized Love Notes delivered · Year 1 Celebration + Year 2 Planning to schedule',
      cost_per_educator: 842,
      love_notes_count: 21,
      high_engagement_pct: 62.5,
      data_updated_at: '2026-02-25',
    })
    .eq('id', partnership.id);

  if (updateError) {
    console.error('Failed to update partnership:', updateError.message);
  } else {
    console.log('[OK] Updated partnership dashboard fields');
  }

  // Insert metric snapshots
  console.log('\nInserting metric snapshots...');
  const metrics = [
    { metric_name: 'hub_login_pct', metric_value: 89 },
    { metric_name: 'staff_enrolled', metric_value: 19 },
    { metric_name: 'love_notes_delivered', metric_value: 21 },
    { metric_name: 'high_engagement_pct', metric_value: 62.5 },
    { metric_name: 'cost_per_educator', metric_value: 842 },
  ];

  for (const metric of metrics) {
    const { error } = await supabase
      .from('metric_snapshots')
      .insert({
        partnership_id: partnership.id,
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        snapshot_date: '2026-02-25',
        source: 'manual',
      });

    if (error) {
      console.log(`[SKIP] ${metric.metric_name}: ${error.message}`);
    } else {
      console.log(`[OK] ${metric.metric_name}: ${metric.metric_value}`);
    }
  }

  // Insert timeline events
  console.log('\nInserting timeline events...');

  // Clear existing timeline events for WEGO to avoid duplicates
  await supabase
    .from('timeline_events')
    .delete()
    .eq('partnership_id', partnership.id);

  const timelineEvents = [
    // Completed events
    { event_title: 'Partnership launched - 19 PAs enrolled', event_date: '2025-09-25', event_type: 'milestone', status: 'completed' },
    { event_title: '100% Hub activation - all 19 PAs logged in', event_date: '2025-10-01', event_type: 'milestone', status: 'completed' },
    { event_title: 'Subgroups established - 4 groups meeting every Monday', event_date: '2025-10-01', event_type: 'milestone', status: 'completed' },
    { event_title: 'Observation Day 1 - 8 PAs observed, Love Notes delivered', event_date: '2025-11-12', event_type: 'observation', status: 'completed' },
    { event_title: 'On-Site Coaching 1 - strategies session complete', event_date: '2025-11-01', event_type: 'coaching', status: 'completed' },
    { event_title: 'Observation Day 2 - 11 PAs observed, Love Notes delivered', event_date: '2025-12-03', event_type: 'observation', status: 'completed' },
    { event_title: 'On-Site Coaching 2 - strategies session complete', event_date: '2025-12-01', event_type: 'coaching', status: 'completed' },
    { event_title: 'On-Site Coaching 3 - strategies session complete', event_date: '2026-01-01', event_type: 'coaching', status: 'completed' },
    { event_title: 'Virtual Session 1 complete', event_date: '2026-01-01', event_type: 'virtual_session', status: 'completed' },
    { event_title: 'Virtual Session 2 complete', event_date: '2026-02-01', event_type: 'virtual_session', status: 'completed' },
    { event_title: 'Observation Day 3 - 7 PAs observed, Love Notes delivered', event_date: '2026-02-25', event_type: 'observation', status: 'completed' },

    // In progress
    { event_title: '19/19 PAs Hub activated - 17 with tracked course activity', event_date: null, event_type: 'milestone', status: 'in_progress', details: '89% engagement and growing' },
    { event_title: 'Weekly subgroups running - every Monday 7:45-9AM', event_date: null, event_type: 'milestone', status: 'in_progress', details: 'EL, Self Contained, DLP, Transition (Step)' },
    { event_title: 'Monthly full-group session with Rae - ongoing', event_date: null, event_type: 'milestone', status: 'in_progress', details: 'Themed discussion + implementation support' },
    { event_title: 'Year 2 teacher expansion in planning', event_date: null, event_type: 'milestone', status: 'in_progress', details: 'To be confirmed at Year 1 Celebration' },

    // Upcoming
    { event_title: 'Virtual Session 4', event_date: '2026-03-16', event_type: 'virtual_session', status: 'upcoming' },
    { event_title: 'Virtual Session 5', event_date: '2026-04-13', event_type: 'virtual_session', status: 'upcoming' },
    { event_title: 'Year 1 Celebration + Year 2 Planning', event_date: '2026-04-01', event_type: 'milestone', status: 'upcoming' },
    { event_title: 'Virtual Session 6 (Final)', event_date: '2026-05-11', event_type: 'virtual_session', status: 'upcoming' },
  ];

  for (const event of timelineEvents) {
    const { error } = await supabase
      .from('timeline_events')
      .insert({
        partnership_id: partnership.id,
        ...event,
      });

    if (error) {
      console.log(`[ERROR] ${event.event_title}: ${error.message}`);
    } else {
      console.log(`[OK] ${event.status}: ${event.event_title}`);
    }
  }

  // Verify
  console.log('\n--- Verification ---');

  const { data: verifyPartnership } = await supabase
    .from('partnerships')
    .select('staff_enrolled, hub_login_pct, momentum_status, love_notes_count, observation_days_used, virtual_sessions_used')
    .eq('id', partnership.id)
    .single();

  console.log('\nPartnership data:');
  console.log(`  Staff: ${verifyPartnership?.staff_enrolled}`);
  console.log(`  Hub Login: ${verifyPartnership?.hub_login_pct}%`);
  console.log(`  Momentum: ${verifyPartnership?.momentum_status}`);
  console.log(`  Love Notes: ${verifyPartnership?.love_notes_count}`);
  console.log(`  Obs Days: ${verifyPartnership?.observation_days_used}/4`);
  console.log(`  Virtual Sessions: ${verifyPartnership?.virtual_sessions_used}/6`);

  const { count: eventCount } = await supabase
    .from('timeline_events')
    .select('*', { count: 'exact', head: true })
    .eq('partnership_id', partnership.id);

  console.log(`\nTimeline events: ${eventCount}`);

  console.log('\nWEGO dashboard data seeding complete!');
}

seedWEGOData().catch(console.error);
