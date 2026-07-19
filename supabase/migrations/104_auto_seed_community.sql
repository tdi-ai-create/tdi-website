-- ============================================================
-- Auto-seed community posts when a quick win is published
-- Fires on INSERT or UPDATE to hub_quick_wins when is_published
-- becomes true. Generates 5 diverse community posts from
-- realistic educator personas.
-- ============================================================

-- Pool of real user IDs for seeding (from auth.users)
-- These are spread across posts for variety
CREATE OR REPLACE FUNCTION seed_community_posts()
RETURNS TRIGGER AS $$
DECLARE
  user_ids TEXT[] := ARRAY[
    'c3c1c7a9-e084-47b8-9945-15423f154ca9',
    '7a502d0a-29e9-4490-b330-ea1131311d44',
    '4236f26b-88a7-4ae9-abf6-65cd09e9fdd9',
    'd532b342-5aff-420d-8201-ae1d6564650c',
    '63e924ff-dfc6-4f24-9da2-950dae9b65d9'
  ];
  -- Diverse post templates organized by contribution type
  -- Each has multiple variants to avoid repetition
  tried_posts TEXT[] := ARRAY[
    'Used this with my 3rd graders on Monday. They were more engaged than I expected and I could see the lightbulb moments happening in real time.',
    'Tried this during my planning period and immediately shared it with my grade team. Three of us are using it now.',
    'As a para working with small groups, this fit perfectly into my 20-minute pull-out sessions. The students responded really well.',
    'Brought this to our staff meeting as a discussion starter. It changed the whole tone of the conversation.',
    'First year teacher here. This gave me a framework I did not have before. Used it the same afternoon.',
    'I teach high school and was skeptical this would work with older students. It absolutely did. They were into it.',
    'Used this right before parent conferences and it helped me reframe how I was thinking about my toughest conversations.',
    'My co-teacher and I tried this together during our shared planning time. Having two perspectives made it even better.',
    'Implemented this in my inclusion classroom. Both my gen ed and special ed students benefited from the structure.',
    'Building sub here. I keep a folder of tools like this that work anywhere. This one earned a spot.'
  ];
  adapted_posts TEXT[] := ARRAY[
    'I modified this for my kindergarteners by simplifying the language. The core concept still worked perfectly at their level.',
    'Adapted this for our leadership team retreat. Changed the student scenarios to staff scenarios and the discussions were incredible.',
    'Combined this with our existing PLC protocol. It added a layer of reflection that was missing from our usual routine.',
    'Translated the key concepts for my bilingual students and used it as a bridge activity. Worked beautifully.',
    'I turned this into a weekly 5-minute routine instead of doing it all at once. Small doses worked better for my group.',
    'Used the framework but swapped in scenarios specific to our school context. Made it feel more relevant to our team.',
    'Adapted this for virtual PD with my remote teachers. Added breakout rooms for the discussion portions.',
    'Modified this for our new teacher mentoring program. The reflection pieces are especially powerful for early-career educators.'
  ];
  still_trying_posts TEXT[] := ARRAY[
    'Started using this but still figuring out the best time in my day to fit it in. The concept is solid though.',
    'Tried it once and could see the potential. Going to give it another round next week with some adjustments.',
    'Makes sense in theory but with 32 kids in my room, the logistics are tricky. Working on making it more manageable.',
    'Love the idea but I need to adapt it for my middle schoolers. The elementary examples do not quite land with 7th graders.',
    'Shared this with my team but we have not all tried it yet. Planning to do a group run-through at our next PLC.',
    'The framework clicks for me but I want to practice more before I feel confident facilitating it with others.'
  ];
  contribution_types TEXT[] := ARRAY['tried_it', 'tried_it', 'tried_it', 'adapted_it', 'still_trying'];
  post_body TEXT;
  post_type TEXT;
  user_idx INT;
  post_idx INT;
  existing_count INT;
BEGIN
  -- Only fire when is_published becomes true
  IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN
    -- Check if posts already exist for this quick win
    SELECT COUNT(*) INTO existing_count
    FROM quick_win_responses
    WHERE quick_win_id = NEW.id::text;

    -- Skip if already seeded
    IF existing_count > 0 THEN
      RETURN NEW;
    END IF;

    -- Generate 5 diverse posts
    FOR i IN 1..5 LOOP
      user_idx := i;
      post_type := contribution_types[i];

      -- Pick a post body based on type, using modular indexing for variety
      IF post_type = 'tried_it' THEN
        post_idx := (hashtext(NEW.id::text || i::text) % array_length(tried_posts, 1)) + 1;
        IF post_idx < 1 THEN post_idx := 1; END IF;
        IF post_idx > array_length(tried_posts, 1) THEN post_idx := array_length(tried_posts, 1); END IF;
        post_body := tried_posts[post_idx];
      ELSIF post_type = 'adapted_it' THEN
        post_idx := (hashtext(NEW.id::text || i::text) % array_length(adapted_posts, 1)) + 1;
        IF post_idx < 1 THEN post_idx := 1; END IF;
        IF post_idx > array_length(adapted_posts, 1) THEN post_idx := array_length(adapted_posts, 1); END IF;
        post_body := adapted_posts[post_idx];
      ELSE
        post_idx := (hashtext(NEW.id::text || i::text) % array_length(still_trying_posts, 1)) + 1;
        IF post_idx < 1 THEN post_idx := 1; END IF;
        IF post_idx > array_length(still_trying_posts, 1) THEN post_idx := still_trying_posts[1]; END IF;
        post_body := still_trying_posts[post_idx];
      END IF;

      INSERT INTO quick_win_responses (
        quick_win_id, user_id, contribution_type, title, body, helpful_count, created_at
      ) VALUES (
        NEW.id::text,
        user_ids[user_idx]::uuid,
        post_type,
        initcap(replace(post_type, '_', ' ')),
        post_body,
        floor(random() * 12 + 1)::int,
        now() - (floor(random() * 14 + 1)::int || ' days')::interval
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to hub_quick_wins
DROP TRIGGER IF EXISTS auto_seed_community ON hub_quick_wins;
CREATE TRIGGER auto_seed_community
  AFTER INSERT OR UPDATE ON hub_quick_wins
  FOR EACH ROW
  EXECUTE FUNCTION seed_community_posts();
