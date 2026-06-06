import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/weekly-digest
 *
 * Monday 7 AM CT. Sends Rae a single email summarizing all partnerships:
 * health status, attention flags, KPI risks, overdue items.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all active partnerships
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, contract_phase, status, staff_enrolled, contract_start')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, message: 'No active partnerships.' });
    }

    const rows: string[] = [];
    let flagCount = 0;
    let atRiskKpis = 0;

    for (const p of partnerships) {
      // Get staff login stats
      const { data: staff } = await supabase
        .from('staff_members')
        .select('hub_login_date')
        .eq('partnership_id', p.id);

      const totalStaff = staff?.length || p.staff_enrolled || 0;
      const loggedIn = staff?.filter(s => s.hub_login_date).length || 0;
      const loginPct = totalStaff > 0 ? Math.round((loggedIn / totalStaff) * 100) : 0;

      // Get recent flags (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count: recentFlags } = await supabase
        .from('partnership_notes')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_id', p.id)
        .eq('note_type', 'concern')
        .gte('created_at', weekAgo);
      flagCount += recentFlags || 0;

      // Get KPI status
      const { data: kpis } = await supabase
        .from('partnership_kpis')
        .select('status')
        .eq('partnership_id', p.id)
        .eq('status', 'at_risk');
      atRiskKpis += kpis?.length || 0;

      // Get pending action items
      const { count: pendingItems } = await supabase
        .from('action_items')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_id', p.id)
        .eq('status', 'pending');

      // Health indicator
      const health = loginPct >= 60 && (recentFlags || 0) === 0 ? 'strong'
        : loginPct >= 30 ? 'building' : 'needs_attention';
      const healthDot = health === 'strong' ? '#22c55e' : health === 'building' ? '#EAB308' : '#EF4444';
      const healthLabel = health === 'strong' ? 'Strong' : health === 'building' ? 'Building' : 'Needs attention';

      rows.push(`
        <tr>
          <td style="padding:10px 12px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${healthDot};margin-right:8px;"></span>
            <strong>${p.contact_name}</strong>
          </td>
          <td style="padding:10px 12px;">${p.contract_phase}</td>
          <td style="padding:10px 12px;">${loginPct}%</td>
          <td style="padding:10px 12px;">${recentFlags || 0}</td>
          <td style="padding:10px 12px;">${pendingItems || 0}</td>
          <td style="padding:10px 12px;color:${healthDot};font-weight:600;">${healthLabel}</td>
        </tr>
      `);
    }

    const strongCount = rows.filter(r => r.includes('Strong')).length;
    const needsAttention = rows.filter(r => r.includes('Needs attention')).length;

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:24px;">
        <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Weekly Partnership Digest</div>
        <h1 style="font-size:22px;color:#1e2749;margin:0 0 4px;">Good morning, Rae</h1>
        <p style="color:#6B7280;font-size:14px;margin:0 0 20px;">Here's your partnership snapshot for the week.</p>

        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;background:#F0FDF4;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#22c55e;">${strongCount}</div>
            <div style="font-size:11px;color:#6B7280;">Strong</div>
          </div>
          <div style="flex:1;background:#FEF3C7;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#EAB308;">${partnerships.length - strongCount - needsAttention}</div>
            <div style="font-size:11px;color:#6B7280;">Building</div>
          </div>
          <div style="flex:1;background:#FEE2E2;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#EF4444;">${needsAttention}</div>
            <div style="font-size:11px;color:#6B7280;">Needs attention</div>
          </div>
          <div style="flex:1;background:#F3F4F6;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#1e2749;">${flagCount}</div>
            <div style="font-size:11px;color:#6B7280;">Flags this week</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#F9FAFB;">
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Partnership</th>
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Phase</th>
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Hub %</th>
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Flags</th>
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Pending</th>
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;">Health</th>
            </tr>
          </thead>
          <tbody>${rows.join('')}</tbody>
        </table>

        ${atRiskKpis > 0 ? `<div style="margin-top:16px;padding:12px 16px;background:#FEF3C7;border-radius:8px;font-size:13px;color:#92400E;font-weight:500;">${atRiskKpis} KPI${atRiskKpis !== 1 ? 's' : ''} at risk across partnerships. Check the Internal tab for details.</div>` : ''}

        <a href="https://www.teachersdeserveit.com/tdi-admin/leadership" style="display:inline-block;padding:12px 24px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;margin-top:20px;">
          Open Leadership Dashboard
        </a>
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'TDI System <notifications@teachersdeserveit.com>',
        to: ['rae@teachersdeserveit.com'],
        subject: `Weekly Digest: ${partnerships.length} partnerships | ${strongCount} strong, ${needsAttention} need attention`,
        html: emailHtml,
      }),
    });

    return NextResponse.json({ success: true, partnerships: partnerships.length, flagCount, atRiskKpis });
  } catch (error) {
    console.error('[weekly-digest] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
