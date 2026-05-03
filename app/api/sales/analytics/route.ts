import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: opps, error } = await (supabase
      .from('sales_opportunities') as any)
      .select('*')

    if (error) throw error

    const active = (opps || []).filter((o: any) => !['lost', 'paid'].includes(o.stage))
    const won = (opps || []).filter((o: any) => o.stage === 'paid')
    const lost = (opps || []).filter((o: any) => o.stage === 'lost')

    // Pulse metrics
    const totalPipeline = active.reduce((s: number, o: any) => s + (o.value || 0), 0)
    const factored = active.reduce((s: number, o: any) => s + (o.value || 0) * (o.probability || 0) / 100, 0)
    const avgDealSize = active.length ? totalPipeline / active.length : 0
    const wonValue = won.reduce((s: number, o: any) => s + (o.value || 0), 0)

    // Win rate
    const reachedQualified = (opps || []).filter((o: any) =>
      ['qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid', 'lost'].includes(o.stage)
    ).length
    const winRate = reachedQualified > 0
      ? Math.round((won.length / reachedQualified) * 100)
      : 0

    // Funnel
    const stageOrder = ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid']
    const funnel = stageOrder.map(stage => {
      const stageIdx = stageOrder.indexOf(stage)
      const reached = (opps || []).filter((o: any) => {
        const oIdx = stageOrder.indexOf(o.stage)
        return oIdx >= stageIdx && o.stage !== 'lost'
      })
      return {
        stage,
        count: reached.length,
        value: reached.reduce((s: number, o: any) => s + (o.value || 0), 0),
      }
    })

    // Source attribution
    const bySource: Record<string, { count: number; value: number; factored: number; won: number }> = {}
    ;(opps || []).forEach((o: any) => {
      const src = o.source || 'Unknown'
      if (!bySource[src]) bySource[src] = { count: 0, value: 0, factored: 0, won: 0 }
      bySource[src].count++
      bySource[src].value += o.value || 0
      bySource[src].factored += (o.value || 0) * (o.probability || 0) / 100
      if (o.stage === 'paid') bySource[src].won++
    })

    // Geography: extract state from name/notes heuristics
    const byState: Record<string, { count: number; value: number; won: number }> = {}
    const statePatterns: Record<string, RegExp> = {
      'IL': /\b(IL|Illinois|Chicago|Wheaton|DuPage|Naperville|Carol Stream|Bloomingdale|Mokena|Frankfort|Schiller|Lansing|Addison|Glen Ellyn|Saunemin|Aurora|Kaneland|McHenry|Harvard|Knoxville|Olympia|Momence)\b/i,
      'NJ': /\b(NJ|New Jersey|Lodi|Burlington)\b/i,
      'NY': /\b(NY|New York|Elmont|Cheektowaga|BHBL|Maplebrook)\b/i,
      'WI': /\b(WI|Wisconsin|Hamilton|Templeton|Antigo|Black River|Abbotsford|Alma Center|Medford|Ladysmith|Whitehall|Osseo)\b/i,
      'VA': /\b(VA|Virginia|Prince William|Pulaski|Waynesboro)\b/i,
      'PA': /\b(PA|Pennsylvania|Middletown|Tidioute)\b/i,
      'KY': /\b(KY|Kentucky|Henry County|Boone|New Haven)\b/i,
      'IN': /\b(IN|Indiana|North Adams|Putnam|Greencastle|Hendricks|Dubois|Vigo)\b/i,
      'MD': /\b(MD|Maryland|PGCPS|Allenwood)\b/i,
      'OH': /\b(OH|Ohio|Plymouth Shiloh)\b/i,
      'ME': /\b(ME|Maine|RSU)\b/i,
      'MT': /\b(MT|Montana|Yellowstone)\b/i,
      'AL': /\b(AL|Alabama|Leeds)\b/i,
      'LA': /\b(LA|Louisiana|Chanel)\b/i,
      'CO': /\b(CO|Colorado|Denver|DPS)\b/i,
      'TX': /\b(TX|Texas|Leander)\b/i,
    }

    ;(opps || []).forEach((o: any) => {
      const text = `${o.name || ''} ${o.notes || ''}`
      let matched = false
      for (const [state, pattern] of Object.entries(statePatterns)) {
        if (pattern.test(text)) {
          if (!byState[state]) byState[state] = { count: 0, value: 0, won: 0 }
          byState[state].count++
          byState[state].value += o.value || 0
          if (o.stage === 'paid') byState[state].won++
          matched = true
          break
        }
      }
      if (!matched) {
        if (!byState['Other']) byState['Other'] = { count: 0, value: 0, won: 0 }
        byState['Other'].count++
        byState['Other'].value += o.value || 0
        if (o.stage === 'paid') byState['Other'].won++
      }
    })

    // Owner / team performance
    // Map raw IDs or emails to display names
    const OWNER_NAMES: Record<string, string> = {
      'rae@teachersdeserveit.com': 'Rae',
      'jim@teachersdeserveit.com': 'Jim',
    }
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

    return NextResponse.json({
      pulse: {
        totalPipeline: Math.round(totalPipeline),
        factored: Math.round(factored),
        activeCount: active.length,
        avgDealSize: Math.round(avgDealSize),
        wonValue: Math.round(wonValue),
        wonCount: won.length,
        winRate,
      },
      funnel,
      bySource,
      byState,
      byOwner,
      byType,
      snapshots,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
