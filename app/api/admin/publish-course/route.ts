import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint for admins to mark a creator's course as published.
 * This completes all remaining core milestones, optionally marks blog
 * milestones as optional, and updates the creator's details.
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

    const {
      creatorId,
      courseUrl,
      discountCode,
      courseDescription,
      authorBio,
      markBlogAsOptional,
      note,
      adminEmail,
    } = await request.json();

    console.log('[publish-course] Request:', { creatorId, courseUrl, discountCode, markBlogAsOptional, adminEmail });

    // Validate required fields
    if (!creatorId || !courseUrl || !discountCode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields (creatorId, courseUrl, discountCode)'
      }, { status: 400 });
    }

    // 1. Get creator info
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, email, content_path')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('[publish-course] Creator not found:', creatorError);
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // Verify this is a course creator
    if (creator.content_path !== 'course') {
      return NextResponse.json({
        success: false,
        error: 'This action is only available for course creators'
      }, { status: 400 });
    }

    const completedAt = new Date().toISOString();
    const adminName = adminEmail?.split('@')[0] || 'admin';

    // Milestone IDs that should be marked as optional (not completed)
    // Blog milestones + create_again (post-launch options)
    const optionalMilestoneIds = [
      'blog_pitch',
      'blog_topic_approved',
      'blog_drafted',
      'blog_published',
      'create_again',
    ];

    // 2. Get all milestones that apply to courses
    const { data: allMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id, phase_id, applies_to')
      .order('sort_order');

    if (milestonesError) {
      console.error('[publish-course] Error fetching milestones:', milestonesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch milestones' }, { status: 500 });
    }

    // Filter to course-applicable milestones
    const courseMilestones = allMilestones.filter(m => {
      const appliesTo = m.applies_to as string[] | null;
      // Milestones with no applies_to are for courses (legacy)
      // Or milestones that explicitly include 'course'
      return !appliesTo || appliesTo.length === 0 || appliesTo.includes('course');
    });

    // Separate core milestones from optional ones (blog + create_again)
    const coreMilestoneIds = courseMilestones
      .filter(m => !optionalMilestoneIds.includes(m.id))
      .map(m => m.id);

    // 3. Get creator's current milestone statuses
    const { data: creatorMilestones, error: cmError } = await supabase
      .from('creator_milestones')
      .select('id, milestone_id, status, metadata')
      .eq('creator_id', creatorId);

    if (cmError) {
      console.error('[publish-course] Error fetching creator milestones:', cmError);
      return NextResponse.json({ success: false, error: 'Failed to fetch creator milestones' }, { status: 500 });
    }

    const milestoneStatusMap = new Map(creatorMilestones.map(cm => [cm.milestone_id, cm]));

    // 4. Complete all remaining core milestones (non-blog)
    let completedCount = 0;
    for (const milestoneId of coreMilestoneIds) {
      const existing = milestoneStatusMap.get(milestoneId);
      if (existing && existing.status !== 'completed') {
        const { error: updateError } = await supabase
          .from('creator_milestones')
          .update({
            status: 'completed',
            completed_at: completedAt,
            completed_by: `admin:${adminEmail}`,
            updated_at: completedAt,
            metadata: {
              ...(existing.metadata as Record<string, unknown> || {}),
              completed_by_admin: true,
              admin_email: adminEmail,
              bulk_completed: true,
              bulk_action: 'publish_course',
            },
            submission_data: {
              type: 'team_review',
              reviewed_by: adminName,
              review_notes: 'Course published - milestone auto-completed',
              reviewed_at: completedAt,
              admin_email: adminEmail,
            },
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('[publish-course] Error completing milestone:', milestoneId, updateError);
        } else {
          completedCount++;
        }
      }
    }

    console.log('[publish-course] Completed', completedCount, 'core milestones');

    // 5. Mark optional milestones (blog + create_again) as optional if requested
    let optionalCount = 0;
    if (markBlogAsOptional) {
      for (const milestoneId of optionalMilestoneIds) {
        const existing = milestoneStatusMap.get(milestoneId);
        if (existing && existing.status !== 'completed') {
          const existingMetadata = (existing.metadata as Record<string, unknown>) || {};
          const optionalReason = milestoneId === 'create_again'
            ? 'Post-launch option — does not affect completion status'
            : 'Course published — blog available as optional marketing support';

          const { error: optionalError } = await supabase
            .from('creator_milestones')
            .update({
              metadata: {
                ...existingMetadata,
                is_optional: true,
                optional_reason: optionalReason,
                optional_set_by: adminEmail,
                optional_set_at: completedAt,
              },
              updated_at: completedAt,
            })
            .eq('id', existing.id);

          if (optionalError) {
            console.error('[publish-course] Error marking optional:', milestoneId, optionalError);
          } else {
            optionalCount++;
          }
        }
      }
      console.log('[publish-course] Marked', optionalCount, 'milestones as optional (blog + create_again)');
    }

    // 6. Update creator details
    const creatorUpdateData: Record<string, unknown> = {
      course_url: courseUrl,
      discount_code: discountCode,
      current_phase: 'launch',
      updated_at: completedAt,
    };

    if (courseDescription) {
      creatorUpdateData.course_description = courseDescription;
    }
    if (authorBio) {
      creatorUpdateData.author_bio = authorBio;
    }

    const { error: creatorUpdateError } = await supabase
      .from('creators')
      .update(creatorUpdateData)
      .eq('id', creatorId);

    if (creatorUpdateError) {
      console.error('[publish-course] Error updating creator:', creatorUpdateError);
      return NextResponse.json({ success: false, error: 'Failed to update creator details' }, { status: 500 });
    }

    // 7. Add creator note for audit trail
    const noteLines = [
      `Course marked as published by ${adminName}`,
      `Course URL: ${courseUrl}`,
      `Discount Code: ${discountCode}`,
    ];
    if (courseDescription) {
      noteLines.push(`Course Description: ${courseDescription.substring(0, 100)}${courseDescription.length > 100 ? '...' : ''}`);
    }
    if (authorBio) {
      noteLines.push(`Author Bio: ${authorBio.substring(0, 100)}${authorBio.length > 100 ? '...' : ''}`);
    }
    noteLines.push(`Milestones completed: ${completedCount}`);
    if (markBlogAsOptional) {
      noteLines.push(`Optional milestones (blog + create_again): ${optionalCount}`);
    }
    if (note) {
      noteLines.push(`Note: ${note}`);
    }

    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: noteLines.join('\n'),
        author: adminEmail || 'admin',
        visible_to_creator: false,
      });

    // 8. Also add a visible note for the creator
    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `Congratulations! Your course is now live! 🎉\n\nCourse URL: ${courseUrl}\nDiscount Code: ${discountCode}`,
        author: 'TDI Team',
        visible_to_creator: true,
      });

    // 9. Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        creator_id: creatorId,
        type: 'course_published',
        message: `${creator.name}'s course has been marked as published`,
        link: `/admin/creators/${creatorId}`,
      });

    console.log('[publish-course] Successfully published course for', creator.name);

    return NextResponse.json({
      success: true,
      completedMilestones: completedCount,
      optionalMilestones: optionalCount,
      creatorName: creator.name,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[publish-course] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
