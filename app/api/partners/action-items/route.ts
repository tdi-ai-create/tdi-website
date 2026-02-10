import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// PATCH - Update action item status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, status, evidenceFilePath, userId, partnershipId } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Build update object
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.paused_at = null;
    } else if (status === 'paused') {
      updateData.paused_at = new Date().toISOString();
    } else if (status === 'pending') {
      updateData.paused_at = null;
    }

    if (evidenceFilePath) {
      updateData.evidence_file_path = evidenceFilePath;
    }

    // Update action item
    const { data: updatedItem, error } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating action item:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update action item' },
        { status: 500 }
      );
    }

    // Log activity
    if (partnershipId && userId) {
      let action = 'action_item_updated';
      if (status === 'completed') action = 'action_item_completed';
      else if (status === 'paused') action = 'action_item_paused';
      else if (status === 'pending') action = 'action_item_resumed';

      await supabase.from('activity_log').insert({
        partnership_id: partnershipId,
        user_id: userId,
        action,
        details: {
          item_id: itemId,
          item_title: updatedItem?.title,
          new_status: status,
          has_evidence: !!evidenceFilePath,
        },
      });
    }

    return NextResponse.json({
      success: true,
      actionItem: updatedItem,
    });
  } catch (error) {
    console.error('Error updating action item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update action item' },
      { status: 500 }
    );
  }
}
