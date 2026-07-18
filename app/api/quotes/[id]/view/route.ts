import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { quoteViewed } from '@/lib/sales-slack'

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

  const newViewCount = (quote.view_count ?? 0) + 1

  await supabase.from('quotes').update({
    view_count: newViewCount,
    viewed_at: quote.viewed_at ?? new Date().toISOString(),
    status: 'viewed',
  }).eq('id', id)

  // Slack notification for quote view (only on first view to avoid noise)
  if (newViewCount === 1) {
    try {
      const { data: fullQuote } = await supabase
        .from('quotes')
        .select('contact_name, contact_organization, quote_number')
        .eq('id', id)
        .single()
      if (fullQuote) {
        quoteViewed(
          fullQuote.contact_name || 'Unknown contact',
          fullQuote.contact_organization || 'Unknown org',
          fullQuote.quote_number || id
        ).catch(() => {})
      }
    } catch { /* non-blocking */ }
  }

  return NextResponse.json({ ok: true })
}
