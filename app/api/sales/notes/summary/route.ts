import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getAllClientNotesByOpp } from '@/lib/sales/client-notes'

export const dynamic = 'force-dynamic'

const PREVIEW_PER_OPP = 5
const PREVIEW_CHARS = 400

/**
 * Recent-notes preview for the sales list page, keyed by opportunity id.
 *
 * Two reasons this is a server route rather than a direct Supabase query from
 * the page:
 *
 *  1. Notes are split across `opportunity_notes`, `sales_opportunity_notes` and
 *     `partnership_notes`, and across every row a client owns. Reading one
 *     table on one row shows a fraction of the history.
 *  2. `sales_opportunity_notes` has RLS enabled with no policies, so the anon
 *     key the page uses reads back an empty set every time. The service role
 *     used here is not subject to that.
 *
 * This is a preview: newest five, clipped. The export needs every note in full,
 * and uses /api/sales/notes/export.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const byOpp = await getAllClientNotesByOpp(supabase, {
    perOpp: PREVIEW_PER_OPP,
    clipChars: PREVIEW_CHARS,
  })

  const notes: Record<string, { body: string; created_at: string }[]> = {}
  for (const [oppId, list] of Object.entries(byOpp)) {
    notes[oppId] = list.map(n => ({ body: n.body, created_at: n.created_at }))
  }

  return NextResponse.json({ notes })
}
