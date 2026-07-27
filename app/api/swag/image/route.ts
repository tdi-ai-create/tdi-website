import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['cdn.printful.me'];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
