import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const PREVIEW_PER_OPP = 5
const PREVIEW_CHARS = 400

type Preview = { body: string; created_at: string }

/**
 * Recent-notes preview for the sales list page, keyed by opportunity id.
 *
 * Two reasons this is a server route rather than a direct Supabase query from
 * the page:
 *
 *  1. Notes are split across `opportunity_notes` and `sales_opportunity_notes`.
 *     Reading either one alone shows a partial history.
 *  2. `sales_opportunity_notes` has RLS enabled with no policies, so the anon
 *     key the page uses reads back an empty set every time. The service role
 *     used here is not subject to that.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const [portal, agent] = await Promise.all([
    supabase
      .from('opportunity_notes')
      .select('opportunity_id, note_text, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('sales_opportunity_notes')
      .select('opportunity_id, body, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (portal.error) {
    console.error('[notes/summary] opportunity_notes read failed:', portal.error.message)
  }
  if (agent.error) {
    console.error('[notes/summary] sales_opportunity_notes read failed:', agent.error.message)
  }

  if (portal.error && agent.error) {
    return NextResponse.json({ error: 'Could not read notes' }, { status: 500 })
  }

  const merged: Record<string, Preview[]> = {}

  const add = (oppId: string | null, text: string | null, created_at: string) => {
    if (!oppId || !text) return
    if (!merged[oppId]) merged[oppId] = []
    merged[oppId].push({
      body: text.length > PREVIEW_CHARS ? `${text.slice(0, PREVIEW_CHARS)}...` : text,
      created_at,
    })
  }

  for (const n of portal.data ?? []) add(n.opportunity_id, n.note_text, n.created_at)
  for (const n of agent.data ?? []) add(n.opportunity_id, n.body, n.created_at)

  // Sort each lead's notes newest first, then keep only the preview slice. The
  // two source queries are each ordered, but interleaving them is not.
  for (const oppId of Object.keys(merged)) {
    merged[oppId].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    merged[oppId] = merged[oppId].slice(0, PREVIEW_PER_OPP)
  }

  return NextResponse.json({ notes: merged })
}
