import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { milestoneId, creatorId, adminEmail, note } = await request.json();

    console.log('[request-revision] Request:', { milestoneId, creatorId, adminEmail });

    if (!milestoneId || !creatorId || !note) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Get creator info
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('[request-revision] Creator not found:', creatorError);
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    // 2. Get milestone info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*, phase:phases(name)')
      .eq('id', milestoneId)
      .single();

    if (milestoneError) {
      console.error('[request-revision] Milestone not found:', milestoneError);
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    const milestoneTitle = milestone?.title || milestone?.name || 'Milestone';

    // 3. Update this milestone back to 'available' (needs revision)
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[request-revision] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 4. Get all milestones to find ones that come after this one
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, phase_id, sort_order')
      .order('phase_id')
      .order('sort_order');

    if (allMilestones && milestone) {
      // Find the index of the current milestone
      const currentIndex = allMilestones.findIndex((m) => m.id === milestoneId);

      if (currentIndex !== -1) {
        // Lock all milestones that come after this one
        const milestonesToLock = allMilestones.slice(currentIndex + 1).map((m) => m.id);

        if (milestonesToLock.length > 0) {
          await supabase
            .from('creator_milestones')
            .update({
              status: 'locked',
              updated_at: new Date().toISOString(),
            })
            .eq('creator_id', creatorId)
            .in('milestone_id', milestonesToLock);
        }
      }
    }

    // 5. Update creator's current phase if needed
    if (milestone?.phase_id) {
      await supabase
        .from('creators')
        .update({
          current_phase: milestone.phase_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creatorId);
    }

    // 6. Add a note explaining the revision request
    await supabase.from('creator_notes').insert({
      creator_id: creatorId,
      note: `📝 Revision requested for "${milestoneTitle}":\n\n${note}`,
      created_by: adminEmail || 'TDI Admin',
      visible_to_creator: true,
    });

    // 7. Send email to creator
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && creator.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <creators@teachersdeserveit.com>',
            to: [creator.email],
            subject: `Action Needed: Revision requested for your course`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 20px;" />

                <h2 style="color: #1e2749; margin-bottom: 16px;">Hi ${creator.name},</h2>

                <p style="color: #374151; line-height: 1.6;">The TDI team has reviewed your submission and is requesting a small revision for <strong>${milestoneTitle}</strong>:</p>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <strong style="color: #92400e; display: block; margin-bottom: 8px;">Feedback:</strong>
                  <p style="color: #78350f; margin: 0; white-space: pre-wrap;">${note}</p>
                </div>

                <p style="color: #374151; line-height: 1.6;">Don't worry -  this is a normal part of the process! We want to make sure your course is the best it can be.</p>

                <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                   style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 16px; font-weight: 600;">
                  Go to Creator Studio →
                </a>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="color: #6b7280; font-size: 14px;">
                  Questions? Reach out to Rachel at <a href="mailto:rachel@teachersdeserveit.com" style="color: #80a4ed;">rachel@teachersdeserveit.com</a>
                </p>

                <p style="color: #6b7280; font-size: 14px;"> -  The TDI Team</p>
              </div>
            `,
          }),
        });
        console.log('[request-revision] Email sent to creator');
      } catch (emailError) {
        console.error('[request-revision] Email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    console.log('[request-revision] Success');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[request-revision] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
