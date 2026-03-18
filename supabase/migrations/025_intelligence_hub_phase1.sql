-- ============================================================
-- Migration 025: Intelligence Hub Phase 1
-- Districts, Contracts, Invoices, Collections, Tasks
-- ============================================================

-- 1. Districts
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  segment TEXT CHECK (segment IN ('district', 'single_school', 'charter_network')) DEFAULT 'district',
  status TEXT CHECK (status IN ('prospect', 'active', 'churned', 'pilot')) DEFAULT 'prospect',
  primary_owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. District Contacts
CREATE TABLE IF NOT EXISTS district_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contracts
CREATE TABLE IF NOT EXISTS intelligence_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  total_value NUMERIC(10,2),
  scope_json JSONB DEFAULT '{}',
  renewal_deadline_date DATE,
  signed_doc_url TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'expired', 'renewed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices
CREATE TABLE IF NOT EXISTS intelligence_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES intelligence_contracts(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE,
  service_start_date DATE,
  service_end_date DATE,
  service_date_exact DATE,
  amount NUMERIC(10,2),
  status TEXT CHECK (status IN ('draft', 'sent', 'approved', 'paid', 'void', 'overdue')) DEFAULT 'draft',
  ap_requirements_json JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Collections Workflow
CREATE TABLE IF NOT EXISTS collections_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES intelligence_invoices(id) ON DELETE CASCADE,
  current_stage TEXT CHECK (current_stage IN (
    'submitted', 'ap_review', 'board_approval_pending', 'check_issued',
    'stop_payment', 'reissue', 'pickup_scheduled', 'paid'
  )) DEFAULT 'submitted',
  board_meeting_date DATE,
  check_issue_date DATE,
  expected_payment_date DATE,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  escalation_owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  escalation_path_json JSONB DEFAULT '{}',
  risk_flag TEXT CHECK (risk_flag IN ('none', 'at_risk', 'critical')) DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment Events (invoice timeline)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES intelligence_invoices(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN (
    'email_sent', 'call_made', 'voicemail', 'board_approval',
    'check_reissued', 'check_received', 'paid', 'note', 'escalated'
  )) NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT,
  artifact_url TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Intelligence Tasks
CREATE TABLE IF NOT EXISTS intelligence_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  related_type TEXT CHECK (related_type IN ('district', 'contract', 'invoice', 'internal')),
  related_id UUID,
  title TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('open', 'doing', 'done')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'med', 'high')) DEFAULT 'med',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_district_contacts_district ON district_contacts(district_id);
CREATE INDEX IF NOT EXISTS idx_contracts_district ON intelligence_contracts(district_id);
CREATE INDEX IF NOT EXISTS idx_invoices_district ON intelligence_invoices(district_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON intelligence_invoices(status);
CREATE INDEX IF NOT EXISTS idx_collections_invoice ON collections_workflow(invoice_id);
CREATE INDEX IF NOT EXISTS idx_collections_risk ON collections_workflow(risk_flag);
CREATE INDEX IF NOT EXISTS idx_payment_events_invoice ON payment_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tasks_district ON intelligence_tasks(district_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON intelligence_tasks(status);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_districts_updated BEFORE UPDATE ON districts
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON intelligence_contracts
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON intelligence_invoices
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();
CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON collections_workflow
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON intelligence_tasks
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();

-- RLS: admin_users from existing TDI auth system
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: only authenticated admin users (mirrors existing admin_users pattern)
CREATE POLICY "admin_full_access_districts" ON districts
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_contacts" ON district_contacts
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_contracts" ON intelligence_contracts
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_invoices" ON intelligence_invoices
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_collections" ON collections_workflow
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_payment_events" ON payment_events
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "admin_full_access_tasks" ON intelligence_tasks
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Seed: 3 example districts so the UI is not empty on first load
INSERT INTO districts (name, state, segment, status, notes) VALUES
  ('WEGO Community USD 94', 'IL', 'district', 'active', 'Long-term partner. Multiple buildings. Contact: Juan Suarez.'),
  ('Addison School District 4', 'IL', 'district', 'active', 'Contact: Janet Diaz. Renewal conversation Q3 2026.'),
  ('Roosevelt School - Lodi NJ', 'NJ', 'single_school', 'pilot', 'Hub-only pilot April-June 2026. Contact: Jack Lipari.');
