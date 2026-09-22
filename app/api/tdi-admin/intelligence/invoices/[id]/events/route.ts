import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Every caller of this route is an admin page behind a signed in session,
  // and no cron reaches it. It previously had no gate at all.
  const __auth = await requireAdminAuth();
  if (__auth instanceof NextResponse) return __auth;

  const { id } = await params
  const { event_type, event_date, summary } = await request.json()

  if (!summary?.trim()) {
    return NextResponse.json({ error: 'Summary is required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { data, error } = await supabase.from('payment_events').insert({
    invoice_id: id,
    event_type: event_type || 'note',
    event_date: event_date || new Date().toISOString().split('T')[0],
    summary: summary.trim(),
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
