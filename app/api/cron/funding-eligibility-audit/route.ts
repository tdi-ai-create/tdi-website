import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guardCron } from '@/lib/cron-guard'
import { screenPath, type EligibilityResult } from '@/lib/funding-eligibility'

/**
 * The monthly eligibility re-audit.
 *
 * The stop rule has existed since 17 Aug but only ever ran at two moments: when
 * someone requested a draft, and on sync. Measured on 19 Aug: 2 of 26 grant
 * paths had ever been screened. The other 24 had never been checked by any
 * rule, which means a school could be carrying a path it can never win and
 * nothing in the system would say so until an agent had written three drafts.
 *
 * This runs the same rules over every open path on a schedule, so a path that
 * has quietly become unwinnable stops before more work goes into it.
 *
 * Two things it deliberately does NOT do:
 *   - it never overturns a human override. If a person disagreed with a rule
 *     and said so, that decision stands until they change it.
 *   - it never deletes a path. A stopped path keeps its reason, its decider and
 *     its date, and can be reopened.
 *
 * Dry run: /api/cron/funding-eligibility-audit?dryRun=1
 * Computes every verdict and reports the full decision set, writing nothing.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** The school_profile column has been double encoded in places. Tolerate both. */
function readProfile(raw: unknown): Record<string, unknown> {
  try {
    if (!raw) return {}
    const once = typeof raw === 'string' ? JSON.parse(raw) : raw
    return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>
  } catch {
    return {}
  }
}

// Paths in these states are finished. Re-screening them would churn history
// for no benefit and could reopen a decision someone already made.
const SETTLED = new Set(['awarded', 'denied', 'closed', 'submitted', 'applied'])

interface Change {
  school: string
  path: string
  from: string | null
  to: EligibilityResult['verdict']
  rule: string
  reason: string
}

export async function GET(request: NextRequest) {
  const guard = guardCron(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 })
  }
  const { dryRun } = guard

  try {
    const supabase = getSupabase()

    const { data: pursuits, error: pErr } = await supabase
      .from('funding_pursuits')
      .select('id, district_name, sector, county, state_code, school_profile')

    if (pErr) {
      console.error('[eligibility-audit] Could not read pursuits:', pErr)
      return NextResponse.json({ error: pErr.message }, { status: 500 })
    }

    const { data: opportunities, error: oErr } = await supabase
      .from('funding_opportunities')
      .select('id, name, pursuit_id, status, window_status, eligibility_verdict, eligibility_overridden')

    if (oErr) {
      console.error('[eligibility-audit] Could not read opportunities:', oErr)
      return NextResponse.json({ error: oErr.message }, { status: 500 })
    }

    const bySchool = new Map((pursuits ?? []).map(p => [p.id, p]))

    const changes: Change[] = []
    const unchanged: string[] = []
    const skipped: { path: string; why: string }[] = []
    const counts = { stop: 0, ask_first: 0, clear: 0 }

    for (const opp of opportunities ?? []) {
      const school = bySchool.get(opp.pursuit_id)
      if (!school) {
        skipped.push({ path: opp.name ?? opp.id, why: 'no school on this path' })
        continue
      }
      if (opp.eligibility_overridden === true) {
        skipped.push({ path: opp.name ?? '', why: 'a person overrode this rule' })
        continue
      }
      if (opp.status && SETTLED.has(String(opp.status))) {
        skipped.push({ path: opp.name ?? '', why: `already ${opp.status}` })
        continue
      }

      const profile = readProfile(school.school_profile)

      const result = screenPath(
        {
          name: opp.name ?? '',
          windowStatus: opp.window_status ?? null,
          namedApplicant: (profile.nea_member_name as string) ?? null,
        },
        {
          sector: school.sector ?? null,
          county: school.county ?? null,
          stateCode: school.state_code ?? null,
          titleIStatus: (profile.title_i_status as string) ?? null,
          designation: (profile.designation as string) ?? null,
        },
      )

      counts[result.verdict]++

      if (result.verdict === opp.eligibility_verdict) {
        unchanged.push(opp.name ?? '')
        continue
      }

      changes.push({
        school: school.district_name ?? '',
        path: opp.name ?? '',
        from: opp.eligibility_verdict ?? null,
        to: result.verdict,
        rule: result.rule,
        reason: result.reason,
      })

      if (!dryRun) {
        const { error: uErr } = await supabase
          .from('funding_opportunities')
          .update({
            eligibility_verdict: result.verdict,
            eligibility_reason: result.reason,
            eligibility_rule: result.rule,
            eligibility_checked_at: new Date().toISOString(),
          })
          .eq('id', opp.id)

        if (uErr) {
          console.error(`[eligibility-audit] Could not record verdict for ${opp.id}:`, uErr)
        }
      }
    }

    return NextResponse.json({
      dryRun,
      scanned: opportunities?.length ?? 0,
      schools: pursuits?.length ?? 0,
      verdicts: counts,
      changed: changes.length,
      changes,
      unchangedCount: unchanged.length,
      skipped,
      note: dryRun
        ? 'Nothing was written. Every verdict above was computed against live data.'
        : 'Verdicts recorded. No path was deleted and no human override was touched.',
    })
  } catch (error) {
    console.error('[eligibility-audit] Failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
