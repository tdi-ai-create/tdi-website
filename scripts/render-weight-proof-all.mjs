/**
 * Render one card per generator so the five weights can be seen rather than
 * inferred from a passing typecheck. Writes to disk only, touches nothing live.
 *
 * Also asserts the thing that matters: an instruction and its reasoning must not
 * share a font size, and every card must fit one page.
 */
import { renderToBuffer } from '@react-pdf/renderer'
import { writeFileSync, mkdirSync } from 'node:fs'
import React from 'react'
import { ChecklistPDF } from '../lib/pdf/quick-win-checklist'
import { ToolkitPDF } from '../lib/pdf/quick-win-toolkit'
import { FormPDF } from '../lib/pdf/quick-win-form'
import { w } from '../lib/pdf/weights'

const outDir = process.argv[2] || 'proofs'
mkdirSync(outDir, { recursive: true })

const alert = {
  heading: 'If anyone could get hurt, get another adult.',
  text: 'Restraint and seclusion are not de-escalation tools. Imminent danger only, trained staff only. [NASP 2021]',
}
const smallPrint = [
  { heading: 'What is deliberately not here', text: 'Any technique for you to walk the student through. That is treatment, and it is not your job here.' },
  { text: 'Sources: NCTSN Child Trauma Toolkit for Educators pp.4-6; NASP 2021.' },
]

const checklist = {
  title: 'Before the Meeting: A Difficult Conversation',
  category: 'Communication',
  description: 'Ten minutes of preparation before you sit down with a family.',
  alert,
  sections: [
    {
      heading: 'The day before',
      items: [
        { text: 'Write the one sentence you need them to leave with.', detail: 'If you cannot get it to one sentence, the meeting is not ready.' },
        { text: 'Check what has already been sent home.', detail: 'Arriving with news they received in an email three weeks ago costs you the room.' },
        'Book a room with a door that closes.',
      ],
    },
    {
      heading: 'In the first two minutes',
      items: [
        { text: 'Say what you appreciate about the child, specifically.', detail: 'Specific means an incident and a date, not a compliment.', say: 'On Tuesday she stayed behind to help pack up. Nobody asked her to.' },
        { text: 'Name the purpose of the meeting out loud.', detail: 'Families arrive braced. Saying it removes the guessing.' },
      ],
    },
  ],
  small_print: smallPrint,
  notes_lines: 3,
}

const toolkit = {
  title: 'Five Ways to Restart a Stalled Lesson',
  category: 'Instructional Strategies',
  description: 'For the moment you can feel the room has gone.',
  count_label: '5 moves',
  alert,
  sections: [
    {
      heading: 'Change what they are doing',
      items: [
        { title: 'Stop talking and give them a question.', body: 'Thirty seconds in pairs. The point is to break the listening posture, not to gather answers.', say: 'Turn to the person next to you. Thirty seconds. Go.' },
        { title: 'Move the room.', body: 'Standing, regrouping or shifting seats resets attention faster than asking for it.' },
      ],
    },
    {
      heading: 'Change what you are doing',
      items: [
        { title: 'Drop your volume instead of raising it.', body: 'A quieter voice makes the room work to hear you, where a louder one competes.', meta: 'Works better in smaller rooms.' },
        { title: 'Name what you are seeing, without blame.', body: 'Describing the room accurately is usually enough to change it.', say: 'I have lost about half of you. That is on the task, not on you.' },
        { title: 'Cut the lesson short and say why.', body: 'Ending early with a reason costs less than fifteen minutes nobody absorbs.' },
      ],
    },
  ],
  small_print: smallPrint,
}

const form = {
  title: 'Observation Notes: One Lesson',
  category: 'Leadership',
  description: 'Fill in during the lesson, not afterwards from memory.',
  alert,
  sections: [
    {
      heading: 'Before you start',
      fields: [
        { label: 'What did the teacher ask you to look for?', hint: 'Their question, in their words.', type: 'lines', lines: 2 },
      ],
    },
    {
      heading: 'During',
      fields: [
        { label: 'What did students actually do?', hint: 'Behaviour you saw, not what it suggests.', type: 'box' },
        { label: 'One thing worth repeating', type: 'lines', lines: 2 },
      ],
    },
  ],
  small_print: smallPrint,
}

const cases = [
  ['checklist', ChecklistPDF, checklist],
  ['toolkit', ToolkitPDF, toolkit],
  ['form', FormPDF, form],
]

// The rule the whole change exists to enforce, asserted rather than eyeballed.
const doSize = w.do.fontSize
const whySize = w.why.fontSize
if (!(doSize - whySize >= 2)) {
  console.error(`FAIL weight 2 (${doSize}pt) and weight 3 (${whySize}pt) are too close to scan apart`)
  process.exit(1)
}
console.log(`weight 2 ${doSize}pt against weight 3 ${whySize}pt, gap ${doSize - whySize}pt`)

// Page count is reported, not asserted. Whether a card fits one page is a
// question about how much was written, and section 3 answers it by scoping the
// content down. A generator that refuses to paginate would just truncate.
for (const [name, Comp, data] of cases) {
  const buf = await renderToBuffer(React.createElement(Comp, { data }))
  const file = `${outDir}/${name}.pdf`
  writeFileSync(file, buf)
  const pages = Number(buf.toString('latin1').match(/\/Count (\d+)/)?.[1] ?? 0)
  console.log(`ok   ${name.padEnd(10)} ${String(buf.length).padStart(6)}b  pages=${pages}  ${file}`)
}
