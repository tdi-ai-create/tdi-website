import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Recruitment Analytics API -- Source quality feedback loop
 *
 * GET: Returns creators grouped by recruitment_source, conversion rates by source.
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = db()

    // Get all creators with recruitment_source
    const { data: creators, error: creatorsErr } = await supabase
      .from('creators')
      .select('id, name, recruitment_source, recruitment_candidate_id, created_at, status')

    if (creatorsErr) {
      return NextResponse.json({ error: creatorsErr.message }, { status: 500 })
    }

    // Group creators by source
    const sourceGroups: Record<string, { count: number; active: number; creators: { id: string; name: string; status: string }[] }> = {}

    for (const creator of (creators || [])) {
      const source = creator.recruitment_source || 'unknown'
      if (!sourceGroups[source]) {
        sourceGroups[source] = { count: 0, active: 0, creators: [] }
      }
      sourceGroups[source].count++
      if (creator.status === 'active') {
        sourceGroups[source].active++
      }
      sourceGroups[source].creators.push({
        id: creator.id,
        name: creator.name,
        status: creator.status,
      })
    }

    // Get candidates by source for conversion rate
    const { data: candidates, error: candErr } = await supabase
      .from('creator_recruitment_candidates')
      .select('id, source, converted_creator_id')

    if (candErr) {
      return NextResponse.json({ error: candErr.message }, { status: 500 })
    }

    const candidatesBySource: Record<string, { total: number; converted: number }> = {}

    for (const candidate of (candidates || [])) {
      const source = candidate.source || 'unknown'
      if (!candidatesBySource[source]) {
        candidatesBySource[source] = { total: 0, converted: 0 }
      }
      candidatesBySource[source].total++
      if (candidate.converted_creator_id) {
        candidatesBySource[source].converted++
      }
    }

    // Build conversion rates
    const conversionRates: Record<string, { candidates: number; converted: number; rate: number }> = {}
    for (const [source, data] of Object.entries(candidatesBySource)) {
      conversionRates[source] = {
        candidates: data.total,
        converted: data.converted,
        rate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
      }
    }

    return NextResponse.json({
      creators_by_source: sourceGroups,
      conversion_rates: conversionRates,
      total_creators: (creators || []).length,
      total_with_source: (creators || []).filter(c => c.recruitment_source).length,
    })
  } catch (err) {
    console.error('[recruitment-analytics] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
