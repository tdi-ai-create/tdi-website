-- ============================================================
-- Bring courses up to the same footing as quick wins.
--
-- Three things were missed when the quick win wall was dealt
-- with on 23 Sep, all because courses keep their conversation
-- in a third table, course_responses, rather than the two that
-- were already known about.
--
--   1. The contribution_type check still rejected 'question'
--      and 'from_tdi', so the Community tab on a course could
--      not carry a question at all.
--   2. 78 seeded posts under five real teachers' accounts were
--      still live on course pages after the equivalent posts
--      had been archived everywhere else.
--   3. Publishing a course seeded nothing, so a new course
--      opened with an empty Community tab.
--
-- The archive tables mean 2 is reversible with one insert.
-- ============================================================

-- 1. The vocabulary, matching quick_win_responses and lesson_responses.
ALTER TABLE course_responses
  DROP CONSTRAINT IF EXISTS course_responses_contribution_type_check;

ALTER TABLE course_responses
  ADD CONSTRAINT course_responses_contribution_type_check
  CHECK (contribution_type IN (
    'tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land',
    'question', 'from_tdi'
  ));

-- 2. The archive. Applied 24 Sep 2026; kept here so the repo describes
--    production rather than disagreeing with it.
CREATE TABLE IF NOT EXISTS course_responses_archive (LIKE course_responses INCLUDING DEFAULTS);
ALTER TABLE course_responses_archive ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE course_responses_archive ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- 3. One question on publish, from an account TDI owns, never repeated.
CREATE OR REPLACE FUNCTION seed_course_community_posts()
RETURNS TRIGGER AS $$
DECLARE
  questions TEXT[] := ARRAY[
    'What are you hoping is different in your room by the end of this?',
    'Which lesson here are you most likely to put off, and why that one?',
    'If you have taken a course like this before, what made it stick or not stick?',
    'What would you need to change in your week to actually finish this?',
    'Which part of this is already familiar, and which part is genuinely new to you?',
    'What would you want a colleague to know before they started this?',
    'Are you taking this alone or with someone? I suspect that changes a lot.',
    'What is the first thing you plan to try between lessons?',
    'Which idea here would be hardest to sell to the rest of your team?',
    'What made you pick this course over the others?',
    'What would have to happen for you to call this course worth the time?',
    'Which of your students were you thinking about when you enrolled?'
  ];
  voice_ids UUID[];
  chosen_body TEXT;
  chosen_voice UUID;
  i INT;
  idx INT;
BEGIN
  IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN
    IF EXISTS (SELECT 1 FROM course_responses WHERE course_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- No TDI account means write nothing, rather than fall back to a real
    -- person's account. That fallback is the bug this whole line of work removed.
    SELECT array_agg(id) INTO voice_ids FROM hub_profiles WHERE is_tdi_voice;
    IF voice_ids IS NULL OR array_length(voice_ids, 1) = 0 THEN
      RETURN NEW;
    END IF;

    FOR i IN 0..(array_length(questions, 1) - 1) LOOP
      idx := (abs(hashtext(NEW.id::text)) + i) % array_length(questions, 1) + 1;
      IF NOT EXISTS (SELECT 1 FROM course_responses WHERE body = questions[idx]) THEN
        chosen_body := questions[idx];
        EXIT;
      END IF;
    END LOOP;

    IF chosen_body IS NULL THEN
      RETURN NEW;
    END IF;

    chosen_voice := voice_ids[(abs(hashtext(NEW.id::text)) % array_length(voice_ids, 1)) + 1];

    INSERT INTO course_responses (course_id, user_id, contribution_type, body, helpful_count, created_at)
    VALUES (NEW.id, chosen_voice, 'question', chosen_body, 0, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_seed_course_community ON hub_courses;
CREATE TRIGGER auto_seed_course_community
  AFTER INSERT OR UPDATE ON hub_courses
  FOR EACH ROW
  EXECUTE FUNCTION seed_course_community_posts();
