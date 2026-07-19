-- ============================================================
-- Quick Win Responses (Community Conversation)
-- Powers the pulse bar (Tried it / Adapted it / Still trying)
-- and "Share my experience" for all quick wins and games.
-- This table was referenced in code but never created.
-- ============================================================

CREATE TABLE IF NOT EXISTS quick_win_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quick_win_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (
    contribution_type IN ('tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land')
  ),
  title TEXT,
  body TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qw_responses_quick_win
  ON quick_win_responses(quick_win_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qw_responses_user
  ON quick_win_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_qw_responses_type
  ON quick_win_responses(contribution_type);

-- RLS
ALTER TABLE quick_win_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quick win responses"
  ON quick_win_responses FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert responses"
  ON quick_win_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON quick_win_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
