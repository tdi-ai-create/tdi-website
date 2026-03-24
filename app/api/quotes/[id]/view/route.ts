import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const { data: quote } = await supabase
    .from('quotes')
    .select('view_count, viewed_at, status')
    .eq('id', id)
    .single()

  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['sent', 'viewed'].includes(quote.status)) return NextResponse.json({ ok: true })

  await supabase.from('quotes').update({
    view_count: (quote.view_count ?? 0) + 1,
    viewed_at: quote.viewed_at ?? new Date().toISOString(),
    status: 'viewed',
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}
