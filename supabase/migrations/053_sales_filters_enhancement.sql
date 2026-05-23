-- ============================================================
-- Migration: Sales Filters Enhancement
-- Adds heat field for engagement temperature tracking
-- ============================================================

-- Add heat column with sensible default
ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS heat TEXT DEFAULT 'warm'
  CHECK (heat IN ('hot', 'warm', 'cold', 'parked'));

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_heat ON sales_opportunities(heat)
  WHERE stage NOT IN ('lost', 'paid');

-- Backfill heat based on last_activity_at + stage
-- Logic:
--   - signed/proposal_sent OR last activity within 7 days → hot
--   - last activity within 30 days → warm (default already)
--   - last activity 30-90 days ago → cold
--   - last activity 90+ days ago OR notes contain 'park' → parked

UPDATE sales_opportunities
SET heat = 'hot'
WHERE stage IN ('signed', 'proposal_sent', 'likely_yes')
   OR last_activity_at >= NOW() - INTERVAL '7 days';

UPDATE sales_opportunities
SET heat = 'cold'
WHERE last_activity_at < NOW() - INTERVAL '30 days'
  AND last_activity_at >= NOW() - INTERVAL '90 days'
  AND stage NOT IN ('signed', 'proposal_sent', 'likely_yes', 'lost', 'paid');

UPDATE sales_opportunities
SET heat = 'parked'
WHERE (last_activity_at < NOW() - INTERVAL '90 days'
       OR (notes ILIKE '%park%' AND notes NOT ILIKE '%park ave%'))
  AND stage NOT IN ('signed', 'proposal_sent', 'likely_yes', 'lost', 'paid');

-- Verify backfill
SELECT heat, COUNT(*) FROM sales_opportunities
WHERE stage NOT IN ('lost', 'paid')
GROUP BY heat;
