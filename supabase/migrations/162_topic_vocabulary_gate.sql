-- ============================================================
-- Refuse a topic tag that is not in the approved vocabulary.
--
-- The tagging spec has required "a tag from the approved list" since it was
-- written. The published library carries roughly 300 distinct values against an
-- approved 22, with near duplicates splitting the same idea: team-building and
-- team building, staff-meeting and staff meetings.
--
-- The mechanical cause was found on 27 September 2026. Three agents were told
-- to tag from a list at quick-win-tagging/SKILL.md, and that file does not
-- exist anywhere on the Paperclip volume. The agent writing the tags and the
-- agent checking them had both been told to follow a list neither could read.
--
-- It matters beyond tidiness now that tags carry weight. The Working Together
-- shelf is a tag. Hub search expands through a vocabulary keyed on tags, which
-- is why a Self-Care tool tagged ell currently surfaces on a search for ESL.
--
-- SCOPE, deliberately narrow. This fires only when an item is BECOMING
-- published. The existing values are untouched and backfill_published still
-- repairs live rows, because cleaning the whole vocabulary is a far larger job
-- with no reader waiting on it. Rae's call on 27 September: stop the number
-- growing first.
--
-- SHIPS DARK. topic_vocabulary_enforced is false. Flipping it before the
-- matching application code and the agent instructions are live would fail
-- every correct publish, which is exactly what migration 109 did on 13 August.
-- Flip with one update and no deploy:
--   UPDATE hub_config SET value = 'true' WHERE key = 'topic_vocabulary_enforced';
-- Roll back the same way.
-- ============================================================

BEGIN;

-- The vocabulary lives here rather than inside the function so that adding a
-- tag is an UPDATE rather than a migration. lib/hub/topic-vocabulary.ts and the
-- Dr. Jasmine Cole and Julie Lynn instructions on the Railway volume carry the
-- same list, because neither the application nor an agent can read this row at
-- the moment it needs it. All three change together. Merging the skills repo
-- deploys nothing.
INSERT INTO hub_config (key, value, note)
VALUES (
  'topic_vocabulary',
  'back-to-school,classroom-management,coaching,communication,wellness,leadership,lesson-planning,assessment,feedback,observation,relationships,behavior,de-escalation,special-education,inclusion,differentiation,para,new-teacher,student-engagement,stress-management,burnout-prevention,time-management,staff-collaboration',
  'The approved topic_tags. Comma separated, no spaces. Kept in step with lib/hub/topic-vocabulary.ts and the agent instructions on the Railway volume.'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO hub_config (key, value, note)
VALUES (
  'topic_vocabulary_enforced',
  'false',
  'Ships off. Flip to true only after the content-sync vocabulary gate is deployed AND the approved list is confirmed live in the Jasmine and Julie Lynn instructions on Railway. Rollback is setting this back to false.'
)
ON CONFLICT (key) DO NOTHING;

/**
 * The approved vocabulary as a set, read fresh each call.
 *
 * Returning an empty set when the row is missing is deliberate: the caller
 * treats an empty vocabulary as "cannot judge" and allows the publish, so a
 * deleted config row degrades to the old behaviour rather than blocking
 * everything.
 */
CREATE OR REPLACE FUNCTION hub_topic_vocabulary()
RETURNS TEXT[] AS $$
  SELECT COALESCE(
    (SELECT string_to_array(value, ',') FROM hub_config WHERE key = 'topic_vocabulary'),
    ARRAY[]::TEXT[]
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION check_quick_win_topic_vocabulary()
RETURNS TRIGGER AS $$
DECLARE
  becoming_published BOOLEAN;
  approved           TEXT[];
  offending          TEXT[];
BEGIN
  IF NEW.is_published IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  -- Only on the transition. An already published row can be updated freely,
  -- which is what keeps backfill_published and every ordinary edit working.
  IF TG_OP = 'INSERT' THEN
    becoming_published := true;
  ELSE
    becoming_published := OLD.is_published IS DISTINCT FROM true;
  END IF;

  IF NOT becoming_published OR NOT hub_flag('topic_vocabulary_enforced') THEN
    RETURN NEW;
  END IF;

  approved := hub_topic_vocabulary();

  -- No vocabulary configured means this cannot judge, so it does not.
  IF array_length(approved, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT array_agg(t) INTO offending
  FROM unnest(COALESCE(NEW.topic_tags, ARRAY[]::TEXT[])) t
  WHERE t <> '' AND NOT (lower(trim(t)) = ANY (approved));

  IF offending IS NOT NULL AND array_length(offending, 1) > 0 THEN
    RAISE EXCEPTION
      'Cannot publish Quick Win "%": topic_tags % are not in the approved vocabulary. Approved: %. If none of them fits, ask Rae for a new tag rather than inventing one.',
      NEW.title, offending, array_to_string(approved, ', ');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_quick_win_topic_vocabulary ON hub_quick_wins;
CREATE TRIGGER enforce_quick_win_topic_vocabulary
  BEFORE INSERT OR UPDATE ON hub_quick_wins
  FOR EACH ROW
  EXECUTE FUNCTION check_quick_win_topic_vocabulary();

COMMIT;
