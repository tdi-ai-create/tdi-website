/**
 * Supabase client for the CREATOR PORTAL project.
 *
 * This is the main Supabase project — creators, milestones, admin, partners,
 * sales, and everything that is NOT the Learning Hub.
 *
 * - Hub pages must NEVER import from this file — use @/lib/supabase-hub instead.
 * - Creator Portal, TDI Admin, and Partner pages import from HERE.
 *
 * History: TEA-4629 temporarily made this file prefer Learning Hub env vars,
 * which broke Creator Portal auth. Reverted — Hub now has its own client.
 *
 * Env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Lazy-initialized Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  // Browser: cookie-backed client so the server (requireAdminAuth) can read
  // the same session. One session store (cookies), no localStorage.
  // Server: plain anon client (used by 3 Roosevelt dashboard routes).
  if (typeof window !== 'undefined') {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// For backwards compatibility - lazy getter
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
};

// Server-side Supabase client with service role (for admin operations)
export function getServiceSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
