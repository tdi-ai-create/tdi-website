-- ============================================
-- REMOVE APPROVAL STEP MIGRATION
-- Streamlines onboarding by removing team_intake_review and creator_intake_review
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add intake_responses JSONB column to creators table
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS intake_responses jsonb NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.creators.intake_responses IS 'Stores intake form responses as JSON (name, email, strategy, content_types, referral_source)';

-- 2. Advance any creators stuck at team_intake_review to rae_meeting_scheduled
-- First, mark team_intake_review as completed for these creators
UPDATE public.creator_milestones
SET status = 'completed',
    completed_at = NOW(),
    completed_by = 'system_migration'
WHERE milestone_id = 'team_intake_review'
  AND status IN ('available', 'in_progress');

-- 3. Advance any creators stuck at creator_intake_review to rae_meeting_scheduled
UPDATE public.creator_milestones
SET status = 'completed',
    completed_at = NOW(),
    completed_by = 'system_migration'
WHERE milestone_id = 'creator_intake_review'
  AND status IN ('available', 'in_progress');

-- 4. Make rae_meeting_scheduled available for creators who were at the removed steps
UPDATE public.creator_milestones
SET status = 'available'
WHERE milestone_id = 'rae_meeting_scheduled'
  AND status = 'locked'
  AND creator_id IN (
    SELECT DISTINCT creator_id
    FROM public.creator_milestones
    WHERE milestone_id IN ('team_intake_review', 'creator_intake_review')
      AND completed_by = 'system_migration'
  );

-- 5. Delete creator_milestones records for the removed milestones
DELETE FROM public.creator_milestones
WHERE milestone_id IN ('team_intake_review', 'creator_intake_review');

-- 6. Delete the milestone definitions
DELETE FROM public.milestones
WHERE id IN ('team_intake_review', 'creator_intake_review');

-- 7. Update sort_order for remaining onboarding milestones
-- New order:
-- 1. intake_completed (auto-complete)
-- 2. content_path_selection (creator selects path)
-- 3. rae_meeting_scheduled (Calendly booking)
-- 4. rae_meeting_completed (team marks after meeting)

UPDATE public.milestones SET sort_order = 1 WHERE id = 'intake_completed';
UPDATE public.milestones SET sort_order = 2 WHERE id = 'content_path_selection';
UPDATE public.milestones SET sort_order = 3 WHERE id = 'rae_meeting_scheduled';
UPDATE public.milestones SET sort_order = 4 WHERE id = 'rae_meeting_completed';

-- 8. Verify the changes
SELECT id, name, sort_order, phase_id
FROM public.milestones
WHERE phase_id = 'onboarding'
ORDER BY sort_order;

-- 9. Show any creators that were advanced
SELECT c.name, c.email, cm.milestone_id, cm.status, cm.completed_by
FROM public.creator_milestones cm
JOIN public.creators c ON c.id = cm.creator_id
WHERE cm.completed_by = 'system_migration';
