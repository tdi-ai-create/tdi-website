import { createClient } from '@supabase/supabase-js'

// Dedicated READ-ONLY client for the Hub Supabase project.
// Separate from the creator-portal client used elsewhere in the app.
const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL
const hubServiceKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_ROLE_KEY

if (!hubUrl || !hubServiceKey) {
  console.warn('[Desi] Hub Supabase env vars not configured.')
}

export const hubClient =
  hubUrl && hubServiceKey
    ? createClient(hubUrl, hubServiceKey, {
        auth: { persistSession: false },
      })
    : null
