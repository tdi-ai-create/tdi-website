-- ============================================
-- CONTENT PATH FEATURE - FULL MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add content_path to creators
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS content_path text NULL;

-- 2. Add applies_to to milestones
ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS applies_to text[] NULL DEFAULT '{course}';

-- 3. Rename Test & Prep phase to Prep & Resources
UPDATE public.phases
SET name = 'Prep & Resources'
WHERE id = 'test_prep';

-- 4. Set applies_to for existing milestones
-- Onboarding: all paths
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'intake_completed';
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'team_intake_review';
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'creator_intake_review';
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'rae_meeting_scheduled';
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'rae_meeting_completed';

-- Agreement: all paths
UPDATE public.milestones SET applies_to = '{blog,download,course}' WHERE id = 'agreement_sign';

-- Course Design: course only (default is fine, but being explicit)
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'outline_drafted';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'outline_meeting_scheduled';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'outline_meeting_completed';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'outline_finalized';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'final_outline_meeting_scheduled';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'final_outline_approved';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'course_guide_reviewed';

-- Content Development: test video is course only
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'test_video_recorded';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'test_video_submitted';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'test_video_approved';

-- Production: course only
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'recording_started';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'recording_completed';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'drive_folder_created';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'assets_submitted';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'videos_edited';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'marketing_created';

-- Launch: branding/platform/dates are course only
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'branding_confirmed';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'platform_uploaded';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'launch_date_set';
UPDATE public.milestones SET applies_to = '{course}' WHERE id = 'launched';

-- 5. Remove old downloads_started milestone
DELETE FROM public.creator_milestones WHERE milestone_id = 'downloads_started';
DELETE FROM public.milestones WHERE id = 'downloads_started';

-- 6. Bump onboarding sort orders to make room for path selection
UPDATE public.milestones
SET sort_order = sort_order + 1
WHERE phase_id = 'onboarding' AND sort_order >= 2;

-- 7. Insert content path selection milestone
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES (
  'content_path_selection',
  'onboarding',
  'Choose Your Content Path',
  'Select the type of content you''d like to create with TDI. Each option builds on the previous - downloads include blog promotion, and courses include both downloads and blog content.',
  false,
  2,
  'select',
  '{
    "label": "Select Your Path",
    "options": [
      {
        "value": "blog",
        "label": "Blog Post",
        "emoji": "✍️",
        "description": "Write and publish a blog post on the TDI platform."
      },
      {
        "value": "download",
        "label": "Digital Download",
        "emoji": "📦",
        "description": "Create a downloadable resource for educators. This path includes a blog post to support your launch."
      },
      {
        "value": "course",
        "label": "Online Course",
        "emoji": "🎓",
        "description": "Build a full online course with video modules. This path includes a digital download and blog post to support your launch."
      }
    ]
  }',
  '{blog,download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

-- 8. Insert download milestones (Prep & Resources phase)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'download_defined',
  'test_prep',
  'Define Your Download',
  'What resource are you creating? Describe the goal, who it''s for, and what educators will walk away with.',
  false,
  4,
  'form',
  '{
    "label": "Define Your Resource",
    "fields": [
      {"name": "title", "label": "Resource Title", "type": "text", "required": true, "placeholder": "e.g., Classroom Management Checklist"},
      {"name": "format", "label": "Format", "type": "select", "options": ["Guide", "Template", "Toolkit", "Checklist", "Worksheet", "Poster", "Other"], "required": true},
      {"name": "audience", "label": "Who Is This For?", "type": "textarea", "placeholder": "Describe your target educator audience", "required": true},
      {"name": "goal", "label": "Goal / Outcome", "type": "textarea", "placeholder": "What will educators be able to do after using this resource?", "required": true}
    ]
  }',
  '{download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'download_concept_approved',
  'test_prep',
  'Download Concept Approved',
  'Our team will review your download concept to make sure it fits TDI''s audience and content library.',
  true,
  5,
  'team_action',
  '{
    "label": "Awaiting Concept Approval",
    "allow_notes": true,
    "email_on_complete": true
  }',
  '{download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'download_drafted',
  'test_prep',
  'Draft Your Download',
  'Build out your full draft in a Google Doc and share the link when ready for review.',
  false,
  6,
  'link_submit',
  '{
    "label": "Submit Draft Link",
    "placeholder": "Paste your Google Doc link here",
    "button_text": "Submit Draft for Review"
  }',
  '{download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'download_handoff',
  'test_prep',
  'Download Review & Handoff',
  'Our team will review your draft and handle design and formatting. We''ll share the final version with you!',
  true,
  7,
  'team_action',
  '{
    "label": "In Review & Design",
    "allow_notes": true,
    "completion_message": "Download design complete!"
  }',
  '{download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

-- 9. Reorder launch milestones to make room for blog workflow
UPDATE public.milestones SET sort_order = 1 WHERE id = 'branding_confirmed';
UPDATE public.milestones SET sort_order = 2 WHERE id = 'platform_uploaded';
UPDATE public.milestones SET sort_order = 7 WHERE id = 'launch_date_set';
UPDATE public.milestones SET sort_order = 8 WHERE id = 'launched';

-- 10. Insert blog milestones (Launch phase)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'blog_pitch',
  'launch',
  'Pitch Your Launch Blog',
  'Time to create some buzz! Pitch a blog topic that showcases your expertise and connects to your content. What do you want to write about?',
  false,
  3,
  'form',
  '{
    "label": "Submit Your Pitch",
    "fields": [
      {"name": "topic", "label": "Blog Topic", "type": "text", "required": true, "placeholder": "e.g., 5 Strategies for Building Student Resilience"},
      {"name": "takeaway", "label": "Key Takeaway", "type": "textarea", "placeholder": "What will readers learn or walk away with?", "required": true},
      {"name": "why_it_matters", "label": "Why It Matters", "type": "textarea", "placeholder": "Why is this relevant to educators right now?", "required": true},
      {"name": "connection", "label": "Connection to Your Content", "type": "textarea", "placeholder": "How does this blog post relate to your course/download?", "required": true}
    ]
  }',
  '{blog,download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'blog_topic_approved',
  'launch',
  'Blog Topic Approved',
  'Our team will review your pitch to make sure it aligns with TDI''s content strategy and your launch timing.',
  true,
  4,
  'team_action',
  '{
    "label": "Awaiting Topic Approval",
    "allow_notes": true,
    "email_on_complete": true
  }',
  '{blog,download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'blog_drafted',
  'launch',
  'Draft Your Blog Post',
  'Write your blog post in a Google Doc and share the link when it''s ready for review.',
  false,
  5,
  'link_submit',
  '{
    "label": "Submit Draft Link",
    "placeholder": "Paste your Google Doc link here",
    "button_text": "Submit Draft for Review"
  }',
  '{blog,download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, action_type, action_config, applies_to
) VALUES
(
  'blog_published',
  'launch',
  'Blog Review & Publishing',
  'We''ll edit, format, and schedule your post to publish at the right time. You''ll get notified when it''s live!',
  true,
  6,
  'team_action',
  '{
    "label": "In Review & Publishing",
    "allow_notes": true,
    "completion_message": "Your blog post is live!"
  }',
  '{blog,download,course}'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  action_type = EXCLUDED.action_type,
  action_config = EXCLUDED.action_config,
  applies_to = EXCLUDED.applies_to;

-- 11. Backfill existing creators as course path
UPDATE public.creators
SET content_path = 'course'
WHERE content_path IS NULL;

-- 12. Create creator_milestones for new milestones for existing creators
-- This ensures existing creators get the new milestones
INSERT INTO public.creator_milestones (creator_id, milestone_id, status)
SELECT c.id, m.id, 'locked'
FROM public.creators c
CROSS JOIN public.milestones m
WHERE NOT EXISTS (
  SELECT 1 FROM public.creator_milestones cm
  WHERE cm.creator_id = c.id AND cm.milestone_id = m.id
)
ON CONFLICT DO NOTHING;
