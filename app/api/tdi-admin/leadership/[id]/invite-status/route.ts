import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Supabase client
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

// Check if TDI admin
function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    const { data: partnership } = await supabase
      .from('partnerships')
      .select('invite_sent_at, invite_accepted_at, portal_user_id, contact_email')
      .eq('id', id)
      .single();

    if (!partnership) {
      return NextResponse.json({ status: 'not_invited' });
    }

    // Check if user has logged in
    if (partnership.portal_user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(
        partnership.portal_user_id
      );

      if (userData?.user?.last_sign_in_at) {
        return NextResponse.json({
          status: 'active',
          lastLogin: userData.user.last_sign_in_at,
          inviteSentAt: partnership.invite_sent_at,
        });
      }

      if (partnership.invite_sent_at) {
        return NextResponse.json({
          status: 'invited',
          inviteSentAt: partnership.invite_sent_at,
        });
      }
    }

    if (partnership.invite_sent_at) {
      return NextResponse.json({
        status: 'invited',
        inviteSentAt: partnership.invite_sent_at,
      });
    }

    return NextResponse.json({ status: 'not_invited' });
  } catch (error) {
    console.error('Error in invite-status GET:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
