import { randomBytes } from 'crypto'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * One visit, one row.
 *
 * A scheduled observation lives in `timeline_events`. The record that carries a
 * visit through to Love Notes is `observation_visits`, but until now that row
 * was only created when notepad photos were uploaded, which is after the visit.
 * So there was nowhere to put anything a school sent back beforehand.
 *
 * This resolves a scheduled event to its visit row, creating it on first use.
 * Keyed on `timeline_event_id` so opening the prep panel twice does not produce
 * two visits.
 */

export interface VisitPrep {
  id: string
  partnership_id: string
  timeline_event_id: string | null
  visit_date: string
  status: string
  prep_notes: string | null
  prep_files: PrepFile[]
  prep_done_at: string | null
  prep_reminder_sent_at: string | null
}

export interface PrepFile {
  name: string
  url: string
  storage_path: string
  size: number
  uploaded_at: string
  uploaded_by: string
}

const PREP_COLUMNS =
  'id, partnership_id, timeline_event_id, visit_date, status, prep_notes, prep_files, prep_done_at, prep_reminder_sent_at'

export function newPrepToken(): string {
  return randomBytes(24).toString('hex')
}

/**
 * Find the visit row for a scheduled observation, creating it if this is the
 * first time anyone has touched it.
 *
 * Returns null when the event does not exist or is not an observation, rather
 * than inventing a visit for, say, a virtual session.
 */
export async function resolveVisitForEvent(
  timelineEventId: string
): Promise<VisitPrep | null> {
  const supabase = getServiceSupabase()

  const { data: existing, error: findError } = await supabase
    .from('observation_visits')
    .select(PREP_COLUMNS)
    .eq('timeline_event_id', timelineEventId)
    .maybeSingle()

  // A read failure is not "no prep yet". Returning null here would silently
  // create a duplicate visit on the next call.
  if (findError) throw new Error(`visit lookup failed: ${findError.message}`)
  if (existing) return normalise(existing)

  const { data: event, error: eventError } = await supabase
    .from('timeline_events')
    .select('id, partnership_id, event_date, event_type')
    .eq('id', timelineEventId)
    .maybeSingle()

  if (eventError) throw new Error(`event lookup failed: ${eventError.message}`)
  if (!event || event.event_type !== 'observation' || !event.event_date) return null

  const { count } = await supabase
    .from('observation_visits')
    .select('id', { count: 'exact', head: true })
    .eq('partnership_id', event.partnership_id)

  const { data: created, error: insertError } = await supabase
    .from('observation_visits')
    .insert({
      partnership_id: event.partnership_id,
      timeline_event_id: event.id,
      visit_date: event.event_date,
      visit_number: (count || 0) + 1,
      status: 'scheduled',
      prep_files: [],
    })
    .select(PREP_COLUMNS)
    .single()

  if (insertError) throw new Error(`visit create failed: ${insertError.message}`)
  return normalise(created)
}

function normalise(row: Record<string, unknown>): VisitPrep {
  return {
    ...(row as unknown as VisitPrep),
    prep_files: Array.isArray(row.prep_files) ? (row.prep_files as PrepFile[]) : [],
  }
}
