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
