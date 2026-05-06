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

  const results = {
    opportunities_fetched: 0,
    opportunities_imported: 0,
    opportunities_skipped: 0,
    contacts_imported: 0,
    notes_migrated: 0,
    errors: [] as string[],
  }

  try {
    // STEP A: Fetch pipeline stages to build stage ID → name map
    const pipelinesRes = await fetch(
      `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: '2021-07-28',
        },
      }
    )
    const pipelinesData = await pipelinesRes.json()
    const stageMap: Record<string, string> = {}

    // Map GHL stage names to TDI stage values
    const stageNameToTDI: Record<string, string> = {
      'unassigned': 'unassigned',
      'new (0%)': 'unassigned',
      'targeting (5%)': 'targeting',
      'engaged (10%)': 'engaged',
      'qualified (30%)': 'qualified',
      'likely yes (50%)': 'likely_yes',
      'proposal sent (70%)': 'proposal_sent',
      'signed (90%)': 'signed',
      'paid (100%)': 'paid',
      'lost': 'lost',
    }

    for (const pipeline of pipelinesData?.pipelines || []) {
      for (const stage of pipeline?.stages || []) {
        const normalized = stage.name?.toLowerCase().trim()
        stageMap[stage.id] = stageNameToTDI[normalized] || 'unassigned'
      }
    }

    // STEP B: Fetch all opportunities (paginate if needed)
    let page = 1
    let hasMore = true
    const allOpportunities: any[] = []

    while (hasMore) {
      const oppsRes = await fetch(
        `${GHL_BASE}/opportunities/search?location_id=${locationId}&limit=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Version: '2021-07-28',
          },
        }
      )
      const oppsData = await oppsRes.json()
      const opps = oppsData?.opportunities || []
      allOpportunities.push(...opps)
      results.opportunities_fetched += opps.length

      if (opps.length < 100) {
        hasMore = false
      } else {
        page++
      }
    }

    // STEP C: Import each opportunity
    for (const opp of allOpportunities) {
      try {
        // Determine stage
        const stage = stageMap[opp.pipelineStageId] || 'unassigned'
        const isRenewal = opp.name?.toLowerCase().includes('renewal')

        // Determine opportunity type
        const type = isRenewal ? 'renewal' : 'new_business'

        // Probability map
        const probabilityMap: Record<string, number> = {
          unassigned: 0, targeting: 0, engaged: 10, qualified: 30,
          likely_yes: 50, proposal_sent: 70, signed: 90, paid: 100, lost: 0,
        }

        // Check if already exists (skip if ghl_opportunity_id already imported)
        const { data: existingOpp } = await supabase
          .from('sales_opportunities')
          .select('id')
          .eq('ghl_opportunity_id', opp.id)
          .single()

        if (existingOpp) {
          results.opportunities_skipped++
          continue
        }

        const { error: oppError } = await supabase
          .from('sales_opportunities')
          .insert({
            ghl_opportunity_id: opp.id,
            name: opp.name || 'Unnamed Opportunity',
            type,
            stage,
            value: opp.monetaryValue || null,
            probability: probabilityMap[stage] || 0,
            assigned_to_email: opp.assignedTo || null,
            source: 'GHL Import',
            notes: `Imported from GHL on ${new Date().toISOString().split('T')[0]}`,
          })

        if (oppError) {
          results.errors.push(`Opp ${opp.name}: ${oppError.message}`)
          continue
        }

        results.opportunities_imported++

        // STEP D: Import contact for this opportunity
        if (opp.contact?.email) {
          const { data: existingContact } = await supabase
            .from('sales_contacts')
            .select('id')
            .eq('email', opp.contact.email)
            .single()

          if (!existingContact) {
            const { error: contactError } = await supabase
              .from('sales_contacts')
              .insert({
                name: opp.contact.name || opp.name,
                email: opp.contact.email,
                phone: opp.contact.phone || null,
                notes: `Imported from GHL on ${new Date().toISOString().split('T')[0]}`,
              })

            if (!contactError) results.contacts_imported++
          }
        }
      } catch (err: any) {
        results.errors.push(`Opp ${opp.name}: ${err.message}`)
      }
    }

    // STEP E: Migrate existing opportunity_notes into activity_log
    const { data: existingNotes } = await supabase
      .from('opportunity_notes')
      .select('*')

    if (existingNotes && existingNotes.length > 0) {
      for (const note of existingNotes) {
        // Find the matching sales_opportunity by ghl_opportunity_id
        const { data: matchedOpp } = await supabase
          .from('sales_opportunities')
          .select('id')
          .eq('ghl_opportunity_id', note.ghl_opportunity_id)
          .single()

        const { error: logError } = await supabase
          .from('activity_log')
          .insert({
            opportunity_id: matchedOpp?.id || null,
            activity_type: 'note',
            subject: 'Imported note',
            body: note.note,
            logged_by_email: 'import@teachersdeserveit.com',
            activity_date: note.created_at,
          })

        if (!logError) results.notes_migrated++
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 })
  }
}
