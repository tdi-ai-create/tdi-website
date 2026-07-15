import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { funding_pursuit_id, awarded_amount } = await request.json()

  if (!funding_pursuit_id) {
    return NextResponse.json({ error: 'funding_pursuit_id required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // 1. Get the pursuit and its linked partnership
  const { data: pursuit } = await supabase
    .from('funding_pursuits')
    .select('id, pursuit_name, partnership_id, district_name')
    .eq('id', funding_pursuit_id)
    .single()

  if (!pursuit) {
    return NextResponse.json({ error: 'Pursuit not found' }, { status: 404 })
  }

  // 2. Find all pending_funding deliverables linked to this pursuit
  const { data: deliverables } = await supabase
    .from('contract_deliverables')
    .select('id, label, service_type, total_amount')
    .eq('funding_pursuit_id', funding_pursuit_id)
    .eq('delivery_status', 'pending_funding')

  const flippedCount = deliverables?.length || 0

  // 3. Flip them to pending (deliverable)
  if (flippedCount > 0) {
    await supabase
      .from('contract_deliverables')
      .update({
        delivery_status: 'pending',
        funding_type: 'grant_confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('funding_pursuit_id', funding_pursuit_id)
      .eq('delivery_status', 'pending_funding')
  }

  // 4. If partnership exists, recalculate service totals from all deliverables
  if (pursuit.partnership_id) {
    const { data: allDeliverables } = await supabase
      .from('contract_deliverables')
      .select('service_type, quantity, delivery_status')
      .eq('partnership_id', pursuit.partnership_id)
      .neq('delivery_status', 'cancelled')

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

      await supabase
        .from('partnerships')
        .update({
          ...counts,
          data_updated_at: new Date().toISOString(),
        })
        .eq('id', pursuit.partnership_id)
    }

    // 5. Log activity on partnership
    await supabase.from('activity_log').insert({
      partnership_id: pursuit.partnership_id,
      action: 'grant_awarded',
      details: {
        pursuit_name: pursuit.pursuit_name,
        awarded_amount: awarded_amount || null,
        deliverables_unlocked: flippedCount,
        confirmed_by: email,
      },
    })
  }

  return NextResponse.json({
    success: true,
    message: `Grant confirmed for ${pursuit.district_name || pursuit.pursuit_name}. ${flippedCount} services unlocked for delivery.`,
    deliverables_unlocked: flippedCount,
  })
}
