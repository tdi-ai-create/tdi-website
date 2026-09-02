/**
 * Render the card that failed on 1 September through the real generator, to
 * confirm the five weights are producible rather than only mockable.
 *
 * Writes to disk only. Touches nothing live.
 */
import { renderToBuffer } from '@react-pdf/renderer'
import { writeFileSync } from 'node:fs'
import React from 'react'
import { ReferencePDF } from '../lib/pdf/quick-win-reference'

const out = process.argv[2] || 'weight-proof.pdf'
const stripInline = process.argv[3] === '--cites-in-small-print'

const data = {
  title: 'The First Few Minutes: When a Student Loses It',
  category: 'Classroom Management',
  description:
    'For the adult in the room right after a blow-up. Your response, the room, and the referral.',
  alert: {
    heading: 'If anyone could get hurt, get another adult.',
    text: 'Restraint and seclusion are not de-escalation tools. Imminent danger only, trained staff only. [NASP 2021]',
  },
  sections: [
    {
      heading: 'Your response comes first',
      items: [
        {
          label: 'Lower your voice. Slow your movements.',
          text: 'Keep instructions few and clear. State plainly what behaviour you expect right now. [NCTSN, Psychological First Aid for Schools]',
          say: 'I need you to stop that. We will sort the rest out after.',
        },
        {
          label: 'Hold the boundary without piling on.',
          text: 'Set a firm limit on the behaviour. Decide any consequence after things are calm, logically rather than punitively. [NCTSN Toolkit, p.5]',
        },
        {
          label: 'Give one safe choice.',
          text: 'Loss of control is often part of what the student is reacting to. One real, small choice beats a string of instructions. [NCTSN Toolkit, p.5]',
          say: 'You can sit here, or stand by the door. Your choice.',
        },
      ],
    },
    {
      heading: 'Do not assume you know the reason',
      items: [
        {
          label: 'Blowing up at correction can be a trauma reaction, not defiance.',
          text: 'That does not remove the boundary above. It should stop you deciding you know the cause before anyone trained has looked. [NCTSN Toolkit, p.4]',
        },
      ],
    },
    {
      heading: 'After the moment, not during it',
      items: [
        {
          label: 'Support, then refer.',
          text: 'Offer support yourself if you can, or refer the student to your counsellor or school mental health professional. [NCTSN PFA, Core Action 3]',
          say: 'I want to talk about this later, just us. Not now.',
        },
        {
          label: 'Give it a time and a place.',
          text: 'Set aside an actual time to talk about what happened, rather than processing it in front of the class. [NCTSN Toolkit, p.5]',
        },
      ],
    },
    {
      heading: 'When to escalate',
      items: [
        {
          label: 'Severe, or happening repeatedly? Refer it.',
          text: 'You do not need to be certain what is behind it first. Let a school mental health professional make that call. [NCTSN Toolkit, p.6]',
        },
        {
          label: 'Suspect abuse? Follow your district reporting procedure.',
          text: 'Separately, and without waiting on anything above. Your district policy governs the procedure. [NCTSN Toolkit, p.4]',
        },
      ],
    },
  ],
  small_print: [
    {
      heading: 'What is deliberately not here',
      text: 'Breathing exercises, calming scripts, or any technique for you to walk the student through. That is treatment, and it is not your job here.',
    },
    {
      text: 'Sources: NCTSN Child Trauma Toolkit for Educators pp.4-6; NCTSN Psychological First Aid for Schools, Core Action 3; NASP 2021 on restraint and seclusion.',
    },
  ],
}

if (stripInline) {
  for (const sec of data.sections) {
    for (const item of sec.items) item.text = item.text.replace(/\s*\[[^\]]+\]\s*$/, '')
  }
}

const buf = await renderToBuffer(React.createElement(ReferencePDF, { data }))
writeFileSync(out, buf)
const pages = buf.toString('latin1').match(/\/Count (\d+)/)?.[1] ?? '?'
console.log(`${out}  ${buf.length} bytes  pages=${pages}`)
