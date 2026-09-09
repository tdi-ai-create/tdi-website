#!/usr/bin/env node
/**
 * Stops a game being listed that has no game behind it.
 *
 * On 9 September 2026, five Quick Wins were live in the Games filter with no
 * component built: first-conversation, name-that-move, read-the-room,
 * the-comeback, what-would-you-say. Clicking any of them showed "Practice tool
 * not found". They had been in that state for weeks.
 *
 * Two things made it invisible. A game has to exist in more than one place, the
 * registry in lib/hub/practice-games.ts and the component map in
 * app/hub/practice/[slug]/page.tsx, and nothing compared them. And the browse
 * list is generated from the registry alone, with no database filter, so
 * unpublishing the rows in Supabase changed nothing a teacher could see. The
 * registry is the thing that puts a game on the page.
 *
 * That is the same shape as the sync key having two sources under one name, and
 * the PDF generators having three names for one weight. Writing the rule down is
 * not enough, so this is mechanical: if the two lists disagree, the check fails.
 *
 * It cannot tell you a game is good. It only proves that something claiming to
 * be a game has a screen behind it.
 */
import { readFileSync } from 'node:fs'

const REGISTRY = 'lib/hub/practice-games.ts'
const COMPONENTS = 'app/hub/practice/[slug]/page.tsx'

function slugsFrom(file, pattern) {
  const text = readFileSync(file, 'utf8')
  return new Set([...text.matchAll(pattern)].map((m) => m[1]))
}

const registry = slugsFrom(REGISTRY, /^ {4}slug: '([a-z0-9-]+)'/gm)
const components = slugsFrom(COMPONENTS, /^ {2}'([a-z0-9-]+)':/gm)

if (registry.size === 0 || components.size === 0) {
  console.error(
    `check:games could not read one of the lists (registry ${registry.size}, components ${components.size}).\n` +
    'That means the file shape changed and this check is no longer looking at the right thing.\n' +
    'A check that cannot fail is not a check, so this is an error rather than a pass.'
  )
  process.exit(1)
}

const listedNotBuilt = [...registry].filter((s) => !components.has(s)).sort()
const builtNotListed = [...components].filter((s) => !registry.has(s)).sort()

if (listedNotBuilt.length === 0 && builtNotListed.length === 0) {
  console.log(`check:games ok. ${registry.size} games, each with a component behind it.`)
  process.exit(0)
}

if (listedNotBuilt.length) {
  console.error(`\n${listedNotBuilt.length} game(s) are listed but have no component.`)
  console.error('A teacher clicking these gets "Practice tool not found":')
  for (const s of listedNotBuilt) console.error(`  ${s}`)
  console.error(`\nEither build the component in ${COMPONENTS}, or remove the entry from ${REGISTRY}.`)
  console.error('Unpublishing the row in Supabase does NOT hide it: the browse list comes from the registry.')
}

if (builtNotListed.length) {
  console.error(`\n${builtNotListed.length} component(s) exist but are not listed, so nobody can reach them:`)
  for (const s of builtNotListed) console.error(`  ${s}`)
  console.error(`\nAdd them to ${REGISTRY} or delete the component.`)
}

process.exit(1)
