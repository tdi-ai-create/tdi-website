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

// POST - Upload evidence file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const partnershipId = formData.get('partnershipId') as string;
    const itemId = formData.get('itemId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !partnershipId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Upload file to storage
    const filePath = `${partnershipId}/${itemId}/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('partnership-evidence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Update action item
    const { data: updatedItem, error: updateError } = await supabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        evidence_file_path: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
    }

    // Log activity
    if (userId) {
      await supabase.from('activity_log').insert({
        partnership_id: partnershipId,
        user_id: userId,
        action: 'file_uploaded',
        details: {
          item_id: itemId,
          item_title: updatedItem?.title,
          file_name: file.name,
          file_path: filePath,
        },
      });
    }

    return NextResponse.json({
      success: true,
      filePath,
      actionItem: updatedItem,
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
