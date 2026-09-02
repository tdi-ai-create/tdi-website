/**
 * Fixtures for retireReviewStamp. Reads nothing, writes nothing.
 *   npx tsx scripts/replace-file-selftest.ts
 */
import { retireReviewStamp } from '../lib/hub/replace-file'

let failures = 0
function check(name: string, ok: boolean, detail = '') {
  if (!ok) { failures++; console.log(`FAIL  ${name}${detail ? `  ${detail}` : ''}`) }
  else console.log(`ok    ${name}`)
}

const STAMP = '2026-09-02T03:00:00.000Z'

const reviewed = {
  id: 'a', slug: 'calm-corner',
  qa_notes: '[2026-09-01] rubric-v2 pass by Julie Lynn',
  reviewed_at: '2026-09-01T10:00:00.000Z',
  reviewed_by: 'Julie Lynn',
}
const r1 = retireReviewStamp(reviewed, 'tool', 'Jasmine', STAMP)

check('clears reviewed_at', r1.patch.reviewed_at === null)
check('clears reviewed_by', r1.patch.reviewed_by === null)
check('reports that a stamp existed', r1.hadStamp === true)
check('keeps the old qa_notes history', r1.patch.qa_notes.includes('rubric-v2 pass by Julie Lynn'))
check('names who replaced the file', r1.patch.qa_notes.includes('Jasmine'))
check('names which file changed', r1.patch.qa_notes.includes('tool file replaced'))
check('records the superseded reviewer', r1.patch.qa_notes.includes('Previous review by Julie Lynn'))

// The count query for reviewed items matches on the rubric version string, so an
// audit line must never reintroduce it. This bit us once already: a withdrawal
// note containing "rubric-v2" kept the item inside the reviewed count.
check(
  'audit line does not reintroduce the rubric version',
  !r1.auditLine.includes('rubric-v2'),
  r1.auditLine,
)

const never = { id: 'b', slug: 'new-thing', qa_notes: null, reviewed_at: null, reviewed_by: null }
const r2 = retireReviewStamp(never, 'guide', 'upload_pdf', STAMP)
check('unreviewed item reports no prior stamp', r2.hadStamp === false)
check('unreviewed item still gets an audit line', r2.patch.qa_notes.startsWith(`[${STAMP}]`))
check('no dangling previous-review sentence', !r2.patch.qa_notes.includes('Previous review'))

console.log(failures === 0 ? '\nall fixtures pass' : `\n${failures} failing`)
process.exit(failures === 0 ? 0 : 1)
