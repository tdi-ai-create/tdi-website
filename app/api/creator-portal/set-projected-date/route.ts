import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, projectedDate, email } = await request.json()

    if (!creatorId || !projectedDate || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Count existing history entries (for toast message logic)
    const { count } = await (supabase
      .from('projected_date_history') as any)
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', creatorId)

    const adjustmentNumber = (count || 0) + 1

    // Update creator — trigger will auto-populate projected_date_history
    const { error: updateError } = await (supabase
      .from('creators') as any)
      .update({
        projected_completion_date: projectedDate,
        projected_date_set_at: new Date().toISOString(),
        projected_date_set_by: `creator:${email}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // Calculate publish date (date + 30 days) for response
    const completionDate = new Date(projectedDate)
    const publishDate = new Date(completionDate)
    publishDate.setDate(publishDate.getDate() + 30)

    return NextResponse.json({
      success: true,
      projectedDate,
      publishDate: publishDate.toISOString().split('T')[0],
      adjustmentNumber,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
