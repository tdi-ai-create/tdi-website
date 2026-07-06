-- Creator Email Log
-- Centralized log of every email sent to or about creators.
-- Powers the admin email activity feed and Bella's weekly digest.

CREATE TABLE IF NOT EXISTS creator_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  creator_name TEXT,
  creator_email TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('to_creator', 'to_admin')),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  step INT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by TEXT NOT NULL DEFAULT 'system',
  metadata JSONB
);

-- Index for dashboard: recent emails sorted by time
CREATE INDEX idx_email_log_sent_at ON creator_email_log(sent_at DESC);

-- Index for per-creator history
CREATE INDEX idx_email_log_creator ON creator_email_log(creator_id, sent_at DESC);

-- Index for weekly digest: emails in a date range
CREATE INDEX idx_email_log_category ON creator_email_log(category, sent_at DESC);

-- Enable RLS
ALTER TABLE creator_email_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access (service role bypasses RLS)
CREATE POLICY "Admin access to email log"
  ON creator_email_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
