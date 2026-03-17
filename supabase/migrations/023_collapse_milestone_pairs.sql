-- Migration: Collapse milestone pairs into combined cards
-- Run this SQL in Supabase SQL Editor

-- =============================================================
-- PART 1: Collapse milestone pairs (from Prompt 1)
-- =============================================================

-- Step 1: Add new columns to creator_milestones
ALTER TABLE creator_milestones
  ADD COLUMN IF NOT EXISTS awaiting_approval boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS submitted_value text;

-- Step 2: Add collapse pointer column to milestones
ALTER TABLE milestones
  ADD COLUMN IF NOT EXISTS is_collapsed_into text REFERENCES milestones(id);

-- Step 3: Mark the retired approve milestones
UPDATE milestones SET is_collapsed_into = 'test_video_recorded'
  WHERE id IN ('test_video_submitted', 'test_video_approved');

UPDATE milestones SET is_collapsed_into = 'outline_drafted'
  WHERE id = 'outline_meeting_completed';

UPDATE milestones SET is_collapsed_into = 'download_drafted'
  WHERE id = 'download_concept_approved';

UPDATE milestones SET is_collapsed_into = 'blog_drafted'
  WHERE id = 'blog_topic_approved';

UPDATE milestones SET is_collapsed_into = 'assets_submitted'
  WHERE id = 'drive_folder_created';

-- =============================================================
-- PART 2: Team status messages (from Prompt 2 - Area 5)
-- =============================================================

-- Add team_status_message column to milestones
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS team_status_message text;

-- Update team_action milestones with specific status messages
UPDATE milestones SET team_status_message = 'We''re reviewing your intake form. You''ll hear from us within 2 business days.' WHERE id = 'team_intake_review';
UPDATE milestones SET team_status_message = 'We''re reviewing your outline before your meeting. Come with questions!' WHERE id = 'outline_meeting_completed';
UPDATE milestones SET team_status_message = 'We''re reviewing your test video and will send written feedback within 5 business days.' WHERE id = 'test_video_approved';
UPDATE milestones SET team_status_message = 'We''re reviewing your download concept. You''ll hear from us shortly.' WHERE id = 'download_concept_approved';
UPDATE milestones SET team_status_message = 'Your download is with our design team. Expect your branded version within 10 business days.' WHERE id = 'download_handoff';
UPDATE milestones SET team_status_message = 'We''re editing your videos and building your course on the platform. We''ll share a timeline shortly.' WHERE id = 'videos_edited';
UPDATE milestones SET team_status_message = 'We''re putting together your course cover, bio page, and promo assets.' WHERE id = 'marketing_created';
UPDATE milestones SET team_status_message = 'Your blog topic is under review. We''ll approve it or suggest alternatives within 2 business days.' WHERE id = 'blog_topic_approved';
UPDATE milestones SET team_status_message = 'We''re editing and formatting your post. You''ll see a preview before anything goes live.' WHERE id = 'blog_published';
UPDATE milestones SET team_status_message = 'Your content is being uploaded to the platform. Almost there!' WHERE id = 'platform_uploaded';
UPDATE milestones SET team_status_message = 'Your launch date is being confirmed. We''ll update this as soon as it''s set.' WHERE id = 'launch_date_set';
UPDATE milestones SET team_status_message = 'Congratulations — your course is officially live on the TDI Hub!' WHERE id = 'launched';
UPDATE milestones SET team_status_message = 'Your outline has been reviewed. We''ll mark this complete after your meeting.' WHERE id = 'final_outline_approved';
