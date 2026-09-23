import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { fundingFlag } from '@/lib/funding-flags'
import { awardedAmountOf } from '@/lib/funding-award'
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
 * The partnership schools list.
 *
 * One route feeds both the list and each school page, because the old portal
 * fetched the same data once per tab and that is what let the action count and
 * the action list disagree on the same screen.
 *
 * ## Why `earned` can be null
 *
 * Measured 22 September 2026: Saunemin has two grants marked awarded and
 * neither carries an amount, so the stored `total_awarded` reads 0 for every
 * school in the system. Reporting 0 would state that nothing has ever been won,
 * which is false. Null means "we did not record it", and the screen says that
 * in words rather than printing a confident zero.
 */
export async function GET() {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const supabase = db()

  if (!(await fundingFlag(supabase, 'new_pages'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: pursuits, error } = await supabase
    .from('funding_pursuits')
    .select('id, district_name, city, county, state_code, total_amount, total_awarded, client_contact_name, client_contact_email, implementation_date')
    .neq('archived', true)
    .order('district_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ids = (pursuits ?? []).map(p => p.id)
  if (ids.length === 0) return NextResponse.json({ schools: [] })

  const { data: opps, error: oppErr } = await supabase
    .from('funding_opportunities')
    .select('id, pursuit_id, name, status, amount, awarded_amount')
    .in('pursuit_id', ids)

  if (oppErr) {
    return NextResponse.json({ error: oppErr.message }, { status: 500 })
  }

  const byPursuit = new Map<string, typeof opps>()
  for (const o of opps ?? []) {
    const list = byPursuit.get(o.pursuit_id) ?? []
    list.push(o)
    byPursuit.set(o.pursuit_id, list)
  }

  const schools = (pursuits ?? []).map(p => {
    const mine = byPursuit.get(p.id) ?? []
    const won = mine.filter(o => o.status === 'awarded')

    // Sum only the awards whose amount we actually recorded. If none of them
    // carry a figure, `earned` stays null so the screen can say "not recorded"
    // instead of "$0", which would read as a loss rather than a gap.
    const recorded = won
      .map(o => awardedAmountOf(o))
      .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)

    return {
      id: p.id,
      name: p.district_name,
      where: [p.city, p.county, p.state_code].filter(Boolean).join(', '),
      contactName: p.client_contact_name,
      contactEmail: p.client_contact_email,
      goal: p.total_amount === null ? null : Number(p.total_amount),
      earned: recorded.length > 0 ? recorded.reduce((a, b) => a + b, 0) : null,
      grantsWon: won.length,
      grantsWonWithoutAnAmount: won.length - recorded.length,
      livePaths: mine.filter(o => isLive(o.status)).length,
    }
  })

  return NextResponse.json({ schools })
}
