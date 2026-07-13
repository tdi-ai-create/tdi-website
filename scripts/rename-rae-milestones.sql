-- Rename rae_meeting milestones to generic team language
-- RAN SUCCESSFULLY 2026-07-13

-- 1. Update milestone definitions
UPDATE public.milestones
SET
  id = 'kickoff_call_scheduled',
  name = 'Book Your Kickoff Call',
  description = 'Schedule your kickoff meeting with the Creator Studio team',
  action_config = jsonb_set(
    action_config,
    '{label}',
    '"Book Your Kickoff Call with the Team"'
  )
WHERE id = 'rae_meeting_scheduled';

UPDATE public.milestones
SET
  id = 'kickoff_call_completed',
  name = 'Kickoff Call Complete',
  description = 'Meet with the team to discuss your project and next steps'
WHERE id = 'rae_meeting_completed';

-- 2. Update all creator_milestones references
UPDATE public.creator_milestones
SET milestone_id = 'kickoff_call_scheduled'
WHERE milestone_id = 'rae_meeting_scheduled';

UPDATE public.creator_milestones
SET milestone_id = 'kickoff_call_completed'
WHERE milestone_id = 'rae_meeting_completed';
