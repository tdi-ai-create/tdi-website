-- ============================================================
-- Put the new publish enforcement behind a rollout flag.
--
-- Migration 109 began requiring status='reviewed' before publish. The action
-- that sets that status (content-sync mark_reviewed) ships in application code
-- that had not deployed yet, so for a window the database enforced a gate the
-- running code could not satisfy and every publish failed.
--
-- The rule this encodes: schema enforcement must never outrun the code that
-- satisfies it. New constraints ship OFF, the code deploys, then the flag flips.
--
-- Always-on (safe with any code version):
--   * status / is_published normalization
--   * the original tag requirements from before this work
--
-- Flag-gated (needs the new code and the updated agent skills deployed first):
--   * tool PDF requirement for downloads
--   * exact lift casing and canonical danielson domains
--   * the QA gate itself
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS hub_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  note       TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE hub_config IS
  'Runtime flags read by database triggers. Lets new enforcement ship dark and turn on after the matching code deploys.';

INSERT INTO hub_config (key, value, note)
VALUES (
  'qa_gate_enforced',
  'false',
  'Flip to true only after the branch adding content-sync mark_reviewed is deployed AND the updated Jasmine/Julie Lynn skills are live on Railway. Until then the database must accept what the running code produces.'
)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION hub_flag(flag_key TEXT)
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT value = 'true' FROM hub_config WHERE key = flag_key), false);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION check_quick_win_tags()
RETURNS TRIGGER AS $$
DECLARE
  becoming_published BOOLEAN;
  strict_mode        BOOLEAN;
BEGIN
  -- Always on. Nothing depends on the divergent state, so this is safe with
  -- any code version.
  IF NEW.is_published IS DISTINCT FROM true AND NEW.status = 'published' THEN
    NEW.status := 'pending_review';
  END IF;

  IF NEW.is_published = true THEN

    -- Always on. These predate this work.
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

    strict_mode := hub_flag('qa_gate_enforced');

    IF becoming_published AND strict_mode THEN

      IF NEW.quick_win_type = 'download' THEN
        IF NEW.file_url IS NULL THEN
          RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a guide PDF (file_url)', NEW.title;
        END IF;
        IF NEW.tool_file_url IS NULL THEN
          RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a tool PDF (tool_file_url). Run generate_pdf with action generate_tool first.', NEW.title;
        END IF;
      END IF;

      IF NEW.lift NOT IN ('LOW', 'MED', 'HIGH') THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": lift must be exactly LOW, MED or HIGH (got "%"). The Hub matches case-sensitively and renders a blank badge otherwise.', NEW.title, NEW.lift;
      END IF;
      IF EXISTS (
        SELECT 1 FROM unnest(NEW.danielson_domains) d
        WHERE d NOT IN ('1-planning', '2-environment', '3-instruction', '4-professional')
      ) THEN
        RAISE EXCEPTION 'Cannot publish Quick Win "%": danielson_domains must use the canonical values 1-planning, 2-environment, 3-instruction, 4-professional (got %)', NEW.title, NEW.danielson_domains;
      END IF;

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
