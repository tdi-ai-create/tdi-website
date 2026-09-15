import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * The plan and the standard.
 *
 * Two small surfaces that sit beside the queue rather than inside it, because
 * neither is a piece of work.
 *
 * A **slot** is an intention with nothing written against it: a day, a channel,
 * an audience and a sentence about what it is for. Kristin lays out the shape of
 * a month and Nora briefs into the open slots instead of inventing them. On
 * 14 September nine of eleven pieces had no date at all, which is what a queue
 * with no plan in front of it looks like.
 *
 * A **standard** is what good looks like for a channel, named by pointing at a
 * real approved piece rather than describing one. Julie and Lily refuse to
 * invent structural contracts for Substack and carousels, so they flag
 * `NO STANDARD: <channel>` and wait. That loop has never closed because closing
 * it meant writing a spec. Now it is a by-product of approving something.
 *
 * Nothing here enforces anything. An agent can still place a brief with no slot,
 * and no gate is blocked by a missing standard. Enforcement before the agents
 * know how to satisfy it is how a queue stops moving.
 */

export const maxDuration = 30

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** Same two keys the queue itself accepts, and the same reasoning. */
type Caller = 'agent' | 'calendar'

function authorize(request: NextRequest): Caller | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (syncKey && header === `Bearer ${syncKey}`) return 'agent'
  const calendarKey = process.env.CONTENT_CALENDAR_KEY
  if (calendarKey && header === `Bearer ${calendarKey}`) return 'calendar'
  return null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A real date, not just a well formed one. 31 June parses and does not exist. */
function realDate(when: string): boolean {
  if (!ISO_DATE.test(when)) return false
  const d = new Date(`${when}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === when
}

/**
 * GET /api/content-queue/plan?month=YYYY-MM
 *
 * Every slot in the month, and every standard. Standards are not filtered by
 * month because "what does good look like" is not a monthly question.
 */
export async function GET(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = request.nextUrl.searchParams.get('month') ?? ''
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month is required, as YYYY-MM' }, { status: 400 })
  }

  const supabase = db()
  const from = `${month}-01`
  const [y, m] = month.split('-').map(Number)
  const to = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)

  const { data: slots, error: slotError } = await supabase
    .from('content_queue_slots')
    .select('id, planned_for, channel, audience_tag, purpose, filled_by, created_by, created_at')
    .gte('planned_for', from)
    .lt('planned_for', to)
    .order('planned_for', { ascending: true })

  if (slotError) return NextResponse.json({ error: slotError.message }, { status: 500 })

  const { data: standards, error: stdError } = await supabase
    .from('content_queue_standards')
    .select('channel, item_id, item_title, note, set_by, set_at')

  if (stdError) return NextResponse.json({ error: stdError.message }, { status: 500 })

  return NextResponse.json({
    month,
    slots: slots ?? [],
    standards: standards ?? [],
  })
}

/**
 * POST /api/content-queue/plan
 *
 * action: add_slot | remove_slot | fill_slot | set_standard | clear_standard
 */
export async function POST(request: NextRequest) {
  const caller = authorize(request)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  try {
    const body = await request.json()
    const action = String(body.action ?? '')
    const actor = String(body.actor ?? '').trim().toLowerCase()
    if (!actor) {
      return NextResponse.json({ error: 'actor is required, so the record names who did this' }, { status: 400 })
    }

    const supabase = db()

    // ── planning the month ───────────────────────────────────────────────
    if (action === 'add_slot') {
      const when = String(body.planned_for ?? '').trim()
      const channel = String(body.channel ?? '').trim().toLowerCase()
      if (!realDate(when)) {
        return NextResponse.json({ error: `planned_for must be a real date as YYYY-MM-DD. Got "${when}".` }, { status: 400 })
      }
      if (!channel) return NextResponse.json({ error: 'channel is required' }, { status: 400 })

      if (dryRun) return NextResponse.json({ dryRun: true, would: 'add_slot', planned_for: when, channel })

      const { data, error } = await supabase
        .from('content_queue_slots')
        .insert({
          planned_for: when,
          channel,
          audience_tag: body.audience_tag ? String(body.audience_tag).trim() : null,
          purpose: body.purpose ? String(body.purpose).trim() : null,
          created_by: actor,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, slot: data })
    }

    if (action === 'remove_slot') {
      const id = String(body.id ?? '')
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

      // A slot with work written against it is not an empty intention any more.
      // Removing it would orphan the piece and make the month look emptier than
      // it is, so it is refused rather than cascaded.
      const { data: existing, error: readError } = await supabase
        .from('content_queue_slots')
        .select('id, filled_by')
        .eq('id', id)
        .maybeSingle()
      if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
      if (!existing) return NextResponse.json({ error: 'No slot with that id' }, { status: 404 })
      if (existing.filled_by) {
        return NextResponse.json({
          error: 'Something has already been written against this slot. Cancel the piece first, or leave the slot where it is.',
        }, { status: 409 })
      }

      if (dryRun) return NextResponse.json({ dryRun: true, would: 'remove_slot', id })

      const { error } = await supabase.from('content_queue_slots').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'fill_slot') {
      // Agents only. Filling a slot means "this brief is the work for that
      // intention", which is a pipeline step, not a person's decision.
      if (caller !== 'agent') {
        return NextResponse.json({ error: 'Only the pipeline fills a slot. The calendar plans them.' }, { status: 403 })
      }
      const id = String(body.id ?? '')
      const itemId = String(body.item_id ?? '')
      if (!id || !itemId) return NextResponse.json({ error: 'id and item_id are both required' }, { status: 400 })

      if (dryRun) return NextResponse.json({ dryRun: true, would: 'fill_slot', id, item_id: itemId })

      const { error } = await supabase
        .from('content_queue_slots')
        .update({ filled_by: itemId, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        // The unique index is the real guard against one piece filling two
        // slots. Saying which failure this is beats a raw constraint name.
        if (error.message.includes('content_queue_slots_filled_once_idx')) {
          return NextResponse.json({ error: 'That piece already fills another slot.' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // ── what good looks like ─────────────────────────────────────────────
    if (action === 'set_standard') {
      const itemId = String(body.item_id ?? '')
      if (!itemId) return NextResponse.json({ error: 'item_id is required: a standard points at a real piece' }, { status: 400 })

      const { data: item, error: readError } = await supabase
        .from('content_queue_items')
        .select('id, title, channel, status')
        .eq('id', itemId)
        .maybeSingle()
      if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
      if (!item) return NextResponse.json({ error: 'No piece with that id' }, { status: 404 })

      // Naming an unapproved draft as the bar for everything after it is how a
      // standard gets set from work nobody signed off.
      const SETTLED = ['approved', 'scheduled', 'published', 'verified']
      if (!SETTLED.includes(item.status)) {
        return NextResponse.json({
          error: `"${item.title}" is ${item.status}. A standard is set from work that was approved, not from a draft.`,
        }, { status: 409 })
      }

      if (dryRun) return NextResponse.json({ dryRun: true, would: 'set_standard', channel: item.channel, item_id: itemId })

      const { error } = await supabase
        .from('content_queue_standards')
        .upsert({
          channel: item.channel,
          item_id: item.id,
          item_title: item.title,
          note: body.note ? String(body.note).trim() : null,
          set_by: actor,
          set_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'channel' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, channel: item.channel })
    }

    if (action === 'clear_standard') {
      const channel = String(body.channel ?? '').trim().toLowerCase()
      if (!channel) return NextResponse.json({ error: 'channel is required' }, { status: 400 })
      if (dryRun) return NextResponse.json({ dryRun: true, would: 'clear_standard', channel })

      const { error } = await supabase.from('content_queue_standards').delete().eq('channel', channel)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({
      error: `Unknown action "${action}". Known: add_slot, remove_slot, fill_slot, set_standard, clear_standard`,
    }, { status: 400 })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
