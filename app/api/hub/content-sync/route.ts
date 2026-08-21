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
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 */

// Canonical vocabularies. The Hub matches both case-sensitively:
// lift drives the capacity badge (quick-wins/page.tsx), domains drive filtering.
// A value outside these sets does not error, it just silently renders nothing,
// which is how 21 Quick Wins shipped with a blank lift badge.
const VALID_LIFT = ['LOW', 'MED', 'HIGH'] as const
const VALID_DOMAINS = ['1-planning', '2-environment', '3-instruction', '4-professional'] as const

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

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[content-sync] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
