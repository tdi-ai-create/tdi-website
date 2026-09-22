import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase'
import {
  DEFAULT_CATEGORY,
  isKnownCategory,
  isKnownStatus,
} from '@/lib/leadership/action-items'

// Fields a caller may change. Anything not named here is ignored rather than
// passed through to the database, where an unknown column fails the whole
// update and a wrong value fails a CHECK constraint.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'due_date',
  'category',
  'priority',
  'visible_to_partner',
  'sort_order',
] as const

// function isTDIAdmin(email: string) {
//   return email.toLowerCase().endsWith('@teachersdeserveit.com')
// }

// GET - Fetch action items for a specific partnership
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

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
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const body = await request.json()
    const supabase = getServiceSupabase()

    // The form collected a due date, a description and a visibility flag, and
    // this insert used to drop all three. The category fell back to 'custom',
    // which action_items_category_check has never accepted.
    const category = body.category ?? DEFAULT_CATEGORY
    if (!isKnownCategory(category)) {
      return NextResponse.json(
        { error: `Unknown category "${category}"` },
        { status: 400 }
      )
    }

    const { data: item, error } = await supabase
      .from('action_items')
      .insert({
        partnership_id: id,
        title: body.title,
        description: body.description || null,
        due_date: body.due_date || null,
        category,
        priority: body.priority || 'medium',
        status: 'pending',
        visible_to_partner: body.visible_to_partner ?? false,
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
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const body = await request.json()
    // The sidebar sent `id` while this route read `itemId`, so every edit made
    // from it failed with a 500 and the panel reported success anyway. Both
    // spellings are accepted here so no caller is left behind.
    const itemId = body.itemId ?? body.id
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.status !== undefined) {
      if (!isKnownStatus(body.status)) {
        return NextResponse.json(
          { error: `Unknown status "${body.status}"` },
          { status: 400 }
        )
      }
      updates.status = body.status
      updates.completed_at = body.status === 'completed' ? new Date().toISOString() : null
    }

    for (const field of EDITABLE_FIELDS) {
      if (body[field] === undefined) continue
      if (field === 'category' && !isKnownCategory(body[field])) {
        return NextResponse.json(
          { error: `Unknown category "${body[field]}"` },
          { status: 400 }
        )
      }
      updates[field] = body[field]
    }

    const supabase = getServiceSupabase()

    const { data: updated, error } = await supabase
      .from('action_items')
      .update(updates)
      .eq('id', itemId)
      .eq('partnership_id', id)
      .select()

    if (error) {
      console.error('Error updating action item:', error)
      return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 })
    }

    // An update that matched nothing is not a success. Saying so is the
    // difference between a bug that is visible and one that is not.
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'No action item matched that id on this partnership' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, item: updated[0] })
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
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    // The sidebar sends a JSON body; this read only the query string, so every
    // delete from it returned 400 while the row vanished from the list until
    // the next reload.
    const { searchParams } = new URL(request.url)
    let itemId = searchParams.get('itemId')
    if (!itemId) {
      const body = await request.json().catch(() => ({}))
      itemId = body.itemId ?? body.id ?? null
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: deleted, error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', itemId)
      .eq('partnership_id', id)
      .select()

    if (error) {
      console.error('Error deleting action item:', error)
      return NextResponse.json({ error: 'Failed to delete action item' }, { status: 500 })
    }

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'No action item matched that id on this partnership' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in action items DELETE:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
