import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
 * Upload a resource file (PDF, doc, image) for a lesson
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const lessonId = formData.get('lesson_id') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!lessonId) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, Word, PowerPoint, Excel, PNG, JPG' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
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
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${lessonId}/${timestamp}-${sanitizedFilename}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('lesson-resources')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[resources/upload] Storage error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lesson-resources')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Update lesson content with the resource URL and file info
    const { data: current } = await supabase
      .from('hub_lessons')
      .select('content')
      .eq('id', lessonId)
      .single();

    const existingContent = (current?.content && typeof current.content === 'object')
      ? current.content as Record<string, unknown>
      : {};

    const updatedContent = {
      ...existingContent,
      resource_url: publicUrl,
      resource_filename: file.name,
      resource_content_type: file.type,
      resource_file_size: file.size,
      resource_storage_path: storagePath,
    };

    const { error: updateError } = await supabase
      .from('hub_lessons')
      .update({ content: updatedContent })
      .eq('id', lessonId);

    if (updateError) {
      console.error('[resources/upload] DB update error:', updateError);
      // Clean up uploaded file
      await supabase.storage.from('lesson-resources').remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        filename: file.name,
        content_type: file.type,
        file_size: file.size,
      },
    });
  } catch (error) {
    console.error('[resources/upload] Error:', error);
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
