import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { isStale, isCiteable, blockedReason, type SchoolFact } from '@/lib/funding/facts'

/**
 * What we know about a school, and how well we know it.
 *
 * The profile used to render as a flat list of values. You saw
 * `educator_count: 23` and could not tell whether it came from the contract,
 * from NCES, from the school, or from someone guessing in May. Every number
 * looked equally trustworthy and they were not, which is how two applications
 * came to cite a 48% reading figure nobody could reproduce.
 *
 * Every fact now arrives with where it came from, when it was checked, and
 * whether it can be used in an application.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session auth, matching every sibling route under this path. An earlier
  // draft gated on an x-user-email header, which no client in this area sends,
  // so it would have 401'd from the browser while looking correct in review.
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('school_facts')
    .select('key, status, value, origin, source, verified_on, verified_by')
    .eq('pursuit_id', pursuitId)
    .is('superseded_at', null)
    .order('key')

  if (error) {
    console.error('[facts] could not read school facts:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const facts: SchoolFact[] = (data ?? []).map(r => ({
    key: r.key,
    status: r.status,
    value: r.value,
    origin: r.origin,
    source: r.source,
    verifiedOn: r.verified_on,
    verifiedBy: r.verified_by,
  }))

  const enriched = facts.map(f => ({
    ...f,
    stale: isStale(f),
    citeable: isCiteable(f),
    blocked: blockedReason(f),
  }))

  return NextResponse.json({
    facts: enriched,
    summary: {
      total: enriched.length,
      // The number that matters. A fact you cannot cite is a fact an
      // application cannot use, however confidently it is displayed.
      citeable: enriched.filter(f => f.citeable).length,
      unverified: enriched.filter(f => f.status === 'unverified').length,
      stale: enriched.filter(f => f.stale).length,
      notChecked: enriched.filter(f => f.status === 'not_checked').length,
      notPublished: enriched.filter(f => f.status === 'not_published').length,
    },
  })
}
