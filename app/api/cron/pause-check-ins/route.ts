import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron sends this header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Find creators eligible for check-in
    const { data: eligible } = await (supabase.from('creators') as any)
      .select('id, name, email, paused_at, last_check_in_at, unpause_token, is_test_account')
      .eq('lifecycle_state', 'paused')
      .lt('paused_at', ninetyDaysAgo.toISOString())
      .or(`last_check_in_at.is.null,last_check_in_at.lt.${ninetyDaysAgo.toISOString()}`)

    const toSend = (eligible || []).filter((c: any) => !c.is_test_account)
    const sent: string[] = []

    for (const creator of toSend) {
      // Update last_check_in_at
      await (supabase.from('creators') as any)
        .update({ last_check_in_at: new Date().toISOString() })
        .eq('id', creator.id)

      // Log to history
      await (supabase.from('creator_pause_history') as any).insert({
        creator_id: creator.id,
        event_type: 'check_in_sent',
        triggered_by: 'system',
        triggered_by_type: 'system',
      })

      sent.push(creator.id)
      // TODO: Send check-in email via Resend when email templates are configured
    }

    return NextResponse.json({ sent: sent.length, creator_ids: sent })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
