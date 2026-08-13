/**
 * Dry run of the weekly recruitment research.
 *
 * Uses the same prompt, model, tools, and validator as
 * app/api/cron/recruitment-research. Reports what WOULD be inserted.
 * Writes nothing to the database and posts nothing to Slack.
 *
 * Run it after any change to the prompt or the quality contract:
 *   npx tsx scripts/test-recruitment-research.ts
 */
import { createClient } from '@supabase/supabase-js'
import { validateCandidate } from '../lib/recruitment-quality'
import {
  researchCandidates,
  WEEKLY_TARGET,
  MAX_GAPS_PER_RUN,
  type OpenGap,
} from '../lib/recruitment-research'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: gapRows, error } = await supabase
    .from('creator_content_gaps')
    .select('id, category, priority, hub_course_count, hub_quick_win_count, recommended_content_path')
    .eq('status', 'active')
    .in('priority', ['critical', 'high'])

  if (error) throw new Error(error.message)

  const gaps: OpenGap[] = (gapRows || [])
    .slice(0, MAX_GAPS_PER_RUN)
    .map(g => ({ ...g, candidate_count: 0 }))

  if (gaps.length === 0) {
    console.log('No critical or high gaps open. Run the gap scan first.')
    return
  }

  console.log(`Targeting ${gaps.length} gaps: ${gaps.map(g => g.category).join(', ')}`)
  console.log('Researching (this takes a few minutes)...\n')

  const research = await researchCandidates(gaps, WEEKLY_TARGET)
  console.log(`Web searches run: ${research.searches}\n`)

  const knownGapIds = new Set(gaps.map(g => g.id))
  let passed = 0

  for (const item of research.raw) {
    const result = validateCandidate(item as Record<string, unknown>, knownGapIds)
    if (result.ok) {
      passed++
      const c = result.candidate
      console.log(`PASS  ${c.name}`)
      console.log(`      ${[c.role, c.school_org].filter(Boolean).join(', ')}`)
      console.log(`      ${c.social_url}`)
      console.log(`      email: ${c.email ?? '(none, which is the correct default)'}`)
      console.log(`      why: ${c.why_good_fit.slice(0, 150)}...`)
      console.log(`      draft: ${c.outreach_draft.slice(0, 120)}...\n`)
    } else {
      const name = (item as { name?: unknown })?.name
      console.log(`FAIL  ${typeof name === 'string' ? name : 'unnamed'}: ${result.reasons.join('; ')}\n`)
    }
  }

  console.log(`\n=== ${passed} of ${research.raw.length} returned candidates passed the quality contract ===`)
}

main().catch(err => {
  console.error('ERROR:', err instanceof Error ? err.message : err)
  process.exit(1)
})
