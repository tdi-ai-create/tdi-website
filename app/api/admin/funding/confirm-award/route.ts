import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { isTDIAdmin } from '@/lib/is-tdi-admin'
import { grantUnlockedServices } from '@/lib/billing-slack'
import { asReleasedFromFunding } from '@/lib/billing/state'

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !(await isTDIAdmin(email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { funding_pursuit_id, awarded_amount } = await request.json()

  if (!funding_pursuit_id) {
    return NextResponse.json({ error: 'funding_pursuit_id required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  let totalsWarning: string | null = null

  // 1. Get the pursuit and its linked partnership
  const { data: pursuit } = await supabase
    .from('funding_pursuits')
    .select('id, pursuit_name, partnership_id, district_name')
    .eq('id', funding_pursuit_id)
    .single()

  if (!pursuit) {
    return NextResponse.json({ error: 'Pursuit not found' }, { status: 404 })
  }

  // 2. Everything this pursuit is holding. The hold is its own flag now, not a
  // status value, so releasing it cannot disturb delivery or billing state.
  const { data: deliverables } = await supabase
    .from('contract_deliverables')
    .select('id, label, service_type, total_amount')
    .eq('funding_pursuit_id', funding_pursuit_id)
    .eq('funding_hold', true)

  const flippedCount = deliverables?.length || 0

  // 3. Flip them to pending (deliverable)
  if (flippedCount > 0) {
    // Releasing the hold is the whole point of confirming an award, and
    // flippedCount was counted from the select above rather than from this
    // update. So a lost write here still told Slack and the caller that N
    // services were unlocked for delivery while every one of them stayed on
    // hold. Fail here, before anything is announced: nothing has been logged
    // or notified yet, so a retry is safe and is the right thing to do.
    const { error: releaseError } = await supabase
      .from('contract_deliverables')
      .update({
        ...asReleasedFromFunding(),
        funding_type: 'grant_confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('funding_pursuit_id', funding_pursuit_id)
      .eq('funding_hold', true)

    if (releaseError) {
      console.error('[confirm-award] Services not released', {
        pursuitId: funding_pursuit_id, held: flippedCount, error: releaseError.message,
      })
      return NextResponse.json({
        error: `The award was not applied. ${flippedCount} service(s) are still on funding hold, so nothing has been unlocked for delivery. Retry.`,
      }, { status: 500 })
    }
  }

  // 4. If partnership exists, recalculate service totals from all deliverables
  if (pursuit.partnership_id) {
    const { data: allDeliverables } = await supabase
      .from('contract_deliverables')
      .select('service_type, quantity, delivery_state')
      .eq('partnership_id', pursuit.partnership_id)
      .neq('delivery_state', 'cancelled')

    if (allDeliverables) {
      const counts = {
        observation_days_total: 0,
        virtual_sessions_total: 0,
        executive_sessions_total: 0,
      }
      const typeMap: Record<string, keyof typeof counts> = {
        observation: 'observation_days_total',
        virtual_session: 'virtual_sessions_total',
        executive_session: 'executive_sessions_total',
      }
      allDeliverables.forEach((d: any) => {
        const field = typeMap[d.service_type]
        if (field) counts[field] += d.quantity || 1
      })

      // These totals are what the partnership reports as bought. The services
      // are already released by this point, so failing the request would be
      // wrong: a retry would find nothing on hold and report zero unlocked.
      // Reported instead, so a stale entitlement count is visible.
      const { error: totalsError } = await supabase
        .from('partnerships')
        .update({
          ...counts,
          data_updated_at: new Date().toISOString(),
        })
        .eq('id', pursuit.partnership_id)

      if (totalsError) {
        console.error('[confirm-award] Services released but partnership totals not recalculated', {
          partnershipId: pursuit.partnership_id, error: totalsError.message,
        })
        totalsWarning = 'Services were unlocked, but the partnership service totals were not recalculated, so the counts it shows are out of date.'
      }
    }

    // 5. Log activity on partnership
    // Audit trail. The award is already applied, so record a failure and move on.
    const { error: logError } = await supabase.from('activity_log').insert({
      partnership_id: pursuit.partnership_id,
      action: 'grant_awarded',
      details: {
        pursuit_name: pursuit.pursuit_name,
        awarded_amount: awarded_amount || null,
        deliverables_unlocked: flippedCount,
        confirmed_by: email,
      },
    })

    if (logError) {
      console.error('[confirm-award] Award applied but not logged:', logError.message)
    }
  }

  // Slack notification
  if (flippedCount > 0) {
    grantUnlockedServices(pursuit.pursuit_name, flippedCount).catch(err => console.error('[confirm-award] non-blocking side effect failed:', err))
  }

  return NextResponse.json({
    success: true,
    message: `Grant confirmed for ${pursuit.district_name || pursuit.pursuit_name}. ${flippedCount} services unlocked for delivery.`,
    deliverables_unlocked: flippedCount,
    // Present only when the release worked but the partnership totals did not.
    totalsWarning,
  })
}
