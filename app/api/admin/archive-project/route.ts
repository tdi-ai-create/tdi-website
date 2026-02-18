import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { creatorId, projectId, adminEmail } = await request.json();

    if (!creatorId || !adminEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    console.log('[archive-project] Archiving project for creator:', creatorId);

    // If projectId is provided, archive that specific project
    // Otherwise, find the most recent completed project
    let targetProjectId = projectId;

    if (!targetProjectId) {
      const { data: project } = await supabase
        .from('creator_projects')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('status', 'completed')
        .order('project_number', { ascending: false })
        .limit(1)
        .single();

      targetProjectId = project?.id;
    }

    if (!targetProjectId) {
      // Fall back to any active project
      const { data: activeProject } = await supabase
        .from('creator_projects')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('status', 'active')
        .order('project_number', { ascending: false })
        .limit(1)
        .single();

      targetProjectId = activeProject?.id;
    }

    if (!targetProjectId) {
      return NextResponse.json({
        success: false,
        error: 'No project found to archive'
      }, { status: 404 });
    }

    // Archive the project
    const { error: archiveError } = await supabase
      .from('creator_projects')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: adminEmail
      })
      .eq('id', targetProjectId);

    if (archiveError) {
      console.error('[archive-project] Error archiving:', archiveError);
      return NextResponse.json({ success: false, error: archiveError.message }, { status: 500 });
    }

    // Create a note
    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `[Auto] Project archived by ${adminEmail}`,
        author: 'System',
        visible_to_creator: false,
      });

    console.log('[archive-project] Successfully archived project:', targetProjectId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[archive-project] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
