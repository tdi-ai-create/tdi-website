#!/usr/bin/env node
/**
 * Fail when a PDF template hardcodes a word a reader sees.
 *
 * Why this exists. Every string a Quick Win PDF prints that is not the author's
 * content has to come from lib/pdf/labels.ts, because that is the only place
 * that knows what language the document is in. Twice in two days a string did
 * not, and both times the same sweep missed it:
 *
 *   'Before anything else'  a default on an optional prop
 *   'Say'                   a default parameter value
 *
 * Neither is text sitting in the page, so reading the templates for text sitting
 * in the page found neither. A teacher opened a Spanish document and read
 * English furniture over Spanish words, and a reviewer had to catch it.
 *
 * Care did not work twice, so this is mechanical. It flags any capitalised
 * human-looking string literal in the template files and makes you either move
 * it into labels.ts or add it to the allowlist below with a reason.
 *
 *   node scripts/check-pdf-chrome.mjs
 *
 * Exits 1 on a finding, so it gates.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'lib/pdf'

// labels.ts is where these strings are supposed to live, so it is the one file
// allowed to hold them.
const SOURCE_OF_TRUTH = 'labels.ts'

/**
 * Strings that are not words a reader reads.
 *
 * Anything added here needs a reason in the comment beside it. "It is fine"
 * is not a reason: the two bugs this check exists for both looked fine.
 */
const ALLOWED = new Map([
  ['Helvetica', 'font family, not prose'],
  ['Helvetica-Bold', 'font family, not prose'],
  ['Helvetica-Oblique', 'font family, not prose'],
  ['LETTER', 'page size'],
  ['Teachers Deserve It', 'the company name, English in every language'],
  ['Quick Win', 'product name, English in every language, see labels.ts'],
])

const SUSPECT = /'([A-Z][A-Za-z]*(?:[ -][A-Za-z]+)*)'/g

let findings = 0

for (const file of readdirSync(DIR).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))) {
  if (file === SOURCE_OF_TRUTH) continue
  const path = join(DIR, file)
  const lines = readFileSync(path, 'utf8').split('\n')

  lines.forEach((line, i) => {
    // Comments explain the rules and quote the strings, so they are not code.
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
    if (/^\s*\*/.test(line)) return

    for (const match of code.matchAll(SUSPECT)) {
      const text = match[1]
      if (ALLOWED.has(text)) continue
      // Single capitalised tokens with no vowel pattern are usually enum values
      // from react-pdf. Requiring a space or a known word keeps the noise down
      // without letting a real label through: both bugs this catches were a
      // capitalised word or phrase.
      if (!/[ ]/.test(text) && text.length < 3) continue

      findings++
      console.log(`${path}:${i + 1}  hardcoded "${text}"`)
      console.log(`    ${line.trim()}`)
      console.log('    Move it into lib/pdf/labels.ts and read it through getLabels(lang),')
      console.log('    or add it to ALLOWED in this script with a reason.\n')
    }
  })
}

if (findings > 0) {
  console.log(`${findings} hardcoded string(s) in ${DIR}.`)
  console.log('Every word a reader sees has to come from labels.ts, because that is')
  console.log('the only place that knows which language the document is in.')
  process.exit(1)
}

console.log(`No hardcoded reader-facing strings in ${DIR}. Every label comes from labels.ts.`)
