import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const supabase = getServiceSupabase()

    const { data, error } = await supabase
      .from('section_highlights')
      .select('*')
      .eq('partnership_id', partnershipId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching highlights:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ highlights: data || [] })
  } catch (error) {
    console.error('Highlights GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = getServiceSupabase()

    const { data, error } = await supabase
      .from('section_highlights')
      .upsert({
        partnership_id: partnershipId,
        section_key:    body.section_key,
        highlight_type: body.highlight_type,
        callout_text:   body.callout_text || null,
        callout_style:  body.callout_style || 'info',
        is_active:      true,
        created_by:     userEmail,
      }, {
        onConflict: 'partnership_id,section_key,highlight_type',
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting highlight:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ highlight: data })
  } catch (error) {
    console.error('Highlights POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { section_key, highlight_type } = await request.json()
    const supabase = getServiceSupabase()

    const { error } = await supabase
      .from('section_highlights')
      .update({ is_active: false })
      .eq('partnership_id', partnershipId)
      .eq('section_key', section_key)
      .eq('highlight_type', highlight_type)

    if (error) {
      console.error('Error deleting highlight:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Highlights DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
