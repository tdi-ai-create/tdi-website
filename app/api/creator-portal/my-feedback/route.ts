import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl
    const creatorId = url.searchParams.get('creator_id')

    if (!creatorId) {
      return NextResponse.json({ error: 'creator_id required' }, { status: 400 })
    }

    const supabase = db()

    // Get all visible feedback for this creator
    const { data: feedback, error } = await supabase
      .from('creator_milestone_feedback')
      .select(`
        *,
        creator_milestones!milestone_record_id (
          id,
          milestone_id,
          status,
          review_status
        )
      `)
      .eq('creator_id', creatorId)
      .eq('visible_to_creator', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get all submissions (visible or not) so creator can see submission history
    const { data: submissions } = await supabase
      .from('creator_milestone_feedback')
      .select('id, milestone_record_id, submission_version, submitted_value, submission_notes, submitted_at, feedback_draft_status, visible_to_creator')
      .eq('creator_id', creatorId)
      .order('submitted_at', { ascending: true })

    // Get milestone names
    const milestoneIds = [...new Set(
      (feedback || [])
        .map((f: any) => f.creator_milestones?.milestone_id)
        .filter(Boolean)
    )]

    let milestoneNames: Record<string, string> = {}
    if (milestoneIds.length > 0) {
      const { data: milestones } = await supabase
        .from('milestones')
        .select('id, title')
        .in('id', milestoneIds)

      milestoneNames = Object.fromEntries(
        (milestones || []).map((m: any) => [m.id, m.title])
      )
    }

    // Group feedback by milestone
    const byMilestone: Record<string, any[]> = {}
    for (const f of (feedback || [])) {
      const milestoneRecordId = f.milestone_record_id
      if (!byMilestone[milestoneRecordId]) {
        byMilestone[milestoneRecordId] = []
      }
      byMilestone[milestoneRecordId].push({
        ...f,
        milestone_title: milestoneNames[f.creator_milestones?.milestone_id] || 'Milestone',
      })
    }

    // Build submission summary per milestone
    const submissionsByMilestone: Record<string, any[]> = {}
    for (const s of (submissions || [])) {
      const key = s.milestone_record_id
      if (!submissionsByMilestone[key]) {
        submissionsByMilestone[key] = []
      }
      submissionsByMilestone[key].push(s)
    }

    return NextResponse.json({
      feedback: feedback || [],
      by_milestone: byMilestone,
      submissions: submissionsByMilestone,
      milestone_names: milestoneNames,
    })
  } catch (err) {
    console.error('[my-feedback] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
