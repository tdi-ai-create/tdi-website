import { NextResponse } from 'next/server'

/**
 * POST /api/tdi-admin/videos/upload
 *
 * Creates a tus resumable upload URL for Cloudflare Stream.
 * Direct uploads have a 200MB limit; tus has no practical limit.
 *
 * Flow:
 * 1. Client calls this endpoint with { filename, fileSize }
 * 2. Server initializes a tus upload with Cloudflare, gets upload URL + video UID
 * 3. Client uploads using tus-js-client directly to Cloudflare
 */
export async function POST(request: Request) {
  const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  const cfAccountId = process.env.CF_ACCOUNT_ID;

  if (!cfToken || !cfAccountId) {
    return NextResponse.json(
      { error: 'Cloudflare Stream not configured', hasCfToken: !!cfToken, hasCfAccountId: !!cfAccountId },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { filename, fileSize, maxDurationSeconds } = body;

    if (!fileSize) {
      return NextResponse.json({ error: 'fileSize is required' }, { status: 400 });
    }

    // Build Upload-Metadata header (base64-encoded key-value pairs)
    const metadata: string[] = [];
    if (filename) {
      metadata.push(`name ${Buffer.from(filename).toString('base64')}`);
    }
    if (maxDurationSeconds) {
      metadata.push(`maxDurationSeconds ${Buffer.from(String(maxDurationSeconds)).toString('base64')}`);
    }
    // requiresignedurls and allowedorigins can be added here if needed

    // Initialize tus upload with Cloudflare Stream
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': String(fileSize),
          'Upload-Metadata': metadata.join(','),
        },
      }
    );

    if (!cfResponse.ok) {
      const errText = await cfResponse.text();
      console.error('[video-upload] Cloudflare tus init error:', cfResponse.status, errText);
      return NextResponse.json(
        { error: `Cloudflare Stream error: ${cfResponse.status}` },
        { status: 502 }
      );
    }

    // Cloudflare returns the tus upload URL in the Location header
    // and the video UID in the stream-media-id header
    const tusUploadUrl = cfResponse.headers.get('location');
    const videoUid = cfResponse.headers.get('stream-media-id');

    if (!tusUploadUrl || !videoUid) {
      console.error('[video-upload] Missing tus headers:', {
        location: tusUploadUrl,
        mediaId: videoUid,
        headers: Object.fromEntries(cfResponse.headers.entries()),
      });
      return NextResponse.json(
        { error: 'Failed to initialize upload with Cloudflare' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      uploadUrl: tusUploadUrl,
      videoUid,
      uploadType: 'tus',
      playerUrl: `https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoUid}/iframe`,
      streamUrl: `https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoUid}`,
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
      status: video?.status?.state || 'unknown',
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

/**
 * DELETE /api/tdi-admin/videos/upload?uid=VIDEO_UID
 *
 * Clean up a failed/orphaned upload from Cloudflare Stream.
 */
export async function DELETE(request: Request) {
  try {
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
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    );

    if (!cfResponse.ok && cfResponse.status !== 404) {
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[video-upload] Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
