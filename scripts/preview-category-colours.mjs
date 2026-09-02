/**
 * Render one sample tool per category so the variety can be looked at rather
 * than argued about.
 *
 * Uses the real generators, real category colours and a realistic body, so what
 * comes out is what a teacher would get. Writes to a folder and touches nothing
 * live.
 *
 *   npx tsx scripts/preview-category-colours.mjs [outDir]
 */
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, writeFileSync } from 'node:fs'
import React from 'react'
import { ChecklistPDF } from '../lib/pdf/quick-win-checklist'
import { FormPDF } from '../lib/pdf/quick-win-form'
import { ReferencePDF } from '../lib/pdf/quick-win-reference'
import { CATEGORY_COLORS } from '../lib/hub/categoryColors'

const outDir = process.argv[2] || 'category-previews'
mkdirSync(outDir, { recursive: true })

// Rotate the three artifact shapes across the categories so the sample shows
// both axes at once: colour varying by category, layout varying by tool type.
const SHAPES = ['checklist', 'form', 'reference']

const sample = {
  checklist: (title, category) => ({
    title,
    category,
    description: 'A sample rendered from the real generator, so the category colour can be seen in place.',
    instructions: 'Work down the list. Tick as you go. Nothing here needs preparation.',
    sections: [
      { heading: 'Before the lesson', items: ['Set the room so every seat can see the board', 'Put the day plan somewhere visible', 'Decide the one thing this lesson has to land'] },
      { heading: 'During', items: ['Name the level you want, not the behaviour you do not', 'Check for understanding twice, not once at the end', 'Leave two minutes at the close'] },
    ],
    notes_lines: 3,
  }),
  form: (title, category) => ({
    title,
    category,
    description: 'A sample rendered from the real generator, so the category colour can be seen in place.',
    meta: [{ label: 'Takes', value: '10 minutes' }, { label: 'Use with', value: 'Any grade' }],
    sections: [
      {
        heading: 'Define it',
        fields: [
          { label: 'What is the procedure?', type: 'lines', lines: 2 },
          { label: 'Who is involved?', hint: 'Front office, teacher, admin, counsellor', type: 'line' },
        ],
      },
      {
        heading: 'Check it',
        fields: [
          { label: 'What does good look like?', type: 'box' },
          { label: 'How will you know it worked?', type: 'small_box' },
        ],
      },
    ],
  }),
  reference: (title, category) => ({
    title,
    category,
    description: 'A sample rendered from the real generator, so the category colour can be seen in place.',
    quick_facts: [{ label: 'Takes', value: '30 seconds' }, { label: 'Prep', value: 'None' }],
    sections: [
      {
        heading: 'Use this when',
        items: [
          { label: 'Mid lesson', text: 'You have thirty seconds and need the right words.' },
          { label: 'After a drift', text: 'A routine has slipped and you want it back without a speech.' },
        ],
        highlight: { label: 'Say this', text: 'Bring it to a two. Show me you are ready.' },
      },
      {
        heading: 'Avoid',
        items: [
          { text: 'Raising your voice to ask for quiet.' },
          { text: 'Explaining the rule again instead of naming the level.' },
        ],
        tip: 'Teach it once, then reinforce daily for two weeks.',
      },
    ],
  }),
}

let i = 0
for (const [category] of Object.entries(CATEGORY_COLORS)) {
  const shape = SHAPES[i % SHAPES.length]
  const title = `${category} sample`
  const data = sample[shape](title, category)
  const el =
    shape === 'checklist' ? React.createElement(ChecklistPDF, { data })
    : shape === 'form' ? React.createElement(FormPDF, { data })
    : React.createElement(ReferencePDF, { data })

  const buf = await renderToBuffer(el)
  const safe = category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const file = `${outDir}/${String(i + 1).padStart(2, '0')}-${safe}-${shape}.pdf`
  writeFileSync(file, buf)
  console.log(`${String(buf.length).padStart(7)}b  ${shape.padEnd(10)} ${file}`)
  i++
}
console.log(`\n${i} samples in ${outDir}/`)
