-- ============================================================
-- Hub Game Badges — earned milestone tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS hub_game_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,             -- matches GameBadge.id in gameBadges.ts
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)           -- one badge per user
);

CREATE INDEX IF NOT EXISTS idx_game_badges_user
  ON hub_game_badges(user_id);

-- RLS
ALTER TABLE hub_game_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game badges"
  ON hub_game_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game badges"
  ON hub_game_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
