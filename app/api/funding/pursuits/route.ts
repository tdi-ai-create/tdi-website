import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

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
        internal_notes: `Created by ${auth.member.email}`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    const fields = ['current_phase', 'funding_paths', 'school_profile', 'total_amount', 'contract_gap', 'buffer_amount', 'implementation_date', 'next_action_label', 'next_action_urgency', 'next_action_owner_email', 'internal_notes', 'submission_deadline', 'expected_decision_date', 'paths_submitted', 'paths_awarded', 'total_awarded', 'is_stalled'];

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
