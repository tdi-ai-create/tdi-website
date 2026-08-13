-- ============================================================
-- Hub publish integrity
--
-- Problem: hub_quick_wins carries two publish fields, `status`
-- (text, workflow state for the admin/QA view) and `is_published`
-- (boolean). Every educator-facing query filters on is_published
-- only. The publish gate check_quick_win_tags() also fired only on
-- is_published = true. So writing status = 'published' directly made
-- the admin read "published" while the item stayed invisible to every
-- educator, with no error raised. Five quizzes sat in that state from
-- 2026-08-06 and the daily health cron misreported them as "drafts
-- stuck in the Paperclip pipeline" for a week.
--
-- This migration:
--   1. Repairs the divergent rows.
--   2. Makes the divergent state unrepresentable. It NORMALIZES rather
--      than raises, so no existing write path can begin failing.
--   3. Requires a guide PDF and a tool PDF for `download` items at the
--      moment they become published. Enforced only on the false -> true
--      transition, so the ~120 already-live items that predate the
--      two-download standard are not retroactively broken by ordinary
--      updates (translation, retagging, community seeding).
-- ============================================================

BEGIN;

-- 1. Repair. is_published is the source of truth, so these were never
--    live. Only `status` moves. is_published stays false, so the
--    auto_seed_community trigger (which fires on the false -> true
--    transition) does not run and no community posts are generated.
UPDATE hub_quick_wins
SET status = 'pending_review'
WHERE status = 'published'
  AND is_published IS DISTINCT FROM true;

-- 2 + 3. Replace the gate.
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

    -- Existing tag requirements. Unchanged.
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

    -- New: asset requirements for downloads, on the transition only.
    IF TG_OP = 'INSERT' THEN
      becoming_published := true;
    ELSE
      becoming_published := OLD.is_published IS DISTINCT FROM true;
    END IF;

    IF becoming_published AND NEW.quick_win_type = 'download' THEN
      IF NEW.file_url IS NULL THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a guide PDF (file_url)', NEW.title;
      END IF;
      IF NEW.tool_file_url IS NULL THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a tool PDF (tool_file_url). Run generate_pdf with action generate_tool first.', NEW.title;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
