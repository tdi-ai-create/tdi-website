import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Process in batches of 50
    const BATCH_SIZE = 50
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      for (const subscriber of batch) {
        try {
          results.total_processed++

          const email = subscriber.email?.trim().toLowerCase()
          if (!email) continue

          // Skip Rae's email
          if (email === 'rae@teachersdeserveit.com') {
            results.skipped_author_comp++
            continue
          }

          // Skip Author and Comp types
          const subType = subscriber.type?.trim()
          if (subType === 'Author' || subType === 'Comp') {
            results.skipped_author_comp++
            continue
          }

          // Determine tier and source
          const isPaid = subType === 'Yearly Subscriber' || subType === 'Monthly Subscriber' || subType === 'Founding Member'
          const tier = isPaid ? 'essentials' : 'free'
          const source = isPaid ? 'substack_paid' : 'substack_free'

          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('hub_profiles')
            .select('id, email')
            .eq('email', email)
            .maybeSingle()

          if (!existingProfile) {
            // Create auth user via admin API
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: {
                display_name: subscriber.name || '',
              },
            })

            if (authError) {
              // If user already exists in auth but not in hub_profiles, try to get them
              if (authError.message?.includes('already been registered') || authError.message?.includes('duplicate')) {
                // Try to find the auth user by email
                const { data: listData } = await supabase.auth.admin.listUsers({
                  filter: `email.eq.${email}`,
                  page: 1,
                  perPage: 1,
                })
                const existingAuthUser = listData?.users?.find(u => u.email === email)

                if (existingAuthUser) {
                  // Create hub_profiles entry
                  const { error: profileError } = await supabase
                    .from('hub_profiles')
                    .insert({
                      id: existingAuthUser.id,
                      email,
                      display_name: subscriber.name || null,
                    })

                  if (profileError && !profileError.message?.includes('duplicate')) {
                    results.errors++
                    results.error_details.push(`${email}: profile create failed - ${profileError.message}`)
                    continue
                  }

                  // Create membership
                  const { error: membershipError } = await supabase
                    .from('hub_memberships')
                    .insert({
                      user_id: existingAuthUser.id,
                      tier,
                      source,
                      status: 'active',
                    })

                  if (membershipError && !membershipError.message?.includes('duplicate')) {
                    results.errors++
                    results.error_details.push(`${email}: membership create failed - ${membershipError.message}`)
                    continue
                  }

                  results.new_profiles++
                  continue
                }
              }

              results.errors++
              results.error_details.push(`${email}: auth create failed - ${authError.message}`)
              continue
            }

            const userId = authData.user.id

            // Create hub_profiles entry
            const { error: profileError } = await supabase
              .from('hub_profiles')
              .insert({
                id: userId,
                email,
                display_name: subscriber.name || null,
              })

            if (profileError) {
              results.errors++
              results.error_details.push(`${email}: profile create failed - ${profileError.message}`)
              continue
            }

            // Create hub_memberships entry
            const { error: membershipError } = await supabase
              .from('hub_memberships')
              .insert({
                user_id: userId,
                tier,
                source,
                status: 'active',
              })

            if (membershipError) {
              results.errors++
              results.error_details.push(`${email}: membership create failed - ${membershipError.message}`)
              continue
            }

            results.new_profiles++
          } else {
            // Profile exists - check membership
            const { data: existingMembership } = await supabase
              .from('hub_memberships')
              .select('id, tier, source, status')
              .eq('user_id', existingProfile.id)
              .maybeSingle()

            if (!existingMembership) {
              // No membership - create one
              const { error: membershipError } = await supabase
                .from('hub_memberships')
                .insert({
                  user_id: existingProfile.id,
                  tier,
                  source,
                  status: 'active',
                })

              if (membershipError) {
                results.errors++
                results.error_details.push(`${email}: membership create failed - ${membershipError.message}`)
                continue
              }

              results.new_memberships++
            } else if (existingMembership.tier === 'all_access' && existingMembership.source === 'district_partner') {
              // Protected - do not modify
              results.skipped_protected++
            } else if (existingMembership.tier === 'free' && isPaid) {
              // Upgrade from free to essentials
              const { error: updateError } = await supabase
                .from('hub_memberships')
                .update({
                  tier: 'essentials',
                  source: 'substack_paid',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingMembership.id)

              if (updateError) {
                results.errors++
                results.error_details.push(`${email}: upgrade failed - ${updateError.message}`)
                continue
              }

              results.upgraded++
            } else {
              results.already_correct++
            }
          }
        } catch (err: unknown) {
          results.errors++
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.error_details.push(`${subscriber.email}: ${message}`)
        }
      }
    }

    // Cap error_details to avoid massive responses
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
