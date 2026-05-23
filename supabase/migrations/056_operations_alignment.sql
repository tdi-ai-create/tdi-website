-- ============================================================
-- Migration: Operations Alignment
-- Adds partnership_status and relationship_signal for Operations view
-- ============================================================

-- Partnership lifecycle status
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS partnership_status TEXT
    CHECK (partnership_status IN ('prospect', 'pilot_active', 'contracted_active',
                                   'delivery_in_progress', 'completed', 'churned'));

-- Relationship signal extracted from notes
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS relationship_signal TEXT;

-- Backfill partnership_status based on stage
UPDATE sales_opportunities
SET partnership_status = CASE
  WHEN stage = 'paid' THEN 'completed'
  WHEN stage = 'signed' AND notes ILIKE '%pilot%' THEN 'pilot_active'
  WHEN stage = 'signed' THEN 'contracted_active'
  WHEN stage = 'lost' THEN 'churned'
  WHEN stage IN ('proposal_sent', 'likely_yes', 'qualified', 'engaged', 'targeting') THEN 'prospect'
  ELSE NULL
END;

-- Backfill relationship_signal from notes patterns
UPDATE sales_opportunities
SET relationship_signal = CASE
  WHEN notes ILIKE '%resigned%' OR notes ILIKE '%no longer%' THEN 'contact_changed'
  WHEN notes ILIKE '%ghosted%' OR (notes ILIKE '%no response%' AND last_activity_at < NOW() - INTERVAL '14 days') THEN 'no_response'
  WHEN notes ILIKE '%meeting LOCKED%' OR notes ILIKE '%meeting scheduled%' THEN 'meeting_scheduled'
  WHEN notes ILIKE '%signed%' AND stage = 'signed' THEN 'recently_signed'
  ELSE NULL
END;

-- Verify
SELECT partnership_status, COUNT(*) FROM sales_opportunities GROUP BY partnership_status;
SELECT relationship_signal, COUNT(*) FROM sales_opportunities WHERE relationship_signal IS NOT NULL GROUP BY relationship_signal;
