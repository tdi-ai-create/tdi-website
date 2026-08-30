import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

// Service Supabase client (bypasses RLS)
function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// POST - Verify user access to a partnership by slug
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, userId, userEmail } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Look up partnership by slug (using service role bypasses RLS)
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('slug', slug)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found', code: pError?.code },
        { status: 404 }
      );
    }

    // Get organization name to enrich partnership
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('partnership_id', partnership.id)
      .maybeSingle();

    // partnerships.org_name is the real column and select('*') already returned
    // it. Overwriting it with the organizations lookup wiped the name for the
    // two active partnerships that have no organizations row, so their
    // principal opened their own dashboard and read "Your School".
    const enrichedPartnership = {
      ...partnership,
      org_name: partnership.org_name || organization?.name || null,
    };

    // Check authorization
    const isAdmin = userEmail ? await isTDIAdmin(userEmail) : false;

    if (!isAdmin) {
      // Check if user is linked to this partnership
      const { data: puData } = await supabase
        .from('partnership_users')
        .select('id, role')
        .eq('partnership_id', partnership.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!puData) {
        return NextResponse.json(
          { success: false, error: 'User not authorized for this partnership' },
          { status: 403 }
        );
      }
    }

    // Mark invite as accepted on first successful login by the partner.
    //
    // Not when a TDI admin looks. isAdmin skips the authorisation check above,
    // and this used to run for admins too, so any of us opening a client's
    // dashboard to see how it looked permanently marked that client as having
    // accepted their invite. The Leadership dashboard names the leaders who
    // have never signed in, and a single staff visit would have erased one of
    // them with no way to tell afterwards.
    //
    // Worth knowing what this field means even so: it is stamped by an auth
    // check, not by anyone finishing anything. It says a person belonging to
    // this partnership authenticated at least once. Nothing should read it as
    // onboarding progress.
    if (!isAdmin && !partnership.invite_accepted_at) {
      const { error: acceptError } = await supabase
        .from('partnerships')
        .update({
          invite_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnership.id);

      // Not fatal, the leader is still authorised either way, but a silent
      // failure here would leave the field permanently unset for that school.
      if (acceptError) {
        console.error('[partners/auth-check] invite_accepted_at not stamped:', acceptError.message);
      }
    }

    return NextResponse.json({
      success: true,
      partnership: enrichedPartnership,
      // The dashboard uses this to skip view tracking for TDI staff. Without
      // it, one of us opening a client's dashboard is recorded as the client
      // opening it, which is the same mistake invite_accepted_at made.
      isAdmin,
    });
  } catch (error) {
    console.error('Error in auth-check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify access' },
      { status: 500 }
    );
  }
}
