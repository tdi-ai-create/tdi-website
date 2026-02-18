-- ===========================================
-- MILESTONE SIMPLIFICATION MIGRATION
-- Run this in Supabase SQL Editor after frontend deployment
-- ===========================================

-- Part A: Test Prep Phase - Deactivate "Download Concept Approved" and reorder
-- =========================================================================

-- Update sort_order for test_prep phase milestones
UPDATE milestones SET sort_order = 1 WHERE id = 'test_video_recorded';
UPDATE milestones SET sort_order = 2 WHERE id = 'test_video_submitted';
UPDATE milestones SET sort_order = 3 WHERE id = 'test_video_approved';
UPDATE milestones SET sort_order = 4 WHERE id = 'download_defined';
UPDATE milestones SET sort_order = 5 WHERE id = 'download_drafted';
UPDATE milestones SET sort_order = 6 WHERE id = 'download_handoff';

-- Deactivate "Download Concept Approved" - will be skipped by progression logic
UPDATE milestones SET sort_order = 99 WHERE id = 'download_concept_approved';

-- Part B: Merge "Record Test Video" + "Submit Test Video" in UI
-- Update test_video_recorded to show as the combined step
UPDATE milestones SET
  title = 'Submit Test Video',
  description = 'Record a 1-2 minute test video to check your audio, lighting, and setup. Paste the link below when ready.',
  action_type = 'link_submit',
  action_config = '{"placeholder": "Paste your video link (Loom or Google Drive)", "button_text": "Submit Video"}'::jsonb
WHERE id = 'test_video_recorded';

-- Part C: Launch Phase - Deactivate "Blog Topic Approved" and reorder
-- =========================================================================

-- Update sort_order for launch phase milestones
UPDATE milestones SET sort_order = 1 WHERE id = 'branding_confirmed';
UPDATE milestones SET sort_order = 2 WHERE id = 'platform_uploaded';
UPDATE milestones SET sort_order = 3 WHERE id = 'blog_pitch';
UPDATE milestones SET sort_order = 4 WHERE id = 'blog_drafted';
UPDATE milestones SET sort_order = 5 WHERE id = 'blog_published';
UPDATE milestones SET sort_order = 6 WHERE id = 'launched';

-- Deactivate approval milestones - will be skipped by progression logic
UPDATE milestones SET sort_order = 99 WHERE id = 'blog_topic_approved';
UPDATE milestones SET sort_order = 98 WHERE id = 'launch_date_set';

-- Part D: Update "Course Launched" description
UPDATE milestones SET
  description = 'Your launch date is set and your course is LIVE in the TDI Learning Hub! Congratulations!'
WHERE id = 'launched';

-- Part E: Production Phase - Merge "Create Google Drive Folder" + "Assets Submitted"
-- =========================================================================

-- Update sort_order for production phase milestones
UPDATE milestones SET sort_order = 1 WHERE id = 'recording_started';
UPDATE milestones SET sort_order = 2 WHERE id = 'recording_completed';
UPDATE milestones SET sort_order = 3 WHERE id = 'drive_folder_created';
UPDATE milestones SET sort_order = 4 WHERE id = 'assets_submitted';
UPDATE milestones SET sort_order = 5 WHERE id = 'videos_edited';
UPDATE milestones SET sort_order = 6 WHERE id = 'marketing_created';

-- Update drive_folder_created to show as the combined step
UPDATE milestones SET
  title = 'Submit Course Files',
  description = 'Create a Google Drive folder with all your course videos and materials, then share the link with the TDI team.',
  action_type = 'link_submit',
  action_config = '{"placeholder": "Paste your Google Drive folder link", "button_text": "Submit Files"}'::jsonb
WHERE id = 'drive_folder_created';

-- =========================================================================
-- CLEANUP: Auto-complete deactivated milestones for existing creators
-- This ensures existing creators don't get stuck on removed steps
-- =========================================================================

-- Auto-complete download_concept_approved for creators who have completed download_defined
UPDATE creator_milestones cm
SET
  status = 'completed',
  completed_at = NOW(),
  completed_by = 'system:milestone-simplification',
  submission_data = '{"type": "auto_completed", "reason": "milestone_deactivated"}'::jsonb
WHERE cm.milestone_id = 'download_concept_approved'
  AND cm.status IN ('locked', 'available')
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'download_defined'
    AND cm2.status = 'completed'
  );

-- Auto-complete blog_topic_approved for creators who have completed blog_pitch
UPDATE creator_milestones cm
SET
  status = 'completed',
  completed_at = NOW(),
  completed_by = 'system:milestone-simplification',
  submission_data = '{"type": "auto_completed", "reason": "milestone_deactivated"}'::jsonb
WHERE cm.milestone_id = 'blog_topic_approved'
  AND cm.status IN ('locked', 'available')
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'blog_pitch'
    AND cm2.status = 'completed'
  );

-- Auto-complete launch_date_set for creators who have completed blog_published
UPDATE creator_milestones cm
SET
  status = 'completed',
  completed_at = NOW(),
  completed_by = 'system:milestone-simplification',
  submission_data = '{"type": "auto_completed", "reason": "milestone_deactivated"}'::jsonb
WHERE cm.milestone_id = 'launch_date_set'
  AND cm.status IN ('locked', 'available')
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'blog_published'
    AND cm2.status = 'completed'
  );

-- Auto-complete test_video_submitted for creators who have completed test_video_recorded
-- (These are now paired milestones)
UPDATE creator_milestones cm
SET
  status = 'completed',
  completed_at = NOW(),
  completed_by = 'system:milestone-simplification',
  submission_data = '{"type": "auto_completed", "reason": "paired_with_test_video_recorded"}'::jsonb
WHERE cm.milestone_id = 'test_video_submitted'
  AND cm.status IN ('locked', 'available')
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'test_video_recorded'
    AND cm2.status = 'completed'
  );

-- Auto-complete assets_submitted for creators who have completed drive_folder_created
-- (These are now paired milestones)
UPDATE creator_milestones cm
SET
  status = 'completed',
  completed_at = NOW(),
  completed_by = 'system:milestone-simplification',
  submission_data = '{"type": "auto_completed", "reason": "paired_with_drive_folder_created"}'::jsonb
WHERE cm.milestone_id = 'assets_submitted'
  AND cm.status IN ('locked', 'available')
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'drive_folder_created'
    AND cm2.status = 'completed'
  );

-- =========================================================================
-- UNLOCK NEXT STEPS: Ensure creators aren't stuck after auto-completion
-- =========================================================================

-- After auto-completing paired/deactivated milestones, unlock the next available step
-- This handles test_video_approved becoming available after test_video_recorded + test_video_submitted
UPDATE creator_milestones cm
SET status = 'available'
WHERE cm.milestone_id = 'test_video_approved'
  AND cm.status = 'locked'
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'test_video_submitted'
    AND cm2.status = 'completed'
  );

-- Unlock videos_edited after drive_folder_created + assets_submitted
UPDATE creator_milestones cm
SET status = 'available'
WHERE cm.milestone_id = 'videos_edited'
  AND cm.status = 'locked'
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'assets_submitted'
    AND cm2.status = 'completed'
  );

-- Unlock blog_drafted after blog_pitch (skipping blog_topic_approved)
UPDATE creator_milestones cm
SET status = 'available'
WHERE cm.milestone_id = 'blog_drafted'
  AND cm.status = 'locked'
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'blog_pitch'
    AND cm2.status = 'completed'
  )
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm3
    WHERE cm3.creator_id = cm.creator_id
    AND cm3.milestone_id = 'blog_topic_approved'
    AND cm3.status = 'completed'
  );

-- Unlock launched after blog_published (skipping launch_date_set)
UPDATE creator_milestones cm
SET status = 'available'
WHERE cm.milestone_id = 'launched'
  AND cm.status = 'locked'
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'blog_published'
    AND cm2.status = 'completed'
  )
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm3
    WHERE cm3.creator_id = cm.creator_id
    AND cm3.milestone_id = 'launch_date_set'
    AND cm3.status = 'completed'
  );

-- Unlock download_drafted after download_defined (skipping download_concept_approved)
UPDATE creator_milestones cm
SET status = 'available'
WHERE cm.milestone_id = 'download_drafted'
  AND cm.status = 'locked'
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm2
    WHERE cm2.creator_id = cm.creator_id
    AND cm2.milestone_id = 'download_defined'
    AND cm2.status = 'completed'
  )
  AND EXISTS (
    SELECT 1 FROM creator_milestones cm3
    WHERE cm3.creator_id = cm.creator_id
    AND cm3.milestone_id = 'download_concept_approved'
    AND cm3.status = 'completed'
  );

-- =========================================================================
-- VERIFICATION QUERIES (run these to check the migration worked)
-- =========================================================================

-- Check milestone sort_order updates
-- SELECT id, title, phase_id, sort_order FROM milestones WHERE phase_id IN ('test_prep', 'launch', 'production') ORDER BY phase_id, sort_order;

-- Check for any creators stuck on deactivated milestones
-- SELECT c.name, cm.milestone_id, cm.status
-- FROM creator_milestones cm
-- JOIN creators c ON c.id = cm.creator_id
-- WHERE cm.milestone_id IN ('download_concept_approved', 'blog_topic_approved', 'launch_date_set')
-- AND cm.status NOT IN ('completed');

-- Check paired milestone completion
-- SELECT c.name, cm.milestone_id, cm.status, cm.completed_by
-- FROM creator_milestones cm
-- JOIN creators c ON c.id = cm.creator_id
-- WHERE cm.milestone_id IN ('test_video_submitted', 'assets_submitted')
-- ORDER BY c.name;
