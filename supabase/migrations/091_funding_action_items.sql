-- ============================================================
-- Migration 091: Funding Action Items
-- Tracks TDI prep tasks vs client submission tasks
-- ============================================================

CREATE TABLE IF NOT EXISTS funding_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_id UUID NOT NULL REFERENCES funding_pursuits(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES funding_opportunities(id) ON DELETE SET NULL,

  -- Who owns this action
  owner_type TEXT NOT NULL CHECK (owner_type IN ('tdi', 'client')),
  owner_email TEXT,
  owner_name TEXT,

  -- What needs to be done
  title TEXT NOT NULL,
  description TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'blocked', 'skipped')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,

  -- For client actions: what TDI prepared for them
  prepared_materials TEXT,
  prepared_document_url TEXT,

  -- Nudge tracking
  last_nudge_sent_at TIMESTAMPTZ,
  nudge_count INTEGER DEFAULT 0,

  -- Ordering and categorization
  sort_order INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('research', 'writing', 'submission', 'follow_up', 'approval', 'documentation')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_funding_action_items_pursuit ON funding_action_items(pursuit_id);
CREATE INDEX idx_funding_action_items_opportunity ON funding_action_items(opportunity_id);
CREATE INDEX idx_funding_action_items_owner_status ON funding_action_items(owner_type, status);
CREATE INDEX idx_funding_action_items_due ON funding_action_items(due_date) WHERE status NOT IN ('done', 'skipped');

-- RLS
ALTER TABLE funding_action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funding_action_items_auth" ON funding_action_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "funding_action_items_service" ON funding_action_items FOR ALL TO service_role USING (true) WITH CHECK (true);
