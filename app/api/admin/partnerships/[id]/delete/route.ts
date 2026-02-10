import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

// Service Supabase client with admin privileges
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

// DELETE - Delete partnership and all related data including auth users
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params;
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !await isTDIAdmin(email)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Verify partnership exists
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('id, contact_name, contact_email')
      .eq('id', partnershipId)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // 2. Get all associated user IDs (for auth deletion later)
    const { data: partnershipUsers } = await supabase
      .from('partnership_users')
      .select('user_id')
      .eq('partnership_id', partnershipId);

    const userIds = partnershipUsers?.map(pu => pu.user_id) || [];

    // 3. Delete all related data in the correct order
    // Activity log
    await supabase
      .from('activity_log')
      .delete()
      .eq('partnership_id', partnershipId);

    // Dashboard views (if exists)
    await supabase
      .from('dashboard_views')
      .delete()
      .eq('partnership_id', partnershipId);

    // Metric snapshots (if exists)
    await supabase
      .from('metric_snapshots')
      .delete()
      .eq('partnership_id', partnershipId);

    // Survey responses (if exists)
    await supabase
      .from('survey_responses')
      .delete()
      .eq('partnership_id', partnershipId);

    // Action items
    await supabase
      .from('action_items')
      .delete()
      .eq('partnership_id', partnershipId);

    // Staff members
    await supabase
      .from('staff_members')
      .delete()
      .eq('partnership_id', partnershipId);

    // 4. Delete buildings (need org_id first)
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('partnership_id', partnershipId)
      .maybeSingle();

    if (org) {
      await supabase
        .from('buildings')
        .delete()
        .eq('organization_id', org.id);
    }

    // Delete organization
    await supabase
      .from('organizations')
      .delete()
      .eq('partnership_id', partnershipId);

    // 5. Delete partnership_users records
    await supabase
      .from('partnership_users')
      .delete()
      .eq('partnership_id', partnershipId);

    // 6. Delete the partnership itself
    const { error: deleteError } = await supabase
      .from('partnerships')
      .delete()
      .eq('id', partnershipId);

    if (deleteError) {
      console.error('Error deleting partnership:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete partnership' },
        { status: 500 }
      );
    }

    // 7. Delete evidence files from storage (if bucket exists)
    try {
      const { data: files } = await supabase.storage
        .from('partnership-evidence')
        .list(partnershipId);

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${partnershipId}/${f.name}`);
        await supabase.storage
          .from('partnership-evidence')
          .remove(filePaths);
      }
    } catch {
      // Storage bucket may not exist yet, that's OK
      console.log('No evidence files to delete or bucket does not exist');
    }

    // 8. Delete Supabase auth users so emails can be reused
    const deletedUsers: string[] = [];
    const failedUsers: string[] = [];

    for (const userId of userIds) {
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.error(`Failed to delete auth user ${userId}:`, authError);
          failedUsers.push(userId);
        } else {
          deletedUsers.push(userId);
        }
      } catch (err) {
        console.error(`Error deleting auth user ${userId}:`, err);
        failedUsers.push(userId);
      }
    }

    // Log this admin action
    console.log(`[ADMIN] Partnership ${partnershipId} deleted by ${email}`, {
      deletedAuthUsers: deletedUsers.length,
      failedAuthUsers: failedUsers.length,
      contactEmail: partnership.contact_email,
    });

    return NextResponse.json({
      success: true,
      message: 'Partnership and all related data deleted successfully',
      deletedAuthUsers: deletedUsers.length,
      failedAuthUsers: failedUsers.length,
      emailsFreed: failedUsers.length === 0,
    });
  } catch (error) {
    console.error('Error in delete partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partnership' },
      { status: 500 }
    );
  }
}
