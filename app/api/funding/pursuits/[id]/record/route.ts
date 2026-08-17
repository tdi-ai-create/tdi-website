import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { buildFacts, factualSummary, type RecordRow } from '@/lib/funding-summary'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * GET /api/funding/pursuits/[id]/record
 *
 * Everything anyone has written about one school, collapsed into groups, each
 * with computed facts and a summary that needs no model.
 *
 * Grouped by funding path rather than by phase, deliberately. Phase history is
 * not stored anywhere: only the current phase and the date it last changed, with
 * no record of where a pursuit has been. Grouping records into phases would mean
 * inferring which phase each record belonged to, and a wrong grouping produces
 * exactly the summary people trust and that turns out to be false. Transitions
 * are now recorded, so phase grouping becomes possible in time, but it cannot be
 * reconstructed backwards and this does not pretend otherwise.
 *
 * Every group carries its own receipt: how many records, over what span, and
 * how long since the last one. Expanding returns the records themselves, which
 * read through to the originals rather than to a copy.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const supabase = db()

  const { data: rows, error } = await supabase
    .from('funding_record')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .order('occurred_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const all = (rows ?? []) as RecordRow[]

  // Name the paths, so a group header reads as a grant rather than an id.
  const { data: opps } = await supabase
    .from('funding_opportunities')
    .select('id, name')
    .eq('pursuit_id', pursuitId)
  const nameFor = new Map((opps ?? []).map(o => [o.id as string, o.name as string]))

  const groups = new Map<string, RecordRow[]>()
  for (const r of all) {
    const key = r.opportunity_id ?? '__school__'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  const collapsed = [...groups.entries()]
    .map(([key, rowsInGroup]) => {
      const facts = buildFacts(rowsInGroup)
      return {
        key,
        label: key === '__school__' ? 'The school overall' : (nameFor.get(key) ?? 'Unknown path'),
        // Never wrong: every clause is a count or a date.
        summary: factualSummary(facts),
        facts,
        // Expanding returns the records themselves, not a longer paraphrase.
        records: rowsInGroup,
      }
    })
    .sort((a, b) => (b.facts.latest ?? '').localeCompare(a.facts.latest ?? ''))

  const overall = buildFacts(all)

  return NextResponse.json({
    pursuitId,
    total: all.length,
    summary: factualSummary(overall),
    facts: overall,
    groups: collapsed,
    // Said plainly in the payload so no consumer assumes otherwise.
    groupedBy: 'funding path',
    note:
      'Grouped by path, not phase. Phase history is not stored and cannot be ' +
      'reconstructed; transitions are recorded from 17 Aug 2026 onward.',
  })
}
