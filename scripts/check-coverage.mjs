// How much of Bella's surface is actually exercised.
//
//   npm run check:coverage
//
// You cannot test what you have not listed, and until this existed nobody
// could say how much of her workspace was covered. The answer on 11 September
// was three controls out of several hundred.
//
// The inventory is generated from the code rather than maintained by hand, so a
// route added next month appears here as untested without anyone remembering to
// add it. A hand-written list would be accurate for about a week.
//
// Reports a number and lists what is uncovered. Does not fail the build: the
// point is to make the gap visible and shrinking, and a gate that fails at one
// percent is a gate someone deletes.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

/** Directories that make up the surface she works in. */
const API_DIRS = ['app/api/admin', 'app/api/funding', 'app/api/creator-studio'];
const PAGE_DIRS = ['app/tdi-admin/funding', 'app/tdi-admin/creators', 'components/admin'];

/**
 * Controls we actually press somewhere, with the outcome asserted in the
 * database afterwards. Declared rather than inferred: a test that merely
 * mentions a path is not the same as one that presses it and checks.
 *
 * Add to this only when something genuinely exercises the route end to end.
 */
const EXERCISED = [
  'app/api/admin/approve-milestone',   // button-smoke-test, valid + malformed
  'app/api/admin/request-revision',    // button-smoke-test, valid + malformed
];

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(join(ROOT, dir)); } catch { return out; }
  for (const e of entries) {
    const rel = join(dir, e);
    const abs = join(ROOT, rel);
    if (statSync(abs).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

// --- Write routes -----------------------------------------------------------

const routeFiles = API_DIRS.flatMap(walk).filter((f) => f.endsWith('route.ts'));
const writeRoutes = [];

for (const f of routeFiles) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  const verbs = ['POST', 'PATCH', 'DELETE', 'PUT'].filter((v) =>
    new RegExp(`export\\s+async\\s+function\\s+${v}\\b`).test(src)
  );
  if (verbs.length === 0) continue;
  writeRoutes.push({ path: f.replace(/\/route\.ts$/, ''), verbs });
}

const covered = writeRoutes.filter((r) => EXERCISED.includes(r.path));
const uncovered = writeRoutes.filter((r) => !EXERCISED.includes(r.path));

// --- Buttons ----------------------------------------------------------------
//
// Counted, not enumerated by name. A button's label is often built from state,
// so a label list would be wrong more often than right. The count is enough to
// size the tier and to notice it growing.

let buttonCount = 0;
const pageFiles = PAGE_DIRS.flatMap(walk).filter((f) => f.endsWith('.tsx'));
for (const f of pageFiles) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  buttonCount += (src.match(/<button/g) || []).length;
}

const pages = PAGE_DIRS.flatMap(walk).filter((f) => f.endsWith('page.tsx')).length;

// --- Report -----------------------------------------------------------------

const pct = writeRoutes.length === 0 ? 0 : Math.round((covered.length / writeRoutes.length) * 100);

console.log(`\nBella's surface`);
console.log(`  ${pages} pages`);
console.log(`  ${buttonCount} buttons`);
console.log(`  ${writeRoutes.length} write routes\n`);

console.log(`Write routes pressed and asserted: ${covered.length} of ${writeRoutes.length}  (${pct}%)`);
for (const c of covered) console.log(`  exercised  ${c.path.replace('app/api/', '')}  [${c.verbs.join(', ')}]`);

console.log(`\nNot exercised (${uncovered.length}):`);
for (const u of uncovered) console.log(`  -  ${u.path.replace('app/api/', '')}  [${u.verbs.join(', ')}]`);

console.log(
  `\nA route in that list can stop working and nothing will notice until\n` +
  `somebody clicks it. That is how Approve stayed broken for eight days.\n`
);
