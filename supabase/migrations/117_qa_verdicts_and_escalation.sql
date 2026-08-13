-- Automated QA verdicts, and escalation that arrives with choices
--
-- Two new narrative states, both with a named owner and a real exit:
--   approval   Julie passed it. Bella reads and approves. (Was qa_review +
--              qa_passed = true, which meant ownership took two columns to
--              work out and two screens disagreed about the answer.)
--   escalated  Julie failed it twice. Bella decides, from a short list of
--              concrete options, with Julie's diagnosis attached.
--
-- Constraints are WIDENED here, ahead of any code that writes the new values.
-- Widening is safe against currently-deployed code; narrowing never is.
--
-- 'gate' also joins the action item categories — lib/funding-gate-sync.ts
-- creates client action items under it.

ALTER TABLE funding_opportunities
  DROP CONSTRAINT IF EXISTS funding_opportunities_narrative_status_check;

ALTER TABLE funding_opportunities
  ADD CONSTRAINT funding_opportunities_narrative_status_check
  CHECK (narrative_status = ANY (ARRAY[
    'not_started', 'requested', 'drafting', 'review',
    'qa_review', 'approval', 'escalated', 'ready'
  ]));

ALTER TABLE funding_action_items
  DROP CONSTRAINT IF EXISTS funding_action_items_category_check;

ALTER TABLE funding_action_items
  ADD CONSTRAINT funding_action_items_category_check
  CHECK (category = ANY (ARRAY[
    'research', 'writing', 'submission', 'follow_up',
    'approval', 'documentation', 'gate'
  ]));

-- How many times QA has failed this narrative. Drives the escalation bound.
ALTER TABLE funding_opportunities
  ADD COLUMN IF NOT EXISTS qa_attempt_count INTEGER NOT NULL DEFAULT 0;

-- Julie's diagnosis and recommendation when a narrative escalates.
-- Shape: { summary, root_cause, recommended_option, recommendation_reason,
--          detail, escalated_at }
ALTER TABLE funding_opportunities
  ADD COLUMN IF NOT EXISTS qa_escalation JSONB;

-- Direction Bella gave when sending a narrative back for another attempt.
ALTER TABLE funding_opportunities
  ADD COLUMN IF NOT EXISTS redraft_guidance TEXT;

-- Full QA history. One row per verdict, so a narrative that failed twice can
-- show Bella what changed between attempts rather than only the last word.
CREATE TABLE IF NOT EXISTS funding_narrative_qa_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES funding_opportunities(id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  reviewer TEXT NOT NULL,
  score INTEGER,
  summary TEXT,
  issues JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_reviews_opportunity
  ON funding_narrative_qa_reviews (opportunity_id, attempt);

COMMENT ON COLUMN funding_opportunities.qa_escalation IS
  'Julie''s diagnosis when a narrative fails twice. Always includes a recommended option so Bella chooses between concrete paths rather than facing an open problem.';
