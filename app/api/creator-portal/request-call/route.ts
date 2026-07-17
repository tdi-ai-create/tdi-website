import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { feedback_id } = await request.json()

    if (!feedback_id) {
      return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
    }

    const supabase = db()

    const { data, error } = await supabase
      .from('creator_milestone_feedback')
      .update({
        call_requested: true,
        call_requested_at: new Date().toISOString(),
      })
      .eq('id', feedback_id)
      .eq('visible_to_creator', true)
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Feedback not found or not accessible' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[request-call] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
