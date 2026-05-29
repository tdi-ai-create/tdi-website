import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('=== Sales Render Bug Diagnostic ===\n')

  // Part 1: Check the three rows
  const targetIds = [
    '871a0290-be49-4fe8-89b1-3b2d1a29a837',
    'b7677c57-4ef5-4ed1-bbd9-6a499d92bf7e',
    '1d4e0fa6-1597-48a6-8cf5-d6bf22b9f553',
  ]

  console.log('PART 1: Root cause\n')
  const { data: targetRows } = await supabase
    .from('sales_opportunities')
    .select('id, name, stage, school_year, contract_year, deleted_at, is_contact_only')
    .in('id', targetIds)

  targetRows?.forEach((r: any) => {
    const derived = r.contract_year || r.school_year || '2026-27'
    const passes = derived === '2026-27'
    console.log(`  ${r.name}:`)
    console.log(`    contract_year=${r.contract_year}, school_year="${r.school_year}", derived="${derived}"`)
    console.log(`    passes schoolYear==='2026-27' filter: ${passes}`)
    console.log()
  })

  // Part 3: Scan for other invisible rows
  console.log('PART 3: Scope of impact\n')

  // All non-deleted rows
  const { data: allRows } = await supabase
    .from('sales_opportunities')
    .select('id, name, contact_name, stage, source, school_year, contract_year, district_id, partnership_status, assigned_to_email, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const total = allRows?.length || 0

  // Find rows that would fail the schoolYear === '2026-27' filter
  const wrongSchoolYear = (allRows || []).filter((r: any) => {
    const derived = r.contract_year || r.school_year || '2026-27'
    return derived !== '2026-27'
  })

  // Rows that would be excluded by isContactOnly
  const contactOnly = (allRows || []).filter((r: any) => r.is_contact_only)

  // Rows excluded by stage
  const excludedStage = (allRows || []).filter((r: any) => ['lost', 'paid'].includes(r.stage))

  console.log(`  Total non-deleted rows: ${total}`)
  console.log(`  Excluded by schoolYear mismatch: ${wrongSchoolYear.length}`)
  console.log()

  if (wrongSchoolYear.length > 0) {
    console.log('  Rows with wrong school_year format:')
    wrongSchoolYear.forEach((r: any) => {
      const derived = r.contract_year || r.school_year || '2026-27'
      console.log(`    ${r.name || r.contact_name || 'unnamed'} | stage=${r.stage} | school_year="${r.school_year}" contract_year="${r.contract_year}" derived="${derived}" | created=${r.created_at}`)
    })
  }

  // Also check for rows with null fields that MIGHT cause issues in the future
  const nullFields = (allRows || []).filter((r: any) =>
    r.district_id === null || r.partnership_status === null || r.assigned_to_email === null
  )
  console.log(`\n  Rows with null district_id/partnership_status/assigned_to_email: ${nullFields.length}`)

  const nullDistrict = nullFields.filter((r: any) => r.district_id === null).length
  const nullPartnership = nullFields.filter((r: any) => r.partnership_status === null).length
  const nullAssigned = nullFields.filter((r: any) => r.assigned_to_email === null).length
  console.log(`    - district_id NULL: ${nullDistrict}`)
  console.log(`    - partnership_status NULL: ${nullPartnership}`)
  console.log(`    - assigned_to_email NULL: ${nullAssigned}`)

  // Show the null-field rows
  if (nullFields.length > 0 && nullFields.length <= 20) {
    console.log('\n  Detail:')
    nullFields.forEach((r: any) => {
      const nulls = []
      if (r.district_id === null) nulls.push('district_id')
      if (r.partnership_status === null) nulls.push('partnership_status')
      if (r.assigned_to_email === null) nulls.push('assigned_to_email')
      console.log(`    ${r.name || r.contact_name || 'unnamed'} | stage=${r.stage} | nulls: ${nulls.join(', ')}`)
    })
  }

  console.log('\n=== Diagnostic complete ===')
}

main()
