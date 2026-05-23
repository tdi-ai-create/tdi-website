import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('=== Agreement State Audit ===\n')

  // 1. agreement_signed=true but agreement_signed_at IS NULL
  const { data: noTimestamp } = await supabase
    .from('creators')
    .select('id, name, email, agreement_signed, agreement_signed_at, agreement_signed_name, agreement_version')
    .eq('agreement_signed', true)
    .is('agreement_signed_at', null)
  console.log('1. Signed but missing agreement_signed_at:', noTimestamp?.length ?? 0)
  if (noTimestamp?.length) noTimestamp.forEach(c => console.log(`   - ${c.name} (${c.email}) id=${c.id}`))

  // 2. agreement_signed=true but agreement_signed_name IS NULL
  const { data: noName } = await supabase
    .from('creators')
    .select('id, name, email, agreement_signed, agreement_signed_name')
    .eq('agreement_signed', true)
    .is('agreement_signed_name', null)
  console.log('\n2. Signed but missing agreement_signed_name:', noName?.length ?? 0)
  if (noName?.length) noName.forEach(c => console.log(`   - ${c.name} (${c.email}) id=${c.id}`))

  // 3. Completed agreement_sign milestone but creators.agreement_signed=false
  const { data: milestoneCompletedButNotSigned } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, completed_at, creators!inner(name, email, agreement_signed)')
    .eq('milestone_id', 'agreement_sign')
    .eq('status', 'completed')
  const mismatched = (milestoneCompletedButNotSigned || []).filter(
    (cm: any) => !(cm.creators as any)?.agreement_signed
  )
  console.log('\n3. Milestone completed but agreement_signed=false:', mismatched.length)
  if (mismatched.length) mismatched.forEach((cm: any) => {
    const c = cm.creators as any
    console.log(`   - ${c?.name} (${c?.email}) creator_id=${cm.creator_id}`)
  })

  // 4. Completed agreement_sign milestone but missing completed_at
  const { data: noCompletedAt } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, completed_at, creators!inner(name, email)')
    .eq('milestone_id', 'agreement_sign')
    .eq('status', 'completed')
    .is('completed_at', null)
  console.log('\n4. agreement_sign milestone completed but completed_at=null:', noCompletedAt?.length ?? 0)
  if (noCompletedAt?.length) noCompletedAt.forEach((cm: any) => {
    const c = cm.creators as any
    console.log(`   - ${c?.name} (${c?.email}) creator_id=${cm.creator_id}`)
  })

  // 5. Summary of all signed creators
  const { data: allSigned } = await supabase
    .from('creators')
    .select('id, name, agreement_version')
    .eq('agreement_signed', true)
  console.log('\n5. Total signed creators:', allSigned?.length ?? 0)
  const versions: Record<string, number> = {}
  allSigned?.forEach(c => { versions[c.agreement_version || 'unknown'] = (versions[c.agreement_version || 'unknown'] || 0) + 1 })
  Object.entries(versions).forEach(([v, count]) => console.log(`   ${v}: ${count}`))

  console.log('\n=== Audit complete ===')
}

main()
