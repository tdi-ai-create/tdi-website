import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
 * - Publish a Quick Win (publish)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 */

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
        tier: accessTier,
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

    // ── publish: validate and publish a Quick Win ──
    if (action === 'publish') {
      const { id } = body

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

      // Validate all required fields before publishing
      const missing: string[] = []
      if (!qw.title?.trim()) missing.push('title')
      if (!qw.description?.trim()) missing.push('description')
      if (!Array.isArray(qw.topic_tags) || qw.topic_tags.length === 0) missing.push('topic_tags')
      if (!Array.isArray(qw.roles) || qw.roles.length === 0) missing.push('roles')
      if (!qw.file_url) missing.push('file_url')

      if (missing.length > 0) {
        return NextResponse.json({ success: false, missing }, { status: 400 })
      }

      const { error: publishErr } = await supabase
        .from('hub_quick_wins')
        .update({
          is_published: true,
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (publishErr) return NextResponse.json({ error: publishErr.message }, { status: 500 })

      // The database trigger auto_seed_community (migration 104) will
      // automatically create 5 role-aware community posts

      return NextResponse.json({ success: true, id, slug: qw.slug })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[content-sync] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
