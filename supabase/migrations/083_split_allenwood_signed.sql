-- Split Allenwood Elementary into two signed opportunities:
-- 1. Non-grant portion: $10,252.20 (grant_support = false)
-- 2. Grant-supported portion: $56,372.80 (grant_support = true, keeps original notes)

-- Update existing Allenwood row to be the grant-supported portion
UPDATE sales_opportunities
SET value = 56372.80,
    grant_support = true,
    name = '(RENEWAL) Allenwood Elementary - Grant Funded',
    updated_at = NOW()
WHERE name ILIKE '%allenwood%'
  AND stage = 'signed';

-- Insert the non-grant portion as a new row, copying contact info
INSERT INTO sales_opportunities (
  name, stage, value, probability, type, source,
  contact_name, contact_email,
  grant_support, notes, created_at, updated_at
)
SELECT
  '(RENEWAL) Allenwood Elementary - Non-Grant',
  'signed',
  10252.20,
  95,
  type,
  source,
  contact_name,
  contact_email,
  false,
  NULL,
  NOW(),
  NOW()
FROM sales_opportunities
WHERE name ILIKE '%allenwood%grant%funded%'
LIMIT 1;
