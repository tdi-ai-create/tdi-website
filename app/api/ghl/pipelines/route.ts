import { NextResponse } from 'next/server'

const GHL_TOKEN = process.env.GHL_PRIVATE_TOKEN
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function GET() {
  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `${GHL_BASE}/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `GHL API error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 })
  }
}
