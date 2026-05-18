-- Migration 060: email_log table for email-to-CRM sync (TEA-4049)
-- Stores Gmail metadata matched to sales opportunities.
-- body_plain is intentionally NULL until FERPA review clears (target June 12).

CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id TEXT NOT NULL UNIQUE,
  gmail_thread_id TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  subject TEXT,
  date TIMESTAMPTZ NOT NULL,
  snippet TEXT,
  body_plain TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  opportunity_id UUID REFERENCES sales_opportunities(id) ON DELETE SET NULL,
  matched_on TEXT CHECK (matched_on IN ('exact_email', 'thread_id')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_opportunity ON email_log(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_log_thread ON email_log(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_email_log_date ON email_log(date DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_from ON email_log(from_email);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_log_service_only ON email_log
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE email_log IS 'Gmail metadata synced to CRM opportunities. body_plain NULL until FERPA cleared.';
COMMENT ON COLUMN email_log.body_plain IS 'Reserved for post-FERPA. Must remain NULL until Sebastian clears compliance review.';
COMMENT ON COLUMN email_log.matched_on IS 'How this email was linked: exact_email (contact_email match) or thread_id (sibling in matched thread).';
