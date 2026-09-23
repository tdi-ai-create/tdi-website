import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { fundingFlag } from '@/lib/funding-flags'
import { buildCalendar, entriesInMonth } from '@/lib/funding-calendar'
import { isLive } from '@/lib/funding-status'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * One month of grant work, confirmed and predicted.
 *
 * Reads everything and filters afterwards, because the prediction rules need a
 * narrative's whole history to place it, and the volume is small: three schools
 * and around thirty grant paths.
 *
 * `coverage` is returned alongside the entries and is not decoration. Most live
 * grants have no confirmed date, so a month can look calm while sixteen paths
 * sit with nothing scheduled. The screen says that out loud rather than letting
 * an empty week read as nothing to do.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const supabase = db()
  if (!(await fundingFlag(supabase, 'new_pages'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const now = new Date()
  const year = Number(request.nextUrl.searchParams.get('year')) || now.getFullYear()
  const month = Number(request.nextUrl.searchParams.get('month')) || now.getMonth() + 1

  if (month < 1 || month > 12 || year < 2020 || year > 2100) {
    return NextResponse.json({ error: 'Bad month' }, { status: 400 })
  }

  const { data: pursuits, error: pErr } = await supabase
    .from('funding_pursuits')
    .select('id, district_name')
    .neq('archived', true)
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  const ids = (pursuits ?? []).map(p => p.id)
  if (ids.length === 0) {
    return NextResponse.json({ entries: [], coverage: { livePaths: 0, withDate: 0 } })
  }

  const [oppsRes, itemsRes] = await Promise.all([
    supabase
      .from('funding_opportunities')
      .select('id, pursuit_id, name, status, amount, application_closes, window_closes, narrative_status, narrative_status_changed_at, assigned_agent, client_submitted, updated_at, qa_escalation, qa_attempt_count')
      .in('pursuit_id', ids),
    supabase
      .from('funding_action_items')
      .select('id, pursuit_id, opportunity_id, title, client_label, description, due_date, status, owner_type')
      .in('pursuit_id', ids),
  ])
  if (oppsRes.error) return NextResponse.json({ error: oppsRes.error.message }, { status: 500 })
  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 })

  const all = buildCalendar({
    pursuits: pursuits ?? [],
    opportunities: oppsRes.data ?? [],
    actionItems: itemsRes.data ?? [],
  })

  const live = (oppsRes.data ?? []).filter(o => isLive(o.status))

  const entries = entriesInMonth(all, year, month)

  // What each popup needs to offer the right control, keyed by opportunity.
  // Returned alongside the entries rather than fetched again by the screen, so
  // there is one read and one answer about what state a grant is in.
  const needed = new Set(entries.map(e => e.opportunityId).filter(Boolean) as string[])
  const grants: Record<string, unknown> = {}
  for (const o of oppsRes.data ?? []) {
    if (!needed.has(o.id)) continue
    grants[o.id] = {
      id: o.id,
      name: o.name,
      status: o.status,
      narrativeStatus: o.narrative_status ?? 'not_started',
      attempts: o.qa_attempt_count ?? null,
      escalation: o.qa_escalation ?? null,
    }
  }

  return NextResponse.json({
    year,
    month,
    entries,
    grants,
    coverage: {
      livePaths: live.length,
      withDate: live.filter(o => !!o.application_closes).length,
    },
  })
}
