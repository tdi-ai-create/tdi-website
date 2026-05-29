import { NextResponse } from 'next/server';
import { hubClient } from '@/lib/desi/hub-client';

export async function GET() {
  if (!hubClient) {
    return NextResponse.json(
      { error: 'Hub not configured' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await hubClient
      .from('hub_courses')
      .select('id, title, slug, description, category, thumbnail_url, access_tier')
      .eq('is_published', true)
      .order('title', { ascending: true })
      .limit(20);

    if (error) throw error;

    // Shuffle and pick 5 to rotate what visitors see
    const shuffled = (data ?? []).sort(() => Math.random() - 0.5).slice(0, 5);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error('Error fetching hub courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
