-- Quiz results: stores results from all personality/discovery quizzes
-- Each user can have one result per quiz type (retakes overwrite)
CREATE TABLE IF NOT EXISTS hub_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,            -- e.g. 'educator_type', 'superpower', 'growth_style', 'tech_comfort', 'classroom_needs', 'career_season'
  result_key TEXT NOT NULL,           -- e.g. 'connector', 'collaborator', 'deep_diver'
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_type)
);

CREATE INDEX idx_hub_quiz_results_user ON hub_quiz_results (user_id);
CREATE INDEX idx_hub_quiz_results_type ON hub_quiz_results (quiz_type);

ALTER TABLE hub_quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "Users can view own quiz results"
  ON hub_quiz_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert own quiz results"
  ON hub_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own results (retakes)
CREATE POLICY "Users can update own quiz results"
  ON hub_quiz_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on quiz results"
  ON hub_quiz_results FOR ALL
  USING (true) WITH CHECK (true);
