import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { id, noteId } = await params
  const supabase = getServiceSupabase()

  // The detail panel merges notes from two tables. Rows from
  // sales_opportunity_notes arrive namespaced as `son:<uuid>`; without routing
  // on that prefix a delete would match zero rows in opportunity_notes and
  // still report success, so the note would reappear on the next refresh.
  const isAgentNote = noteId.startsWith('son:')
  const table = isAgentNote ? 'sales_opportunity_notes' : 'opportunity_notes'
  const realId = isAgentNote ? noteId.slice(4) : noteId

  // The legacy entry is a synthetic view of sales_opportunities.notes and has
  // no row of its own to delete.
  if (noteId === 'legacy') {
    return NextResponse.json(
      { error: 'This is an imported record and cannot be deleted from here.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', realId)
    .eq('opportunity_id', id)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // A delete that matches nothing is not an error in Postgres, but it does mean
  // the caller's note is still there. Say so rather than reporting success.
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: 'Note not found, nothing was deleted.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
