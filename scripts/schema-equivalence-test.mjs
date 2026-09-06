/**
 * The canonical field names must mean exactly what the legacy ones mean.
 *
 * Renders the same card twice per generator, once with the old names and once
 * with `do`/`why`, and asserts the page content is byte-identical. Then asserts
 * both carry two distinct weights, so a pass cannot be achieved by both being
 * equally flat.
 *
 * Writes nothing outside a temp buffer. Touches nothing live.
 */
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import zlib from 'node:zlib'
import { ReferencePDF } from '../lib/pdf/quick-win-reference'
import { ChecklistPDF } from '../lib/pdf/quick-win-checklist'
import { ToolkitPDF } from '../lib/pdf/quick-win-toolkit'

const DO = 'Lower your voice. Slow your movements.'
const WHY = 'Keep instructions few and clear. Name the behaviour you expect right now.'
const SAY = 'I need you to stop that. We will sort the rest out after.'

const cases = [
  ['reference_card', ReferencePDF,
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ label: DO, text: WHY, say: SAY }] }] },
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ do: DO, why: WHY, say: SAY }] }] }],
  ['checklist', ChecklistPDF,
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ text: DO, detail: WHY, say: SAY }] }] },
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ do: DO, why: WHY, say: SAY }] }] }],
  ['toolkit', ToolkitPDF,
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ title: DO, body: WHY, say: SAY }] }] },
    { title: 'T', category: 'Communication', sections: [{ heading: 'H', items: [{ do: DO, why: WHY, say: SAY }] }] }],
]

/** Page content only: creation stamps and doc ids differ per render by design. */
function pageStreams(buf) {
  const out = []
  for (const m of buf.toString('latin1').matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    try { out.push(zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1')) } catch {}
  }
  return out.join('\n')
}

function sizes(content) {
  const s = new Set()
  for (const m of content.matchAll(/\/F\d+\s+([\d.]+)\s+Tf/g)) s.add(Math.round(parseFloat(m[1]) * 10) / 10)
  return s
}

let failed = false
for (const [name, Comp, legacy, canonical] of cases) {
  const a = pageStreams(await renderToBuffer(React.createElement(Comp, { data: legacy })))
  const b = pageStreams(await renderToBuffer(React.createElement(Comp, { data: canonical })))
  const same = a === b
  const sz = sizes(a)
  const weighted = sz.has(11) && sz.has(8.5)
  if (!same || !weighted) failed = true
  console.log(
    `${same && weighted ? 'ok  ' : 'FAIL'} ${name.padEnd(15)} ` +
    `identical=${same}  weights=${weighted ? '11pt over 8.5pt' : [...sz].sort((x, y) => y - x).join(',')}`)
}
console.log(failed ? '\nequivalence broken' : '\nold and new names render identically, and both carry two weights')
process.exit(failed ? 1 : 0)
