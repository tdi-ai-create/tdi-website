import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPartnershipByToken } from '@/lib/partnership-portal-data';

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

// POST - Accept invite and create partnership user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { user_id, email } = body;

    if (!token || !user_id || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify token is valid
    const partnership = await getPartnershipByToken(token);

    if (!partnership) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Verify email matches contact email
    if (email.toLowerCase() !== partnership.contact_email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Email does not match invitation' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if partnership user already exists
    const { data: existingUser } = await supabase
      .from('partnership_users')
      .select('id')
      .eq('user_id', user_id)
      .eq('partnership_id', partnership.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Already accepted',
        partnershipId: partnership.id,
      });
    }

    // Create partnership user
    const { error: userError } = await supabase
      .from('partnership_users')
      .insert({
        partnership_id: partnership.id,
        user_id,
        role: 'admin',
        first_name: partnership.contact_name.split(' ')[0],
        last_name: partnership.contact_name.split(' ').slice(1).join(' '),
      });

    if (userError) {
      console.error('Error creating partnership user:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Update partnership status
    const { error: updateError } = await supabase
      .from('partnerships')
      .update({
        invite_accepted_at: new Date().toISOString(),
        status: 'setup_in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', partnership.id);

    if (updateError) {
      console.error('Error updating partnership:', updateError);
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnership.id,
      user_id,
      action: 'account_created',
      details: { email },
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted',
      partnershipId: partnership.id,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
