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
    const { email, name, tier, source, dealId, partnershipId } = await request.json();

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

      // Create hub_profile. The auth user already exists at this point, so a
      // failure here leaves someone who can sign in but has no profile, which
      // breaks every screen that joins on it. Worth failing the request.
      const { error: profileError } = await hub.from('hub_profiles').upsert({
        id: userId,
        email,
        display_name: name || email.split('@')[0],
        role: 'school_leader',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('[Provision] Profile error:', profileError);
        return NextResponse.json({ error: 'Failed to create profile: ' + profileError.message }, { status: 500 });
      }
    }

    // Create/update membership.
    //
    // partnershipId is the important part. This route did not accept one, and
    // the roster upload that calls it did not pass one, so every seat a school
    // provisioned through onboarding was created with partnership_id null. That
    // is why 38 live all-access seats belonged to no partnership on 29 Aug: not
    // a broken link, a link that was never made. Fifteen of those educators were
    // actively using the Hub and appeared on no leadership screen.
    const { error: memberError } = await hub
      .from('hub_memberships')
      .upsert({
        user_id: userId,
        tier,
        source: source || 'sales_deal',
        status: 'active',
        ...(partnershipId ? { partnership_id: partnershipId } : {}),
      }, { onConflict: 'user_id' });

    if (memberError) {
      console.error('[Provision] Membership error:', memberError);
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }

    // Log the provisioning. The seat is already live, so a failure here is not
    // worth failing the request over, but it must not pass silently.
    const { error: logError } = await hub.from('hub_activity_log').insert({
      user_id: userId,
      action: 'account_provisioned',
      metadata: { tier, source, deal_id: dealId, partnership_id: partnershipId ?? null },
    });

    if (logError) {
      console.error('[Provision] activity log insert failed:', logError.message);
    }

    return NextResponse.json({
      success: true,
      userId,
      email,
      tier,
      partnershipId: partnershipId ?? null,
      isNew: !existingProfile,
    });
  } catch (error) {
    console.error('[Provision]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
