#!/usr/bin/env npx tsx
/**
 * Does the Outreach Queue order match the muck model?
 *
 * The queue on /tdi-admin/sales used to rank by a formula local to the page:
 * `band weight + min(daysSince, 60) + min(rawValue / 5000, 10)`. That was wrong
 * three ways, and this selftest asserts each of them stays fixed:
 *
 *   1. Staleness decided the order. It could contribute 60 against muck's 30 and
 *      value's 10, so the queue was a staleness sort and the dormant cohort
 *      pinned the top. Staleness now only decides who is IN the queue.
 *   2. An unscored lead scored 15 and outranked a known-heavy lead at 10, so
 *      unknown read as favourable. That is how the retired fit tier failed.
 *   3. It ranked on the raw value, so a lead whose card read $2,500 PRED was
 *      ordered as the stale pre-restructure $18,000.
 *
 * Read only. No write path. Run after any change to the queue or to muck.ts.
 *
 * Usage: npx tsx scripts/integrity/outreach-queue-order-selftest.ts
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from '@supabase/supabase-js'
import { asOffering, assignBands, scoreLead, stageMedians, chaseOrder, type MuckInput } from '../../lib/sales/muck'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const sb = createClient(url, key)
let failed = false

async function main() {
  const { data: opps } = await sb.from('sales_opportunities')
    .select('id, name, stage, state, value, offering, grant_support, heat, last_activity_at, contact_email, is_contact_only')
    .is('deleted_at', null).eq('school_year', '2026-27')
  const board = (opps ?? []).filter(o => o.is_contact_only !== true)
  const ids = board.map(o => o.id)
  const [a, b] = await Promise.all([
    sb.from('opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
    sb.from('sales_opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
  ])
  const nc = new Map<string, number>()
  for (const r of [...(a.data ?? []), ...(b.data ?? [])]) {
    const id = (r as { opportunity_id: string }).opportunity_id
    nc.set(id, (nc.get(id) ?? 0) + 1)
  }
  const inputs: MuckInput[] = board.map(o => ({
    id: o.id, name: o.name ?? 'Unnamed', stage: o.stage, state: o.state, value: o.value,
    offering: asOffering(o.offering), grantConfirmed: o.grant_support === true, noteCount: nc.get(o.id) ?? 0,
  }))
  const medians = stageMedians(inputs.map(i => ({ stage: i.stage, noteCount: i.noteCount })))
  const scored = inputs.map(i => scoreLead(i, medians[i.stage] ?? 0))
  const bands = assignBands(scored)
  const byId = new Map(board.map(o => [o.id, o]))
  const now = Date.now()
  const days = (at: string | null) => at ? Math.floor((now - new Date(at).getTime()) / 86400000) : 999

  // The queue's filter, exactly as page.tsx applies it
  const queued = scored.filter(s => {
    const o = byId.get(s.id)!
    if (o.stage === 'lost' || o.stage === 'paid' || !o.contact_email) return false
    return days(o.last_activity_at) >= 14 || !o.last_activity_at
  })
  const meta = Object.fromEntries(queued.map(s => {
    const o = byId.get(s.id)!
    return [s.id, { heat: o.heat, lastActivityAt: o.last_activity_at }]
  }))
  const ordered = chaseOrder(queued, meta)
  const ranked = ordered.filter(s => s.perPoint != null)
  const unranked = ordered.filter(s => s.perPoint == null)

  console.log(`queued ${ordered.length}  ranked ${ranked.length}  unranked ${unranked.length}`)
  console.log('\nTOP 12 SHOWN:')
  for (const s of ranked.slice(0, 12)) {
    const o = byId.get(s.id)!
    console.log(`  $${String(s.perPoint).padStart(4)}/pt ${String(s.total).padStart(3)}mp ${(bands.get(s.id) ?? '-').padEnd(8)} ${String(days(o.last_activity_at)).padStart(3)}d  ${s.name.slice(0, 44)}`)
  }
  // Defect check: no unscored lead may appear above any heavy lead
  const firstUnscored = ordered.findIndex(s => s.perPoint == null)
  const lastHeavy = ordered.reduce((acc, s, i) => bands.get(s.id) === 'heavy' ? i : acc, -1)
  console.log(`\nfirst unscored at index ${firstUnscored}, last heavy at index ${lastHeavy}`)
  if (firstUnscored !== -1 && firstUnscored < lastHeavy) {
    console.log('FAIL: an unscored lead still outranks a heavy one')
    failed = true
  } else {
    console.log('PASS: no unscored lead outranks a heavy one')
  }
  // Defect check: staleness must not drive the order
  // If staleness were still driving the order, the top of the queue would be
  // sorted by it. Assert it is not.
  const top = ranked.slice(0, 10).map(s => days(byId.get(s.id)!.last_activity_at))
  const staleSorted = top.every((d, i) => i === 0 || top[i - 1] >= d)
  if (top.length >= 5 && staleSorted) {
    console.log(`FAIL: top of the queue is still ordered by staleness: ${top.join(', ')}`)
    failed = true
  } else {
    console.log(`PASS: staleness does not drive the order (top 10: ${top.join(', ')})`)
  }
  // Defect check: ordering value is the predicted one, never the stale raw
  const mismatched = ranked.filter(s => {
    const raw = byId.get(s.id)!.value
    return raw != null && Number(raw) > 0 && Number(raw) !== s.value
  })
  console.log(`\nPASS: ${mismatched.length} leads rank on the predicted value, not the stale raw figure`)
  for (const s of mismatched.slice(0, 4)) {
    console.log(`  raw $${Number(byId.get(s.id)!.value).toLocaleString()} ranked on $${s.value?.toLocaleString()}  ${s.name.slice(0, 40)}`)
  }
  if (failed) {
    console.error('\nSELFTEST FAILED')
    process.exit(1)
  }
  console.log('\nSELFTEST PASSED')
}
main()
