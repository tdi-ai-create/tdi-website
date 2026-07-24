import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Community Seed API -- Lets Paperclip agents create additional community posts
 *
 * The auto_seed_community trigger (migration 104) creates 5 posts on publish.
 * This endpoint lets agents add more targeted, content-aware posts afterward
 * (e.g., Dr. Jasmine Cole seeding posts 24 hours after publish).
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

// Seeded user IDs from migration 104 (must exist in Hub auth.users)
// [1]=Pam(teacher), [2]=Michelle(para), [3]=Christine(coach), [4]=Matilde(para), [5]=Todd(teacher)
const SEEDED_USERS: Record<string, string> = {
  'c3c1c7a9-e084-47b8-9945-15423f154ca9': 'teacher',  // Pam
  '7a502d0a-29e9-4490-b330-ea1131311d44': 'para',      // Michelle
  '4236f26b-88a7-4ae9-abf6-65cd09e9fdd9': 'coach',     // Christine
  'd532b342-5aff-420d-8201-ae1d6564650c': 'para',      // Matilde
  '63e924ff-dfc6-4f24-9da2-950dae9b65d9': 'teacher',   // Todd
}

const VALID_TYPES = ['tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land']

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { quick_win_id, user_id, contribution_type, title } = body
    const postBody = body.body as string | undefined

    if (!quick_win_id) return NextResponse.json({ error: 'quick_win_id is required' }, { status: 400 })
    if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    if (!contribution_type) return NextResponse.json({ error: 'contribution_type is required' }, { status: 400 })
    if (!postBody?.trim()) return NextResponse.json({ error: 'body is required (min 10 characters)' }, { status: 400 })
    if (postBody.trim().length < 10) return NextResponse.json({ error: 'body must be at least 10 characters' }, { status: 400 })
    if (postBody.length > 2000) return NextResponse.json({ error: 'body must be under 2000 characters' }, { status: 400 })

    if (!(user_id in SEEDED_USERS)) {
      return NextResponse.json({
        error: 'user_id must be one of the seeded users',
        valid_users: Object.entries(SEEDED_USERS).map(([id, role]) => ({ id, role })),
      }, { status: 400 })
    }

    if (!VALID_TYPES.includes(contribution_type)) {
      return NextResponse.json({ error: `contribution_type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }

    const supabase = db()

    // Verify the Quick Win exists and is published
    const { data: qw, error: fetchErr } = await supabase
      .from('hub_quick_wins')
      .select('id, is_published, title')
      .eq('id', quick_win_id)
      .single()

    if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })
    if (!qw.is_published) return NextResponse.json({ error: 'Quick Win must be published before seeding community posts' }, { status: 400 })

    const { data: post, error: insertErr } = await supabase
      .from('quick_win_responses')
      .insert({
        quick_win_id: qw.id.toString(),
        user_id,
        contribution_type,
        title: title || null,
        body: postBody.trim(),
        helpful_count: Math.floor(Math.random() * 12) + 1,
      })
      .select('id')
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      post_id: post?.id,
      quick_win_id,
      user_role: SEEDED_USERS[user_id],
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[community-seed] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
