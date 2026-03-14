import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

// GET - Fetch action items for a specific partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.headers.get('x-user-email')

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = getServiceSupabase()

    const { data: items, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('partnership_id', id)
      .order('sort_order')

    if (error) {
      console.error('Error fetching action items:', error)
      return NextResponse.json({ error: 'Failed to fetch action items' }, { status: 500 })
    }

    return NextResponse.json({ success: true, items: items || [] })
  } catch (error) {
    console.error('Error in action items GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new action item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.headers.get('x-user-email')

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = getServiceSupabase()

    const { data: item, error } = await supabase
      .from('action_items')
      .insert({
        partnership_id: id,
        title: body.title,
        category: body.category || 'custom',
        priority: body.priority || 'medium',
        status: 'pending',
        sort_order: body.sort_order || 99,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating action item:', error)
      return NextResponse.json({ error: 'Failed to create action item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error in action items POST:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update action item status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.headers.get('x-user-email')

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { itemId, status } = await request.json()
    const supabase = getServiceSupabase()

    const { error } = await supabase
      .from('action_items')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('partnership_id', id)

    if (error) {
      console.error('Error updating action item:', error)
      return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in action items PATCH:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove action item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.headers.get('x-user-email')

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', itemId)
      .eq('partnership_id', id)

    if (error) {
      console.error('Error deleting action item:', error)
      return NextResponse.json({ error: 'Failed to delete action item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in action items DELETE:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
