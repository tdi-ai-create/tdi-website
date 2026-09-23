-- ============================================================
-- Replace the auto-seed trigger.
--
-- What it did: on publish, wrote 5 posts under 5 real teachers'
-- accounts, claiming classroom moments none of them had, and
-- backdated each one by 1 to 14 days. 147 tools have been
-- published through it since it was written in July.
--
-- What it does now: writes one question from a TDI-owned voice
-- account, with a real timestamp, and never the same question
-- twice anywhere in the Hub. A question cannot be a false
-- testimonial, which is what made the old posts a problem.
--
-- The opener that goes alongside it is written per tool by hand,
-- because a sentence about a specific tool cannot be generated
-- by a trigger without becoming the wallpaper this replaces.
--
-- Note on the column types below. Migration 103 declares
-- quick_win_id as TEXT and production has it as UUID, and 104 in
-- this repo casts with ::text while the deployed function does
-- not. This file follows production, which was read from pg_proc
-- rather than from the repo, and was proven by publishing a row
-- inside an uncommitted transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION seed_community_posts()
RETURNS TRIGGER AS $$
DECLARE
  -- Questions only. Nothing here asserts that anybody did anything.
  questions TEXT[] := ARRAY[
    'What would you change about this before using it in your own room?',
    'If you have tried something like this before, what made it stick or not stick?',
    'Which part of this would be hardest to fit into your day as it is now?',
    'What would you need to see before trying this with your hardest group?',
    'Is there a step here you would drop entirely? Which one, and why?',
    'How would you adapt this for a class where the students arrive at different times?',
    'What does this look like if you only have ten minutes rather than a full period?',
    'For anyone running this in a small group instead of a whole class, what changed?',
    'Which part of this would your students push back on first?',
    'What would make this easier to hand to a colleague who has never seen it?',
    'If you teach the youngest grades, what did you have to simplify here?',
    'If you teach high school, what made this land or fall flat with older students?',
    'What would have to be true in your building for this to work as written?',
    'Has anyone used this with a co-teacher? How did you split it?',
    'What is the first thing you would try from this, and when?',
    'Which part of this did you expect to be hard and turned out to be easy?',
    'For paras working without the lead teacher in the room, what did you change?',
    'What would you want a coach to look for if they watched you try this?',
    'Is there a version of this that survives a day when everything is behind schedule?',
    'What is missing from this that you would add for your own subject?',
    'If this did not work for you, what got in the way?',
    'How would you explain the point of this to a student who asks why?',
    'What would you tell someone about to try this for the first time?',
    'Which students in your room would this help most, and which would it miss?',
    'What would you need to prepare the night before for this to go smoothly?',
    'If you have a version of this that works better, what does it look like?',
    'What part of this would you keep even if you changed everything else?',
    'How does this hold up in a room where the group changes every period?',
    'What would make this worth doing again next month rather than once?',
    'Which bit of this assumes something about your room that is not true?'
  ];
  voice_ids UUID[];
  chosen_body TEXT;
  chosen_voice UUID;
  i INT;
  idx INT;
BEGIN
  IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN

    -- Never write twice onto the same tool.
    IF EXISTS (SELECT 1 FROM quick_win_responses WHERE quick_win_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- Accounts TDI owns. If none exist, write nothing rather than
    -- fall back to somebody's real account, which is the bug this
    -- migration exists to remove.
    SELECT array_agg(id) INTO voice_ids
    FROM hub_profiles WHERE is_tdi_voice;

    IF voice_ids IS NULL OR array_length(voice_ids, 1) = 0 THEN
      RETURN NEW;
    END IF;

    -- Walk the pool from a per-tool starting point and take the first
    -- question not already used anywhere. No sentence appears twice in
    -- the Hub, which is the failure the old wallpaper had: 555 distinct
    -- bodies across 1553 posts, one of them repeated 96 times.
    FOR i IN 0..(array_length(questions, 1) - 1) LOOP
      idx := (abs(hashtext(NEW.id::text)) + i) % array_length(questions, 1) + 1;
      IF NOT EXISTS (
        SELECT 1 FROM quick_win_responses WHERE body = questions[idx]
      ) THEN
        chosen_body := questions[idx];
        EXIT;
      END IF;
    END LOOP;

    -- Pool exhausted. Silence is the correct outcome: the tool shows an
    -- empty conversation and the admin conversation tab reports it,
    -- rather than the Hub repeating itself.
    IF chosen_body IS NULL THEN
      RETURN NEW;
    END IF;

    chosen_voice := voice_ids[(abs(hashtext(NEW.id::text)) % array_length(voice_ids, 1)) + 1];

    INSERT INTO quick_win_responses (
      quick_win_id, user_id, contribution_type, title, body, helpful_count, created_at
    ) VALUES (
      NEW.id,
      chosen_voice,
      'question',
      NULL,
      chosen_body,
      0,
      now()          -- real, never backdated
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
