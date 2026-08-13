import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';
import { CREATOR_STUDIO_BCC } from '@/lib/creator-notification-recipients';
import { guardCron, checkedWrite } from '@/lib/cron-guard';

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
    const guard = guardCron(request);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { dryRun } = guard;

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

    // Get all creators with a launch date set and not yet launched.
    //
    // Reads BOTH date columns. The Creator Portal dashboard writes
    // projected_completion_date (app/api/creator-portal/set-projected-date),
    // while this cron was only ever looking at target_completion_date. Of 21
    // active creators with a launch date, 20 had only the projected one, so
    // they were invisible here. set-projected-date now dual-writes, but every
    // date set before that shipped is projected-only and was never backfilled.
    //
    // target wins when both are set, since it is the explicitly-committed date.
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, email, name, target_completion_date, projected_completion_date, content_path, publish_status')
      .or('target_completion_date.not.is.null,projected_completion_date.not.is.null')
      .neq('publish_status', 'published')
      .eq('status', 'active')
      .or('lifecycle_state.is.null,lifecycle_state.eq.active');

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
        message: 'No creators with launch dates found',
        remindersChecked: 0,
        remindersSent: 0,
        dryRun,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let remindersChecked = 0;
    let remindersSent = 0;
    const errors: string[] = [];
    const plan: Record<string, unknown>[] = [];
    const results: { creatorId: string; creatorName: string; reminderType: string; success: boolean }[] = [];

    for (const creator of creators) {
      const launchDateStr = creator.target_completion_date || creator.projected_completion_date;
      if (!launchDateStr) continue;

      // Parse the date parts explicitly rather than `new Date(launchDateStr)`.
      //
      // These columns are DATE, so PostgREST returns a bare "YYYY-MM-DD", which
      // `new Date()` parses as UTC midnight. The following setHours(0,0,0,0)
      // then snaps to LOCAL midnight, which in any negative UTC offset lands on
      // the previous day. Production runs in UTC so the two cancel out, but the
      // countdown was off by one anywhere else, and the launch date printed in
      // the email body was a day early too. Building the date from its parts
      // makes both sides local midnight and the arithmetic exact everywhere.
      const [ly, lm, ld] = launchDateStr.split('-').map(Number);
      const targetDate = new Date(ly, lm - 1, ld);
      const daysUntilTarget = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Check each reminder interval
      for (const interval of REMINDER_INTERVALS) {
        remindersChecked++;

        // Bands rather than exact days, so a skipped cron run does not drop a
        // reminder entirely. A creator first seen 45 days out lands in the 60
        // band and gets one catch-up note.
        const nextInterval = REMINDER_INTERVALS[REMINDER_INTERVALS.indexOf(interval) + 1];
        const lowerBound = nextInterval ? nextInterval.days + 1 : 0;
        if (daysUntilTarget >= lowerBound && daysUntilTarget <= interval.days) {
          // Check if this reminder was already sent for this launch date.
          //
          // maybeSingle, not single. single() returns PGRST116 for both "no
          // rows" and "multiple rows", so duplicate log rows would read back as
          // "never sent" and resend on every run. The unique index added in
          // migration 115 also prevents duplicates at the write side.
          const { data: existingReminder, error: reminderError } = await supabase
            .from('creator_reminder_log')
            .select('id')
            .eq('creator_id', creator.id)
            .eq('reminder_type', interval.type)
            .eq('target_date', launchDateStr)
            .maybeSingle();

          if (reminderError) {
            // Do not fall through to sending on a failed dedupe read. This is
            // also the branch that silently disabled the entire cron: the
            // creator_reminder_log table did not exist, every read failed with
            // 42703, and the old code only forgave PGRST116 so every creator
            // hit continue. The table now exists (migration 115) but a genuine
            // read failure must still be loud rather than silent.
            const msg = `dedupe read for ${creator.email} (${interval.type}): ${reminderError.message}`;
            console.error(`[creator-reminders] ${msg}`);
            errors.push(msg);
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

            // Say the real number of days, not the band label. Because the
            // bands are ranges, a creator 45 days out falls in the 60 band and
            // would have been told "60 days to launch" on a date 45 days away.
            const daysLabel = daysUntilTarget === 1 ? '1 day' : `${daysUntilTarget} days`;
            const subject = `Creator Studio | ${daysLabel} to launch, ${firstName}!`;

            if (dryRun) {
              plan.push({
                creator: creator.name,
                to: creator.email,
                reminderType: interval.type,
                actualDaysOut: daysUntilTarget,
                launchDate: launchDateStr,
                dateSource: creator.target_completion_date ? 'target' : 'projected',
                subject,
              });
              remindersSent++;
              continue;
            }

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
                  bcc: CREATOR_STUDIO_BCC,
                  subject,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #1e2749;">Hey ${firstName}!</h2>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Just a friendly reminder that you're <strong>${daysLabel}</strong> away from your ${contentType} launch goal!
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
                // Log the sent reminder. The unique index on
                // (creator_id, reminder_type, target_date) is the real
                // guarantee against a double-send if the cron is invoked twice.
                await checkedWrite(
                  `reminder log for ${creator.email} (${interval.type})`,
                  supabase
                    .from('creator_reminder_log')
                    .insert({
                      creator_id: creator.id,
                      reminder_type: interval.type,
                      target_date: launchDateStr,
                    }),
                  errors
                );

                await logCreatorEmail({
                  creator_id: creator.id,
                  creator_name: creator.name,
                  creator_email: creator.email,
                  direction: 'to_creator',
                  category: 'countdown_reminder',
                  subject: `You're ${daysLabel} from your launch goal`,
                  sent_by: 'cron:creator-reminders',
                  metadata: {
                    reminder_type: interval.type,
                    days: daysUntilTarget,
                    date_source: creator.target_completion_date ? 'target' : 'projected',
                  },
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
      dryRun,
      message: `Processed ${creators.length} creators`,
      remindersChecked,
      remindersSent,
      errors,
      ...(dryRun ? { plan } : { results }),
    });
  } catch (error) {
    console.error('[creator-reminders] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
