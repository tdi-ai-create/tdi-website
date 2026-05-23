#!/usr/bin/env node
/**
 * seed-hub-quick-wins.mjs
 * Seeds hub_quick_wins with 10 launch-ready board-demo entries.
 * All entries are real content — no demo flag needed.
 *
 * Usage:
 *   node scripts/seed-hub-quick-wins.mjs           # Seed
 *   node scripts/seed-hub-quick-wins.mjs --list    # List existing quick wins
 *   node scripts/seed-hub-quick-wins.mjs --cleanup # Remove entries created by this script
 *
 * Authored by Izzy Reeves (CMO) for TEA-3027 board demo prep.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) {
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = val;
      }
    });
  } catch (err) {
    console.error('Could not load .env.local:', err.message);
    process.exit(1);
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

// 10 launch-ready Quick Wins — real content, CMO-approved for June 1 Hub launch
const QUICK_WINS = [
  {
    title: 'The 3-Minute Reset',
    description: 'A guided breathing and grounding exercise for the transition between classes or during planning periods. No app needed, no prep required. Tested by teachers who swore they had no time for this — until they tried it.',
    category: 'Stress Relief',
    type: 'do',
    duration_minutes: 3,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'End-of-Day Brain Dump',
    description: 'A 5-question reflection that empties your mental load before you leave campus. Takes less time than checking your email and means you actually stop thinking about work when you get home.',
    category: 'Time Savers',
    type: 'reflect',
    duration_minutes: 5,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'The Sub Survival Pack',
    description: 'A ready-to-print folder of emergency sub plans, seating charts, and classroom norms — built to actually work, not just exist. Includes a "sub left a note" response protocol that stops drama before it starts.',
    category: 'Classroom Tools',
    type: 'download',
    duration_minutes: 10,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'Parent Communication Templates',
    description: 'Three fill-in templates and two boundary-setting scripts for the most common parent messages. The positive update, the concern flag, and the "we need to talk" — all pre-written so you approve, edit, and send.',
    category: 'Communication',
    type: 'download',
    duration_minutes: 15,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'Monday Morning Reset',
    description: 'A 4-minute walkthrough of a simple before-school routine that cuts decision fatigue before first bell. From a veteran teacher who genuinely hated Mondays — until this stopped the spiral before it started.',
    category: 'Self-Care',
    type: 'watch',
    duration_minutes: 4,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'IEP Prep in 20 Minutes',
    description: 'A fill-in document template that organizes present levels, goals, and data in one place — designed for speed without cutting corners on compliance. Includes a pre-meeting checklist and a 3-sentence parent summary template.',
    category: 'Time Savers',
    type: 'download',
    duration_minutes: 20,
    capacity: 'medium',
    is_published: true,
  },
  {
    title: 'The Classroom Reset Protocol',
    description: 'A step-by-step procedure to reestablish expectations mid-year without drama, lectures, or starting over. Works for elementary through high school. Takes one class period and earns back weeks of disruption.',
    category: 'Classroom Tools',
    type: 'do',
    duration_minutes: 10,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'Staff Meeting in a Box',
    description: 'A one-page meeting template leaders actually use: agenda, 15-minute cap items, parking lot, and a 3-minute close. Plug in your data and go. Your staff will notice the difference within two meetings.',
    category: 'Communication',
    type: 'read',
    duration_minutes: 5,
    capacity: 'low',
    is_published: true,
  },
  {
    title: 'Quick Wins for Paras',
    description: 'A reflection guide for paraprofessionals who want to make the most of their time with students. Clarifies your role, sharpens your instincts, and gives you language for the moments that feel murky.',
    category: 'Time Savers',
    type: 'reflect',
    duration_minutes: 5,
    capacity: 'low',
    is_published: true,
  },
  {
    title: '5-Minute Community Builders',
    description: 'Three low-prep activities that build classroom trust without requiring supplies, setup, or the risk of awkwardness. Works any week of the year. No instructions to print, no materials to gather.',
    category: 'Classroom Tools',
    type: 'do',
    duration_minutes: 5,
    capacity: 'low',
    is_published: true,
  },
];

async function list() {
  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('id, title, category, type, is_published, created_at')
    .order('created_at', { ascending: false });
  if (error) { console.error('Failed to list:', error.message); process.exit(1); }
  console.log(`Found ${(data || []).length} quick wins:`);
  (data || []).forEach(qw => {
    console.log(`  [${qw.is_published ? 'PUB' : 'DRAFT'}] ${qw.title} (${qw.category}, ${qw.type})`);
  });
}

async function cleanup() {
  const slugs = QUICK_WINS.map(qw => titleToSlug(qw.title));
  const { error } = await supabase
    .from('hub_quick_wins')
    .delete()
    .in('slug', slugs);
  if (error) { console.error('Cleanup failed:', error.message); process.exit(1); }
  console.log(`Removed quick wins seeded by this script (matched by slug).`);
}

async function seed() {
  const rows = QUICK_WINS.map(qw => ({
    ...qw,
    slug: titleToSlug(qw.title),
  }));

  console.log(`Seeding ${rows.length} Quick Wins...`);

  const { data, error } = await supabase
    .from('hub_quick_wins')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false })
    .select();

  if (error) {
    console.error('Insert failed:', error.message);
    console.error('Details:', error.details);
    process.exit(1);
  }

  console.log(`\nSeeded ${(data || []).length} Quick Wins:`);
  (data || []).forEach(qw => {
    console.log(`  [${qw.is_published ? 'PUBLISHED' : 'DRAFT'}] ${qw.title}`);
  });

  console.log('\nQuick Wins tab should now show 10 published items.');
  console.log('To remove: node scripts/seed-hub-quick-wins.mjs --cleanup');
}

const isCleanup = process.argv.includes('--cleanup');
const isList = process.argv.includes('--list');

if (isList) {
  list().catch(err => { console.error(err); process.exit(1); });
} else if (isCleanup) {
  cleanup().catch(err => { console.error(err); process.exit(1); });
} else {
  seed().catch(err => { console.error(err); process.exit(1); });
}
