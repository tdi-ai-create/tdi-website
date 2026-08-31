import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import {
  CLIENT_OPP_COLUMNS,
  CLIENT_PARTNERSHIP_COLUMNS,
  buildOppIndex,
  normalizeClientName,
  partnershipMatchesClient,
  siblingIdsFor,
  type OppRow,
  type PartnershipRow,
} from '@/lib/sales/client-notes'
import { canonicalEmail } from '@/lib/canonical-email'

export const dynamic = 'force-dynamic'

const PREVIEW_PER_OPP = 5
const PREVIEW_CHARS = 400
const ROW_CAP = 20000

type Preview = { body: string; created_at: string }

/**
 * Recent-notes preview for the sales list page, keyed by opportunity id.
 *
 * Two reasons this is a server route rather than a direct Supabase query from
 * the page:
 *
 *  1. Notes are split across `opportunity_notes`, `sales_opportunity_notes` and
 *     `partnership_notes`, and across every row a client owns. Reading one
 *     table on one row shows a fraction of the history.
 *  2. `sales_opportunity_notes` has RLS enabled with no policies, so the anon
 *     key the page uses reads back an empty set every time. The service role
 *     used here is not subject to that.
 *
 * A card showing "no notes" while the client's notes sat on a duplicate row was
 * the visible half of the same bug the lead panel had, so both read the same
 * client grouping from lib/sales/client-notes.
 */
export async function GET() {
  const supabase = getServiceSupabase()

  const [opps, partnerships, portal, agent] = await Promise.all([
    supabase.from('sales_opportunities').select(CLIENT_OPP_COLUMNS).limit(ROW_CAP),
    supabase.from('partnerships').select(CLIENT_PARTNERSHIP_COLUMNS).limit(ROW_CAP),
    supabase
      .from('opportunity_notes')
      .select('opportunity_id, note_text, created_at')
      .order('created_at', { ascending: false })
      .limit(ROW_CAP),
    supabase
      .from('sales_opportunity_notes')
      .select('opportunity_id, body, created_at')
      .order('created_at', { ascending: false })
      .limit(ROW_CAP),
  ])

  if (opps.error) console.error('[notes/summary] sales_opportunities read failed:', opps.error.message)
  if (partnerships.error) console.error('[notes/summary] partnerships read failed:', partnerships.error.message)
  if (portal.error) console.error('[notes/summary] opportunity_notes read failed:', portal.error.message)
  if (agent.error) console.error('[notes/summary] sales_opportunity_notes read failed:', agent.error.message)

  if (portal.error && agent.error) {
    return NextResponse.json({ error: 'Could not read notes' }, { status: 500 })
  }

  const partnershipRows = (partnerships.data ?? []) as PartnershipRow[]
  const partnershipIds = partnershipRows.map(p => p.id)

  const partnerNotes = partnershipIds.length
    ? await supabase
        .from('partnership_notes')
        .select('partnership_id, content, created_at, archived_at')
        .order('created_at', { ascending: false })
        .limit(ROW_CAP)
    : { data: [], error: null }

  if (partnerNotes.error) {
    console.error('[notes/summary] partnership_notes read failed:', partnerNotes.error.message)
  }

  // Notes keyed by the record they were written on, before any client grouping.
  const byOpp = new Map<string, Preview[]>()
  const byPartnership = new Map<string, Preview[]>()

  const clip = (text: string) =>
    text.length > PREVIEW_CHARS ? `${text.slice(0, PREVIEW_CHARS)}...` : text

  const add = (map: Map<string, Preview[]>, key: string | null, text: string | null, created_at: string) => {
    if (!key || !text) return
    const list = map.get(key)
    const entry = { body: clip(text), created_at }
    if (list) list.push(entry)
    else map.set(key, [entry])
  }

  for (const n of portal.data ?? []) add(byOpp, n.opportunity_id, n.note_text, n.created_at)
  for (const n of agent.data ?? []) add(byOpp, n.opportunity_id, n.body, n.created_at)
  for (const n of partnerNotes.data ?? []) {
    if (n.archived_at) continue
    add(byPartnership, n.partnership_id, n.content, n.created_at)
  }

  const oppRows = (opps.data ?? []) as OppRow[]
  const index = buildOppIndex(oppRows)

  const merged: Record<string, Preview[]> = {}

  for (const opp of oppRows) {
    const memberIds = [opp.id, ...siblingIdsFor(opp, index)]

    const names = new Set(
      memberIds.map(id => normalizeClientName(index.byId.get(id)?.name)).filter(n => n.length >= 5)
    )
    const emails = new Set(
      memberIds.map(id => canonicalEmail(index.byId.get(id)?.contact_email)).filter(Boolean)
    )
    const memberIdSet = new Set(memberIds)

    const entries: Preview[] = []
    for (const id of memberIds) entries.push(...(byOpp.get(id) ?? []))
    for (const p of partnershipRows) {
      if (!partnershipMatchesClient(p, memberIdSet, names, emails)) continue
      entries.push(...(byPartnership.get(p.id) ?? []))
    }

    if (entries.length === 0) continue

    // Each source query is ordered, but interleaving them is not.
    entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    merged[opp.id] = entries.slice(0, PREVIEW_PER_OPP)
  }

  return NextResponse.json({ notes: merged })
}
