import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { getAllClientNotesByOpp } from '@/lib/sales/client-notes'

export const dynamic = 'force-dynamic'

/**
 * Every note we hold, keyed by opportunity id, in full.
 *
 * The pipeline export used to write the `sales_opportunities.notes` text column
 * into a single "Notes" cell. That column is an old import, not the note
 * history, so an exported list carried none of the calls, emails or meetings
 * anyone had logged. This is the same client grouping the lead panel uses, with
 * no per-lead cap and no clipping, so the spreadsheet can carry all of it.
 *
 * Separate from /api/sales/notes/summary, which deliberately previews.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const notes = await getAllClientNotesByOpp(supabase)

  const noteCount = Object.values(notes).reduce((sum, list) => sum + list.length, 0)

  return NextResponse.json({ notes, leadCount: Object.keys(notes).length, noteCount })
}
