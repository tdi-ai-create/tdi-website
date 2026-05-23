#!/usr/bin/env node
/**
 * seed-hub-content-calendar.mjs
 * Populates hub_content_calendar with a week-by-week plan for May 2026
 * and the first two weeks of June (launch window).
 *
 * Usage:
 *   node scripts/seed-hub-content-calendar.mjs           # Seed
 *   node scripts/seed-hub-content-calendar.mjs --list    # List calendar events
 *   node scripts/seed-hub-content-calendar.mjs --cleanup # Remove entries from this script
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

// Marker used for cleanup — stored in notes field
const SEED_MARKER = '[seeded:TEA-3027]';

// ── May 2026 + June 1-14 Content Calendar ────────────────────────────────────
//
// Content types: 'course' | 'quick-win' | 'download' | 'announcement' | 'other'
//
// Rhythm:
//   Mon — Substack newsletter send (educator audience post)
//   Wed — Substack newsletter send (educator audience post)
//   Thu — Quick Win drops weekly (pre-launch teaser cycle)
//   Fri — Podcast episode post + weekly wrap
//   Jun 1 — Full platform launch (Hub goes live)
// ─────────────────────────────────────────────────────────────────────────────

const CALENDAR_EVENTS = [
  // ── WEEK 1 (May 1–7) ──────────────────────────────────────────────────────
  {
    title: 'Substack: "You Made It to May. Here\'s What Actually Matters Now."',
    content_type: 'announcement',
    scheduled_date: '2026-05-04',
    notes: 'Monday send [TEACHER]. Seasonal end-of-year post. Rae voice. ' + SEED_MARKER,
  },
  {
    title: 'Substack: End-of-Year Parent Tips (Paid)',
    content_type: 'other',
    scheduled_date: '2026-05-06',
    notes: 'Wednesday paid send [TEACHER]. Parent communication templates + scripts. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: The 3-Minute Reset',
    content_type: 'quick-win',
    scheduled_date: '2026-05-07',
    notes: 'Week 1 quick win tease. Stress Relief / low capacity. Pre-launch awareness. ' + SEED_MARKER,
  },
  {
    title: 'Podcast Post: Amy Storer Episode',
    content_type: 'other',
    scheduled_date: '2026-05-08',
    notes: 'Friday podcast Substack drop. Amy Storer episode goes live. ' + SEED_MARKER,
  },

  // ── WEEK 2 (May 8–14) ─────────────────────────────────────────────────────
  {
    title: 'Substack: [PARA] Monday Send',
    content_type: 'announcement',
    scheduled_date: '2026-05-11',
    notes: 'Monday send [PARA] — satisfies May monthly para minimum. Draft in TEA-2870. ' + SEED_MARKER,
  },
  {
    title: 'Substack: [LEADER] Wednesday Send',
    content_type: 'announcement',
    scheduled_date: '2026-05-13',
    notes: 'Wednesday send [LEADER]. Draft in TEA-2872. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: End-of-Day Brain Dump',
    content_type: 'quick-win',
    scheduled_date: '2026-05-14',
    notes: 'Week 2 quick win. Time Savers / reflect / low capacity. ' + SEED_MARKER,
  },

  // ── WEEK 3 (May 15–21) ────────────────────────────────────────────────────
  {
    title: 'Substack: [TEACHER] End-of-Year Closing Rituals',
    content_type: 'announcement',
    scheduled_date: '2026-05-18',
    notes: 'Monday send [TEACHER]. End-of-year focus — closing routines, final week prep. ' + SEED_MARKER,
  },
  {
    title: 'Substack: [LEADER] Leading Through the Last 2 Weeks',
    content_type: 'announcement',
    scheduled_date: '2026-05-20',
    notes: 'Wednesday send [LEADER]. Leadership focus for end of year — supporting staff. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: Staff Meeting in a Box',
    content_type: 'quick-win',
    scheduled_date: '2026-05-21',
    notes: 'Week 3 quick win. Communication / read / low capacity. Leader-facing. ' + SEED_MARKER,
  },

  // ── WEEK 4 (May 22–28) ────────────────────────────────────────────────────
  {
    title: 'Substack: [TEACHER] Summer Reset — What to Actually Do This Summer',
    content_type: 'announcement',
    scheduled_date: '2026-05-27',
    notes: 'Wednesday send [TEACHER] — Memorial Day week, skip Monday. Permission-giving summer post. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: IEP Prep in 20 Minutes',
    content_type: 'quick-win',
    scheduled_date: '2026-05-28',
    notes: 'Week 4 quick win. Time Savers / download / medium capacity. End-of-year IEP season. ' + SEED_MARKER,
  },

  // ── WEEK 5 (May 29–31) ────────────────────────────────────────────────────
  {
    title: 'Podcast Post: May Finale Episode',
    content_type: 'other',
    scheduled_date: '2026-05-29',
    notes: 'Friday podcast drop. Final May episode. ' + SEED_MARKER,
  },
  {
    title: 'Substack: [TEACHER] You Survived Another Year',
    content_type: 'announcement',
    scheduled_date: '2026-05-30',
    notes: 'Monday send [TEACHER]. Last week of school season. Celebratory / reflective. ' + SEED_MARKER,
  },

  // ── JUNE LAUNCH WEEK (June 1–7) ───────────────────────────────────────────
  {
    title: 'HUB LAUNCH DAY — Platform Goes Live',
    content_type: 'announcement',
    scheduled_date: '2026-06-01',
    notes: 'June 1 launch. Hub accessible to all members. GHL email broadcast to full list. Social push on all channels. ' + SEED_MARKER,
  },
  {
    title: 'Substack: "The Hub Is Here" — Launch Announcement',
    content_type: 'announcement',
    scheduled_date: '2026-06-03',
    notes: 'Wednesday send. Launch announcement for all audiences. Links to Hub signup/access. High-priority send. ' + SEED_MARKER,
  },
  {
    title: 'Social: LinkedIn Carousel — Hub Launch Features',
    content_type: 'announcement',
    scheduled_date: '2026-06-03',
    notes: 'Launch day LinkedIn carousel. 5-7 slides showing key Hub features. Routed to Buffer via Zara. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: The Classroom Reset Protocol',
    content_type: 'quick-win',
    scheduled_date: '2026-06-04',
    notes: 'Launch week quick win spotlight. Classroom Tools / do / low capacity. First live Hub Quick Win. ' + SEED_MARKER,
  },
  {
    title: 'Course Highlight: Stress & Wellness Launch Course',
    content_type: 'course',
    scheduled_date: '2026-06-05',
    notes: 'Friday: spotlight first published Hub course in Stress & Wellness category. Email + social. ' + SEED_MARKER,
  },

  // ── JUNE WEEK 2 (June 8–14) ───────────────────────────────────────────────
  {
    title: 'Substack: [TEACHER] What Teachers Are Saying About the Hub',
    content_type: 'announcement',
    scheduled_date: '2026-06-08',
    notes: 'Monday send [TEACHER]. First post-launch value piece. Early user reactions + feature walkthrough. ' + SEED_MARKER,
  },
  {
    title: 'Substack: [LEADER] How School Leaders Are Using the Hub',
    content_type: 'announcement',
    scheduled_date: '2026-06-10',
    notes: 'Wednesday send [LEADER]. Leadership application of Hub content. Practical use cases. ' + SEED_MARKER,
  },
  {
    title: 'Quick Win Drop: Quick Wins for Paras',
    content_type: 'quick-win',
    scheduled_date: '2026-06-11',
    notes: 'Week 2 post-launch quick win. Para-focused. Time Savers / reflect / low capacity. ' + SEED_MARKER,
  },
  {
    title: 'Podcast + Week 2 Hub Roundup',
    content_type: 'other',
    scheduled_date: '2026-06-12',
    notes: 'Friday podcast drop + second week Hub recap email to engaged users. ' + SEED_MARKER,
  },
];

async function list() {
  const { data, error } = await supabase
    .from('hub_content_calendar')
    .select('id, scheduled_date, title, content_type')
    .order('scheduled_date');
  if (error) { console.error('Failed to list:', error.message); process.exit(1); }
  console.log(`Found ${(data || []).length} calendar events:`);
  (data || []).forEach(ev => {
    console.log(`  ${ev.scheduled_date}  [${ev.content_type}]  ${ev.title}`);
  });
}

async function cleanup() {
  const { error } = await supabase
    .from('hub_content_calendar')
    .delete()
    .ilike('notes', '%' + SEED_MARKER + '%');
  if (error) { console.error('Cleanup failed:', error.message); process.exit(1); }
  console.log('Removed all calendar events seeded by this script.');
}

async function seed() {
  console.log(`Seeding ${CALENDAR_EVENTS.length} calendar events (May + early June 2026)...`);

  const { data, error } = await supabase
    .from('hub_content_calendar')
    .insert(CALENDAR_EVENTS)
    .select();

  if (error) {
    console.error('Insert failed:', error.message);
    console.error('Details:', error.details);
    process.exit(1);
  }

  const byMonth = { May: 0, June: 0 };
  (data || []).forEach(ev => {
    if (ev.scheduled_date.startsWith('2026-05')) byMonth.May++;
    if (ev.scheduled_date.startsWith('2026-06')) byMonth.June++;
  });

  console.log(`\nSeeded ${(data || []).length} calendar events:`);
  console.log(`  May 2026: ${byMonth.May} events`);
  console.log(`  June 2026: ${byMonth.June} events`);
  console.log('\nContent Calendar tab should show May + early June fully populated.');
  console.log('To remove: node scripts/seed-hub-content-calendar.mjs --cleanup');
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
