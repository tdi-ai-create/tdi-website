import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET -- load recommendations for a partnership
export async function GET(request: NextRequest) {
  try {
    const partnershipId = request.nextUrl.searchParams.get('partnershipId');
    if (!partnershipId) return NextResponse.json({ recommendations: [] });

    const hub = getHubAdmin();
    const { data } = await hub
      .from('hub_recommendations')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ recommendations: data || [] });
  } catch (error) {
    console.error('[Recommendations GET]', error);
    return NextResponse.json({ recommendations: [] });
  }
}

// POST -- principal recommends a resource to their team
export async function POST(request: NextRequest) {
  try {
    const { partnershipId, recommenderEmail, resourceType, resourceId, resourceTitle, note } = await request.json();

    if (!partnershipId || !recommenderEmail || !resourceType || !resourceId || !resourceTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hub = getHubAdmin();
    const { error } = await hub.from('hub_recommendations').insert({
      partnership_id: partnershipId,
      recommender_email: recommenderEmail,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_title: resourceTitle,
      note: note || null,
    });

    if (error) {
      console.error('[Recommendations POST]', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Recommendations POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
