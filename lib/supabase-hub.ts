/**
 * Supabase client for the LEARNING HUB project.
 *
 * The Learning Hub and Creator Portal are separate Supabase projects with
 * separate user tables. This file provides the client for Hub pages only.
 *
 * - Hub pages (app/hub/*, lib/hub/*, components/hub/*) import from HERE.
 * - Creator Portal pages must NEVER import from this file — use @/lib/supabase instead.
 *
 * History: TEA-4629 originally made lib/supabase.ts prefer the Hub env vars globally,
 * which broke Creator Portal auth. This file was created to properly separate the two.
 *
 * Env vars:
 *   NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
 *   NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let hubInstance: SupabaseClient | null = null;

export function getHubSupabase(): SupabaseClient {
  if (hubInstance) {
    return hubInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Learning Hub Supabase environment variables are not configured. ' +
      'Set NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL and NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY.'
    );
  }

  hubInstance = createClient(supabaseUrl, supabaseAnonKey);
  return hubInstance;
}

// Convenience proxy matching the pattern in lib/supabase.ts
export const hubSupabase = {
  get auth() {
    return getHubSupabase().auth;
  },
  from(table: string) {
    return getHubSupabase().from(table);
  },
};
