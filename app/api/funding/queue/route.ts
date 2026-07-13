import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeNextActions } from '@/lib/funding-next-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all pursuits
    const { data: pursuits } = await supabase
      .from('funding_pursuits')
      .select('*')
      .order('created_at', { ascending: false })

    if (!pursuits || pursuits.length === 0) {
      return NextResponse.json({ items: [], counts: { bella: 0, rae: 0, agent: 0, school: 0 } })
    }

    const pursuitIds = pursuits.map(p => p.id)

    // Batch fetch all related data
    const [oppsRes, actionsRes, gatesRes, allocsRes] = await Promise.all([
      supabase.from('funding_opportunities').select('*').in('pursuit_id', pursuitIds),
      supabase.from('funding_action_items').select('*').in('pursuit_id', pursuitIds).order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('pursuit_gate').select('*').in('pursuit_id', pursuitIds),
      supabase.from('award_allocations').select('*').in('pursuit_id', pursuitIds),
    ])

    const oppsByPursuit = new Map<string, any[]>()
    for (const o of oppsRes.data ?? []) {
      const list = oppsByPursuit.get(o.pursuit_id) ?? []
      list.push(o)
      oppsByPursuit.set(o.pursuit_id, list)
    }

    const actionsByPursuit = new Map<string, any[]>()
    for (const a of actionsRes.data ?? []) {
      const list = actionsByPursuit.get(a.pursuit_id) ?? []
      list.push(a)
      actionsByPursuit.set(a.pursuit_id, list)
    }

    const gateByPursuit = new Map<string, any>()
    for (const g of gatesRes.data ?? []) {
      gateByPursuit.set(g.pursuit_id, g)
    }

    const allocsByPursuit = new Map<string, any[]>()
    for (const a of allocsRes.data ?? []) {
      const list = allocsByPursuit.get(a.pursuit_id) ?? []
      list.push(a)
      allocsByPursuit.set(a.pursuit_id, list)
    }

    // Compute next actions for each pursuit and flatten
    const allItems: any[] = []
    for (const p of pursuits) {
      const nextActions = computeNextActions(
        p,
        oppsByPursuit.get(p.id) ?? [],
        actionsByPursuit.get(p.id) ?? [],
        gateByPursuit.get(p.id) ?? null,
        allocsByPursuit.get(p.id) ?? [],
      )
      for (const action of nextActions) {
        allItems.push({
          ...action,
          pursuitId: p.id,
          pursuitName: p.pursuit_name,
          districtName: p.district_name,
        })
      }
    }

    // Counts
    const counts = {
      bella: allItems.filter(i => i.owner === 'bella' && !i.inProgress).length,
      rae: allItems.filter(i => i.owner === 'rae' && !i.inProgress).length,
      agent: allItems.filter(i => i.owner === 'agent' || i.owner === 'auto').length,
      school: allItems.filter(i => i.owner === 'school').length,
    }

    return NextResponse.json({ items: allItems, counts })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
