import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const DEFAULT_DEST = 'https://teachersdeserveit.com'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const url = new URL(request.url)
  const dest = url.searchParams.get('dest') || DEFAULT_DEST

  // Build redirect response first — we NEVER fail to redirect
  const response = NextResponse.redirect(dest, 302)

  try {
    const supabase = getSupabaseAdmin()

    // Look up creator by affiliate_slug
    const { data: creator } = await (supabase
      .from('creators') as any)
      .select('id, affiliate_slug, email, name')
      .eq('affiliate_slug', slug)
      .maybeSingle()

    if (!creator) {
      // Unknown slug — redirect without tracking
      return response
    }

    // Get or create visitor ID
    let visitorId = request.cookies.get('tdi_visitor')?.value
    if (!visitorId) {
      visitorId = randomUUID()
    }

    // Set cookies on the redirect response
    const maxAge = 90 * 24 * 60 * 60 // 90 days in seconds
    const cookieOptions = {
      maxAge,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    }

    response.cookies.set('tdi_ref', slug, cookieOptions)
    response.cookies.set('tdi_visitor', visitorId, cookieOptions)

    // Extract UTM params
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')
    const utmContent = url.searchParams.get('utm_content')
    const utmTerm = url.searchParams.get('utm_term')

    // Log click — fire-and-forget, never block the redirect
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null
    const userAgent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null

    supabase
      .from('affiliate_clicks')
      .insert({
        creator_id: creator.id,
        affiliate_slug: slug,
        visitor_id: visitorId,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        landing_url: dest,
      })
      .then(({ error }) => {
        if (error) console.error('[affiliate-click] Insert error:', error.message)
      })

    return response
  } catch (error) {
    // Never crash — always redirect
    console.error('[affiliate-redirect] Error:', error)
    return response
  }
}
