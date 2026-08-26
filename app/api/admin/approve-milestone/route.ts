import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearFlagForCompletedMilestone } from '@/lib/creator-agent-flags';
import { creatorFlag } from '@/lib/creator-flags';
import { advanceStep } from '@/lib/creator-step-engine';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Steps that were merged into another and still exist as their own rows on
 * older boards. Completing the parent has to complete these too, or the board
 * keeps a leftover open. Only the pre-engine path needs this: both targets are
 * marked collapsed, and the engine refuses to open a collapsed step at all.
 */
const PAIRED_MILESTONES: Record<string, string> = {
  test_video_recorded: 'test_video_submitted',
  drive_folder_created: 'assets_submitted',
};

/**
 * Finds the one step row this request means.
 *
 * The route has always been given a creator and a milestone, which does not
 * identify a row: a creator on a second project has two rows for the same step.
 * The old code took whichever the database returned first and completed both.
 *
 * Ambiguity is an error here rather than a guess. Katie Welch is the only
 * creator with two projects today, so a wrong guess is silent and rare, which is
 * the worst combination.
 */
async function resolveStepRow(
  supabase: any,
  creatorId: string,
  milestoneId: string,
  explicitRecordId?: string
): Promise<{ recordId?: string; error?: string }> {
  if (explicitRecordId) return { recordId: explicitRecordId };

  const { data, error } = await supabase
    .from('creator_milestones')
    .select('id, project_id')
    .eq('creator_id', creatorId)
    .eq('milestone_id', milestoneId);

  if (error) return { error: `Could not find the step: ${error.message}` };
  if (!data || data.length === 0) return { error: 'No matching creator_milestone record found' };

  if (data.length > 1) {
    return {
      error:
        'This creator has more than one project carrying that step. ' +
        'Send milestoneRecordId to say which one.',
    };
  }

  return { recordId: data[0].id as string };
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[approve-milestone] Missing env vars');
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    console.log('[approve-milestone] Request body:', body);

    const { milestoneId, creatorId, adminEmail, outOfOrder, note, milestoneRecordId } = body;

    if (!milestoneId || !creatorId) {
      console.error('[approve-milestone] Missing required fields:', { milestoneId, creatorId });
      return NextResponse.json({
        success: false,
        error: 'Missing milestoneId or creatorId'
      }, { status: 400 });
    }

    const isOutOfOrder = outOfOrder === true;

    // 1. Get creator info
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name, email, content_path, lifecycle_state')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      console.error('[approve-milestone] Creator fetch error:', creatorError);
      return NextResponse.json({ success: false, error: `Creator not found: ${creatorError.message}` }, { status: 404 });
    }
    console.log('[approve-milestone] Found creator:', creator?.name);

    // 2. Get milestone info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (milestoneError) {
      console.error('[approve-milestone] Milestone fetch error:', milestoneError);
      return NextResponse.json({ success: false, error: `Milestone not found: ${milestoneError.message}` }, { status: 404 });
    }
    console.log('[approve-milestone] Found milestone:', milestone);

    const completedAt = new Date().toISOString();
    const adminName = adminEmail?.split('@')[0] || 'admin';

    // ---- The step engine, behind creator_config.step_engine ----------------
    //
    // One function completes the step and decides what opens next, scoped to
    // the project. Everything below this block is the old path, kept intact so
    // the flag switches between two working implementations rather than
    // between a working one and a half finished one.
    //
    // Out of order approval still uses the old path. It is a deliberate
    // override of sequence, which is the one thing the engine is built to
    // refuse, so it needs its own design rather than being forced through this.
    const useEngine = !isOutOfOrder && (await creatorFlag(supabase, 'step_engine'));
    let engineNextStep: string | null = null;

    if (useEngine) {
      const resolved = await resolveStepRow(supabase, creatorId, milestoneId, milestoneRecordId);
      if (resolved.error || !resolved.recordId) {
        return NextResponse.json({ success: false, error: resolved.error }, { status: 400 });
      }

      // A paused creator gets a correct board and no clock. Repairing a board
      // and starting a deadline are two different things, and a paused creator
      // waking to an overdue step is the reason step reminders are still off.
      const isPaused = creator?.lifecycle_state === 'paused';

      const result = await advanceStep(supabase, {
        milestoneRecordId: resolved.recordId,
        decision: 'approve',
        actor: adminEmail ? `admin:${adminEmail}` : 'admin',
        startClock: !isPaused,
      });

      if (!result.ok) {
        console.error('[approve-milestone] Engine refused:', result.error);
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }

      engineNextStep = result.openStep?.name ?? null;
      await clearFlagForCompletedMilestone(supabase, creatorId, milestoneId);
      console.log('[approve-milestone] Engine completed the step. Next:', engineNextStep ?? 'end of path');
    }

    // 3. Mark milestone as completed (only update columns that exist)
    // Build update object with optional metadata for out-of-order completions

    if (!useEngine) {
    const updateObj: Record<string, unknown> = {
      status: 'completed',
      updated_at: completedAt,
      completed_at: completedAt,
      completed_by: adminEmail ? `admin:${adminEmail}` : 'admin',
    };

    // Add metadata for out-of-order completions
    if (isOutOfOrder) {
      updateObj.metadata = {
        out_of_order: true,
        admin_email: adminEmail,
        admin_note: note || null,
        completed_at: completedAt,
      };
    }

    // Add submission_data for team-completed milestones (captures who reviewed)
    updateObj.submission_data = {
      type: 'team_review',
      reviewed_by: adminName,
      review_notes: note || null,
      reviewed_at: completedAt,
      admin_email: adminEmail,
    };

    const { data: updateData, error: updateError } = await supabase
      .from('creator_milestones')
      .update(updateObj)
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId)
      .select();

    console.log('[approve-milestone] Update result:', { updateData, updateError });

    if (updateError) {
      console.error('[approve-milestone] Update error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Doing the work the flag asked for should retire the flag.
    await clearFlagForCompletedMilestone(supabase, creatorId, milestoneId);

    if (!updateData || updateData.length === 0) {
      console.error('[approve-milestone] No rows updated - creator_milestone record may not exist');
      return NextResponse.json({
        success: false,
        error: 'No matching creator_milestone record found'
      }, { status: 404 });
    }

    // 3b. Handle paired milestones that should auto-complete together
    //
    // Both targets are collapsed steps, so the engine never opens one and never
    // needs them completed by hand. This exists only for the pre-engine path.
    const pairedMilestoneId = PAIRED_MILESTONES[milestoneId];
    if (pairedMilestoneId) {
      const { error: pairedError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: completedAt,
          completed_by: 'system:auto-paired',
          submission_data: {
            type: 'auto_completed',
            paired_with: milestoneId,
            completed_at: completedAt
          },
          updated_at: completedAt
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', pairedMilestoneId);

      if (pairedError) {
        console.error('[approve-milestone] Error auto-completing paired milestone:', pairedError);
      } else {
        console.log('[approve-milestone] Auto-completed paired milestone:', pairedMilestoneId);
      }
    }

    } // end of the pre-engine completion path

    // 4. Handle unlock logic
    let nextMilestoneName: string | null = engineNextStep;

    if (useEngine) {
      // The engine already completed the step and opened exactly one next step,
      // scoped to the project. Nothing else here should touch status.
    } else if (isOutOfOrder) {
      // Out-of-order completion: Don't auto-unlock next milestone
      // Instead, recalculate which milestones can now be unlocked
      console.log('[approve-milestone] Out-of-order completion - recalculating unlocks');

      // Get all milestones in order (join phases to sort by actual phase order, not alphabetical phase_id)
      const { data: allMilestones } = await supabase
        .from('milestones')
        .select('id, phase_id, sort_order, name, phases!inner(sort_order)')
        .lt('sort_order', 98)
        .order('phases(sort_order)', { ascending: true })
        .order('sort_order', { ascending: true });

      // Get all creator_milestones
      const { data: creatorMilestones } = await supabase
        .from('creator_milestones')
        .select('milestone_id, status')
        .eq('creator_id', creatorId);

      if (allMilestones && creatorMilestones) {
        const statusMap = new Map(creatorMilestones.map(cm => [cm.milestone_id, cm.status]));

        // For each locked milestone, check if it can now be unlocked
        for (let i = 0; i < allMilestones.length; i++) {
          const ms = allMilestones[i];
          const currentStatus = statusMap.get(ms.id);

          if (currentStatus === 'locked') {
            // Check if all previous milestones are completed
            let canUnlock = true;
            for (let j = 0; j < i; j++) {
              const prevStatus = statusMap.get(allMilestones[j].id);
              if (prevStatus !== 'completed') {
                canUnlock = false;
                break;
              }
            }

            if (canUnlock) {
              console.log('[approve-milestone] Unlocking milestone:', ms.id);
              // Clear completion data when unlocking to ensure clean state
              const { error: oooUnlockError } = await supabase
                .from('creator_milestones')
                .update({
                  status: 'available',
                  completed_at: null,
                  completed_by: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('creator_id', creatorId)
                .eq('milestone_id', ms.id);

              if (oooUnlockError) {
                console.error('[approve-milestone] Error in OOO unlock for:', ms.id, oooUnlockError);
              }

              if (!nextMilestoneName) {
                nextMilestoneName = ms.name || 'Next step';
              }
            }
          }
        }
      }
    } else if (milestone) {
      // Normal sequential completion: unlock next milestone in sequence
      // Determine search starting point - if paired milestone, search from the higher sort_order
      let searchFromSortOrder = milestone.sort_order;
      const pairedForSearch = PAIRED_MILESTONES[milestoneId];
      if (pairedForSearch) {
        const { data: pairedMs } = await supabase
          .from('milestones')
          .select('sort_order')
          .eq('id', pairedForSearch)
          .single();
        if (pairedMs) {
          searchFromSortOrder = Math.max(searchFromSortOrder, pairedMs.sort_order);
        }
      }

      // First try to find next milestone in current phase, skipping deactivated ones
      let { data: nextMilestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('phase_id', milestone.phase_id)
        .gt('sort_order', searchFromSortOrder)
        .lt('sort_order', 98)  // Skip deactivated milestones (sort_order 98-99)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      // If no next milestone in current phase, find first milestone in next applicable phase
      if (!nextMilestone) {
        // Get creator's content path to filter applicable milestones
        const contentPath = creator?.content_path;

        // Get all phases ordered
        const { data: phases } = await supabase
          .from('phases')
          .select('id, sort_order')
          .order('sort_order', { ascending: true });

        // Get current phase sort order
        const currentPhase = phases?.find(p => p.id === milestone.phase_id);
        const currentPhaseOrder = currentPhase?.sort_order ?? 0;

        // Find milestones in subsequent phases, skipping deactivated ones
        const { data: futureMilestones } = await supabase
          .from('milestones')
          .select('*, phases!inner(sort_order)')
          .gt('phases.sort_order', currentPhaseOrder)
          .lt('sort_order', 98)  // Skip deactivated milestones
          .order('phases(sort_order)', { ascending: true })
          .order('sort_order', { ascending: true });

        // Find first applicable milestone in future phases
        if (futureMilestones && futureMilestones.length > 0) {
          for (const fm of futureMilestones) {
            // Check if milestone applies to this creator's content path
            const appliesTo = fm.applies_to as string[] | null;
            const isApplicable = !contentPath || // No path selected = show all
              !appliesTo || appliesTo.length === 0 || // No restriction = course only (legacy)
              appliesTo.includes(contentPath);

            if (isApplicable) {
              nextMilestone = fm;
              break;
            }
          }
        }
      }

      // Auto-complete any deactivated milestones between current and next
      if (nextMilestone && milestone.phase_id === nextMilestone.phase_id) {
        const { data: deactivatedMilestones } = await supabase
          .from('milestones')
          .select('id')
          .eq('phase_id', milestone.phase_id)
          .gt('sort_order', searchFromSortOrder)
          .lt('sort_order', nextMilestone.sort_order)
          .gte('sort_order', 98);  // Get deactivated milestones in between

        if (deactivatedMilestones && deactivatedMilestones.length > 0) {
          for (const dm of deactivatedMilestones) {
            const { error: skipError } = await supabase
              .from('creator_milestones')
              .update({
                status: 'completed',
                completed_at: completedAt,
                completed_by: 'system:auto-skipped',
                submission_data: {
                  type: 'auto_completed',
                  reason: 'milestone_deactivated',
                  completed_at: completedAt
                },
                updated_at: completedAt
              })
              .eq('creator_id', creatorId)
              .eq('milestone_id', dm.id);

            if (skipError) {
              // A retired step left open is a step the creator sees and cannot
              // action, so this is worth surfacing rather than swallowing.
              console.error('[approve-milestone] Could not auto-complete retired step', dm.id, skipError.message);
            } else {
              console.log('[approve-milestone] Auto-completed deactivated milestone:', dm.id);
            }
          }
        }
      }

      if (nextMilestone) {
        // Clear completion data when unlocking to ensure clean state
        const { error: unlockError } = await supabase
          .from('creator_milestones')
          .update({
            status: 'available',
            completed_at: null,
            completed_by: null,
            updated_at: new Date().toISOString(),
          })
          .eq('creator_id', creatorId)
          .eq('milestone_id', nextMilestone.id)
          .eq('status', 'locked');

        if (unlockError) {
          console.error('[approve-milestone] Error unlocking next milestone:', nextMilestone.id, unlockError);
        } else {
          console.log('[approve-milestone] Unlocked next milestone:', nextMilestone.id);
        }

        // Use title or name, whichever exists
        nextMilestoneName = nextMilestone.title || nextMilestone.name || 'Next step';
      } else {
        console.warn('[approve-milestone] No next milestone found after:', milestoneId, 'in phase:', milestone?.phase_id);
      }
    }

    // 5. Auto-enable website visibility if creator reaches Launch phase
    if (milestone?.phase_id) {
      // Check if this is a launch phase milestone
      const { data: phase } = await supabase
        .from('phases')
        .select('name')
        .eq('id', milestone.phase_id)
        .single();

      if (phase?.name?.toLowerCase() === 'launch') {
        // Check if all launch phase milestones are completed
        const { data: launchMilestones } = await supabase
          .from('milestones')
          .select('id')
          .eq('phase_id', milestone.phase_id);

        const { data: completedLaunchMilestones } = await supabase
          .from('creator_milestones')
          .select('milestone_id')
          .eq('creator_id', creatorId)
          .eq('status', 'completed')
          .in('milestone_id', (launchMilestones || []).map(m => m.id));

        // If all launch milestones are completed, auto-enable website visibility
        if (launchMilestones && completedLaunchMilestones &&
            completedLaunchMilestones.length >= launchMilestones.length) {
          const { error: visibilityError } = await supabase
            .from('creators')
            .update({
              display_on_website: true,
              website_display_name: creator?.name || null,
              website_title: 'Content Creator',
            })
            .eq('id', creatorId);

          if (!visibilityError) {
            console.log('[approve-milestone] Auto-enabled website visibility for creator:', creator?.name);

            // Add note about auto-enabling
            const { error: visibilityNoteError } = await supabase
              .from('creator_notes')
              .insert({
                creator_id: creatorId,
                content: '[Auto] Creator reached Launch phase - now visible on website!',
                author: 'System',
                visible_to_creator: true,
                phase_id: milestone.phase_id,
              });

            if (visibilityNoteError) {
              console.error('[approve-milestone] Website visibility note failed:', visibilityNoteError.message);
            }
          }
        }
      }
    }

    // 6. Create auto-note for audit trail
    const milestoneName = milestone?.name || 'Milestone';
    const autoNoteContent = isOutOfOrder
      ? `[Auto] Milestone approved out of sequence: "${milestoneName}"${note ? ` - Note: ${note}` : ''}`
      : `[Auto] Milestone approved: "${milestoneName}"`;

    const { error: auditNoteError } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: autoNoteContent,
        author: 'System',
        visible_to_creator: false,
        phase_id: milestone?.phase_id || null,
      });

    if (auditNoteError) {
      // The approval itself already happened, so this does not fail the request.
      // But an audit trail with holes in it is worse than none, so it is logged
      // loudly rather than dropped.
      console.error('[approve-milestone] Audit note failed to write:', auditNoteError.message);
    } else {
      console.log('[approve-milestone] Auto-note created');
    }

    // 6. Send email to creator
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && creator) {
      const nextStepText = nextMilestoneName
        ? `Your next step is ready: <strong>${nextMilestoneName}</strong>`
        : `You've completed this phase! Check your portal for what's next.`;

      const emailSubject = isOutOfOrder
        ? `Creator Studio | Milestone completed: ${milestone?.name || 'Your milestone'}`
        : `Creator Studio | You're approved, next step unlocked`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
          to: [creator.email],
          subject: emailSubject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e2749;">Great news, ${creator.name}!</h2>

              <p>The TDI team has updated your progress:</p>

              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
                <strong style="color: #166534;">Completed:</strong> ${milestone?.name || 'Your milestone'}
              </div>

              <p>${nextStepText}</p>

              <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                 style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                Continue in Creator Studio
              </a>

              <p style="color: #666; margin-top: 30px; font-size: 14px;">
                Questions? Reply to this email or reach out to the TDI team at creatorstudio@teachersdeserveit.com
              </p>

              <p style="color: #666; font-size: 14px;"> - The TDI Team</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true, nextMilestone: nextMilestoneName });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
