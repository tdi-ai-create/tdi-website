import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getServiceSupabase();

    // Check creators table first
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (creatorData && !creatorError) {
      return NextResponse.json({ exists: true, type: 'creator' });
    }

    // Check admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (adminData && !adminError) {
      return NextResponse.json({ exists: true, type: 'admin' });
    }

    // Not found in either table
    return NextResponse.json({ exists: false, type: null });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
