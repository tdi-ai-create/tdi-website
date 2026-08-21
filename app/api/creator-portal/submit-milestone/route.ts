import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { creatorSubmittedDeliverable } from '@/lib/creator-slack'
import { recordSubmission } from '@/lib/creator-submissions'

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

    // One recorder, shared with the portal's own submit route, so the two can
    // never diverge again. They already had: this one recorded submissions
    // properly and was reachable only after feedback existed, while the route
    // the portal actually calls recorded nothing.
    const recorded = await recordSubmission(supabase, {
      milestoneRecordId: milestone_record_id,
      creatorId: milestoneRecord.creator_id,
      submittedValue: submitted_value,
      submissionNotes: submission_notes || null,
      stepName: null,
      announce: false,
    })

    if (!recorded.ok) {
      return NextResponse.json({ error: recorded.error }, { status: 500 })
    }

    const { error: statusError } = await supabase
      .from('creator_milestones')
      .update({ status: 'waiting_approval', updated_at: new Date().toISOString() })
      .eq('id', milestone_record_id)

    if (statusError) {
      console.error('[submit-milestone] Could not move the step to waiting_approval:', statusError.message)
    }

    // Also bump creator updated_at
    const { error: touchError } = await supabase
      .from('creators')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', milestoneRecord.creator_id)

    if (touchError) {
      console.error('[submit-milestone] Could not bump the creator timestamp:', touchError.message)
    }

    // Slack notification -- get creator name and milestone label for context
    try {
      const { data: creator } = await supabase
        .from('creators')
        .select('name')
        .eq('id', milestoneRecord.creator_id)
        .single()
      const { data: milestone } = await supabase
        .from('milestones')
        .select('name')
        .eq('id', milestoneRecord.milestone_id)
        .single()
      creatorSubmittedDeliverable(
        creator?.name || 'Unknown creator',
        milestone?.name || `Milestone ${milestoneRecord.milestone_id}`,
        recorded.version
      ).catch(() => {})
    } catch { /* non-blocking */ }

    return NextResponse.json({
      success: true,
      submission_version: recorded.version,
      feedback_id: recorded.feedbackId,
    })
  } catch (err) {
    console.error('[submit-milestone] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
