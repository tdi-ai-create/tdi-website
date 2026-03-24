import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`*, quote_packages(*)`)
    .eq('id', id)
    .single()

  if (error || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  // Only allow access to active quotes (not drafts)
  if (quote.status === 'draft') {
    return NextResponse.json({ error: 'Quote not available' }, { status: 404 })
  }

  // Sort packages by index
  quote.quote_packages = (quote.quote_packages ?? []).sort(
    (a: { package_index: number }, b: { package_index: number }) => a.package_index - b.package_index
  )

  return NextResponse.json(quote)
}
