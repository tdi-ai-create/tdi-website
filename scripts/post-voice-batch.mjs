/**
 * Post a written batch of TDI voice posts onto quick win pages.
 *
 * Reads a file under scripts/voice-posts/ and writes it, refusing if any rule
 * is broken. The rules are the whole point, so they are checked here rather
 * than trusted:
 *
 *   - no body may already exist anywhere in the Hub, and none may repeat
 *     inside the batch
 *   - every tool gets 1 to 6 comments and 1 to 6 questions
 *   - every author must be a TDI-owned account
 *   - nothing is backdated
 *
 *   node scripts/post-voice-batch.mjs self-care          # dry run
 *   node scripts/post-voice-batch.mjs self-care --apply
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const name = process.argv[2];
const apply = process.argv.includes('--apply');

if (!name) {
  console.error('Usage: node scripts/post-voice-batch.mjs <batch-name> [--apply]');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);

const supabase = createClient(
  env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL,
  env.LEARNING_HUB_SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const batch = JSON.parse(readFileSync(new URL(`./voice-posts/${name}.json`, import.meta.url), 'utf8'));

// Resolve ids from slugs. Transcribing uuids by hand is how a batch lands on
// the wrong tool, and a wrong slug should stop the run rather than write there.
const slugs = batch.tools.map(t => t.slug);
const { data: toolRows, error: toolError } = await supabase
  .from('hub_quick_wins').select('id, slug, is_published').in('slug', slugs);
if (toolError) { console.error('Could not read tools:', toolError.message); process.exit(1); }
const toolBySlug = Object.fromEntries((toolRows ?? []).map(t => [t.slug, t]));

const rows = [];
for (const tool of batch.tools) {
  for (const [author, type, body] of tool.posts) {
    rows.push({ slug: tool.slug, toolId: toolBySlug[tool.slug]?.id, author, type, body });
  }
}

const problems = [];

for (const tool of batch.tools) {
  const found = toolBySlug[tool.slug];
  if (!found) problems.push(`no published quick win with slug "${tool.slug}"`);
  else if (!found.is_published) problems.push(`${tool.slug}: exists but is not published`);
}

// Rule: 1 to 6 comments and 1 to 6 questions on every tool.
for (const tool of batch.tools) {
  const questions = tool.posts.filter(p => p[1] === 'question').length;
  const comments = tool.posts.filter(p => p[1] !== 'question').length;
  if (comments < 1 || comments > 6) problems.push(`${tool.slug}: ${comments} comment(s), needs 1 to 6`);
  if (questions < 1 || questions > 6) problems.push(`${tool.slug}: ${questions} question(s), needs 1 to 6`);
}

// Rule: no post claims a classroom moment, and no post breaks house style.
// This is the rule the whole exercise exists for, so it is checked rather than
// trusted. First person plus a classroom object is the shape of the fabricated
// testimonials being replaced.
const CLAIMS = [
  /\bI (used|tried|ran|taught|did) (this|it|these)\b/i,
  /\bmy (students|class|kids|room|3rd|4th|5th) /i,
  /\bwe (used|tried|ran) (this|it) (with|in) /i,
  /\bwhen I (used|tried|taught) /i,
  /\blast (week|year|term) I\b/i,
];
const STYLE = [
  [/--/, 'double hyphen'],
  [/\u2014|\u2013/, 'em or en dash'],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'emoji'],
  [/\b\d+\s?%/, 'a percentage'],
];
for (const r of rows) {
  for (const re of CLAIMS) {
    if (re.test(r.body)) problems.push(`${r.slug}: claims a classroom moment, "${r.body.slice(0, 70)}..."`);
  }
  for (const [re, label] of STYLE) {
    if (re.test(r.body)) problems.push(`${r.slug}: contains ${label}, "${r.body.slice(0, 70)}..."`);
  }
}

// Rule: nothing repeats inside the batch.
const seen = new Map();
for (const r of rows) {
  const key = r.body.trim();
  if (seen.has(key)) problems.push(`repeated in this batch: "${key.slice(0, 60)}..."`);
  seen.set(key, true);
}

// Rule: nothing repeats anything already in the Hub. Paged, because a plain
// select stops at a thousand rows and says nothing about the rest.
const existing = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from('quick_win_responses').select('body').range(from, from + 999);
  if (error) { console.error('Could not read existing posts:', error.message); process.exit(1); }
  for (const row of data ?? []) existing.add((row.body || '').trim());
  if (!data || data.length < 1000) break;
}
for (const r of rows) {
  if (existing.has(r.body.trim())) problems.push(`already in the Hub: "${r.body.slice(0, 60)}..."`);
}

// Rule: every author is an account TDI owns.
const { data: voices, error: voiceError } = await supabase
  .from('hub_profiles').select('id, display_name').eq('is_tdi_voice', true);
if (voiceError) { console.error('Could not read voices:', voiceError.message); process.exit(1); }
const voiceId = Object.fromEntries((voices ?? []).map(v => [v.display_name, v.id]));
for (const authorName of new Set(rows.map(r => r.author))) {
  if (!voiceId[authorName]) problems.push(`no TDI voice account named "${authorName}"`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s), nothing written:\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${rows.length} posts across ${batch.tools.length} tools in "${batch.category}"`);
console.log(`checked against ${existing.size} existing bodies. No repeats, cadence holds, every author is ours.\n`);

if (!apply) {
  for (const t of batch.tools) {
    const q = t.posts.filter(p => p[1] === 'question').length;
    console.log(`  ${t.slug.padEnd(44)} ${t.posts.length - q} comment(s), ${q} question(s)`);
  }
  console.log('\nRun again with --apply to write them.');
  process.exit(0);
}

let written = 0;
for (const r of rows) {
  const { error } = await supabase.from('quick_win_responses').insert({
    quick_win_id: r.toolId,
    user_id: voiceId[r.author],
    contribution_type: r.type,
    title: null,
    body: r.body,
    helpful_count: 0,
  });
  if (error) { console.log(`  FAILED ${r.slug} ${r.author}: ${error.message}`); continue; }
  written++;
}

console.log(`written: ${written} of ${rows.length}`);
