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

export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { partnershipId, email: inviteEmail, name } = await request.json();

    if (!partnershipId || !inviteEmail) {
      return NextResponse.json({ error: 'Partnership ID and email required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Send Supabase invite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      inviteEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/partners/login`,
        data: {
          partnership_id: partnershipId,
          name: name || inviteEmail,
        }
      }
    );

    if (inviteError) {
      // If user already exists, just link them
      if (inviteError.message?.includes('already registered')) {
        // Find existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === inviteEmail);

        if (existingUser) {
          // Link to partnership
          await supabase.from('partnership_users').upsert({
            partnership_id: partnershipId,
            user_id: existingUser.id,
            role: 'admin',
          }, { onConflict: 'partnership_id,user_id' });

          await supabase.from('partnerships').update({
            invite_sent_at: new Date().toISOString(),
            portal_user_id: existingUser.id,
          }).eq('id', partnershipId);

          return NextResponse.json({
            success: true,
            message: 'User already has an account - linked to partnership.',
            alreadyExists: true,
          });
        }
      }
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Link new user to partnership
    if (inviteData?.user) {
      await supabase.from('partnership_users').upsert({
        partnership_id: partnershipId,
        user_id: inviteData.user.id,
        role: 'admin',
      }, { onConflict: 'partnership_id,user_id' });

      await supabase.from('partnerships').update({
        invite_sent_at: new Date().toISOString(),
        portal_user_id: inviteData.user.id,
      }).eq('id', partnershipId);
    }

    // Log to activity log
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'portal_invite_sent',
      details: {
        email: inviteEmail,
        invited_by: email,
        sent_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${inviteEmail}`,
    });
  } catch (error) {
    console.error('Error in invite POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
