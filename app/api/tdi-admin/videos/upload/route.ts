import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getHubSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/tdi-admin/videos/upload
 *
 * Two options:
 *
 * Option A (default): Get a signed URL to upload video to Supabase Storage.
 *   Body: { filename, fileSize }
 *   Response: { uploadUrl, storagePath, step: 'upload' }
 *
 * Option B: After upload to storage, tell Cloudflare to pull the video.
 *   Body: { storagePath, filename, step: 'process' }
 *   Response: { videoUid, playerUrl, streamUrl }
 *
 * This avoids the client connecting directly to upload.cloudflarestream.com,
 * which fails on some networks with SSL errors.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const step = body.step || 'upload';

    if (step === 'upload') {
      // Step 1: Create signed URL for Supabase Storage upload
      const { filename, fileSize } = body;
      if (!filename || !fileSize) {
        return NextResponse.json({ error: 'filename and fileSize are required' }, { status: 400 });
      }

      const supabase = getHubSupabase();
      const timestamp = Date.now();
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `video-staging/${timestamp}-${sanitized}`;

      const { data: signedData, error: signedError } = await supabase.storage
        .from('lesson-resources')
        .createSignedUploadUrl(storagePath);

      if (signedError || !signedData) {
        console.error('[video-upload] Signed URL error:', signedError);
        return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
      }

      return NextResponse.json({
        uploadUrl: signedData.signedUrl,
        storagePath,
        step: 'upload',
      });
    }

    if (step === 'process') {
      // Step 2: Tell Cloudflare to pull the video from Supabase Storage
      const { storagePath, filename } = body;
      if (!storagePath) {
        return NextResponse.json({ error: 'storagePath is required' }, { status: 400 });
      }

      const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
      const cfAccountId = process.env.CF_ACCOUNT_ID;
      if (!cfToken || !cfAccountId) {
        return NextResponse.json({ error: 'Cloudflare Stream not configured' }, { status: 500 });
      }

      // Get the public URL for the uploaded video
      const supabase = getHubSupabase();
      const { data: urlData } = supabase.storage
        .from('lesson-resources')
        .getPublicUrl(storagePath);

      if (!urlData?.publicUrl) {
        return NextResponse.json({ error: 'Could not get public URL for uploaded file' }, { status: 500 });
      }

      // Tell Cloudflare Stream to fetch the video from our storage
      const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/copy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: urlData.publicUrl,
            meta: { name: filename || storagePath },
          }),
        }
      );

      if (!cfResponse.ok) {
        const errData = await cfResponse.json().catch(() => ({}));
        console.error('[video-upload] Cloudflare copy error:', errData);
        return NextResponse.json(
          { error: `Cloudflare error: ${errData?.errors?.[0]?.message || cfResponse.status}` },
          { status: 502 }
        );
      }

      const cfData = await cfResponse.json();
      const videoUid = cfData.result?.uid;

      if (!videoUid) {
        return NextResponse.json({ error: 'Missing video UID from Cloudflare' }, { status: 502 });
      }

      // NOTE: Do NOT delete the staging file here. Cloudflare needs time to
      // download it (can take minutes for large files). Staging files in
      // video-staging/ are cleaned up by the hub-content-health cron after 1 hour.

      return NextResponse.json({
        videoUid,
        step: 'process',
        playerUrl: `https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoUid}/iframe`,
        streamUrl: `https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoUid}`,
      });
    }

    return NextResponse.json({ error: 'Invalid step. Use "upload" or "process".' }, { status: 400 });
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
      { headers: { 'Authorization': `Bearer ${cfToken}` } }
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
      { method: 'DELETE', headers: { 'Authorization': `Bearer ${cfToken}` } }
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
