import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { HUB_DAILY_CAP, isWeekday, todayCT, addDays, nextOpenSlot } from '@/lib/hub/release-schedule'

/**
 * The calendar's data, and the two things you can do from it.
 *
 * Read: everything carrying a scheduled date in a month, published or not, so
 * the calendar shows both what is coming and what already went out on its slot.
 *
 * Write: move an item to another day, or take it off the calendar entirely.
 * Both go through the same cap and weekday rules the scheduler uses, imported
 * rather than reimplemented, so the calendar cannot create a state the
 * scheduler would not.
 *
 * Publishing is not one of the things you can do here. That stays with the
 * daily job and with Julie's existing publish action, so there is exactly one
 * path to live.
 */

function hubDb() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const month = request.nextUrl.searchParams.get('month') || todayCT().slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month must be YYYY-MM' }, { status: 400 })
  }

  const from = `${month}-01`
  const to = addDays(`${month}-01`, 45).slice(0, 8) + '01'

  try {
    const supabase = hubDb()

    const { data, error } = await supabase
      .from('hub_quick_wins')
      .select('id, slug, title, category, lift, quick_win_type, is_published, status, scheduled_publish_date, scheduled_by, reviewed_by')
      .not('scheduled_publish_date', 'is', null)
      .gte('scheduled_publish_date', from)
      .lt('scheduled_publish_date', to)
      .order('scheduled_publish_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Waiting on a slot: passed QA, nothing scheduled. This is the backlog, and
    // its depth is the signal that production is outrunning the release valve.
    const { count: waiting, error: waitErr } = await supabase
      .from('hub_quick_wins')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', false)
      .eq('status', 'reviewed')
      .is('scheduled_publish_date', null)

    if (waitErr) return NextResponse.json({ error: waitErr.message }, { status: 500 })

    const today = todayCT()
    const items = data ?? []

    return NextResponse.json({
      month,
      today_ct: today,
      cap_per_day: HUB_DAILY_CAP,
      waiting_for_a_slot: waiting ?? 0,
      // Scheduled for a day that has passed and still not live. Non-zero means
      // the daily job is not running, which otherwise looks like a quiet week.
      overdue: items.filter(i => !i.is_published && i.scheduled_publish_date < today).length,
      items,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { action, id, date } = body as { action?: string; id?: string; date?: string }

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = hubDb()

    const { data: qw, error: fetchErr } = await supabase
      .from('hub_quick_wins')
      .select('id, slug, title, is_published, scheduled_publish_date')
      .eq('id', id)
      .single()

    if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

    if (qw.is_published) {
      return NextResponse.json({
        error: 'Already published. A live item cannot be rescheduled.',
      }, { status: 400 })
    }

    if (action === 'unschedule') {
      const { error } = await supabase
        .from('hub_quick_wins')
        .update({
          scheduled_publish_date: null,
          scheduled_by: null,
          scheduled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, id, was_scheduled_for: qw.scheduled_publish_date })
    }

    if (action === 'move') {
      let target: string

      if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
        }
        if (!isWeekday(date)) {
          return NextResponse.json({ error: `${date} is a weekend. Slots are weekdays only.` }, { status: 400 })
        }
        // The item's own current slot does not count against the day it is
        // moving to, but every other row on that day does.
        const { data: onDay, error: countErr } = await supabase
          .from('hub_quick_wins')
          .select('id')
          .eq('scheduled_publish_date', date)

        if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 })

        const others = (onDay ?? []).filter(r => r.id !== id).length
        if (others >= HUB_DAILY_CAP) {
          return NextResponse.json({
            error: `${date} already holds ${others} items and the cap is ${HUB_DAILY_CAP}. Move something off it first.`,
          }, { status: 409 })
        }
        target = date
      } else {
        target = await nextOpenSlot(supabase, addDays(todayCT(), 1))
      }

      const { error } = await supabase
        .from('hub_quick_wins')
        .update({
          scheduled_publish_date: target,
          scheduled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, id, scheduled_publish_date: target })
    }

    return NextResponse.json({ error: `Unknown action "${action}". Use move or unschedule.` }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
