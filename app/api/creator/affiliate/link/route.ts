import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function GET() {
  try {
    const authClient = await getAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: creator, error: findError } = await (supabase
      .from('creators') as any)
      .select('id, affiliate_slug, name')
      .eq('email', user.email)
      .single();

    if (findError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      affiliateSlug: creator.affiliate_slug,
      fullUrl: creator.affiliate_slug
        ? `teachersdeserveit.com/r/${creator.affiliate_slug}`
        : null,
      linkUrl: creator.affiliate_slug
        ? `https://teachersdeserveit.com/r/${creator.affiliate_slug}`
        : null,
    });
  } catch (error) {
    console.error('[affiliate-link] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
