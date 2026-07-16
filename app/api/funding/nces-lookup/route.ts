import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

/**
 * GET /api/funding/nces-lookup?q=school+name
 *
 * Searches the NCES Common Core of Data (via Urban Institute API)
 * and returns school profile data: enrollment, Title I, FRL, address, etc.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) {
    return NextResponse.json({ error: 'Search query must be at least 3 characters' }, { status: 400 })
  }

  try {
    // Use the Urban Institute Education Data API (public, no key needed)
    // Search the most recent year available
    const searchUrl = `https://educationdata.urban.org/api/v1/schools/ccd/directory/2022/?school_name=${encodeURIComponent(q)}&limit=10`

    const res = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      // Try district name search as fallback
      const districtUrl = `https://educationdata.urban.org/api/v1/schools/ccd/directory/2022/?lea_name=${encodeURIComponent(q)}&limit=10`
      const districtRes = await fetch(districtUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })
      if (!districtRes.ok) {
        return NextResponse.json({ error: 'NCES search failed', results: [] })
      }
      const districtData = await districtRes.json()
      return NextResponse.json({ results: formatResults(districtData.results || []) })
    }

    const data = await res.json()
    return NextResponse.json({ results: formatResults(data.results || []) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [] })
  }
}

function formatResults(results: any[]): any[] {
  return results.slice(0, 10).map((r: any) => ({
    nces_id: r.ncessch || r.ncessch_num,
    school_name: r.school_name,
    district: r.lea_name,
    address: [r.street_location, r.city_location, r.state_location, r.zip_location].filter(Boolean).join(', '),
    educator_count: r.teachers_fte ? Math.round(r.teachers_fte) : null,
    enrollment: r.enrollment,
    title_i_status: r.title_i_status_text || (r.title_i_eligible === 1 ? 'Eligible' : r.title_i_eligible === 0 ? 'Not eligible' : 'Unknown'),
    frl_pct: r.enrollment && r.free_or_reduced_price_lunch ? Math.round((r.free_or_reduced_price_lunch / r.enrollment) * 100) : null,
    locale: r.urban_centric_locale_text || null,
    school_type: r.school_type_text || null,
    state: r.state_location,
  }))
}
