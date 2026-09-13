import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { projectId, creatorId, adminEmail } = await request.json();

    if (!projectId || !creatorId || !adminEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    console.log('[restore-project] Restoring project:', projectId);

    // Restore the project to completed status
    const { error: restoreError } = await supabase
      .from('creator_projects')
      .update({
        status: 'completed',
        archived_at: null,
        archived_by: null
      })
      .eq('id', projectId);

    if (restoreError) {
      console.error('[restore-project] Error restoring:', restoreError);
      return NextResponse.json({ success: false, error: restoreError.message }, { status: 500 });
    }

    // Audit note. The archive state change above already succeeded and is
    // error checked, so a failure here loses the record of who did it rather
    // than the action itself.
    const { error: noteErr } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `[Auto] Project restored from archive by ${adminEmail}`,
        author: 'System',
        visible_to_creator: false,
      });
    if (noteErr) {
      console.error('[restore-project] Change made but not noted:', noteErr.message);
    }

    console.log('[restore-project] Successfully restored project:', projectId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[restore-project] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
