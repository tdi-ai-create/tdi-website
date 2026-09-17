import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import {
  asOffering,
  assignBands,
  rollup,
  scoreLead,
  stageMedians,
  travelTier,
  type MuckInput,
} from '@/lib/sales/muck'

export const dynamic = 'force-dynamic'

/**
 * Muck points for the whole board, keyed by opportunity id.
 *
 * Server side rather than computed in the page for three reasons. Drag needs a
 * full note count and `sales_opportunity_notes` has RLS on with no policies, so
 * the anon key the page uses reads back nothing at all. Bands are assigned by
 * rank, which needs every lead in hand at once rather than one card at a time.
 * And keeping the model in one file means the board and the dry run cannot
 * drift apart.
 *
 * Read only. This route has no write path.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const { data: opps, error } = await supabase
    .from('sales_opportunities')
    .select('id, name, stage, state, value, offering, grant_support, heat, last_activity_at, is_contact_only')
    .is('deleted_at', null)
    .eq('school_year', '2026-27')

  if (error) {
    console.error('[muck] reading the board failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const board = (opps ?? []).filter(o => o.is_contact_only !== true)
  if (board.length === 0) {
    return NextResponse.json({ scores: {}, bands: {}, rollup: null })
  }

  const ids = board.map(o => o.id)

  // Counted directly off the two opportunity note tables rather than through
  // getAllClientNotesByOpp, because drag compares a lead against the median for
  // its own stage and both sides of that ratio have to be counted the same way.
  const [a, b] = await Promise.all([
    supabase.from('opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
    supabase.from('sales_opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
  ])
  if (a.error || b.error) {
    const msg = a.error?.message ?? b.error?.message ?? 'unknown'
    console.error('[muck] reading notes failed:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
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

  const scores: Record<string, unknown> = {}
  for (const s of scored) {
    const input = inputs.find(i => i.id === s.id)!
    scores[s.id] = {
      total: s.total,
      band: bands.get(s.id) ?? null,
      breakdown: s.breakdown,
      rae: s.rae,
      bella: s.bella,
      travel: s.travel,
      value: s.value,
      valuePredicted: s.valuePredicted,
      perPoint: s.perPoint,
      noteCount: input.noteCount,
      stageMedian: medians[input.stage] ?? 0,
      offering: input.offering,
      travelTier: travelTier(input.state),
    }
  }

  return NextResponse.json({ scores, rollup: totals })
}
