#!/usr/bin/env node
/**
 * Schema drift check.
 *
 * Compares every `.from('table').select('columns')` in the codebase against the
 * live PostgREST schema of both Supabase projects.
 *
 * This exists because the same bug shipped to production repeatedly and always
 * silently: a select naming a column that does not exist returns 42703, the
 * calling code discarded `error`, and the feature rendered an empty list with
 * nothing in the console. It cost a completely dead course-completion flow
 * (zero completed lessons ever recorded), a dead In Progress filter, dead
 * community search, dead Quick Win translation, and a dead leadership report.
 *
 * A column is accepted if it exists on that table in EITHER project, because
 * several table names exist in both with different shapes and this script does
 * not try to infer which client a given file uses. That is deliberately
 * permissive: every real bug it is meant to catch referenced a column that
 * existed in neither.
 *
 * The PostgREST root endpoint that exposes the schema requires a service key;
 * the anon key gets 401 there.
 *
 * Env (both pairs optional, but at least one must be set):
 *   NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL / LEARNING_HUB_SUPABASE_SERVICE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'node:fs';
import path from 'node:path';

const BASELINE_PATH = 'scripts/schema-baseline.json';
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

const PROJECTS = [
  {
    name: 'learning-hub',
    url: process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL,
    key: process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY,
  },
  {
    name: 'creator-portal',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
];

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', '.claude', 'dist', 'build']);

async function loadSchema(project) {
  if (!project.url || !project.key) return null;
  const res = await fetch(`${project.url.replace(/\/$/, '')}/rest/v1/`, {
    headers: { apikey: project.key, Authorization: `Bearer ${project.key}` },
  });
  if (!res.ok) {
    throw new Error(`${project.name}: schema fetch failed with HTTP ${res.status}`);
  }
  const spec = await res.json();
  const tables = new Map();
  for (const [table, def] of Object.entries(spec.definitions || {})) {
    tables.set(table, new Set(Object.keys(def.properties || {})));
  }
  return tables;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Split a select list on top-level commas, ignoring commas inside parens. */
function splitTopLevel(input) {
  const parts = [];
  let buf = '';
  let depth = 0;
  for (const ch of input) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

const root = process.cwd();

const schemas = [];
for (const project of PROJECTS) {
  const schema = await loadSchema(project);
  if (schema) schemas.push({ name: project.name, tables: schema });
}

if (schemas.length === 0) {
  // Skip rather than fail. A missing secret must never block every PR; the
  // check is here to catch bugs, not to become one.
  console.log('Skipping schema check: no Supabase credentials available.');
  console.log('To enable, set these repo secrets:');
  console.log('  NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL + LEARNING_HUB_SUPABASE_SERVICE_KEY');
  console.log('  NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
  console.log('The schema endpoint needs a service key; the anon key gets 401 there.');
  process.exit(0);
}

const knownTables = new Set();
for (const s of schemas) for (const t of s.tables.keys()) knownTables.add(t);

function columnsFor(table) {
  const union = new Set();
  for (const s of schemas) {
    const cols = s.tables.get(table);
    if (cols) for (const c of cols) union.add(c);
  }
  return union;
}

const files = walk(root);
const findings = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /\.from\(\s*['"`]([a-z0-9_]+)['"`]\s*\)([\s\S]{0,400}?)\.select\(\s*['"`]([^'"`]*)['"`]/g;
  let match;
  while ((match = re.exec(src)) !== null) {
    const [, table, between, selectList] = match;
    if (between.includes('.from(')) continue; // the select belongs to a later query
    const line = src.slice(0, match.index).split('\n').length;
    const rel = path.relative(root, file);

    if (!knownTables.has(table)) {
      findings.push({ rel, line, message: `table "${table}" does not exist in any project` });
      continue;
    }
    if (selectList.includes('*')) continue;

    const cols = columnsFor(table);
    for (let part of splitTopLevel(selectList)) {
      part = part.trim();
      if (!part || part.includes('(')) continue; // embedded resource
      if (part.includes(':')) part = part.split(':')[1].trim(); // alias:column
      if (!part || !/^[a-z0-9_]+$/i.test(part)) continue;
      if (!cols.has(part)) {
        findings.push({ rel, line, message: `${table}.${part} does not exist` });
      }
    }
  }
}

console.log(`Checked ${files.length} files against ${schemas.map((s) => s.name).join(' + ')}.`);

// Findings are keyed by file + message, deliberately without the line number,
// so that unrelated edits shifting a file around do not churn the baseline.
const keyOf = (f) => `${f.rel} :: ${f.message}`;

if (UPDATE_BASELINE) {
  const keys = [...new Set(findings.map(keyOf))].sort();
  fs.writeFileSync(BASELINE_PATH, JSON.stringify({ known: keys }, null, 2) + '\n');
  console.log(`Wrote ${keys.length} known problem(s) to ${BASELINE_PATH}.`);
  process.exit(0);
}

let baseline = new Set();
if (fs.existsSync(BASELINE_PATH)) {
  baseline = new Set(JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')).known || []);
}

const fresh = findings.filter((f) => !baseline.has(keyOf(f)));
const stillKnown = findings.length - fresh.length;

if (fresh.length === 0) {
  console.log(`No new schema drift. ${stillKnown} known problem(s) still in the baseline.`);
  if (stillKnown > 0) {
    console.log(`Shrink it by fixing entries in ${BASELINE_PATH}, then rerun with --update-baseline.`);
  }
  process.exit(0);
}

console.error(`\n${fresh.length} NEW schema problem(s):\n`);
for (const f of fresh) console.error(`  ${f.rel}:${f.line}  ${f.message}`);
console.error('\nThese queries fail at runtime with PostgREST error 42703 or 404.');
console.error('The calling code will most likely swallow it and render nothing, so this is blocking.');
console.error('If the code is right, the schema needs a migration. If the schema is right, fix the query.');
process.exit(1);
