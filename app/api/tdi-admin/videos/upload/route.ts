import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * POST /api/tdi-admin/videos/upload
 *
 * Two-step Cloudflare Stream upload:
 * 1. Client calls this endpoint to get a direct upload URL
 * 2. Client uploads the file directly to Cloudflare using that URL
 *
 * This keeps large video files off our server -- they go straight to Cloudflare.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const cfAccountId = process.env.CF_ACCOUNT_ID;

    if (!cfToken || !cfAccountId) {
      return NextResponse.json(
        { error: 'Cloudflare Stream not configured. Set CLOUDFLARE_STREAM_API_TOKEN and CF_ACCOUNT_ID.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { filename, maxDurationSeconds } = body;

    // Request a direct upload URL from Cloudflare Stream
    // This uses TUS protocol for reliable uploads of any size
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: maxDurationSeconds || 3600, // Default 1 hour max
          meta: {
            name: filename || 'untitled',
            source: 'tdi-hub-admin',
          },
        }),
      }
    );

    if (!cfResponse.ok) {
      const errText = await cfResponse.text();
      console.error('[video-upload] Cloudflare error:', errText);
      return NextResponse.json(
        { error: `Cloudflare Stream error: ${cfResponse.status}` },
        { status: 502 }
      );
    }

    const cfData = await cfResponse.json();

    if (!cfData.success) {
      console.error('[video-upload] Cloudflare error:', cfData.errors);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 502 }
      );
    }

    // Return the upload URL and video UID to the client
    const uploadUrl = cfData.result?.uploadURL;
    const videoUid = cfData.result?.uid;

    if (!uploadUrl || !videoUid) {
      return NextResponse.json(
        { error: 'Missing upload URL from Cloudflare' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      uploadUrl,
      videoUid,
      // The iframe embed URL for playback
      playerUrl: `https://customer-${cfAccountId}.cloudflarestream.com/${videoUid}/iframe`,
      streamUrl: `https://customer-${cfAccountId}.cloudflarestream.com/${videoUid}`,
    });
  } catch (error) {
    console.error('[video-upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tdi-admin/videos/upload?uid=VIDEO_UID
 *
 * Check the status of a video upload (processing, ready, error)
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const cfAccountId = process.env.CF_ACCOUNT_ID;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!cfToken || !cfAccountId) {
      return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'Video uid required' }, { status: 400 });
    }

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    );

    if (!cfResponse.ok) {
      return NextResponse.json({ error: 'Failed to check status' }, { status: 502 });
    }

    const cfData = await cfResponse.json();
    const video = cfData.result;

    return NextResponse.json({
      uid: video?.uid,
      status: video?.status?.state || 'unknown', // 'queued', 'inprogress', 'ready', 'error'
      readyToStream: video?.readyToStream || false,
      duration: video?.duration || 0,
      thumbnail: video?.thumbnail || null,
      playback: video?.playback || null,
    });
  } catch (error) {
    console.error('[video-upload] Status check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
