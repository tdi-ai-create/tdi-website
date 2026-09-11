/**
 * Does the UI translator leave alone the things it must leave alone.
 *
 * Every case here is a string that was actually wrong on the live Spanish page
 * on 11 September, or a way the fix could plausibly go wrong.
 *
 *   npx tsx scripts/ui-translation-guard-selftest.ts
 */

import {
  prepareForTranslation,
  maskProtected,
  unmaskProtected,
  UI_OVERRIDES_ES,
} from '../lib/hub/ui-translation-guard'

let failed = 0
const ok = (name: string) => console.log(`ok    ${name}`)
const bad = (name: string, detail: string) => {
  failed++
  console.log(`FAIL  ${name}\n      ${detail}`)
}

// 1. The company name never goes to a translator at all.
{
  const r = prepareForTranslation('Teachers Deserve It')
  if (r.resolved === 'Teachers Deserve It') ok('the company name is returned untouched')
  else bad('the company name is returned untouched', `got ${JSON.stringify(r)}`)
}

// 2. Product names survive inside a sentence. This is the one that was wrong:
//    "Share this Quick Win" came back as "Comparte este pequeño triunfo".
{
  const { masked, found } = maskProtected('Share this Quick Win')
  if (masked.includes('Quick Win')) {
    bad('a product name inside a sentence is masked', `still present: ${masked}`)
  } else {
    // Simulate a translator that translates around the token.
    const restored = unmaskProtected(masked.replace('Share this', 'Comparte este'), found)
    if (restored === 'Comparte este Quick Win') ok('a product name inside a sentence survives')
    else bad('a product name inside a sentence survives', `got "${restored}"`)
  }
}

// 3. Longest-first matching, so "Quick Wins" is not left as "Quick Win" + "s".
{
  const { masked, found } = maskProtected('Back to Quick Wins')
  const restored = unmaskProtected(masked.replace('Back to', 'Volver a'), found)
  if (restored === 'Volver a Quick Wins') ok('Quick Wins is protected as a whole')
  else bad('Quick Wins is protected as a whole', `got "${restored}"`)
}

// 4. The badge words match what the PDF prints. This is the contradiction a
//    reader could see: page said "Elevación media", document said something else.
{
  const r = prepareForTranslation('Medium Lift')
  if (r.resolved === 'Algo de preparación') ok('the lift badge matches the document')
  else bad('the lift badge matches the document', `got ${JSON.stringify(r)}`)
}

// 5. Categories agree between the card and the document it opens.
{
  const r = prepareForTranslation('Classroom Management')
  if (r.resolved === 'Manejo del aula') ok('the category matches the document')
  else bad('the category matches the document', `got ${JSON.stringify(r)}`)
}

// 6. A translator that mangles the token's spacing or case still restores.
{
  const { found } = maskProtected('Share this Quick Win')
  const mangled = '__ tdi 0 __ compartido'
  const restored = unmaskProtected(mangled, found)
  if (restored.includes('Quick Win') && !/tdi/i.test(restored)) {
    ok('a mangled token is still restored')
  } else {
    bad('a mangled token is still restored', `got "${restored}"`)
  }
}

// 7. An ordinary string is untouched by any of this and goes to the translator.
{
  const r = prepareForTranslation('Save to Library')
  if (r.resolved === undefined && r.masked === 'Save to Library' && r.found?.length === 0) {
    ok('an ordinary string is passed through to the translator')
  } else {
    bad('an ordinary string is passed through to the translator', JSON.stringify(r))
  }
}

// 8. No override is a dash or an emoji, because those are banned in both
//    languages and an override bypasses every other check.
{
  const offenders = Object.entries(UI_OVERRIDES_ES).filter(
    ([, v]) => /--|—|–/.test(v) || /[\u{1F300}-\u{1FAFF}]/u.test(v),
  )
  if (offenders.length === 0) ok('no override smuggles in a dash or an emoji')
  else bad('no override smuggles in a dash or an emoji', offenders.map(o => o[0]).join(', '))
}

// 9. Caps. LEARNING HUB in the nav slipped through a case-sensitive pass on
//    the first day of this fix and rendered as CENTRO DE APRENDIZAJE.
{
  const r = prepareForTranslation('LEARNING HUB')
  if (r.resolved === 'LEARNING HUB') ok('a protected name in caps is protected, and keeps its caps')
  else bad('a protected name in caps is protected', JSON.stringify(r))
}

// 10. Grammar. A masked name reads as neuter, so "Share this Quick Win" came
//     back as "Comparte esto Quick Win" rather than "este".
{
  const r = prepareForTranslation('Share this Quick Win')
  if (r.resolved === 'Comparte este Quick Win') ok('a determiner before a product name agrees with it')
  else bad('a determiner before a product name agrees with it', JSON.stringify(r))
}

if (failed > 0) {
  console.log(`\n${failed} failure(s).`)
  process.exit(1)
}
console.log('\nAll cases pass.')
