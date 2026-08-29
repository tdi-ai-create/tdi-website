-- ============================================================
-- RECONCILIATION MIGRATION: Path Restructure & Phase Renames
-- Captures schema changes applied directly to production Supabase
-- on 2026-05-12 as part of the Creator Studio overhaul.
--
-- Blog was eliminated as a standalone path. All 6 blog creators
-- were migrated to Download path. Blog now exists only as a
-- sub-step within Download and Course paths.
-- ============================================================

-- 1. Phase renames
UPDATE public.phases SET name = 'Content Design'
WHERE id = 'course_design' AND name != 'Content Design';

UPDATE public.phases SET name = 'Content Launched'
WHERE id = 'launch' AND name LIKE '%Course Launched%';

-- 2. Rename "Choose Your Content Path" milestone to "Confirm Your Path"
UPDATE public.milestones
SET name = 'Confirm Your Path'
WHERE id = 'content_path_selection' AND name != 'Confirm Your Path';

-- 3. New milestones for the restructured Download path
-- Submit Download Specs (with mockup/visual upload)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'submit_download_specs',
  'test_prep',
  'Submit Download Specs',
  'Upload your mockups, visuals, format preferences, and descriptions so Lily can build your download.',
  false, 8, '{download,course}'
) ON CONFLICT (id) DO NOTHING;

-- Lily Builds Your Download (team action)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'lily_builds_download',
  'production',
  'Lily Builds Your Download',
  'Lily is building your download from the specs you submitted. You''ll be notified when it''s ready for review.',
  true, 1, '{download,course}'
) ON CONFLICT (id) DO NOTHING;

-- Approve Your Download (creator confirms Lily's build)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'approve_download',
  'production',
  'Approve Your Download',
  'Review what Lily built and confirm it''s ready to go live.',
  false, 2, '{download,course}'
) ON CONFLICT (id) DO NOTHING;

-- Download Goes Live (launch event)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'download_goes_live',
  'launch',
  'Download Goes Live',
  'Your download is published and available to educators!',
  true, 1, '{download,course}'
) ON CONFLICT (id) DO NOTHING;

-- Set Up Your Affiliate Link (launch milestone)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'setup_affiliate_link',
  'launch',
  'Set Up Your Affiliate Link',
  'Get your unique affiliate link to start earning from referrals.',
  false, 2, '{download,course}'
) ON CONFLICT (id) DO NOTHING;

-- Submit Course Scripts (course-only)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'submit_course_scripts',
  'production',
  'Submit Course Scripts',
  'Upload your completed course scripts for review.',
  false, 3, '{course}'
) ON CONFLICT (id) DO NOTHING;

-- Course Scripts Approved (team action, course-only)
INSERT INTO public.milestones (
  id, phase_id, name, description, requires_team_action, sort_order, applies_to
) VALUES (
  'course_scripts_approved',
  'production',
  'Course Scripts Approved',
  'Our team has reviewed and approved your course scripts.',
  true, 4, '{course}'
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert new "Marketing Blog" phase if it doesn't exist
-- (Rae described inserting this between Production and Launch)
INSERT INTO public.phases (id, name, description, sort_order)
VALUES (
  'marketing_blog',
  'Marketing Blog',
  'Create a companion marketing blog post to promote your content.',
  5
) ON CONFLICT (id) DO NOTHING;
