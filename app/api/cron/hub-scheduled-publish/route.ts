import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { todayCT } from '@/lib/hub/release-schedule'

/**
 * Publish the Quick Wins whose scheduled day has arrived.
 *
 * Runs daily. Reads hub_quick_wins for unpublished rows whose
 * scheduled_publish_date is today or earlier, and publishes each one through
 * the same update the manual publish path uses. That matters: the database
 * trigger check_quick_win_tags() fires on the update regardless of caller, so
 * this job cannot publish anything missing its tags, its lift, its domains,
 * both PDFs, or a passing QA stamp. Automation gets no side door.
 *
 * Two failure modes are handled deliberately rather than swallowed:
 *
 *   1. A row the trigger refuses. The update throws, the row stays unpublished,
 *      and it appears in `failed` on every subsequent run. It is never marked
 *      published on a failed write, because a row that says published while
 *      nothing is live is worse than an error: nobody goes looking.
 *
 *   2. This job not running at all. Overdue rows are reported separately from
 *      the ones published today, so a silent stall shows up as a growing
 *      overdue count rather than as an empty, healthy-looking response. Two of
 *      this codebase's crons have died quietly before.
 *
 * `?dryRun=1` runs the whole decision and writes nothing. Use it before the
 * first live run and after any change to the slot logic.
 *
 * Deliberately does not send anything. No email, no Slack. Alerting on failures
 * is a real need and a separate decision, and nothing in this build is allowed
 * to send on its own.
 */

export const maxDuration = 60

type DueRow = {
  id: string
  slug: string | null
  title: string | null
  status: string | null
  scheduled_publish_date: string
  scheduled_by: string | null
  reviewed_by: string | null
}

export async function GET(request: NextRequest) {
  // A rehearsal that still writes rows is not a rehearsal.
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Learning Hub Supabase not configured' }, { status: 500 })
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const today = todayCT()

  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('id, slug, title, status, scheduled_publish_date, scheduled_by, reviewed_by')
    .eq('is_published', false)
    .not('scheduled_publish_date', 'is', null)
    .lte('scheduled_publish_date', today)
    .order('scheduled_publish_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: `Could not read the schedule: ${error.message}` }, { status: 500 })
  }

  const due = (data ?? []) as DueRow[]

  // An empty result here is a measured zero only because the query ran. If the
  // key were wrong PostgREST would have returned rows: 0 with no error, which is
  // why the response reports the query it made rather than just the outcome.
  const overdue = due.filter(r => r.scheduled_publish_date < today)

  const published: Array<{ id: string; slug: string | null; due: string }> = []
  const failed: Array<{ id: string; slug: string | null; due: string; reason: string }> = []

  for (const row of due) {
    if (dryRun) {
      published.push({ id: row.id, slug: row.slug, due: row.scheduled_publish_date })
      continue
    }

    const { error: pubErr } = await supabase
      .from('hub_quick_wins')
      .update({
        is_published: true,
        status: 'published',
        // Distinguishable from a human publish on purpose, so the audit can
        // tell later which items nobody watched go live.
        published_by: `scheduled-publisher (slotted by ${row.scheduled_by || row.reviewed_by || 'unknown'})`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)

    if (pubErr) {
      // The trigger refused it, or the write failed. Leave the row exactly as
      // it was and report it. It will be retried tomorrow and stay visible in
      // `failed` until a person fixes it.
      failed.push({
        id: row.id,
        slug: row.slug,
        due: row.scheduled_publish_date,
        reason: pubErr.message,
      })
      continue
    }

    published.push({ id: row.id, slug: row.slug, due: row.scheduled_publish_date })
  }

  return NextResponse.json({
    ok: failed.length === 0,
    dryRun,
    today_ct: today,
    due_count: due.length,
    overdue_count: overdue.length,
    published_count: dryRun ? 0 : published.length,
    would_publish_count: dryRun ? published.length : undefined,
    published,
    failed,
    // Stated so a zero can be read as a real zero rather than a broken query.
    query: 'hub_quick_wins where is_published = false and scheduled_publish_date <= today (America/Chicago)',
  })
}
