import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { fundingFlag } from '@/lib/funding-flags'
import { awardedAmountOf } from '@/lib/funding-award'
import { isLive } from '@/lib/funding-status'
import { readSchoolProfile, profileFieldNeedsSource } from '@/lib/funding/school-profile'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Facts an agent will copy into a grant application, and where each came from.
 *
 * A stored profile is a flat blob of values with no sources. Measured on
 * Saunemin, 22 September 2026: it holds an educator count of 23, a free and
 * reduced lunch rate of 59 percent and 29 IEP students, none of them sourced,
 * and QA rejected all three on attempts 1, 3 and 5 of the same narrative.
 *
 * The sync and playbook routes both read this record, so an unsourced number
 * here becomes an unsourced number in an application. Marking which fields have
 * no source is the point of this screen.
 */
const SOURCE_KEY_SUFFIX = '_source'

/**
 * Keys that describe another fact rather than being one.
 *
 * The editor writes a source, a checked-at date and, when a value is
 * corrected, the superseded value and when it was replaced. All of that is
 * provenance hanging off a fact, and listing them as facts in their own right
 * would triple the size of this screen with rows nobody can act on.
 */
const META_SUFFIXES = ['_source', '_checked_at', '_superseded', '_superseded_at']

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = db()

  if (!(await fundingFlag(supabase, 'new_pages'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [pursuitRes, oppsRes, logRes] = await Promise.all([
    supabase
      .from('funding_pursuits')
      .select('id, district_name, city, county, state_code, total_amount, client_contact_name, client_contact_email, client_contact_role, implementation_date, school_profile')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('funding_opportunities')
      .select('id, name, status, amount, awarded_amount, narrative_status, application_closes')
      .eq('pursuit_id', id),
    supabase
      .from('funding_pursuit_timeline')
      .select('id, event_date, event_title, event_detail, status, created_at')
      .eq('pursuit_id', id)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (pursuitRes.error) return NextResponse.json({ error: pursuitRes.error.message }, { status: 500 })
  if (!pursuitRes.data) return NextResponse.json({ error: 'School not found' }, { status: 404 })
  if (oppsRes.error) return NextResponse.json({ error: oppsRes.error.message }, { status: 500 })
  if (logRes.error) return NextResponse.json({ error: logRes.error.message }, { status: 500 })

  const p = pursuitRes.data
  const opps = oppsRes.data ?? []
  const won = opps.filter(o => o.status === 'awarded')
  const recorded = won
    .map(o => awardedAmountOf(o))
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)

  // The blob is double encoded on some rows. readSchoolProfile owns that, so
  // this does not add a second way to read the same column.
  const raw = readSchoolProfile(p.school_profile) as Record<string, unknown>

  const facts = Object.entries(raw)
    .filter(([k]) => !META_SUFFIXES.some(suffix => k.endsWith(suffix)) && k !== 'proficiency_caveat')
    .map(([key, value]) => {
      const source = raw[`${key}${SOURCE_KEY_SUFFIX}`]
      const checkedAt = raw[`${key}_checked_at`]
      const superseded = raw[`${key}_superseded`]
      return {
        key,
        value: value === null || value === undefined ? '' : String(value),
        source: typeof source === 'string' && source.trim() ? source : null,
        checkedAt: typeof checkedAt === 'string' ? checkedAt : null,
        // Kept so a corrected figure can show what it replaced. Deleting the
        // old value would leave no answer if a funder asks why an application
        // said something else.
        superseded: superseded === null || superseded === undefined ? null : String(superseded),
        needsSource: profileFieldNeedsSource(key) && !(typeof source === 'string' && source.trim()),
      }
    })
    .sort((a, b) => Number(b.needsSource) - Number(a.needsSource) || a.key.localeCompare(b.key))

  return NextResponse.json({
    school: {
      id: p.id,
      name: p.district_name,
      where: [p.city, p.county, p.state_code].filter(Boolean).join(', '),
      contactName: p.client_contact_name,
      contactEmail: p.client_contact_email,
      contactRole: p.client_contact_role,
      implementationDate: p.implementation_date,
      goal: p.total_amount === null ? null : Number(p.total_amount),
      earned: recorded.length > 0 ? recorded.reduce((a, b) => a + b, 0) : null,
      grantsWon: won.length,
      grantsWonWithoutAnAmount: won.length - recorded.length,
      livePaths: opps.filter(o => isLive(o.status)).length,
    },
    facts,
    log: (logRes.data ?? []).map(e => ({
      id: e.id,
      date: e.event_date,
      at: e.created_at,
      title: e.event_title,
      detail: e.event_detail && e.event_detail !== e.event_title ? e.event_detail : null,
      status: e.status,
    })),
  })
}
