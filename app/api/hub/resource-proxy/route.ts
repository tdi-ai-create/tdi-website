import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set<string>();
for (const env of [
  process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL,
  process.env.LEARNING_HUB_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
]) {
  if (!env) continue;
  try {
    ALLOWED_HOSTS.add(new URL(env).host);
  } catch {
    // ignore malformed env values
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  if (!target) {
    return NextResponse.json({ error: 'url query param is required' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'only https urls are proxied' }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(parsed.host)) {
    return NextResponse.json({ error: 'host not allowed' }, { status: 400 });
  }

  // Supabase Storage sets Content-Disposition: attachment whenever ?download=
  // is present. Strip it so we can render inside an iframe.
  parsed.searchParams.delete('download');

  const upstream = await fetch(parsed.toString(), { cache: 'no-store' });
  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'upstream fetch failed', status: upstream.status },
      { status: 502 },
    );
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      // Storage returns text/plain for .html files, which nosniff would then
      // refuse to render. Force text/html so the iframe can render the page.
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
