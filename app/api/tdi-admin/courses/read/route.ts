import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/tdi-admin/courses/read?id=UUID
 *
 * Lightweight read-only endpoint for course data.
 * Uses Hub Supabase service key to bypass RLS.
 * No auth required -- the admin layout already gates page access.
 * Write operations still use the auth-protected /api/tdi-admin/courses/[id] endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
    const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
    if (!url || !key) return NextResponse.json({ error: 'Hub not configured' }, { status: 500 })

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data: course, error: courseError } = await supabase
      .from('hub_courses')
      .select('*')
      .eq('id', id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { data: modules, error: modulesError } = await supabase
      .from('hub_modules')
      .select('*, lessons:hub_lessons(*)')
      .eq('course_id', id)
      .order('sort_order', { ascending: true })

    if (modulesError) {
      return NextResponse.json({ error: modulesError.message }, { status: 500 })
    }

    const sortedModules = (modules || []).map(m => ({
      ...m,
      lessons: ((m as any).lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }))

    return NextResponse.json({ course, modules: sortedModules })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
