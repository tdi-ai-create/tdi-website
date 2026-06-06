import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * GET /api/admin/data-audit
 *
 * Returns row counts and sample data from each table so we can
 * identify what's real vs old test data before cleaning.
 */
export async function GET() {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const tables = [
      'partnerships',
      'organizations',
      'staff_members',
      'action_items',
      'partnership_notes',
      'partnership_meetings',
      'partnership_kpis',
      'educator_goals',
      'timeline_events',
      'activity_log',
      'funding_pursuits',
      'funding_pursuit_timeline',
      'intelligence_districts',
      'intelligence_contracts',
      'intelligence_invoices',
    ];

    const results: Record<string, { count: number; sample: unknown[] | null; error?: string }> = {};

    for (const table of tables) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        const { data: sample } = await supabase.from(table).select('*').limit(3).order('created_at', { ascending: false });
        results[table] = { count: count || 0, sample: sample || [] };
      } catch (e) {
        results[table] = { count: 0, sample: null, error: String(e) };
      }
    }

    return NextResponse.json({ audit: results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/admin/data-audit
 *
 * Clears old test data from specified tables.
 * Body: { tables: ['funding_pursuits', 'intelligence_districts', ...] }
 */
export async function POST(request: NextRequest) {
  try {
    // Allow either admin auth OR service role key for CLI usage
    const authHeader = request.headers.get('authorization');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isServiceAuth = authHeader === `Bearer ${serviceKey}`;

    if (!isServiceAuth) {
      const auth = await requireAdminAuth();
      if (auth instanceof NextResponse) return auth;
    }

    const { tables } = await request.json();

    if (!tables || !Array.isArray(tables)) {
      return NextResponse.json({ error: 'tables array required' }, { status: 400 });
    }

    // Only allow clearing specific tables (never sales, hub, creators)
    const allowed = [
      'funding_pursuits',
      'funding_pursuit_timeline',
      'funding_pursuit_touchpoints_v1',
      'intelligence_districts',
      'intelligence_contracts',
      'intelligence_invoices',
      'intelligence_tasks',
      'district_contacts',
      'district_meetings',
      'partnership_notes',
      'partnership_meetings',
      'partnership_kpis',
      'educator_goals',
      'action_items',
      'timeline_events',
      'activity_log',
    ];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const cleared: Record<string, number> = {};

    for (const table of tables) {
      if (!allowed.includes(table)) {
        cleared[table] = -1; // Not allowed
        continue;
      }

      try {
        // Count before delete
        const { count: before } = await supabase.from(table).select('*', { count: 'exact', head: true });

        // Delete all rows
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        cleared[table] = before || 0;
      } catch {
        cleared[table] = 0;
      }
    }

    return NextResponse.json({ success: true, cleared });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
