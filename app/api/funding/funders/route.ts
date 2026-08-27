import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

export const dynamic = 'force-dynamic'

/**
 * The funder catalogue, for the Funders tab.
 *
 * Read-only on purpose. Funders are created through the sync endpoint, which
 * refuses one without a source URL and a window status. Adding a second way in
 * would mean a second set of rules, and the reason the catalogue is worth
 * anything is that every row can be traced back to where it came from.
 *
 * `last_researched_on` is the field the tab exists to expose. All 18 rows
 * currently hold null, because they were seeded directly before the guard
 * existed. That is the honest state and the tab should show it rather than
 * imply the shelves are stocked.
 */
export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('funders')
      .select('id, name, tier, state_code, geography, focus, typical_award, apply_url, source_url, last_researched_on')
      .order('name')

    if (error) {
      console.error('[funders] read failed:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ funders: data ?? [] })
  } catch (err) {
    console.error('[funders] unexpected:', err)
    return NextResponse.json({ error: 'Could not load funders' }, { status: 500 })
  }
}
