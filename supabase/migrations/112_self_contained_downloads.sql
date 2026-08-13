-- ============================================================
-- Self-contained downloads
--
-- The two-download rule assumes a guide (explains why) and a separate tool
-- (the thing you print). That holds for most Quick Wins. It does not hold for
-- single-page printables where the artifact IS the tool: lab cards, quick
-- cards, walkthrough forms.
--
-- The seven Vocational items flagged as "missing a tool PDF" are all of this
-- kind. Verified by reading every PDF: one page each, and each already carries
-- the usable artifact. The welding and cosmetology lab cards contain the
-- student data sheet. The principal walkthrough has the fill-in blanks. The
-- classroom management card labels itself "TOOL 02 OF 03" in its own header.
--
-- Generating a second PDF for these would produce redundant filler and make
-- the detail page show two buttons pointing at near-identical content. The
-- honest fix is to let a download declare that it is self-contained.
--
-- The Hub already renders this correctly: with tool_file_url null it shows a
-- single "Download" button pointing at file_url, which is what these want.
-- Only the QA gate needed teaching.
-- ============================================================

BEGIN;

COMMENT ON COLUMN hub_quick_wins.tool_type IS
  'Template used for the generated tool PDF (checklist, form, reference_card, toolkit), or the sentinel self_contained meaning the guide PDF is itself the printable tool and no second file is required.';

UPDATE hub_quick_wins
SET tool_type = 'self_contained'
WHERE is_published = true
  AND quick_win_type = 'download'
  AND tool_file_url IS NULL
  AND tool_type IS NULL;

CREATE OR REPLACE FUNCTION check_quick_win_tags()
RETURNS TRIGGER AS $$
DECLARE
  becoming_published BOOLEAN;
  strict_mode        BOOLEAN;
BEGIN
  IF NEW.is_published IS DISTINCT FROM true AND NEW.status = 'published' THEN
    NEW.status := 'pending_review';
  END IF;

  IF NEW.is_published = true THEN

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
        -- A download needs a separate tool PDF unless it declares itself
        -- self-contained, meaning the guide already IS the printable artifact.
        IF NEW.tool_file_url IS NULL AND NEW.tool_type IS DISTINCT FROM 'self_contained' THEN
          RAISE EXCEPTION 'Cannot publish Quick Win "%": download type requires a tool PDF (tool_file_url). Run generate_pdf with action generate_tool, or set tool_type to self_contained if the guide is itself the printable tool.', NEW.title;
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
