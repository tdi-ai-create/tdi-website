import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

function getHubServiceClient() {
  const url = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_ROLE_KEY || process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Hub Supabase env vars not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

interface SubstackSubscriber {
  email: string
  name: string
  type: string
}

interface ImportResults {
  total_processed: number
  new_profiles: number
  new_memberships: number
  upgraded: number
  already_correct: number
  skipped_protected: number
  skipped_author_comp: number
  errors: number
  error_details: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const subscribers: SubstackSubscriber[] = body.subscribers

    if (!subscribers || !Array.isArray(subscribers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Expected { subscribers: [...] }' },
        { status: 400 }
      )
    }

    const supabase = getHubServiceClient()

    const results: ImportResults = {
      total_processed: 0,
      new_profiles: 0,
      new_memberships: 0,
      upgraded: 0,
      already_correct: 0,
      skipped_protected: 0,
      skipped_author_comp: 0,
      errors: 0,
      error_details: [],
    }

    // Filter and categorize subscribers
    const toProcess: { email: string; name: string; isPaid: boolean }[] = []

    for (const sub of subscribers) {
      const email = sub.email?.trim().toLowerCase()
      if (!email) continue

      results.total_processed++

      if (email === 'rae@teachersdeserveit.com') {
        results.skipped_author_comp++
        continue
      }

      const subType = sub.type?.trim()
      if (subType === 'Author' || subType === 'Comp') {
        results.skipped_author_comp++
        continue
      }

      const isPaid = subType === 'Yearly Subscriber' || subType === 'Monthly Subscriber' || subType === 'Founding Member'
      toProcess.push({ email, name: sub.name || '', isPaid })
    }

    // Batch lookup existing profiles (all at once via IN query, chunked to avoid limits)
    const LOOKUP_BATCH = 500
    const existingProfileMap = new Map<string, { id: string; tier?: string; source?: string }>()

    for (let i = 0; i < toProcess.length; i += LOOKUP_BATCH) {
      const emailBatch = toProcess.slice(i, i + LOOKUP_BATCH).map(s => s.email)

      const { data: profiles } = await supabase
        .from('hub_profiles')
        .select('id, email')
        .in('email', emailBatch)

      if (profiles) {
        // Also get memberships for these profiles
        const profileIds = profiles.map(p => p.id)
        const { data: memberships } = await supabase
          .from('hub_memberships')
          .select('user_id, tier, source')
          .in('user_id', profileIds)

        const membershipMap = new Map(
          (memberships || []).map(m => [m.user_id, { tier: m.tier, source: m.source }])
        )

        for (const p of profiles) {
          const membership = membershipMap.get(p.id)
          existingProfileMap.set(p.email.toLowerCase(), {
            id: p.id,
            tier: membership?.tier,
            source: membership?.source,
          })
        }
      }
    }

    // Separate into: need new accounts vs need membership updates
    const needNewAccounts: { email: string; name: string; isPaid: boolean }[] = []
    const needMembershipOnly: { profileId: string; email: string; isPaid: boolean }[] = []

    for (const sub of toProcess) {
      const existing = existingProfileMap.get(sub.email)

      if (!existing) {
        needNewAccounts.push(sub)
      } else if (!existing.tier) {
        // Has profile but no membership
        needMembershipOnly.push({ profileId: existing.id, email: sub.email, isPaid: sub.isPaid })
      } else if (existing.tier === 'all_access' && existing.source === 'district_partner') {
        results.skipped_protected++
      } else if (existing.tier === 'free' && sub.isPaid) {
        // Upgrade free to essentials
        const { error: updateError } = await supabase
          .from('hub_memberships')
          .update({ tier: 'essentials', source: 'substack_paid', updated_at: new Date().toISOString() })
          .eq('user_id', existing.id)

        if (updateError) {
          results.errors++
          if (results.error_details.length < 50) results.error_details.push(`${sub.email}: upgrade failed`)
        } else {
          results.upgraded++
        }
      } else {
        results.already_correct++
      }
    }

    // Create memberships for profiles that exist but have no membership
    for (let i = 0; i < needMembershipOnly.length; i += 50) {
      const batch = needMembershipOnly.slice(i, i + 50)
      const inserts = batch.map(s => ({
        user_id: s.profileId,
        tier: s.isPaid ? 'essentials' : 'free',
        source: s.isPaid ? 'substack_paid' : 'substack_free',
        status: 'active',
      }))

      const { error } = await supabase.from('hub_memberships').insert(inserts)
      if (error) {
        results.errors += batch.length
        if (results.error_details.length < 50) results.error_details.push(`Membership batch failed: ${error.message}`)
      } else {
        results.new_memberships += batch.length
      }
    }

    // Bulk create new accounts using SQL CTE (much faster than individual createUser calls)
    const SQL_BATCH = 200
    for (let i = 0; i < needNewAccounts.length; i += SQL_BATCH) {
      const batch = needNewAccounts.slice(i, i + SQL_BATCH)

      try {
        const values = batch.map(s => {
          const safeEmail = s.email.replace(/'/g, "''")
          const safeName = (s.name || '').replace(/'/g, "''")
          const tier = s.isPaid ? 'essentials' : 'free'
          const source = s.isPaid ? 'substack_paid' : 'substack_free'
          return `(gen_random_uuid(), '${safeEmail}', '${safeName}', '${tier}', '${source}')`
        }).join(',\n')

        const sql = `
          WITH input_data(uid, email, display_name, tier, source) AS (
            SELECT * FROM (VALUES ${values}) AS t(uid, email, display_name, tier, source)
          ),
          new_auth AS (
            INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, instance_id, aud, role, raw_app_meta_data, raw_user_meta_data)
            SELECT uid::uuid, email, NOW(), NOW(), NOW(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}'
            FROM input_data
            WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = input_data.email)
            RETURNING id, email
          ),
          new_profiles AS (
            INSERT INTO hub_profiles (id, email, display_name, created_at, updated_at)
            SELECT na.id, na.email, id2.display_name, NOW(), NOW()
            FROM new_auth na
            JOIN input_data id2 ON id2.email = na.email
            RETURNING id, email
          )
          INSERT INTO hub_memberships (id, user_id, tier, source, status, created_at, updated_at)
          SELECT gen_random_uuid(), np.id, id3.tier, id3.source, 'active', NOW(), NOW()
          FROM new_profiles np
          JOIN input_data id3 ON id3.email = np.email
        `

        const { error: sqlError } = await supabase.rpc('exec_sql' as any, { query: sql })

        if (sqlError) {
          // Fallback: try direct SQL via the REST endpoint
          // The rpc might not exist, so try the raw approach
          const { error: rawError } = await supabase.from('hub_profiles' as any).select('id').limit(0)

          // If rpc doesn't work, fall back to individual creates
          if (sqlError.message?.includes('function') || sqlError.message?.includes('does not exist')) {
            // RPC not available, use individual auth.admin.createUser
            for (const sub of batch) {
              try {
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                  email: sub.email,
                  email_confirm: true,
                  user_metadata: { display_name: sub.name || '' },
                })

                if (authError) {
                  if (authError.message?.includes('already') || authError.message?.includes('duplicate')) {
                    results.already_correct++
                  } else {
                    results.errors++
                    if (results.error_details.length < 50) results.error_details.push(`${sub.email}: ${authError.message}`)
                  }
                  continue
                }

                const userId = authData.user.id
                await supabase.from('hub_profiles').insert({ id: userId, email: sub.email, display_name: sub.name || null })
                await supabase.from('hub_memberships').insert({
                  user_id: userId,
                  tier: sub.isPaid ? 'essentials' : 'free',
                  source: sub.isPaid ? 'substack_paid' : 'substack_free',
                  status: 'active',
                })
                results.new_profiles++
              } catch {
                results.errors++
              }
            }
          } else {
            results.errors += batch.length
            if (results.error_details.length < 50) results.error_details.push(`SQL batch failed: ${sqlError.message}`)
          }
        } else {
          results.new_profiles += batch.length
        }
      } catch (err) {
        results.errors += batch.length
        if (results.error_details.length < 50) {
          results.error_details.push(`Batch ${i / SQL_BATCH + 1} error: ${err instanceof Error ? err.message : 'Unknown'}`)
        }
      }
    }

    if (results.error_details.length > 50) {
      const total = results.error_details.length
      results.error_details = results.error_details.slice(0, 50)
      results.error_details.push(`... and ${total - 50} more errors`)
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
