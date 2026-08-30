/**
 * Every upsert names a conflict target. Does that target actually exist.
 *
 * `.upsert(row, { onConflict: 'a,b' })` becomes ON CONFLICT (a, b), which needs
 * a unique index on exactly those columns. Without one, Postgres answers 42P10
 * and refuses the write every single time that line runs.
 *
 * On 29 Aug 2026 five call sites named targets that do not exist, all on
 * partnership_users, which has no unique index but its primary key:
 *
 *   api/partners/invite-leader        partnership_id,user_id   twice
 *   api/tdi-admin/leadership/invite   partnership_id,user_id   twice
 *   api/partners/champion             partnership_id,role
 *
 * Four discarded the error and reported success, so a school invited a leader,
 * saw a confirmation, and that person was never granted access. The fifth had
 * been fixed to check its error, which turned the same bug into a hard 500 on
 * every admin invite of someone who already had an account.
 *
 * Partial indexes are deliberately excluded from the baseline. `CREATE UNIQUE
 * INDEX ... WHERE ...` cannot be an ON CONFLICT target through PostgREST, and
 * assuming otherwise is what silently broke the attention-flags cron in August.
 *
 * The baseline is a committed snapshot rather than a live read, because
 * PostgREST cannot expose pg_indexes without a helper function and adding one
 * to production is not this check's business. Regenerate it after a migration
 * with the SQL at the bottom of this file.
 *
 * Run: node scripts/integrity/verify-upsert-targets.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASELINE = 'scripts/integrity/upsert-target-baseline.json';

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
} catch (err) {
  console.error(`Cannot read ${BASELINE}: ${err.message}`);
  console.error('Without it this check cannot judge anything, so it fails rather than passing.');
  process.exit(1);
}

// table -> Set of valid targets, columns sorted, merged across both databases.
const valid = new Map();
const knownTables = new Set();
for (const project of ['partnerships', 'learning-hub']) {
  for (const [table, targets] of Object.entries(baseline[project] ?? {})) {
    knownTables.add(table);
    if (!valid.has(table)) valid.set(table, new Set());
    for (const t of targets) valid.get(table).add(t);
  }
}

if (knownTables.size === 0) {
  console.error(`${BASELINE} lists no tables. Refusing to pass on an empty baseline.`);
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry)) files.push(full);
  }
};
for (const root of ['app', 'lib', 'components', 'scripts']) {
  try { walk(root); } catch { /* directory absent */ }
}

const knownBroken = baseline.known_broken ?? {};
const problems = [];
const stillBroken = [];
const unknown = [];
let checked = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('onConflict')) continue;

  for (const m of src.matchAll(/onConflict:\s*'([^']+)'/g)) {
    const target = m[1];
    // The table is whichever .from('...') most recently opened before this.
    const froms = [...src.slice(0, m.index).matchAll(/\.from\(\s*'([a-z0-9_]+)'\s*\)/g)];
    if (froms.length === 0) continue;
    const table = froms[froms.length - 1][1];
    const line = src.slice(0, m.index).split('\n').length;
    checked++;

    if (!knownTables.has(table)) {
      unknown.push(`${file}:${line} upserts into "${table}", which is not in the baseline`);
      continue;
    }

    const cols = target.split(',').map((c) => c.trim()).sort().join(',');
    if (!valid.get(table).has(cols)) {
      // Already known and recorded. The check exists to stop new ones, not to
      // fail forever on a backlog nobody can clear in one pull request.
      if (knownBroken[file]) {
        stillBroken.push(`${file}:${line} ${knownBroken[file]}`);
        continue;
      }
      problems.push(
        `${file}:${line}\n      upsert on ${table} names (${target})\n      available: ${[...valid.get(table)].map((t) => `(${t})`).join(', ')}`
      );
    }
  }
}

console.log(`\nChecked ${checked} upsert target(s) against ${knownTables.size} tables in the baseline.`);

if (stillBroken.length > 0) {
  console.log(`\n${stillBroken.length} known broken target(s), unchanged:`);
  for (const b of stillBroken) console.log(`  ${b}`);
}

// A fixed entry left in the baseline hides the next regression at that path.
const fixed = Object.keys(knownBroken).filter((f) => !stillBroken.some((b) => b.startsWith(`${f}:`)));
if (fixed.length > 0) {
  console.error(`\n${fixed.length} entr(ies) in known_broken no longer match anything. Remove them from ${BASELINE}:`);
  for (const f of fixed) console.error(`  ${f}`);
  process.exit(1);
}

if (unknown.length > 0) {
  console.log(`\n${unknown.length} upsert(s) target a table the baseline does not know. Regenerate it after a migration.`);
  for (const u of unknown) console.log(`  ${u}`);
}

if (problems.length > 0) {
  console.error(`\n${problems.length} upsert(s) name a conflict target that does not exist:\n`);
  for (const p of problems) console.error(`  ${p}\n`);
  console.error('Postgres answers 42P10 and refuses the write every time these run.');
  console.error('Add the unique index, or look the row up and insert or update it explicitly.');
  console.error('lib/partners/link-user.ts is the worked example.\n');
  process.exit(1);
}

console.log('Every upsert names a conflict target that exists.\n');

/*
Regenerate the baseline by running this against each project and pasting the
result into upsert-target-baseline.json. Partial indexes are excluded on
purpose, because they cannot be ON CONFLICT targets.

  select tablename, (select string_agg(c, ',' order by c)
      from unnest(string_to_array(regexp_replace(
        substring(indexdef from '\(([^)]+)\)\s*(NULLS NOT DISTINCT)?\s*$'),
        '\s+(ASC|DESC)', '', 'g'), ', ')) c) as target
  from pg_indexes
  where schemaname = 'public'
    and indexdef like 'CREATE UNIQUE%'
    and indexdef not like '%WHERE%'
  order by 1, 2;
*/
