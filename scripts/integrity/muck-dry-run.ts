#!/usr/bin/env npx tsx
/**
 * Score the live sales board with muck points and write nothing.
 *
 * This is the dry run for the muck model. It reads the board, computes every
 * dimension, assigns bands by rank and prints what the UI would show. It has
 * no write path at all, so it cannot change anything even by mistake.
 *
 * Usage:
 *   npx tsx scripts/integrity/muck-dry-run.ts
 *   npx tsx scripts/integrity/muck-dry-run.ts --full   (print every lead)
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js'
import {
  asOffering,
  assignBands,
  rollup,
  scoreLead,
  stageMedians,
  chaseOrder,
  type MuckInput,
} from '../../lib/sales/muck'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)
const full = process.argv.includes('--full')

function money(n: number | null): string {
  return n == null ? '-' : `$${n.toLocaleString('en-US')}`
}

async function main() {
  const { data: opps, error } = await supabase
    .from('sales_opportunities')
    .select('id, name, stage, state, value, offering, grant_support, heat, last_activity_at, school_year, is_contact_only, deleted_at')
    .is('deleted_at', null)
    .eq('school_year', '2026-27')

  if (error) throw new Error(`Reading the board failed: ${error.message}`)

  const board = (opps ?? []).filter((o) => o.is_contact_only !== true)
  if (board.length === 0) throw new Error('No leads returned. Refusing to report on an empty board.')

  const ids = board.map((o) => o.id)

  // Notes live in two tables. Counting only one of them would understate drag
  // on exactly the leads that have the most history.
  const [a, b] = await Promise.all([
    supabase.from('opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
    supabase.from('sales_opportunity_notes').select('opportunity_id').in('opportunity_id', ids),
  ])
  if (a.error) throw new Error(`Reading opportunity_notes failed: ${a.error.message}`)
  if (b.error) throw new Error(`Reading sales_opportunity_notes failed: ${b.error.message}`)

  const noteCounts = new Map<string, number>()
  for (const row of [...(a.data ?? []), ...(b.data ?? [])]) {
    const id = (row as { opportunity_id: string }).opportunity_id
    noteCounts.set(id, (noteCounts.get(id) ?? 0) + 1)
  }

  const inputs: MuckInput[] = board.map((o) => ({
    id: o.id,
    name: o.name ?? 'Unnamed',
    stage: o.stage,
    state: o.state,
    value: o.value,
    offering: asOffering(o.offering),
    grantConfirmed: o.grant_support === true,
    noteCount: noteCounts.get(o.id) ?? 0,
  }))

  const medians = stageMedians(inputs.map((i) => ({ stage: i.stage, noteCount: i.noteCount })))
  const scores = inputs.map((i) => scoreLead(i, medians[i.stage] ?? 0))
  const bands = assignBands(scores)
  const stages = Object.fromEntries(inputs.map((i) => [i.id, i.stage]))
  const totals = rollup(scores, stages, bands)

  console.log('\nMUCK DRY RUN. Nothing was written.\n')
  console.log(`Board            ${board.length} leads, 2026-27, not deleted, not contact only`)
  console.log(`Scored           ${totals.scored}`)
  console.log(`Unscored         ${totals.unscored}  (no offering recorded, so the largest dimension is unknown)`)
  console.log(`Total muck       ${totals.totalMuck}`)
  console.log(`Factored muck    ${totals.factoredMuck}`)
  console.log(`  lands on Rae   ${totals.rae}`)
  console.log(`  lands on Bella ${totals.bella}`)
  console.log(`Heavy band       ${totals.heavy}`)

  console.log('\nStage medians used for drag:')
  for (const [stage, m] of Object.entries(medians).sort()) {
    console.log(`  ${stage.padEnd(16)} ${m}`)
  }

  const scored = scores.filter((s) => s.total != null)

  console.log('\nDimension coverage across scored leads:')
  console.log(`  delivery > 0   ${scored.filter((s) => s.breakdown.delivery > 0).length}`)
  console.log(`  grant > 0      ${scored.filter((s) => s.breakdown.grant > 0).length}`)
  console.log(`  drag > 0       ${scored.filter((s) => s.breakdown.drag > 0).length}`)
  console.log(`  travel > 0     ${scored.filter((s) => s.breakdown.travel > 0).length}`)
  console.log(`  value is a prediction, not a contract     ${scored.filter((s) => s.valuePredicted).length}`)

  const withRatio = scored.filter((s) => s.perPoint != null)
  console.log(`\nChase order is computable for ${withRatio.length} of ${board.length} leads.`)

  const meta = Object.fromEntries(
    board.map((o) => [o.id, { heat: o.heat as string | null, lastActivityAt: o.last_activity_at as string | null }])
  )
  const ordered = chaseOrder(withRatio, meta)
  const show = full ? ordered : ordered.slice(0, 12)
  console.log(`\nTop of the chase order${full ? ' (all)' : ' (first 12)'}, by value per muck point:\n`)
  console.log(
    `  ${'LEAD'.padEnd(34)} ${'BAND'.padEnd(9)} ${'MUCK'.padStart(5)} ${'VALUE'.padStart(9)} ${'PER PT'.padStart(7)} ${'HEAT'.padEnd(7)} D/G/R/T`
  )
  for (const s of show) {
    const bd = s.breakdown
    console.log(
      `  ${s.name.slice(0, 33).padEnd(34)} ${(bands.get(s.id) ?? '-').padEnd(9)} ${String(s.total).padStart(5)} ${money(s.value).padStart(9)} ${String(s.perPoint).padStart(7)} ${(meta[s.id]?.heat ?? '-').padEnd(7)} ${bd.delivery}/${bd.grant}/${bd.drag}/${bd.travel}`
    )
  }

  const heaviest = [...scored].sort((x, y) => (y.total as number) - (x.total as number)).slice(0, 8)
  console.log('\nHeaviest leads on the board:\n')
  for (const s of heaviest) {
    const bd = s.breakdown
    console.log(
      `  ${s.name.slice(0, 33).padEnd(34)} ${(bands.get(s.id) ?? '-').padEnd(9)} ${String(s.total).padStart(5)} ${money(s.value).padStart(9)}  D${bd.delivery} G${bd.grant} R${bd.drag} T${bd.travel}  Rae ${s.rae} / Bella ${s.bella}`
    )
  }

  console.log('\nNothing was written. This script has no write path.\n')
}

main().catch((e) => {
  console.error('\nDry run failed:', e.message, '\n')
  process.exit(1)
})
