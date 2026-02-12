import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route uses the service role to check team membership, bypassing RLS
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[TDI Admin API] Missing Supabase credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[TDI Admin API] Checking access for:', { userId, email: normalizedEmail });

    // Try user_id first
    const { data: byUserId, error: userIdError } = await supabase
      .from('tdi_team_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    console.log('[TDI Admin API] Query by user_id:', { found: !!byUserId, error: userIdError?.message });

    if (byUserId) {
      return NextResponse.json({ member: byUserId, foundBy: 'user_id' });
    }

    // Try email (case-insensitive)
    const { data: byEmail, error: emailError } = await supabase
      .from('tdi_team_members')
      .select('*')
      .ilike('email', normalizedEmail)
      .eq('is_active', true)
      .single();

    console.log('[TDI Admin API] Query by email:', { found: !!byEmail, error: emailError?.message });

    if (byEmail) {
      // Link user_id if not set
      if (!byEmail.user_id) {
        await supabase
          .from('tdi_team_members')
          .update({ user_id: userId })
          .eq('id', byEmail.id);
        console.log('[TDI Admin API] Linked user_id to member');
      }
      return NextResponse.json({ member: byEmail, foundBy: 'email' });
    }

    // Debug: fetch all members
    const { data: allMembers } = await supabase
      .from('tdi_team_members')
      .select('id, email, user_id, is_active, role')
      .limit(10);

    console.log('[TDI Admin API] All team members for debug:', allMembers);

    return NextResponse.json({
      error: 'Not a team member',
      debug: {
        searchedUserId: userId,
        searchedEmail: normalizedEmail,
        allMembers: allMembers?.map(m => ({ email: m.email, user_id: m.user_id, is_active: m.is_active }))
      }
    }, { status: 403 });

  } catch (error) {
    console.error('[TDI Admin API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
