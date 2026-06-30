-- ============================================================
-- Migration 093: Enhance funding_opportunities
-- Add application windows, waiting_on, narrative tracking,
-- client submission tracking, and stale detection
-- ============================================================

-- Application window dates
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS application_opens DATE;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS application_closes DATE;

-- Plan categorization (A = federal formula, B = state/local, C = foundation/corporate, D = direct/crowdfunding)
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS plan_category TEXT CHECK (plan_category IN ('A', 'B', 'C', 'D'));

-- Who is the ball in court with?
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS waiting_on TEXT DEFAULT 'tdi' CHECK (waiting_on IN ('tdi', 'client', 'funder', 'none'));

-- Narrative / prep status
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS narrative_status TEXT DEFAULT 'not_started' CHECK (narrative_status IN ('not_started', 'drafting', 'review', 'ready'));
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS narrative_url TEXT;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS forwarding_email_status TEXT DEFAULT 'not_started' CHECK (forwarding_email_status IN ('not_started', 'drafted', 'sent'));

-- Client submission tracking
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS client_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS client_submitted_at TIMESTAMPTZ;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS client_submitted_proof TEXT;

-- Activity and stale detection
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Decision tracking
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS decision_date DATE;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS awarded_amount NUMERIC;
ALTER TABLE funding_opportunities ADD COLUMN IF NOT EXISTS denial_reason TEXT;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_funding_opps_waiting ON funding_opportunities(waiting_on) WHERE status NOT IN ('awarded', 'denied');
CREATE INDEX IF NOT EXISTS idx_funding_opps_deadline ON funding_opportunities(application_closes) WHERE application_closes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_funding_opps_activity ON funding_opportunities(last_activity_at);
