import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { signedByName, signedByEmail, signatureTyped, signatureDrawn, selectedPackageIndex } = await request.json()

  if (!signedByName?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { data: quote } = await supabase
    .from('quotes')
    .select('status, expires_at')
    .eq('id', id)
    .single()

  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.status === 'expired') return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
  if (quote.status === 'signed') return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
    await supabase.from('quotes').update({ status: 'expired' }).eq('id', id)
    return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
  }

  const { error } = await supabase.from('quotes').update({
    status: 'signed',
    signed_by_name: signedByName.trim(),
    signed_by_email: signedByEmail?.trim() ?? null,
    signature_typed: signatureTyped?.trim() ?? null,
    signature_drawn: signatureDrawn ?? null,
    selected_package_index: selectedPackageIndex ?? 0,
    signed_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })

  return NextResponse.json({ success: true })
}
