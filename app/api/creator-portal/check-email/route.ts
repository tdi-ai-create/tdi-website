import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('[check-email] API called');

  try {
    // Parse request body
    let email: string;
    try {
      const body = await request.json();
      email = body.email;
      console.log('[check-email] Email received:', email);
    } catch (parseError) {
      console.error('[check-email] Failed to parse request body:', parseError);
      return NextResponse.json(
        { exists: false, type: null, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      console.log('[check-email] Email missing or invalid');
      return NextResponse.json(
        { exists: false, type: null, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[check-email] Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
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
    console.log('[check-email] Checking normalized email:', normalizedEmail);

    // Check creators table first (use ilike for case-insensitive match)
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('id, email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    console.log('[check-email] Creator query result:', {
      creatorData,
      creatorError: creatorError?.message || null
    });

    if (creatorError) {
      console.error('[check-email] Creator query error:', creatorError.message, creatorError.details);
    }

    if (creatorData) {
      console.log('[check-email] Found in creators table:', creatorData.email);
      return NextResponse.json({ exists: true, type: 'creator' });
    }

    // Check admin_users table (use ilike for case-insensitive match)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    console.log('[check-email] Admin query result:', {
      adminData,
      adminError: adminError?.message || null
    });

    if (adminError) {
      console.error('[check-email] Admin query error:', adminError.message, adminError.details);
    }

    if (adminData) {
      console.log('[check-email] Found in admin_users table:', adminData.email);
      return NextResponse.json({ exists: true, type: 'admin' });
    }

    // Not found in either table
    console.log('[check-email] Email not found in any table');
    return NextResponse.json({ exists: false, type: null });

  } catch (error) {
    console.error('[check-email] Unexpected error:', error);
    return NextResponse.json(
      { exists: false, type: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
