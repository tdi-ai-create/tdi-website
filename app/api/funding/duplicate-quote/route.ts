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

    const { error: packagesErr } = await supabase.from('quote_packages').insert(newPackages)

    if (packagesErr) {
      // A quote with no packages is not a duplicate, it is an empty quote that
      // looks ready to send. Nothing else is attached to the new row yet, so
      // remove it rather than leaving a priceless draft in the list.
      console.error('[duplicate-quote] Packages not copied, removing the empty quote', {
        sourceQuoteId: quoteId, newQuoteId: newQuote.id, packages: newPackages.length,
        error: packagesErr.message,
      })

      const { error: cleanupErr } = await supabase.from('quotes').delete().eq('id', newQuote.id)

      if (cleanupErr) {
        console.error('[duplicate-quote] Empty quote could not be removed either', {
          newQuoteId: newQuote.id, error: cleanupErr.message,
        })
        return NextResponse.json({
          error: `Quote ${newNumber} was created but its packages were not copied, and the empty quote could not be removed. Delete ${newNumber} by hand before anyone sends it.`,
          newQuoteId: newQuote.id,
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'The packages could not be copied, so no quote was created. Nothing was left behind. Retry.',
      }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, newQuoteId: newQuote.id, quoteNumber: newNumber })
}
