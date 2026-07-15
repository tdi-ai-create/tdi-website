import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/tdi-admin/docs/[slug]
 *
 * Serves internal documentation HTML files. Only accessible to
 * authenticated admin users (loaded in iframe from admin portal).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const allowedDocs: Record<string, string> = {
    'admin-guide': 'admin-guide.html',
    'workflow': 'partnership-workflow.html',
    'service-invoicing': 'service-invoicing-workflow.html',
  };

  const filename = allowedDocs[slug];
  if (!filename) {
    return new NextResponse('Document not found', { status: 404 });
  }

  try {
    const filePath = join(process.cwd(), 'app', 'tdi-admin', 'docs', filename);
    const html = readFileSync(filePath, 'utf-8');

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-cache',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return new NextResponse('Document not found', { status: 404 });
  }
}
