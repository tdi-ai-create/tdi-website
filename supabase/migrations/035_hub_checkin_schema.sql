-- Extend hub_assessments to support 20 check-in question variants
ALTER TABLE hub_assessments
ADD COLUMN IF NOT EXISTS question_id text,
ADD COLUMN IF NOT EXISTS question_category text CHECK (
  question_category IN ('mood', 'energy', 'belonging', 'purpose', 'needs')
),
ADD COLUMN IF NOT EXISTS response_type text CHECK (
  response_type IN ('color_scale', 'emoji_tap', 'word_cloud', 'fill_blank', 'two_choice', 'number_scale')
),
ADD COLUMN IF NOT EXISTS response_text text,
ADD COLUMN IF NOT EXISTS response_words text[];

-- Index for querying by category and user
CREATE INDEX IF NOT EXISTS idx_hub_assessments_category
ON hub_assessments(user_id, question_category, created_at);

-- Index for querying latest check-in per user
CREATE INDEX IF NOT EXISTS idx_hub_assessments_user_date
ON hub_assessments(user_id, created_at DESC);
