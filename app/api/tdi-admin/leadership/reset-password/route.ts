import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');

    if (!adminEmail || !isTDIAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { partnershipId, email: partnerEmail } = await request.json();

    if (!partnershipId || !partnerEmail) {
      return NextResponse.json(
        { error: 'Partnership ID and email required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify the email belongs to this partnership
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, contact_email')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    if (partnership.contact_email?.toLowerCase() !== partnerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match partnership' }, { status: 400 });
    }

    // Send password reset email via Supabase
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      partnerEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/partners/reset-password`,
      }
    );

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 });
    }

    // Log to activity log
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'password_reset_sent',
      details: {
        email: partnerEmail,
        sent_by: adminEmail,
        sent_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${partnerEmail}`,
    });
  } catch (error) {
    console.error('Error in reset-password POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
