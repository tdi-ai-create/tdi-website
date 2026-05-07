-- ============================================================
-- Migration: School Year Separation
-- Splits pipeline by school year, adds invoice tracking fields
-- ============================================================

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS school_year TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_opportunities_school_year
  ON sales_opportunities(school_year);

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT FALSE;

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMPTZ;

ALTER TABLE sales_opportunities
  ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ;

-- Backfill: default everything to current selling year
UPDATE sales_opportunities
SET school_year = '2026-27'
WHERE school_year IS NULL
  AND deleted_at IS NULL;

-- Flag known 25-26 deals
UPDATE sales_opportunities
SET school_year = '2025-26'
WHERE name ILIKE '%Allenwood%'
  AND value < 20000
  AND deleted_at IS NULL;

-- Verification
SELECT
  school_year,
  COUNT(*) AS deal_count,
  SUM(value) AS total_value
FROM sales_opportunities
WHERE deleted_at IS NULL
GROUP BY school_year
ORDER BY school_year;
