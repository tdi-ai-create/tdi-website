import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/sync-all-milestones
 *
 * Syncs milestones for all existing creators, adding any missing milestone records.
 * This is used when new milestones are added to the system to ensure existing
 * creators get them added to their creator_milestones table.
 *
 * - Does NOT overwrite or modify existing milestone records
 * - Only inserts missing milestone records with status 'locked'
 * - Respects content path filtering (applies_to field on milestones)
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[sync-all-milestones] Missing env vars');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Optional: get admin email for audit logging
    let adminEmail: string | undefined;
    try {
      const body = await request.json();
      adminEmail = body.adminEmail;
    } catch {
      // No body is fine, admin email is optional
    }

    console.log('[sync-all-milestones] Starting sync, triggered by:', adminEmail || 'unknown');

    // Call the Postgres function to sync milestones
    const { data, error } = await supabase.rpc('sync_creator_milestones');

    if (error) {
      console.error('[sync-all-milestones] RPC error:', error);

      // If the function doesn't exist yet, provide helpful guidance
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        return NextResponse.json(
          {
            success: false,
            error: 'The sync_creator_milestones function has not been created yet. Please run the migration 026_milestone_backfill_function.sql in Supabase first.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('[sync-all-milestones] Sync completed:', data);

    // Log the action for audit purposes
    if (adminEmail) {
      await supabase.from('admin_audit_log').insert({
        action: 'sync_all_milestones',
        admin_email: adminEmail,
        details: data,
        created_at: new Date().toISOString(),
      }).then(() => {
        // Ignore errors - audit logging is best-effort
      });
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[sync-all-milestones] Error:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-all-milestones
 *
 * Returns info about the sync function (for documentation/health check)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/sync-all-milestones',
    method: 'POST',
    description: 'Syncs milestones for all existing creators, adding any missing milestone records based on their content path.',
    usage: {
      body: {
        adminEmail: '(optional) Email of admin triggering the sync for audit logging',
      },
    },
    notes: [
      'Does NOT modify existing milestone records',
      'Only inserts missing milestones with status "locked"',
      'Respects content path filtering (applies_to field)',
      'Requires the sync_creator_milestones() Postgres function to be created',
    ],
  });
}
