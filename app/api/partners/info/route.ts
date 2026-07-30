import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// GET /api/partners/info?slug=addison-sd4
// Returns basic partnership info (org name) for the Hub banner
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('partnerships')
    .select('org_name')
    .eq('slug', slug)
    .single();

  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({ org_name: data.org_name });
}
