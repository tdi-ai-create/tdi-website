#!/usr/bin/env node
/**
 * Stops a domain question being answered twice.
 *
 * The recurring bug in this codebase is not a wrong answer. It is two right
 * answers to the same question, computed in two files, that drift apart.
 * Measured on 8 September 2026, four files each decided whose turn it was on a
 * creator step, with four different rules:
 *
 *   app/api/admin/creators/queue/route.ts   requires_team_action
 *                                           OR status waiting_approval
 *                                           OR review_status submitted
 *   lib/creator-journey.ts                  requires_team_action
 *   app/api/cron/creator-monthly-newsletter status waiting_approval
 *   app/api/admin/dashboard-data/route.ts   requires_team_action
 *
 * Only the first was right, and its own comment said so: "the second half is
 * the case the first version missed." Somebody had already found the bug, fixed
 * it where it was reported, and left the other three. So the Needs You board
 * called a step ours while the creator's page called it theirs, on the same row,
 * one click apart.
 *
 * The same shape hit grant ownership (the board and the school card), and the
 * funding gate before that, where "is this gate open" had three definitions and
 * the cron emailed schools that agents were correctly blocked from drafting for.
 *
 * Writing the rule down did not prevent the next instance. Neither did knowing
 * about it. So this is mechanical: if a changed file makes a decision out of one
 * of these fields, and it is not the file that owns that decision, it fails.
 *
 *   npm run check:definitions          changed files only
 *   npm run check:definitions -- --all the whole repo, to see the backlog
 *
 * Adding a rule below is cheap and is the right move the moment a second file
 * wants to answer a question a first file already answers.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const all = process.argv.includes('--all');

/**
 * Each rule names one question, the module allowed to answer it, and the
 * patterns that mean a file is answering it itself.
 *
 * `owners` are the files where the decision legitimately lives, plus the places
 * that legitimately write these columns rather than read them for a decision.
 */
const RULES = [
  {
    question: 'whose turn is it on a creator step',
    owner: 'lib/creator-turn.ts',
    use: 'import { isWaitingOnUs, isOursToDo } from "@/lib/creator-turn"',
    owners: [
      'lib/creator-turn.ts',
      // Seeds and migrations set these columns; they do not decide from them.
      'app/api/admin/setup-milestone-actions/route.ts',
      'app/api/admin/sync-milestones/route.ts',
      'app/api/admin/run-migration/route.ts',
      // The engine decides what to open, a different question, and is allowed
      // to read the raw column to do it.
      'lib/creator-step-engine.ts',
    ],
    patterns: [
      // `?` matches a ternary but not `?:`, which is a type annotation and
      // decides nothing.
      /requires_team_action\s*(\?\?|\|\||&&|===|!==|\?(?!:))/,
      /(\?\?|\|\||&&|===|!==|\(|,|\s)\s*Boolean\(\s*[\w.?]*requires_team_action/,
      /status\s*===\s*['"]waiting_approval['"]/,
      /review_status\s*===\s*['"](submitted|under_review)['"]/,
    ],
  },
  {
    question: 'whose grant work is this',
    owner: 'lib/funding-ownership.ts',
    use: 'import { isPersonOwned, isSchoolOwned } from "@/lib/funding-ownership"',
    owners: ['lib/funding-ownership.ts'],
    patterns: [
      /owner_type\s*(===|!==)\s*['"]client['"]/,
      /ownerType\s*(===|!==)\s*['"]client['"]/,
    ],
  },
];

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

let targets;

if (all) {
  targets = sh('git', ['ls-files', 'app', 'lib', 'components'])
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f));
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
    // Same posture as check:writes. If the diff cannot be worked out, say so
    // loudly and pass, rather than failing every build on a git quirk.
    console.error('Could not work out what changed, so checking nothing.');
    console.error(String(err.message || err));
    process.exit(0);
  }

  targets = changed
    .filter(Boolean)
    .filter((f) => /^(app|lib|components)\/.*\.(ts|tsx)$/.test(f))
    .filter((f) => existsSync(f));
}

if (targets.length === 0) {
  console.log('No changed TypeScript files under app, lib or components. Nothing to check.');
  process.exit(0);
}

console.log(
  all
    ? `Checking the whole repository against ${RULES.length} shared definitions.`
    : `Checking ${targets.length} changed file(s) against ${RULES.length} shared definitions.`,
);

const findings = [];

for (const file of targets) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const lines = text.split('\n');

  for (const rule of RULES) {
    if (rule.owners.includes(file)) continue;

    lines.forEach((line, i) => {
      // A line that is only a comment is describing the rule, not applying it.
      const code = line.trim();
      if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return;
      // A select list names the column without deciding from it.
      if (/\.select\(/.test(code)) return;

      if (rule.patterns.some((p) => p.test(line))) {
        findings.push({ file, line: i + 1, text: code, rule });
      }
    });
  }
}

if (findings.length === 0) {
  console.log('No file answers a question another file already owns.');
  process.exit(0);
}

console.error('');
for (const f of findings) {
  console.error(`${f.file}:${f.line}`);
  console.error(`  ${f.text}`);
  console.error(`  This decides "${f.rule.question}", which ${f.rule.owner} already answers.`);
  console.error(`  ${f.rule.use}`);
  console.error('');
}

console.error(
  `${findings.length} place(s) answering a question that already has an owner.`,
);
console.error('');
console.error('Two right answers that drift apart is the recurring bug in this');
console.error('codebase. On 8 September four files decided whose turn it was on a');
console.error('creator step, with four different rules, and the board told Bella a');
console.error('step was ours while the creator page called it theirs.');
console.error('');
console.error('If the decision genuinely belongs here, add the file to `owners` in');
console.error('scripts/check-one-definition.mjs and say why in the same commit.');
process.exit(1);
