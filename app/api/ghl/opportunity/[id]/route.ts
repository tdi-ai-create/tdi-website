import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE = 'https://services.leadconnectorhq.com'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID

  if (!token || !locationId) {
    return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 })
  }

  const body = await request.json()
  // body can contain: { stageId, status, monetaryValue, name }
  // We only send what's being updated

  const updatePayload: Record<string, unknown> = {}
  if (body.stageId !== undefined) updatePayload.stageId = body.stageId
  if (body.status !== undefined) updatePayload.status = body.status
  if (body.monetaryValue !== undefined) updatePayload.monetaryValue = body.monetaryValue
  if (body.name !== undefined) updatePayload.name = body.name

  try {
    const response = await fetch(`${GHL_BASE}/opportunities/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GHL opportunity update error:', response.status, errorText)
      return NextResponse.json(
        { error: `GHL update failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, opportunity: data.opportunity ?? data })
  } catch (err) {
    console.error('GHL opportunity update exception:', err)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}
