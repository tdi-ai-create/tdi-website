#!/usr/bin/env node
/**
 * A ratchet on headcounts of people reaching a client.
 *
 * Rae, 2 October 2026: a leadership dashboard does not need to say how many
 * people. It needs to say that something is catching on. A share says that. A
 * headcount also publishes how many, and in a small school it publishes who.
 *
 * Tidioute has a roster of two. Before this rule its dashboard printed "100%"
 * against a tool one person opened, and before that "1 person", and both tell
 * its leader exactly who. St Mary has twelve. The arithmetic is reversible
 * whenever the denominator is small enough to hold in your head, which is most
 * of our community.
 *
 * What this judges is narrow on purpose: a number rendered next to a word for
 * people, on a surface a client can see. It does not judge counts of content,
 * sessions, deliverables or days, and it does not judge anything under
 * /tdi-admin, where raw counts are correct and expected.
 *
 * Two things are legitimately a count of people and stay:
 *
 *   Enrolment and scope. "Learning Hub access for 24 educators" is what a
 *   school bought, not what anyone did, and a board reading a funding document
 *   needs it. Rae's call, 2 October 2026.
 *
 *   A roster the reader is operating on, where the names are on screen anyway.
 *
 * Say so on the line or in the three lines above it:
 *
 *   <div>{staffStats.total} educators</div> {/* headcount-ok: enrolment, not activity *\/}
 *
 * This is a ratchet, not a wall. Around forty existing renders predate it and
 * a check that fails on all of them is a check nobody runs, so it judges only
 * the LINES you changed, not the files. The partner dashboard is nine thousand
 * lines, so judging whole files would drop its entire backlog into whichever
 * pull request happened to touch it, which is the same as judging nothing.
 *
 *   npm run check:headcounts          changed files only
 *   npm run check:headcounts -- --all whole repo, for measuring the backlog
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.claude']);

/** Surfaces a client can reach. Everything else is ours and keeps its counts. */
const CLIENT_PATHS = [
  'app/partners/',
  'app/dashboard/',
  'app/Example-Dashboard/',
  'app/for-schools/',
  'app/hub/',
  'components/partners/',
  'components/hub/',
  'components/dashboard/',
  'app/api/cron/monthly-principal-email/',
  'app/api/cron/partner-onboarding-reminders/',
  'app/api/cron/community-monthly-digest/',
  'app/api/cron/partner-weekly-digest/',
  'app/api/cron/seasonal-partner-email/',
  'app/api/cron/hub-monthly/',
  'app/api/cron/contract-expiration/',
  'app/api/cron/wellness-outreach/',
];

/** Internal, even when it sits inside a client-facing folder. */
const INTERNAL_PATHS = ['/tdi-admin/', 'app/hub/admin/', 'app/dashboard/roosevelt/blueprint/'];

const SELF = ['scripts/check-headcounts.mjs', 'scripts/integrity/', 'docs/leadership-dashboard-standard.md'];

/**
 * Words that make the number beside them a number of people.
 *
 * Not preceded by a hyphen, or "in-person sessions" reads as a count of people.
 */
const PEOPLE = String.raw`(?<!-)(?:people|person|educators?|staff|teachers?|paras?|members?|users?|principals?|leaders?)`;

/**
 * A line that talks to the database rather than to a reader.
 *
 * `.eq('user_id', user.id)` sitting after an options object matched as "a
 * number next to a word for people". Nobody reads it.
 */
const NOT_RENDERED = /\.(?:from|select|eq|neq|gt|gte|lt|lte|in|is|order|limit|range|single|update|insert|upsert|delete|match|filter|rpc)\(/;

/** A price per head is a rate, not a headcount. */
const IS_RATE = /(?:\$|per\s+(?:educator|person|teacher|member|staff|user)\b|\bcost\b|\bprice\b)/i;

/** An expression that already answers as a share is the fix, not the problem. */
const IS_SHARE = /(?:pct|percent|share|ratio|%)/i;

/**
 * An expression that plausibly holds a number.
 *
 * Without this the check reads `${firstName}, your staff needs this` as a
 * headcount, and a check that cries wolf is a check somebody disables.
 *
 * Case insensitive on purpose. It was not, and `data.staffLoggedIn` failed to
 * match the alternative spelled `loggedIn`, so the whole check quietly passed
 * every expression of that shape. It reported success on a deliberate
 * violation planted to test it.
 */
const LOOKS_NUMERIC =
  /(?:\.length\b|count|total|\bnum\b|\bsize\b|enrol|logged|active|people|staff|member|seat|seats|educator|toLocaleString|^\s*\d+\s*$)/i;

/**
 * Phrasing that makes the count enrolment rather than activity.
 *
 * Rae's call, 2 October 2026: a board reading a funding document needs to know
 * what the school bought. "24 educators enrolled" is scope. "18 educators have
 * logged in" is behaviour, and only behaviour becomes a share. The verb beside
 * the noun is what separates them, so the check reads it rather than asking
 * every author to annotate the same sentence again.
 */
const IS_SCOPE = /\b(?:enrolled|enrolled in|have access|with .{0,20}access|access for|on (?:your|the|their) roster|seats?)\b/i;

/** Words that mean the expression is text, whatever else it contains. */
const LOOKS_TEXTUAL = /(?:\bname\b|Name\b|\blabel\b|Label\b|\btitle\b|Title\b|\btext\b|Text\b|\bemail\b|Email\b|\bslug\b|\brole\b|Role\b)/;

const RULES = [
  {
    // {count} educators      `${loggedIn} staff`      {n} people
    name: 'a number rendered next to a word for people',
    re: new RegExp(String.raw`[{$]\{?\s*([^{}]{1,80}?)\s*\}[^{}\n]{0,24}?\b${PEOPLE}\b`, 'gi'),
  },
  {
    // "18 of 24 staff", in either brace style
    name: 'an N of M of people',
    re: new RegExp(String.raw`[{$]\{?\s*([^{}]{1,60}?)\s*\}\s*(?:of|\/)\s*[{$]?\{?\s*[^{}]{1,60}?\s*\}[^{}\n]{0,24}?\b${PEOPLE}\b`, 'gi'),
  },
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
/** file -> set of line numbers this change added. Empty map means judge everything. */
const touchedLines = new Map();
if (all) {
  files = ['app', 'components', 'lib'].filter(existsSync).flatMap(d => walk(d));
} else {
  let base = 'origin/main';
  try { sh('git', ['rev-parse', '--verify', base]); } catch { base = 'main'; }
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
  files = changed.map(f => f.trim()).filter(Boolean)
    .filter(f => CODE_EXT.has(extname(f)))
    .filter(f => existsSync(f) && statSync(f).isFile());

  // Which lines the diff actually added, so an untouched violation elsewhere in
  // a large file stays in the backlog instead of landing on whoever edited it.
  for (const file of files) {
    const touched = new Set();
    for (const range of [[base + '...HEAD'], ['HEAD'], ['--cached']]) {
      let out = '';
      try { out = sh('git', ['diff', '-U0', ...range, '--', file]); } catch { continue; }
      for (const line of out.split('\n')) {
        const m = line.match(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/);
        if (!m) continue;
        const start = Number(m[1]);
        const count = m[2] === undefined ? 1 : Number(m[2]);
        for (let n = start; n < start + count; n++) touched.add(n);
      }
    }
    touchedLines.set(file, touched);
  }
}

files = files
  .filter(f => !SELF.some(s => f.startsWith(s)))
  .filter(f => CLIENT_PATHS.some(p => f.startsWith(p)))
  .filter(f => !INTERNAL_PATHS.some(p => f.includes(p)));

if (files.length === 0) {
  console.log('No changed client-facing files to check for headcounts.');
  process.exit(0);
}

const findings = [];

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // A comment describing the rule is not a breach of it.
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    // Nor is a database query that happens to name a user column.
    if (NOT_RENDERED.test(trimmed)) return;

    // Only lines this change wrote. An existing render three thousand lines
    // away is somebody else's pull request.
    const touched = touchedLines.get(file);
    if (touched && !touched.has(i + 1)) return;

    const window = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
    if (/headcount-ok/.test(window)) return;

    // A stat tile puts the number and its label in different elements, so the
    // two never share a line. This is the shape the partner dashboard used for
    // "Total Staff", "Hub Active" and "Not Yet Active".
    const soloExpr = trimmed.match(/^<(?:p|span|div|h\d)[^>]*>\s*[{$]\{?\s*([^{}]{1,80}?)\s*\}\s*<\/(?:p|span|div|h\d)>$/);
    if (soloExpr) {
      const expr = soloExpr[1];
      const label = lines.slice(i + 1, i + 3).join(' ');
      if (
        !IS_SHARE.test(expr) &&
        LOOKS_NUMERIC.test(expr) &&
        !LOOKS_TEXTUAL.test(expr) &&
        new RegExp(String.raw`\b${PEOPLE}\b`, 'i').test(label) &&
        !IS_SCOPE.test(label) &&
        !IS_RATE.test(label) &&
        !IS_RATE.test(trimmed) &&
        !/%/.test(label)
      ) {
        findings.push({ file, line: i + 1, rule: 'a stat tile whose label names people', text: trimmed.slice(0, 110) });
        return;
      }
    }

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        const expr = m[1] || '';
        // Already a share, or the brace is immediately followed by a percent sign.
        // A unicode escape is not an interpolation. `\u{2709}` was read as a
        // count of 2709 principals.
        if (/\\u$/.test(line.slice(Math.max(0, m.index - 2), m.index))) continue;
        if (IS_SHARE.test(expr)) continue;
        if (!LOOKS_NUMERIC.test(expr) || LOOKS_TEXTUAL.test(expr)) continue;
        // Scope, not behaviour. "Learning Hub access for 24 educators" puts the
        // telling words before the number, so read both sides of it.
        if (IS_SCOPE.test(line.slice(Math.max(0, m.index - 44), m.index + m[0].length + 44))) continue;
        if (IS_RATE.test(line.slice(Math.max(0, m.index - 20), m.index + m[0].length + 24))) continue;
        if (line.slice(m.index + m[0].length - 1).trimStart().startsWith('%')) continue;
        if (/%/.test(m[0])) continue;
        findings.push({ file, line: i + 1, rule: rule.name, text: trimmed.slice(0, 110) });
        break;
      }
    }
  });
}

if (findings.length === 0) {
  console.log(`No headcounts of people in ${files.length} changed client-facing file(s).`);
  process.exit(0);
}

console.error(`\n${findings.length} headcount(s) of people on a client-facing surface:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`);
  console.error(`    ${f.text}`);
  console.error(`    ${f.rule}\n`);
}
console.error('A client sees a share, never a count of people. Tidioute has two staff,');
console.error('so one person is 100% and a count names them.');
console.error('');
console.error('Use sharePct or contentSharePct from lib/partners/popularity.');
console.error('If the number is enrolment rather than activity, say so:');
console.error('  // headcount-ok: enrolment, not activity');
process.exit(1);
