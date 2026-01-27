-- TDI Creator Portal - Milestone Workflow Updates
-- Run this in Supabase SQL Editor
-- Generated: January 2026

-- ============================================
-- SECTION 1: ADD NEW FIELDS TO CREATORS TABLE
-- ============================================

-- Ensure agreement fields exist (required for signing flow)
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS agreement_signed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agreement_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS agreement_signed_name TEXT;

-- Add new link fields for tracking creator content
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS google_doc_link TEXT,
ADD COLUMN IF NOT EXISTS drive_folder_link TEXT,
ADD COLUMN IF NOT EXISTS marketing_doc_link TEXT,
ADD COLUMN IF NOT EXISTS course_url TEXT,
ADD COLUMN IF NOT EXISTS launch_date DATE;

-- Add preference fields for production choices
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS wants_video_editing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wants_download_design BOOLEAN DEFAULT false;

-- ============================================
-- SECTION 2: ADD NEW MILESTONE
-- ============================================

-- Insert new milestone: course_guide_reviewed (after final_outline_approved)
INSERT INTO milestones (id, phase_id, name, description, sort_order, requires_team_action, action_type, action_config)
VALUES (
  'course_guide_reviewed',
  'course_design',
  'Review Course Creation Guide',
  'Review how production works and set your editing preferences',
  7,
  false,
  'preferences_form',
  '{"label": "I''ve Reviewed & Set My Preferences", "form_type": "production_preferences"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config;

-- ============================================
-- SECTION 3: UPDATE MILESTONE DESCRIPTIONS
-- ============================================

-- Onboarding Phase
UPDATE milestones SET
  description = 'Complete the intake form to tell us about your course idea',
  action_config = '{"label": "I''ve Completed the Intake Form"}'::jsonb
WHERE id = 'intake_completed';

UPDATE milestones SET
  description = 'Our team reviews your intake form and prepares notes',
  action_config = '{"label": "Waiting on TDI Team"}'::jsonb
WHERE id = 'team_intake_review';

UPDATE milestones SET
  description = 'Review the notes from our team about your course idea',
  action_type = 'review_notes',
  action_config = '{"label": "I''ve Reviewed the Notes", "show_notes": true, "email_link": "mailto:rachel@teachersdeserveit.com"}'::jsonb
WHERE id = 'creator_intake_review';

UPDATE milestones SET
  description = 'Schedule your kickoff meeting with Rae',
  action_config = '{"url": "https://calendly.com/rae-teachersdeserveit/creator-chat", "label": "Book Your Kickoff Call"}'::jsonb
WHERE id = 'rae_meeting_scheduled';

UPDATE milestones SET
  description = 'Meet with Rae to discuss your course and next steps',
  action_config = '{"label": "Waiting on TDI Team"}'::jsonb
WHERE id = 'rae_meeting_completed';

-- Agreement Phase
UPDATE milestones SET
  description = 'Review and digitally sign your creator agreement',
  action_config = '{"label": "Review & Sign Agreement"}'::jsonb
WHERE id = 'agreement_sign';

-- Course Design Phase
UPDATE milestones SET
  description = 'Draft your course outline using our template',
  action_type = 'submit_link',
  action_config = '{"label": "Submit Your Outline", "link_type": "google_doc", "placeholder": "Paste your Google Doc link", "notify_team": true, "save_to_field": "google_doc_link", "help_link": "/creator-portal/example-outline", "help_text": "View example outline"}'::jsonb
WHERE id = 'outline_drafted';

UPDATE milestones SET
  description = 'Schedule a meeting to review your outline with Rae',
  action_config = '{"url": "https://calendly.com/rae-teachersdeserveit/creator-chat", "label": "Schedule Outline Review"}'::jsonb
WHERE id = 'outline_meeting_scheduled';

UPDATE milestones SET
  description = 'Meet with Rae to get feedback on your outline',
  action_config = '{"label": "Waiting on TDI Team"}'::jsonb
WHERE id = 'outline_meeting_completed';

UPDATE milestones SET
  description = 'Update your outline based on feedback',
  action_type = 'submit_link',
  action_config = '{"label": "Submit Final Outline", "link_type": "google_doc", "placeholder": "Paste your updated Google Doc link", "notify_team": true, "save_to_field": "google_doc_link"}'::jsonb
WHERE id = 'outline_finalized';

UPDATE milestones SET
  description = 'Schedule your final outline review meeting',
  action_config = '{"url": "https://calendly.com/rae-teachersdeserveit/creator-chat", "label": "Schedule Final Review"}'::jsonb
WHERE id = 'final_outline_meeting_scheduled';

UPDATE milestones SET
  description = 'Get final approval on your course outline',
  action_config = '{"label": "Waiting on TDI Team"}'::jsonb
WHERE id = 'final_outline_approved';

-- Test & Prep Phase
UPDATE milestones SET
  description = 'Record a 1-2 minute test video to check your setup',
  action_config = '{"label": "I''ve Recorded My Test Video"}'::jsonb
WHERE id = 'test_video_recorded';

UPDATE milestones SET
  description = 'Upload your test video for the team to review',
  action_type = 'submit_link',
  action_config = '{"label": "Submit Test Video", "link_type": "video", "placeholder": "Paste your Loom or Google Drive link", "notify_team": true}'::jsonb
WHERE id = 'test_video_submitted';

UPDATE milestones SET
  description = 'The team reviews your test video and provides feedback',
  action_type = 'review_with_changes',
  action_config = '{"label": "Waiting on TDI Team", "allow_request_changes": true}'::jsonb
WHERE id = 'test_video_approved';

UPDATE milestones SET
  description = 'Start creating your course download materials',
  action_config = '{"label": "I''ve Started Designing Downloads"}'::jsonb
WHERE id = 'downloads_started';

-- Production Phase
UPDATE milestones SET
  description = 'Begin recording your course videos',
  action_config = '{"label": "I''ve Started Recording"}'::jsonb
WHERE id = 'recording_started';

UPDATE milestones SET
  description = 'Finish recording all your course videos',
  action_config = '{"label": "I''ve Finished Recording"}'::jsonb
WHERE id = 'recording_completed';

UPDATE milestones SET
  description = 'Create a Google Drive folder and share it with the team',
  action_type = 'submit_link',
  action_config = '{"label": "Share Drive Folder", "link_type": "google_drive", "placeholder": "Paste your Google Drive folder link", "notify_team": true, "save_to_field": "drive_folder_link", "conditional_help": "wants_video_editing"}'::jsonb
WHERE id = 'drive_folder_created';

UPDATE milestones SET
  description = 'Upload all videos, downloads, and assets to your Drive folder',
  action_type = 'submit_link',
  action_config = '{"label": "Submit Assets", "link_type": "google_drive", "placeholder": "Paste link to your assets", "notify_team": true}'::jsonb
WHERE id = 'assets_submitted';

UPDATE milestones SET
  description = 'TDI edits your videos (if requested)',
  action_config = '{"label": "TDI is editing your videos"}'::jsonb
WHERE id = 'videos_edited';

UPDATE milestones SET
  description = 'TDI creates your marketing materials and branding',
  action_config = '{"label": "TDI is creating marketing assets"}'::jsonb
WHERE id = 'marketing_created';

-- Launch Phase
UPDATE milestones SET
  description = 'Review and approve your course branding and marketing materials',
  action_type = 'review_with_changes',
  action_config = '{"label": "I Approve My Branding", "allow_request_changes": true, "show_link_field": "marketing_doc_link"}'::jsonb
WHERE id = 'branding_confirmed';

UPDATE milestones SET
  description = 'TDI uploads your course to the Learning Hub',
  action_config = '{"label": "TDI is uploading to platform"}'::jsonb
WHERE id = 'platform_uploaded';

UPDATE milestones SET
  description = 'TDI finalizes your launch date',
  action_config = '{"label": "TDI is setting launch date"}'::jsonb
WHERE id = 'launch_date_set';

UPDATE milestones SET
  description = 'Your course is live! Celebrate your achievement!',
  action_type = 'launch_celebration',
  action_config = '{"label": "Course Launched!", "show_course_url": true, "show_discount_code": true}'::jsonb
WHERE id = 'launched';

-- ============================================
-- SECTION 4: ENSURE CREATOR_MILESTONES TABLE HAS REQUIRED COLUMNS
-- ============================================

-- Add completed_by column if it doesn't exist
ALTER TABLE creator_milestones
ADD COLUMN IF NOT EXISTS completed_by TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ============================================
-- SECTION 5: ADD MILESTONE TO EXISTING CREATORS
-- ============================================

-- Add the new course_guide_reviewed milestone for all existing creators
INSERT INTO creator_milestones (creator_id, milestone_id, status)
SELECT c.id, 'course_guide_reviewed', 'locked'
FROM creators c
WHERE NOT EXISTS (
  SELECT 1 FROM creator_milestones cm
  WHERE cm.creator_id = c.id AND cm.milestone_id = 'course_guide_reviewed'
);

-- ============================================
-- SECTION 6: UPDATE CALENDLY LINKS
-- ============================================

-- Ensure all Calendly links point to the correct URL
UPDATE milestones
SET action_config = jsonb_set(
  action_config,
  '{url}',
  '"https://calendly.com/rae-teachersdeserveit/creator-chat"'
)
WHERE action_type = 'calendly';
