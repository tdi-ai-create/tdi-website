import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Ops Dashboard API -- Aggregates key metrics for Bella's daily view
 * Pulls from: creators, invoices, hub enrollments, funding pursuits
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

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch creators, invoices, hub stats, and funding in parallel
    const [creatorsRes, invoicesRes, hubRes, fundingRes] = await Promise.all([
      // Creators
      supabase
        .from('creators')
        .select('id, name, email, current_phase, publish_status, lifecycle_state, is_active, status, content_path, course_title, target_completion_date, created_at, updated_at')
        .neq('status', 'archived'),

      // Invoices
      supabase
        .from('intelligence_invoices')
        .select('id, invoice_number, amount, status, due_date, invoice_date, district_id, notes, intelligence_districts(name)'),

      // Hub enrollments (count)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      // Funding pursuits (table may not exist yet)
      supabase
        .from('funding_pursuits')
        .select('id, title, status, amount, deadline, district_name, created_at'),
    ]);

    // Process creators
    const creators = creatorsRes.data || [];
    const activeCreators = creators.filter(c => c.status !== 'archived' && c.lifecycle_state !== 'paused' && c.is_active !== false);
    const stalledCreators = activeCreators.filter(c => {
      if (c.publish_status === 'published' || c.publish_status === 'scheduled') return false;
      const lastActivity = new Date(c.updated_at || c.created_at);
      return lastActivity < fourteenDaysAgo;
    });
    const waitingOnTDI = activeCreators.filter(c => c.publish_status === 'in_progress');
    const launchedCreators = creators.filter(c => c.publish_status === 'published' || c.publish_status === 'scheduled');

    // Process invoices
    const invoices = invoicesRes.data || [];
    let totalOutstanding = 0;
    let totalOverdue = 0;
    const overdueInvoices: Array<{ id: string; invoice_number: string; amount: number; due_date: string; district_name: string }> = [];

    for (const inv of invoices) {
      const amount = parseFloat(inv.amount) || 0;
      const dueDate = inv.due_date ? new Date(inv.due_date) : null;

      if (inv.status === 'paid' || inv.status === 'void' || inv.status === 'draft') continue;

      totalOutstanding += amount;

      if (dueDate && dueDate < now) {
        totalOverdue += amount;
        overdueInvoices.push({
          id: inv.id,
          invoice_number: inv.invoice_number,
          amount,
          due_date: inv.due_date,
          district_name: (inv as any).intelligence_districts?.name || 'Unknown',
        });
      }
    }

    // Process funding (gracefully handle if table doesn't exist)
    const pursuits = fundingRes?.data || [];
    const activePursuits = pursuits.filter((p: any) => p.status !== 'closed' && p.status !== 'won');

    // Hub stats
    const hubTotal = hubRes.count || 0;

    return NextResponse.json({
      creators: {
        total: activeCreators.length,
        stalled: stalledCreators.length,
        stalledList: stalledCreators.slice(0, 10).map(c => ({
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
