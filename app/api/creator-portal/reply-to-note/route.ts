import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const {
      creatorId,
      creatorName,
      parentNoteId,
      originalNoteContent,
      replyContent,
    } = await request.json();

    // Validate required fields
    if (!creatorId || !creatorName || !parentNoteId || !replyContent) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[reply-to-note] Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Save reply to creator_notes table
    const { data: savedReply, error: insertError } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: replyContent.trim(),
        author: creatorName,
        visible_to_creator: true,
        is_reply: true,
        parent_note_id: parentNoteId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[reply-to-note] Database error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save reply' },
        { status: 500 }
      );
    }

    // 2. Send email notification to TDI team
    if (resendApiKey) {
      // Strip HTML from original note for cleaner email display
      const plainOriginal = (originalNoteContent || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e2749; margin-bottom: 24px;">Creator Reply: ${creatorName}</h2>

          <div style="background: #f9fafb; border-left: 4px solid #80a4ed; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Original Note</p>
            <p style="margin: 0; color: #374151; white-space: pre-wrap; line-height: 1.6;">${plainOriginal}</p>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">${creatorName}'s Reply</p>
            <p style="margin: 0; color: #374151; white-space: pre-wrap; line-height: 1.6;">${replyContent}</p>
          </div>

          <p style="margin-top: 32px;">
            <a href="https://www.teachersdeserveit.com/admin/creators/${creatorId}"
               style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Creator Profile →
            </a>
          </p>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            This notification was sent from the TDI Creator Portal.
          </p>
        </div>
      `;

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: ['rae@teachersdeserveit.com', 'creatorstudio@teachersdeserveit.com'],
            subject: `Creator Reply: ${creatorName}`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          console.log(
            '[reply-to-note] Email notification sent for creator:',
            creatorName
          );
        } else {
          const emailError = await emailResponse.json();
          console.error('[reply-to-note] Email send failed:', emailError);
          // Don't fail the request if email fails - reply is already saved
        }
      } catch (emailErr) {
        console.error('[reply-to-note] Email error:', emailErr);
        // Don't fail the request if email fails - reply is already saved
      }

      // 3. Log to admin_notifications for audit trail
      try {
        await supabase.from('admin_notifications').insert({
          creator_id: creatorId,
          type: 'creator_reply',
          message: `${creatorName} replied to a team note`,
          link: `/admin/creators/${creatorId}`,
        });
      } catch (notifErr) {
        console.error('[reply-to-note] Notification log error:', notifErr);
        // Don't fail - this is just for audit trail
      }
    } else {
      console.warn('[reply-to-note] RESEND_API_KEY not configured - email not sent');
    }

    return NextResponse.json({ success: true, reply: savedReply });
  } catch (error) {
    console.error('[reply-to-note] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
