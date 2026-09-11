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

// --- Which of those her screens can actually reach ---------------------------
//
// 79 write routes is the wrong target. Some are called by crons, by agents, or
// by nothing at all. The ones that matter first are the ones a click can reach,
// because those are the ones she can find broken.
//
// Matched by scanning her pages for fetch('/api/...'), with dynamic segments
// normalised, so this stays true as pages change.

const calledPaths = new Set();
const fetchRe = /fetch\(\s*[`'"](\/api\/[^`'"$)]*)/g;

for (const f of PAGE_DIRS.flatMap(walk).filter((x) => x.endsWith('.tsx'))) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  let m;
  while ((m = fetchRe.exec(src)) !== null) {
    // Strip a trailing partial segment left by a template expression, and any
    // query string, then keep the leading static portion.
    const cleaned = m[1].split('?')[0].replace(/\/$/, '');
    calledPaths.add(cleaned);
  }
}

/** Does any fetch in her pages target this route file. */
function reachableFromHerScreens(routePath) {
  const api = '/' + routePath.replace(/^app\//, '');       // /api/admin/foo
  // Exact, or a dynamic route whose static prefix is fetched.
  for (const called of calledPaths) {
    if (called === api) return true;
    const staticPrefix = api.replace(/\/\[[^\]]+\]/g, '');
    if (called === staticPrefix) return true;
    if (called.startsWith(staticPrefix + '/')) return true;
    if (api.includes('[') && called.startsWith(api.split('/[')[0] + '/')) return true;
  }
  return false;
}

for (const r of writeRoutes) r.reachable = reachableFromHerScreens(r.path);

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

const reachable = writeRoutes.filter((r) => r.reachable);
const reachableCovered = reachable.filter((r) => EXERCISED.includes(r.path));
const reachableUncovered = reachable.filter((r) => !EXERCISED.includes(r.path));
const pct = reachable.length === 0 ? 0 : Math.round((reachableCovered.length / reachable.length) * 100);

console.log(`\nBella's surface`);
console.log(`  ${pages} pages`);
console.log(`  ${buttonCount} buttons`);
console.log(`  ${writeRoutes.length} write routes, of which ${reachable.length} can be reached by a click\n`);

console.log(`Reachable write routes pressed and asserted: ${reachableCovered.length} of ${reachable.length}  (${pct}%)`);
for (const c of reachableCovered) console.log(`  exercised  ${c.path.replace('app/api/', '')}  [${c.verbs.join(', ')}]`);

console.log(`\nShe can click these and nothing checks them (${reachableUncovered.length}):`);
for (const u of reachableUncovered) console.log(`  -  ${u.path.replace('app/api/', '')}  [${u.verbs.join(', ')}]`);

const unreachable = uncovered.filter((r) => !r.reachable);
console.log(`\nNot reachable from her screens (${unreachable.length}). Crons, agents, or nothing at all.`);
console.log(`These still matter, but they are not what breaks under her hands.`);

console.log(
  `\nA route in the clickable list can stop working and nothing notices until\n` +
  `she clicks it. That is how Approve stayed broken for eight days.\n`
);
