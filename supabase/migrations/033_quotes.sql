-- ============================================================
-- Migration 033: Quotes, Quote Packages, Quote Invoices
-- Replaces Anchor for TDI quote + invoice workflow
-- Quotes = client-facing signing flow
-- Invoices = created after signing, multiple per quote
-- ============================================================

-- QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES intelligence_contracts(id) ON DELETE SET NULL,

  quote_number TEXT NOT NULL,        -- TDI-Q-2026-001
  title TEXT NOT NULL,
  intro_message TEXT,                -- "Hi Paula, as discussed..."
  video_url TEXT,                    -- YouTube embed URL
  service_start_date DATE,
  service_end_date DATE,
  payment_instructions TEXT,
  terms_of_service TEXT,             -- TDI's ToS text
  po_required BOOLEAN DEFAULT FALSE,

  -- Contact info (auto-filled from district_contacts)
  contact_name TEXT,
  contact_email TEXT,
  contact_organization TEXT,

  -- Status flow
  status TEXT CHECK (status IN (
    'draft', 'sent', 'viewed', 'signed', 'declined', 'expired'
  )) DEFAULT 'draft',

  -- Expiry tracking
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,            -- sent_at + 30 days
  expiry_reset_at TIMESTAMPTZ,       -- last time admin reset the timer
  at_risk_flagged_at TIMESTAMPTZ,    -- when 14-day flag was set
  reminder_14_sent_at TIMESTAMPTZ,
  reminder_21_sent_at TIMESTAMPTZ,
  expiry_notice_sent_at TIMESTAMPTZ,

  -- View tracking
  viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,

  -- Signature (populated when client signs - CCP B)
  selected_package_index INTEGER,
  signed_by_name TEXT,
  signed_by_email TEXT,
  signed_at TIMESTAMPTZ,
  signature_typed TEXT,
  signature_drawn TEXT,              -- base64

  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTE PACKAGES (1-3 per quote)
CREATE TABLE IF NOT EXISTS quote_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  package_index INTEGER NOT NULL,    -- 0, 1, 2
  package_name TEXT NOT NULL,        -- IGNITE, ACCELERATE, SUSTAIN
  description TEXT,
  line_items JSONB DEFAULT '[]',     -- [{label, quantity, unit_price, total, is_complimentary}]
  total_amount NUMERIC(10,2),
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTE INVOICES (created after signing - CCP C)
-- Multiple invoices can be created from one signed quote
-- Each invoice covers a subset of the quote line items
CREATE TABLE IF NOT EXISTS quote_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,      -- TDI-INV-2026-001
  title TEXT NOT NULL,               -- e.g. "Observation Day 1 - September"
  line_items JSONB DEFAULT '[]',     -- subset of quote line items selected for this invoice
  amount NUMERIC(10,2),
  status TEXT CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid', 'overdue', 'void'
  )) DEFAULT 'draft',
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_district ON quotes(district_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_expires ON quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_quote_packages_quote ON quote_packages(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_invoices_quote ON quote_invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_invoices_district ON quote_invoices(district_id);

CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();

CREATE TRIGGER trg_quote_invoices_updated BEFORE UPDATE ON quote_invoices
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_invoices ENABLE ROW LEVEL SECURITY;

-- Public read for sent/viewed/signed quotes (client access by UUID)
CREATE POLICY "public_read_active_quotes" ON quotes
  FOR SELECT USING (status IN ('sent', 'viewed', 'signed', 'declined', 'expired'));

CREATE POLICY "public_read_active_packages" ON quote_packages
  FOR SELECT USING (
    quote_id IN (SELECT id FROM quotes WHERE status IN ('sent', 'viewed', 'signed', 'declined', 'expired'))
  );

-- Admin full access
CREATE POLICY "admin_full_access_quotes" ON quotes
  FOR ALL USING (auth.email() IN (SELECT email FROM admin_users));

CREATE POLICY "admin_full_access_packages" ON quote_packages
  FOR ALL USING (auth.email() IN (SELECT email FROM admin_users));

CREATE POLICY "admin_full_access_quote_invoices" ON quote_invoices
  FOR ALL USING (auth.email() IN (SELECT email FROM admin_users));
