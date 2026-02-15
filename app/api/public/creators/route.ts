import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch only creators marked for website display
    const { data: creators, error } = await supabase
      .from('creators')
      .select('id, name, website_display_name, website_title, website_bio, headshot_url, display_order, content_path')
      .eq('display_on_website', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Public Creators API] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch creators' }, { status: 500 });
    }

    // Transform data for public consumption
    const publicCreators = (creators || []).map(c => ({
      id: c.id,
      name: c.website_display_name || c.name,
      title: c.website_title || 'Content Creator',
      bio: c.website_bio || null,
      headshotUrl: c.headshot_url || null,
      contentPath: c.content_path || null,
    }));

    // Return with cache header (1 hour)
    return NextResponse.json(
      { creators: publicCreators },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[Public Creators API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
