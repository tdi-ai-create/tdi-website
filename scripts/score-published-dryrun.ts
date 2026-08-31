/**
 * Dry run for the Hub remediation queue.
 *
 * Scores every published Quick Win with the same scoreItem the API uses and
 * prints the lane split. Reads only. Run it before and after any remediation
 * batch, since the lane counts are the only trustworthy signal that work
 * actually landed.
 *
 *   npx tsx scripts/score-published-dryrun.ts
 *   npx tsx scripts/score-published-dryrun.ts --lane=pull
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { scoreItem, RUBRIC_VERSION, type Lane, type ScoredRow } from '../app/api/hub/content-sync/route'

config({ path: '.env.local' })

const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
if (!url || !key) {
  console.error('Learning Hub Supabase not configured. Need LEARNING_HUB_SUPABASE_URL and _SERVICE_KEY.')
  process.exit(1)
}

const laneArg = process.argv.find(a => a.startsWith('--lane='))?.split('=')[1] as Lane | undefined

async function main() {
  const supabase = createClient(url!, key!, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  const scored = (data || []).map(qw => ({ qw, ...scoreItem(qw as ScoredRow) }))

  const counts: Record<string, number> = {}
  const defectTally: Record<string, number> = {}
  for (const s of scored) {
    counts[s.lane] = (counts[s.lane] || 0) + 1
    for (const d of s.defects) {
      const bucket = d.split(':')[0]
      defectTally[bucket] = (defectTally[bucket] || 0) + 1
    }
  }

  console.log(`Rubric ${RUBRIC_VERSION}, ${scored.length} published items\n`)
  console.log('Lane split')
  for (const lane of ['pull', 'replace', 'stamp', 'clean'] as Lane[]) {
    console.log(`  ${lane.padEnd(8)} ${String(counts[lane] || 0).padStart(4)}`)
  }

  console.log('\nDefects by type')
  for (const [d, n] of Object.entries(defectTally).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${d}`)
  }

  console.log(
    '\nThe stamp lane means no MECHANICAL defect, not that the content is good.\n' +
    'No machine can tell whether a download equips a teacher or just explains at\n' +
    'them, so items move from stamp to replace when QA actually reads them.\n' +
    'Expect this split to shift as the queue drains. That is the process working.',
  )

  if (laneArg) {
    console.log(`\nItems in lane "${laneArg}"`)
    for (const s of scored.filter(x => x.lane === laneArg)) {
      console.log(`  ${s.qw.slug}\n      ${s.defects.join('\n      ')}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
