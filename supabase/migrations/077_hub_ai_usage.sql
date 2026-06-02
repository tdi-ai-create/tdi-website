-- Track AI API usage across all Anthropic-powered features
-- Enables cost monitoring, per-user usage limits, and budget alerts

CREATE TABLE IF NOT EXISTS hub_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                          -- NULL for admin/system calls
  endpoint TEXT NOT NULL,                 -- 'desi', 'insights', 'achievements', 'lead_enrich', 'meeting_eval', 'leadership_extract'
  model TEXT NOT NULL,                    -- 'claude-sonnet-4-20250514' etc
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_cents NUMERIC(10,4) NOT NULL DEFAULT 0, -- estimated cost in cents
  metadata JSONB DEFAULT '{}',           -- extra context (tool_use_rounds, tab_type, etc)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_hub_ai_usage_created_at ON hub_ai_usage (created_at DESC);
CREATE INDEX idx_hub_ai_usage_endpoint ON hub_ai_usage (endpoint);
CREATE INDEX idx_hub_ai_usage_user_id ON hub_ai_usage (user_id) WHERE user_id IS NOT NULL;

-- Daily rollup view for dashboard
CREATE OR REPLACE VIEW hub_ai_usage_daily AS
SELECT
  DATE(created_at) as day,
  endpoint,
  COUNT(*) as call_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(input_tokens + output_tokens) as total_tokens,
  SUM(cost_cents) as total_cost_cents,
  COUNT(DISTINCT user_id) as unique_users
FROM hub_ai_usage
GROUP BY DATE(created_at), endpoint
ORDER BY day DESC, endpoint;

-- Enable RLS
ALTER TABLE hub_ai_usage ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (API routes use service key)
-- Admin users can read via admin portal
CREATE POLICY "Service role full access" ON hub_ai_usage
  FOR ALL USING (true) WITH CHECK (true);
