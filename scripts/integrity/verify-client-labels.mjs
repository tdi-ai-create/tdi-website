/**
 * Two rules about the wording a school is allowed to see.
 *
 * Fifty two emails carrying our own task notes reached four people between
 * 30 July and 17 August. The fix on 17 Aug landed in the cron only and was
 * never mirrored into lib/funding-followup-email.ts, so for another nine days
 * the same title was blocked on one path and mailed on the other.
 *
 * The bug was not a missing rule. It was one rule in two places, only one of
 * which learned anything. So this checks the shape of the source rather than
 * the behaviour of a function:
 *
 *   1. clientTaskLabel is defined exactly once.
 *   2. No client-facing template interpolates the raw itemTitle.
 *
 * Deliberately not a unit test. A unit test needs a TypeScript runner this repo
 * does not have, and a check that cannot run is a check that quietly passes.
 *
 * Run: npm run check:labels
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOTS = ['app', 'lib']
const ROOT = process.cwd()

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

const files = ROOTS.flatMap(r => {
  try { return walk(join(ROOT, r)) } catch { return [] }
})

let failures = 0

// ── 1. One definition ──

const DEFINITION = /(?:export\s+)?(?:function\s+clientTaskLabel\b|const\s+clientTaskLabel\s*[=:])/
const definers = files.filter(f => DEFINITION.test(readFileSync(f, 'utf8')))

if (definers.length !== 1) {
  failures++
  console.error(
    definers.length === 0
      ? 'clientTaskLabel is not defined anywhere. Something removed the only gate on client wording.'
      : `clientTaskLabel is defined ${definers.length} times. That is the bug that leaked 52 emails:`
  )
  for (const f of definers) console.error(`    ${relative(ROOT, f)}`)
  if (definers.length > 1) {
    console.error('  Keep one, in lib/funding-followup-email.ts, and import it everywhere else.')
  }
}

// ── 2. No raw task title in client copy ──
//
// The client templates are the three subject lines and the paragraph bodies.
// Each must use friendlyTask, which has been through clientTaskLabel. The
// internal tone may use itemTitle freely: only TDI reads those.

const CLIENT_MARKERS = [
  /`Heads up on \$\{([^}]+)\}/g,
  /`Following up: \$\{([^}]+)\}/g,
  /`Can you help with \$\{([^}]+)\}/g,
  /I wanted to follow up on <strong>\$\{([^}]+)\}/g,
  /Just a friendly heads-up[^`]*?<strong>\$\{([^}]+)\}/g,
  /I'm reaching out because <strong>\$\{([^}]+)\}/g,
]

const ALLOWED_IN_CLIENT_COPY = new Set(['friendlyTask', 'clientLabel'])

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  for (const marker of CLIENT_MARKERS) {
    const re = new RegExp(marker.source, marker.flags)
    let m
    while ((m = re.exec(src)) !== null) {
      const expr = m[1].trim()
      if (!ALLOWED_IN_CLIENT_COPY.has(expr)) {
        failures++
        console.error(
          `${relative(ROOT, file)} puts \${${expr}} into copy a school reads.\n` +
            '  Only friendlyTask may go there. It has been through clientTaskLabel; itemTitle has not.'
        )
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} problem(s). No school should read our own notes.`)
  process.exit(1)
}

console.log(
  `Client wording safe: clientTaskLabel defined once (${relative(ROOT, definers[0])}), ` +
    'and no client template interpolates a raw task title.'
)
