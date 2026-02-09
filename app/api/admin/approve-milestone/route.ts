import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { milestoneId, creatorId, adminEmail, outOfOrder, note } = body;

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
      .select('name, email, content_path')
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

    // 3. Mark milestone as completed (only update columns that exist)
    // Build update object with optional metadata for out-of-order completions
    const completedAt = new Date().toISOString();
    const adminName = adminEmail?.split('@')[0] || 'admin';

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

    if (!updateData || updateData.length === 0) {
      console.error('[approve-milestone] No rows updated - creator_milestone record may not exist');
      return NextResponse.json({
        success: false,
        error: 'No matching creator_milestone record found'
      }, { status: 404 });
    }

    // 4. Handle unlock logic
    let nextMilestoneName = null;

    if (isOutOfOrder) {
      // Out-of-order completion: Don't auto-unlock next milestone
      // Instead, recalculate which milestones can now be unlocked
      console.log('[approve-milestone] Out-of-order completion - recalculating unlocks');

      // Get all milestones in order
      const { data: allMilestones } = await supabase
        .from('milestones')
        .select('id, phase_id, sort_order, name')
        .order('phase_id')
        .order('sort_order');

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
              await supabase
                .from('creator_milestones')
                .update({ status: 'available' })
                .eq('creator_id', creatorId)
                .eq('milestone_id', ms.id);

              if (!nextMilestoneName) {
                nextMilestoneName = ms.name || 'Next step';
              }
            }
          }
        }
      }
    } else if (milestone) {
      // Normal sequential completion: unlock next milestone in sequence
      // First try to find next milestone in current phase
      let { data: nextMilestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('phase_id', milestone.phase_id)
        .gt('sort_order', milestone.sort_order)
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

        // Find milestones in subsequent phases
        const { data: futureMilestones } = await supabase
          .from('milestones')
          .select('*, phases!inner(sort_order)')
          .gt('phases.sort_order', currentPhaseOrder)
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

      if (nextMilestone) {
        await supabase
          .from('creator_milestones')
          .update({ status: 'available' })
          .eq('creator_id', creatorId)
          .eq('milestone_id', nextMilestone.id)
          .eq('status', 'locked');

        // Use title or name, whichever exists
        nextMilestoneName = nextMilestone.title || nextMilestone.name || 'Next step';
      }
    }

    // 5. Create auto-note for audit trail
    const milestoneName = milestone?.title || milestone?.name || 'Milestone';
    const autoNoteContent = isOutOfOrder
      ? `[Auto] Milestone approved out of sequence: "${milestoneName}"${note ? ` - Note: ${note}` : ''}`
      : `[Auto] Milestone approved: "${milestoneName}"`;

    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: autoNoteContent,
        author: 'System',
        visible_to_creator: false,
        phase_id: milestone?.phase_id || null,
      });
    console.log('[approve-milestone] Auto-note created');

    // 6. Send email to creator
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && creator) {
      const nextStepText = nextMilestoneName
        ? `Your next step is ready: <strong>${nextMilestoneName}</strong>`
        : `You've completed this phase! Check your portal for what's next.`;

      const emailSubject = isOutOfOrder
        ? `✅ Milestone completed: ${milestone?.title || milestone?.name || 'Your milestone'}`
        : `✅ You're approved! Next step unlocked`;

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
              <h2 style="color: #1e2749;">Great news, ${creator.name}! 🎉</h2>

              <p>The TDI team has updated your progress:</p>

              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
                <strong style="color: #166534;">✓ Completed:</strong> ${milestone?.title || milestone?.name || 'Your milestone'}
              </div>

              <p>${nextStepText}</p>

              <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                 style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                Continue in Creator Studio →
              </a>

              <p style="color: #666; margin-top: 30px; font-size: 14px;">
                Questions? Reply to this email or reach out to Rachel at rachel@teachersdeserveit.com
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
