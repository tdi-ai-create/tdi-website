import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';
import { creatorEmailTemplate } from '@/lib/creator-email-template';
import { guardCron } from '@/lib/cron-guard';

// ---------------------------------------------------------------------------
// First-Week Momentum Email
// Runs daily at 9:30 AM. Checks for creators added 3 days ago who haven't
// completed any milestone yet. Sends a warm, specific "your one thing this
// week" email from Bella with a clear next step.
//
// Philosophy: Don't nag. Give them something useful. Make the first step
// feel small and achievable.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const guard = guardCron(request);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { dryRun } = guard;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return NextResponse.json({ success: false, error: 'Missing config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find creators who are at least 3 days old but not yet 10 days old.
    //
    // This used to be a fixed 24 hour slice between the 4-days-ago and
    // 3-days-ago midnights, which had two problems. It actually selected
    // creators added 4 days ago rather than 3, and because it was exactly one
    // day wide with the cron running daily, a single missed or failed run meant
    // those creators fell out of the window permanently and never got the
    // email at all.
    //
    // A 7 day range is safe to widen to because the already-sent check below
    // is what does the deduping, not the narrowness of the window.
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 10);

    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() - 3);

    const { data: newCreators, error: newCreatorsError } = await supabase
      .from('creators')
      .select('id, email, name, content_path, current_phase, created_at')
      .eq('status', 'active')
      .gte('created_at', windowStart.toISOString())
      .lte('created_at', windowEnd.toISOString());

    if (newCreatorsError) {
      return NextResponse.json(
        { success: false, error: `Failed to read new creators: ${newCreatorsError.message}` },
        { status: 500 }
      );
    }

    if (!newCreators || newCreators.length === 0) {
      return NextResponse.json({ success: true, message: 'No new creators in the 3 to 10 day window', sent: 0, dryRun });
    }

    let sent = 0;
    const plan: Record<string, unknown>[] = [];

    for (const creator of newCreators) {
      // Check if they've completed any milestone
      const { data: completedMilestones } = await supabase
        .from('creator_milestones')
        .select('id')
        .eq('creator_id', creator.id)
        .eq('status', 'completed')
        .limit(1);

      if (completedMilestones && completedMilestones.length > 0) {
        continue; // Already progressing, no need to nudge
      }

      // Check if we already sent this email (use creator_email_log)
      const { data: alreadySent } = await supabase
        .from('creator_email_log')
        .select('id')
        .eq('creator_id', creator.id)
        .eq('category', 'first_week_momentum')
        .limit(1);

      if (alreadySent && alreadySent.length > 0) {
        continue; // Already sent
      }

      const firstName = creator.name?.split(' ')[0] || 'there';
      const dashboardLink = 'https://www.teachersdeserveit.com/creator-portal/dashboard';

      // Tailor the "one thing" based on their current state
      let oneThing = 'log into your Creator Studio and confirm your content path';
      let oneThingWhy = 'Once you pick your path (course, blog, or quick tool), everything else opens up and I can start helping you plan.';

      if (creator.content_path) {
        oneThing = 'log in and check out your milestone roadmap';
        oneThingWhy = 'Your path is set — now you can see every step from here to launch. Take a look and see what feels doable this week.';
      }

      const subject = `Creator Studio | Your one thing this week, ${firstName}`;
      const html = creatorEmailTemplate({
        firstName,
        tagline: 'Getting started is the hardest part — so let\'s make it easy',
        body: `
          <p>Hey ${firstName},</p>
          <p>Welcome to the Creator Studio! I'm Bella, and I'll be your go-to person throughout this whole process.</p>
          <p>I know starting something new can feel like a lot, so here's my suggestion: <strong>just do one thing this week.</strong></p>
          <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #854d0e;">Your one thing:</p>
            <p style="margin: 6px 0 0; color: #713f12;">${oneThing}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #a16207;">${oneThingWhy}</p>
          </div>
          <p>If you have questions, feel stuck, or just want to talk it through — reply to this email or <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2u_lKGMRaB_tUKQNNoYRyWR4PeeSbmkIW3auqmUGzkSTJFHsWqayLNkzDWqzoySgiaJ7FR12Sn" style="color: #1e2749; font-weight: 500;">book a quick call with me</a>.</p>
          <p>Talk soon,<br/>Bella</p>
        `,
        ctaLabel: 'Open My Creator Studio',
        showMission: true,
      });

      if (dryRun) {
        plan.push({
          creator: creator.name,
          to: creator.email,
          createdAt: creator.created_at,
          oneThing,
          subject,
        });
        sent++;
        continue;
      }

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
            to: [creator.email],
            bcc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
            subject,
            html,
            reply_to: 'bella@teachersdeserveit.com',
          }),
        });

        if (res.ok) {
          await logCreatorEmail({
            creator_id: creator.id,
            creator_name: creator.name,
            creator_email: creator.email,
            direction: 'to_creator',
            category: 'first_week_momentum',
            subject,
            sent_by: 'cron:creator-first-week',
          });
          sent++;
          console.log(`[first-week] Sent momentum email to ${creator.email}`);
        }
      } catch (e) {
        console.error(`[first-week] Failed to send to ${creator.email}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      checked: newCreators.length,
      sent,
      ...(dryRun ? { plan } : {}),
    });
  } catch (error) {
    console.error('[first-week] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
