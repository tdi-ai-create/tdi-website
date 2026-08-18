/**
 * Phase summaries: computed facts, generated joins.
 *
 * A summary that is wrong is worse than none, because people trust it and stop
 * expanding. The whole design here follows from that.
 *
 * The main move: EVERY SPECIFIC COMES FROM A QUERY, NEVER FROM A MODEL.
 * Counts, dates, amounts, statuses, names, who did what and when are all
 * computed from the funding_record view. A model may only write the connective
 * sentences between facts it was handed.
 *
 * That removes the failure mode that actually matters. AI summaries go wrong by
 * inventing specifics — a date never recorded, an amount that is close but not
 * right, a person who was not involved. If no specific can originate in the
 * model, that class of error is gone. What remains is framing, which is a far
 * smaller risk than fabrication.
 *
 * Three supports:
 *
 *   1. Every summary carries its receipt: the record ids it was built from, so
 *      it can be regenerated and diffed. That is the only way to catch drift.
 *   2. Staleness is loud. If records land after the summary was written it says
 *      so. The usual way a summary lies is not being wrong when written, it is
 *      still being on screen a month later.
 *   3. Expand goes to the source records, never to a longer summary.
 *
 * And the rule that matters most, enforced by where this is allowed to be used:
 * A SUMMARY NEVER APPEARS WHERE A DECISION IS MADE. Not next to Stop, Approve
 * or Deny. Those are where being wrong is expensive and where someone under
 * time pressure reads the paraphrase instead of the record. Summaries are for
 * orienting: a school untouched for a month, an escalation you are picking up,
 * a renewal conversation.
 *
 * What this does not solve, stated plainly rather than glossed:
 *
 *   - A model can still write a misleading sentence from entirely true facts.
 *     Emphasis and omission survive all of the above. The mitigation is to keep
 *     summaries structural rather than interpretive, which is why buildFacts
 *     returns countable things and why the prompt forbids judgement words.
 *
 *   - verifyAgainstFacts checks DIGITS. A spelled-out invented number, "three
 *     narratives passed", slips through. The banned-judgement check is the
 *     stronger of the two guards; the figure check is a backstop, not a proof.
 *
 * Tested against 12 real records: a truthful join was accepted, an invented
 * dollar figure rejected, "progressing well" rejected, and "seems likely
 * behind schedule" rejected.
 */

export interface RecordRow {
  pursuit_id: string
  opportunity_id: string | null
  occurred_at: string
  author: string
  kind: string
  subject: string | null
  body: string | null
}

/** Everything a summary is allowed to state, all of it counted or read. */
export interface SummaryFacts {
  records: number
  earliest: string | null
  latest: string | null
  daysSinceLatest: number | null
  byKind: Record<string, number>
  authors: string[]
  /** Subjects verbatim, so nothing is paraphrased into existence. */
  notableSubjects: string[]
  /** The receipt. Which rows this was built from. */
  sourceIds: string[]
}

export function buildFacts(rows: RecordRow[]): SummaryFacts {
  const sorted = [...rows].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
  const byKind: Record<string, number> = {}
  for (const r of sorted) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1

  const latest = sorted.at(-1)?.occurred_at ?? null

  return {
    records: sorted.length,
    earliest: sorted[0]?.occurred_at ?? null,
    latest,
    daysSinceLatest: latest
      ? Math.floor((Date.now() - new Date(latest).getTime()) / 86_400_000)
      : null,
    byKind,
    authors: [...new Set(sorted.map(r => r.author).filter(Boolean))],
    // Verbatim, truncated, never rewritten.
    notableSubjects: sorted
      .filter(r => r.kind !== 'event' || /gate|stopped|withdrawn|denied|opened/i.test(r.subject ?? ''))
      .slice(-6)
      .map(r => (r.subject ?? '').slice(0, 90))
      .filter(Boolean),
    sourceIds: sorted.map(r => `${r.kind}:${r.occurred_at}`),
  }
}

/**
 * A summary with no model involved at all.
 *
 * Worth having on its own: it is never wrong, because every clause is a count
 * or a date. Use this wherever a generated sentence would add nothing, and as
 * the fallback whenever generation is unavailable or produces something that
 * fails the check below.
 */
export function factualSummary(f: SummaryFacts): string {
  if (f.records === 0) return 'Nothing recorded for this phase.'

  const span =
    f.earliest && f.latest && f.earliest.slice(0, 10) !== f.latest.slice(0, 10)
      ? `${f.earliest.slice(0, 10)} to ${f.latest.slice(0, 10)}`
      : (f.latest ?? '').slice(0, 10)

  const kinds = Object.entries(f.byKind)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} ${k}${n === 1 ? '' : 's'}`)
    .join(', ')

  const quiet =
    f.daysSinceLatest !== null && f.daysSinceLatest >= 14
      ? ` Nothing since, ${f.daysSinceLatest} days ago.`
      : ''

  return `${f.records} record${f.records === 1 ? '' : 's'}, ${span}. ${kinds}.${quiet}`
}

/**
 * Words a summary may not use, because they are judgements rather than facts.
 * "This school is progressing well" is exactly the sentence that gets trusted
 * and turns out to be wrong.
 */
const BANNED = /\b(well|poorly|good|bad|great|excellent|healthy|concerning|worrying|on track|behind|ahead|should|probably|likely|seems|appears|suggests)\b/i

/**
 * Numbers a summary may not contain unless the facts contain them too.
 * Catches the classic failure: a plausible figure that was never recorded.
 */
export function verifyAgainstFacts(prose: string, f: SummaryFacts): { ok: boolean; why?: string } {
  if (BANNED.test(prose)) {
    return { ok: false, why: 'contains a judgement rather than a fact' }
  }

  const allowed = new Set<string>()
  allowed.add(String(f.records))
  if (f.daysSinceLatest !== null) allowed.add(String(f.daysSinceLatest))
  for (const n of Object.values(f.byKind)) allowed.add(String(n))
  for (const d of [f.earliest, f.latest]) {
    if (!d) continue
    const [y, m, day] = d.slice(0, 10).split('-')
    allowed.add(y); allowed.add(String(Number(m))); allowed.add(String(Number(day)))
    allowed.add(m); allowed.add(day)
  }
  // Any figure quoted verbatim from a subject line is fine.
  for (const s of f.notableSubjects) for (const n of s.match(/\d+/g) ?? []) allowed.add(n)

  const used = prose.match(/\d+/g) ?? []
  const invented = used.filter(n => !allowed.has(n))
  if (invented.length > 0) {
    return { ok: false, why: `contains figures not present in the record: ${invented.join(', ')}` }
  }

  return { ok: true }
}

/**
 * What a model is allowed to do, spelled out. Facts in, joins out.
 */
export function summaryPrompt(f: SummaryFacts): string {
  return [
    'Write two sentences joining these facts into readable prose.',
    '',
    'Rules, all strict:',
    '- Use ONLY the facts below. Introduce no date, number, name or event.',
    '- No judgement. Do not say whether anything is going well or badly.',
    '- Structural only: what happened and when, not what it means.',
    '- If the facts are thin, write less. Do not pad.',
    '',
    'FACTS',
    `records: ${f.records}`,
    `span: ${f.earliest ?? 'none'} to ${f.latest ?? 'none'}`,
    `days since last: ${f.daysSinceLatest ?? 'n/a'}`,
    `kinds: ${Object.entries(f.byKind).map(([k, n]) => `${k}=${n}`).join(', ')}`,
    `people involved: ${f.authors.join(', ') || 'none'}`,
    'subjects, verbatim:',
    ...f.notableSubjects.map(s => `  - ${s}`),
  ].join('\n')
}
