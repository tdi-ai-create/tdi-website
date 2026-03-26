-- Hub Favorites - allow teachers to bookmark courses and quick wins
CREATE TABLE IF NOT EXISTS hub_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('course', 'quick_win')),
  content_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_favorites_user
ON hub_favorites(user_id, content_type);

ALTER TABLE hub_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites"
ON hub_favorites FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
