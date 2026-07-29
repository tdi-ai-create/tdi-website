import { NextResponse } from 'next/server';

/**
 * GET /api/tdi-admin/videos/diagnostic
 *
 * Quick health check for the Cloudflare Stream account.
 * Tests token validity and checks storage usage.
 */
export async function GET() {
  const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  const cfAccountId = process.env.CF_ACCOUNT_ID;

  if (!cfToken || !cfAccountId) {
    return NextResponse.json({
      healthy: false,
      error: 'Cloudflare Stream not configured',
      hasCfToken: !!cfToken,
      hasCfAccountId: !!cfAccountId,
    });
  }

  try {
    // Test 1: Check if the API token is valid by listing videos
    const listRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?per_page=1`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    );

    const listData = await listRes.json();

    if (!listRes.ok || !listData.success) {
      return NextResponse.json({
        healthy: false,
        error: 'Cloudflare API token is invalid or expired',
        status: listRes.status,
        cfErrors: listData.errors,
      });
    }

    // Test 2: Check storage quota
    const storageRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/storage-usage`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    );

    let storageInfo = null;
    if (storageRes.ok) {
      const storageData = await storageRes.json();
      storageInfo = storageData.result;
    }

    // Test 3: Try creating a direct upload URL (and immediately clean it up)
    const uploadTestRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 60,
          creator: 'diagnostic-test',
        }),
      }
    );

    const uploadTestData = await uploadTestRes.json();
    let canCreateUploadUrl = false;

    if (uploadTestRes.ok && uploadTestData.success) {
      canCreateUploadUrl = true;
      // Clean up the test upload entry
      const testUid = uploadTestData.result?.uid;
      if (testUid) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${testUid}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${cfToken}` },
          }
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      healthy: canCreateUploadUrl,
      tokenValid: true,
      canCreateUploadUrl,
      totalVideos: listData.result_info?.total_count || 0,
      storage: storageInfo,
      uploadTestError: !canCreateUploadUrl ? uploadTestData.errors : null,
    });
  } catch (error) {
    return NextResponse.json({
      healthy: false,
      error: error instanceof Error ? error.message : 'Diagnostic failed',
    });
  }
}
