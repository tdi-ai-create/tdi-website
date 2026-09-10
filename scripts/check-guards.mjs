// Does every guard still catch the thing it was built to catch.
//
//   npm run check:guards
//
// Pure functions only. No database, no network, so it runs in CI on every PR
// and takes under a second.
//
// This exists because the repo has roughly forty checks and no tests, so
// nothing has ever confirmed that any of those checks can still fail. A guard
// that quietly stopped working is indistinguishable from one that is passing,
// which is the same silent-failure shape as every bug found this week, one
// level up.
//
// Exits non-zero when a guard can no longer catch its own case.

import { runGuards } from '../lib/health/guards.ts';

const results = runGuards();

let totalCases = 0;
let totalFailed = 0;

for (const r of results) {
  const failed = r.failed.length;
  totalCases += r.passed + failed;
  totalFailed += failed;

  if (failed === 0) {
    console.log(`  ok    ${r.id}  (${r.passed} cases)  ${r.protects}`);
    continue;
  }

  console.log(`\n  FAIL  ${r.id}  ${r.protects}`);
  console.log(`        Came from: ${r.origin}`);
  for (const f of r.failed) {
    console.log(`        cannot catch: ${f.name}${f.error ? `  [threw: ${f.error}]` : ''}`);
  }
  console.log('');
}

console.log(`\n${totalCases - totalFailed}/${totalCases} cases held across ${results.length} guards.`);

if (totalFailed > 0) {
  console.log(
    '\nA guard that cannot catch its own case is not protecting anything, and it\n' +
    'looks identical to one that is passing. Each case above is something that\n' +
    'already went wrong once. Fix the guard rather than the case.\n'
  );
  process.exit(1);
}

process.exit(0);
