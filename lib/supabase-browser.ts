/**
 * Browser-side Supabase client that stores the session in COOKIES
 * (via @supabase/ssr) instead of localStorage.
 *
 * Use this for admin auth flows (login, session check) so that
 * server-side routes can read the session via requireAdminAuth().
 *
 * For data queries on the client, getSupabase() (localStorage) is fine.
 * This client is ONLY needed where the session must be visible server-side.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let instance: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (instance) return instance

  instance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return instance
}
