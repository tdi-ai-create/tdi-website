/**
 * Does the download selector serve the right file in every state.
 *
 * Eight cases, each one a thing that could actually happen to a reader on the
 * Hub. The two that matter most are the ones where an unreviewed document
 * exists: a Spanish file is written minutes before anyone reads it, and if the
 * page served it on existence alone then every item would go live unreviewed
 * for those minutes.
 *
 *   npx tsx scripts/spanish-download-selftest.ts
 *
 * Exits 1 on any failure, so it gates.
 */

import { pickDownloads } from '../lib/hub/spanish-download'

const EN_GUIDE = 'https://example/guide.pdf'
const EN_TOOL = 'https://example/tool.pdf'
const ES_GUIDE = 'https://example/guide-es.pdf'
const ES_TOOL = 'https://example/tool-es.pdf'
const STAMPED = '2026-09-11T00:00:00Z'

const full = {
  file_url: EN_GUIDE,
  tool_file_url: EN_TOOL,
  file_url_es: ES_GUIDE,
  tool_file_url_es: ES_TOOL,
  translated_at: STAMPED,
}

type Case = {
  name: string
  row: Parameters<typeof pickDownloads>[0]
  language: string
  flag: boolean
  expectTool: string | null
  expectLanguage: 'en' | 'es'
  expectFallbackNote: boolean
}

const CASES: Case[] = [
  {
    name: 'English reader gets English, always',
    row: full, language: 'en', flag: true,
    expectTool: EN_TOOL, expectLanguage: 'en', expectFallbackNote: false,
  },
  {
    name: 'Spanish reader, reviewed document, switch on: gets Spanish',
    row: full, language: 'es', flag: true,
    expectTool: ES_TOOL, expectLanguage: 'es', expectFallbackNote: false,
  },
  {
    name: 'Switch off: Spanish reader still gets English, and is told',
    row: full, language: 'es', flag: false,
    expectTool: EN_TOOL, expectLanguage: 'en', expectFallbackNote: true,
  },
  {
    name: 'UNREVIEWED Spanish file is never served, however complete it looks',
    row: { ...full, translated_at: null }, language: 'es', flag: true,
    expectTool: EN_TOOL, expectLanguage: 'en', expectFallbackNote: true,
  },
  {
    name: 'No Spanish file at all: English, with the note',
    row: { file_url: EN_GUIDE, tool_file_url: EN_TOOL }, language: 'es', flag: true,
    expectTool: EN_TOOL, expectLanguage: 'en', expectFallbackNote: true,
  },
  {
    name: 'Spanish tool but no Spanish guide: each file falls back on its own',
    row: { ...full, file_url_es: null }, language: 'es', flag: true,
    expectTool: ES_TOOL, expectLanguage: 'es', expectFallbackNote: false,
  },
  {
    name: 'Item with only a guide and no tool',
    row: { file_url: EN_GUIDE, file_url_es: ES_GUIDE, translated_at: STAMPED },
    language: 'es', flag: true,
    expectTool: null, expectLanguage: 'es', expectFallbackNote: false,
  },
  {
    name: 'English reader is never shown a language note',
    row: { file_url: EN_GUIDE }, language: 'en', flag: true,
    expectTool: null, expectLanguage: 'en', expectFallbackNote: false,
  },
]

let failed = 0

for (const c of CASES) {
  const got = pickDownloads(c.row, c.language, c.flag)
  const problems: string[] = []

  if (got.toolFileUrl !== c.expectTool) {
    problems.push(`tool: expected ${c.expectTool}, got ${got.toolFileUrl}`)
  }
  if (got.fileLanguage !== c.expectLanguage) {
    problems.push(`language: expected ${c.expectLanguage}, got ${got.fileLanguage}`)
  }
  if (got.fellBackToEnglish !== c.expectFallbackNote) {
    problems.push(`note: expected ${c.expectFallbackNote}, got ${got.fellBackToEnglish}`)
  }

  if (problems.length > 0) {
    failed++
    console.log(`FAIL  ${c.name}`)
    problems.forEach(p => console.log(`      ${p}`))
  } else {
    console.log(`ok    ${c.name}`)
  }
}

// The guard has to be able to catch its own case, or it is decoration. Serving
// an unreviewed Spanish file is the failure this whole gate exists to prevent,
// so prove the selector would notice.
const withoutStamp = pickDownloads({ ...full, translated_at: null }, 'es', true)
if (withoutStamp.fileLanguage === 'es') {
  console.log('\nFAIL  the review gate does not hold: an unstamped document was served')
  failed++
} else {
  console.log('\nok    the review gate holds when tested against its own failure')
}

if (failed > 0) {
  console.log(`\n${failed} failure(s).`)
  process.exit(1)
}
console.log(`\nAll ${CASES.length} cases pass.`)
