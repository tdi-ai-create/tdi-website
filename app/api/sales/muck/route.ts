import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { scoreBoard, travelTier } from '@/lib/sales/board-scores'

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
 * The reading and scoring moved to `lib/sales/board-scores` so the Analytics
 * tab could share it. This route is now the shape that the board page wants,
 * and nothing more.
 *
 * Read only. This route has no write path.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const { board, error } = await scoreBoard(supabase)

  if (error) {
    console.error('[muck] scoring the board failed:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  if (!board) {
    return NextResponse.json({ scores: {}, bands: {}, rollup: null })
  }

  const scores: Record<string, unknown> = {}
  for (const s of board.scored) {
    const input = board.inputs.find(i => i.id === s.id)!
    scores[s.id] = {
      total: s.total,
      band: board.bands.get(s.id) ?? null,
      breakdown: s.breakdown,
      rae: s.rae,
      bella: s.bella,
      travel: s.travel,
      value: s.value,
      valuePredicted: s.valuePredicted,
      perPoint: s.perPoint,
      noteCount: input.noteCount,
      stageMedian: board.medians[input.stage] ?? 0,
      offering: input.offering,
      travelTier: travelTier(input.state),
    }
  }

  return NextResponse.json({ scores, rollup: board.totals })
}
