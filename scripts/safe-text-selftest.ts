/**
 * Fixtures for safeText and safeContent. Reads nothing, writes nothing.
 *   npx tsx scripts/safe-text-selftest.ts
 */
import { safeText, safeContent } from '../lib/pdf/safe-text'

let failures = 0
function eq(name: string, got: string, want: string) {
  if (got !== want) {
    failures++
    console.log(`FAIL  ${name}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`)
  } else {
    console.log(`ok    ${name}`)
  }
}

// The exact failure seen on the live guide: a ballot box rendered as a stray
// accented capital in front of every option.
eq('ballot box in front of an option',
   safeText('Ï   Constantly (every 15-30 minutes)'),
   'Constantly (every 15-30 minutes)')

// Raw Windows-1252 apostrophe, which is how "Parent's" arrived on the page.
eq('raw 1252 apostrophe', safeText('Dear [Parents Name],'), "Dear [Parent's Name],")
eq('proper curly apostrophe', safeText('I’ll respond'), "I'll respond")
eq('curly double quotes', safeText('“Hi Mrs. Johnson,”'), '"Hi Mrs. Johnson,"')

eq('em dash', safeText('one — two'), 'one - two')
eq('en dash', safeText('15–30 minutes'), '15-30 minutes')
eq('raw 1252 em dash', safeText('one  two'), 'one - two')
eq('ellipsis', safeText('wait…'), 'wait...')

eq('unicode checkbox is dropped, not drawn', safeText('☐ Do the thing'), 'Do the thing')
eq('tick is dropped', safeText('✓ Done'), 'Done')
eq('bullet becomes a hyphen', safeText('• A point'), '- A point')
eq('non-breaking space becomes a space', safeText('10 minutes'), '10 minutes')

// Accented Latin is inside WinAnsi and must survive untouched.
eq('accented latin survives', safeText('café, naïve, Zoë'), 'café, naïve, Zoë')
eq('plain ascii untouched', safeText('Lower your voice.'), 'Lower your voice.')

// Emoji have no glyph and no equivalent, so they go rather than print rubbish.
eq('emoji dropped', safeText('Nice work \u{1F44D}'), 'Nice work')

const cleaned = safeContent({
  title: 'A — B',
  sections: [{ items: [{ do: '☐ Step one', why: 'It’s worth it', n: 3, ok: true }] }],
  nothing: null,
})
const item = cleaned.sections[0].items[0]
eq('nested do', item.do, 'Step one')
eq('nested why', item.why, "It's worth it")
eq('nested title', cleaned.title, 'A - B')
if (item.n !== 3 || item.ok !== true || cleaned.nothing !== null) {
  failures++
  console.log('FAIL  non-string values must pass through untouched')
} else {
  console.log('ok    non-string values pass through untouched')
}

console.log(failures === 0 ? '\nall fixtures pass' : `\n${failures} failing`)
process.exit(failures === 0 ? 0 : 1)
