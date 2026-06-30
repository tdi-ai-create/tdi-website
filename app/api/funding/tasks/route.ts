import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

/**
 * Cross-pursuit task view.
 * Returns all action items across all pursuits, with pursuit name and opportunity name joined.
 * Designed for Bella's daily "what do I need to do" workflow.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const url = request.nextUrl
    const ownerFilter = url.searchParams.get('owner') // 'tdi', 'client', or null for all
    const statusFilter = url.searchParams.get('status') // 'open' (pending+in_progress), 'done', or specific status
    const assignee = url.searchParams.get('assignee') // email filter

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('funding_action_items')
      .select(`
        *,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name, client_contact_name, client_contact_email),
        opportunity:funding_opportunities!opportunity_id(id, name, status, waiting_on)
      `)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true })

    if (ownerFilter) {
      query = query.eq('owner_type', ownerFilter)
    }

    if (statusFilter === 'open') {
      query = query.in('status', ['pending', 'in_progress'])
    } else if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (assignee) {
      query = query.eq('owner_email', assignee)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const tasks = data || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Enrich with computed fields
    const enriched = tasks.map(t => {
      const isOverdue = t.due_date && t.status !== 'done' && t.status !== 'skipped'
        && new Date(t.due_date + 'T00:00:00') < today
      const daysUntilDue = t.due_date
        ? Math.ceil((new Date(t.due_date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null
      return { ...t, is_overdue: isOverdue, days_until_due: daysUntilDue }
    })

    // Summary counts
    const overdue = enriched.filter(t => t.is_overdue).length
    const dueThisWeek = enriched.filter(t =>
      t.days_until_due !== null && t.days_until_due >= 0 && t.days_until_due <= 7
      && t.status !== 'done' && t.status !== 'skipped'
    ).length
    const waitingOnClient = enriched.filter(t =>
      t.owner_type === 'client' && t.status !== 'done' && t.status !== 'skipped'
    ).length

    return NextResponse.json({
      tasks: enriched,
      summary: {
        total: enriched.length,
        overdue,
        due_this_week: dueThisWeek,
        waiting_on_client: waitingOnClient,
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
