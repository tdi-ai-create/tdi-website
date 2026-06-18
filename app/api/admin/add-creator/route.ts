import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to add a new creator to the database.
 * POST with { name, email, note?, noteAuthor? }
 */
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

    const { name, email, note, noteAuthor, intakeResponses } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
    }

    console.log('[add-creator] Adding creator:', name, email);

    // 1. Create the creator record (with intake responses if provided)
    const creatorData: Record<string, unknown> = {
      email: email.toLowerCase(),
      name,
      current_phase: 'onboarding',
      display_on_website: true,
      website_display_name: name,
    };

    // Add intake responses if provided
    if (intakeResponses) {
      creatorData.intake_responses = intakeResponses;
    }

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .insert(creatorData)
      .select()
      .single();

    if (creatorError) {
      console.error('[add-creator] Error creating creator:', creatorError);
      if (creatorError.message?.includes('duplicate key') || creatorError.message?.includes('creators_email_key')) {
        return NextResponse.json({ success: false, error: `A creator with email ${email} already exists` }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: creatorError.message }, { status: 500 });
    }

    console.log('[add-creator] Creator created:', creator.id);

    // 2. Get all active milestones (excluding collapsed/retired ones)
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .is('is_collapsed_into', null)
      .order('sort_order');

    if (milestonesError || !milestones) {
      console.error('[add-creator] Error fetching milestones:', milestonesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch milestones' }, { status: 500 });
    }

    // 3. Create milestone progress records
    // When admin adds a creator, intake is already done (completed)
    // Second milestone (content path selection) should be available
    const milestoneRecords = milestones.map((milestone, index) => ({
      creator_id: creator.id,
      milestone_id: milestone.id,
      status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
      completed_at: index === 0 ? new Date().toISOString() : null,
    }));

    // Use upsert with ignoreDuplicates to handle case where database trigger
    // may have already created milestone records
    const { error: progressError } = await supabase
      .from('creator_milestones')
      .upsert(milestoneRecords, {
        onConflict: 'creator_id,milestone_id',
        ignoreDuplicates: true
      });

    if (progressError) {
      console.error('[add-creator] Error creating milestone progress:', progressError);
      return NextResponse.json({ success: false, error: progressError.message }, { status: 500 });
    }

    console.log('[add-creator] Created', milestoneRecords.length, 'milestone records');

    // 4. Add the creator note if provided
    let createdNote = null;
    if (note) {
      const { data: noteData, error: noteError } = await supabase
        .from('creator_notes')
        .insert({
          creator_id: creator.id,
          content: note,
          author: noteAuthor || 'System',
          visible_to_creator: false,
          phase_id: 'onboarding',
        })
        .select()
        .single();

      if (noteError) {
        console.error('[add-creator] Error creating note:', noteError);
        // Don't fail the whole request for a note error
      } else {
        createdNote = noteData;
        console.log('[add-creator] Note added');
      }
    }

    // 5. Send "Application Accepted" welcome email to creator
    let emailSent = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const firstName = name.split(' ')[0];
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: [email.toLowerCase()],
            cc: ['creatorstudio@teachersdeserveit.com', 'bella@teachersdeserveit.com'],
            subject: `You've Been Selected as a TDI Creator!`,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e2749;">

                <div style="text-align: center; padding: 40px 20px 30px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #1e2749 0%, #2d3a5c 100%); color: white; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                    Application Accepted
                  </div>
                </div>

                <div style="padding: 0 30px;">
                  <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px; color: #1e2749; text-align: center;">
                    Welcome to the TDI Creator Studio, ${firstName}!
                  </h1>

                  <p style="font-size: 16px; line-height: 1.7; color: #4a5568; text-align: center; margin-bottom: 30px;">
                    We reviewed your application and loved what we saw. You've been hand-selected to join our community of educators who are turning their expertise into content that makes a real difference.
                  </p>

                  <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 16px; padding: 28px; margin-bottom: 30px;">
                    <h2 style="font-size: 18px; font-weight: 700; color: #1e2749; margin: 0 0 16px;">What Being a TDI Creator Means</h2>
                    <div style="font-size: 15px; line-height: 1.8; color: #4a5568;">
                      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                        <span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">1.</span>
                        <span><strong>Your expertise, amplified.</strong> We handle the production, design, and platform so you can focus on what you know best.</span>
                      </div>
                      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                        <span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">2.</span>
                        <span><strong>You earn while you impact.</strong> TDI Creators earn 50% on every sale through your personal affiliate link.</span>
                      </div>
                      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                        <span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">3.</span>
                        <span><strong>A guided process, not a guessing game.</strong> Your Creator Studio portal walks you through every step with a dedicated team supporting you.</span>
                      </div>
                    </div>
                  </div>

                  <div style="background: #1e2749; border-radius: 16px; padding: 28px; margin-bottom: 30px; text-align: center;">
                    <h2 style="font-size: 18px; font-weight: 700; color: white; margin: 0 0 8px;">Your Next Step</h2>
                    <p style="font-size: 15px; color: rgba(255,255,255,0.8); margin: 0 0 20px;">
                      Log into your Creator Studio portal to get started. You'll choose your content path and begin building something incredible.
                    </p>
                    <a href="https://www.teachersdeserveit.com/creator-portal"
                       style="display: inline-block; background: #F5A623; color: #1e2749; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px;">
                      Open Your Creator Studio
                    </a>
                  </div>

                  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 30px;">
                    <p style="font-size: 14px; line-height: 1.7; color: #718096; text-align: center;">
                      Questions? Reach out anytime at <a href="mailto:creatorstudio@teachersdeserveit.com" style="color: #1e2749; font-weight: 600;">creatorstudio@teachersdeserveit.com</a>
                    </p>
                    <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 4px;">
                      We're genuinely excited to have you on board.
                    </p>
                    <p style="font-size: 14px; color: #1e2749; font-weight: 600; text-align: center; margin-top: 8px;">
                      - The TDI Team
                    </p>
                  </div>
                </div>
              </div>
            `,
          }),
        });
        if (!emailResponse.ok) {
          const emailErr = await emailResponse.text();
          console.error('[add-creator] Welcome email failed:', emailResponse.status, emailErr);
          emailSent = false;
        } else {
          console.log('[add-creator] Welcome email sent to:', email);
          emailSent = true;
        }
      } catch (emailError) {
        console.error('[add-creator] Welcome email error (non-fatal):', emailError);
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        current_phase: creator.current_phase,
        created_at: creator.created_at,
      },
      milestonesCreated: milestoneRecords.length,
      noteCreated: !!createdNote,
      welcomeEmailSent: emailSent,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[add-creator] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
