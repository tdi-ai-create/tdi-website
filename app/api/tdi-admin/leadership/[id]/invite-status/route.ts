import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
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
// function isTDIAdmin(email: string) {
//   return email.toLowerCase().endsWith('@teachersdeserveit.com');
// }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

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
