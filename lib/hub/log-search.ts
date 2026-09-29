import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Record what an educator typed into Hub search, and how many results came back.
 *
 * Nothing recorded search until now. Views were logged, downloads were logged
 * after 23 September, but the question "what did someone look for and not
 * find" had no answer at all, because the query was never written down. That
 * matters more than it sounds: the library carries around 300 uncontrolled
 * topic tags and matching is plain substring, so a search for a TA, a
 * classroom aide, or paraprofesional with one s returns nothing while the
 * tools sit right there.
 *
 * This ships before any synonym or spelling work on purpose. Without it there
 * is no way to show that work helped, and no way to see which words people use
 * that the library does not.
 *
 * Two uses, and the second is the valuable one:
 *   - measuring whether the zero result rate falls
 *   - reading the zero result list, which is a content backlog writing itself
 */

/** Which box the query was typed into. They behave differently and rank differently. */
export type SearchSource = 'browse' | 'global';

const MIN_QUERY_LENGTH = 2;

/** Guard against logging a whole essay if something ever pastes into the box. */
const MAX_QUERY_LENGTH = 200;

type LogSearchArgs = {
  supabase: SupabaseClient;
  /** Null for a signed out reader. Those are skipped rather than logged as anonymous. */
  userId: string | null | undefined;
  query: string;
  source: SearchSource;
  resultCount: number;
  /** Optional per type counts, only the global search knows these. */
  breakdown?: Record<string, number>;
};

/**
 * Fire and forget, but it still has to fire.
 *
 * A Supabase query builder is lazy. It is a thenable, and the request is only
 * sent when something calls `then` on it. The Quick Win download logger shipped
 * as `void supabase.from(...).insert(...)` and produced zero rows against 99
 * logged views for a fortnight, because `void` threw the builder away. So this
 * awaits, and the caller decides not to wait on it.
 *
 * The error is read rather than discarded. A failed search log must never
 * surface to the reader or interrupt a search, but silently swallowing it is
 * how five separate features in this codebase reported success while writing
 * nothing.
 */
export async function logHubSearch({
  supabase,
  userId,
  query,
  source,
  resultCount,
  breakdown,
}: LogSearchArgs): Promise<void> {
  if (!userId) return;

  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH || trimmed.length > MAX_QUERY_LENGTH) return;

  const { error } = await supabase.from('hub_activity_log').insert({
    user_id: userId,
    action: 'hub_searched',
    metadata: {
      // Kept as typed, because the misspelling is the point of the record.
      query: trimmed,
      // Lowercased for grouping, so Para and para are one row in a report.
      query_normalised: trimmed.toLowerCase(),
      source,
      result_count: resultCount,
      // Denormalised so a zero result report is one filter rather than a join.
      zero_results: resultCount === 0,
      ...(breakdown ? { breakdown } : {}),
      searched_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error('[hub-search-log] insert failed:', error.message);
  }
}
