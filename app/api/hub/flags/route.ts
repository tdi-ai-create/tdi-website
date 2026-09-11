import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * The handful of hub_config flags the browser is allowed to know about.
 *
 * hub_config has row level security on and no policies, so the anon key cannot
 * read it at all. A client-side flag read therefore always comes back empty,
 * and a feature gated on it could never be switched on no matter what the row
 * said. That is the mirror of a check that cannot fail: a switch that cannot
 * succeed.
 *
 * So the flags are read here with the service key and handed out through a
 * deliberate allowlist. Not the whole table: a config table accumulates keys
 * nobody meant to publish, and "return everything and filter on the client" is
 * how one of them eventually is.
 */

// Each entry needs a reason. If it is not safe on a public page, it is not here.
const PUBLIC_FLAGS = {
  // Whether a Spanish reader is served the Spanish PDF. Reveals nothing about
  // anyone and has to be readable before the page can act on it.
  spanish_downloads_enabled: false,
} as const

type PublicFlags = Record<keyof typeof PUBLIC_FLAGS, boolean>

export const revalidate = 60

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  const flags: PublicFlags = { ...PUBLIC_FLAGS }

  try {
    const supabase = db()
    const { data, error } = await supabase
      .from('hub_config')
      .select('key, value')
      .in('key', Object.keys(PUBLIC_FLAGS))

    // An error here means the reader gets the defaults above, which are off.
    // Failing closed is right for this one: the cost of wrongly serving English
    // is a teacher reading English, and the cost of wrongly serving Spanish is
    // an unreviewed document in front of her.
    if (error) {
      console.error('[hub/flags] could not read hub_config:', error.message)
      return NextResponse.json(flags)
    }

    for (const row of data || []) {
      if (row.key in flags) {
        flags[row.key as keyof PublicFlags] = row.value === 'true'
      }
    }
  } catch (err) {
    console.error('[hub/flags]', err instanceof Error ? err.message : err)
  }

  return NextResponse.json(flags)
}
