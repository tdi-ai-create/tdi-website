import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { contractSigned } from '@/lib/billing-slack'
import { quoteSigned } from '@/lib/sales-slack'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { signedByName, signedByEmail, signatureTyped, signatureDrawn, selectedPackageIndex, poNumber } = await request.json()

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
    po_number: poNumber?.trim() ?? null,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })

  // Trigger receipt email + PDF in background
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.teachersdeserveit.com'}/api/quotes/${id}/send-receipt`, {
    method: 'POST',
  }).catch(err => console.error('Receipt send failed:', err))

  // Auto-create deliverables from signed contract
  const { data: fullQuote } = await supabase
    .from('quotes')
    .select('quote_number, contact_organization, contract_type, district_id, service_start_date, service_end_date, quote_packages(id, total_amount, line_items)')
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

  // --- Post-signing automation ---

  // 1. Find and update sales opportunity to "signed", capture data for later
  const contactEmail = signedByEmail?.trim()
  let matchedOpportunity: any = null
  if (contactEmail) {
    try {
      const { data: opps } = await supabase.from('sales_opportunities')
        .select('id, notes, enrichment_data, grant_support, city, state, website')
        .ilike('contact_email', contactEmail)
        .is('deleted_at', null)
        .limit(1)
      if (opps?.[0]) {
        matchedOpportunity = opps[0]
        await supabase.from('sales_opportunities')
          .update({ stage: 'signed', heat: 'hot', last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', matchedOpportunity.id)
      }
    } catch {}
  }

  // 2. Update district status to "active"
  const districtId = (fullQuote as any)?.district_id
  if (districtId) {
    try {
      await supabase.from('districts')
        .update({ status: 'active' })
        .eq('id', districtId)
    } catch {}
  }

  // 3. Find or create partnership and link deliverables (must always succeed)
  if (fullQuote) {
    const orgName = fullQuote.contact_organization || ''
    const quoteContactEmail = contactEmail || (fullQuote as any).contact_email || ''
    let partnershipId: string | null = null
    let isNewPartnership = false

    // Strategy 1: Match by exact email
    if (quoteContactEmail) {
      const { data: byEmail } = await supabase
        .from('partnerships')
        .select('id')
        .ilike('contact_email', quoteContactEmail)
        .limit(1)
        .maybeSingle()
      if (byEmail) partnershipId = byEmail.id
    }

    // Strategy 2: Match by email domain (handles .com vs .org, different contacts at same school)
    if (!partnershipId && quoteContactEmail) {
      const domain = quoteContactEmail.split('@')[1]
      if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'].includes(domain.toLowerCase())) {
        const { data: byDomain } = await supabase
          .from('partnerships')
          .select('id')
          .ilike('contact_email', `%@${domain}`)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()
        if (byDomain) partnershipId = byDomain.id
      }
    }

    // Strategy 3: Match by org name
    if (!partnershipId && orgName) {
      const { data: byOrg } = await supabase
        .from('partnerships')
        .select('id')
        .ilike('org_name', orgName)
        .limit(1)
        .maybeSingle()
      if (byOrg) partnershipId = byOrg.id
    }

    // Strategy 4: Match by district_id (through districts.partnership_id)
    if (!partnershipId && districtId) {
      const { data: district } = await supabase
        .from('districts')
        .select('partnership_id')
        .eq('id', districtId)
        .not('partnership_id', 'is', null)
        .maybeSingle()
      if (district?.partnership_id) partnershipId = district.partnership_id
    }

    // Strategy 5: Create new partnership
    if (!partnershipId && (orgName || quoteContactEmail)) {
      isNewPartnership = true
      const name = orgName || quoteContactEmail.split('@')[0]
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      // Ensure slug uniqueness (partnerships.slug has a UNIQUE constraint)
      const { data: slugCheck } = await supabase.from('partnerships').select('id').eq('slug', slug).maybeSingle()
      if (slugCheck) slug = `${slug}-${Date.now().toString(36)}`

      // Use quote dates if available, otherwise default to today + 1 year
      const contractStart = (fullQuote as any).service_start_date || new Date().toISOString().split('T')[0]
      const contractEnd = (fullQuote as any).service_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Build address from enrichment data or opportunity
      const enrichment = matchedOpportunity?.enrichment_data
      const address = enrichment?.school_address || null
      const website = matchedOpportunity?.website || enrichment?.district_website || null

      const { data: newPartnership, error: partnershipErr } = await supabase.from('partnerships').insert({
        org_name: orgName || null,
        partnership_type: 'school',
        contact_name: signedByName,
        contact_email: quoteContactEmail,
        primary_contact_name: signedByName,
        primary_contact_email: quoteContactEmail,
        contract_phase: 'IGNITE',
        status: 'active',
        slug: slug,
        contract_start: contractStart,
        contract_end: contractEnd,
        staff_enrolled: 0,
        base_staff_enrolled: 0,
        observation_days_total: 0, observation_days_used: 0,
        virtual_sessions_total: 0, virtual_sessions_used: 0,
        executive_sessions_total: 0, executive_sessions_used: 0,
        sales_deal_id: matchedOpportunity?.id || null,
        has_grant_support: matchedOpportunity?.grant_support || false,
        address: address,
        website: website,
      }).select('id').single()

      if (partnershipErr) {
        console.error('[quote-sign] Partnership auto-create failed:', partnershipErr.message)
      }
      if (newPartnership?.id) partnershipId = newPartnership.id
    }

    // Link deliverables to partnership
    if (partnershipId) {
      const { error: linkErr } = await supabase.from('contract_deliverables')
        .update({ partnership_id: partnershipId })
        .eq('quote_id', id)
        .is('partnership_id', null)
      if (linkErr) console.error('[quote-sign] Failed to link deliverables:', linkErr.message)

      // Backfill org_name on partnership if it was missing
      if (orgName) {
        await supabase.from('partnerships')
          .update({ org_name: orgName })
          .eq('id', partnershipId)
          .is('org_name', null)
      }

      // 4. Link district to partnership (districts.partnership_id)
      if (districtId) {
        await supabase.from('districts')
          .update({ partnership_id: partnershipId })
          .eq('id', districtId)
          .is('partnership_id', null)
      }

      // 5. Sum deliverables into partnership session counts
      const { data: deliverables } = await supabase.from('contract_deliverables')
        .select('service_type, quantity')
        .eq('quote_id', id)
      if (deliverables?.length) {
        let observations = 0, virtuals = 0, executives = 0, staffCount = 0
        for (const d of deliverables) {
          if (d.service_type === 'observation') observations += d.quantity
          else if (d.service_type === 'virtual_session') virtuals += d.quantity
          else if (d.service_type === 'executive_session') executives += d.quantity
          else if (d.service_type === 'hub_membership') staffCount += d.quantity
        }
        if (isNewPartnership) {
          // New partnership: set counts directly
          await supabase.from('partnerships')
            .update({
              observation_days_total: observations,
              base_observation_days: observations,
              virtual_sessions_total: virtuals,
              base_virtual_sessions: virtuals,
              executive_sessions_total: executives,
              base_executive_sessions: executives,
              staff_enrolled: staffCount,
              base_staff_enrolled: staffCount,
            })
            .eq('id', partnershipId)
        } else {
          // Existing partnership: add to current counts (handles add-on quotes)
          const { data: current } = await supabase.from('partnerships')
            .select('observation_days_total, virtual_sessions_total, executive_sessions_total, staff_enrolled')
            .eq('id', partnershipId)
            .single()
          if (current) {
            await supabase.from('partnerships')
              .update({
                observation_days_total: (current.observation_days_total || 0) + observations,
                virtual_sessions_total: (current.virtual_sessions_total || 0) + virtuals,
                executive_sessions_total: (current.executive_sessions_total || 0) + executives,
                staff_enrolled: (current.staff_enrolled || 0) + staffCount,
              })
              .eq('id', partnershipId)
          }
        }
      }

      // 6. Carry over sales data to existing partnerships (for matched, not just new)
      if (matchedOpportunity && !isNewPartnership) {
        const updates: Record<string, any> = {}
        if (matchedOpportunity.id) updates.sales_deal_id = matchedOpportunity.id
        if (matchedOpportunity.grant_support) updates.has_grant_support = true
        if (matchedOpportunity.website) updates.website = matchedOpportunity.website
        if (Object.keys(updates).length > 0) {
          await supabase.from('partnerships').update(updates).eq('id', partnershipId)
        }
      }

      // 7. Create initial partnership note with sales context
      if (matchedOpportunity?.notes) {
        await supabase.from('partnership_notes').insert({
          partnership_id: partnershipId,
          content: `Sales context from initial inquiry:\n\n${matchedOpportunity.notes}`,
          author: 'System',
          note_type: 'internal',
          visible_to_partner: false,
        })
      }

      // 8. Auto-create funding pursuit if grant-supported
      const isGrantSupported = matchedOpportunity?.grant_support || (fullQuote as any).contract_type === 'grant_funded'
      if (isGrantSupported) {
        const { data: existingPursuit } = await supabase.from('funding_pursuits')
          .select('id')
          .eq('partnership_id', partnershipId)
          .limit(1)
          .maybeSingle()
        if (!existingPursuit) {
          const pkg = (fullQuote as any).quote_packages?.[0]
          await supabase.from('funding_pursuits').insert({
            pursuit_name: `${orgName || 'New Partnership'} - Grant Funding`,
            district_name: orgName || null,
            partnership_id: partnershipId,
            sales_deal_id: matchedOpportunity?.id || null,
            total_amount: pkg?.total_amount || null,
            contract_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
            current_phase: 'identified',
            client_contact_name: signedByName,
            client_contact_email: quoteContactEmail,
            operational_owner_email: 'bella@teachersdeserveit.com',
            internal_notes: `Auto-created from signed quote ${(fullQuote as any).quote_number || id}. Contract type: grant_funded.`,
          })
        }
      }
    } else {
      console.error(`[quote-sign] CRITICAL: Could not find or create partnership for quote ${id} (${orgName || quoteContactEmail}). Deliverables are orphaned.`)
    }

    // Slack notifications -- fired here so we have session counts + partnership info
    const amount = (fullQuote as any).quote_packages?.[0]?.total_amount || 0
    let partnershipSlug: string | undefined
    if (partnershipId) {
      const { data: pRow } = await supabase.from('partnerships').select('slug').eq('id', partnershipId).single()
      partnershipSlug = pRow?.slug || undefined
    }
    // Build deliverable counts from what was just inserted
    const { data: slackDeliverables } = await supabase.from('contract_deliverables')
      .select('service_type, quantity')
      .eq('quote_id', id)
    let slackObs = 0, slackVirt = 0, slackExec = 0, slackHub = 0
    for (const d of slackDeliverables || []) {
      if (d.service_type === 'observation') slackObs += d.quantity
      else if (d.service_type === 'virtual_session') slackVirt += d.quantity
      else if (d.service_type === 'executive_session') slackExec += d.quantity
      else if (d.service_type === 'hub_membership') slackHub += d.quantity
    }
    const isGrantSupported = matchedOpportunity?.grant_support || (fullQuote as any).contract_type === 'grant_funded'
    const slackDetails = {
      partnershipStatus: (isNewPartnership ? 'new' : partnershipId ? 'matched' : undefined) as 'new' | 'matched' | undefined,
      observations: slackObs || undefined,
      virtuals: slackVirt || undefined,
      executives: slackExec || undefined,
      hubSeats: slackHub || undefined,
      grantSupported: isGrantSupported || undefined,
      partnershipSlug,
    }
    contractSigned(fullQuote.quote_number, fullQuote.contact_organization || '', signedByName, Number(amount), slackDetails).catch(() => {})
    quoteSigned(signedByName, fullQuote.contact_organization || '', fullQuote.quote_number || id, Number(amount), slackDetails).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
