#!/usr/bin/env node
/**
 * A ratchet on fields that return a confident, meaningless answer.
 *
 * Some columns exist, are populated, and are wrong. Reading one does not error
 * and does not look like a bug. It returns a number, the number renders, and a
 * school leader quotes it.
 *
 * Every entry below cost real time on 30 September and 1 October 2026:
 *
 *   partnership_slug        I read it as the link between a person and a
 *                           partnership. It is not. Nothing keeps it current,
 *                           and on Glen Ellyn it disagreed with reality twice in
 *                           one conversation. The real link is the roster table,
 *                           matched on email.
 *   logins_this_month       Distinct sign ins since the first of the CALENDAR
 *                           month. At 01:47 on 1 October it covered two hours.
 *   hub_login_pct           The above over provisioned seats. Printed 19% three
 *                           lines under a card reading 34%.
 *   quick_wins_completed    Counts an action the Hub has never written. Always 0.
 *                           It made every report say "0 tools explored".
 *   hub_login_date          Written daily by /api/cron/sync-hub-login-dates, so it
 *                           lags by up to 24 hours. Two Roosevelt teachers signed
 *                           in during their own onboarding call and their
 *                           principal's dashboard showed them as never having
 *                           logged in. Never the sole basis for "has this person
 *                           logged in"; read Hub activity live and use this only
 *                           as a fallback.
 *   hub_user_goals          Dead table. Goals live in hub_profiles.onboarding_data.
 *
 * This is a ratchet, not a wall. There are ~124 existing references and a check
 * that fails on all of them is a check nobody can pass, so it only judges the
 * files you actually changed. Old code is left for a deliberate cleanup.
 *
 * To read one deliberately, say so on the line or the line above:
 *
 *   const raw = hubStats.logins_this_month; // quarantine-ok: migrating this away
 *
 *   npm run check:quarantine          changed files only
 *   npm run check:quarantine -- --all whole repo, for measuring the backlog
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const QUARANTINE = {
  partnership_slug: 'Not the link between a person and a partnership. Use the roster table, matched on lowercased email.',
  logins_this_month: 'Calendar-month-to-date. Use engagement.activeThisMonth.',
  hub_login_pct: 'Calendar-month-to-date over seats. Use the same arithmetic as the Team Activation card.',
  quick_wins_completed: 'Counts an action the Hub never writes. Use engagement.distinctContent.',
  hub_login_date: 'Written once a day, so it lags up to 24h. Read Hub activity live; use this only as a fallback.',
  hub_user_goals: 'Dead table. Use hub_profiles.onboarding_data.',
};

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.claude']);
// The quarantine list itself, the spec, and the integrity scripts must be able
// to name these fields without tripping the check that names them.
const SELF = [
  'scripts/check-quarantined-fields.mjs',
  'scripts/integrity/',
  'docs/leadership-dashboard-standard.md',
];

const all = process.argv.includes('--all');

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (CODE_EXT.has(extname(entry.name))) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

let files;

if (all) {
  files = ['app', 'lib', 'components', 'scripts'].filter(existsSync).flatMap(d => walk(d));
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
  } catch {
    console.log('Could not read the git diff, so nothing was checked.');
    process.exit(0);
  }
  files = changed
    .map(f => f.trim())
    .filter(Boolean)
    .filter(f => CODE_EXT.has(extname(f)))
    .filter(f => existsSync(f) && statSync(f).isFile());
}

files = files.filter(f => !SELF.some(s => f.startsWith(s)));

if (files.length === 0) {
  console.log('No changed code files to check for quarantined fields.');
  process.exit(0);
}

const findings = [];

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // A comment naming one of these fields is documentation, usually the comment
    // explaining why we do not use it. Flagging those buries the real signal and
    // is how a check earns itself a disable. Judge code only.
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // An allow comment counts within the three lines above, so a reason can be
    // written out properly rather than crammed onto one line.
    const window = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
    if (/quarantine-ok/.test(window)) return;
    for (const [field, why] of Object.entries(QUARANTINE)) {
      // Word boundary, so partnership_slug does not match partnership_slugs.
      if (new RegExp(`\\b${field}\\b`).test(line)) {
        findings.push({ file, line: i + 1, field, why, text: line.trim().slice(0, 100) });
      }
    }
  });
}

if (findings.length === 0) {
  console.log(`Checked ${files.length} changed file(s). No quarantined fields read.`);
  process.exit(0);
}

console.error('\nA quarantined field is read in code you changed.\n');
console.error('These fields return a number. The number is wrong. Nothing errors.\n');

for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`);
  console.error(`    ${f.text}`);
  console.error(`    ${f.field}: ${f.why}\n`);
}

console.error('If you mean it, say so on the line or the line above:\n');
console.error('    // quarantine-ok: <why>\n');
console.error('The full list and its reasoning is in docs/leadership-dashboard-standard.md, L8.\n');
process.exit(1);
