-- Add content_position to hub_quiz_questions
-- When set, the question renders after that content section index (0-based).
-- When NULL, the question renders after all content (backward compatible).
-- Applied to Learning Hub Supabase (asdwpkcsbcnpknklchdq) on 2026-07-14.
ALTER TABLE hub_quiz_questions
  ADD COLUMN IF NOT EXISTS content_position INTEGER DEFAULT NULL;
