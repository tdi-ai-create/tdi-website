-- ============================================================
-- Migration 059: Sales CRM CCP-B
-- Enum documentation, decision_role cleanup, audit log expansion,
-- lead classification view (placeholder pending Jim's logic)
-- ============================================================
-- Parent ticket: TEA-3731

-- ============================================================
-- SECTION 1: Schema documentation via COMMENT ON
-- Documents all check constraint enum values for CRM tables
-- so agents and tooling can introspect without pg_constraint queries
-- ============================================================

COMMENT ON COLUMN districts.segment IS
  'Allowed: district, single_school, charter_network';

COMMENT ON COLUMN districts.status IS
  'Allowed: prospect, active, churned, pilot';

COMMENT ON COLUMN sales_opportunities.type IS
  'Allowed: new_business, renewal, upsell, reactivation, pilot, expansion';

COMMENT ON COLUMN sales_opportunities.stage IS
  'Allowed: unassigned, targeting, engaged, qualified, likely_yes, proposal_sent, signed, paid, lost';

COMMENT ON COLUMN sales_opportunities.heat IS
  'Allowed: hot, warm, cold (nullable)';

COMMENT ON COLUMN sales_opportunities.partnership_status IS
  'Allowed: active, inactive, pending, churned (nullable). Used in lead classification derivation.';

COMMENT ON COLUMN sales_contacts.decision_role IS
  'Allowed: decision_maker, influencer, champion, evaluator, blocker, nominator, referrer (nullable)';

-- ============================================================
-- SECTION 2: decision_role constraint cleanup (GAP 7)
-- Drop the old undocumented constraint, add new one with
-- nominator and referrer included
-- ============================================================

DO $$
BEGIN
  -- Drop existing check constraint on decision_role if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'sales_contacts'
      AND column_name = 'decision_role'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE sales_contacts DROP CONSTRAINT ' || constraint_name
      FROM information_schema.constraint_column_usage
      WHERE table_name = 'sales_contacts'
        AND column_name = 'decision_role'
      LIMIT 1
    );
  END IF;
END $$;

ALTER TABLE sales_contacts
  ADD CONSTRAINT sales_contacts_decision_role_check
  CHECK (decision_role IS NULL OR decision_role IN (
    'decision_maker', 'influencer', 'champion',
    'evaluator', 'blocker', 'nominator', 'referrer'
  ));

-- ============================================================
-- SECTION 3: Audit log expansion (GAP 5)
-- Make opportunity_activity support contact-level events
-- by adding target_type discriminator and optional contact_id
-- ============================================================

ALTER TABLE opportunity_activity
  ALTER COLUMN opportunity_id DROP NOT NULL;

ALTER TABLE opportunity_activity
  ADD COLUMN IF NOT EXISTS target_type TEXT
    DEFAULT 'opportunity'
    CHECK (target_type IN ('opportunity', 'contact'));

ALTER TABLE opportunity_activity
  ADD COLUMN IF NOT EXISTS contact_id UUID
    REFERENCES district_contacts(id) ON DELETE SET NULL;

COMMENT ON TABLE opportunity_activity IS
  'Unified activity/audit log. target_type discriminates between opportunity-scoped and contact-scoped events. One of opportunity_id or contact_id must be non-null.';

ALTER TABLE opportunity_activity
  ADD CONSTRAINT opportunity_activity_target_check
  CHECK (opportunity_id IS NOT NULL OR contact_id IS NOT NULL);

-- ============================================================
-- SECTION 4: Lead classification view (GAP 1)
-- Placeholder logic pending Jim's confirmed SQL conditions.
-- See TEA-3731 for Jim's forthcoming 4-class derivation rules.
-- ============================================================

CREATE OR REPLACE VIEW v_lead_classification AS
SELECT
  id AS opportunity_id,
  name,
  type,
  stage,
  partnership_status,
  CASE
    WHEN partnership_status IN ('active') THEN 'current_client'
    WHEN stage IN ('unassigned', 'targeting') AND type = 'new_business' THEN 'targeting_area'
    WHEN needs_invoice = true OR (stage = 'signed' AND payment_received = false) THEN 'ar_collection'
    ELSE 'new_inquiry'
  END AS lead_class
FROM sales_opportunities
WHERE deleted_at IS NULL;

COMMENT ON VIEW v_lead_classification IS
  'Derived 4-class lead classification. PLACEHOLDER LOGIC — awaiting Jim''s confirmed derivation rules on TEA-3731. Classes: current_client, new_inquiry, targeting_area, ar_collection.';

-- ============================================================
-- SECTION 5: Canonical contact table design documentation
-- district_contacts is write target; sales_contacts is GHL staging
-- ============================================================

COMMENT ON TABLE district_contacts IS
  'CANONICAL contact table. All new contact writes target this table. sales_opportunities.primary_contact_id FKs here. Dedup-matched from sales_contacts after GHL imports.';

COMMENT ON TABLE sales_contacts IS
  'GHL import STAGING table only. New GHL imports land here, then a dedup sweep matches and merges into district_contacts. Not the source of truth for contact data.';
