-- Migration 086: Link funding pursuits to partnerships + Plan A/B/C/D paths
-- Connects the Funding tab to the Leadership Dashboard

-- Link pursuits to partnerships
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL;

ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS sales_deal_id TEXT;

-- Plan A/B/C/D funding paths per pursuit
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS funding_paths JSONB DEFAULT '[]';
-- Structure: [{ plan: "A", label: "Title II-A", amount: 33225, status: "pursuing", deadline: "2026-07-15", contact: "...", notes: "..." }]

-- School profile data for grant applications
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS school_profile JSONB DEFAULT '{}';
-- Structure: { titleI: true, frlRate: 72, iepRate: 18, enrollment: 450, staffCount: 45, geographic: "suburban", ... }

-- Contract gap and buffer
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS contract_gap NUMERIC;
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS buffer_amount NUMERIC;

-- Implementation date (anchor for backward timeline)
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS implementation_date DATE;

-- Track submission status per path
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS paths_submitted INTEGER DEFAULT 0;
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS paths_awarded INTEGER DEFAULT 0;
ALTER TABLE funding_pursuits
ADD COLUMN IF NOT EXISTS total_awarded NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_funding_pursuits_partnership ON funding_pursuits(partnership_id);

COMMENT ON COLUMN funding_pursuits.partnership_id IS 'Links to the partnership this grant work supports';
COMMENT ON COLUMN funding_pursuits.funding_paths IS 'Plan A/B/C/D paths as JSONB array with status tracking per path';
COMMENT ON COLUMN funding_pursuits.school_profile IS 'School eligibility data used for grant applications';
COMMENT ON COLUMN funding_pursuits.contract_gap IS 'The dollar gap between what school committed and full partnership cost';
COMMENT ON COLUMN funding_pursuits.implementation_date IS 'Anchor date for working-backward timeline';
