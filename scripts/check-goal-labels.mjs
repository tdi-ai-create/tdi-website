#!/usr/bin/env node
/**
 * Do we show educators their own words back.
 *
 *   npm run check:goals
 *
 * Educators pick their goals from a twelve-card grid on first sign in. The
 * dashboard then shows a chip naming the goal that earned them a course.
 *
 * Those two lists lived in two files and drifted. The grid tile said
 * "Grow as a leader"; the chip said "grow your team". Both shipped, both
 * typechecked, and the only person who could have noticed was the educator
 * being told she had chosen something she had not.
 *
 * A comment saying "keep these in sync" was the first fix. This is the second,
 * because that is the pattern in this repo: the rule written down gets skipped,
 * the rule that fails a build does not.
 *
 * Checks every key in the onboarding grid has the exact same label in
 * lib/hub/goals.ts, and that neither list has a key the other lacks.
 */

import { readFileSync } from 'node:fs';

const GRID = 'app/hub/onboarding/page.tsx';
const SHARED = 'lib/hub/goals.ts';

function fail(lines) {
  console.error('');
  for (const l of lines) console.error(l);
  console.error('');
  process.exit(1);
}

let gridSrc, sharedSrc;
try {
  gridSrc = readFileSync(GRID, 'utf8');
  sharedSrc = readFileSync(SHARED, 'utf8');
} catch (err) {
  // Failing open would make this silently pass on a renamed file, which is the
  // exact shape it exists to prevent.
  fail([`Could not read the goal sources: ${err.message}`]);
}

/** Pull `{ value: 'x', label: 'y' }` pairs out of GRID_GOALS_DATA. */
function parseGrid(src) {
  const start = src.indexOf('GRID_GOALS_DATA');
  if (start === -1) fail([`No GRID_GOALS_DATA in ${GRID}. Did it move?`]);
  const open = src.indexOf('[', start);
  const close = src.indexOf('];', open);
  if (open === -1 || close === -1) fail([`Could not find the GRID_GOALS_DATA array body in ${GRID}.`]);
  const body = src.slice(open, close);
  const out = new Map();
  const re = /value:\s*'((?:[^'\\]|\\.)*)'\s*,\s*label:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    out.set(m[1], m[2].replace(/\\'/g, "'"));
  }
  if (out.size === 0) fail([`Parsed no goals out of GRID_GOALS_DATA in ${GRID}.`]);
  return out;
}

/** Pull `key: 'label'` pairs out of GOAL_LABELS. */
function parseShared(src) {
  const start = src.indexOf('GOAL_LABELS');
  if (start === -1) fail([`No GOAL_LABELS in ${SHARED}. Did it move?`]);
  const open = src.indexOf('{', start);
  const close = src.indexOf('};', open);
  if (open === -1 || close === -1) fail([`Could not find the GOAL_LABELS object body in ${SHARED}.`]);
  const body = src.slice(open, close);
  const out = new Map();
  const re = /([a-z_]+)\s*:\s*(['"])((?:[^\\]|\\.)*?)\2/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    out.set(m[1], m[3].replace(/\\'/g, "'"));
  }
  if (out.size === 0) fail([`Parsed no labels out of GOAL_LABELS in ${SHARED}.`]);
  return out;
}

const grid = parseGrid(gridSrc);
const shared = parseShared(sharedSrc);

// 'all_of_the_above' is its own tile rather than a grid card, so it is expected
// in the shared list and absent from the grid.
const EXTRA_ALLOWED_IN_SHARED = new Set(['all_of_the_above']);

const problems = [];

for (const [key, gridLabel] of grid) {
  if (!shared.has(key)) {
    problems.push(`${key}: in the onboarding grid, missing from GOAL_LABELS.`);
    continue;
  }
  const sharedLabel = shared.get(key);
  if (sharedLabel !== gridLabel) {
    problems.push(
      `${key}: the tile says "${gridLabel}" but GOAL_LABELS says "${sharedLabel}".`
    );
  }
}

for (const key of shared.keys()) {
  if (!grid.has(key) && !EXTRA_ALLOWED_IN_SHARED.has(key)) {
    problems.push(`${key}: in GOAL_LABELS, not offered anywhere in the onboarding grid.`);
  }
}

if (problems.length > 0) {
  fail([
    'Goal wording has drifted from what educators actually chose.',
    '',
    ...problems.map((p) => `  ${p}`),
    '',
    `The grid in ${GRID} is the source. Anything shown back to an educator has`,
    'to quote the tile they pressed, not paraphrase it.',
  ]);
}

console.log(`${grid.size} onboarding goals checked. Every label matches the tile educators press.`);
