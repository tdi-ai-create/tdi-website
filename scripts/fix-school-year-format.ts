import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function main() {
  // Show before state
  const { data: before } = await supabase
    .from('sales_opportunities')
    .select('id, name, school_year')
    .eq('school_year', '2026-2027')

  console.log(`Found ${before?.length || 0} rows with school_year='2026-2027':`)
  before?.forEach((r: any) => console.log(`  ${r.name} (${r.id})`))

  // Update
  const { data: updated, error } = await supabase
    .from('sales_opportunities')
    .update({ school_year: '2026-27', updated_at: new Date().toISOString() })
    .eq('school_year', '2026-2027')
    .select('id, name, school_year')

  if (error) {
    console.error('ERROR:', error.message)
    process.exit(1)
  }

  console.log(`\nUpdated ${updated?.length || 0} rows:`)
  updated?.forEach((r: any) => console.log(`  ${r.name}: school_year now '${r.school_year}'`))
}

main()
