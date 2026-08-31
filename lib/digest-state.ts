import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Stop a recurring digest repeating itself.
 *
 * The grant digest posted the same message on 28, 29 and 30 August, identical
 * apart from a day counter ticking down. The creator "waiting on TDI" post
 * named the same person for seventeen consecutive days. Neither produced any
 * action, because a channel that says the same thing every morning stops being
 * read by the second week.
 *
 * So: post when the content actually changes, and otherwise stay quiet. A
 * heartbeat every HEARTBEAT_DAYS keeps a long-unchanged digest from looking
 * broken, and carries how long it has been stuck, which is the part that is
 * genuinely new information.
 */

export const HEARTBEAT_DAYS = 7

export type DigestDecision = {
  post: boolean
  reason: 'changed' | 'first-run' | 'heartbeat' | 'unchanged'
  suppressedRuns: number
  daysSinceLastPost: number | null
}

function hash(content: string): string {
  // Day counters ("waiting 17 days", "75 days") change daily without the
  // situation changing, so they are normalised out before hashing. Otherwise
  // nothing would ever compare equal and this would never suppress anything.
  const normalised = content
    .replace(/\b\d+\s*(day|days|hour|hours|h)\b/gi, '#')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
  return createHash('sha256').update(normalised).digest('hex')
}

/**
 * Decide whether this digest should post. Read-only: call `recordDigestPost`
 * after a successful post so the next run can compare against it.
 */
export async function shouldPostDigest(
  supabase: SupabaseClient,
  key: string,
  content: string
): Promise<DigestDecision> {
  const contentHash = hash(content)

  const { data, error } = await supabase
    .from('digest_state')
    .select('content_hash, last_posted_at, suppressed_runs')
    .eq('key', key)
    .maybeSingle()

  // If the state table cannot be read, post. Being noisy beats going silent
  // over an infrastructure problem nobody would see.
  if (error) {
    console.error('[digest-state] read failed, posting anyway:', error.message)
    return { post: true, reason: 'first-run', suppressedRuns: 0, daysSinceLastPost: null }
  }

  if (!data) {
    return { post: true, reason: 'first-run', suppressedRuns: 0, daysSinceLastPost: null }
  }

  const days = Math.floor((Date.now() - new Date(data.last_posted_at).getTime()) / 864e5)

  if (data.content_hash !== contentHash) {
    return { post: true, reason: 'changed', suppressedRuns: data.suppressed_runs ?? 0, daysSinceLastPost: days }
  }
  if (days >= HEARTBEAT_DAYS) {
    return { post: true, reason: 'heartbeat', suppressedRuns: data.suppressed_runs ?? 0, daysSinceLastPost: days }
  }
  return { post: false, reason: 'unchanged', suppressedRuns: data.suppressed_runs ?? 0, daysSinceLastPost: days }
}

/** Record a successful post so tomorrow can compare against it. */
export async function recordDigestPost(
  supabase: SupabaseClient,
  key: string,
  content: string
): Promise<void> {
  const { error } = await supabase.from('digest_state').upsert(
    {
      key,
      content_hash: hash(content),
      last_content: content.slice(0, 8000),
      last_posted_at: new Date().toISOString(),
      suppressed_runs: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )
  if (error) console.error('[digest-state] write failed:', error.message)
}

/** Record that a run was skipped, so the heartbeat can say how long it has been. */
export async function recordDigestSuppressed(
  supabase: SupabaseClient,
  key: string,
  suppressedRuns: number
): Promise<void> {
  const { error } = await supabase
    .from('digest_state')
    .update({ suppressed_runs: suppressedRuns + 1, updated_at: new Date().toISOString() })
    .eq('key', key)
  if (error) console.error('[digest-state] suppress write failed:', error.message)
}

/**
 * A line for the heartbeat post explaining why it looks familiar. Without this
 * a weekly repeat reads as the bug we are fixing.
 */
export function heartbeatNote(days: number | null): string {
  if (days === null) return ''
  return `\n_Nothing here has changed in ${days} day${days === 1 ? '' : 's'}. Posting weekly so it is not forgotten._`
}
