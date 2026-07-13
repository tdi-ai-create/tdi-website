import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let email: string;
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      return NextResponse.json(
        { exists: false, type: null, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { exists: false, type: null, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { exists: false, type: null, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const normalizedEmail = email.toLowerCase().trim();

    // Check creators table first (use ilike for case-insensitive match)
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (creatorError) {
      console.error('[check-email] Creator query error:', creatorError.message);
    }

    if (creatorData) {
      return NextResponse.json({ exists: true, type: 'creator' });
    }

    // Check admin_users table (use ilike for case-insensitive match)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (adminError) {
      console.error('[check-email] Admin query error:', adminError.message);
    }

    if (adminData) {
      return NextResponse.json({ exists: true, type: 'admin' });
    }

    // Return generic "not found" -- don't distinguish between creator/admin to prevent enumeration
    return NextResponse.json({ exists: false, type: null });

  } catch (error) {
    console.error('[check-email] Unexpected error:', error);
    return NextResponse.json(
      { exists: false, type: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
