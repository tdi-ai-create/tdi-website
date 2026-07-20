import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/send-scheduled-onboarding
 *
 * Runs daily at 7 AM CT. Sends welcome emails to active partnerships
 * that have never received an onboarding welcome (no 'onboarding_welcome_sent'
 * in activity_log) and have status = 'active'.
 *
 * Self-disabling: once all active partnerships have been welcomed,
 * this cron does nothing.
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

    // Get active partnerships that haven't been welcomed yet
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, slug, contact_name, contact_email')
      .eq('status', 'active')
      .gte('contract_end', new Date().toISOString().split('T')[0]);

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No partnerships to welcome' });
    }

    let sent = 0;

    for (const p of partnerships) {
      if (!p.contact_email) continue;

      // Skip if already welcomed
      const { data: alreadySent } = await supabase
        .from('activity_log')
        .select('id')
        .eq('partnership_id', p.id)
        .eq('action', 'onboarding_welcome_sent')
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      // Skip test/demo accounts
      if (p.slug === 'demo-elementary') continue;

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';

      // Get school name from organizations table
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('partnership_id', p.id)
        .maybeSingle();

      const schoolName = org?.name || p.contact_name || 'your school';
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${p.slug}`;

      const resp = await fetch('https://www.teachersdeserveit.com/api/partners/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.contact_email, firstName, schoolName, dashboardUrl }),
      });

      if (resp.ok) {
        await supabase
          .from('partnerships')
          .update({ invite_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', p.id);

        await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'onboarding_welcome_sent',
          details: { to: p.contact_email, automated: true },
        });

        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('[send-scheduled-onboarding] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
