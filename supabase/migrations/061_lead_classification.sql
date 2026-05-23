-- ============================================================
-- Migration: Lead Classification
-- Classifies 26-27 opps as current_client, new_inquiry, or targeting_area
-- ============================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS lead_classification TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_lead_classification
  ON sales_opportunities(lead_classification);

-- Classify based on source + type fields
UPDATE sales_opportunities
SET lead_classification = CASE
  -- Current Client: renewal type or source indicates existing relationship
  WHEN type = 'renewal' THEN 'current_client'
  WHEN source ILIKE '%renewal%' THEN 'current_client'
  WHEN source ILIKE '%existing%' THEN 'current_client'

  -- New Inquiry: inbound sources
  WHEN source IN (
    'PD Plan Request (website)', 'PD Plan Request',
    'Direct inquiry form', 'Direct inquiry',
    'Nomination form', 'Podcast guest',
    'PD Eval form (social)'
  ) THEN 'new_inquiry'
  WHEN source ILIKE 'Referral%' THEN 'new_inquiry'

  -- Targeting Area: outbound sources
  WHEN source ILIKE '%Jim%Call Sheet%' THEN 'targeting_area'
  WHEN source ILIKE '%Direct outreach%' THEN 'targeting_area'
  WHEN source ILIKE '%Cold call%' THEN 'targeting_area'
  WHEN source ILIKE '%Outreach%' THEN 'targeting_area'
  WHEN source = 'Network' THEN 'targeting_area'
  WHEN source = 'LinkedIn' THEN 'targeting_area'

  -- Default: targeting_area
  ELSE 'targeting_area'
END
WHERE deleted_at IS NULL
  AND school_year = '2026-27';

-- Verification
SELECT
  lead_classification,
  COUNT(*) AS deal_count,
  SUM(value) AS total_value
FROM sales_opportunities
WHERE deleted_at IS NULL
  AND school_year = '2026-27'
GROUP BY lead_classification
ORDER BY total_value DESC;
