-- Migration 097: contract_deliverables
-- Breaks contract line items (JSONB in quote_packages) into individually trackable rows
-- with delivery status, invoicing lifecycle, and grant funding routing.
-- This table is the connective tissue between Sales (quotes), Delivery (partnerships),
-- and Finance (invoicing).

CREATE TABLE contract_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contract links
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  quote_package_id UUID NOT NULL REFERENCES quote_packages(id) ON DELETE CASCADE,
  partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,

  -- Service details (from line item)
  line_item_index INTEGER NOT NULL,
  label TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'observation', 'virtual_session', 'executive_session',
    'hub_membership', 'book', 'pd_day', 'custom'
  )),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  is_complimentary BOOLEAN DEFAULT FALSE,

  -- Funding routing
  funding_type TEXT NOT NULL CHECK (funding_type IN (
    'direct', 'grant_pending', 'grant_confirmed'
  )) DEFAULT 'direct',
  funding_pursuit_id UUID REFERENCES funding_pursuits(id) ON DELETE SET NULL,
  funding_opportunity_id UUID,

  -- Delivery lifecycle
  delivery_status TEXT NOT NULL CHECK (delivery_status IN (
    'pending', 'pending_funding', 'scheduled', 'delivered',
    'invoiced', 'paid', 'cancelled'
  )) DEFAULT 'pending',
  delivery_date DATE,
  delivered_by TEXT,
  delivery_notes TEXT,
  session_record_id UUID,

  -- Invoice link
  invoice_id UUID,
  invoice_type TEXT CHECK (invoice_type IN ('quote_invoice', 'intelligence_invoice')),
  invoiced_at TIMESTAMPTZ,

  -- Sequence tracking ("Observation 1 of 2")
  sequence_number INTEGER,
  sequence_total INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_deliverables_quote ON contract_deliverables(quote_id);
CREATE INDEX idx_deliverables_partnership ON contract_deliverables(partnership_id, delivery_status);
CREATE INDEX idx_deliverables_status ON contract_deliverables(delivery_status);
CREATE INDEX idx_deliverables_funding ON contract_deliverables(funding_type, delivery_status);
CREATE INDEX idx_deliverables_invoice_ready ON contract_deliverables(delivery_status)
  WHERE delivery_status = 'delivered' AND invoice_id IS NULL AND is_complimentary = FALSE;

-- Enable RLS
ALTER TABLE contract_deliverables ENABLE ROW LEVEL SECURITY;

-- Admin access policy
CREATE POLICY "Admin full access on contract_deliverables"
  ON contract_deliverables FOR ALL
  USING (true)
  WITH CHECK (true);
