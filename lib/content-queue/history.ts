/**
 * What happened to a piece before it reached a person.
 *
 * The queue's feedback_log holds every step, and none of it reaches the
 * approver. On 14 September the oldest waiting Substack post had seventeen log
 * entries recording three full round trips, including Lily flagging twice that
 * there is no structural standard for Substack and saying exactly what she
 * would have checked if there were. An approver reading that post saw a clean
 * draft and none of that.
 *
 * This is derived on the server rather than shipped raw, for two reasons. The
 * logs are large and mostly procedural, and the thing an approver needs is not
 * the transcript, it is: did this fight on the way here, and is anything still
 * unresolved.
 *
 * Gates record nothing when they pass. Only refusals carry notes, so a quiet
 * history genuinely means nothing was raised rather than that nobody looked.
 */

/** A single entry as the endpoint writes it. Everything is optional by design. */
type LogEntry = {
  at?: unknown
  actor?: unknown
  action?: unknown
  note?: unknown
  from?: unknown
  to?: unknown
}

export type PieceHistory = {
  /** How many times a gate or approver sent this back to the writer. */
  timesReturned: number
  /** Gate refusals recording that a channel has no agreed standard yet. */
  standardGaps: Array<{ actor: string; channel: string; note: string }>
  /** The most recent refusal, whoever made it. Null if it has never come back. */
  lastReturn: { actor: string; at: string; note: string } | null
  /** Which named gates have passed it, in order. */
  gatesPassed: string[]
  /** True when nothing was ever raised. Lets a reader say so rather than show a blank. */
  clean: boolean
}

const GATE_PASSES: Record<string, string> = {
  pass_qa: 'Julie',
  pass_creative: 'Lily',
  pass_editorial: 'Olivia',
}

/**
 * A gate that cannot judge a piece writes `NO STANDARD: <channel>` rather than
 * inventing a bar and enforcing it silently. Those are the ones Kristin is meant
 * to resolve by setting a contract from real work, so they are pulled out
 * separately instead of being buried among ordinary refusals.
 */
const NO_STANDARD = /^\s*NO STANDARD:\s*([a-z_]+)/i

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export function summariseHistory(log: unknown): PieceHistory {
  const entries: LogEntry[] = Array.isArray(log) ? (log as LogEntry[]) : []

  let timesReturned = 0
  const standardGaps: PieceHistory['standardGaps'] = []
  let lastReturn: PieceHistory['lastReturn'] = null
  const gatesPassed: string[] = []

  for (const e of entries) {
    const action = asString(e.action)
    const actor = asString(e.actor)
    const note = asString(e.note).trim()

    if (action === 'request_changes') {
      // A writer pulling their own draft back is not the work being refused, and
      // counting it as one would make a piece look contested when it was
      // somebody tidying up after themselves.
      const selfRecall = asString(e.from) === 'pending_qa' && actor === 'izzy' && /^recalling/i.test(note)
      if (!selfRecall) {
        timesReturned++
        lastReturn = { actor, at: asString(e.at), note }
      }

      const gap = note.match(NO_STANDARD)
      if (gap) standardGaps.push({ actor, channel: gap[1].toLowerCase(), note })
    }

    const gate = GATE_PASSES[action]
    if (gate && !gatesPassed.includes(gate)) gatesPassed.push(gate)
  }

  return {
    timesReturned,
    standardGaps,
    lastReturn,
    gatesPassed,
    clean: timesReturned === 0 && standardGaps.length === 0,
  }
}
