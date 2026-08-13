-- Keep the reflection an educator writes after a wrong answer.
--
-- When a multiple choice answer is wrong, the lesson player asks the educator
-- to connect the idea to their own classroom. That reflection was being saved
-- against a question_id of "<uuid>_reflection", which is not a uuid, so every
-- one of those writes failed with 22P02. The player ignored the failure and
-- told the educator "Nice reflection", so the words were lost at the moment
-- they were most engaged.
--
-- The reflection belongs to the answer that prompted it, so it goes on the
-- same row rather than inventing a second one.

ALTER TABLE hub_quiz_responses
  ADD COLUMN IF NOT EXISTS follow_up text;

COMMENT ON COLUMN hub_quiz_responses.follow_up IS
  'What the educator wrote after getting this question wrong. Theirs, never shown to schools.';
