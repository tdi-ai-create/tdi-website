-- ============================================================
-- Migration: Funding Pursuits Phase A
-- Minimal schema to render the funding portal with real data
-- Phase B will add touchpoint automation, signoffs, validations
-- ============================================================

CREATE TABLE IF NOT EXISTS funding_pursuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_name TEXT NOT NULL,
  district_name TEXT NOT NULL,
  funder_label TEXT,
  funding_sources JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC NOT NULL,
  contract_year TEXT,
  current_phase TEXT NOT NULL CHECK (current_phase IN (
    'intake', 'researching', 'strategy', 'writing',
    'in_review', 'delivered', 'submitted',
    'awaiting_decision', 'awarded', 'denied', 'on_hold'
  )) DEFAULT 'intake',
  last_phase_change_at TIMESTAMPTZ DEFAULT NOW(),
  is_stalled BOOLEAN DEFAULT FALSE,
  operational_owner_email TEXT DEFAULT 'olivia@teachersdeserveit.com',
  strategy_owner_email TEXT DEFAULT 'vanessa@teachersdeserveit.com',
  drafting_owner_email TEXT,
  final_approver_email TEXT DEFAULT 'erin@teachersdeserveit.com',
  submission_deadline DATE,
  expected_decision_date DATE,
  eligibility_snapshot JSONB,
  next_action_label TEXT,
  next_action_owner_email TEXT,
  next_action_urgency TEXT CHECK (next_action_urgency IN ('urgent', 'warning', 'info')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_pursuits_phase ON funding_pursuits(current_phase);
CREATE INDEX IF NOT EXISTS idx_funding_pursuits_stalled ON funding_pursuits(is_stalled) WHERE is_stalled = TRUE;

CREATE TABLE IF NOT EXISTS funding_pursuit_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_id UUID REFERENCES funding_pursuits(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_title TEXT NOT NULL,
  event_detail TEXT,
  status TEXT CHECK (status IN ('complete', 'active', 'upcoming')) DEFAULT 'upcoming',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_pursuit ON funding_pursuit_timeline(pursuit_id, display_order);

CREATE TABLE IF NOT EXISTS funding_pursuit_touchpoints_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuit_id UUID REFERENCES funding_pursuits(id) ON DELETE CASCADE,
  scheduled_for DATE,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'sent', 'draft')) DEFAULT 'scheduled',
  meta_text TEXT,
  preview_body TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchpoints_v1_pursuit ON funding_pursuit_touchpoints_v1(pursuit_id, display_order);
