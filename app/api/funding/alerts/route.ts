import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { calculateFundingAlerts } from '@/lib/tdi-admin/funding-alert-rules'

export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all active data
    const [pursuitRes, oppRes, actionRes] = await Promise.all([
      supabase.from('funding_pursuits').select('id, pursuit_name, district_name'),
      supabase.from('funding_opportunities').select('*').not('status', 'in', '("awarded","denied")'),
      supabase.from('funding_action_items').select('*').not('status', 'in', '("done","skipped")'),
    ])

    const alerts = calculateFundingAlerts({
      pursuits: pursuitRes.data || [],
      opportunities: oppRes.data || [],
      actionItems: actionRes.data || [],
    })

    return NextResponse.json({
      alerts,
      summary: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length,
        total: alerts.length,
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
