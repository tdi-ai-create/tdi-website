import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SALES_TEAM } from '@/lib/sales/team'
import { pipelineMoney, scoreBoard } from '@/lib/sales/board-scores'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: opps, error } = await (supabase
      .from('sales_opportunities') as any)
      .select('*')
      .is('deleted_at', null)

    if (error) throw error

    const active = (opps || []).filter((o: any) => !['lost', 'paid', 'cancelled'].includes(o.stage))
    const won = (opps || []).filter((o: any) => o.stage === 'paid')
    const lost = (opps || []).filter((o: any) => o.stage === 'lost')
    const now = new Date()

    /**
     * Money comes from the same scorer the board headline uses.
     *
     * It used to be computed here, by summing the raw `value` column across
     * every active lead. That is the pre-restructure import the September
     * correction was built to stop counting, so on 24 September 2026 this tab
     * reported $1,562K while the headline directly above it read $0.78M. Same
     * board, same moment, two answers.
     *
     * `pipelineMoney` mirrors the headline's population exactly, Targeting
     * included and excluded the same way, so the two screens can no longer
     * disagree without somebody changing one function.
     */
    const { board, error: scoreErr } = await scoreBoard(supabase)
    if (scoreErr) throw new Error(`scoring the board failed: ${scoreErr}`)
    const money = board ? pipelineMoney(board) : { total: 0, count: 0, unvalued: 0, average: 0 }

    const totalPipeline = money.total
    const avgDealSize = money.average

    /**
     * Factored the same way the top bar factors: by stage probability, on the
     * predicted value rather than the recorded one.
     */
    const probByStage = new Map<string, number>(
      active.map((o: any) => [o.id as string, (o.probability || 0) as number])
    )
    const factored = board
      ? board.scored.reduce((sum, sc) => {
          const stage = board.stages[sc.id]
          if (stage === 'paid' || stage === 'lost' || stage === 'targeting') return sum
          return sum + (sc.value ?? 0) * (probByStage.get(sc.id) ?? 0) / 100
        }, 0)
      : 0

    /**
     * Signed and paid, together.
     *
     * This tile was labelled "Won YTD" and counted only the paid stage, so it
     * read $4K on a board carrying $169K of signed work. A signed contract is
     * won; whether the invoice has cleared is a billing question, not a sales
     * one. Both use the recorded figure rather than a prediction, because once
     * a contract is signed the number is in the contract.
     */
    const signedOpps = (opps || []).filter((o: any) => o.stage === 'signed')
    const wonValue = [...won, ...signedOpps].reduce((s: number, o: any) => s + (o.value || 0), 0)

    // Stale leads: active deals with no activity in 30+ days
    const staleLeads = active.filter((o: any) => {
      const lastTouch = o.last_activity_at || o.updated_at || o.created_at
      if (!lastTouch) return true
      const daysSince = (now.getTime() - new Date(lastTouch).getTime()) / 86400000
      return daysSince > 30
    }).length

    // Needs follow-up: engaged or qualified with no activity in 14+ days
    const needsFollowUp = active.filter((o: any) => {
      if (!['engaged', 'qualified', 'likely_yes'].includes(o.stage)) return false
      const lastTouch = o.last_activity_at || o.updated_at || o.created_at
      if (!lastTouch) return true
      const daysSince = (now.getTime() - new Date(lastTouch).getTime()) / 86400000
      return daysSince > 14
    }).length

    /**
     * There is no win rate any more, and there should never have been one.
     *
     * It was (signed + paid) / (signed + paid + lost). TDI does not mark a lead
     * lost, on purpose: in K-12 a no is almost always a not-this-budget-year.
     * So the denominator could never carry a loss, and the tile reported 100
     * percent on 24 September 2026 with zero rows in the lost stage and no
     * arrangement of real events that could ever move it.
     *
     * `signedCount` stays, because a count of signed deals is a fact.
     */
    const signedDeals = signedOpps.length
    void lost

    // Funnel: show actual deals currently at each stage
    const stageOrder = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid']
    const funnel = stageOrder.map(stage => {
      const atStage = (opps || []).filter((o: any) => o.stage === stage)
      return {
        stage,
        count: atStage.length,
        value: atStage.reduce((s: number, o: any) => s + (o.value || 0), 0),
      }
    })

    // Source attribution -- normalize duplicate/raw source values
    const SOURCE_NORMALIZE: Record<string, string> = {
      'pd_plan_request': 'PD Plan Request (website)',
      'PD Plan Request': 'PD Plan Request (website)',
      'cold_inbound': 'Cold Inbound',
      'existing_customer_renewal': 'Existing Customer Renewal',
      'Existing customer renewal': 'Existing Customer Renewal',
      'Existing customer expansion': 'Existing Customer Expansion',
      'rfp': 'RFP',
      'other': 'Other',
      'Direct inquiry form': 'Direct Inquiry',
      'Direct inquiry': 'Direct Inquiry',
      'Cold call (Jim)': "Jim's Call Sheet (April 2026)",
      'GHL Import': 'Other',
    }
    const bySource: Record<string, { count: number; value: number; factored: number; won: number }> = {}
    ;(opps || []).forEach((o: any) => {
      const rawSrc = o.source || 'Unknown'
      const src = SOURCE_NORMALIZE[rawSrc] || rawSrc
      if (!bySource[src]) bySource[src] = { count: 0, value: 0, factored: 0, won: 0 }
      bySource[src].count++
      bySource[src].value += o.value || 0
      bySource[src].factored += (o.value || 0) * (o.probability || 0) / 100
      if (o.stage === 'paid') bySource[src].won++
    })

    // Geography: use state column first, fall back to heuristics
    const byState: Record<string, { count: number; value: number; won: number; byClassification: Record<string, { count: number; value: number }> }> = {}
    const statePatterns: Record<string, RegExp> = {
      'IL': /\b(IL|Illinois|Chicago|Wheaton|DuPage|Naperville|Carol Stream|Bloomingdale|Mokena|Frankfort|Schiller|Lansing|Addison|Glen Ellyn|Saunemin|Aurora|Kaneland|McHenry|Harvard|Knoxville|Olympia|Momence|Grayslake|North Chicago|Keneyville|Waukegan|Round Lake|New Lenox|Summit Hill|Oak Grove|Warrenville|West Chicago|WeGo)\b/i,
      'NJ': /\b(NJ|New Jersey|Lodi|Burlington|Kenilworth|Brick Township|Cedar Grove|Monmouth|River Vale)\b/i,
      'NY': /\b(NY|New York|Elmont|Cheektowaga|BHBL|Maplebrook|Dunkirk|Lackawanna|PS\/IS|Lenox Academy|Dyker)\b/i,
      'WI': /\b(WI|Wisconsin|Hamilton|Templeton|Antigo|Black River|Abbotsford|Alma Center|Medford|Ladysmith|Whitehall|Osseo)\b/i,
      'VA': /\b(VA|Virginia|Prince William|Pulaski|Waynesboro)\b/i,
      'PA': /\b(PA|Pennsylvania|Middletown|Tidioute|Mohawk|North Penn|Sharon City)\b/i,
      'KY': /\b(KY|Kentucky|Henry County|Boone|New Haven)\b/i,
      'IN': /\b(IN|Indiana|North Adams|Putnam|Greencastle|Hendricks|Dubois|Princeton|Sputnam|South Putnam)\b/i,
      'MD': /\b(MD|Maryland|PGCPS|Allenwood|Melwood)\b/i,
      'OH': /\b(OH|Ohio|Plymouth Shiloh|Bethlehem Lutheran|Springfield.*Spartans|South Central)\b/i,
      'ME': /\b(ME|Maine|RSU)\b/i,
      'MT': /\b(MT|Montana|Yellowstone|West Yellowstone|Stevensville)\b/i,
      'AL': /\b(AL|Alabama|Leeds|Mobile County|MCPSS)\b/i,
      'LA': /\b(LA|Louisiana|Chanel)\b/i,
      'CO': /\b(CO|Colorado|Denver|DPS|Cherry Creek|Douglas County|Compass|Norwood|Breckenridge|Summit RE)\b/i,
      'TX': /\b(TX|Texas|Leander|Laredo|OLOR|Round Rock|Bluebonnet)\b/i,
      'CA': /\b(CA|California|Arroyo Vista|Cutler|San Marino|Dunsmuir|Morenci|Allegiance|Bloomington|Newman|Lathrop|SAUSD|Stockton|Flora Arca|Madison K-8|Stanbridge|FlexTech)\b/i,
      'GA': /\b(GA|Georgia|Cairo|Hancock County|Irwin County|White County)\b/i,
      'MI': /\b(MI|Michigan|Walled Lake|Eaton Rapids|Shepherd)\b/i,
      'NM': /\b(NM|New Mexico|Rio Gallinas)\b/i,
      'AZ': /\b(AZ|Arizona|Winkelman)\b/i,
      'NC': /\b(NC|North Carolina|Expedition School)\b/i,
      'OK': /\b(OK|Oklahoma|Sapulpa)\b/i,
      'KS': /\b(KS|Kansas|Winfield|USD 465)\b/i,
      'MN': /\b(MN|Minnesota|Bagley)\b/i,
      'RI': /\b(RI|Rhode Island|Ponaganset)\b/i,
      'CT': /\b(CT|Connecticut|Hartford|Kennelly)\b/i,
      'FL': /\b(FL|Florida|EdVenture|Stambaugh)\b/i,
      'MO': /\b(MO|Missouri|City Garden)\b/i,
      'International': /\b(Dubai|UAE|SSIS|MSB)\b/i,
    }

    ;(opps || []).forEach((o: any) => {
      // Use the state column if available
      let detectedState = o.state || null
      if (!detectedState) {
        const text = `${o.name || ''} ${o.notes || ''} ${o.city || ''}`
        for (const [state, pattern] of Object.entries(statePatterns)) {
          if (pattern.test(text)) {
            detectedState = state
            break
          }
        }
      }
      const stateKey = detectedState || 'Other'
      if (!byState[stateKey]) byState[stateKey] = { count: 0, value: 0, won: 0, byClassification: {} }
      byState[stateKey].count++
      byState[stateKey].value += o.value || 0
      if (o.stage === 'paid') byState[stateKey].won++
      const cls = o.lead_classification || 'targeting_area'
      if (!byState[stateKey].byClassification[cls]) byState[stateKey].byClassification[cls] = { count: 0, value: 0 }
      byState[stateKey].byClassification[cls].count++
      byState[stateKey].byClassification[cls].value += o.value || 0
    })

    // Owner / team performance
    // Map raw IDs or emails to display names. Built from the one roster in
    // lib/sales/team.ts rather than a third hardcoded copy of it.
    const OWNER_NAMES: Record<string, string> = Object.fromEntries(
      SALES_TEAM.map(m => [m.email, m.label])
    )
    function resolveOwner(raw: string | null): string {
      if (!raw) return 'unassigned'
      if (OWNER_NAMES[raw]) return OWNER_NAMES[raw]
      if (raw.includes('@')) return raw.split('@')[0]
      // Raw ID — default to Rae (primary closer)
      return 'Rae'
    }
    const byOwner: Record<string, { count: number; value: number; factored: number; won: number; lost: number }> = {}
    ;(opps || []).forEach((o: any) => {
      const owner = resolveOwner(o.assigned_to_email)
      if (!byOwner[owner]) byOwner[owner] = { count: 0, value: 0, factored: 0, won: 0, lost: 0 }
      if (!['lost', 'paid'].includes(o.stage)) {
        byOwner[owner].count++
        byOwner[owner].value += o.value || 0
        byOwner[owner].factored += (o.value || 0) * (o.probability || 0) / 100
      }
      if (o.stage === 'paid') byOwner[owner].won++
      if (o.stage === 'lost') byOwner[owner].lost++
    })

    // Deal type mix
    const byType: Record<string, { count: number; value: number; factored: number }> = {}
    active.forEach((o: any) => {
      const t = o.type || 'Unknown'
      if (!byType[t]) byType[t] = { count: 0, value: 0, factored: 0 }
      byType[t].count++
      byType[t].value += o.value || 0
      byType[t].factored += (o.value || 0) * (o.probability || 0) / 100
    })

    // Snapshots - try to fetch, gracefully handle if table doesn't exist
    let snapshots: any[] = []
    try {
      const { data: snapshotData } = await (supabase
        .from('sales_pipeline_snapshots') as any)
        .select('*')
        .order('snapshot_date', { ascending: true })
        .limit(52)
      snapshots = snapshotData || []
    } catch {
      // Table may not exist yet
    }

    // Pipeline velocity: compute avg days in each stage from activity logs
    let velocity: { stage: string; avgDays: number; count: number }[] = []
    try {
      const { data: activities } = await (supabase
        .from('opportunity_activity') as any)
        .select('opportunity_id, activity_type, old_value, new_value, created_at')
        .eq('activity_type', 'stage_changed')
        .order('created_at', { ascending: true })

      if (activities?.length) {
        // Group stage durations: track time between entering and leaving each stage
        const stageDurations: Record<string, number[]> = {}
        const oppLastStageTime: Record<string, { stage: string; at: number }> = {}

        for (const a of activities) {
          const oppId = a.opportunity_id
          const prev = oppLastStageTime[oppId]
          if (prev) {
            const days = (new Date(a.created_at).getTime() - prev.at) / 86400000
            if (days > 0 && days < 365) { // sanity cap
              if (!stageDurations[prev.stage]) stageDurations[prev.stage] = []
              stageDurations[prev.stage].push(days)
            }
          }
          oppLastStageTime[oppId] = { stage: a.new_value, at: new Date(a.created_at).getTime() }
        }

        velocity = stageOrder.map(stage => {
          const durations = stageDurations[stage] || []
          const avgDays = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0
          return { stage, avgDays, count: durations.length }
        }).filter(v => v.count > 0)
      }

      // Fallback: if no activity logs, estimate from stage_entered_at and created_at
      if (velocity.length === 0) {
        const stageGroups: Record<string, number[]> = {}
        ;(opps || []).forEach((o: any) => {
          if (o.stage_entered_at && o.created_at) {
            const days = (new Date().getTime() - new Date(o.stage_entered_at).getTime()) / 86400000
            if (days > 0 && days < 365) {
              if (!stageGroups[o.stage]) stageGroups[o.stage] = []
              stageGroups[o.stage].push(days)
            }
          }
        })
        velocity = stageOrder.map(stage => {
          const durations = stageGroups[stage] || []
          const avgDays = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0
          return { stage, avgDays, count: durations.length }
        }).filter(v => v.count > 0)
      }
    } catch {
      // Activity table may not exist
    }

    return NextResponse.json({
      pulse: {
        totalPipeline: Math.round(totalPipeline),
        factored: Math.round(factored),
        activeCount: money.count,
        avgDealSize: Math.round(avgDealSize),
        wonValue: Math.round(wonValue),
        wonCount: won.length + signedDeals,
        unvaluedCount: money.unvalued,
        staleLeads,
        needsFollowUp,
        signedCount: signedDeals,
      },
      funnel,
      bySource,
      byState,
      byOwner,
      byType,
      snapshots,
      velocity,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
