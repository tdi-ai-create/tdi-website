import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('=== Admin Access Diagnostic ===\n')

  // 1. Check tdi_team_members (the actual table used by the admin portal)
  console.log('1. tdi_team_members for rae@teachersdeserveit.com:')
  const { data: teamMembers, error: tmErr } = await supabase
    .from('tdi_team_members')
    .select('id, user_id, email, display_name, role, is_active, permissions')
    .ilike('email', 'rae@teachersdeserveit.com')
  if (tmErr) console.log('   ERROR:', tmErr.message)
  else if (!teamMembers?.length) console.log('   NOT FOUND')
  else teamMembers.forEach(m => console.log('  ', JSON.stringify(m, null, 2)))

  // 2. Check admin_users (NOT used by admin portal, but was manually edited)
  console.log('\n2. admin_users for rae@teachersdeserveit.com:')
  const { data: adminUsers, error: auErr } = await supabase
    .from('admin_users')
    .select('id, email, role, is_active, portal_access')
    .ilike('email', 'rae@teachersdeserveit.com')
  if (auErr) console.log('   ERROR:', auErr.message)
  else if (!adminUsers?.length) console.log('   NOT FOUND')
  else adminUsers.forEach(a => console.log('  ', JSON.stringify(a, null, 2)))

  // 3. Check auth.users
  console.log('\n3. auth.users for rae@teachersdeserveit.com:')
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers()
  if (authErr) console.log('   ERROR:', authErr.message)
  else {
    const raeUser = authData?.users?.find(u => u.email?.toLowerCase() === 'rae@teachersdeserveit.com')
    if (!raeUser) console.log('   NOT FOUND')
    else console.log('  ', JSON.stringify({
      id: raeUser.id,
      email: raeUser.email,
      created_at: raeUser.created_at,
      last_sign_in_at: raeUser.last_sign_in_at,
    }, null, 2))
  }

  // 4. Check ALL tdi_team_members to see what user_id values look like
  console.log('\n4. All active tdi_team_members (user_id + email):')
  const { data: allMembers } = await supabase
    .from('tdi_team_members')
    .select('id, user_id, email, role, is_active')
    .eq('is_active', true)
  allMembers?.forEach(m => console.log(`   ${m.email} | user_id=${m.user_id} | role=${m.role} | active=${m.is_active}`))

  console.log('\n=== Diagnostic complete ===')
}

main()
