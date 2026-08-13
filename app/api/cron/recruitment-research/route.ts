import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { recruitmentWeeklyDigest, recruitmentResearchFailed } from '@/lib/creator-slack'
import { validateCandidate, type ValidCandidate } from '@/lib/recruitment-quality'
import {
  researchCandidates,
  WEEKLY_TARGET,
  MAX_GAPS_PER_RUN,
  type OpenGap,
} from '@/lib/recruitment-research'

/**
 * Weekly Creator Recruitment Research, run by the portal on Anne Marie's behalf.
 *
 * The recruitment pipeline used to depend on an agent that had no trigger, so it
 * produced nothing for a month and nobody noticed. This runs on the same cron
 * infrastructure as the other 30+ jobs, which is the part we can actually
 * guarantee. Candidates are attributed to anne-marie because the work is hers in
 * the org model; only the execution moved.
 *
 * It researches real educators against the open gap board, validates every
 * result against the quality contract, and hands Bella a copy and paste ready
 * digest. Nothing is ever sent to a candidate from here.
 */

export const maxDuration = 300

function portalDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (request.headers.get('x-vercel-cron') !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const supabase = portalDb()

  try {
    // ─── How many do we still owe this week? ───
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: addedThisWeek } = await supabase
      .from('creator_recruitment_candidates')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    const needed = WEEKLY_TARGET - (addedThisWeek || 0)
    if (needed <= 0) {
      console.log('[recruitment-research] Weekly target already met, skipping')
      return NextResponse.json({
        success: true,
        skipped: 'weekly target already met',
        added_this_week: addedThisWeek || 0,
      })
    }

    // ─── Which gaps need people most? ───
    const { data: gapRows, error: gapErr } = await supabase
      .from('creator_content_gaps')
      .select('id, category, priority, hub_course_count, hub_quick_win_count, recommended_content_path, demand_signal')
      .eq('status', 'active')
      .in('priority', ['critical', 'high'])

    if (gapErr) {
      return NextResponse.json({ error: `read gaps: ${gapErr.message}` }, { status: 500 })
    }
    if (!gapRows || gapRows.length === 0) {
      return NextResponse.json({ success: true, skipped: 'no critical or high gaps open' })
    }

    // Existing candidates: for per-gap counts and to avoid re-suggesting people.
    const { data: existing } = await supabase
      .from('creator_recruitment_candidates')
      .select('name, email, social_url, gap_id, stage')

    const activeExisting = (existing || []).filter(
      c => !['archived', 'declined', 'no_response'].includes(c.stage)
    )
    const perGap = new Map<string, number>()
    for (const c of activeExisting) {
      if (c.gap_id) perGap.set(c.gap_id, (perGap.get(c.gap_id) || 0) + 1)
    }

    const priorityRank: Record<string, number> = { critical: 0, high: 1 }
    const gaps: OpenGap[] = gapRows
      .map(g => ({ ...g, candidate_count: perGap.get(g.id) || 0 }))
      .sort((a, b) => {
        if (a.candidate_count !== b.candidate_count) return a.candidate_count - b.candidate_count
        return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
      })
      .slice(0, MAX_GAPS_PER_RUN)

    const knownGapIds = new Set(gaps.map(g => g.id))
    // Dedupe keys across the whole table, not just the active slice, so a
    // previously declined person is not re-surfaced as a fresh suggestion.
    const seenEmails = new Set(
      (existing || []).map(c => (c.email || '').toLowerCase()).filter(Boolean)
    )
    const seenUrls = new Set(
      (existing || []).map(c => (c.social_url || '').toLowerCase()).filter(Boolean)
    )
    const seenNames = new Set(
      (existing || []).map(c => (c.name || '').toLowerCase().trim()).filter(Boolean)
    )

    // ─── Research ───
    let research
    try {
      research = await researchCandidates(gaps, needed, Array.from(seenNames).slice(0, 40))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[recruitment-research] Research failed:', message)
      await recruitmentResearchFailed(message).catch(() => {})
      return NextResponse.json({ error: message }, { status: 502 })
    }

    // ─── Validate, dedupe, insert ───
    const accepted: ValidCandidate[] = []
    const rejected: { name: string; reasons: string[] }[] = []

    for (const item of research.raw) {
      const result = validateCandidate(item as Record<string, unknown>, knownGapIds)
      if (!result.ok) {
        const name = typeof (item as { name?: unknown })?.name === 'string'
          ? (item as { name: string }).name
          : 'unnamed'
        rejected.push({ name, reasons: result.reasons })
        continue
      }

      const c = result.candidate
      const nameKey = c.name.toLowerCase().trim()
      const urlKey = c.social_url.toLowerCase()
      if ((c.email && seenEmails.has(c.email)) || seenUrls.has(urlKey) || seenNames.has(nameKey)) {
        rejected.push({ name: c.name, reasons: ['duplicate of an existing candidate'] })
        continue
      }

      if (c.email) seenEmails.add(c.email)
      seenUrls.add(urlKey)
      seenNames.add(nameKey)
      accepted.push(c)
    }

    const inserted: (ValidCandidate & { id: string; gapCategory: string })[] = []
    for (const c of accepted) {
      const { data, error } = await supabase
        .from('creator_recruitment_candidates')
        .insert({
          ...c,
          stage: 'suggested',
          nominated_by: 'anne-marie',
          nominated_from: 'weekly research',
          outreach_drafted_by: 'anne-marie',
        })
        .select('id')
        .single()

      if (error) {
        // A unique-index collision here is the dedupe guard doing its job.
        console.warn('[recruitment-research] Insert skipped for', c.name, error.message)
        rejected.push({ name: c.name, reasons: [`insert rejected: ${error.message}`] })
        continue
      }

      await supabase.from('creator_recruitment_notes').insert({
        candidate_id: data.id,
        content: `Researched by Anne Marie. ${c.source_detail}`,
        author: 'anne-marie',
        note_type: 'note',
      })

      const gap = gaps.find(g => g.id === c.gap_id)
      inserted.push({ ...c, id: data.id, gapCategory: gap?.category || 'unknown' })
    }

    // ─── Hand the week's work to Bella ───
    if (inserted.length > 0) {
      await recruitmentWeeklyDigest(
        inserted.map(c => ({
          name: c.name,
          role: c.role,
          org: c.school_org,
          gap: c.gapCategory,
          contact: c.email || c.social_url,
          why: c.why_good_fit,
          draft: c.outreach_draft,
        })),
        WEEKLY_TARGET
      ).catch(() => {})
    }

    const summary = {
      needed,
      returned: research.raw.length,
      accepted: inserted.length,
      rejected: rejected.length,
      rejection_reasons: rejected,
      searches_run: research.searches,
      gaps_targeted: gaps.map(g => g.category),
    }
    console.log('[recruitment-research] Results:', JSON.stringify(summary))

    return NextResponse.json({ success: true, results: summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[recruitment-research] Error:', err)
    await recruitmentResearchFailed(message).catch(() => {})
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
