import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Ops Dashboard API -- Aggregates key metrics for daily ops view
 * Pulls from: creators, intelligence_invoices, hub (separate DB), funding
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Hub uses a separate Supabase instance
    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    const hubSupabase = hubUrl && hubKey
      ? createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch everything in parallel
    const [creatorsRes, invoicesRes, hubRes, fundingRes] = await Promise.all([
      // Creators
      supabase
        .from('creators')
        .select('id, name, email, current_phase, publish_status, lifecycle_state, is_active, status, content_path, course_title, target_completion_date, created_at, updated_at')
        .neq('status', 'archived'),

      // Invoices -- same table as Operations page
      supabase
        .from('intelligence_invoices')
        .select(`
          id, invoice_number, amount, status, due_date, invoice_date, district_id, notes,
          districts:district_id (id, name, state)
        `)
        .order('invoice_date', { ascending: false }),

      // Hub enrollments from separate database
      hubSupabase
        ? hubSupabase.from('profiles').select('id', { count: 'exact', head: true })
        : Promise.resolve({ count: null }),

      // Funding pursuits
      supabase
        .from('funding_pursuits')
        .select('id, title, status, amount, deadline, district_name, created_at'),
    ]);

    // Process creators
    const creators = creatorsRes.data || [];
    const activeCreators = creators.filter(c =>
      c.status !== 'archived' && c.lifecycle_state !== 'paused' && c.is_active !== false
    );
    const stalledCreators = activeCreators.filter(c => {
      if (c.publish_status === 'published' || c.publish_status === 'scheduled') return false;
      const lastActivity = new Date(c.updated_at || c.created_at);
      return lastActivity < fourteenDaysAgo;
    });
    const launchedCreators = creators.filter(c =>
      c.publish_status === 'published' || c.publish_status === 'scheduled'
    );

    // Process invoices -- same logic as intelligence/invoices route
    const invoices = invoicesRes.data || [];
    let totalOutstanding = 0;
    let totalOverdue = 0;
    const overdueInvoices: Array<{
      id: string; invoice_number: string; amount: number;
      due_date: string; district_name: string; notes: string;
    }> = [];
    const outstandingInvoices: Array<{
      id: string; invoice_number: string; amount: number;
      status: string; due_date: string; district_name: string; notes: string;
    }> = [];

    for (const inv of invoices) {
      const amount = parseFloat(inv.amount) || 0;
      const dueDate = inv.due_date ? new Date(inv.due_date) : null;
      const districtName = (inv.districts as any)?.name || 'Unknown';

      if (['paid', 'void', 'draft'].includes(inv.status)) continue;

      totalOutstanding += amount;
      outstandingInvoices.push({
        id: inv.id,
        invoice_number: inv.invoice_number,
        amount,
        status: inv.status,
        due_date: inv.due_date,
        district_name: districtName,
        notes: inv.notes || '',
      });

      if (dueDate && dueDate < now) {
        totalOverdue += amount;
        overdueInvoices.push({
          id: inv.id,
          invoice_number: inv.invoice_number,
          amount,
          due_date: inv.due_date,
          district_name: districtName,
          notes: inv.notes || '',
        });
      }
    }

    // Process funding (gracefully handle if table doesn't exist)
    const pursuits = fundingRes?.data || [];
    const activePursuits = pursuits.filter((p: any) => p.status !== 'closed' && p.status !== 'won');

    // Hub stats
    const hubTotal = (hubRes as any)?.count || 0;

    return NextResponse.json({
      creators: {
        total: activeCreators.length,
        stalled: stalledCreators.length,
        stalledList: stalledCreators
          .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
          .slice(0, 10)
          .map(c => ({
            id: c.id,
            name: c.name,
            phase: c.current_phase,
            content_path: c.content_path,
            course_title: c.course_title,
            last_activity: c.updated_at,
          })),
        launched: launchedCreators.length,
        inProgress: activeCreators.filter(c => c.publish_status === 'in_progress').length,
      },
      invoices: {
        totalOutstanding,
        totalOverdue,
        overdueCount: overdueInvoices.length,
        overdueList: overdueInvoices,
        outstandingCount: outstandingInvoices.length,
        outstandingList: outstandingInvoices,
      },
      hub: {
        totalEnrollments: hubTotal,
      },
      funding: {
        activePursuits: activePursuits.length,
        totalPipeline: activePursuits.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0),
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[ops-dashboard] Error:', error);
    return NextResponse.json({ error: 'Failed to load ops dashboard' }, { status: 500 });
  }
}
