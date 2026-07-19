-- ============================================================
-- Hub Game Progress & Spaced Repetition Tables
-- Tracks per-session game data, per-round responses,
-- and supports spaced repetition for missed items.
-- ============================================================

-- Game sessions: one row per game play-through
CREATE TABLE IF NOT EXISTS hub_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,               -- e.g. 'tell-or-ask', 'feedback-level-up'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER,                       -- correct count (nullable until done)
  total_rounds INTEGER NOT NULL,
  best_streak INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  language TEXT DEFAULT 'en',
  difficulty TEXT DEFAULT 'all',        -- 'easy','medium','hard','expert','all'
  grade_band TEXT DEFAULT 'all',        -- 'k-2','3-5','6-8','9-12','all'
  role TEXT DEFAULT 'all',              -- 'teacher','para','coach','leader','all'
  is_review_mode BOOLEAN DEFAULT FALSE  -- true when playing spaced-repetition review
);

-- Per-round responses: one row per question/scenario answered
CREATE TABLE IF NOT EXISTS hub_game_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hub_game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  item_id TEXT NOT NULL,               -- stable identifier for the question/scenario
  round_number INTEGER NOT NULL,
  user_answer TEXT,                     -- what the user chose
  correct_answer TEXT,                  -- the right answer
  is_correct BOOLEAN NOT NULL,
  confidence INTEGER,                  -- 1-5 if game collects it (Tell or Ask)
  time_spent_seconds INTEGER,          -- per-round time if applicable
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_game_sessions_user
  ON hub_game_sessions(user_id, game_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_responses_user_item
  ON hub_game_responses(user_id, game_id, item_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_responses_session
  ON hub_game_responses(session_id);

CREATE INDEX IF NOT EXISTS idx_game_responses_weak
  ON hub_game_responses(user_id, game_id, is_correct, answered_at DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE hub_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_game_responses ENABLE ROW LEVEL SECURITY;

-- Sessions: users can read/write their own
CREATE POLICY "Users can view own game sessions"
  ON hub_game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions"
  ON hub_game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON hub_game_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Responses: users can read/write their own
CREATE POLICY "Users can view own game responses"
  ON hub_game_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game responses"
  ON hub_game_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
