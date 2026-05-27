/**
 * Server-side Supabase client for the LEARNING HUB project.
 *
 * Used by Hub API routes (app/api/hub/*) that need cookie-based auth
 * against the Learning Hub Supabase project.
 *
 * Creator Portal server routes must NEVER import from this file —
 * use @/lib/supabase-server instead.
 *
 * See lib/supabase-hub.ts for the client-side equivalent.
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createHubServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Learning Hub Supabase environment variables are not configured. ' +
      'Set NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL and NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY.'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll fails in Server Components (read-only context) — safe to ignore
          }
        },
      },
    }
  );
}
