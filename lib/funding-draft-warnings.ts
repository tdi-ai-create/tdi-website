/**
 * Catch our own notes before a school reads them.
 *
 * The follow-up drafts interpolate a task title into client copy. Task titles
 * are written for us, not for them, so what went out read like this:
 *
 *   "Hi Teri, I wanted to follow up on Remind Teri: Walmart Spark Good window
 *    is open. Time to submit."
 *
 * That is our own to-do about Teri, quoted back to Teri. Fifty two of these
 * reached four people between 30 July and 17 August. Six more are queued to
 * Gary Doughan carrying our pricing ladder and the words "mark this
 * opportunity not applicable" about his own district.
 *
 * The generator is being fixed separately. This is the safety net for drafts
 * that already exist and for anything a future agent writes: the approval
 * queue refuses to treat a draft as sendable while it still reads like a note
 * to ourselves, and it says which phrase gave it away.
 */

export type DraftWarning = {
  /** The offending phrase, trimmed for display. */
  phrase: string
  /** Plain sentence for the reviewer. No jargon: Bella reads this, not a dev. */
  explain: string
}

/**
 * Each rule is a phrase that only ever appears in text written for us.
 * Deliberately literal. A clever rule that fires on real client copy would
 * train the reviewer to click past the warning, which is worse than no rule.
 */
const RULES: Array<{ re: RegExp; explain: string }> = [
  {
    re: /\b(?:re-?send|remind|check if|ask|confirm whether|follow up with|chase)\b[^.!?]{0,60}\b(?:her|him|them|to confirm)\b/gi,
    explain: 'Reads as an instruction to a colleague about this person, not a message to them.',
  },
  {
    re: /\bRemind\s+[A-Z][a-z]+\s*:/g,
    explain: 'This is the wording of our own reminder, with their name in the third person.',
  },
  {
    re: /\bCheck if\s+[A-Z][a-z]+\b/g,
    explain: 'This is the wording of our own reminder, with their name in the third person.',
  },
  {
    re: /\$[\d,]+\s*(?:group|individual|per[- ]seat)?\s*tier\b/gi,
    explain: 'Our pricing ladder. A funder or district contact should never see how we tier them.',
  },
  {
    re: /\b(?:rescope|proceed with the|mark this opportunity|not applicable|if zero|if 3\+|if 1-2)\b/gi,
    explain: 'Internal decision logic about whether to pursue this school.',
  },
  {
    re: /\bTDI(?:'|’)?s? own\b|\bour (?:contracts|ops|internal) team\b/gi,
    explain: 'Refers to our internal team the way we talk among ourselves.',
  },
  {
    re: /\bopportunity\b(?=[^.!?]{0,40}\b(?:stage|pipeline|pursuit|record)\b)/gi,
    explain: 'Pipeline vocabulary. To them this is their grant, not an opportunity record.',
  },
]

/** Strip HTML so a rule matches the words a person actually reads. */
function toText(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Warnings for one draft. Empty array means nothing suspicious was found,
 * which is not the same as "this is good". A human still reads it.
 */
export function findInternalText(
  subject: string | null | undefined,
  body: string | null | undefined
): DraftWarning[] {
  const haystack = `${subject ?? ''} \n ${toText(body)}`
  const found = new Map<string, DraftWarning>()

  for (const rule of RULES) {
    // Rules carry /g, which makes lastIndex sticky across calls. Rebuild per
    // use so a draft is never skipped because the previous one moved the index.
    const re = new RegExp(rule.re.source, rule.re.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(haystack)) !== null) {
      const phrase = m[0].trim().slice(0, 120)
      if (phrase && !found.has(phrase.toLowerCase())) {
        found.set(phrase.toLowerCase(), { phrase, explain: rule.explain })
      }
      if (m.index === re.lastIndex) re.lastIndex++
      if (found.size >= 6) break
    }
    if (found.size >= 6) break
  }

  return [...found.values()]
}
