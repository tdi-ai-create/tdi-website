import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { MAILABLE_COLUMNS, MAILABLE_STATUSES, splitMailable } from '@/lib/partnerships/mailable';

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
    // Fails closed, and parses ?dryRun=1. The old inline check authorized
    // nothing when CRON_SECRET was unset.
    const guard = guardCron(request);
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
    const { dryRun } = guard;

    // A dry run never sends, so it must not require the key.
    if (!dryRun && !RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Partnerships that may be mailed as clients and have not been welcomed yet.
    // The contract_end test is this job's own rule and stays; the signed test is
    // shared. See lib/partnerships/mailable.ts.
    const { data: candidates } = await supabase
      .from('partnerships')
      .select(`${MAILABLE_COLUMNS}, slug, contract_end`)
      .in('status', MAILABLE_STATUSES)
      .gte('contract_end', new Date().toISOString().split('T')[0]);

    const { mailable: partnerships, skipped } = splitMailable(candidates || []);

    if (partnerships.length === 0) {
      return NextResponse.json({ success: true, sent: 0, skipped, message: 'No partnerships to welcome' });
    }

    let sent = 0;
    const failures: string[] = [];
    const wouldSend: Array<{ to: string; school: string }> = [];

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

      if (dryRun) {
        wouldSend.push({ to: p.contact_email, school: schoolName });
        continue;
      }

      const resp = await fetch('https://www.teachersdeserveit.com/api/partners/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.contact_email, firstName, schoolName, dashboardUrl }),
      });

      if (resp.ok) {
        // The email has already gone. If this stamp fails, the same partnership
        // is picked up again tomorrow and the leader gets a second welcome, so
        // a silent failure here is a duplicate send rather than a missing row.
        const { error: stampError } = await supabase
          .from('partnerships')
          .update({ invite_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', p.id);

        if (stampError) {
          console.error(`[send-scheduled-onboarding] welcome sent to ${p.contact_email} but invite_sent_at not stamped, so it will send again tomorrow:`, stampError.message);
          failures.push(`${p.id}: ${stampError.message}`);
        }

        const { error: logError } = await supabase.from('activity_log').insert({
          partnership_id: p.id,
          action: 'onboarding_welcome_sent',
          details: { to: p.contact_email, automated: true },
        });

        if (logError) {
          console.error('[send-scheduled-onboarding] activity_log insert failed:', logError.message);
        }

        sent++;
      }
    }

    // A cron that emails people and reports success while failing to record it
    // is how the same school gets welcomed twice. Surface it in the response so
    // the run shows as failed rather than green.
    if (failures.length > 0) {
      return NextResponse.json(
        { success: false, sent, failures, error: `${failures.length} welcome(s) sent but not recorded` },
        { status: 500 }
      );
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldSend: wouldSend.length,
        recipients: wouldSend,
        skipped,
      });
    }

    return NextResponse.json({ success: true, sent, skipped });
  } catch (error) {
    console.error('[send-scheduled-onboarding] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
