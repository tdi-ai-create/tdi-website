import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const userId = '5d627906-141c-4bd0-ae66-a141640a9c8e'
  const newEmail = 'holly@sciencewithdepth.com'

  // Step 1: Read current user to get existing metadata
  console.log('Step 1: Fetching current user...')
  const { data: current, error: fetchErr } = await supabase.auth.admin.getUserById(userId)
  if (fetchErr || !current.user) {
    console.error('Failed to fetch user:', fetchErr)
    process.exit(1)
  }
  console.log('Current user_metadata.email:', current.user.user_metadata?.email)
  console.log('Current identities[0].email:', (current.user.identities?.[0] as any)?.email)

  // Step 2: Update user_metadata (merges with existing)
  console.log('\nStep 2: Updating user_metadata.email...')
  const { data: metaResult, error: metaErr } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...current.user.user_metadata,
      email: newEmail,
      email_verified: true,
    },
  })
  if (metaErr) {
    console.error('user_metadata update failed:', metaErr)
    process.exit(1)
  }
  console.log('user_metadata updated. New value:', metaResult.user?.user_metadata?.email)

  // Step 3: Update identity record via raw SQL
  // The Supabase JS client can't directly update auth.identities,
  // so we output the SQL for manual execution in the Supabase SQL Editor.
  console.log('\nStep 3: Identity record update')
  console.log('The auth.identities table requires direct SQL access.')
  console.log('Run this in the Supabase SQL Editor:\n')
  console.log(`UPDATE auth.identities
SET
  identity_data = jsonb_set(identity_data, '{email}', '"${newEmail}"'),
  email = '${newEmail}',
  updated_at = NOW()
WHERE user_id = '${userId}'
  AND provider = 'email';`)

  // Step 4: Verify final state (metadata should be updated, identity will update after SQL)
  console.log('\n\nStep 4: Final verification (post-metadata update)...')
  const { data: final, error: finalErr } = await supabase.auth.admin.getUserById(userId)
  if (finalErr || !final.user) {
    console.error('Failed to fetch user:', finalErr)
    process.exit(1)
  }

  const u = final.user
  console.log('\n=== FINAL STATE ===')
  console.log('email:                          ', u.email)
  console.log('user_metadata.email:            ', u.user_metadata?.email)
  console.log('identities[0].email:            ', (u.identities?.[0] as any)?.email)
  console.log('identities[0].identity_data.email:', (u.identities?.[0] as any)?.identity_data?.email)
  console.log('\nNote: identities fields will update after you run the SQL above.')
}

main()
