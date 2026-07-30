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

    // Get partnership slug for Hub nav toggle
    const { data: partnershipInfo } = await portalSupabase
      .from('partnerships')
      .select('slug')
      .eq('id', partnershipId)
      .single();

    const partnershipSlug = partnershipInfo?.slug || null;

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
      const email = member.email.toLowerCase();

      try {
        // Step 1: Find or create Hub user
        const { data: existingProfile } = await hubSupabase
          .from('hub_profiles')
          .select('id')
          .ilike('email', email)
          .maybeSingle();

        let userId: string;

        if (existingProfile) {
          userId = existingProfile.id;
        } else {
          // Create auth user in Hub
          const { data: authUser, error: authError } = await hubSupabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              display_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || email.split('@')[0],
              source: 'district_partner',
            },
          });

          if (authError || !authUser?.user) {
            console.error('[provision-roster] Auth error for:', email, authError?.message);
            failed++;
            continue;
          }

          userId = authUser.user.id;

          // Create hub_profile
          await hubSupabase.from('hub_profiles').upsert({
            id: userId,
            email,
            display_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || email.split('@')[0],
            first_name: member.first_name || null,
            last_name: member.last_name || null,
            partnership_id: partnershipId,
            partnership_slug: partnershipSlug,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        }

        // Step 2: Create/update Hub membership using user_id (not email)
        const { error: membershipError } = await hubSupabase
          .from('hub_memberships')
          .upsert({
            user_id: userId,
            tier: 'all_access',
            source: 'district_partner',
            status: 'active',
            partnership_id: partnershipId,
          }, { onConflict: 'user_id' });

        if (membershipError) {
          console.error('[provision-roster] Membership error for:', email, membershipError.message);
          failed++;
          continue;
        }

        // Step 3: Update existing profile with partnership info
        if (existingProfile) {
          await hubSupabase
            .from('hub_profiles')
            .update({
              partnership_id: partnershipId,
              partnership_slug: partnershipSlug,
              first_name: member.first_name || undefined,
              last_name: member.last_name || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }

        // Step 4: Mark as enrolled in portal
        await portalSupabase
          .from('staff_members')
          .update({
            hub_enrolled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id);

        provisioned++;
      } catch (err) {
        console.error('[provision-roster] Error for:', email, err);
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
