import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * POST /api/admin/provision-roster
 *
 * Batch provisions Hub All-Access for all staff in a partnership's roster.
 * Creates hub_memberships records for each staff member who doesn't already have one.
 * Updates staff_members.hub_enrolled = true for each provisioned member.
 *
 * Body: { partnershipId }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { partnershipId } = await request.json();
    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const portalSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

    if (!hubUrl || !hubKey) {
      return NextResponse.json({ error: 'Hub Supabase not configured' }, { status: 500 });
    }

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all staff who aren't provisioned yet
    const { data: staff, error: staffError } = await portalSupabase
      .from('staff_members')
      .select('id, email, first_name, last_name')
      .eq('partnership_id', partnershipId)
      .eq('hub_enrolled', false);

    if (staffError) {
      return NextResponse.json({ error: staffError.message }, { status: 500 });
    }

    if (!staff || staff.length === 0) {
      return NextResponse.json({ success: true, provisioned: 0, message: 'All staff already provisioned.' });
    }

    let provisioned = 0;
    let failed = 0;

    for (const member of staff) {
      if (!member.email) continue;

      // Create Hub membership
      const { error: membershipError } = await hubSupabase
        .from('hub_memberships')
        .upsert({
          email: member.email.toLowerCase(),
          tier: 'all_access',
          source: 'district_partner',
          partnership_id: partnershipId,
          is_active: true,
        }, { onConflict: 'email' });

      if (!membershipError) {
        // Mark as enrolled in portal
        await portalSupabase
          .from('staff_members')
          .update({
            hub_enrolled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id);

        provisioned++;
      } else {
        console.error('[provision-roster] Failed for:', member.email, membershipError.message);
        failed++;
      }
    }

    // Mark the "Provision staff Hub accounts" action item as completed
    await portalSupabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: auth.member.email,
        updated_at: new Date().toISOString(),
      })
      .eq('partnership_id', partnershipId)
      .ilike('title', '%provision%hub%')
      .eq('status', 'pending');

    // Log activity
    await portalSupabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_provisioned',
      details: { provisioned, failed, total: staff.length, by: auth.member.email },
    });

    return NextResponse.json({
      success: true,
      provisioned,
      failed,
      total: staff.length,
      message: `Provisioned Hub All-Access for ${provisioned} staff member${provisioned !== 1 ? 's' : ''}.${failed > 0 ? ` ${failed} failed.` : ''}`,
    });
  } catch (error) {
    console.error('[provision-roster] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
