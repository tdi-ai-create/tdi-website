-- ============================================================
-- Two more kinds of conversation post.
--
--   question   a member or a TDI voice asking the room something.
--              Nothing in the Hub could ask a question before this.
--   from_tdi   a note from a TDI account. Never offered to members
--              in the composer, and kept out of the pulse bar, which
--              counts what teachers did rather than what we said.
--
-- Additive only. Existing rows and existing types are untouched.
-- ============================================================

ALTER TABLE quick_win_responses
  DROP CONSTRAINT IF EXISTS quick_win_responses_contribution_type_check;

ALTER TABLE quick_win_responses
  ADD CONSTRAINT quick_win_responses_contribution_type_check
  CHECK (contribution_type IN (
    'tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land',
    'question', 'from_tdi'
  ));

-- Courses and lessons share the same vocabulary.
ALTER TABLE lesson_responses
  DROP CONSTRAINT IF EXISTS chk_contribution_type;

ALTER TABLE lesson_responses
  ADD CONSTRAINT chk_contribution_type
  CHECK (contribution_type IN (
    'tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land',
    'question', 'from_tdi'
  ));
