-- Leadership recommendations: principals can recommend tools to their team
CREATE TABLE IF NOT EXISTS hub_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL,
  recommender_email TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('quick_win', 'course')),
  resource_id UUID NOT NULL,
  resource_title TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_recommendations_partnership ON hub_recommendations (partnership_id);

ALTER TABLE hub_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON hub_recommendations
  FOR ALL USING (true) WITH CHECK (true);
