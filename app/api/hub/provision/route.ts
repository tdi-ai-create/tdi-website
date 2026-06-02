import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/hub/provision
 * Provisions Hub access for a new partner contact.
 * Creates auth user + hub_profile + hub_membership in one call.
 * Used by Sales when a deal is signed.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, tier, source, dealId } = await request.json();

    if (!email || !tier) {
      return NextResponse.json({ error: 'Missing email or tier' }, { status: 400 });
    }

    const hub = getHubAdmin();

    // Check if user already exists
    const { data: existingProfile } = await hub
      .from('hub_profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create auth user
      const { data: authUser, error: authError } = await hub.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          display_name: name || email.split('@')[0],
          source: source || 'sales_deal',
        },
      });

      if (authError || !authUser?.user) {
        console.error('[Provision] Auth error:', authError);
        return NextResponse.json({ error: 'Failed to create user: ' + (authError?.message || 'unknown') }, { status: 500 });
      }

      userId = authUser.user.id;

      // Create hub_profile
      await hub.from('hub_profiles').upsert({
        id: userId,
        email,
        display_name: name || email.split('@')[0],
        role: 'school_leader',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // Create/update membership
    const { error: memberError } = await hub
      .from('hub_memberships')
      .upsert({
        user_id: userId,
        tier,
        source: source || 'sales_deal',
        status: 'active',
      }, { onConflict: 'user_id' });

    if (memberError) {
      console.error('[Provision] Membership error:', memberError);
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }

    // Log the provisioning
    await hub.from('hub_activity_log').insert({
      user_id: userId,
      action: 'account_provisioned',
      metadata: { tier, source, deal_id: dealId, provisioned_by: 'sales_panel' },
    });

    return NextResponse.json({
      success: true,
      userId,
      email,
      tier,
      isNew: !existingProfile,
    });
  } catch (error) {
    console.error('[Provision]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
