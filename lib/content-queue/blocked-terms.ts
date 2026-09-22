/**
 * Terms that must never reach a reader, checked mechanically at every gate.
 *
 * The list lives in `content_queue_blocked_terms` rather than here so it can be
 * changed without a deploy. Each row carries the reason, which is what the
 * refusal message says back to the writer.
 *
 * Why this exists: on 21 September 2026 a Substack post went out pointing
 * subscribers at a Facebook group TDI no longer runs, and a second approved
 * post carried the same line. Both had passed QA, creative and editorial. The
 * table already existed and was empty, and nothing read it, so three separate
 * reviewers were the only thing standing between a retired reference and a
 * paying subscriber. People are not a mechanism.
 */

export type BlockedTerm = { term: string; reason: string }

/**
 * Every action that moves a piece forward. Checked on `submit` as well as the
 * gates, so a writer learns about it immediately rather than two reviews later.
 */
export const TERM_CHECKED_ACTIONS = [
  'submit',
  'pass_qa',
  'pass_creative',
  'pass_editorial',
  'approve',
] as const

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Word-bounded so "vault" does not fire on "vaulted ceiling", but only where
 * the term actually begins and ends on a word character. A term like "c/o"
 * would otherwise never match.
 */
function matcher(term: string): RegExp {
  const t = escapeForRegex(term.trim())
  const lead = /^\w/.test(term.trim()) ? '\\b' : ''
  const tail = /\w$/.test(term.trim()) ? '\\b' : ''
  return new RegExp(`${lead}${t}${tail}`, 'i')
}

/** Which of the configured terms appear in this copy. */
export function findBlockedTerms(text: string, terms: BlockedTerm[]): BlockedTerm[] {
  if (!text) return []
  return terms.filter(t => t.term.trim() && matcher(t.term).test(text))
}

/**
 * One sentence per hit, naming the term and why it is retired. The writer
 * should not have to go and look up what is wrong with the word.
 */
export function blockedTermsMessage(hits: BlockedTerm[]): string {
  const list = hits.map(h => `"${h.term}" (${h.reason})`).join('; ')
  return `Retired reference, rewrite it before this moves on: ${list}.`
}

/* ------------------------------------------------------------------ */

export type BlockedChannel = { channel: string; reason: string }

/**
 * A retired destination, checked alongside the terms.
 *
 * The terms guard reads the copy. It has never read the channel, which is how
 * four posts reached a Facebook group TDI no longer runs: three before the
 * terms table was populated, and a fourth afterwards that simply never used
 * the phrase. Blocking the word was never going to be enough, because the
 * problem was never the word. It was the destination.
 *
 * Case-insensitive and trimmed, because `channel` is free text on the column
 * rather than an enum, so "Facebook" and "facebook " both exist in principle.
 */
export function findBlockedChannel(
  channel: string | null | undefined,
  blocked: BlockedChannel[],
): BlockedChannel | null {
  const c = (channel ?? '').trim().toLowerCase()
  if (!c) return null
  return blocked.find(b => b.channel.trim().toLowerCase() === c) ?? null
}

export function blockedChannelMessage(hit: BlockedChannel): string {
  return `"${hit.channel}" is a retired destination, so this piece has nowhere to go: ${hit.reason}`
}
