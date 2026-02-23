import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, note, createdBy, visibleToCreator } = await request.json();

    if (!creatorId || !note || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[add-note] Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get creator info for email
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('[add-note] Creator not found:', creatorError);
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Insert the note
    const { data: newNote, error } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: note.trim(),
        author: createdBy,
        visible_to_creator: visibleToCreator ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('[add-note] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Send email notification if note is visible to creator
    if (visibleToCreator !== false) {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey && creator.email) {
        // Get creator's first name
        const firstName = creator.name.split(' ')[0];

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
              cc: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
              subject: 'You have a new note from the TDI team!',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1e2749;">Hi ${firstName}! 👋</h2>

                  <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    The TDI team has added a new note to your Creator Studio profile.
                    Log in to review it and keep moving forward on your journey!
                  </p>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                       style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                      View My Creator Studio →
                    </a>
                  </div>

                  <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Questions? Simply reply to this email and we'll get back to you.
                  </p>

                  <p style="color: #666; font-size: 14px; margin-top: 24px;">
                    — The TDI Team
                  </p>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            console.log('[add-note] Email notification sent to', creator.email);
          } else {
            const emailError = await emailResponse.json();
            console.error('[add-note] Email send failed:', emailError);
          }
        } catch (emailErr) {
          console.error('[add-note] Email error:', emailErr);
        }

        // Log to admin_notifications for audit trail
        await supabase
          .from('admin_notifications')
          .insert({
            creator_id: creatorId,
            type: 'note_added',
            message: `Note added by ${createdBy} (creator notified via email)`,
            link: `/admin/creators/${creatorId}`,
          });
      }
    }

    return NextResponse.json({ success: true, note: newNote });
  } catch (error) {
    console.error('[add-note] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
