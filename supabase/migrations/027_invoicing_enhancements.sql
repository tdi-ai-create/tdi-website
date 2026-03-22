-- ============================================================
-- Migration 027: Invoicing System Enhancements
-- Payment terms, schedules, due dates, and scope expansion
-- ============================================================

-- 1. Add payment_terms and payment_schedule to contracts
ALTER TABLE intelligence_contracts
  ADD COLUMN IF NOT EXISTS payment_terms TEXT CHECK (payment_terms IN ('net_15', 'net_30', 'net_45', 'net_60', 'upfront', 'split')),
  ADD COLUMN IF NOT EXISTS payment_schedule TEXT CHECK (payment_schedule IN ('annual', 'semester', 'monthly', 'custom')),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add due_date to invoices
ALTER TABLE intelligence_invoices
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- 3. Add payment_method and check_number to payment_events for tracking payments
ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'other')),
  ADD COLUMN IF NOT EXISTS check_number TEXT,
  ADD COLUMN IF NOT EXISTS amount_received NUMERIC(10,2);

-- Comment: scope_json already exists and is flexible JSONB,
-- so hub_memberships and books can be added without schema changes

-- Index for due_date queries
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON intelligence_invoices(due_date);

-- ============================================================
-- Seed Data: Roosevelt School pilot contract and invoice
-- ============================================================

DO $$
DECLARE
  r_district_id UUID;
  r_contract_id UUID;
  r_invoice_id UUID;
BEGIN
  -- Get Roosevelt district ID
  SELECT id INTO r_district_id FROM districts WHERE name LIKE '%Roosevelt%' LIMIT 1;

  IF r_district_id IS NOT NULL THEN
    -- Check if contract already exists
    IF NOT EXISTS (
      SELECT 1 FROM intelligence_contracts
      WHERE district_id = r_district_id AND contract_name = '2026 Hub-Only Pilot'
    ) THEN
      -- Create contract
      INSERT INTO intelligence_contracts (
        district_id, contract_name, start_date, end_date,
        total_value, status, payment_terms, payment_schedule, scope_json
      ) VALUES (
        r_district_id,
        '2026 Hub-Only Pilot',
        '2026-04-01',
        '2026-06-30',
        1900.00,
        'active',
        'net_30',
        'annual',
        '{"hub_memberships": 19}'
      ) RETURNING id INTO r_contract_id;

      -- Create invoice
      INSERT INTO intelligence_invoices (
        district_id, contract_id, invoice_number,
        invoice_date, due_date, amount, status,
        service_start_date, service_end_date
      ) VALUES (
        r_district_id,
        r_contract_id,
        'TDI-2026-001',
        '2026-03-22',
        '2026-04-22',
        1900.00,
        'sent',
        '2026-04-01',
        '2026-06-30'
      ) RETURNING id INTO r_invoice_id;

      -- Create collections workflow
      INSERT INTO collections_workflow (
        invoice_id, current_stage, risk_flag
      ) VALUES (
        r_invoice_id, 'submitted', 'none'
      );
    END IF;
  END IF;
END $$;
