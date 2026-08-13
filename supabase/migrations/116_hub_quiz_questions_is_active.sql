-- Retire check-in questions without destroying learner responses.
--
-- Course check-ins were originally generated five at a time and parked on
-- whichever lesson happened to have content first, then spread across three
-- lessons. Two of the five never rendered, and the questions did not match the
-- lesson they sat on. Rebuilding them means replacing questions that educators
-- have already answered, and hub_quiz_responses references question_id, so a
-- delete would take real responses with it.
--
-- is_active lets a question be retired instead. The Hub reads active questions
-- only; retired rows stay put so every response keeps pointing at the question
-- it answered.

ALTER TABLE hub_quiz_questions
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Every read is "active questions for these lessons, in order".
CREATE INDEX IF NOT EXISTS idx_hub_quiz_questions_lesson_active
  ON hub_quiz_questions (lesson_id, sort_order)
  WHERE is_active;

COMMENT ON COLUMN hub_quiz_questions.is_active IS
  'False means retired: kept for the responses that reference it, never shown to learners.';
