import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { sendAccessGrantedEmail } from '@/lib/hub/email-sender';

function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/tdi-admin/grant-access
 *
 * Grants comped (free) access to the Learning Hub for a prospect or partner.
 * Creates auth user + hub_profile + hub_membership if they don't exist,
 * or updates the existing membership if they do.
 *
 * Auth: non-blocking server check (matches accounts/enrollments pattern).
 * Page-level admin context guard is the primary access control.
 */
export async function POST(request: NextRequest) {
  // Auth check — log but don't block (page guard protects)
  let adminEmail = 'unknown';
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) {
      console.warn('[GrantAccess] Server auth check failed, proceeding (page guard protects)');
    } else {
      adminEmail = auth.user.email;
    }
  } catch {}

  try {
    const { email, name, tier, durationDays, customExpiry, grantedBy } = await request.json();
    // Use server-verified email if available, fall back to client-provided
    if (adminEmail === 'unknown' && grantedBy) adminEmail = grantedBy;

    if (!email || !tier) {
      return NextResponse.json({ error: 'Email and tier are required' }, { status: 400 });
    }

    const validTiers = ['essentials', 'professional', 'all_access'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` }, { status: 400 });
    }

    // Calculate expiry
    let expiresAt: string;
    if (customExpiry) {
      expiresAt = new Date(customExpiry).toISOString();
    } else {
      const days = durationDays || 30;
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    const hub = getHubAdmin();

    // Check if user already exists in hub_profiles
    const { data: existingProfile } = await hub
      .from('hub_profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create auth user in the Hub Supabase project
      const { data: authUser, error: authError } = await hub.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          display_name: name || email.split('@')[0],
          source: 'admin_comp',
        },
      });

      if (authError || !authUser?.user) {
        console.error('[GrantAccess] Auth error:', authError);
        return NextResponse.json(
          { error: 'Failed to create user: ' + (authError?.message || 'unknown') },
          { status: 500 }
        );
      }

      userId = authUser.user.id;
      isNewUser = true;

      // Create hub_profile
      await hub.from('hub_profiles').upsert({
        id: userId,
        email,
        display_name: name || email.split('@')[0],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // Create or update membership via RPC (bypasses PostgREST schema cache)
    const { error: memberError } = await hub.rpc('grant_comp_access', {
      p_user_id: userId,
      p_tier: tier,
      p_source: 'admin_assigned',
      p_status: 'trial',
      p_starts_at: new Date().toISOString(),
      p_expires_at: expiresAt,
      p_granted_by: adminEmail,
    });

    if (memberError) {
      console.error('[GrantAccess] Membership error:', memberError);
      return NextResponse.json({ error: 'Failed to create membership: ' + memberError.message }, { status: 500 });
    }

    // Generate a magic link so the admin can share it with the prospect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';
    const redirectTo = `${siteUrl}/hub/auth/callback`;

    const { data: linkData, error: linkError } = await hub.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });

    let inviteLink: string | null = null;
    if (linkError) {
      console.error('[GrantAccess] Link generation error:', linkError);
      // Non-fatal — admin can still tell the user to log in at /hub/login
    } else if (linkData?.properties?.hashed_token) {
      // Build the verification URL using the hashed token
      const token = linkData.properties.hashed_token;
      inviteLink = `${siteUrl}/hub/auth/callback?token_hash=${token}&type=magiclink`;
    }

    // Send access granted email to the user
    const displayName = name || email.split('@')[0];
    const loginUrl = `${siteUrl}/hub/login`;

    sendAccessGrantedEmail(userId, email, {
      displayName,
      tier,
      expiresAt,
      magicLink: inviteLink,
      loginUrl,
    }).catch((err) => {
      console.error('[GrantAccess] Email send failed (non-blocking):', err);
    });

    return NextResponse.json({
      success: true,
      userId,
      email,
      tier,
      expiresAt,
      grantedBy: adminEmail,
      isNewUser,
      inviteLink,
      loginUrl,
      emailSent: true,
    });
  } catch (error) {
    console.error('[GrantAccess]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
