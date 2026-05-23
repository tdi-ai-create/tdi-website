import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function POST() {
  const token = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID

  if (!token || !locationId) {
    return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 })
  }

  try {
    // Fetch pipeline ID
    const pipelinesRes = await fetch(
      `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`,
      { headers: { Authorization: `Bearer ${token}`, Version: '2021-07-28' } }
    )
    const pipelinesData = await pipelinesRes.json()
    const pipeline = pipelinesData.pipelines?.find((p: any) => p.name === 'Sales Pipeline')
    if (!pipeline) {
      return NextResponse.json({ error: 'Sales Pipeline not found in GHL' }, { status: 404 })
    }

    // Fetch all GHL opportunities (paginated)
    const ghlContacts: Record<string, { name: string | null; email: string | null; phone: string | null }> = {}
    let page = 1
    while (true) {
      const res = await fetch(
        `${GHL_BASE}/opportunities/search?location_id=${locationId}&pipeline_id=${pipeline.id}&limit=100&page=${page}`,
        { headers: { Authorization: `Bearer ${token}`, Version: '2021-07-28' } }
      )
      const data = await res.json()
      const opps = data.opportunities || []
      if (opps.length === 0) break

      for (const opp of opps) {
        const contact = opp.contact || {}
        ghlContacts[opp.id] = {
          name: contact.name || null,
          email: contact.email || null,
          phone: contact.phone || null,
        }
      }

      if (opps.length < 100) break
      page++
      if (page > 20) break // safety cap
    }

    // Get all Supabase opps with GHL IDs
    const { data: dbOpps } = await (supabase
      .from('sales_opportunities') as any)
      .select('id, ghl_opportunity_id, contact_name, contact_email, contact_phone')
      .not('ghl_opportunity_id', 'is', null)

    let updated = 0
    let skipped = 0
    let notFound = 0

    for (const dbOpp of (dbOpps || [])) {
      const ghlId = dbOpp.ghl_opportunity_id
      const ghlContact = ghlContacts[ghlId]

      if (!ghlContact) {
        notFound++
        continue
      }

      // Only update if GHL has data we don't
      const updates: Record<string, string | null> = {}
      if (ghlContact.name && ghlContact.name !== dbOpp.contact_name) {
        updates.contact_name = ghlContact.name
      }
      if (ghlContact.email && ghlContact.email !== dbOpp.contact_email) {
        updates.contact_email = ghlContact.email
      }
      if (ghlContact.phone && ghlContact.phone !== dbOpp.contact_phone) {
        updates.contact_phone = ghlContact.phone
      }

      if (Object.keys(updates).length === 0) {
        skipped++
        continue
      }

      const { error } = await (supabase
        .from('sales_opportunities') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', dbOpp.id)

      if (!error) {
        updated++
      }
    }

    return NextResponse.json({
      success: true,
      ghl_fetched: Object.keys(ghlContacts).length,
      updated,
      skipped,
      not_found_in_ghl: notFound,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
