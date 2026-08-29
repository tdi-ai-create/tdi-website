import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/creator-portal/acknowledge-agreement
 *
 * Interim endpoint for TEA-4629 mitigation.
 * Replaces signature capture with a simple acknowledgment flow that
 * does NOT require supabase.auth.getSession() (which is broken for
 * creators after the Learning Hub Supabase switch).
 *
 * TODO: Remove this endpoint once proper signature capture is restored
 * after the lib/supabase-hub.ts architectural fix ships.
 */
export async function POST(request: NextRequest) {
  try {
    const { creatorId } = await request.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date().toISOString();
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    console.log('[acknowledge-agreement] Acknowledging for creator:', creatorId);

    // Verify the creator exists
    const { data: creator, error: fetchError } = await supabase
      .from('creators')
      .select('id, name, email, agreement_signed')
      .eq('id', creatorId)
      .single();

    if (fetchError || !creator) {
      console.error('[acknowledge-agreement] Creator not found:', fetchError);
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    console.log('[acknowledge-agreement] Found creator:', creator.name);

    // Update creators table: agreement_signed + agreement_signed_at
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        agreement_signed: true,
        agreement_signed_at: now,
        agreement_version: 'v2.3',
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[acknowledge-agreement] Creator update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update creator record: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Find the agreement milestone
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name')
      .eq('phase_id', 'agreement');

    if (milestones && milestones.length > 0) {
      const milestoneId = milestones[0].id;
      console.log('[acknowledge-agreement] Using milestone ID:', milestoneId);

      // Mark milestone complete with [Auto] note per CCP spec
      const { error: milestoneError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: now,
          completed_by: 'system:interim-acknowledge',
          notes: `[Auto] Acknowledged via interim flow on ${nowFormatted}. Signature capture deferred — see TEA-4629 follow-up.`,
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', milestoneId);

      if (milestoneError) {
        console.error('[acknowledge-agreement] Milestone update error:', milestoneError);
        // Non-fatal — creator record already updated
      }

      // Unlock the next milestone (same pattern as sign-agreement)
      const { data: allMilestones } = await supabase
        .from('milestones')
        .select('id, phase_id, sort_order')
        .order('phase_id')
        .order('sort_order');

      if (allMilestones) {
        const currentIndex = allMilestones.findIndex((m) => m.id === milestoneId);
        if (currentIndex !== -1 && currentIndex < allMilestones.length - 1) {
          const nextMilestone = allMilestones[currentIndex + 1];
          console.log('[acknowledge-agreement] Unlocking next milestone:', nextMilestone.id);

          await supabase
            .from('creator_milestones')
            .update({ status: 'available' })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
        }
      }
    } else {
      console.warn('[acknowledge-agreement] No agreement milestones found');
    }

    // Send confirmation email to creator via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && creator.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: [creator.email],
            subject: "You're all set — agreement acknowledged!",
            html: `
              <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e2749;">Thanks for acknowledging, ${creator.name}!</h2>

                <p style="color: #374151; line-height: 1.7;">
                  You've acknowledged the Creator Partnership Agreement (v2.3) and you're cleared to move on to your next step.
                </p>

                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
                  <strong style="color: #166534;">Acknowledged on:</strong> ${nowFormatted}
                </div>

                <p style="color: #374151; line-height: 1.7;">
                  Head back to your portal to continue — your next milestone is unlocked and waiting.
                </p>

                <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                   style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                  Go to My Dashboard
                </a>

                <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">
                  Questions? Reply to this email or reach us at
                  <a href="mailto:CreatorStudio@teachersdeserveit.com" style="color: #2563EB;">CreatorStudio@teachersdeserveit.com</a>.
                </p>
              </div>
            `,
          }),
        });
        console.log('[acknowledge-agreement] Confirmation email sent to creator');
      } catch (emailError) {
        console.error('[acknowledge-agreement] Creator email error (non-fatal):', emailError);
      }
    }

    // Send team notification email
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: ['creatorstudio@teachersdeserveit.com'],
            subject: `${creator.name} acknowledged their agreement (interim flow)`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #1e2749;">Agreement Acknowledged (Interim)</h2>

                <p><strong>${creator.name}</strong> acknowledged their Creator Partnership Agreement via the interim flow (TEA-4629 mitigation).</p>

                <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
                  <strong style="color: #92400E;">Note:</strong> This was an acknowledgment, not a full signature. Proper signature capture will be restored after the supabase-hub.ts architectural fix.
                </div>

                <p><strong>Date:</strong> ${nowFormatted}</p>

                <a href="https://www.teachersdeserveit.com/tdi-admin/creators"
                   style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                  View Creators
                </a>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error('[acknowledge-agreement] Team email error (non-fatal):', emailError);
      }
    }

    // Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        creator_id: creatorId,
        type: 'agreement_signed',
        message: `${creator.name} acknowledged their agreement (interim flow — TEA-4629)`,
        link: `/tdi-admin/creators/${creatorId}`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[acknowledge-agreement] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
