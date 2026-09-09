// ---------------------------------------------------------------------------
// The Focus sample packet.
//
// One description of the packet, shared by the three places that talk about it:
// the /for-schools section, the reveal a visitor sees after submitting, and the
// email that follows. Written down once because the last time three surfaces
// described the same artifact separately they drifted, and a leader who read
// the page and then the email saw two different products.
//
// The packet ships as two files on purpose. The preview file holds only the
// three public pages, so the gated eighteen are never sent to a browser that
// has not asked for them. Pointing an iframe at the full file with a page
// fragment would hand over all twenty one.
// ---------------------------------------------------------------------------

import type { ContactRole } from '@/types/leads';

/** Pages 1 to 3. Public, no email required, safe to link anywhere. */
export const FOCUS_PACKET_PREVIEW_PATH = '/downloads/the-focus-packet-preview.pdf';

/** Every page. Only linked after the form is submitted, and in the email. */
export const FOCUS_PACKET_FULL_PATH = '/downloads/the-focus-packet.pdf';

/**
 * What a visitor can read before being asked for anything. Each entry is one
 * page, in order, and pairs with the image of that page on the section.
 */
export const FOCUS_PACKET_PREVIEW_PAGES = [
  {
    image: '/downloads/focus-preview/page-1.png',
    label: 'What The Focus is, and everything the packet contains',
  },
  {
    image: '/downloads/focus-preview/page-2.png',
    label: 'An example school year, and what it adds up to',
  },
  {
    image: '/downloads/focus-preview/page-3.png',
    label: 'Whether you draw the line around a building or a role',
  },
] as const;

/** Pages 1 to 3 are rendered at this size. Letter, 100 dots per inch. */
export const FOCUS_PACKET_PREVIEW_IMAGE = { width: 850, height: 1100 } as const;

/** What the form unlocks. Used on the page, in the reveal, and in the email. */
export const FOCUS_PACKET_GATED_CONTENTS = [
  'Three of the 13 tools, laid out exactly as staff receive them, with one of them also in Spanish',
  'The guide for running the ninety minutes: the agenda, who does what, the four adaptation questions and the reflection sheet',
] as const;

export const FOCUS_PACKET_TOTAL_PAGES = 12;
export const FOCUS_PACKET_GATED_PAGES = 9;

export const FOCUS_PACKET_ROLES = [
  'Principal',
  'Assistant Principal',
  'Director of Special Education',
  'Curriculum or PD Director',
  'Superintendent or Cabinet',
  'Instructional Coach',
  'Teacher or Para',
  'Other',
] as const;

export type FocusPacketRole = (typeof FOCUS_PACKET_ROLES)[number];

/**
 * The labels on the form are the words a school leader would use. The CRM
 * stores a fixed set of role codes. Map between them here so the pipeline sees
 * a role it recognises. Instructional Coach has no code of its own yet, so it
 * lands in other and survives in the note we write alongside it.
 */
export const FOCUS_PACKET_ROLE_CODES: Record<FocusPacketRole, ContactRole> = {
  'Principal': 'principal',
  'Assistant Principal': 'assistant_principal',
  'Director of Special Education': 'director_of_special_ed',
  'Curriculum or PD Director': 'director_of_curriculum',
  'Superintendent or Cabinet': 'superintendent',
  'Instructional Coach': 'other',
  'Teacher or Para': 'teacher',
  'Other': 'other',
};
