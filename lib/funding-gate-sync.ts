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
    // A due date is what makes these items real.
    //
    // They were created without one, and the follow-up cron skips anything with
    // no due date on the first line of its loop. So every gate gap ever created
    // was inert: four of them existed and not one produced a single reminder.
    // This module's own comment says it exists so "the school gets told", and it
    // could not tell them.
    //
    // Safe to wire up now, and it was not before. Until today an item with a due
    // date meant automated email straight to a principal, so giving these dates
    // would have turned four silent rows into client mail overnight. Automation
    // now writes a draft for Bella instead of sending, so a due date means she
    // gets a prepared message to review, which is what this was always meant to
    // produce.
    //
    // Seven days: a gate gap blocks every piece of work on the pursuit, so it
    // cannot sit indefinitely, but it is also usually a signature or a name and
    // not worth chasing the same week.
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    const due = dueDate.toISOString().split('T')[0]

    await supabase.from('funding_action_items').insert(
      toCreate.map((g, i) => ({
        pursuit_id: pursuitId,
        owner_type: 'client',
        title: g.title,
        client_label: g.clientLabel,
        description: g.description,
        status: 'pending',
        due_date: due,
        category: 'gate',
        // 'small' is not a size the follow-up engine recognises. LEAD_WINDOWS
        // defines light, standard and heavy, so 'small' silently fell through
        // to standard. Another mismatch that changed behaviour without telling
        // anyone.
        action_size: 'light',
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
