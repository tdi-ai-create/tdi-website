import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';

// ---------------------------------------------------------------------------
// Creator Re-engagement Cron
// Runs daily at 10 AM. Manages a state machine for stalled creators:
//   Step 0: Initial warm check-in (after 15 days inactive)
//   Steps 1-5: Weekly nudge emails
//   Step 6: Pause notice → auto-pause account
// If the creator shows any portal activity, the sequence auto-cancels.
// ---------------------------------------------------------------------------

const STALL_THRESHOLD_DAYS = 15;
const STEP_INTERVAL_DAYS = 7;

// Bella's identity for emails
const EMAIL_FROM = 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>';
const REPLY_TO = 'bella@teachersdeserveit.com';

// ---------------------------------------------------------------------------
// Email templates — warm, short, from Bella
// ---------------------------------------------------------------------------

function getEmailContent(step: number, firstName: string): { subject: string; html: string } {
  const dashboardLink = 'https://www.teachersdeserveit.com/creator-portal/dashboard';
  const wrapper = (body: string) => `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
      ${body}
      <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
        Bella Duran | Creator Success<br/>
        Teachers Deserve It
      </p>
    </div>
  `;

  switch (step) {
    case 0:
      return {
        subject: `Hey ${firstName}, just checking in`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>I noticed it's been a little while since you've been in the Creator Studio — just wanted to reach out and see how things are going.</p>
          <p>No pressure at all. If you're busy or life got hectic, totally get it. I just want to make sure you know I'm here if you need anything.</p>
          <p>You can always <a href="${dashboardLink}" style="color: #1e2749; font-weight: 500;">pop back into your dashboard</a> whenever you're ready.</p>
          <p>Talk soon,<br/>Bella</p>
        `),
      };

    case 1:
      return {
        subject: `Quick thought for you, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>Sometimes the hardest part is just opening the project back up — I get it. If it helps, even 15 minutes of progress can shift your momentum.</p>
          <p>Your <a href="${dashboardLink}" style="color: #1e2749; font-weight: 500;">dashboard</a> is right where you left it. What's one small thing you could tackle today?</p>
          <p>Rooting for you,<br/>Bella</p>
        `),
      };

    case 2:
      return {
        subject: `You're not alone in this, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>I work with creators every day, and I can tell you — almost everyone hits a pause at some point. It's normal and it doesn't mean you're behind.</p>
          <p>If something specific is holding you up, I'd love to help you work through it. Just reply to this email and let me know what's going on.</p>
          <p>Here for you,<br/>Bella</p>
        `),
      };

    case 3:
      return {
        subject: `Thinking about your project, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>Your content idea is still a great one — I just wanted to remind you of that. The educators who will benefit from your work are still out there waiting for it.</p>
          <p>If your timeline needs to shift, that's completely fine. We can adjust your <a href="${dashboardLink}" style="color: #1e2749; font-weight: 500;">target date</a> together — no judgment.</p>
          <p>Just say the word,<br/>Bella</p>
        `),
      };

    case 4:
      return {
        subject: `Still here for you, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>I know these emails might be piling up, and I promise I'm not trying to add to your plate. I just want you to know the door is open whenever you're ready.</p>
          <p>If now isn't the right time, that's okay too. Just reply and let me know — even a quick "not yet" helps me know where you're at.</p>
          <p>Warmly,<br/>Bella</p>
        `),
      };

    case 5:
      return {
        subject: `One more check-in, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>This will be my last weekly check-in for now. I want to respect your time and your bandwidth.</p>
          <p>If you'd like to keep going with your project, just <a href="${dashboardLink}" style="color: #1e2749; font-weight: 500;">log back into your dashboard</a> or reply here — I'll be right here to help.</p>
          <p>Otherwise, I'll follow up one more time next week with some next steps about your account.</p>
          <p>No matter what, I'm glad you started this journey,<br/>Bella</p>
        `),
      };

    case 6:
      return {
        subject: `Update on your Creator Studio account, ${firstName}`,
        html: wrapper(`
          <p>Hey ${firstName},</p>
          <p>Since it's been a while, we're going to go ahead and pause your Creator Studio account. This way it's not hanging over you, and you can focus on whatever else needs your attention right now.</p>
          <p>This is <strong>not</strong> a goodbye — your work and progress are saved. Whenever you're ready to pick things back up, just reply to this email or click the link below and we'll get you going again.</p>
          <p style="margin: 20px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background-color: #1e2749; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              Reactivate My Account
            </a>
          </p>
          <p>Wishing you the best,<br/>Bella</p>
        `),
      };

    default:
      return { subject: '', html: '' };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Auth check
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
      return NextResponse.json(
        { success: false, error: 'Missing server config (Supabase or Resend)' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const results = {
      sequencesStarted: 0,
      sequencesCancelled: 0,
      emailsSent: 0,
      accountsPaused: 0,
      errors: [] as string[],
    };

    // ----- PHASE 1: Cancel sequences where creator became active -----
    const { data: activeSequences } = await supabase
      .from('creator_reengagement_sequences')
      .select('id, creator_id, started_at')
      .eq('status', 'active');

    if (activeSequences && activeSequences.length > 0) {
      for (const seq of activeSequences) {
        // Check if creator's updated_at is newer than the sequence start
        const { data: creator } = await supabase
          .from('creators')
          .select('updated_at, name, lifecycle_state')
          .eq('id', seq.creator_id)
          .single();

        if (!creator) continue;

        const creatorUpdated = new Date(creator.updated_at);
        const seqStarted = new Date(seq.started_at);

        // Also cancel if creator is already paused/withdrawn
        const shouldCancel =
          creatorUpdated > seqStarted ||
          creator.lifecycle_state === 'paused';

        if (shouldCancel) {
          await supabase
            .from('creator_reengagement_sequences')
            .update({
              status: 'cancelled',
              cancelled_at: now.toISOString(),
              cancelled_reason: creatorUpdated > seqStarted ? 'creator_active' : 'already_paused',
              updated_at: now.toISOString(),
            })
            .eq('id', seq.id);

          results.sequencesCancelled++;
          console.log(`[reengagement] Cancelled sequence for creator ${seq.creator_id} — creator became active`);
        }
      }
    }

    // ----- PHASE 2: Advance active sequences (send next email) -----
    const { data: sequencesToAdvance } = await supabase
      .from('creator_reengagement_sequences')
      .select('id, creator_id, current_step, last_email_sent_at')
      .eq('status', 'active');

    if (sequencesToAdvance && sequencesToAdvance.length > 0) {
      for (const seq of sequencesToAdvance) {
        const lastSent = new Date(seq.last_email_sent_at);
        const daysSinceLastEmail = Math.floor(
          (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastEmail < STEP_INTERVAL_DAYS) continue;

        const nextStep = seq.current_step + 1;

        // Get creator info for email
        const { data: creator } = await supabase
          .from('creators')
          .select('email, name')
          .eq('id', seq.creator_id)
          .single();

        if (!creator?.email) continue;

        const firstName = creator.name?.split(' ')[0] || 'there';

        if (nextStep <= 6) {
          // Send the next email
          const { subject, html } = getEmailContent(nextStep, firstName);
          const sent = await sendEmail(resendApiKey, creator.email, subject, html);

          if (sent) {
            results.emailsSent++;

            if (nextStep === 6) {
              // Step 6 sent — mark sequence completed and auto-pause
              await supabase
                .from('creator_reengagement_sequences')
                .update({
                  current_step: nextStep,
                  last_email_sent_at: now.toISOString(),
                  status: 'completed',
                  completed_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq('id', seq.id);

              // Auto-pause the creator account
              const paused = await pauseCreatorAccount(supabase, seq.creator_id);
              if (paused) {
                results.accountsPaused++;
                console.log(`[reengagement] Auto-paused creator ${seq.creator_id} after step 6`);
              }
            } else {
              // Advance to next step
              await supabase
                .from('creator_reengagement_sequences')
                .update({
                  current_step: nextStep,
                  last_email_sent_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq('id', seq.id);
            }

            await logCreatorEmail({
              creator_id: seq.creator_id,
              creator_name: creator.name,
              creator_email: creator.email,
              direction: 'to_creator',
              category: 'reengagement',
              subject,
              step: nextStep,
              sent_by: 'cron:creator-reengagement',
            });
            console.log(`[reengagement] Sent step ${nextStep} email to ${creator.email}`);
          } else {
            results.errors.push(`Failed to send step ${nextStep} email to ${creator.email}`);
          }
        }
      }
    }

    // ----- PHASE 3: Start new sequences for newly stalled creators -----
    const stallCutoff = new Date(now);
    stallCutoff.setDate(stallCutoff.getDate() - STALL_THRESHOLD_DAYS);

    // Find active creators who haven't been updated in 15+ days
    // and don't already have an active sequence
    const { data: stalledCreators } = await supabase
      .from('creators')
      .select('id, email, name')
      .eq('status', 'active')
      .or('lifecycle_state.is.null,lifecycle_state.eq.active')
      .lt('updated_at', stallCutoff.toISOString())
      .neq('publish_status', 'published');

    if (stalledCreators && stalledCreators.length > 0) {
      for (const creator of stalledCreators) {
        // Check if there's already an active sequence
        const { data: existingSeq } = await supabase
          .from('creator_reengagement_sequences')
          .select('id')
          .eq('creator_id', creator.id)
          .eq('status', 'active')
          .single();

        if (existingSeq) continue; // Already has an active sequence

        // Check if we've already completed a sequence for this creator recently (within 90 days)
        // to avoid re-triggering on creators who were already paused and came back
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const { data: recentSeq } = await supabase
          .from('creator_reengagement_sequences')
          .select('id')
          .eq('creator_id', creator.id)
          .in('status', ['completed', 'cancelled'])
          .gte('created_at', ninetyDaysAgo.toISOString())
          .limit(1);

        if (recentSeq && recentSeq.length > 0) continue; // Had a sequence recently

        const firstName = creator.name?.split(' ')[0] || 'there';
        const { subject, html } = getEmailContent(0, firstName);
        const sent = await sendEmail(resendApiKey, creator.email, subject, html);

        if (sent) {
          // Create the sequence record
          await supabase
            .from('creator_reengagement_sequences')
            .insert({
              creator_id: creator.id,
              current_step: 0,
              last_email_sent_at: now.toISOString(),
              status: 'active',
            });

          // Update creator status to followed_up
          await supabase
            .from('creators')
            .update({
              last_followed_up_at: now.toISOString(),
              followed_up_by: 'system:reengagement',
            })
            .eq('id', creator.id);

          await logCreatorEmail({
            creator_id: creator.id,
            creator_name: creator.name,
            creator_email: creator.email,
            direction: 'to_creator',
            category: 'reengagement',
            subject,
            step: 0,
            sent_by: 'cron:creator-reengagement',
          });

          results.sequencesStarted++;
          results.emailsSent++;
          console.log(`[reengagement] Started sequence for ${creator.email} (stalled ${STALL_THRESHOLD_DAYS}+ days)`);
        } else {
          results.errors.push(`Failed to start sequence for ${creator.email}`);
        }
      }
    }

    console.log(`[reengagement] Done — started: ${results.sequencesStarted}, cancelled: ${results.sequencesCancelled}, emails: ${results.emailsSent}, paused: ${results.accountsPaused}`);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('[reengagement] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        bcc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[reengagement] Resend error:', err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[reengagement] Email send error:', e);
    return false;
  }
}

async function pauseCreatorAccount(
  supabase: any,
  creatorId: string
): Promise<boolean> {
  try {
    const { randomBytes } = await import('crypto');
    const unpauseToken = randomBytes(24).toString('hex');

    await (supabase.from('creators') as any).update({
      lifecycle_state: 'paused',
      paused_at: new Date().toISOString(),
      paused_by: 'system:reengagement',
      pause_reason: 'Auto-paused after 6-week re-engagement sequence with no response',
      pause_type: 'pause_mid_project',
      unpause_token: unpauseToken,
      updated_at: new Date().toISOString(),
    }).eq('id', creatorId);

    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creatorId,
      event_type: 'paused',
      triggered_by: 'system:reengagement',
      triggered_by_type: 'system',
      reason: 'Auto-paused after 6-week re-engagement sequence with no response',
    });

    return true;
  } catch (e) {
    console.error('[reengagement] Pause error:', e);
    return false;
  }
}
