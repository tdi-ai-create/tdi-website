import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/admin/send-onboarding-batch
 *
 * Sends welcome/onboarding emails to a batch of partnerships.
 * Can send immediately or be triggered by a cron for scheduled sends.
 *
 * Body: { partnershipIds: string[], dryRun?: boolean }
 *
 * If dryRun is true, returns what would be sent without actually sending.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const { partnershipIds, dryRun } = await request.json();
    if (!partnershipIds || !Array.isArray(partnershipIds) || partnershipIds.length === 0) {
      return NextResponse.json({ error: 'partnershipIds array required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get partnership details
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, slug, contact_name, contact_email, org_name, contract_phase, staff_enrolled')
      .in('id', partnershipIds)
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ error: 'No active partnerships found for given IDs' }, { status: 404 });
    }

    const results: { school: string; email: string; status: string }[] = [];

    for (const p of partnerships) {
      if (!p.contact_email) {
        results.push({ school: p.org_name || p.slug, email: 'none', status: 'skipped - no email' });
        continue;
      }

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';
      const schoolName = p.org_name || p.contact_name || 'your school';
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${p.slug}`;

      if (dryRun) {
        results.push({ school: schoolName, email: p.contact_email, status: 'would send' });
        continue;
      }

      // Send the welcome email
      const resp = await fetch('https://www.teachersdeserveit.com/api/partners/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: p.contact_email,
          firstName,
          schoolName,
          dashboardUrl,
        }),
      });

      if (resp.ok) {
        // Update invite_sent_at
        await supabase
          .from('partnerships')
          .update({
            invite_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', p.id);

        // Log activity
        await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'onboarding_welcome_sent',
          details: { to: p.contact_email, by: auth.member.email },
        });

        results.push({ school: schoolName, email: p.contact_email, status: 'sent' });
      } else {
        results.push({ school: schoolName, email: p.contact_email, status: 'failed' });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: !!dryRun,
      results,
      sent: results.filter(r => r.status === 'sent').length,
      total: results.length,
    });
  } catch (error) {
    console.error('[send-onboarding-batch] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
