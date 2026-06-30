-- ============================================================
-- Migration 092: Funding Email Log
-- Tracks every email drafted or sent for funding communications
-- ============================================================

CREATE TABLE IF NOT EXISTS funding_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_id UUID NOT NULL REFERENCES funding_pursuits(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES funding_opportunities(id) ON DELETE SET NULL,

  -- Email details
  template_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT DEFAULT 'rae@teachersdeserveit.com',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  resend_id TEXT,

  -- Metadata
  sent_by TEXT,
  email_type TEXT CHECK (email_type IN ('nudge', 'submission_instructions', 'deadline_reminder', 'status_update', 'follow_up', 'custom')),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_funding_email_log_pursuit ON funding_email_log(pursuit_id);
CREATE INDEX idx_funding_email_log_status ON funding_email_log(status);
CREATE INDEX idx_funding_email_log_opportunity ON funding_email_log(opportunity_id);

-- RLS
ALTER TABLE funding_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funding_email_log_auth" ON funding_email_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "funding_email_log_service" ON funding_email_log FOR ALL TO service_role USING (true) WITH CHECK (true);
