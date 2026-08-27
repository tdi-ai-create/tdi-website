// Which admin API routes actually check who is calling?
//
// /api/admin/creator-recruitment carried a comment saying "admin session
// handles auth" while checking nothing at all. This asks the question of every
// route under app/api/admin so the answer is a list rather than an impression.
//
//   node scripts/integrity/admin-api-auth-audit.mjs
//
// Exits non-zero if any route exposes a handler with no recognised guard.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'app/api/admin';

// Anything that establishes the caller's identity or requires a shared secret.
const GUARDS = [
  'requireAdminAuth',
  'isTDIAdmin',
  'checkTeamAccess',
  'PAPERCLIP_SYNC_KEY',
  'CRON_SECRET',
  'requireCron',
  'getAdminUser',
  'verifyAdmin',
  'assertAdmin',
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry === 'route.ts' || entry === 'route.tsx') out.push(p);
  }
  return out;
}

const routes = walk(ROOT).sort();
const open = [];
const guarded = [];

// Comments are where beliefs about auth live, not auth. creator-recruitment
// carries the line "No PAPERCLIP_SYNC_KEY required (admin session handles
// auth)" and checks nothing, which is exactly the case this must catch, so
// comments are stripped before looking for a guard.
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

// Import lines go too. A route that imports requireAdminAuth and never calls it
// is exactly as open as one that never heard of it, and an earlier version of
// this script passed that case: deleting the two guard lines from
// creator-recruitment left the import behind and the audit still reported the
// route as guarded. The check has to look for a call, not a mention.
function stripImports(s) {
  return s.replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
}

for (const file of routes) {
  const src = readFileSync(file, 'utf8');
  const code = stripImports(stripComments(src));
  const methods = [...code.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]);
  if (methods.length === 0) continue;

  const guard = GUARDS.find((g) => new RegExp(`\\b${g}\\s*\\(|\\b${g}\\b\\s*[=!]==?`).test(code));
  const writes = methods.some((m) => m !== 'GET');

  const record = { file: file.replace(`${ROOT}/`, '').replace('/route.ts', ''), methods, guard, writes };
  (guard ? guarded : open).push(record);
}

console.log(`${routes.length} admin route files, ${guarded.length + open.length} with handlers\n`);
console.log(`GUARDED: ${guarded.length}`);
console.log(`UNGUARDED: ${open.length}\n`);

const writeFirst = [...open].sort((a, b) => Number(b.writes) - Number(a.writes));
console.log('Routes with no recognised auth guard, writers first:\n');
for (const r of writeFirst) {
  console.log(`  ${r.writes ? 'WRITES' : 'reads '}  ${r.methods.join(',').padEnd(18)} ${r.file}`);
}

// ---- gate ------------------------------------------------------------------
//
// 61 routes are unguarded today. A check that fails on all of them is a check
// nobody can pass, so it is baselined: the existing holes are recorded and this
// fails only when a NEW unguarded route appears, or when a baselined one is
// fixed and the baseline is not trimmed. Enforcement arrives without blocking
// every unrelated PR, which is the same shape as check:writes.
import { existsSync } from 'node:fs';

const BASELINE = 'scripts/integrity/admin-api-auth-baseline.json';
const current = open.map((r) => r.file).sort();

if (!existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n');
  console.log(`\nwrote baseline with ${current.length} routes`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const added = current.filter((f) => !baseline.includes(f));
const fixed = baseline.filter((f) => !current.includes(f));

if (fixed.length) {
  console.log(`\nFIXED since the baseline (${fixed.length}): ${fixed.join(', ')}`);
  console.log('Remove them from the baseline so they cannot regress.');
}
if (added.length) {
  console.log(`\nNEW unguarded route(s): ${added.join(', ')}`);
  console.log('Every /api/admin route needs requireAdminAuth or a shared secret.');
}

process.exit(added.length || fixed.length ? 1 : 0);
