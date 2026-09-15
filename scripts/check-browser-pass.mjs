#!/usr/bin/env node
/**
 * Did anyone open the page.
 *
 *   npm run check:browserpass
 *
 * Forty checks in this repo test a property of the code or the state of the
 * data. Not one of them opens a page and tries to finish a piece of work, which
 * is why Bella found around twenty real defects in nine days and we found none
 * of them first.
 *
 * On 13 and 14 September two fixes shipped broken and both were caught only by
 * loading the live site. One went into a file nothing imports. One read a field
 * that was always empty. Both typechecked, both deployed, both changed nothing.
 * A third claimed in its own description that a link opened a drafted email;
 * pressing it showed that it did not.
 *
 * CI cannot drive Chrome, so this does not run the pass. It refuses to let a
 * change to her screens merge without a record of one, and it makes that record
 * hard to write without having looked.
 *
 * The record is a file under browser-passes/. What makes it more than a
 * checkbox is that it demands observations, not intentions: the URL, the
 * control pressed, and what actually appeared, including at least one figure or
 * piece of text read off the screen.
 *
 * WHEN THE LOCAL APP CANNOT BE DRIVEN
 *
 * Rae's rule, 15 September 2026: if localhost will not load, or cannot be
 * signed in to, the pass happens on production straight after the deploy
 * instead of blocking the merge.
 *
 * The admin portal is the case that forced it. It authenticates against a
 * Supabase session cookie scoped to the live domain, so a local server answers
 * every admin page with a login screen no amount of local setup can pass
 * without a person's own credentials.
 *
 * So a record may be DEFERRED: it names why the local app could not be driven
 * and the production URL it will be checked on, and it merges without the
 * observations. What stops that becoming a permanent escape hatch is the last
 * check in this file: if any earlier deferred record is still sitting there
 * with no observations in it, the next change to her screens does not merge.
 * One deferral is a sequencing decision. Two is a habit, and the second one
 * pays for the first.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

/**
 * Surfaces a person operates. A change here is a change to what Bella sees or
 * presses, so it needs somebody to have seen it.
 *
 * API routes are included: the bug that started this was a caller sending the
 * wrong id, which no amount of route testing would have caught.
 */
const OPERATED = [
  /^app\/tdi-admin\/.*\.tsx$/,
  /^app\/hub\/.*\.tsx$/,
  /^app\/creator-portal\/.*\.tsx$/,
  /^components\/.*\.tsx$/,
  /^app\/api\/(admin|funding|creator-studio)\/.*route\.ts$/,
];

/** Changes that cannot alter what a person sees. */
const EXEMPT = [
  /^scripts\//,
  /^lib\/health\//,
  /^supabase\//,
  /\.test\.(ts|tsx)$/,
  /^browser-passes\//,
];

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
  // Untracked too. A brand new record is exactly the file this check is looking
  // for, and git diff does not list it until it is staged, so the first version
  // of this gate could never see the evidence it was demanding.
  const d = sh('git', ['ls-files', '--others', '--exclude-standard']);
  changed = [...new Set([...a.split('\n'), ...b.split('\n'), ...c.split('\n'), ...d.split('\n')])].filter(Boolean);
} catch (err) {
  // Failing open here would make this check silently pass on every broken
  // checkout, which is the exact shape it exists to prevent.
  console.error('Could not work out what changed, so nothing can be verified.');
  console.error(String(err.message || err));
  process.exit(1);
}

const touched = changed
  .filter((f) => !EXEMPT.some((re) => re.test(f)))
  .filter((f) => OPERATED.some((re) => re.test(f)));

if (touched.length === 0) {
  console.log('No changes to a screen anyone operates. No browser pass needed.');
  process.exit(0);
}

// The template is not a record. It is supposed to stay a template, so it is
// never counted as evidence and never judged for being one.
const records = changed.filter(
  (f) => /^browser-passes\/.+\.md$/.test(f) && !/TEMPLATE\.md$/.test(f) && existsSync(f),
);

console.log(`${touched.length} changed file(s) affect a screen someone operates:`);
for (const f of touched.slice(0, 8)) console.log(`  ${f}`);
if (touched.length > 8) console.log(`  and ${touched.length - 8} more`);
console.log('');

if (records.length === 0) {
  fail([
    'No browser pass recorded for this change.',
    '',
    'Add a file under browser-passes/ describing what you opened and what you saw.',
    'Copy browser-passes/TEMPLATE.md and fill it in.',
  ]);
}

/**
 * A record that says the pass is waiting for the deploy.
 *
 * Both lines are required. The reason keeps it honest, and the URL is what the
 * follow-up gets checked against, so neither is decoration.
 */
function isDeferred(text) {
  // [^\S\n] rather than \s after the colon. \s matches a newline, so "Saw:"
  // with nothing after it happily matched the first character of the next line
  // and an empty heading read as a filled-in one.
  return /^[^\S\n]*[-*]?[^\S\n]*deferred:[^\S\n]*\S/im.test(text)
    && /^[^\S\n]*[-*]?[^\S\n]*verify after deploy:[^\S\n]*\S/im.test(text);
}

/**
 * Observations have been written into it, whether or not it was ever deferred.
 *
 * Requires something after the colon. A deferred record carries the empty
 * "Saw:" heading it will later be filled in under, and an earlier version of
 * this counted that as an observation, so the deferral fell straight through
 * into the full check and failed for having written nothing under a heading
 * that exists precisely to be blank.
 */
function hasObservations(text) {
  return /^[^\S\n]*[-*][^\S\n]*saw:[^\S\n]*\S/im.test(text);
}

// A record that has not been filled in is worse than none, because it looks
// like evidence.
const problems = [];

for (const file of records) {
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();

  if (lower.includes('<!-- template -->')) {
    problems.push(`${file}: still the unedited template.`);
    continue;
  }
  if (!/https?:\/\/\S+/.test(text)) {
    problems.push(`${file}: no URL. Say which page you opened.`);
  }

  // Deferred to production. Merge on the promise, and the promise is enforced
  // by the unresolved-deferral check below rather than by trust.
  if (isDeferred(text) && !hasObservations(text)) {
    console.log(`${file}: pass deferred to production. It must carry observations before the next change to these screens.`);
    continue;
  }

  if (!/^\s*[-*]\s*pressed:/im.test(text)) {
    problems.push(`${file}: no "Pressed:" line. Name the control you actually clicked.`);
  }
  if (!/^\s*[-*]\s*saw:/im.test(text)) {
    problems.push(`${file}: no "Saw:" line. Write what appeared, not what should have.`);
  }
  // The anti-theatre test. A real observation contains something read off the
  // screen: a count, an amount, a date, or quoted words.
  const sawLines = (text.match(/^\s*[-*]\s*saw:.*$/gim) ?? []).join(' ');
  if (sawLines && !/\d|["“”']/.test(sawLines)) {
    problems.push(
      `${file}: the "Saw:" lines contain no figure and no quoted text. An observation you could ` +
        `have written without looking is not an observation.`,
    );
  }
}

if (problems.length > 0) fail(['The browser pass record is not usable:', '', ...problems.map((p) => `  ${p}`)]);

// The debt from the last deferral, collected now.
//
// Every record in the folder is read, not only the ones this change touched. A
// deferred pass that never came back is an unverified change sitting in
// production, and the cheapest moment to notice is the next time somebody wants
// to move one of these screens.
const outstanding = [];
try {
  const all = sh('git', ['ls-files', 'browser-passes']).split('\n').filter(Boolean);
  const untracked = sh('git', ['ls-files', '--others', '--exclude-standard', 'browser-passes'])
    .split('\n')
    .filter(Boolean);
  for (const f of [...new Set([...all, ...untracked])]) {
    if (!/^browser-passes\/.+\.md$/.test(f) || /TEMPLATE\.md$/.test(f)) continue;
    if (records.includes(f)) continue;
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf8');
    if (isDeferred(text) && !hasObservations(text)) outstanding.push(f);
  }
} catch {
  // Listing the folder is not the check. If git cannot answer, say nothing
  // rather than inventing a failure.
}

if (outstanding.length > 0) {
  fail([
    'A previous browser pass was deferred to production and never completed:',
    '',
    ...outstanding.map((f) => `  ${f}`),
    '',
    'That change is live and unverified. Open the page, press the control it names,',
    'and write the "Pressed:" and "Saw:" lines into that file before moving these',
    'screens again.',
  ]);
}

console.log(`Browser pass recorded in ${records.map((r) => r.split('/').pop()).join(', ')}.`);
process.exit(0);

function fail(lines) {
  console.error('');
  for (const l of lines) console.error(l);
  console.error('');
  console.error('Two fixes shipped broken on 13 and 14 September and both were caught only by');
  console.error('loading the live site. One went into a file nothing imports. One read a field');
  console.error('that was always empty. Both typechecked and both deployed.');
  console.error('');
  console.error('Rendering is not proof. Press the thing.');
  process.exit(1);
}
