import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * POST /api/tdi-admin/resources/upload
 *
 * Two-step upload (like Cloudflare videos):
 * 1. Client sends metadata (lesson_id, filename, content_type, file_size) as JSON
 * 2. Server returns a signed upload URL for direct-to-Supabase upload
 *
 * This keeps large files off the serverless function (Vercel 4.5MB body limit).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lesson_id, filename, content_type, file_size } = body;

    if (!lesson_id) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }
    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    if (content_type && !ALLOWED_TYPES.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, Word, PowerPoint, Excel, PNG, JPG' },
        { status: 400 }
      );
    }

    if (file_size && file_size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    const supabase = getHubServiceSupabase();

    // Verify lesson exists
    const { data: lesson, error: lessonError } = await supabase
      .from('hub_lessons')
      .select('id, title')
      .eq('id', lesson_id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${lesson_id}/${timestamp}-${sanitizedFilename}`;

    // Create signed upload URL (valid for 2 minutes)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('lesson-resources')
      .createSignedUploadUrl(storagePath);

    if (signedError || !signedData) {
      console.error('[resources/upload] Signed URL error:', signedError);
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: signedData.signedUrl,
      token: signedData.token,
      storagePath,
    });
  } catch (error) {
    console.error('[resources/upload] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/tdi-admin/resources/upload
 * After client uploads directly to Supabase Storage, save metadata to lesson record
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { lesson_id, storage_path, filename, content_type, file_size } = body;

    if (!lesson_id || !storage_path) {
      return NextResponse.json({ error: 'lesson_id and storage_path are required' }, { status: 400 });
    }

    const supabase = getHubServiceSupabase();

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('lesson-resources')
      .getPublicUrl(storage_path);

    const publicUrl = urlData.publicUrl;

    // Update lesson content with the resource URL and file info
    const { data: current } = await supabase
      .from('hub_lessons')
      .select('content')
      .eq('id', lesson_id)
      .single();

    const existingContent = (current?.content && typeof current.content === 'object')
      ? current.content as Record<string, unknown>
      : {};

    const updatedContent = {
      ...existingContent,
      resource_url: publicUrl,
      resource_filename: filename || storage_path.split('/').pop(),
      resource_content_type: content_type || 'application/octet-stream',
      resource_file_size: file_size || 0,
      resource_storage_path: storage_path,
    };

    const { error: updateError } = await supabase
      .from('hub_lessons')
      .update({ content: updatedContent })
      .eq('id', lesson_id);

    if (updateError) {
      console.error('[resources/upload] DB update error:', updateError);
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        filename: filename,
        content_type: content_type,
        file_size: file_size,
      },
    });
  } catch (error) {
    console.error('[resources/upload] Confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tdi-admin/resources/upload?lesson_id=...
 * Remove a resource file from a lesson
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lesson_id');

    if (!lessonId) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }

    const supabase = getHubServiceSupabase();

    // Get current content to find storage path
    const { data: lesson } = await supabase
      .from('hub_lessons')
      .select('content')
      .eq('id', lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const content = (lesson.content && typeof lesson.content === 'object')
      ? lesson.content as Record<string, unknown>
      : {};

    const storagePath = content.resource_storage_path as string;

    // Delete from storage if path exists
    if (storagePath) {
      await supabase.storage.from('lesson-resources').remove([storagePath]);
    }

    // Remove resource fields from content
    const { resource_url, resource_filename, resource_content_type, resource_file_size, resource_storage_path, ...cleanContent } = content;

    await supabase
      .from('hub_lessons')
      .update({ content: cleanContent })
      .eq('id', lessonId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[resources/upload] Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
