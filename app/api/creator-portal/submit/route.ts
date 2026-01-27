import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { creatorId, milestoneId, submissionType, content, notifyTeam } = await request.json();

    console.log('[submit] Submission received:', { creatorId, milestoneId, submissionType });

    if (!creatorId || !milestoneId || !submissionType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // 1. Try to save the submission (table may not exist yet)
    const { error: submitError } = await supabase
      .from('creator_submissions')
      .insert({
        creator_id: creatorId,
        milestone_id: milestoneId,
        submission_type: submissionType,
        content
      });

    if (submitError) {
      // If table doesn't exist, log but continue (backwards compatibility)
      console.log('[submit] Note: creator_submissions insert:', submitError.message);
    }

    // 2. Update milestone status
    // For confirmations, mark as complete. For submissions needing review, mark as waiting_approval
    const newStatus = submissionType === 'confirmation' ? 'completed' : 'waiting_approval';

    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[submit] Error updating milestone:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 3. If this is a confirmation (not needing review), unlock next milestone
    if (submissionType === 'confirmation') {
      // Get current milestone info
      const { data: milestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      if (milestone) {
        // Find next milestone in same phase
        const { data: nextMilestone } = await supabase
          .from('milestones')
          .select('id')
          .eq('phase_id', milestone.phase_id)
          .gt('sort_order', milestone.sort_order)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextMilestone) {
          await supabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
        }
      }
    }

    // 4. Send email notification to team if needed
    if (notifyTeam) {
      const { data: creator } = await supabase
        .from('creators')
        .select('name, email')
        .eq('id', creatorId)
        .single();

      const { data: milestoneInfo } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = milestoneInfo as any;
      const milestoneName = m?.title || m?.name || m?.admin_description || milestoneId;

      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && creator) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'TDI Creator Studio <onboarding@resend.dev>',
              to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
              subject: `New Submission from ${creator.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px;">
                  <h2 style="color: #1e2749;">New Submission Ready for Review</h2>

                  <p><strong>Creator:</strong> ${creator.name} (${creator.email})</p>
                  <p><strong>Milestone:</strong> ${milestoneName}</p>

                  ${content.link ? `<p><strong>Submitted Link:</strong> <a href="${content.link}">${content.link}</a></p>` : ''}
                  ${content.notes ? `<p><strong>Creator Notes:</strong> ${content.notes}</p>` : ''}

                  <a href="https://www.teachersdeserveit.com/admin/creators/${creatorId}"
                     style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                    Review in Admin Portal
                  </a>
                </div>
              `,
            }),
          });
          console.log('[submit] Email notification sent');
        } catch (emailError) {
          console.error('[submit] Email error (non-fatal):', emailError);
        }
      }

      // Also create admin notification
      await supabase
        .from('admin_notifications')
        .insert({
          creator_id: creatorId,
          type: 'submission',
          message: `${creator?.name || 'A creator'} submitted ${milestoneName}`,
          link: `/admin/creators/${creatorId}`,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[submit] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
