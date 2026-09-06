/**
 * Make text safe for the fonts these PDFs actually embed.
 *
 * Every generator here draws with base-14 Helvetica under WinAnsiEncoding and
 * embeds no font file. WinAnsi has no glyph for a ballot box, for a curly quote
 * left as a raw Windows-1252 byte, or for an em dash. react-pdf does not refuse
 * those characters, it draws whatever the encoding maps them to, so they reach
 * the page as mojibake.
 *
 * Measured 2026-09-06 across 40 published guides: 5 carried unrenderable
 * characters. `professional-email-practices-quick-reference` had 156, which is
 * what a teacher opening it actually saw. Every checkbox in its self-assessment
 * rendered as a stray accented capital.
 *
 * Nothing here changes wording. It maps a character to the nearest thing the
 * font can draw, and drops what has no equivalent rather than printing rubbish.
 */

/**
 * Characters with a sensible WinAnsi stand-in.
 *
 * The ``-style keys are raw Windows-1252 bytes sitting in the C1 control
 * block. Text arrives that way after a lossy round trip, and it is the single
 * most common source of a broken apostrophe.
 */
const REPLACEMENTS: Record<string, string> = {
  // Curly quotes, as proper Unicode and as raw Windows-1252 bytes.
  '‘': "'", '’': "'", '‚': "'", '‛': "'",
  '“': '"', '”': '"', '„': '"',
  '': "'", '': "'", '': '"', '': '"',
  // Dashes and ellipsis.
  '‐': '-', '‑': '-', '‒': '-', '–': '-', '—': '-',
  '―': '-', '': '-', '': '-',
  '…': '...', '': '...',
  // Boxes and ticks. Every generator draws its own checkbox, so a box character
  // in the text is always a duplicate of one that is already on the page.
  '☐': '', '☑': '', '☒': '', '□': '', '■': '',
  '✓': '', '✔': '', '✗': '', 'Ï': '',
  // Bullets. The list markup provides these too.
  '•': '-', '·': '-', '●': '-', '○': '-',
  // Spaces that are not the space character.
  ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', '​': '',
}

/** WinAnsi is Latin-1 plus a specific set of higher codepoints. */
const WINANSI_EXTRA = new Set([
  0x20AC, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017D, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
  0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x017E, 0x0178,
])

function drawable(code: number): boolean {
  if (code === 0x09 || code === 0x0A) return true
  if (code < 0x20) return false
  if (code <= 0x7E) return true
  // C1 block. Never a real glyph, always a mangled byte.
  if (code >= 0x80 && code <= 0x9F) return false
  if (code <= 0xFF) return true
  return WINANSI_EXTRA.has(code)
}

/** Map one string to what the font can actually draw. */
export function safeText(value: string): string {
  let out = ''
  for (const ch of value) {
    const mapped = REPLACEMENTS[ch]
    if (mapped !== undefined) {
      out += mapped
      continue
    }
    out += drawable(ch.codePointAt(0) as number) ? ch : ''
  }
  // Removing a glyph leaves the space around it: a box leaves the run that
  // followed it, a trailing emoji leaves the one before it.
  return out.replace(/[ \t]{2,}/g, ' ').replace(/^[ \t]+/, '').replace(/[ \t]+$/, '')
}

/**
 * Walk a tool_content payload and clean every string inside it.
 *
 * Applied once at the route rather than inside each generator, so it cannot be
 * forgotten when a new tool type is added.
 */
export function safeContent<T>(value: T): T {
  if (typeof value === 'string') return safeText(value) as unknown as T
  if (Array.isArray(value)) return value.map(safeContent) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = safeContent(v)
    }
    return out as T
  }
  return value
}
