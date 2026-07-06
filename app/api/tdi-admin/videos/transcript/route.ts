import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/tdi-admin/videos/transcript?uid=VIDEO_UID
 *
 * Fetch auto-generated captions/transcript from Cloudflare Stream.
 * Cloudflare generates captions automatically for uploaded videos.
 */
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid')
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN
    const cfAccountId = process.env.CF_ACCOUNT_ID
    if (!cfToken || !cfAccountId) {
      return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })
    }

    // First, request caption generation if not already done
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions/en`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: 'English (auto)' }),
      }
    )

    // Then fetch the generated captions
    const captionsRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions/en`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    )

    if (!captionsRes.ok) {
      // Captions might not be ready yet
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'Transcript is being generated. Try again in a minute.',
      })
    }

    const captionsData = await captionsRes.json()

    if (!captionsData.success || !captionsData.result) {
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'Transcript is being generated. Try again in a minute.',
      })
    }

    // Convert VTT/SRT captions to plain text
    const captions = captionsData.result
    let transcript = ''

    if (typeof captions === 'string') {
      // VTT format -- strip timestamps and metadata
      transcript = captions
        .replace(/WEBVTT\n\n/g, '')
        .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\n/g, '')
        .replace(/\n\n+/g, ' ')
        .trim()
    } else if (Array.isArray(captions)) {
      transcript = captions.map((c: any) => c.text || '').join(' ').trim()
    }

    return NextResponse.json({
      transcript: transcript || null,
      status: transcript ? 'ready' : 'not_ready',
      raw: captions,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/tdi-admin/videos/transcript
 *
 * Request Cloudflare to generate captions for a video.
 */
export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json()
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN
    const cfAccountId = process.env.CF_ACCOUNT_ID
    if (!cfToken || !cfAccountId) {
      return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions/en`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: 'English (auto)' }),
      }
    )

    const data = await res.json()

    return NextResponse.json({
      success: data.success,
      message: data.success ? 'Transcript generation requested. Check back in 1-2 minutes.' : 'Failed to request transcript.',
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
