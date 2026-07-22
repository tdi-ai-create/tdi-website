import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

/**
 * POST /api/funding/duplicate-quote
 *
 * Duplicates a quote and all its packages. The new quote is created
 * as a draft with "(Copy)" appended to the title and a new quote number.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { quoteId } = await request.json()
  if (!quoteId) {
    return NextResponse.json({ error: 'quoteId is required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Fetch the original quote
  const { data: original, error: fetchErr } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  if (fetchErr || !original) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  // Generate new quote number
  const { data: maxQuote } = await supabase
    .from('quotes')
    .select('quote_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let newNumber = 'TDI-2026-010'
  if (maxQuote?.quote_number) {
    const match = maxQuote.quote_number.match(/(\d+)$/)
    if (match) {
      const prefix = maxQuote.quote_number.replace(/\d+$/, '')
      newNumber = `${prefix}${String(parseInt(match[1]) + 1).padStart(3, '0')}`
    }
  }

  // Create the duplicate
  const { data: newQuote, error: insertErr } = await supabase
    .from('quotes')
    .insert({
      district_id: original.district_id,
      quote_number: newNumber,
      title: original.title + ' (Copy)',
      contract_type: original.contract_type,
      intro_message: original.intro_message,
      video_url: original.video_url,
      service_start_date: original.service_start_date,
      service_end_date: original.service_end_date,
      payment_instructions: original.payment_instructions,
      terms_of_service: original.terms_of_service,
      po_required: original.po_required,
      contact_name: original.contact_name,
      contact_email: original.contact_email,
      contact_organization: original.contact_organization,
      status: 'draft',
    })
    .select('id')
    .single()

  if (insertErr || !newQuote) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to create quote' }, { status: 500 })
  }

  // Copy packages
  const { data: packages } = await supabase
    .from('quote_packages')
    .select('*')
    .eq('quote_id', quoteId)
    .order('package_index')

  if (packages && packages.length > 0) {
    const newPackages = packages.map(pkg => ({
      quote_id: newQuote.id,
      package_index: pkg.package_index,
      package_name: pkg.package_name,
      description: pkg.description,
      line_items: pkg.line_items,
      total_amount: pkg.total_amount,
      is_recommended: pkg.is_recommended,
    }))

    await supabase.from('quote_packages').insert(newPackages)
  }

  return NextResponse.json({ success: true, newQuoteId: newQuote.id, quoteNumber: newNumber })
}
