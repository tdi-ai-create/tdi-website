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

    const { milestoneId, creatorId, adminEmail } = await request.json();

    // 1. Get creator info
    const { data: creator } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    // 2. Get milestone info
    const { data: milestone } = await supabase
      .from('milestones')
      .select('name, creator_description, sort_order, phase_id')
      .eq('id', milestoneId)
      .single();

    // 3. Mark milestone as completed
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: adminEmail
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 4. Find and unlock the next milestone
    let nextMilestoneName = null;

    if (milestone) {
      const { data: nextMilestone } = await supabase
        .from('milestones')
        .select('id, name, creator_description')
        .eq('phase_id', milestone.phase_id)
        .gt('sort_order', milestone.sort_order)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextMilestone) {
        await supabase
          .from('creator_milestones')
          .update({ status: 'available' })
          .eq('creator_id', creatorId)
          .eq('milestone_id', nextMilestone.id)
          .eq('status', 'locked');

        nextMilestoneName = nextMilestone.creator_description || nextMilestone.name;
      }
    }

    // 5. Send email to creator
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && creator) {
      const nextStepText = nextMilestoneName
        ? `Your next step is ready: <strong>${nextMilestoneName}</strong>`
        : `You've completed this phase! Check your portal for what's next.`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TDI Creator Studio <onboarding@resend.dev>',
          to: [creator.email],
          subject: `✅ You're approved! Next step unlocked`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e2749;">Great news, ${creator.name}! 🎉</h2>

              <p>The TDI team has reviewed and approved your progress:</p>

              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
                <strong style="color: #166534;">✓ Completed:</strong> ${milestone?.creator_description || milestone?.name}
              </div>

              <p>${nextStepText}</p>

              <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                 style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                Continue in Creator Studio →
              </a>

              <p style="color: #666; margin-top: 30px; font-size: 14px;">
                Questions? Reply to this email or reach out to Rachel at rachel@teachersdeserveit.com
              </p>

              <p style="color: #666; font-size: 14px;">– The TDI Team</p>
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
