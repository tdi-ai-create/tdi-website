import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Ops Dashboard API -- Aggregates key metrics for daily ops view
 * Pulls from: creators, sales_opportunities (invoices), hub (separate DB), funding
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
    const [creatorsRes, oppsRes, hubRes, fundingRes] = await Promise.all([
      // Creators
      supabase
        .from('creators')
        .select('id, name, email, current_phase, publish_status, lifecycle_state, is_active, status, content_path, course_title, target_completion_date, created_at, updated_at')
        .neq('status', 'archived'),

      // Sales opportunities (invoices come from here -- needs_invoice flag)
      (supabase.from('sales_opportunities') as any).select('*'),

      // Hub data from separate database
      hubSupabase
        ? Promise.all([
            hubSupabase.from('profiles').select('id', { count: 'exact', head: true }),
            hubSupabase.from('profiles').select('id, tier, created_at, last_login_at, organization').not('tier', 'eq', 'free'),
            hubSupabase.from('hub_courses').select('id', { count: 'exact', head: true }),
            hubSupabase.from('profiles').select('id').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
          ])
        : Promise.resolve([{ count: null }, { data: null }, { count: null }, { data: null }]),

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

    // Process invoices from sales_opportunities (same source as Operations page)
    const allOpps = oppsRes.data || [];
    const invoicesOwed = allOpps.filter((o: any) => o.needs_invoice);
    const totalInvoiceAmount = invoicesOwed.reduce((s: number, o: any) => s + (o.invoice_amount || 0), 0);
    const tbdCount = invoicesOwed.filter((o: any) => !o.invoice_amount).length;

    const invoiceList = invoicesOwed.map((o: any) => ({
      id: o.id,
      district: o.name,
      amount: o.invoice_amount || 0,
      contract_year: o.contract_year,
      notes: o.invoice_notes || o.notes || '',
      needs_action: !o.invoice_amount || o.relationship_signal === 'contact_changed',
      blocked_reason: o.relationship_signal === 'contact_changed'
        ? 'Contact changed -- need new contact before sending invoice'
        : !o.invoice_amount
        ? 'Invoice amount needs to be calculated'
        : null,
      contact_changed: o.relationship_signal === 'contact_changed',
    }));

    // Process funding (gracefully handle if table doesn't exist)
    const pursuits = fundingRes?.data || [];
    const activePursuits = pursuits.filter((p: any) => p.status !== 'closed' && p.status !== 'won');

    // Hub stats
    const [hubProfilesRes, hubPaidRes, hubCoursesRes, hubRecentRes] = hubRes as any[];
    const hubTotal = hubProfilesRes?.count || 0;
    const hubPaidMembers = hubPaidRes?.data?.length || 0;
    const hubCourseCount = hubCoursesRes?.count || 0;
    const hubNewThisWeek = hubRecentRes?.data?.length || 0;
    const hubRecentLogins = (hubPaidRes?.data || []).filter((p: any) =>
      p.last_login_at && new Date(p.last_login_at) > new Date(Date.now() - 30 * 86400000)
    ).length;

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
            email: c.email,
            phase: c.current_phase,
            content_path: c.content_path,
            course_title: c.course_title,
            last_activity: c.updated_at,
            target_date: c.target_completion_date,
          })),
        launched: launchedCreators.length,
        inProgress: activeCreators.filter(c => c.publish_status === 'in_progress').length,
      },
      invoices: {
        count: invoicesOwed.length,
        totalAmount: totalInvoiceAmount,
        tbdCount,
        list: invoiceList,
      },
      hub: {
        totalEnrollments: hubTotal,
        paidMembers: hubPaidMembers,
        courseCount: hubCourseCount,
        newThisWeek: hubNewThisWeek,
        activeLogins30d: hubRecentLogins,
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
