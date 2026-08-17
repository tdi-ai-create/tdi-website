import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { STANDARD_OPPORTUNITIES, STANDARD_ACTIONS, computeDueDate } from '@/lib/funding-pursuit-template';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/funding/pursuits
 *
 * Create a new funding pursuit. Can be linked to a partnership.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const {
      pursuitName,
      districtName,
      partnershipId,
      totalAmount,
      contractGap,
      implementationDate,
      schoolProfile,
      fundingPaths,
      clientContactName,
      clientContactEmail,
      clientContactPhone,
      clientContactRole,
    } = body;

    if (!districtName) {
      return NextResponse.json({ error: 'District name is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const bufferAmount = Math.round((contractGap || totalAmount || 0) * 0.15);

    const { data, error } = await supabase
      .from('funding_pursuits')
      .insert({
        pursuit_name: pursuitName || `${districtName} Funding`,
        district_name: districtName,
        partnership_id: partnershipId || null,
        total_amount: totalAmount || 0,
        contract_gap: contractGap || totalAmount || 0,
        buffer_amount: bufferAmount,
        current_phase: 'intake',
        implementation_date: implementationDate || null,
        school_profile: schoolProfile ? JSON.stringify(schoolProfile) : '{}',
        // funding_paths is a legacy display field and this default was a second
        // hardcoded list of funding paths, separate from STANDARD_OPPORTUNITIES
        // and maintained by nobody. It seeded six generic labels that drifted
        // from the six real opportunities created immediately below, so a
        // pursuit began life with two disagreeing accounts of its own plan.
        //
        // Nothing reads it. It is declared in one leadership page's type and
        // never rendered, and two of the three live pursuits already have it
        // empty. Seeding a stale second list is worse than seeding nothing, so
        // it now stays empty unless a caller explicitly supplies paths.
        //
        // The column is left in place rather than dropped: removing it is a
        // migration with no benefit, and an empty array is already what most
        // rows hold.
        funding_paths: fundingPaths ? JSON.stringify(fundingPaths) : JSON.stringify([]),
        next_action_label: 'Build school profile (Phase 1)',
        next_action_urgency: 'info',
        client_contact_name: clientContactName || null,
        client_contact_email: clientContactEmail || null,
        client_contact_phone: clientContactPhone || null,
        client_contact_role: clientContactRole || null,
        internal_notes: `Created by ${auth.member.email}`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-generate standard funding opportunities.
    //
    // This used to copy six fields and drop the rest. The template also defines
    // window_status_default, window_verifier, default_agent and notes for every
    // opportunity, all of which were read and thrown away.
    //
    // The cost showed up much later and looked like something else. Every new
    // opportunity arrived with no assigned agent and no window status, so
    // find_work — which requires window_status 'open' — could not release it,
    // and somebody had to notice and set both by hand. Nothing surfaced that
    // they were missing, so what it looked like was drafting quietly not
    // happening.
    const oppInserts = STANDARD_OPPORTUNITIES.map(opp => ({
      pursuit_id: data.id,
      name: opp.name,
      amount: opp.amount_estimate,
      status: opp.status,
      plan_category: opp.plan_category,
      waiting_on: opp.waiting_on,
      narrative_status: opp.narrative_status,
      // Previously discarded:
      window_status: opp.window_status_default,
      assigned_agent: opp.default_agent,
      notes: opp.notes,
    }));

    await supabase.from('funding_opportunities').insert(oppInserts);

    // Auto-generate standard action items with computed due dates
    const actionInserts = STANDARD_ACTIONS.map(action => ({
      pursuit_id: data.id,
      owner_type: action.owner_type,
      owner_email: action.owner_type === 'tdi' ? 'hello@teachersdeserveit.com' : null,
      owner_name: action.owner_type === 'tdi' ? 'Bella' : null,
      title: action.title,
      description: action.description,
      status: 'pending',
      due_date: computeDueDate(implementationDate, action.weeks_before_implementation),
      category: action.category,
      sort_order: action.sort_order,
    }));

    await supabase.from('funding_action_items').insert(actionInserts);

    // Create initial timeline event
    await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: data.id,
      event_date: new Date().toISOString().split('T')[0],
      event_title: 'Pursuit created',
      event_detail: `${oppInserts.length} funding opportunities and ${actionInserts.length} action items auto-generated from template.`,
      status: 'complete',
      display_order: 1,
    });

    return NextResponse.json({ success: true, pursuit: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * PATCH /api/funding/pursuits
 *
 * Update a pursuit's phase, paths, profile, or notes.
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { pursuitId, ...updates } = await request.json();
    if (!pursuitId) {
      return NextResponse.json({ error: 'pursuitId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const fields = ['pursuit_name', 'current_phase', 'funding_paths', 'school_profile', 'total_amount', 'contract_gap', 'buffer_amount', 'implementation_date', 'next_action_label', 'next_action_urgency', 'next_action_owner_email', 'internal_notes', 'submission_deadline', 'expected_decision_date', 'paths_submitted', 'paths_awarded', 'total_awarded', 'is_stalled', 'client_contact_name', 'client_contact_email', 'client_contact_phone', 'client_contact_role', 'operational_owner_email', 'strategy_owner_email', 'drafting_owner_email', 'final_approver_email', 'archived'];

    for (const f of fields) {
      if (updates[f] !== undefined) {
        allowed[f] = typeof updates[f] === 'object' ? JSON.stringify(updates[f]) : updates[f];
      }
    }

    // Record the transition, not just the fact that one happened.
    //
    // Only current_phase and last_phase_change_at were kept, so the pursuit
    // could say where it is and when it last moved, but never where it had
    // been. There is no phase history anywhere: zero phase-change events in the
    // timeline, and no table storing them.
    //
    // That makes "collapse the phases you have finished" impossible to build
    // honestly, because nothing can say which records belong to which phase.
    // Grouping them by guesswork would produce exactly the kind of summary
    // people trust and that turns out to be wrong.
    //
    // Writing it to the timeline rather than a new table, because the timeline
    // is already the durable record and funding_record already reads it. History
    // starts from here; it cannot be reconstructed backwards.
    if (updates.current_phase) {
      allowed.last_phase_change_at = new Date().toISOString();

      const { data: prior } = await supabase
        .from('funding_pursuits')
        .select('current_phase')
        .eq('id', pursuitId)
        .single();

      if (prior?.current_phase !== updates.current_phase) {
        await supabase.from('funding_pursuit_timeline').insert({
          pursuit_id: pursuitId,
          event_date: new Date().toISOString().split('T')[0],
          event_title: `Phase: ${prior?.current_phase ?? 'unset'} → ${updates.current_phase}`,
          event_detail:
            `Moved by ${auth.member.email}. Recorded so the work done in each phase can ` +
            `later be collapsed and reviewed against the phase it belonged to.`,
          status: 'complete',
        });
      }
    }

    const { error } = await supabase
      .from('funding_pursuits')
      .update(allowed)
      .eq('id', pursuitId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
