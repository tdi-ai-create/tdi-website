import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The release valve for Hub content.
 *
 * Approved Quick Wins take the next open weekday slot instead of going live the
 * instant they pass QA. The reason is measured rather than felt: in the week of
 * 17 August 2026, 67 Quick Wins were created and all 67 published, while whole
 * weeks either side published nothing. Ten weeks ran 23, 20, 24, 33, 67, 8 with
 * created almost exactly equalling published every single week.
 *
 * Rae set the cap at three a day, weekdays only, on 6 September 2026.
 *
 * These live here rather than in a route because three callers need them: the
 * sync endpoint Julie uses, the admin calendar, and the daily publisher. One
 * definition means the calendar cannot create a state the publisher rejects.
 *
 * All arithmetic runs on "YYYY-MM-DD" strings through UTC, never through a local
 * Date. A date column parsed as local time is how every date on the partnership
 * header once rendered a day early (see lib/format-date.ts).
 */

export const HUB_DAILY_CAP = 3

/** Today in Chicago, not wherever the function happens to be running. */
export function todayCT(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}

export function isWeekday(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return dow >= 1 && dow <= 5
}

/**
 * The first weekday on or after `from` holding fewer than the cap.
 *
 * Counts every row carrying that date, published or not, so a manual publish
 * that took a slot still consumes it. Otherwise the cap would describe the
 * pending queue rather than the day, and the override path could quietly push a
 * day past three.
 */
export async function nextOpenSlot(
  supabase: SupabaseClient,
  from: string,
  cap: number = HUB_DAILY_CAP
): Promise<string> {
  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('scheduled_publish_date')
    .not('scheduled_publish_date', 'is', null)
    .gte('scheduled_publish_date', from)

  if (error) throw new Error(`Could not read the schedule: ${error.message}`)

  const taken = new Map<string, number>()
  for (const row of data ?? []) {
    const d = row.scheduled_publish_date as string
    taken.set(d, (taken.get(d) ?? 0) + 1)
  }

  let cursor = from
  // A year of weekdays is far beyond any real queue. Reaching this bound means
  // the schedule data is wrong, so it throws rather than looping forever.
  for (let i = 0; i < 400; i++) {
    if (isWeekday(cursor) && (taken.get(cursor) ?? 0) < cap) return cursor
    cursor = addDays(cursor, 1)
  }
  throw new Error('No open slot within 400 days, which means the schedule data is wrong')
}
