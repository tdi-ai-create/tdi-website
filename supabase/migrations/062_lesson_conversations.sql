-- Migration 041: Lesson Conversations
-- Adds lesson_responses table for the Hub Course Conversation feature.
-- Replaces the star-rating model with contribution types:
--   tried_it, adapted_it, still_trying, got_stuck, didnt_land

CREATE TABLE IF NOT EXISTS lesson_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_contribution_type
    CHECK (contribution_type IN ('tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_responses_lesson_id
  ON lesson_responses(lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_responses_course_id
  ON lesson_responses(course_id);

CREATE INDEX IF NOT EXISTS idx_lesson_responses_user_id
  ON lesson_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_responses_contribution_type
  ON lesson_responses(contribution_type);

CREATE INDEX IF NOT EXISTS idx_lesson_responses_created_at
  ON lesson_responses(created_at DESC);

-- Helpful votes tracking (one per user per post)
CREATE TABLE IF NOT EXISTS lesson_response_helpfuls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES lesson_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(response_id, user_id)
);

-- RLS
ALTER TABLE lesson_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_response_helpfuls ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read lesson responses
DROP POLICY IF EXISTS "Anyone can view lesson responses" ON lesson_responses;
CREATE POLICY "Anyone can view lesson responses"
  ON lesson_responses FOR SELECT
  USING (true);

-- Users can create their own responses
DROP POLICY IF EXISTS "Users can create own responses" ON lesson_responses;
CREATE POLICY "Users can create own responses"
  ON lesson_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
DROP POLICY IF EXISTS "Users can update own responses" ON lesson_responses;
CREATE POLICY "Users can update own responses"
  ON lesson_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone authenticated can read helpfuls
DROP POLICY IF EXISTS "Anyone can view helpfuls" ON lesson_response_helpfuls;
CREATE POLICY "Anyone can view helpfuls"
  ON lesson_response_helpfuls FOR SELECT
  USING (true);

-- Users can mark posts as helpful
DROP POLICY IF EXISTS "Users can mark helpful" ON lesson_response_helpfuls;
CREATE POLICY "Users can mark helpful"
  ON lesson_response_helpfuls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own helpful marks
DROP POLICY IF EXISTS "Users can unmark helpful" ON lesson_response_helpfuls;
CREATE POLICY "Users can unmark helpful"
  ON lesson_response_helpfuls FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE lesson_responses IS
  'Teacher contributions to lesson conversations. Each post has a contribution_type (tried_it, adapted_it, still_trying, got_stuck, didnt_land) instead of a star rating.';

COMMENT ON COLUMN lesson_responses.contribution_type IS
  'Type of contribution. Values: tried_it, adapted_it, still_trying, got_stuck, didnt_land.';
