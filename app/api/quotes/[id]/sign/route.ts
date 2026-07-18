import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { contractSigned } from '@/lib/billing-slack'
import { quoteSigned } from '@/lib/sales-slack'

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

  // Trigger receipt email + PDF in background
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.teachersdeserveit.com'}/api/quotes/${id}/send-receipt`, {
    method: 'POST',
  }).catch(err => console.error('Receipt send failed:', err))

  // Auto-create deliverables from signed contract
  const { data: fullQuote } = await supabase
    .from('quotes')
    .select('quote_number, contact_organization, contract_type, district_id, quote_packages(id, total_amount, line_items)')
    .eq('id', id)
    .single()

  if (fullQuote) {
    const pkg = (fullQuote as any).quote_packages?.[0]
    if (pkg?.line_items) {
      const serviceTypeMap: Record<string, string> = {
        observation: 'observation', 'on-campus': 'observation',
        virtual: 'virtual_session', executive: 'executive_session',
        hub: 'hub_membership', membership: 'hub_membership',
        book: 'book', 'pd day': 'pd_day', 'pd visit': 'pd_day',
      }
      function detectType(label: string): string {
        const lower = label.toLowerCase()
        for (const [key, val] of Object.entries(serviceTypeMap)) {
          if (lower.includes(key)) return val
        }
        return 'custom'
      }

      const contractType = (fullQuote as any).contract_type
      const fundingType = contractType === 'grant_funded' ? 'grant_pending' : 'direct'
      const deliveryStatus = contractType === 'grant_funded' ? 'pending_funding' : 'pending'

      for (let idx = 0; idx < pkg.line_items.length; idx++) {
        const item = pkg.line_items[idx]
        const stype = detectType(item.label)
        const qty = item.quantity || 1
        const isIndividual = ['observation', 'virtual_session', 'executive_session', 'pd_day'].includes(stype)

        if (isIndividual && qty > 1) {
          for (let i = 1; i <= qty; i++) {
            await supabase.from('contract_deliverables').insert({
              quote_id: id, quote_package_id: pkg.id, district_id: (fullQuote as any).district_id,
              line_item_index: idx, label: `${item.label} (${i} of ${qty})`,
              service_type: stype, quantity: 1, unit_price: item.unit_price, total_amount: item.unit_price,
              is_complimentary: item.is_complimentary || false,
              funding_type: fundingType, delivery_status: deliveryStatus,
              sequence_number: i, sequence_total: qty,
            })
          }
        } else {
          await supabase.from('contract_deliverables').insert({
            quote_id: id, quote_package_id: pkg.id, district_id: (fullQuote as any).district_id,
            line_item_index: idx, label: item.label,
            service_type: stype, quantity: qty, unit_price: item.unit_price, total_amount: item.total,
            is_complimentary: item.is_complimentary || false,
            funding_type: fundingType, delivery_status: deliveryStatus,
            sequence_number: 1, sequence_total: 1,
          })
        }
      }
    }
  }

  // Slack notifications
  if (fullQuote) {
    const amount = (fullQuote as any).quote_packages?.[0]?.total_amount || 0
    contractSigned(fullQuote.quote_number, fullQuote.contact_organization || '', signedByName, Number(amount)).catch(() => {})
    quoteSigned(signedByName, fullQuote.contact_organization || '', fullQuote.quote_number || id, Number(amount)).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
