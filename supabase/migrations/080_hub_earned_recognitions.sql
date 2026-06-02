-- Persistent tracking of when recognitions are earned
-- Lets us detect "new" recognitions and trigger celebrations

CREATE TABLE IF NOT EXISTS hub_earned_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recognition_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_at TIMESTAMPTZ,  -- NULL until user dismisses the celebration
  UNIQUE(user_id, recognition_type)
);

CREATE INDEX idx_hub_earned_recognitions_user ON hub_earned_recognitions (user_id);
CREATE INDEX idx_hub_earned_recognitions_unseen ON hub_earned_recognitions (user_id) WHERE seen_at IS NULL;

-- RLS
ALTER TABLE hub_earned_recognitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own recognitions" ON hub_earned_recognitions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON hub_earned_recognitions
  FOR ALL USING (true) WITH CHECK (true);
