/**
 * Post the TDI voice openers and questions onto quick win pages.
 *
 * Rules these posts follow, and the script enforces the first two:
 *   - no post is ever repeated anywhere in the Hub
 *   - every second post on a tool ends in a question
 *   - no invented classroom moment, no numbers from inside TDI
 *
 * Timestamps are real. Nothing is backdated.
 *
 *   node scripts/seed-tdi-voice-posts.mjs              # dry run, writes nothing
 *   node scripts/seed-tdi-voice-posts.mjs --apply
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const supabase = createClient(
  env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL,
  env.LEARNING_HUB_SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// quick_win_id, voice display name, type, body
const POSTS = [
  ['9165cff2-9d32-48cd-a75b-e09bf299d663', 'Bettina Kowalczyk', 'from_tdi',
   'This is split into classroom, planning and personal on purpose. September overwhelm usually has one of those three doing most of the damage, and it is rarely the one you would guess.'],
  ['9165cff2-9d32-48cd-a75b-e09bf299d663', 'Simone Ashcroft', 'question',
   'If you have run a September reset before, which column did you have to deal with first, the classroom, the planning or the personal?'],

  ['231cbdbe-f3be-4355-b721-1f6dbfce4bd2', 'Everett Crane', 'from_tdi',
   'Read these out loud before you need them. A script you have only read silently comes out stiff in the moment, which is exactly when it has to sound like you.'],
  ['231cbdbe-f3be-4355-b721-1f6dbfce4bd2', 'Rosalie Dunne', 'question',
   'Which line here would be hardest to say calmly when the room is already loud?'],

  ['83c33eab-3913-485f-aa94-2addcf419026', 'Gus Halvorsen', 'from_tdi',
   'This lands better when a whole staff plays it than when one person does. Bingo on your own in December is just another task on the pile.'],
  ['83c33eab-3913-485f-aa94-2addcf419026', 'Priya Raghunathan', 'question',
   'If you have run a staff challenge in December, what made people actually join in rather than nod and forget?'],

  ['5171c858-621c-4e64-b93c-bc33923f9815', 'Camille Thibodeaux', 'from_tdi',
   'The steps are ordered smallest first on purpose. Anyone genuinely burned out does not need a plan that opens with reconnect with your purpose.'],
  ['5171c858-621c-4e64-b93c-bc33923f9815', 'Trevon Baptiste', 'question',
   'When you are running on empty, what is the smallest thing that has actually helped, the kind that takes five minutes?'],

  ['9e7f27e2-8c6d-4b22-bfcc-8b78112fd434', 'Hana Sugimoto', 'from_tdi',
   'Do the control versus not control worksheet before the countdown checklist. The countdown gets easier once you have put down the things you cannot move.'],
  ['9e7f27e2-8c6d-4b22-bfcc-8b78112fd434', 'Wendell Prosser', 'question',
   'During the testing window, what is the one thing you most wish somebody else would handle for you?'],

  ['b58e430f-24ee-4690-a2ba-290f1352958f', 'Ofelia Marchetti', 'from_tdi',
   'This is meant to be done standing up, at the door, in about two minutes. If it turns into another sit down task it will not survive a Tuesday.'],
  ['b58e430f-24ee-4690-a2ba-290f1352958f', 'Lorna Stimpson', 'question',
   'What is on your own end of day list that is not on this one?'],

  ['01e7a497-b00c-4b72-a049-368223c3e1ca', 'Jarrod Levins', 'from_tdi',
   'If you are moving into a new role, do the first section with someone who has held it before. It works alone, it works better across a table.'],
  ['01e7a497-b00c-4b72-a049-368223c3e1ca', 'Deacon Mwangi', 'question',
   'What surprised you most in your first month in a new role or a new building?'],
];

const apply = process.argv.includes('--apply');

// Rule check 1: nothing repeated, here or already in the Hub
const bodies = POSTS.map(p => p[3]);
const dupes = bodies.filter((b, i) => bodies.indexOf(b) !== i);
if (dupes.length) {
  console.error('Repeated body in this batch:', dupes[0]);
  process.exit(1);
}

const { data: existingRows, error: existingError } = await supabase
  .from('quick_win_responses')
  .select('body');
if (existingError) {
  console.error('Could not read existing posts:', existingError.message);
  process.exit(1);
}
const existing = new Set((existingRows || []).map(r => (r.body || '').trim()));
const collisions = bodies.filter(b => existing.has(b.trim()));
if (collisions.length) {
  console.error('Body already exists in the Hub:', collisions[0]);
  process.exit(1);
}

// Rule check 2: every second post on a tool is a question
const byTool = {};
for (const [toolId, , type] of POSTS) (byTool[toolId] ||= []).push(type);
for (const [toolId, types] of Object.entries(byTool)) {
  const questions = types.filter(t => t === 'question').length;
  if (questions < Math.floor(types.length / 2)) {
    console.error(`Tool ${toolId} has ${types.length} posts but only ${questions} question(s)`);
    process.exit(1);
  }
}

const { data: voices, error: voiceError } = await supabase
  .from('hub_profiles')
  .select('id, display_name')
  .eq('is_tdi_voice', true);
if (voiceError) {
  console.error('Could not read voices:', voiceError.message);
  process.exit(1);
}
const voiceId = Object.fromEntries((voices || []).map(v => [v.display_name, v.id]));

const missing = [...new Set(POSTS.map(p => p[1]))].filter(n => !voiceId[n]);
if (missing.length) {
  console.error('No TDI voice account named:', missing.join(', '));
  process.exit(1);
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${POSTS.length} posts across ${Object.keys(byTool).length} tools`);
console.log(`checks passed: no repeats in batch, no collisions with ${existing.size} existing posts, question cadence holds\n`);

let written = 0;
for (const [toolId, name, type, body] of POSTS) {
  if (!apply) {
    console.log(`  would  ${type.padEnd(9)} ${name.padEnd(20)} ${body.slice(0, 64)}...`);
    continue;
  }
  const { error } = await supabase.from('quick_win_responses').insert({
    quick_win_id: toolId,
    user_id: voiceId[name],
    contribution_type: type,
    title: null,
    body,
    helpful_count: 0,
  });
  if (error) {
    console.log(`  FAILED ${name.padEnd(20)} ${error.message}`);
    continue;
  }
  console.log(`  wrote  ${type.padEnd(9)} ${name.padEnd(20)} ${body.slice(0, 54)}...`);
  written++;
}

console.log(`\n${apply ? `written: ${written}` : `would write: ${POSTS.length}`}`);
