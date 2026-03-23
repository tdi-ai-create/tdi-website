import { NextRequest, NextResponse } from 'next/server'

const GHL_TOKEN = process.env.GHL_PRIVATE_TOKEN
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function GET(request: NextRequest) {
  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const pipelineId = searchParams.get('pipelineId')
  const stageId = searchParams.get('stageId')
  const limit = searchParams.get('limit') ?? '100'

  try {
    let url = `${GHL_BASE}/opportunities/search?location_id=${GHL_LOCATION_ID}&limit=${limit}`
    if (pipelineId) url += `&pipeline_id=${pipelineId}`
    if (stageId) url += `&pipeline_stage_id=${stageId}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `GHL API error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}
