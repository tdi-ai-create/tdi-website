import { computeGateGaps, ALL_GATE_TITLES, type GateGap } from './funding-gate-gaps'

/**
 * Keeps client action items in step with the gate.
 *
 * Creates one pending item per open gap, and closes items whose gap has since
 * been satisfied. Safe to run repeatedly — it reconciles rather than appends,
 * so the daily cron can call it for every pursuit without piling up duplicates.
 *
 * Deliberately does not send anything. Bella reviews and sends, per the rule
 * that nothing reaches a school without a person deciding to send it.
 */
export async function syncGateActionItems(
  supabase: any,
  pursuitId: string,
  gate: Record<string, any> | null | undefined,
): Promise<{ created: number; resolved: number; gaps: GateGap[] }> {
  const gaps = computeGateGaps(gate)
  const openTitles = new Set(gaps.map(g => g.title))

  // Every gate-owned item this pursuit currently has
  const { data: existing } = await supabase
    .from('funding_action_items')
    .select('id, title, status')
    .eq('pursuit_id', pursuitId)
    .in('title', ALL_GATE_TITLES)

  const rows = (existing ?? []) as { id: string; title: string; status: string }[]
  const pendingByTitle = new Map<string, string>()
  for (const r of rows) {
    if (r.status === 'pending' || r.status === 'in_progress') pendingByTitle.set(r.title, r.id)
  }

  // Create anything missing
  const toCreate = gaps.filter(g => !pendingByTitle.has(g.title))
  if (toCreate.length > 0) {
    await supabase.from('funding_action_items').insert(
      toCreate.map((g, i) => ({
        pursuit_id: pursuitId,
        owner_type: 'client',
        title: g.title,
        client_label: g.clientLabel,
        description: g.description,
        status: 'pending',
        category: 'gate',
        action_size: 'small',
        sort_order: i,
      }))
    )
  }

  // Close anything the school has since taken care of
  const toResolve = rows.filter(
    r => (r.status === 'pending' || r.status === 'in_progress') && !openTitles.has(r.title)
  )
  if (toResolve.length > 0) {
    await supabase
      .from('funding_action_items')
      .update({
        status: 'done',
        completed_at: new Date().toISOString(),
        completed_by: 'system',
        updated_at: new Date().toISOString(),
      })
      .in('id', toResolve.map(r => r.id))
  }

  return { created: toCreate.length, resolved: toResolve.length, gaps }
}
