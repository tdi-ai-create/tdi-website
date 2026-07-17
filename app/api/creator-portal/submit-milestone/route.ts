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
    const { milestone_record_id, submitted_value, submission_notes } = await request.json()

    if (!milestone_record_id || !submitted_value) {
      return NextResponse.json({ error: 'milestone_record_id and submitted_value required' }, { status: 400 })
    }

    const supabase = db()

    // Get the milestone record to verify it exists and get creator_id
    const { data: milestoneRecord, error: milestoneError } = await supabase
      .from('creator_milestones')
      .select('id, creator_id, milestone_id, status')
      .eq('id', milestone_record_id)
      .single()

    if (milestoneError || !milestoneRecord) {
      return NextResponse.json({ error: 'Milestone record not found' }, { status: 404 })
    }

    // Verify milestone is in a submittable state
    const submittableStatuses = ['available', 'in_progress', 'waiting_approval']
    if (!submittableStatuses.includes(milestoneRecord.status)) {
      return NextResponse.json({ error: `Milestone is not in a submittable state (current: ${milestoneRecord.status})` }, { status: 400 })
    }

    // Calculate submission version (auto-increment based on existing submissions)
    const { count: existingCount } = await supabase
      .from('creator_milestone_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('milestone_record_id', milestone_record_id)

    const submissionVersion = (existingCount || 0) + 1

    // Create feedback row (submission without feedback yet)
    const { data: feedback, error: feedbackError } = await supabase
      .from('creator_milestone_feedback')
      .insert({
        milestone_record_id,
        creator_id: milestoneRecord.creator_id,
        submission_version: submissionVersion,
        submitted_value,
        submission_notes: submission_notes || null,
        submitted_at: new Date().toISOString(),
        visible_to_creator: false,
      })
      .select()
      .single()

    if (feedbackError) {
      return NextResponse.json({ error: feedbackError.message }, { status: 500 })
    }

    // Update creator_milestones: status, review_status, submitted values
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'waiting_approval',
        review_status: 'submitted',
        submitted_value,
        submission_notes: submission_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestone_record_id)

    if (updateError) {
      console.error('[submit-milestone] Error updating milestone:', updateError)
    }

    // Also bump creator updated_at
    await supabase
      .from('creators')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', milestoneRecord.creator_id)

    return NextResponse.json({
      success: true,
      submission_version: submissionVersion,
      feedback_id: feedback.id,
    })
  } catch (err) {
    console.error('[submit-milestone] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
