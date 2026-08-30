import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { PLAYBOOK_STEPS, getStepDueDate, getPlaybookPhases } from '@/lib/funding-playbook';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * GET /api/funding/pursuits/[id]/playbook
 *
 * Returns the playbook steps with completion status and due dates
 * for a specific pursuit.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: pursuitId } = await params;
  const supabase = getSupabaseAdmin();

  // Get pursuit for implementation date
  const { data: pursuit } = await supabase
    .from('funding_pursuits')
    .select('id, pursuit_name, implementation_date, school_profile, current_phase')
    .eq('id', pursuitId)
    .single();

  if (!pursuit) {
    return NextResponse.json({ error: 'Pursuit not found' }, { status: 404 });
  }

  // Get completed steps from timeline
  const { data: completedSteps } = await supabase
    .from('funding_pursuit_timeline')
    .select('event_title, status, event_detail')
    .eq('pursuit_id', pursuitId);

  const completedIds = new Set(
    (completedSteps || [])
      .filter(s => s.status === 'complete')
      .map(s => s.event_title)
  );

  // Build phases with steps and due dates
  const phases = getPlaybookPhases().map(phase => ({
    phase: phase.phase,
    steps: phase.steps.map(step => ({
      ...step,
      completed: completedIds.has(step.id),
      dueDate: pursuit.implementation_date
        ? getStepDueDate(step, pursuit.implementation_date).toISOString().split('T')[0]
        : null,
      isOverdue: pursuit.implementation_date
        ? getStepDueDate(step, pursuit.implementation_date) < new Date() && !completedIds.has(step.id)
        : false,
    })),
  }));

  const totalSteps = PLAYBOOK_STEPS.length;
  const completedCount = completedIds.size;
  const nextStep = PLAYBOOK_STEPS.find(s => !completedIds.has(s.id));

  return NextResponse.json({
    pursuit: {
      id: pursuit.id,
      name: pursuit.pursuit_name,
      implementationDate: pursuit.implementation_date,
      currentPhase: pursuit.current_phase,
    },
    phases,
    progress: {
      completed: completedCount,
      total: totalSteps,
      pct: totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0,
    },
    nextStep: nextStep ? {
      id: nextStep.id,
      title: nextStep.title,
      description: nextStep.description,
      canDelegate: nextStep.canDelegate,
      dueDate: pursuit.implementation_date
        ? getStepDueDate(nextStep, pursuit.implementation_date).toISOString().split('T')[0]
        : null,
    } : null,
  });
}

/**
 * POST /api/funding/pursuits/[id]/playbook
 *
 * Mark a step as complete or add a note to a step.
 * Body: { stepId, action: 'complete' | 'note', note?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: pursuitId } = await params;
  const { stepId, action, note } = await request.json();

  if (!stepId) {
    return NextResponse.json({ error: 'stepId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const step = PLAYBOOK_STEPS.find(s => s.id === stepId);

  if (!step) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }

  if (action === 'complete') {
    // Add to timeline as complete.
    //
    // This upserted on (pursuit_id, event_title). funding_pursuit_timeline has
    // no unique index on that pair, only its primary key, so Postgres answered
    // 42P10 every time and the error was discarded. Marking a playbook step
    // complete has never written a timeline row. Look it up, then insert or
    // update, which needs no constraint.
    const timelineFields = {
      event_date: new Date().toISOString().split('T')[0],
      event_detail: note || `Completed: ${step.title}`,
      status: 'complete',
      display_order: PLAYBOOK_STEPS.indexOf(step),
    };

    const { data: existingEvent, error: timelineLookupError } = await supabase
      .from('funding_pursuit_timeline')
      .select('id')
      .eq('pursuit_id', pursuitId)
      .eq('event_title', stepId)
      .maybeSingle();

    if (timelineLookupError) {
      console.error('[playbook] timeline lookup failed:', timelineLookupError.message);
      return NextResponse.json({ error: timelineLookupError.message }, { status: 500 });
    }

    const { error: timelineError } = existingEvent
      ? await supabase.from('funding_pursuit_timeline').update(timelineFields).eq('id', existingEvent.id)
      : await supabase.from('funding_pursuit_timeline').insert({
          pursuit_id: pursuitId,
          event_title: stepId,
          ...timelineFields,
        });

    // Recording the step is the point of this request, so do not report success
    // over a write that did not happen.
    if (timelineError) {
      console.error('[playbook] timeline write failed:', timelineError.message);
      return NextResponse.json({ error: timelineError.message }, { status: 500 });
    }

    // Update pursuit phase based on completed steps
    const phaseMap: Record<string, string> = {
      'Build school profile': 'researching',
      'Search for funders': 'strategy',
      'Scope with client': 'writing',
      'Write grant narratives': 'in_review',
      'Prepare submission packet': 'delivered',
      'Submit and track': 'submitted',
      'Follow up': 'awaiting_decision',
    };

    const newPhase = phaseMap[step.phase];
    if (newPhase) {
      const { error: phaseError } = await supabase
        .from('funding_pursuits')
        .update({
          current_phase: newPhase,
          last_phase_change_at: new Date().toISOString(),
          next_action_label: null, // Will be set by next step
          updated_at: new Date().toISOString(),
        })
        .eq('id', pursuitId);

      // The step is recorded either way, but a pursuit stuck in the wrong phase
      // is the kind of thing that gets noticed weeks later.
      if (phaseError) {
        console.error('[playbook] phase not advanced:', phaseError.message);
      }
    }

    // Also add as a note on the linked partnership
    const { data: pursuit } = await supabase
      .from('funding_pursuits')
      .select('partnership_id')
      .eq('id', pursuitId)
      .single();

    if (pursuit?.partnership_id) {
      const { error: noteError } = await supabase.from('partnership_notes').insert({
        partnership_id: pursuit.partnership_id,
        content: `Grant step completed: ${step.title}${note ? `. ${note}` : ''}`,
        author: auth.member.email || 'TDI System',
        note_type: 'general',
        visible_to_partner: false,
      });

      if (noteError) {
        console.error('[playbook] partnership note not written:', noteError.message);
      }
    }
  }

  if (action === 'note' && note) {
    // Add a note to the pursuit's internal_notes
    const { data: pursuit } = await supabase
      .from('funding_pursuits')
      .select('internal_notes, partnership_id')
      .eq('id', pursuitId)
      .single();

    const timestamp = new Date().toISOString().split('T')[0];
    const newNote = `[${timestamp}] ${step.title}: ${note}`;
    const existingNotes = pursuit?.internal_notes || '';
    const updatedNotes = existingNotes ? `${newNote}\n\n${existingNotes}` : newNote;

    // Saving the note is the whole request, so say so if it did not save.
    const { error: notesError } = await supabase
      .from('funding_pursuits')
      .update({ internal_notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', pursuitId);

    if (notesError) {
      console.error('[playbook] internal note not saved:', notesError.message);
      return NextResponse.json({ error: notesError.message }, { status: 500 });
    }

    // Cross-reference: also add to partnership notes
    if (pursuit?.partnership_id) {
      const { error: crossRefError } = await supabase.from('partnership_notes').insert({
        partnership_id: pursuit.partnership_id,
        content: `Grant note (${step.title}): ${note}`,
        author: auth.member.email || 'TDI System',
        note_type: 'general',
        visible_to_partner: false,
      });

      if (crossRefError) {
        console.error('[playbook] cross-referenced note not written:', crossRefError.message);
      }
    }
  }

  return NextResponse.json({ success: true });
}
