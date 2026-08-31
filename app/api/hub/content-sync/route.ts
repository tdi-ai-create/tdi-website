import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getQuizBySlug } from '@/lib/hub/quizConfigs'

// PDF upload via base64 can be slow
export const maxDuration = 60

/**
 * Hub Content Sync API
 *
 * Paperclip agents (Dr. Jasmine Cole) call this endpoint to:
 * - List draft Quick Wins (list_drafts)
 * - Get pipeline status (get_status)
 * - Create a new Quick Win draft (create_draft)
 * - Update an existing draft (update_draft)
 * - Upload a PDF resource (upload_pdf)
 * - Upload a thumbnail image (upload_thumbnail)
 * - Record that QA passed (mark_reviewed)  <- required before publish
 * - Publish a Quick Win (publish)
 * - Repair metadata on an already-published Quick Win (backfill_published)
 *
 * And to run the remediation program over live content (docs/hub-content-standard.md):
 * - See the scored queue of published items (list_published)
 * - Read one live item in full, by id or slug (get_published)
 * - Take a functionally broken item down (unpublish)
 * - Record a real QA pass on a live item (review_published)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 */

// Canonical vocabularies. The Hub matches both case-sensitively:
// lift drives the capacity badge (quick-wins/page.tsx), domains drive filtering.
// A value outside these sets does not error, it just silently renders nothing,
// which is how 21 Quick Wins shipped with a blank lift badge.
const VALID_LIFT = ['LOW', 'MED', 'HIGH'] as const
const VALID_DOMAINS = ['1-planning', '2-environment', '3-instruction', '4-professional'] as const

// The standard an item was checked against, stamped into qa_notes on every
// review. Without it an audit cannot tell a properly reviewed item from one
// waved through under the old structural-only gate, and has to guess from dates.
// Bump this when docs/hub-content-standard.md changes what QA has to check.
export const RUBRIC_VERSION = 'rubric-v2'

// Boilerplate that signals nobody wrote for a real teacher. A starter list, not
// a finished one: add phrases as remediation surfaces them. Matched
// case-insensitively against title, description and objectives.
const BANNED_PHRASES = [
  "in today's fast-paced classroom",
  'in todays fast-paced classroom',
  "in today's ever-changing",
  'now more than ever',
  'in this day and age',
  'it is important to note that',
  'at the end of the day',
  'a game changer',
  'take it to the next level',
  'unlock the power of',
]

export type QuickWinRow = {
  slug: string | null
  title: string | null
  description: string | null
  category: string | null
  lift: string | null
  quick_win_type: string | null
  topic_tags: string[] | null
  roles: string[] | null
  danielson_domains: string[] | null
  file_url: string | null
  tool_file_url: string | null
  tool_type: string | null
}

/**
 * Julie Lynn's mechanical QA checklist, in code.
 *
 * These mirror the database trigger in migration 109 exactly. Enforcing them here
 * too means QA sees the whole list in one response instead of hitting exceptions
 * one at a time. The trigger remains the real backstop for direct writes.
 *
 * The judgment half of QA (is the content any good, is the tool actually usable)
 * stays with Julie Lynn. This only covers what a machine can verify.
 *
 * This function is the structural half of docs/hub-content-standard.md. Four
 * approved rules are specified there and deliberately not implemented here yet:
 * required objectives, file_url extension validation, the banned-phrase list,
 * and the rubric-v2 stamp. 173 published items would fail the objectives check
 * today, so section 7 of that document sets the order for turning them on.
 * Add checks here only in step with that sequence.
 */
export function qaBlockers(qw: QuickWinRow): string[] {
  const out: string[] = []
  const nonEmpty = (a: unknown): a is string[] => Array.isArray(a) && a.length > 0

  if (!qw.title?.trim()) out.push('title is required')
  if (!qw.description?.trim()) out.push('description is required')
  if (!qw.category) out.push('category is required')
  if (!qw.quick_win_type) out.push('quick_win_type is required')
  if (!nonEmpty(qw.roles)) out.push('at least one role is required')

  if (!nonEmpty(qw.topic_tags)) {
    out.push('at least 2 topic_tags are required')
  } else {
    if (qw.topic_tags.length < 2) out.push(`at least 2 topic_tags are required (has ${qw.topic_tags.length})`)
    if (qw.topic_tags.includes('general')) out.push('topic_tag "general" is not allowed, it breaks Browse by Topic')
  }

  if (!qw.lift) {
    out.push('lift is required')
  } else if (!VALID_LIFT.includes(qw.lift as typeof VALID_LIFT[number])) {
    out.push(`lift must be exactly one of ${VALID_LIFT.join(', ')} (got "${qw.lift}"). The badge renders blank otherwise.`)
  }

  if (!nonEmpty(qw.danielson_domains)) {
    out.push('at least one danielson_domain is required')
  } else {
    const bad = qw.danielson_domains.filter(d => !VALID_DOMAINS.includes(d as typeof VALID_DOMAINS[number]))
    if (bad.length > 0) {
      out.push(`danielson_domains must use ${VALID_DOMAINS.join(', ')} (got ${bad.join(', ')})`)
    }
  }

  // Downloads ship two PDFs: the guide explains, the tool is what gets printed.
  // Quizzes render "Take Quiz" off file_url and fall back to a placeholder without it.
  // Games and activities are interactive and need neither.
  if (qw.quick_win_type === 'download') {
    if (!qw.file_url) out.push('download type requires a guide PDF (file_url)')
    // Some downloads are a single printable that already IS the tool: a lab card,
    // a quick card, a walkthrough form. Those declare tool_type self_contained
    // and need no second file. Mirrors the database trigger in migration 112.
    if (!qw.tool_file_url && qw.tool_type !== 'self_contained') {
      out.push('download type requires a tool PDF (tool_file_url), run generate_tool, or set tool_type to self_contained if the guide is itself the printable tool')
    }
  } else if (qw.quick_win_type === 'quiz') {
    // A quiz is playable either because a config exists (renders in-app at
    // /hub/quiz/[slug]) or because a file backs it. With neither, the detail
    // page can only show "Quiz coming soon".
    const interactive = !!qw.slug && !!getQuizBySlug(qw.slug)
    if (!interactive && !qw.file_url) {
      out.push('quiz type needs either a config in lib/hub/quizConfigs (preferred, renders in-app) or a file_url')
    }
  }

  return out
}

export type ScoredRow = QuickWinRow & {
  id: string
  objectives: string | null
  reviewed_at: string | null
  qa_notes: string | null
}

export type Lane = 'pull' | 'replace' | 'stamp' | 'clean'

/**
 * Score one published Quick Win against docs/hub-content-standard.md and put it
 * in a lane.
 *
 * The lanes are Rae's tiered retroactive policy in code (standard section 5).
 * The split is functional, never aesthetic:
 *
 *   pull     the download is not a usable document. Comes down now
 *   replace  it is live and usable but fails the bar on substance. Stays live
 *            while it waits, gets rebuilt rather than patched
 *   stamp    the content is fine, the provenance is missing
 *   clean    nothing to do
 *
 * Deliberately mechanical. Nothing here is a judgment call, so re-running it
 * gives the same answer and the queue count is a number you can trust. The
 * judgment half (is this an article or a tool) stays with QA, which is why a
 * clean lane here still means a human has to have reviewed it.
 */
export function scoreItem(qw: ScoredRow): { lane: Lane; defects: string[] } {
  const broken: string[] = []
  const substantive: string[] = []
  const fixable: string[] = []

  // Functional breakage. A download whose file is a PNG or an HTML page is not
  // a document a teacher can use, which is exactly what the four items pulled
  // in August turned out to be. The gate never checked what file_url pointed at.
  const isDownload = qw.quick_win_type === 'download'
  if (isDownload && !qw.file_url) broken.push('download has no guide file at all')
  else if (isDownload && !/\.pdf(\?|#|$)/i.test(qw.file_url!)) {
    broken.push(`guide file is not a PDF: ${qw.file_url!.split('/').pop()}`)
  }

  // Structural debt that survived the old gate. Split by what it takes to fix.
  // Tags, roles and domains are metadata a backfill can correct in place. A
  // missing title, file or lift means the item has to be rebuilt, so it is not
  // the same kind of work and does not belong in the same lane.
  const BACKFILLABLE_BLOCKERS = /^(at least one role|at least 2 topic_tags|topic_tag "general"|at least one danielson_domain|danielson_domains must use)/
  for (const blocker of qaBlockers(qw)) {
    if (BACKFILLABLE_BLOCKERS.test(blocker)) fixable.push(blocker)
    else substantive.push(blocker)
  }

  // Objectives is a field, not a rewrite. backfill_published can set it on a
  // live row without touching what the item is, so this is fast-lane work even
  // though 173 items carry it.
  if (!qw.objectives?.trim()) fixable.push('objectives is empty')

  // Boilerplate is a content problem. Fixing it means rewriting copy, which
  // means the item goes back through the rebuild path.
  const haystack = [qw.title, qw.description, qw.objectives]
    .filter(Boolean).join(' ').toLowerCase()
  const banned = BANNED_PHRASES.filter(p => haystack.includes(p))
  if (banned.length > 0) substantive.push(`banned phrase: ${banned.join('; ')}`)

  // Provenance says nothing about whether the content is good, only that
  // nobody checked. Always fast lane.
  if (!qw.reviewed_at) fixable.push('never passed QA')
  else if (!qw.qa_notes?.includes(RUBRIC_VERSION)) {
    fixable.push(`reviewed, but not against ${RUBRIC_VERSION}`)
  }

  const defects = [...broken, ...substantive, ...fixable]

  if (broken.length > 0) return { lane: 'pull', defects }
  if (substantive.length > 0) return { lane: 'replace', defects }
  if (fixable.length > 0) return { lane: 'stamp', defects }
  return { lane: 'clean', defects }
}

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${syncKey}`
}

// ────────────────────────────────────────────────────────────
// GET
// ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const supabase = db()

  // ── list_drafts: unpublished Quick Wins with completeness flags ──
  if (action === 'list_drafts') {
    const { data: drafts, error } = await supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', false)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = (drafts || []).map(d => ({
      ...d,
      has_pdf: d.file_url != null,
      has_description: d.description != null && d.description !== '',
      has_tags: Array.isArray(d.topic_tags) && d.topic_tags.length > 0,
      has_roles: Array.isArray(d.roles) && d.roles.length > 0,
    }))

    return NextResponse.json({ drafts: items, count: items.length })
  }

  // ── get_status: pipeline counts ──
  if (action === 'get_status') {
    const { data: all, error } = await supabase
      .from('hub_quick_wins')
      .select('id, is_published, file_url, description')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = all || []
    const published = items.filter(i => i.is_published)
    const draftItems = items.filter(i => !i.is_published)

    return NextResponse.json({
      total: items.length,
      published: published.length,
      drafts: draftItems.length,
      drafts_missing_pdf: draftItems.filter(d => d.file_url == null).length,
      drafts_missing_description: draftItems.filter(d => d.description == null || d.description === '').length,
    })
  }

  // ── list_published: the remediation queue, scored and laned ──
  //
  // Until this existed there was no way for an agent to see a published Quick
  // Win at all. list_drafts covered unpublished rows, get_status returned
  // counts. Every write action needs an id, and there was no action that
  // returned one for a live item, so the entire 245-item remediation program
  // could not start. That is TEA-230, open since 2026-08-18.
  //
  // Filter with ?lane=pull|replace|stamp|clean to work one lane at a time, and
  // ?limit / ?offset to page. Returns the full scored count regardless of page
  // so a caller always knows how much is left.
  if (action === 'list_published') {
    const lane = searchParams.get('lane')
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 250)
    const offset = Number(searchParams.get('offset')) || 0

    if (lane && !['pull', 'replace', 'stamp', 'clean'].includes(lane)) {
      return NextResponse.json({ error: `lane must be pull, replace, stamp or clean (got "${lane}")` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const scored = (data || []).map(qw => {
      const { lane: itemLane, defects } = scoreItem(qw as ScoredRow)
      return {
        id: qw.id,
        slug: qw.slug,
        title: qw.title,
        quick_win_type: qw.quick_win_type,
        category: qw.category,
        objectives: qw.objectives,
        file_url: qw.file_url,
        tool_file_url: qw.tool_file_url,
        reviewed_at: qw.reviewed_at,
        reviewed_by: qw.reviewed_by,
        lane: itemLane,
        defects,
      }
    })

    const filtered = lane ? scored.filter(i => i.lane === lane) : scored
    const counts = scored.reduce<Record<string, number>>((acc, i) => {
      acc[i.lane] = (acc[i.lane] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      rubric_version: RUBRIC_VERSION,
      total_published: scored.length,
      lane_counts: counts,
      matching: filtered.length,
      returned: filtered.slice(offset, offset + limit).length,
      offset,
      items: filtered.slice(offset, offset + limit),
    })
  }

  // ── get_published: one live item in full, by id or slug ──
  //
  // Agents were resolving slugs by guessing ids, which the id check rejected
  // outright. Accepting either is the difference between a workable loop and
  // a dead end.
  if (action === 'get_published') {
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    if (!id && !slug) return NextResponse.json({ error: 'id or slug is required' }, { status: 400 })

    const query = supabase.from('hub_quick_wins').select('*').eq('is_published', true)
    const { data, error } = await (id ? query.eq('id', id) : query.eq('slug', slug!)).maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'No published Quick Win with that id or slug' }, { status: 404 })

    const { lane, defects } = scoreItem(data as ScoredRow)
    return NextResponse.json({ rubric_version: RUBRIC_VERSION, lane, defects, quick_win: data })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}

// ────────────────────────────────────────────────────────────
// POST
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const action = body.action as string
    const supabase = db()

    // ── create_draft: insert a new Quick Win as draft ──
    if (action === 'create_draft') {
      const { title, slug, description, category } = body

      if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 })
      if (!slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (!cleanSlug) return NextResponse.json({ error: 'slug must contain alphanumeric characters or hyphens' }, { status: 400 })

      // Check slug uniqueness
      const { data: existing } = await supabase
        .from('hub_quick_wins')
        .select('id')
        .eq('slug', cleanSlug)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json({ error: `Slug "${cleanSlug}" already exists. Choose a unique slug.` }, { status: 409 })
      }

      const now = new Date().toISOString()
      const accessTier = body.access_tier || 'professional'

      // Map access_tier to tier with correct casing for DB constraint
      const tierMap: Record<string, string> = {
        free: 'Free', essentials: 'Essentials',
        professional: 'Professional', 'all-access': 'All-Access',
        'all_access': 'All-Access',
      }
      const tier = tierMap[accessTier.toLowerCase()] || 'Professional'

      const insertPayload: Record<string, unknown> = {
        title: title.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        category: category || null,
        duration_minutes: body.duration_minutes || null,
        quick_win_type: body.quick_win_type || null,
        access_tier: accessTier,
        capacity: body.capacity || null,
        topic_tags: Array.isArray(body.topic_tags) ? body.topic_tags : [],
        roles: Array.isArray(body.roles) ? body.roles : [],
        danielson_domains: Array.isArray(body.danielson_domains) ? body.danielson_domains : [],
        objectives: body.objectives || null,
        lift: body.lift || null,
        resource_type: body.resource_type || 'pdf',
        title_es: body.title_es || null,
        description_es: body.description_es || null,
        is_published: false,
        status: 'draft',
        tier,
        tier_source: 'agent_created',
        free_hero_candidate: false,
        lift_uncertain: true,
        created_at: now,
        updated_at: now,
      }

      const { data, error } = await supabase
        .from('hub_quick_wins')
        .insert(insertPayload)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: `Slug "${cleanSlug}" already exists. Choose a unique slug.` }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, quick_win: data })
    }

    // ── update_draft: update an existing unpublished Quick Win ──
    if (action === 'update_draft') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

      // Verify it exists and is not published
      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, is_published')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
      if (qw.is_published) return NextResponse.json({ error: 'Cannot update a published Quick Win' }, { status: 400 })

      const allowedFields = [
        'title', 'slug', 'description', 'category', 'duration_minutes',
        'quick_win_type', 'access_tier', 'capacity', 'topic_tags', 'roles',
        'danielson_domains', 'objectives', 'lift', 'resource_type',
        'title_es', 'description_es',
      ]

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field]
        }
      }

      const { data, error } = await supabase
        .from('hub_quick_wins')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true, quick_win: data })
    }

    // ── upload_pdf: store a PDF and link it to a Quick Win ──
    if (action === 'upload_pdf') {
      const { id, pdf_base64, filename } = body

      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!pdf_base64) return NextResponse.json({ error: 'pdf_base64 is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, slug')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      const buffer = Buffer.from(pdf_base64, 'base64')
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF exceeds 10MB limit' }, { status: 400 })
      }

      const pdfFilename = filename || `${qw.slug}.pdf`
      const storagePath = `quick-wins/${qw.id}/${pdfFilename}`

      const { error: uploadErr } = await supabase.storage
        .from('hub-assets')
        .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

      const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
      const publicUrl = urlData?.publicUrl

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({
          file_url: publicUrl,
          file_path: storagePath,
          file_type: 'application/pdf',
          content_type: 'pdf',
          storage_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      return NextResponse.json({ success: true, file_url: publicUrl, storage_path: storagePath })
    }

    // ── upload_thumbnail: store a thumbnail image for a Quick Win ──
    if (action === 'upload_thumbnail') {
      const { id, image_base64, content_type } = body

      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!image_base64) return NextResponse.json({ error: 'image_base64 is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      const buffer = Buffer.from(image_base64, 'base64')
      if (buffer.length > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Thumbnail exceeds 2MB limit' }, { status: 400 })
      }

      const mime = content_type || 'image/png'
      const storagePath = `cover-images/quick-wins/${qw.id}/thumbnail.png`

      const { error: uploadErr } = await supabase.storage
        .from('hub-assets')
        .upload(storagePath, buffer, { contentType: mime, upsert: true, cacheControl: '3600' })

      if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

      const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
      const thumbnailUrl = urlData?.publicUrl

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      return NextResponse.json({ success: true, thumbnail_url: thumbnailUrl })
    }

    // ── mark_reviewed: record that QA passed. Required before publish. ──
    if (action === 'mark_reviewed') {
      const { id, reviewed_by, notes } = body

      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!reviewed_by?.trim()) {
        return NextResponse.json({ error: 'reviewed_by is required (who ran QA)' }, { status: 400 })
      }

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
      if (qw.is_published) {
        return NextResponse.json({ error: 'Quick Win is already published' }, { status: 400 })
      }

      // Run the same mechanical checks the publish gate enforces, so QA gets the
      // full list up front instead of discovering them one exception at a time.
      const blockers = qaBlockers(qw as QuickWinRow)
      if (blockers.length > 0) {
        return NextResponse.json({ success: false, blockers }, { status: 400 })
      }

      const { error: reviewErr } = await supabase
        .from('hub_quick_wins')
        .update({
          status: 'reviewed',
          reviewed_by: reviewed_by.trim(),
          reviewed_at: new Date().toISOString(),
          qa_notes: notes?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (reviewErr) return NextResponse.json({ error: reviewErr.message }, { status: 500 })

      return NextResponse.json({ success: true, id, slug: qw.slug, status: 'reviewed' })
    }

    // ── publish: validate and publish a Quick Win ──
    //
    // QA is a precondition. The item must have passed mark_reviewed first, or the
    // caller must supply an explicit override reason. Overrides are stored on the
    // row and reported by the daily health check so a bypass is never silent.
    if (action === 'publish') {
      const { id, force, reason, published_by } = body

      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      if (qw.is_published) {
        return NextResponse.json({ error: 'Quick Win is already published' }, { status: 400 })
      }

      if (force && !reason?.trim()) {
        return NextResponse.json(
          { error: 'Publishing without QA requires a written reason. Pass { force: true, reason: "..." }' },
          { status: 400 }
        )
      }

      if (!force && qw.status !== 'reviewed') {
        return NextResponse.json({
          success: false,
          error: `QA has not passed. Status is "${qw.status}", expected "reviewed". ` +
                 `Call action mark_reviewed first, or pass { force: true, reason: "..." } to publish anyway.`,
        }, { status: 400 })
      }

      const blockers = qaBlockers(qw as QuickWinRow)
      if (blockers.length > 0) {
        return NextResponse.json({ success: false, blockers }, { status: 400 })
      }

      const { error: publishErr } = await supabase
        .from('hub_quick_wins')
        .update({
          is_published: true,
          status: 'published',
          published_by: published_by?.trim() || (force ? 'override' : qw.reviewed_by) || null,
          qa_override_reason: force ? reason.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (publishErr) return NextResponse.json({ error: publishErr.message }, { status: 500 })

      // The database trigger auto_seed_community (migration 104) will
      // automatically create 5 role-aware community posts

      return NextResponse.json({ success: true, id, slug: qw.slug, qa_bypassed: !!force })
    }

    // ── backfill_published: repair metadata debt on live Quick Wins ──
    //
    // update_draft deliberately refuses published rows so agents cannot silently
    // rewrite live educator-facing content. That guard stays. This is the narrow
    // exception it forces: the fields below describe an item without changing
    // what it is, so correcting them on a live item is safe. Anything that alters
    // identity (title, slug, category, type, files) still requires the reviewed
    // unpublish/edit/republish path.
    //
    // Exists because 174 of 264 published Quick Wins shipped with no objectives
    // and no path to add them. See TEA-230.
    if (action === 'backfill_published') {
      const { id, reason, dryRun } = body

      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!reason?.trim()) {
        return NextResponse.json(
          { error: 'reason is required and is written to qa_notes, so every backfill says why it happened' },
          { status: 400 },
        )
      }

      // Fields that describe the item. Safe to correct while live.
      const BACKFILLABLE = [
        'objectives', 'topic_tags', 'danielson_domains', 'roles',
        'title_es', 'description_es',
      ] as const

      // Fields that define what the item IS. Changing these on a live item
      // silently swaps the thing a teacher already saved or linked to.
      const IDENTITY_FIELDS = [
        'title', 'slug', 'category', 'quick_win_type', 'file_url', 'tool_file_url',
        'tool_type', 'is_published', 'status', 'reviewed_at', 'reviewed_by', 'lift',
      ]

      const rejected = IDENTITY_FIELDS.filter(f => body[f] !== undefined)
      if (rejected.length > 0) {
        return NextResponse.json({
          error: `backfill_published cannot change ${rejected.join(', ')}. These define what the item is. Unpublish, edit as a draft, and republish through QA instead.`,
        }, { status: 400 })
      }

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, slug, is_published, qa_notes')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
      if (!qw.is_published) {
        return NextResponse.json(
          { error: 'This Quick Win is a draft. Use update_draft, which allows the full field set.' },
          { status: 400 },
        )
      }

      const updates: Record<string, unknown> = {}
      for (const field of BACKFILLABLE) {
        if (body[field] !== undefined) updates[field] = body[field]
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: `Nothing to backfill. Supply at least one of: ${BACKFILLABLE.join(', ')}` },
          { status: 400 },
        )
      }

      const stamp = new Date().toISOString()
      const auditLine = `${stamp.slice(0, 10)} backfill_published (${Object.keys(updates).join(', ')}): ${reason.trim()}`

      // Dry run reports exactly what would change without touching the row,
      // so a bulk backfill can be inspected before any of it lands.
      if (dryRun) {
        return NextResponse.json({
          dry_run: true, id, slug: qw.slug,
          would_update: updates,
          would_append_to_qa_notes: auditLine,
        })
      }

      const { data, error } = await supabase
        .from('hub_quick_wins')
        .update({
          ...updates,
          qa_notes: qw.qa_notes ? `${qw.qa_notes}\n${auditLine}` : auditLine,
          updated_at: stamp,
        })
        .eq('id', id)
        .select('id, slug, objectives, topic_tags, danielson_domains, roles')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ success: true, updated_fields: Object.keys(updates), quick_win: data })
    }

    // ── unpublish: the pull lane ──
    //
    // Rae's tiered policy (standard section 5) needs a way to take a broken item
    // down. There was none, so in August she had to run the unpublishes by hand
    // in the database while the agent that found them watched. The reason is
    // required and lands in qa_notes, because an item that comes down silently
    // is indistinguishable from one that was never published.
    if (action === 'unpublish') {
      const { id, slug, reason, unpublished_by, dryRun } = body

      if (!id && !slug) return NextResponse.json({ error: 'id or slug is required' }, { status: 400 })
      if (!reason?.trim()) {
        return NextResponse.json(
          { error: 'reason is required and is written to qa_notes, so every unpublish says why it happened' },
          { status: 400 },
        )
      }
      if (!unpublished_by?.trim()) {
        return NextResponse.json({ error: 'unpublished_by is required (who pulled it)' }, { status: 400 })
      }

      const lookup = supabase.from('hub_quick_wins').select('*')
      const { data: qw, error: fetchErr } = await (id ? lookup.eq('id', id) : lookup.eq('slug', slug)).maybeSingle()

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
      if (!qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
      if (!qw.is_published) {
        return NextResponse.json({ error: 'Quick Win is already unpublished' }, { status: 400 })
      }

      const stamp = new Date().toISOString()
      const auditLine = `${stamp.slice(0, 10)} UNPUBLISHED by ${unpublished_by.trim()}: ${reason.trim()}`

      if (dryRun) {
        return NextResponse.json({
          dry_run: true, id: qw.id, slug: qw.slug, title: qw.title,
          current_lane: scoreItem(qw as ScoredRow).lane,
          would_append_to_qa_notes: auditLine,
        })
      }

      const { error: pullErr } = await supabase
        .from('hub_quick_wins')
        .update({
          is_published: false,
          status: 'pending_review',
          qa_notes: qw.qa_notes ? `${qw.qa_notes}\n${auditLine}` : auditLine,
          updated_at: stamp,
        })
        .eq('id', qw.id)

      if (pullErr) return NextResponse.json({ error: pullErr.message }, { status: 500 })

      // Read back rather than trusting the update. Writes on this table have
      // silently dropped fields before (TEA-236), and a 200 proved nothing.
      const { data: after } = await supabase
        .from('hub_quick_wins')
        .select('id, slug, is_published, status')
        .eq('id', qw.id)
        .single()

      if (after?.is_published !== false) {
        return NextResponse.json(
          { error: 'Unpublish did not stick. The row still reads is_published true after the write.' },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, verified: true, ...after })
    }

    // ── review_published: the stamp lane ──
    //
    // mark_reviewed refuses live rows, which is right for the normal flow: QA
    // happens before publish. But 181 of 263 live items were published without
    // ever passing QA, and there was no way to record a review on them without
    // taking them down first. That turned a provenance gap into a content
    // outage, so nobody did it and the number never moved.
    //
    // This records a real review on a live item. It cannot be used to wave
    // something through: anything with a substantive defect is refused and has
    // to go through the replace path instead.
    if (action === 'review_published') {
      const { id, slug, reviewed_by, notes, dryRun } = body

      if (!id && !slug) return NextResponse.json({ error: 'id or slug is required' }, { status: 400 })
      if (!reviewed_by?.trim()) {
        return NextResponse.json({ error: 'reviewed_by is required (who ran QA)' }, { status: 400 })
      }

      const lookup = supabase.from('hub_quick_wins').select('*')
      const { data: qw, error: fetchErr } = await (id ? lookup.eq('id', id) : lookup.eq('slug', slug)).maybeSingle()

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
      if (!qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
      if (!qw.is_published) {
        return NextResponse.json(
          { error: 'This Quick Win is a draft. Use mark_reviewed, which is the pre-publish gate.' },
          { status: 400 },
        )
      }

      const { lane, defects } = scoreItem(qw as ScoredRow)
      if (lane === 'pull' || lane === 'replace') {
        return NextResponse.json({
          success: false,
          lane,
          defects,
          error: lane === 'pull'
            ? 'This item is functionally broken. Unpublish it, do not review it.'
            : 'This item has substantive defects. Rebuild it to the standard, do not stamp it as reviewed.',
        }, { status: 400 })
      }

      const stamp = new Date().toISOString()
      const auditLine = `${stamp.slice(0, 10)} reviewed against ${RUBRIC_VERSION} by ${reviewed_by.trim()}` +
        (notes?.trim() ? `: ${notes.trim()}` : '')

      if (dryRun) {
        return NextResponse.json({ dry_run: true, id: qw.id, slug: qw.slug, lane, would_append_to_qa_notes: auditLine })
      }

      const { error: reviewErr } = await supabase
        .from('hub_quick_wins')
        .update({
          reviewed_by: reviewed_by.trim(),
          reviewed_at: stamp,
          qa_notes: qw.qa_notes ? `${qw.qa_notes}\n${auditLine}` : auditLine,
          updated_at: stamp,
        })
        .eq('id', qw.id)

      if (reviewErr) return NextResponse.json({ error: reviewErr.message }, { status: 500 })

      const { data: after } = await supabase
        .from('hub_quick_wins')
        .select('id, slug, reviewed_at, reviewed_by, qa_notes')
        .eq('id', qw.id)
        .single()

      // The stamp is the whole point of this action. If it did not land, the
      // audit trail is wrong in the direction that looks fine, so say so.
      if (!after?.qa_notes?.includes(RUBRIC_VERSION)) {
        return NextResponse.json(
          { error: `Review did not stick. ${RUBRIC_VERSION} is not in qa_notes after the write.` },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true, verified: true,
        id: after.id, slug: after.slug,
        reviewed_at: after.reviewed_at, reviewed_by: after.reviewed_by,
        rubric_version: RUBRIC_VERSION,
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[content-sync] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
