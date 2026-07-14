import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/tdi-admin/videos/transcript?uid=VIDEO_UID
 *
 * Fetch auto-generated captions/transcript from Cloudflare Stream.
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

    // Fetch all caption tracks for this video
    const captionsRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    )

    if (!captionsRes.ok) {
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'Transcript is being generated. Try again in a minute.',
      })
    }

    const captionsData = await captionsRes.json()

    if (!captionsData.success || !captionsData.result || captionsData.result.length === 0) {
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'Transcript is being generated. Try again in a minute.',
      })
    }

    // Find the English caption track (generated or manual)
    const enTrack = captionsData.result.find(
      (t: any) => t.language === 'en' && t.status === 'ready'
    ) || captionsData.result.find(
      (t: any) => t.language === 'en'
    )

    if (!enTrack) {
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'English transcript not ready yet. Try again in a minute.',
      })
    }

    // If the track has status !== 'ready', it's still processing
    if (enTrack.status && enTrack.status !== 'ready') {
      return NextResponse.json({
        transcript: null,
        status: 'processing',
        message: `Transcript is ${enTrack.status}. Try again in a minute.`,
      })
    }

    // Download the actual VTT content
    const vttRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions/en`,
      {
        headers: { 'Authorization': `Bearer ${cfToken}` },
      }
    )

    if (!vttRes.ok) {
      // Try getting the transcript text from the track data itself
      if (enTrack.text) {
        return NextResponse.json({
          transcript: enTrack.text,
          status: 'ready',
        })
      }
      return NextResponse.json({
        transcript: null,
        status: 'not_ready',
        message: 'Transcript content not available yet.',
      })
    }

    const vttData = await vttRes.json()

    // Extract transcript text from captions result
    let transcript = ''
    const result = vttData.result

    if (typeof result === 'string') {
      // VTT format -- strip timestamps and metadata
      transcript = result
        .replace(/WEBVTT\n\n/g, '')
        .replace(/\d+\n/g, '')
        .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\n?/g, '')
        .replace(/\n\n+/g, ' ')
        .replace(/\n/g, ' ')
        .trim()
    } else if (Array.isArray(result)) {
      transcript = result.map((c: any) => c.text || '').join(' ').trim()
    } else if (result && typeof result === 'object') {
      // Sometimes the result contains a 'text' or 'vtt' field
      if (result.text) transcript = result.text
      else if (result.vtt) {
        transcript = result.vtt
          .replace(/WEBVTT\n\n/g, '')
          .replace(/\d+\n/g, '')
          .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\n?/g, '')
          .replace(/\n\n+/g, ' ')
          .replace(/\n/g, ' ')
          .trim()
      }
    }

    return NextResponse.json({
      transcript: transcript || null,
      status: transcript ? 'ready' : 'not_ready',
      message: transcript ? undefined : 'Caption track exists but transcript text is empty.',
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/tdi-admin/videos/transcript
 *
 * Request Cloudflare to generate AI captions for a video.
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

    // Request AI-generated captions from Cloudflare Stream
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${uid}/captions/en`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: 'English',
          generated: true,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok || !data.success) {
      // Check if captions already exist
      if (data.errors?.[0]?.message?.includes('already exists')) {
        return NextResponse.json({
          success: true,
          message: 'Captions already exist. Fetching transcript...',
          already_exists: true,
        })
      }
      return NextResponse.json({
        success: false,
        message: data.errors?.[0]?.message || 'Failed to request transcript generation.',
        errors: data.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Transcript generation started. It usually takes 1-2 minutes.',
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
