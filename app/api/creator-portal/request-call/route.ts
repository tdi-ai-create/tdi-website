import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { creatorRequestedCall } from '@/lib/creator-slack'

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

    // Slack notification for call request
    try {
      const { data: feedbackRow } = await supabase
        .from('creator_milestone_feedback')
        .select('creator_id, milestone_record_id')
        .eq('id', feedback_id)
        .single()
      if (feedbackRow) {
        const { data: creator } = await supabase
          .from('creators')
          .select('name')
          .eq('id', feedbackRow.creator_id)
          .single()
        const { data: milestoneRec } = await supabase
          .from('creator_milestones')
          .select('milestone_id')
          .eq('id', feedbackRow.milestone_record_id)
          .single()
        const { data: milestone } = milestoneRec?.milestone_id
          ? await supabase.from('milestones').select('title').eq('id', milestoneRec.milestone_id).single()
          : { data: null }
        creatorRequestedCall(
          creator?.name || 'Unknown creator',
          milestone?.title || `Milestone ${milestoneRec?.milestone_id || '?'}`
        ).catch(() => {})
      }
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[request-call] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
