import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

// Service Supabase client
function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// POST - Create a new action item
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      partnership_id,
      title,
      description,
      category,
      priority,
      due_date,
      sort_order,
    } = body;

    if (!partnership_id || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get max sort_order for this partnership
    const { data: maxOrderData } = await supabase
      .from('action_items')
      .select('sort_order')
      .eq('partnership_id', partnership_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newSortOrder = sort_order ?? (maxOrderData?.sort_order ?? 0) + 1;

    // Insert new action item
    const { data, error } = await supabase
      .from('action_items')
      .insert({
        partnership_id,
        title,
        description: description || null,
        category: category || 'engagement',
        priority: priority || 'medium',
        due_date: due_date || null,
        sort_order: newSortOrder,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id,
      user_id: null,
      action: 'action_item_created',
      details: {
        item_id: data.id,
        title,
        created_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      actionItem: data,
    });
  } catch (error) {
    console.error('Error creating action item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create action item' },
      { status: 500 }
    );
  }
}

// PUT - Update an action item
export async function PUT(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing action item ID' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Build update object
    const updateData: Record<string, unknown> = {
      ...updateFields,
      updated_at: new Date().toISOString(),
    };

    // Handle status changes
    if (updateFields.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.paused_at = null;
      updateData.paused_reason = null;
    } else if (updateFields.status === 'paused') {
      updateData.paused_at = new Date().toISOString();
    } else if (updateFields.status === 'pending') {
      updateData.paused_at = null;
      updateData.paused_reason = null;
      updateData.completed_at = null;
    }

    const { data, error } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: data.partnership_id,
      user_id: null,
      action: 'action_item_updated',
      details: {
        item_id: id,
        title: data.title,
        updated_fields: Object.keys(updateFields),
        updated_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      actionItem: data,
    });
  } catch (error) {
    console.error('Error updating action item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update action item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an action item
export async function DELETE(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing action item ID' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get item before deleting for logging
    const { data: item } = await supabase
      .from('action_items')
      .select('partnership_id, title')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    if (item) {
      await supabase.from('activity_log').insert({
        partnership_id: item.partnership_id,
        user_id: null,
        action: 'action_item_deleted',
        details: {
          item_id: id,
          title: item.title,
          deleted_by: email,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting action item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete action item' },
      { status: 500 }
    );
  }
}
