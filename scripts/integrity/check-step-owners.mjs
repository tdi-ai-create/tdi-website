#!/usr/bin/env node
/**
 * Every step that sits with TDI must say whose it is.
 *
 * Bella asked, reading the Creator Studio tree, whether it could be made clear
 * what she reviews and what Lily picks up automatically. The honest answer was
 * that the system could not fully say, because ownership is not a property of a
 * step. It lives in TEAM_STEP_GUIDE in lib/creator-team-work.ts, keyed by the
 * step's *name*, matched as a string against milestones.name.
 *
 * A string key drifts in two directions and both had already happened:
 *
 *   A live team step with no entry. Nobody knows whose it is, and the step
 *   opens and waits. "Test Video Approved" was in this state across 18 creator
 *   records.
 *
 *   An entry naming a step that no longer exists. "Final Outline Approved" and
 *   "Course Scripts Approved" were retired on 26 August and their guidance sat
 *   on describing them.
 *
 * Renaming a step in the database silently breaks its ownership, with nothing
 * to say so. This is the check that says so.
 *
 *   node scripts/integrity/check-step-owners.mjs
 *
 * Exits non-zero when a live team step has no owner. Stale entries are reported
 * but do not fail, because they mislead a reader rather than stranding work.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function env() {
  const out = {};
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
  return { ...out, ...process.env };
}

const e = env();
const url = e.NEXT_PUBLIC_SUPABASE_URL;
const key = e.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log('Skipping step owner check: no Supabase credentials available.');
  process.exit(0);
}

// Read the guide from source rather than importing it, so this runs as plain
// node without a TypeScript step.
const src = readFileSync('lib/creator-team-work.ts', 'utf8');
const block = src.slice(src.indexOf('const TEAM_STEP_GUIDE'));
const entries = [...block.matchAll(/^ {2}'([^']+)':\s*\{\s*\n\s*kind:\s*'(agent|human)',\s*who:\s*'([^']+)'/gm)]
  .map(m => ({ step: m[1], kind: m[2], who: m[3] }));

const owned = new Map(entries.map(x => [x.step, x]));

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: steps, error } = await supabase
  .from('milestones')
  .select('name, phase_id, requires_team_action, retired_at')
  .eq('requires_team_action', true);

if (error) {
  console.error('Could not read milestones:', error.message);
  process.exit(1);
}

const live = (steps || []).filter(s => !s.retired_at);
const liveNames = new Set(live.map(s => s.name));

const unowned = live.filter(s => !owned.has(s.name));
const stale = entries.filter(x => !liveNames.has(x.step));

console.log(`${live.length} live team steps, ${owned.size} with an owner defined.\n`);

if (unowned.length) {
  console.log('NO OWNER. These sit with TDI and the system cannot say whose they are:');
  for (const s of unowned) console.log(`  ${s.phase_id.padEnd(16)} ${s.name}`);
  console.log('');
}

if (stale.length) {
  console.log('STALE. Guidance for steps that are retired or no longer exist:');
  for (const x of stale) console.log(`  ${x.who.padEnd(10)} ${x.step}`);
  console.log('');
}

if (!unowned.length && !stale.length) {
  console.log('Every live team step says whose it is, and nothing describes a step that is gone.');
}

// A step nobody owns strands real work. That fails. A stale entry misleads a
// reader, which is worth saying but not worth blocking a merge over.
process.exit(unowned.length ? 1 : 0);
