import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The Quick Wins released in a given month, grouped by category.
 *
 * Shared by the two monthly emails: the educator issue and the leadership
 * issue. One source means the two cannot disagree about what shipped.
 *
 * ## What "released this month" means, and why it is a coalesce
 *
 * The table records `published_by` but until 7 September 2026 recorded nothing
 * for *when* something went live. So the effective release date is, in order:
 *
 *   1. `scheduled_publish_date` — everything from 7 Sep 2026 onward, exact.
 *   2. `published_at`           — stamped from 7 Sep 2026 onward, exact.
 *   3. `created_at`             — everything before that, a proxy.
 *
 * The proxy is honest rather than convenient. Before the release schedule, an
 * item published the moment it was finished: ten weeks of data ran 23 created
 * and 23 published, 24 and 24, 67 and 67. Created and published were the same
 * day, so created_at is the best available record of when educators first saw
 * it. It stops being a proxy as the scheduled era fills in.
 */

export type MonthlyTool = {
  title: string
  slug: string
  description: string | null
  category: string
  roles: string[]
  lift: string | null
  released: string
}

export type CategoryGroup = {
  category: string
  tools: MonthlyTool[]
}

export type MonthlyToolsResult = {
  monthISO: string
  monthLabel: string
  total: number
  groups: CategoryGroup[]
}

const ROLE_LABELS: Record<string, string> = {
  teacher: 'teachers',
  para: 'paras',
  leader: 'leaders',
  coach: 'coaches',
}

/** "teachers and paras" rather than "teacher, para". Leaders read the email, not the schema. */
export function roleLabel(roles: string[] | null | undefined): string {
  const named = (roles ?? []).map(r => ROLE_LABELS[r]).filter(Boolean)
  if (named.length === 0) return ''
  if (named.length === 1) return named[0]
  if (named.length === 2) return `${named[0]} and ${named[1]}`
  return `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`
}

function effectiveRelease(row: {
  scheduled_publish_date: string | null
  published_at: string | null
  created_at: string | null
}): string | null {
  if (row.scheduled_publish_date) return row.scheduled_publish_date
  if (row.published_at) return row.published_at.slice(0, 10)
  if (row.created_at) return row.created_at.slice(0, 10)
  return null
}

/**
 * @param monthISO "YYYY-MM". Defaults to the current month in Chicago.
 */
export async function monthlyTools(
  hub: SupabaseClient,
  monthISO?: string
): Promise<MonthlyToolsResult> {
  const month =
    monthISO ??
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago', year: 'numeric', month: '2-digit',
    }).format(new Date()).slice(0, 7)

  const { data, error } = await hub
    .from('hub_quick_wins')
    .select('title, slug, description, category, roles, lift, scheduled_publish_date, published_at, created_at')
    .eq('is_published', true)

  if (error) throw new Error(`Could not read the month's tools: ${error.message}`)

  // The whole published set is a few hundred rows, so the month filter runs
  // here rather than as a PostgREST coalesce that would be harder to read and
  // no faster at this size.
  const inMonth: MonthlyTool[] = []
  for (const row of data ?? []) {
    const released = effectiveRelease(row)
    if (!released || released.slice(0, 7) !== month) continue
    if (!row.slug || !row.title) continue
    inMonth.push({
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category || 'Everything else',
      roles: row.roles ?? [],
      lift: row.lift,
      released,
    })
  }

  const byCategory = new Map<string, MonthlyTool[]>()
  for (const t of inMonth) {
    const list = byCategory.get(t.category) ?? []
    list.push(t)
    byCategory.set(t.category, list)
  }

  const groups: CategoryGroup[] = [...byCategory.entries()]
    .map(([category, tools]) => ({
      category,
      tools: tools.sort((a, b) => a.released.localeCompare(b.released)),
    }))
    // Biggest category first, so the reader meets the month's centre of gravity
    // before the one-offs.
    .sort((a, b) => b.tools.length - a.tools.length || a.category.localeCompare(b.category))

  const [y, m] = month.split('-').map(Number)
  const monthLabel = new Date(Date.UTC(y, m - 1, 1))
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return { monthISO: month, monthLabel, total: inMonth.length, groups }
}
