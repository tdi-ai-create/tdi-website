#!/usr/bin/env node
/**
 * Did you just edit a component nobody can reach.
 *
 *   npm run check:reachable          changed files only, exits non-zero
 *   npm run check:reachable -- --all  the whole repo, for measuring the backlog
 *
 * On 13 September a fix for Bella's "add a follow up button" request went into
 * app/tdi-admin/funding/components/MyTasks.tsx. Nothing imports MyTasks.tsx. It
 * shipped, it typechecked, it deployed, and it changed nothing for her. It was
 * caught by loading the page afterwards, which is luck rather than process.
 *
 * That file had already absorbed a fix that never ran once before. A Record tab
 * was built inside PanelShell.tsx and shipped completely unreachable. CLAUDE.md
 * has said "confirm something imports it" since August, and the rule was skipped
 * anyway, which is the same thing that happened with silent writes: writing it
 * down did not prevent the fourth instance, so it became check:writes.
 *
 * This is that, for reachability.
 *
 * A ratchet, not a wall. `npm run deadcode` already knows all of this and
 * reports 102 unused files, which is why nobody reads it. This judges only the
 * files you changed, so an existing graveyard does not block unrelated work,
 * and new edits cannot quietly land in it.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

const all = process.argv.includes('--all');

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

/** Files that are reachable by being a route, not by being imported. */
const ENTRY_POINTS =
  /(^|\/)(page|layout|route|template|loading|error|not-found|default|middleware|instrumentation)\.(ts|tsx)$/;

/** Not components. Judged by other checks, or run directly. */
const EXEMPT = /^(scripts|supabase|public)\//;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e === '.git' || e === '.claude') continue;
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    // .mjs and .js included as readers. Missing them meant check-guards.mjs
    // was never read, so the guard registry it imports looked unreachable.
    else if (/\.(ts|tsx|mts|mjs|js)$/.test(p)) out.push(p);
  }
  return out;
}

// Every source file in the repo, read once. The import graph is small enough
// that scanning text beats building a real module graph, and a missed import is
// a false pass rather than a false failure, which is the right way round for a
// gate that blocks merges.
// scripts/ is read as a *source of imports* but never judged as a file that
// needs one. lib/health/guards.ts is imported only by
// scripts/check-guards.mjs, so leaving scripts out reported the guard
// registry as unreachable. A gate that fails honest work gets switched off
// faster than a leaky one gets trusted.
const SOURCE_DIRS = ['app', 'lib', 'components', 'scripts'];
const allFiles = SOURCE_DIRS.flatMap((d) => walk(d));
const contents = new Map();
for (const f of allFiles) {
  try {
    contents.set(f, readFileSync(f, 'utf8'));
  } catch {
    /* unreadable is not unreachable; skip rather than fail */
  }
}

/**
 * Does anything other than the file itself refer to it.
 *
 * Matched on the module specifier rather than the bare word, so a component
 * named Card is not considered imported because some unrelated file says
 * "card". Both the aliased and relative forms are covered.
 */
function hasImporter(file) {
  const name = basename(file).replace(/\.(ts|tsx|mts)$/, '');
  const withoutExt = file.replace(/\.(ts|tsx|mts)$/, '');
  const aliased = '@/' + withoutExt;

  // An optional explicit extension. scripts/check-guards.mjs imports
  // '../lib/health/guards.ts' with the extension written out, which every
  // extensionless pattern missed.
  const ext = '(?:\\.(?:ts|tsx|mts|js|mjs))?';

  const patterns = [
    new RegExp(`from\\s+['"]${escape(aliased)}${ext}['"]`),
    new RegExp(`import\\s*\\(\\s*['"]${escape(aliased)}${ext}['"]`),
    // Relative: any path that ends with /<name> or is ./<name>
    new RegExp(`from\\s+['"][^'"]*\\/${escape(name)}${ext}['"]`),
    new RegExp(`from\\s+['"]\\.\\/${escape(name)}${ext}['"]`),
    new RegExp(`import\\s*\\(\\s*['"][^'"]*\\/${escape(name)}${ext}['"]`),
  ];

  for (const [other, src] of contents) {
    if (other === file) continue;
    if (patterns.some((re) => re.test(src))) return true;
  }
  return false;
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let targets;

if (all) {
  targets = allFiles;
} else {
  let base = 'origin/main';
  try {
    sh('git', ['rev-parse', '--verify', base]);
  } catch {
    base = 'main';
  }

  let changed = [];
  try {
    const a = sh('git', ['diff', '--name-only', `${base}...HEAD`]);
    const b = sh('git', ['diff', '--name-only', 'HEAD']);
    const c = sh('git', ['diff', '--name-only', '--cached']);
    changed = [...new Set([...a.split('\n'), ...b.split('\n'), ...c.split('\n')])];
  } catch (err) {
    console.error('Could not work out what changed, so checking nothing.');
    console.error(String(err.message || err));
    process.exit(0);
  }

  targets = changed
    .filter(Boolean)
    .filter((f) => /^(app|lib|components)\/.*\.(ts|tsx)$/.test(f))
    .filter((f) => existsSync(f));
}

const judged = targets
  .filter((f) => !EXEMPT.test(f))
  .filter((f) => !ENTRY_POINTS.test(f));

if (judged.length === 0) {
  console.log('No changed files that need an importer. Nothing to check.');
  process.exit(0);
}

console.log(
  all
    ? `Checking all ${judged.length} non-entry-point source files for an importer.`
    : `Checking ${judged.length} changed file(s) for an importer.`,
);

const orphans = judged.filter((f) => !hasImporter(f));

if (orphans.length === 0) {
  console.log('Every file you changed is imported by something.');
  process.exit(0);
}

console.error('');
for (const f of orphans) {
  console.error(`  ${f}`);
  console.error('    Nothing imports this. Editing it changes nothing for anyone.');
}
console.error('');
console.error('A component with no importer ships unreachable.');
console.error('');
console.error('MyTasks.tsx took a fix for Bella on 13 September and never ran it.');
console.error('A Record tab was built inside PanelShell.tsx and shipped the same way.');
console.error('');
console.error('Either wire it to something on a live route, or delete it. If it is');
console.error('genuinely reached another way, say how in the same commit.');

process.exit(all ? 0 : 1);
