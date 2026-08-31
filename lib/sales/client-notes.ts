/**
 * Every note we hold on a client, gathered from every place they get written.
 *
 * Opening a lead used to show only the notes attached to that one
 * `sales_opportunities` row. That is not the client's history. The same client
 * routinely owns several rows, and the notes scatter across five stores:
 *
 *   1. `opportunity_notes`            written by the portal UI
 *   2. `sales_opportunity_notes`      written by agents and scripts
 *   3. `sales_opportunities.notes`    a text column imported before either table
 *   4. `partnership_notes`            written after they sign, on the partnership
 *   5. any of 1-3 on a SIBLING row    a duplicate, a renewal, a grant split, or
 *                                     a row that was soft deleted in a cleanup
 *
 * Measured on 31 Aug 2026: 373 partnership notes were invisible from sales
 * (St. Peter Chanel showed 7 notes and had 97), and 173 more sat on soft
 * deleted rows whose live twin still shows in the pipeline (Glen Ellyn D41
 * showed 14 and had 18, Lansing 158 showed 2 and had 7).
 *
 * Matching is deliberately narrow. Rows join into one client only on an exact
 * signal: same contact mailbox, same contact record, or the same name once
 * decorations like "(RENEWAL)" or "- Grant Funded" are stripped. No substring
 * matching, because "Roosevelt School" would swallow "Roosevelt School District
 * 2" and put another district's notes on a client's file.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { canonicalEmail } from '@/lib/canonical-email'

export type ClientNoteType = 'call' | 'email' | 'meeting' | 'demo' | 'update' | 'system'

export interface ClientNote {
  /**
   * Namespaced so the delete route can find the row again. Bare uuid means
   * `opportunity_notes`; `son:` means `sales_opportunity_notes`; `pn:` means
   * `partnership_notes`; `legacy:` is a synthetic view of a text column.
   */
  id: string
  opportunity_id: string
  author_email: string
  note_text: string
  note_type: ClientNoteType
  created_at: string
  source_table: string
  /**
   * Where this note was written, when that is not the record being viewed.
   * Null for the lead's own notes, so the common case stays unlabelled.
   */
  source_label: string | null
  /** False for anything owned by another record — delete it where it lives. */
  deletable: boolean
}

export interface ClientNoteBundle {
  notes: ClientNote[]
  /** Other records folded in, for the "where did these come from" line. */
  related: { kind: 'opportunity' | 'partnership'; id: string; label: string; note_count: number }[]
}

const VALID_NOTE_TYPES = new Set<ClientNoteType>([
  'call', 'email', 'meeting', 'demo', 'update', 'system',
])

function noteType(raw: unknown): ClientNoteType {
  return VALID_NOTE_TYPES.has(raw as ClientNoteType) ? (raw as ClientNoteType) : 'update'
}

/**
 * Strip the decorations we add to opportunity names when one client is split
 * across rows, so the underlying name can be compared exactly.
 *
 * "(GRANT PROPOSAL ADD ON) Glen Ellyn D41" and "Glen Ellyn D41" are the same
 * client. "Glen Ellyn D41" and "Glen Ellyn D41 Middle School" are not, and this
 * keeps them apart.
 */
export function normalizeClientName(name: string | null | undefined): string {
  if (!name) return ''
  let n = name.toLowerCase().trim()
  // Leading tag in parentheses or brackets: (RENEWAL), (GRANT PROPOSAL ADD ON)
  n = n.replace(/^[([][^)\]]*[)\]]\s*/, '')
  // Trailing funding split: "- Grant Funded", "- Non-Grant", "(Grant-Funded)"
  n = n.replace(/\s*[-–—]?\s*[([]?\s*(grant[\s-]?funded|grant[\s-]?supported|non[\s-]?grant)\s*[)\]]?\s*$/i, '')
  // Punctuation and spacing noise: "St. Mary" vs "St Mary"
  n = n.replace(/[.,'"]/g, '').replace(/\s+/g, ' ').trim()
  return n
}

export interface OppRow {
  id: string
  name: string | null
  contact_email: string | null
  primary_contact_id: string | null
  notes: string | null
  created_at: string
  deleted_at: string | null
}

export interface PartnershipRow {
  id: string
  org_name: string | null
  sales_deal_id: string | null
  contact_email: string | null
  primary_contact_email: string | null
  billing_contact_email: string | null
}

/**
 * The set of records that make up one client: the anchor row plus every
 * sibling opportunity and partnership that clearly belongs to the same client.
 */
export interface ClientRecordSet {
  anchor: OppRow
  siblings: OppRow[]
  partnerships: PartnershipRow[]
}

/**
 * Lookup tables over every opportunity row, so sibling resolution is a few map
 * reads rather than a scan per lead. Built once and shared by the lead panel
 * and the pipeline list.
 */
/** The columns sibling resolution and the legacy note archive both need. */
export const CLIENT_OPP_COLUMNS =
  'id, name, contact_email, primary_contact_id, notes, created_at, deleted_at'

/** The partnership columns used to attach a partnership file to a client. */
export const CLIENT_PARTNERSHIP_COLUMNS =
  'id, org_name, sales_deal_id, contact_email, primary_contact_email, billing_contact_email'

export interface OppIndex {
  rows: OppRow[]
  byId: Map<string, OppRow>
  byEmail: Map<string, string[]>
  byContact: Map<string, string[]>
  byName: Map<string, string[]>
}

// A two-character name would match half the pipeline. Require something real
// before joining two records on their name alone.
const MIN_NAME_KEY_LENGTH = 5

function push(map: Map<string, string[]>, key: string, id: string) {
  const list = map.get(key)
  if (list) list.push(id)
  else map.set(key, [id])
}

export function buildOppIndex(rows: OppRow[]): OppIndex {
  const index: OppIndex = {
    rows,
    byId: new Map(),
    byEmail: new Map(),
    byContact: new Map(),
    byName: new Map(),
  }

  for (const row of rows) {
    index.byId.set(row.id, row)

    const email = canonicalEmail(row.contact_email)
    if (email) push(index.byEmail, email, row.id)

    if (row.primary_contact_id) push(index.byContact, row.primary_contact_id, row.id)

    const name = normalizeClientName(row.name)
    if (name.length >= MIN_NAME_KEY_LENGTH) push(index.byName, name, row.id)
  }

  return index
}

/**
 * Other opportunity rows that are the same client as `anchor`: same contact
 * mailbox, same contact record, or the same name once decorations are stripped.
 * One hop only, never chained, so two districts that happen to share one
 * consultant's mailbox cannot drag a third record in behind them.
 */
export function siblingIdsFor(anchor: OppRow, index: OppIndex): Set<string> {
  const ids = new Set<string>()

  const email = canonicalEmail(anchor.contact_email)
  if (email) for (const id of index.byEmail.get(email) ?? []) ids.add(id)

  if (anchor.primary_contact_id) {
    for (const id of index.byContact.get(anchor.primary_contact_id) ?? []) ids.add(id)
  }

  const name = normalizeClientName(anchor.name)
  if (name.length >= MIN_NAME_KEY_LENGTH) {
    for (const id of index.byName.get(name) ?? []) ids.add(id)
  }

  ids.delete(anchor.id)
  return ids
}

export function partnershipMatchesClient(p: PartnershipRow, oppIds: Set<string>, names: Set<string>, emails: Set<string>): boolean {
  if (p.sales_deal_id && oppIds.has(p.sales_deal_id)) return true

  const orgName = normalizeClientName(p.org_name)
  if (orgName.length >= 5 && names.has(orgName)) return true

  for (const raw of [p.contact_email, p.primary_contact_email, p.billing_contact_email]) {
    const e = canonicalEmail(raw)
    if (e && emails.has(e)) return true
  }

  return false
}

/**
 * Resolve which records belong to this client. Soft deleted opportunities are
 * included on purpose: a row deleted as a duplicate is exactly the row whose
 * notes went missing.
 */
export async function getClientRecordSet(
  supabase: SupabaseClient,
  opportunityId: string
): Promise<ClientRecordSet | null> {
  const { data: anchor, error: anchorErr } = await supabase
    .from('sales_opportunities')
    .select(CLIENT_OPP_COLUMNS)
    .eq('id', opportunityId)
    .single()

  if (anchorErr || !anchor) return null

  const { data: allOpps, error: oppsErr } = await supabase
    .from('sales_opportunities')
    .select(CLIENT_OPP_COLUMNS)
    .limit(10000)

  if (oppsErr) console.error('[client-notes] sibling scan failed:', oppsErr.message)

  const index = buildOppIndex((allOpps ?? []) as OppRow[])
  const siblingIds = siblingIdsFor(anchor as OppRow, index)
  const siblings = [...siblingIds].map(sid => index.byId.get(sid)).filter(Boolean) as OppRow[]

  const oppIds = new Set<string>([anchor.id, ...siblings.map(s => s.id)])
  const names = new Set<string>(
    [anchor as OppRow, ...siblings].map(o => normalizeClientName(o.name)).filter(n => n.length >= 5)
  )
  const emails = new Set<string>(
    [anchor as OppRow, ...siblings].map(o => canonicalEmail(o.contact_email)).filter(Boolean)
  )

  const { data: allPartnerships, error: pErr } = await supabase
    .from('partnerships')
    .select(CLIENT_PARTNERSHIP_COLUMNS)
    .limit(5000)

  if (pErr) console.error('[client-notes] partnership scan failed:', pErr.message)

  const partnerships = (allPartnerships ?? []).filter(p =>
    partnershipMatchesClient(p as PartnershipRow, oppIds, names, emails)
  ) as PartnershipRow[]

  return { anchor: anchor as OppRow, siblings, partnerships }
}

/**
 * Every note on the client that owns `opportunityId`, newest first.
 */
export async function getClientNotes(
  supabase: SupabaseClient,
  opportunityId: string,
  recordSet?: ClientRecordSet | null
): Promise<ClientNoteBundle> {
  const set = recordSet ?? (await getClientRecordSet(supabase, opportunityId))
  if (!set) return { notes: [], related: [] }

  const allOpps = [set.anchor, ...set.siblings]
  const oppIds = allOpps.map(o => o.id)
  const partnershipIds = set.partnerships.map(p => p.id)

  const labelForOpp = (id: string): string | null => {
    if (id === opportunityId) return null
    const row = allOpps.find(o => o.id === id)
    if (!row) return 'Another record'
    const name = row.name || 'Untitled record'
    return row.deleted_at ? `${name} (merged record)` : name
  }

  const [portal, agent, partnerNotes] = await Promise.all([
    supabase
      .from('opportunity_notes')
      .select('id, opportunity_id, author_email, note_text, note_type, created_at')
      .in('opportunity_id', oppIds)
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('sales_opportunity_notes')
      .select('id, opportunity_id, body, created_by, created_at')
      .in('opportunity_id', oppIds)
      .order('created_at', { ascending: false })
      .limit(2000),
    partnershipIds.length
      ? supabase
          .from('partnership_notes')
          .select('id, partnership_id, content, author, note_type, created_at, archived_at')
          .in('partnership_id', partnershipIds)
          .order('created_at', { ascending: false })
          .limit(2000)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (portal.error) console.error('[client-notes] opportunity_notes read failed:', portal.error.message)
  if (agent.error) console.error('[client-notes] sales_opportunity_notes read failed:', agent.error.message)
  if (partnerNotes.error) console.error('[client-notes] partnership_notes read failed:', partnerNotes.error.message)

  const notes: ClientNote[] = []

  for (const n of portal.data ?? []) {
    const label = labelForOpp(n.opportunity_id)
    notes.push({
      id: n.id,
      opportunity_id: n.opportunity_id,
      // The panel calls author_email.split('@'), so it must never be null.
      author_email: n.author_email || 'system@teachersdeserveit.com',
      note_text: n.note_text || '',
      note_type: noteType(n.note_type),
      created_at: n.created_at,
      source_table: 'opportunity_notes',
      source_label: label,
      deletable: label === null,
    })
  }

  for (const n of agent.data ?? []) {
    const label = labelForOpp(n.opportunity_id)
    notes.push({
      id: `son:${n.id}`,
      opportunity_id: n.opportunity_id,
      author_email: n.created_by || 'system@teachersdeserveit.com',
      // This table has no type column. These are agent and script written
      // records, which is what 'system' means everywhere else in the panel.
      note_text: n.body || '',
      note_type: 'system',
      created_at: n.created_at,
      source_table: 'sales_opportunity_notes',
      source_label: label,
      deletable: label === null,
    })
  }

  const partnerNoteCounts = new Map<string, number>()

  for (const n of partnerNotes.data ?? []) {
    if (n.archived_at) continue
    const partnership = set.partnerships.find(p => p.id === n.partnership_id)
    partnerNoteCounts.set(n.partnership_id, (partnerNoteCounts.get(n.partnership_id) ?? 0) + 1)
    notes.push({
      id: `pn:${n.id}`,
      opportunity_id: opportunityId,
      author_email: n.author || 'system@teachersdeserveit.com',
      note_text: n.content || '',
      note_type: noteType(n.note_type),
      created_at: n.created_at,
      source_table: 'partnership_notes',
      source_label: `Partnership: ${partnership?.org_name || 'linked partnership'}`,
      // Owned by the partnership file. Delete it there, not from a lead.
      deletable: false,
    })
  }

  // The legacy `notes` text column is a store of its own, imported before
  // either notes table existed. It used to be shown only when the lead had no
  // other notes, which meant it masked real history. Always surface it, on the
  // anchor and on every sibling.
  for (const o of allOpps) {
    if (!o.notes || o.notes.trim().length <= 10) continue
    const label = labelForOpp(o.id)
    notes.push({
      id: o.id === opportunityId ? 'legacy' : `legacy:${o.id}`,
      opportunity_id: o.id,
      author_email: 'system@teachersdeserveit.com',
      note_text: `[Imported record]\n\n${o.notes}`,
      note_type: 'system',
      created_at: o.created_at,
      source_table: 'legacy_column',
      source_label: label,
      deletable: false,
    })
  }

  notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const related: ClientNoteBundle['related'] = []
  for (const o of set.siblings) {
    const count = notes.filter(n => n.opportunity_id === o.id).length
    if (count === 0) continue
    related.push({
      kind: 'opportunity',
      id: o.id,
      label: o.deleted_at ? `${o.name || 'Untitled record'} (merged record)` : (o.name || 'Untitled record'),
      note_count: count,
    })
  }
  for (const p of set.partnerships) {
    const count = partnerNoteCounts.get(p.id) ?? 0
    if (count === 0) continue
    related.push({
      kind: 'partnership',
      id: p.id,
      label: `Partnership: ${p.org_name || 'linked partnership'}`,
      note_count: count,
    })
  }

  return { notes, related }
}

/** One note in a bulk, all-leads read. */
export interface BulkClientNote {
  body: string
  created_at: string
  author: string
  note_type: string
  /** Where it was written, when that is not the lead it is listed under. */
  source_label: string | null
}

export interface BulkNotesOptions {
  /** Keep only the newest N per lead. Omit for every note. */
  perOpp?: number
  /** Truncate each note to N characters. Omit for the full text. */
  clipChars?: number
}

/**
 * Every client's notes in one pass, keyed by opportunity id, using the same
 * client grouping as the lead panel.
 *
 * The list page and the export both need notes for every lead at once, and
 * calling getClientNotes per lead would be 400 round trips. This reads each
 * table once and groups in memory.
 */
export async function getAllClientNotesByOpp(
  supabase: SupabaseClient,
  options: BulkNotesOptions = {}
): Promise<Record<string, BulkClientNote[]>> {
  const ROW_CAP = 20000

  const [opps, partnerships, portal, agent] = await Promise.all([
    supabase.from('sales_opportunities').select(CLIENT_OPP_COLUMNS).limit(ROW_CAP),
    supabase.from('partnerships').select(CLIENT_PARTNERSHIP_COLUMNS).limit(ROW_CAP),
    supabase
      .from('opportunity_notes')
      .select('opportunity_id, note_text, note_type, author_email, created_at')
      .order('created_at', { ascending: false })
      .limit(ROW_CAP),
    supabase
      .from('sales_opportunity_notes')
      .select('opportunity_id, body, created_by, created_at')
      .order('created_at', { ascending: false })
      .limit(ROW_CAP),
  ])

  if (opps.error) console.error('[client-notes] bulk sales_opportunities read failed:', opps.error.message)
  if (partnerships.error) console.error('[client-notes] bulk partnerships read failed:', partnerships.error.message)
  if (portal.error) console.error('[client-notes] bulk opportunity_notes read failed:', portal.error.message)
  if (agent.error) console.error('[client-notes] bulk sales_opportunity_notes read failed:', agent.error.message)

  const partnershipRows = (partnerships.data ?? []) as PartnershipRow[]

  const partnerNotes = partnershipRows.length
    ? await supabase
        .from('partnership_notes')
        .select('partnership_id, content, author, note_type, created_at, archived_at')
        .order('created_at', { ascending: false })
        .limit(ROW_CAP)
    : { data: [], error: null }

  if (partnerNotes.error) {
    console.error('[client-notes] bulk partnership_notes read failed:', partnerNotes.error.message)
  }

  const clip = (text: string) =>
    options.clipChars && text.length > options.clipChars
      ? `${text.slice(0, options.clipChars)}...`
      : text

  // Keyed by the record each note was written on, before client grouping.
  const byOpp = new Map<string, BulkClientNote[]>()
  const byPartnership = new Map<string, BulkClientNote[]>()

  const add = (map: Map<string, BulkClientNote[]>, key: string | null, note: BulkClientNote) => {
    if (!key || !note.body) return
    const list = map.get(key)
    if (list) list.push(note)
    else map.set(key, [note])
  }

  for (const n of portal.data ?? []) {
    add(byOpp, n.opportunity_id, {
      body: clip(n.note_text || ''),
      created_at: n.created_at,
      author: n.author_email || 'TDI System',
      note_type: noteType(n.note_type),
      source_label: null,
    })
  }

  for (const n of agent.data ?? []) {
    add(byOpp, n.opportunity_id, {
      body: clip(n.body || ''),
      created_at: n.created_at,
      author: n.created_by || 'TDI System',
      note_type: 'system',
      source_label: null,
    })
  }

  for (const n of partnerNotes.data ?? []) {
    if (n.archived_at) continue
    add(byPartnership, n.partnership_id, {
      body: clip(n.content || ''),
      created_at: n.created_at,
      author: n.author || 'TDI System',
      note_type: noteType(n.note_type),
      source_label: null,
    })
  }

  const oppRows = (opps.data ?? []) as OppRow[]
  const index = buildOppIndex(oppRows)
  const merged: Record<string, BulkClientNote[]> = {}

  for (const opp of oppRows) {
    const memberIds = [opp.id, ...siblingIdsFor(opp, index)]
    const memberIdSet = new Set(memberIds)

    const names = new Set(
      memberIds.map(id => normalizeClientName(index.byId.get(id)?.name)).filter(n => n.length >= 5)
    )
    const emails = new Set(
      memberIds.map(id => canonicalEmail(index.byId.get(id)?.contact_email)).filter(Boolean)
    )

    const entries: BulkClientNote[] = []

    for (const id of memberIds) {
      const row = index.byId.get(id)
      const label =
        id === opp.id
          ? null
          : row?.deleted_at
            ? `${row.name || 'Untitled record'} (merged record)`
            : (row?.name || 'Another record')
      for (const n of byOpp.get(id) ?? []) entries.push({ ...n, source_label: label })
    }

    for (const p of partnershipRows) {
      if (!partnershipMatchesClient(p, memberIdSet, names, emails)) continue
      const label = `Partnership: ${p.org_name || 'linked partnership'}`
      for (const n of byPartnership.get(p.id) ?? []) entries.push({ ...n, source_label: label })
    }

    // The legacy text column is a note store too, and is what the pipeline
    // export used to show on its own.
    if (opp.notes && opp.notes.trim().length > 10) {
      entries.push({
        body: clip(`[Imported record] ${opp.notes.trim()}`),
        created_at: opp.created_at,
        author: 'TDI System',
        note_type: 'system',
        source_label: null,
      })
    }

    if (entries.length === 0) continue

    // Each source query is ordered, but interleaving them is not.
    entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    merged[opp.id] = options.perOpp ? entries.slice(0, options.perOpp) : entries
  }

  return merged
}
