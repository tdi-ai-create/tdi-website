import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Reminder intervals in days before target date
const REMINDER_INTERVALS = [
  { days: 60, type: '60_days' },
  { days: 30, type: '30_days' },
  { days: 14, type: '14_days' },
  { days: 7, type: '7_days' },
  { days: 3, type: '3_days' },
];

export async function GET(request: NextRequest) {
  try {
    // Verify this is called from Vercel cron or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret if set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow the request if coming from localhost or vercel cron
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        console.log('[creator-reminders] Unauthorized request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server config error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all creators with a target_completion_date set and not yet launched
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, email, name, target_completion_date, content_path, publish_status')
      .not('target_completion_date', 'is', null)
      .neq('publish_status', 'published')
      .eq('status', 'active');

    if (creatorsError) {
      console.error('[creator-reminders] Error fetching creators:', creatorsError);
      return NextResponse.json(
        { success: false, error: creatorsError.message },
        { status: 500 }
      );
    }

    if (!creators || creators.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No creators with target dates found',
        remindersChecked: 0,
        remindersSent: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let remindersChecked = 0;
    let remindersSent = 0;
    const results: { creatorId: string; creatorName: string; reminderType: string; success: boolean }[] = [];

    for (const creator of creators) {
      const targetDate = new Date(creator.target_completion_date);
      targetDate.setHours(0, 0, 0, 0);
      const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Check each reminder interval
      for (const interval of REMINDER_INTERVALS) {
        remindersChecked++;

        // Only send if we're at exactly this interval (or within 1 day to account for cron timing)
        if (daysUntilTarget === interval.days || daysUntilTarget === interval.days - 1) {
          // Check if this reminder was already sent for this target date
          const { data: existingReminder, error: reminderError } = await supabase
            .from('creator_reminder_log')
            .select('id')
            .eq('creator_id', creator.id)
            .eq('reminder_type', interval.type)
            .eq('target_date', creator.target_completion_date)
            .single();

          if (reminderError && reminderError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is fine
            console.error('[creator-reminders] Error checking existing reminder:', reminderError);
            continue;
          }

          if (existingReminder) {
            // Already sent this reminder
            continue;
          }

          // Send the reminder email
          if (resendApiKey && creator.email) {
            const firstName = creator.name.split(' ')[0];
            const contentType = creator.content_path === 'course' ? 'course' :
                               creator.content_path === 'blog' ? 'blog post' :
                               creator.content_path === 'download' ? 'download' : 'content';

            try {
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
                  to: [creator.email],
                  subject: `You're ${interval.days} days from your launch goal - ${firstName}!`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #1e2749;">Hey ${firstName}!</h2>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Just a friendly reminder that you're <strong>${interval.days} days</strong> away from your ${contentType} launch goal!
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Your target launch date is <strong>${targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        We know life happens, and it's totally okay to adjust your goal if needed. Pop into your dashboard to update your timeline or check your progress.
                      </p>
                      <div style="margin: 24px 0;">
                        <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                           style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                          Go to Your Dashboard
                        </a>
                      </div>
                      <p style="color: #6b7280; font-size: 14px;">
                        You've got this! The TDI Team is cheering you on.
                      </p>
                    </div>
                  `,
                }),
              });

              if (emailResponse.ok) {
                // Log the sent reminder
                await supabase
                  .from('creator_reminder_log')
                  .insert({
                    creator_id: creator.id,
                    reminder_type: interval.type,
                    target_date: creator.target_completion_date,
                  });

                remindersSent++;
                results.push({
                  creatorId: creator.id,
                  creatorName: creator.name,
                  reminderType: interval.type,
                  success: true,
                });
                console.log(`[creator-reminders] Sent ${interval.type} reminder to ${creator.email}`);
              } else {
                const errorData = await emailResponse.json();
                console.error(`[creator-reminders] Failed to send email to ${creator.email}:`, errorData);
                results.push({
                  creatorId: creator.id,
                  creatorName: creator.name,
                  reminderType: interval.type,
                  success: false,
                });
              }
            } catch (emailError) {
              console.error(`[creator-reminders] Email error for ${creator.email}:`, emailError);
              results.push({
                creatorId: creator.id,
                creatorName: creator.name,
                reminderType: interval.type,
                success: false,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${creators.length} creators`,
      remindersChecked,
      remindersSent,
      results,
    });
  } catch (error) {
    console.error('[creator-reminders] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
