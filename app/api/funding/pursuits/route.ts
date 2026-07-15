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
        funding_paths: fundingPaths ? JSON.stringify(fundingPaths) : JSON.stringify([
          { plan: 'A', label: 'Title II-A', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
          { plan: 'A', label: 'IDEA / CEIS', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
          { plan: 'A', label: 'Title I Part A', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
          { plan: 'B', label: 'State formula', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
          { plan: 'C', label: 'Foundation/corporate', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
          { plan: 'D', label: 'Crowdfunding/direct', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' },
        ]),
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

    // Auto-generate standard funding opportunities
    const oppInserts = STANDARD_OPPORTUNITIES.map(opp => ({
      pursuit_id: data.id,
      name: opp.name,
      amount: opp.amount_estimate,
      status: opp.status,
      plan_category: opp.plan_category,
      waiting_on: opp.waiting_on,
      narrative_status: opp.narrative_status,
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

    if (updates.current_phase) {
      allowed.last_phase_change_at = new Date().toISOString();
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
