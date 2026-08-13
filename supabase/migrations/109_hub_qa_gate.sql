-- ============================================================
-- Hub QA gate
--
-- Until now Julie Lynn's pre-publish QA was a convention, not a mechanism:
--   * the publish endpoint never read `status`, so 'pending_review' blocked nothing
--   * nothing recorded that a review had happened, so it could not be enforced
--     or audited after the fact
--   * any caller holding the sync key could publish directly
--
-- Result: 32 Quick Wins went live while their own status still read
-- 'pending_review', and 21 live items shipped with a lift value the UI cannot
-- render (case-sensitive match on LOW/MED/HIGH), which a real review catches.
--
-- This migration makes review a precondition of publishing, with a logged
-- break-glass so an agent outage can never fully block shipping.
-- ============================================================

BEGIN;

ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS reviewed_by        TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by       TEXT,
  ADD COLUMN IF NOT EXISTS qa_notes           TEXT,
  ADD COLUMN IF NOT EXISTS qa_override_reason TEXT;

COMMENT ON COLUMN hub_quick_wins.reviewed_by IS
  'Who passed QA. Set by content-sync action mark_reviewed. Null means never reviewed.';
COMMENT ON COLUMN hub_quick_wins.qa_override_reason IS
  'Non-null means this was published without passing QA (break-glass). Surfaced in the daily health alert.';

-- Everything already live predates the gate. Record that plainly rather than
-- leaving it ambiguous, so "never reviewed" means something going forward.
UPDATE hub_quick_wins
SET qa_override_reason = 'grandfathered: published before the QA gate existed (migration 109)'
WHERE is_published = true
  AND reviewed_by IS NULL
  AND qa_override_reason IS NULL;

CREATE OR REPLACE FUNCTION check_quick_win_tags()
RETURNS TRIGGER AS $$
DECLARE
  becoming_published BOOLEAN;
BEGIN
  -- `status` may never claim published while the item is dark.
  -- Normalizing keeps the admin honest without throwing at any caller.
  IF NEW.is_published IS DISTINCT FROM true AND NEW.status = 'published' THEN
    NEW.status := 'pending_review';
  END IF;

  IF NEW.is_published = true THEN

    -- Existing tag requirements.
    IF NEW.lift IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: lift is required (LOW, MED, or HIGH)';
    END IF;
    IF NEW.category IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: category is required';
    END IF;
    IF NEW.quick_win_type IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: quick_win_type is required';
    END IF;
    IF NEW.topic_tags IS NULL OR array_length(NEW.topic_tags, 1) IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: at least one topic_tag is required';
    END IF;
    IF NEW.roles IS NULL OR array_length(NEW.roles, 1) IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: at least one role is required';
    END IF;
    IF NEW.danielson_domains IS NULL OR array_length(NEW.danielson_domains, 1) IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: at least one danielson_domain is required';
    END IF;
    IF NEW.title IS NULL OR NEW.title = '' THEN
      RAISE EXCEPTION 'Cannot publish Quick Win: title is required';
    END IF;

    IF TG_OP = 'INSERT' THEN
      becoming_published := true;
    ELSE
      becoming_published := OLD.is_published IS DISTINCT FROM true;
    END IF;

    IF becoming_published THEN

      -- Asset requirements. Enforced on the transition only, so the ~120
      -- already-live items predating the two-download standard stay updatable.
      IF NEW.quick_win_type = 'download' THEN
        IF NEW.file_url IS NULL THEN
          RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a guide PDF (file_url)', NEW.title;
        END IF;
        IF NEW.tool_file_url IS NULL THEN
          RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a tool PDF (tool_file_url). Run generate_pdf with action generate_tool first.', NEW.title;
        END IF;
      END IF;

      -- Value-format requirements. These are what a human reviewer was catching
      -- and a field-presence check never will. The UI matches lift
      -- case-sensitively and filters domains on the four canonical values.
      IF NEW.lift NOT IN ('LOW', 'MED', 'HIGH') THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": lift must be exactly LOW, MED or HIGH (got "%"). The Hub matches case-sensitively and renders a blank badge otherwise.', NEW.title, NEW.lift;
      END IF;
      IF EXISTS (
        SELECT 1 FROM unnest(NEW.danielson_domains) d
        WHERE d NOT IN ('1-planning', '2-environment', '3-instruction', '4-professional')
      ) THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": danielson_domains must use the canonical values 1-planning, 2-environment, 3-instruction, 4-professional (got %)', NEW.title, NEW.danielson_domains;
      END IF;

      -- The QA gate itself. Normal path is status 'reviewed' immediately before
      -- publishing. Republishing something previously live is also allowed.
      -- Break-glass requires an explicit written reason, which the daily health
      -- check reports so a bypass is never silent.
      IF NEW.qa_override_reason IS NULL
         AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('reviewed', 'published')) THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": QA has not passed. Call content-sync action mark_reviewed first, or set qa_override_reason to publish without review.', NEW.title;
      END IF;

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
