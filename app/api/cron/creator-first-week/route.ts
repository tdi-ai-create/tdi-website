import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';

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
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return NextResponse.json({ success: false, error: 'Missing config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find creators added 3 days ago (window: 3-4 days to account for cron timing)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    fourDaysAgo.setHours(0, 0, 0, 0);

    const { data: newCreators } = await supabase
      .from('creators')
      .select('id, email, name, content_path, current_phase')
      .eq('status', 'active')
      .gte('created_at', fourDaysAgo.toISOString())
      .lte('created_at', threeDaysAgo.toISOString());

    if (!newCreators || newCreators.length === 0) {
      return NextResponse.json({ success: true, message: 'No new creators in the 3-day window', sent: 0 });
    }

    let sent = 0;

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

      const subject = `Your one thing this week, ${firstName}`;
      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
          <p>Hey ${firstName},</p>
          <p>Welcome to the Creator Studio! I'm Bella, and I'll be your go-to person throughout this whole process.</p>
          <p>I know starting something new can feel like a lot, so here's my suggestion: <strong>just do one thing this week.</strong></p>
          <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #854d0e;">Your one thing:</p>
            <p style="margin: 6px 0 0; color: #713f12;">${oneThing}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #a16207;">${oneThingWhy}</p>
          </div>
          <p style="margin: 20px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background-color: #1e2749; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              Open Your Creator Studio
            </a>
          </p>
          <p>If you have questions, feel stuck, or just want to talk it through — reply to this email or <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2u_lKGMRaB_tUKQNNoYRyWR4PeeSbmkIW3auqmUGzkSTJFHsWqayLNkzDWqzoySgiaJ7FR12Sn" style="color: #1e2749; font-weight: 500;">book a quick call with me</a>. I'm here and I'm happy to help.</p>
          <p>Talk soon,<br/>Bella</p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
            Bella Duran | Creator Success<br/>
            Teachers Deserve It
          </p>
        </div>
      `;

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

    return NextResponse.json({ success: true, checked: newCreators.length, sent });
  } catch (error) {
    console.error('[first-week] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
