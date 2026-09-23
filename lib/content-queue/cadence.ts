import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * When a piece goes out, per channel.
 *
 * Rae, on the calendar: approving something did not put it on a day. The reason
 * was not a bug in approve, it was that nothing knew what the right day would
 * be. `approve` set `approved_at` and stopped, the calendar places work by date,
 * so approved pieces with no date dropped into the "No day yet" rail.
 *
 * Her rule: "substack is every m, w, f, and only 3 hub content pieces a day."
 *
 * The Hub half of that already exists and runs, in lib/hub/release-schedule.ts,
 * capped at three a day on weekdays since 6 September 2026. This is deliberately
 * the same shape rather than a second system, and deliberately does not restate
 * the Hub rule: one rule described in two places is one rule that will drift.
 *
 * All arithmetic runs on "YYYY-MM-DD" strings through UTC, never a local Date,
 * for the reason release-schedule.ts gives: a date column parsed as local time
 * is how every date on the partnership header once rendered a day early.
 */

export type Cadence = {
  channel: string
  /** ISO weekday numbers, 1 = Monday through 7 = Sunday. */
  weekdays: number[]
  daily_cap: number
}

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

/** 1 = Monday through 7 = Sunday, matching Postgres isodow and the table. */
export function isoWeekday(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return dow === 0 ? 7 : dow
}

/**
 * The rhythm for one channel, or null if nobody has set one.
 *
 * Null is a real answer and the common one. A channel with no cadence keeps
 * today's behaviour exactly: approve leaves the date alone and a person places
 * it. That is what makes this safe to add without deciding every channel's
 * rhythm first.
 */
export async function cadenceFor(
  supabase: SupabaseClient,
  channel: string
): Promise<Cadence | null> {
  const { data, error } = await supabase
    .from('content_queue_cadence')
    .select('channel, weekdays, daily_cap')
    .eq('channel', channel)
    .maybeSingle()

  // Refuse rather than silently skip. A cadence that cannot be read is not the
  // same as a channel with no cadence, and treating them alike would hide a
  // broken table as "this channel just has no rhythm".
  if (error) throw new Error(`Could not read the cadence for ${channel}: ${error.message}`)
  if (!data) return null

  return {
    channel: data.channel as string,
    weekdays: (data.weekdays ?? []) as number[],
    daily_cap: (data.daily_cap ?? 1) as number,
  }
}

/**
 * The first day on or after `from` that this channel runs on and that still has
 * room.
 *
 * Counts every piece already carrying that date on that channel, whatever its
 * status, so a piece somebody placed by hand still consumes its slot. Counting
 * only unpublished work would make the cap describe the pending queue rather
 * than the day, and two pieces could land on one Monday.
 *
 * Cancelled work is excluded because it is not going out and should not hold a
 * day against anything that is.
 */
export async function nextOpenDay(
  supabase: SupabaseClient,
  cadence: Cadence,
  from: string
): Promise<string> {
  if (cadence.weekdays.length === 0) {
    throw new Error(`${cadence.channel} has a cadence row with no weekdays in it`)
  }

  const { data, error } = await supabase
    .from('content_queue_items')
    .select('scheduled_for')
    .eq('channel', cadence.channel)
    .neq('status', 'cancelled')
    .not('scheduled_for', 'is', null)
    .gte('scheduled_for', from)

  if (error) throw new Error(`Could not read the schedule: ${error.message}`)

  const taken = new Map<string, number>()
  for (const row of data ?? []) {
    const d = row.scheduled_for as string
    taken.set(d, (taken.get(d) ?? 0) + 1)
  }

  const runsOn = new Set(cadence.weekdays)
  let cursor = from

  // A year is far beyond any real queue. Reaching this bound means the cadence
  // or the schedule is wrong, so it throws rather than looping forever or
  // quietly returning a day nobody asked for.
  for (let i = 0; i < 400; i++) {
    if (runsOn.has(isoWeekday(cursor)) && (taken.get(cursor) ?? 0) < cadence.daily_cap) {
      return cursor
    }
    cursor = addDays(cursor, 1)
  }

  throw new Error(
    `No open ${cadence.channel} day within 400 days, which means the cadence or the schedule is wrong`
  )
}
