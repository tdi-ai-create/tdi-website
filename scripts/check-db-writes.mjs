#!/usr/bin/env node
/**
 * A ratchet, not a wall.
 *
 * There are ~492 existing unchecked Supabase writes in this repo. A check that
 * fails on all of them is a check nobody can ever pass, and it would be ignored
 * within a day, exactly as `npm run lint` is ignored at 6,986 errors.
 *
 * So this only judges the files you actually changed against origin/main. New
 * code cannot add a silent write. Old code is left for a deliberate cleanup
 * rather than blocking every unrelated change.
 *
 *   npm run check:writes         changed files only, exits non-zero on a new one
 *   npm run check:writes -- --all   the whole repo, for measuring the backlog
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const all = process.argv.includes('--all');

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

let targets;

if (all) {
  targets = ['.'];
} else {
  let base = 'origin/main';
  try {
    sh('git', ['rev-parse', '--verify', base]);
  } catch {
    base = 'main';
  }

  let changed = [];
  try {
    // Committed on this branch, plus anything staged or dirty right now.
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
    .filter((f) => /^(app|lib|components|scripts)\/.*\.(ts|tsx)$/.test(f))
    .filter((f) => existsSync(f));

  if (targets.length === 0) {
    console.log('No changed TypeScript files under app, lib, components or scripts. Nothing to check.');
    process.exit(0);
  }
}

console.log(
  all
    ? 'Checking the whole repository for unchecked database writes.'
    : `Checking ${targets.length} changed file(s) for unchecked database writes.`,
);

try {
  execFileSync(
    'npx',
    ['eslint', '--config', 'eslint.db-writes.config.mjs', ...targets],
    { stdio: 'inherit' },
  );
} catch {
  console.error('');
  console.error('A database write here can fail without anything noticing.');
  console.error('Destructure `error` from the result and act on it.');
  console.error('');
  console.error('This exact shape silently broke five features on 18 and 19 August:');
  console.error('  Confirm Payment, the Hub stress chart, saving a partnership');
  console.error('  contact, the grant eligibility questions, and funder discovery.');
  process.exit(1);
}

console.log('No unchecked database writes in the changed files.');
