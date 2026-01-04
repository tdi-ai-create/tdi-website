import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.THINKIFIC_API_KEY;
  const subdomain = process.env.THINKIFIC_SUBDOMAIN;

  if (!apiKey || !subdomain) {
    return NextResponse.json(
      { error: 'API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.thinkific.com/api/public/v1/courses`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Thinkific API error: ${response.status}`);
    }

    const data = await response.json();

    // Thinkific API only returns published courses, so no filter needed
    const courses = (data.items || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // Get 5 random courses (plus 1 featured = 6 total)

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
