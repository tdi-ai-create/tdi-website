import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const { creatorId, action, scheduledDate, publishNotes } = body;

    if (!creatorId || !action) {
      return NextResponse.json(
        { error: 'creatorId and action are required' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'publish_now':
        updateData = {
          publish_status: 'published',
          published_date: new Date().toISOString().split('T')[0],
          scheduled_publish_date: null,
          display_on_website: true,
        };
        break;

      case 'schedule':
        if (!scheduledDate) {
          return NextResponse.json(
            { error: 'scheduledDate is required for scheduling' },
            { status: 400 }
          );
        }
        updateData = {
          publish_status: 'scheduled',
          scheduled_publish_date: scheduledDate,
          publish_notes: publishNotes || null,
          display_on_website: true,
        };
        break;

      case 'reschedule':
        if (!scheduledDate) {
          return NextResponse.json(
            { error: 'scheduledDate is required for rescheduling' },
            { status: 400 }
          );
        }
        updateData = {
          scheduled_publish_date: scheduledDate,
          publish_notes: publishNotes || null,
        };
        break;

      case 'unpublish':
        updateData = {
          publish_status: 'scheduled',
          published_date: null,
          display_on_website: false,
        };
        break;

      case 'mark_published':
        // For marking past-due scheduled content as published
        updateData = {
          publish_status: 'published',
          published_date: new Date().toISOString().split('T')[0],
          scheduled_publish_date: null,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating publish status:', error);
      return NextResponse.json(
        { error: 'Failed to update publish status' },
        { status: 500 }
      );
    }

    // Add a note to creator_notes for audit trail
    const noteContent = getActionNote(action, scheduledDate, publishNotes);
    if (noteContent) {
      await supabase.from('creator_notes').insert({
        creator_id: creatorId,
        content: noteContent,
        author: 'System',
        note_type: 'status_change',
      });
    }

    // Send celebration email when content is published
    if ((action === 'publish_now' || action === 'mark_published') && data) {
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey && data.email) {
          const firstName = data.name?.split(' ')[0] || 'there';
          const contentType = data.content_path === 'course' ? 'course' :
                              data.content_path === 'blog' ? 'blog post' :
                              data.content_path === 'download' ? 'quick tool' : 'content';
          const nominateLink = 'https://www.teachersdeserveit.com/create-with-us';

          const celebrationHtml = `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
              <div style="text-align: center; padding: 24px 0;">
                <p style="font-size: 40px; margin: 0;">&#127881;</p>
                <h1 style="font-size: 24px; font-weight: 700; color: #1e2749; margin: 8px 0 4px;">You did it, ${firstName}!</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Your ${contentType} is officially live.</p>
              </div>

              <p>This is a big deal. You took your expertise, put in the work, and now educators everywhere can learn from you. That takes courage and commitment — and you showed up for it.</p>

              ${data.course_title ? `<p>Your ${contentType}, <strong>"${data.course_title}"</strong>, is now part of the TDI library.</p>` : ''}

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Share the news!</p>
                <p style="margin: 0; color: #15803d; font-size: 14px;">
                  Here's something you can share with your network:
                </p>
                <div style="background: white; border: 1px solid #dcfce7; border-radius: 8px; padding: 12px; margin-top: 10px;">
                  <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic;">
                    "I just launched my ${contentType} with @TeachersDeserveIt! Excited to share what I've learned with educators everywhere. Check it out at teachersdeserveit.com"
                  </p>
                </div>
              </div>

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #1e40af;">Know another educator who should create with us?</p>
                <p style="margin: 0 0 12px; color: #1e3a5f; font-size: 14px;">
                  You know firsthand what this process is like. If there's a colleague who has expertise worth sharing, we'd love to hear from them.
                </p>
                <a href="${nominateLink}" style="display: inline-block; background-color: #1e2749; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px;">
                  Share the Creator Application
                </a>
              </div>

              <p>Thank you for trusting us with your work. We're proud to have you in the TDI family.</p>
              <p>Celebrating you,<br/>Bella & the TDI Team</p>

              <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
                Bella Duran | Creator Success<br/>
                Teachers Deserve It
              </p>
            </div>
          `;

          const celebrationSubject = `You're officially published, ${firstName}!`;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
              to: [data.email],
              cc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
              subject: celebrationSubject,
              html: celebrationHtml,
              reply_to: 'bella@teachersdeserveit.com',
            }),
          });

          await logCreatorEmail({
            creator_id: creatorId,
            creator_name: data.name,
            creator_email: data.email,
            direction: 'to_creator',
            category: 'publish_celebration',
            subject: celebrationSubject,
            sent_by: 'system:publish',
          });
        }
      } catch (celebrationError) {
        // Non-blocking — don't fail the publish over a celebration email
        console.error('[publish-celebration] Error sending celebration:', celebrationError);
      }
    }

    return NextResponse.json({ success: true, creator: data });
  } catch (error) {
    console.error('Error in update-publish-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getActionNote(action: string, scheduledDate?: string, publishNotes?: string): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  switch (action) {
    case 'publish_now':
      return `Published on ${today}`;
    case 'schedule':
      const schedDate = new Date(scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Scheduled to publish on ${schedDate}${publishNotes ? `. Note: ${publishNotes}` : ''}`;
    case 'reschedule':
      const newDate = new Date(scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Rescheduled publish date to ${newDate}${publishNotes ? `. Note: ${publishNotes}` : ''}`;
    case 'unpublish':
      return `Unpublished on ${today}`;
    case 'mark_published':
      return `Marked as published on ${today} (was past scheduled date)`;
    default:
      return '';
  }
}
