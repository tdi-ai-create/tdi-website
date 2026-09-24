import {
  asOffering,
  assignBands,
  rollup,
  scoreLead,
  stageMedians,
  travelTier,
  type MuckBand,
  type MuckInput,
  type MuckScore,
} from './muck'

/**
 * Score the whole board, once, in one place.
 *
 * This was the body of `/api/sales/muck`. It moved here because the Analytics
 * tab computed its own money independently, by summing the raw `value` column,
 * and therefore reported $1,562K on 24 September 2026 while the board headline
 * above it read $0.78M. Same board, same moment, two answers, because the
 * September correction only ever reached one of them.
 *
 * Two routes reading one function cannot drift apart. That is the entire point
 * of this file, so resist computing deal money anywhere else.
 *
 * Read only. No write path.
 */

/** Minimal shape this module needs from a Supabase client. */
interface Queryable {
  from(table: string): {
    select(cols: string): {
      is(col: string, val: null): { eq(col: string, val: string): PromiseLike<{ data: unknown[] | null; error: { message: string } | null }> }
      in(col: string, vals: string[]): PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
    }
  }
}

interface BoardRow {
  id: string
  name: string | null
  stage: string
  state: string | null
  value: number | null
  offering: string | null
  grant_support: boolean | null
  heat: string | null
  last_activity_at: string | null
  is_contact_only: boolean | null
}

export interface ScoredBoard {
  scored: MuckScore[]
  bands: Map<string, MuckBand>
  /** Stage by lead id, so callers can slice the board without a second read. */
  stages: Record<string, string>
  inputs: MuckInput[]
  noteCounts: Map<string, number>
  medians: Record<string, number>
  totals: ReturnType<typeof rollup>
}

/**
 * The board the model covers: this school year, real leads only.
 *
 * `is_contact_only` rows are people rather than opportunities, and a lead
 * outside the current school year is last year's business. Both are excluded
 * here and on the board page, which is why the two agree.
 */
export async function scoreBoard(
  supabase: unknown
): Promise<{ board: ScoredBoard | null; error: string | null }> {
  const db = supabase as Queryable

  const { data: opps, error } = await db
    .from('sales_opportunities')
    .select('id, name, stage, state, value, offering, grant_support, heat, last_activity_at, is_contact_only')
    .is('deleted_at', null)
    .eq('school_year', '2026-27')

  if (error) return { board: null, error: error.message }

  const board = ((opps ?? []) as BoardRow[]).filter(o => o.is_contact_only !== true)
  if (board.length === 0) return { board: null, error: null }

  const ids = board.map(o => o.id)

  // Counted directly off the two opportunity note tables rather than through
  // getAllClientNotesByOpp, because drag compares a lead against the median for
  // its own stage and both sides of that ratio have to be counted the same way.
  const [a, b] = await Promise.all([
    db.from('opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
    db.from('sales_opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
  ])
  if (a.error || b.error) {
    return { board: null, error: a.error?.message ?? b.error?.message ?? 'unknown' }
  }

  const noteCounts = new Map<string, number>()
  for (const row of [...(a.data ?? []), ...(b.data ?? [])]) {
    const id = (row as { opportunity_id: string }).opportunity_id
    noteCounts.set(id, (noteCounts.get(id) ?? 0) + 1)
  }

  const inputs: MuckInput[] = board.map(o => ({
    id: o.id,
    name: o.name ?? 'Unnamed',
    stage: o.stage,
    state: o.state,
    value: o.value,
    offering: asOffering(o.offering),
    grantConfirmed: o.grant_support === true,
    noteCount: noteCounts.get(o.id) ?? 0,
  }))

  const medians = stageMedians(inputs.map(i => ({ stage: i.stage, noteCount: i.noteCount })))
  const scored = inputs.map(i => scoreLead(i, medians[i.stage] ?? 0))
  const bands = assignBands(scored)
  const stages = Object.fromEntries(inputs.map(i => [i.id, i.stage]))
  const totals = rollup(scored, stages, bands)

  return {
    board: { scored, bands, stages, inputs, noteCounts, medians, totals },
    error: null,
  }
}

/**
 * The population the pipeline headline counts, and the money it counts.
 *
 * Mirrors the board page exactly: not paid, not lost, and Targeting excluded
 * because a lead nobody has spoken to is not pipeline. A lead the model cannot
 * value counts as zero rather than falling back to its recorded figure, which
 * is what put the stale pre-restructure imports back into the total the
 * correction was meant to remove. `unvalued` says how many, so the gap is
 * visible rather than silent.
 */
export function pipelineMoney(board: ScoredBoard) {
  const counted = board.scored.filter(s => {
    const stage = board.stages[s.id]
    return stage !== 'paid' && stage !== 'lost' && stage !== 'targeting'
  })
  const valued = counted.filter(s => s.value != null)
  const total = valued.reduce((sum, s) => sum + (s.value ?? 0), 0)
  return {
    total,
    count: counted.length,
    unvalued: counted.length - valued.length,
    /** Mean across the leads that carry a value, not across the whole board. */
    average: valued.length > 0 ? Math.round(total / valued.length) : 0,
  }
}

export { travelTier }
