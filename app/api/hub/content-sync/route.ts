import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// PDF upload via base64 can be slow
export const maxDuration = 60

/**
 * Hub Content Sync API -- Bridge between Paperclip agents and the Learning Hub
 *
 * Paperclip agents (Dr. Jasmine Cole, Julie Lynn, Nora) call this endpoint to:
 * - List draft Quick Wins (list_drafts)
 * - Get pipeline status (get_status)
 * - Create a new Quick Win draft (create_draft)
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

const VALID_CATEGORIES = [
  'Lesson Planning', 'Assessment', 'Instructional Strategies',
  'Classroom Setup', 'Classroom Management', 'Communication',
  'Time Savers', 'Leadership', 'Self-Care', 'Stress Relief',
  'Games', 'Vocational',
]

const VALID_TYPES = ['read', 'watch', 'do', 'download', 'reflect']
const VALID_CAPACITIES = ['low', 'medium', 'high']
const VALID_TIERS = ['free_rotating', 'essentials', 'professional', 'all_access']

// ────────────────────────────────────────────────────────────
// GET -- read-only queries
// ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const supabase = db()

  if (action === 'list_drafts') {
    const { data: drafts, error } = await supabase
      .from('hub_quick_wins')
      .select('id, title, slug, category, description, thumbnail_url, file_url, danielson_domains, roles, created_at, updated_at')
      .eq('is_published', false)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = (drafts || []).map(d => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      category: d.category,
      description: d.description,
      has_thumbnail: !!d.thumbnail_url,
      has_pdf: !!d.file_url,
      has_roles: Array.isArray(d.roles) && d.roles.length > 0,
      has_danielson: Array.isArray(d.danielson_domains) && d.danielson_domains.length > 0,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }))

    return NextResponse.json({ drafts: items, count: items.length })
  }

  if (action === 'get_status') {
    const { data: all } = await supabase
      .from('hub_quick_wins')
      .select('id, is_published, thumbnail_url, file_url')

    const items = all || []
    const published = items.filter(i => i.is_published)
    const drafts = items.filter(i => !i.is_published)

    return NextResponse.json({
      total: items.length,
      published: published.length,
      drafts: drafts.length,
      drafts_missing_thumbnail: drafts.filter(d => !d.thumbnail_url).length,
      drafts_missing_pdf: drafts.filter(d => !d.file_url).length,
    })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}

// ────────────────────────────────────────────────────────────
// POST -- mutations
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
      if (!description?.trim()) return NextResponse.json({ error: 'description is required' }, { status: 400 })

      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (!cleanSlug) return NextResponse.json({ error: 'slug must contain alphanumeric characters or hyphens' }, { status: 400 })

      if (category && !VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
      }

      const insertPayload: Record<string, unknown> = {
        title: title.trim(),
        slug: cleanSlug,
        description: description.trim(),
        category: category || null,
        duration_minutes: body.duration_minutes || null,
        capacity: VALID_CAPACITIES.includes(body.capacity) ? body.capacity : null,
        danielson_domains: Array.isArray(body.danielson_domains) ? body.danielson_domains : [],
        roles: Array.isArray(body.roles) ? body.roles : [],
        access_tier: VALID_TIERS.includes(body.access_tier) ? body.access_tier : 'professional',
        creator_name: body.creator_name || null,
        is_published: false,
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

    // ── upload_pdf: store a PDF and link it to a Quick Win ──
    if (action === 'upload_pdf') {
      const { quick_win_id, content_base64, content_type } = body

      if (!quick_win_id) return NextResponse.json({ error: 'quick_win_id is required' }, { status: 400 })
      if (!content_base64) return NextResponse.json({ error: 'content_base64 is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, slug')
        .eq('id', quick_win_id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      const buffer = Buffer.from(content_base64, 'base64')
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF exceeds 10MB limit' }, { status: 400 })
      }

      const mime = content_type || 'application/pdf'
      const ext = mime === 'application/pdf' ? 'pdf' : mime.split('/')[1] || 'pdf'
      const storagePath = `quick-wins/${qw.id}/${qw.slug}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('hub-assets')
        .upload(storagePath, buffer, { contentType: mime, upsert: true })

      if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

      const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
      const publicUrl = urlData?.publicUrl

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({ file_url: publicUrl, file_path: storagePath, file_type: mime, storage_path: storagePath })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      return NextResponse.json({ success: true, file_url: publicUrl, storage_path: storagePath })
    }

    // ── upload_thumbnail: store a thumbnail image for a Quick Win ──
    if (action === 'upload_thumbnail') {
      const { quick_win_id, content_base64, content_type } = body

      if (!quick_win_id) return NextResponse.json({ error: 'quick_win_id is required' }, { status: 400 })
      if (!content_base64) return NextResponse.json({ error: 'content_base64 is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id')
        .eq('id', quick_win_id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      const buffer = Buffer.from(content_base64, 'base64')
      if (buffer.length > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Thumbnail exceeds 2MB limit' }, { status: 400 })
      }

      const mime = content_type || 'image/png'
      const ext = mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpg' : 'png'
      const storagePath = `cover-images/quick-wins/${qw.id}/thumbnail.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('hub-assets')
        .upload(storagePath, buffer, { contentType: mime, upsert: true, cacheControl: '3600' })

      if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

      const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
      const thumbnailUrl = urlData?.publicUrl

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      return NextResponse.json({ success: true, thumbnail_url: thumbnailUrl })
    }

    // ── publish: validate and publish a Quick Win ──
    if (action === 'publish') {
      const { quick_win_id } = body

      if (!quick_win_id) return NextResponse.json({ error: 'quick_win_id is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('*')
        .eq('id', quick_win_id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      if (qw.is_published) {
        return NextResponse.json({ error: 'Quick Win is already published' }, { status: 400 })
      }

      const errors: string[] = []
      if (!qw.title?.trim()) errors.push('title is required')
      if (!qw.description?.trim()) errors.push('description is required')
      if (!qw.category) errors.push('category is required')
      if (!qw.thumbnail_url) errors.push('thumbnail is required before publishing')
      if (!Array.isArray(qw.danielson_domains) || qw.danielson_domains.length === 0) errors.push('at least one danielson_domain is required')
      if (!Array.isArray(qw.roles) || qw.roles.length === 0) errors.push('at least one role is required')

      if (errors.length > 0) {
        return NextResponse.json({ success: false, errors }, { status: 400 })
      }

      const { error: publishErr } = await supabase
        .from('hub_quick_wins')
        .update({ is_published: true })
        .eq('id', quick_win_id)

      if (publishErr) return NextResponse.json({ error: publishErr.message }, { status: 500 })

      // The database trigger auto_seed_community (migration 104) will
      // automatically create 5 role-aware community posts

      return NextResponse.json({
        success: true,
        quick_win_id,
        published: true,
        note: 'Auto-seed trigger will create 5 community posts',
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[content-sync] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
