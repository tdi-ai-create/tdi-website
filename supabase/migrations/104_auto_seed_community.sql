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
  -- Role-aware post templates
  -- User mapping: [1]=Pam(teacher), [2]=Michelle(para), [3]=Christine(coach), [4]=Matilde(para), [5]=Todd(teacher)
  -- Templates are organized by role so posts match the author's actual position

  -- TEACHER tried_it templates (for Pam, Todd)
  teacher_tried TEXT[] := ARRAY[
    'Used this with my 3rd graders on Monday. They were more engaged than I expected and I could see the lightbulb moments happening in real time.',
    'Tried this during my planning period and immediately shared it with my grade team. Three of us are using it now.',
    'First year teacher here. This gave me a framework I did not have before. Used it the same afternoon.',
    'I teach high school and was skeptical this would work with older students. It absolutely did. They were into it.',
    'Used this right before parent conferences and it helped me reframe how I was thinking about my toughest conversations.',
    'Implemented this in my inclusion classroom. Both my gen ed and special ed students benefited from the structure.',
    'My co-teacher and I tried this together during our shared planning time. Having two perspectives made it even better.'
  ];
  -- PARA tried_it templates (for Michelle, Matilde)
  para_tried TEXT[] := ARRAY[
    'As a para working with small groups, this fit perfectly into my 20-minute pull-out sessions. The students responded really well.',
    'I do redirects all day in small groups. This game made me realize I can be more intentional about how I talk to students.',
    'First year as a para and this gave me more confidence than any training I have had. The scenarios are realistic.',
    'Been a para for years and this is the first PD that felt like it was actually written for someone in my role.',
    'Used this during my small group time and saw immediate results. The kids responded differently when I changed my approach.',
    'My lead teacher and I tried this together. Having the para perspective alongside the teacher perspective made it richer.',
    'As a para in an inclusion room, I see these situations every single day. Finally a tool that matches my reality.'
  ];
  -- COACH tried_it templates (for Christine)
  coach_tried TEXT[] := ARRAY[
    'Used this during a coaching session with a second-year teacher. The scenarios sparked the best conversation we have had all year.',
    'Brought this to our staff meeting as a discussion starter. It changed the whole tone of the conversation.',
    'Played this with my mentee teacher and it opened up a coaching conversation I had been trying to start for weeks.',
    'Every scenario felt like something from last Tuesday. The explanations for why the wrong answers fail is where the real learning happens.',
    'Used this during our PLC and it gave us common language to talk about classroom instincts without it getting personal.',
    'Shared this with my team of teachers during our PD block. Three of them came back the next day saying they tried it.'
  ];
  -- TEACHER adapted_it templates
  teacher_adapted TEXT[] := ARRAY[
    'I modified this for my kindergarteners by simplifying the language. The core concept still worked perfectly at their level.',
    'I turned this into a weekly 5-minute routine instead of doing it all at once. Small doses worked better for my class.',
    'Used the framework but swapped in scenarios specific to our grade level. Made it feel more relevant.',
    'Combined this with our existing lesson planning protocol. It added a layer of reflection that was missing.'
  ];
  -- PARA adapted_it templates
  para_adapted TEXT[] := ARRAY[
    'I adapted this for my small group rotation. Instead of doing it all at once I break it into pieces across the week.',
    'Turned this into a 10-minute challenge with my co-teacher. We compare approaches and it is the best PD I have ever done.',
    'Modified this so I can use it during transitions. Those in-between moments are where I do my best work as a para.',
    'Shared this with the other paras at our school and we made it part of our weekly check-in. Everyone brings one takeaway.'
  ];
  -- COACH adapted_it templates
  coach_adapted TEXT[] := ARRAY[
    'Adapted this for our leadership team retreat. Changed the student scenarios to staff scenarios and the discussions were incredible.',
    'Combined this with our existing PLC protocol. It added a layer of reflection that was missing from our usual routine.',
    'I use this as our PLC warm-up now. One scenario per meeting, five minutes of discussion. Perfect coaching tool.',
    'Modified this for our new teacher mentoring program. The reflection pieces are especially powerful for early-career educators.'
  ];
  -- TEACHER still_trying templates
  teacher_still_trying TEXT[] := ARRAY[
    'Started using this but still figuring out the best time in my day to fit it in. The concept is solid though.',
    'Makes sense in theory but with 32 kids in my room, the logistics are tricky. Working on making it more manageable.',
    'Love the idea but I need to adapt it for my middle schoolers. The elementary examples do not quite land with 7th graders.'
  ];
  -- PARA still_trying templates
  para_still_trying TEXT[] := ARRAY[
    'Tried it once during small group and could see the potential. Going to give it another round next week with some adjustments.',
    'The concept clicks but fitting it into my pull-out schedule is tricky. Still working on the timing.',
    'Started using this but I want to practice more before I feel confident. My lead teacher is encouraging me to keep going.'
  ];
  -- COACH still_trying templates
  coach_still_trying TEXT[] := ARRAY[
    'Shared this with my team but we have not all tried it yet. Planning to do a group run-through at our next PLC.',
    'The framework clicks for me but I want to practice more before I feel confident facilitating it with a full staff.'
  ];
  -- Roles: [1]=teacher, [2]=para, [3]=coach, [4]=para, [5]=teacher
  user_roles TEXT[] := ARRAY['teacher', 'para', 'coach', 'para', 'teacher'];
  contribution_types TEXT[] := ARRAY['tried_it', 'tried_it', 'tried_it', 'adapted_it', 'still_trying'];
  post_body TEXT;
  post_type TEXT;
  user_role TEXT;
  user_idx INT;
  post_idx INT;
  pool_size INT;
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

    -- Generate 5 diverse posts, matching templates to each user's role
    FOR i IN 1..5 LOOP
      user_idx := i;
      post_type := contribution_types[i];
      user_role := user_roles[i];

      -- Pick a post body based on type AND role, using modular indexing for variety
      IF post_type = 'tried_it' THEN
        IF user_role = 'para' THEN
          pool_size := array_length(para_tried, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := para_tried[post_idx];
        ELSIF user_role = 'coach' THEN
          pool_size := array_length(coach_tried, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := coach_tried[post_idx];
        ELSE
          pool_size := array_length(teacher_tried, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := teacher_tried[post_idx];
        END IF;
      ELSIF post_type = 'adapted_it' THEN
        IF user_role = 'para' THEN
          pool_size := array_length(para_adapted, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := para_adapted[post_idx];
        ELSIF user_role = 'coach' THEN
          pool_size := array_length(coach_adapted, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := coach_adapted[post_idx];
        ELSE
          pool_size := array_length(teacher_adapted, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := teacher_adapted[post_idx];
        END IF;
      ELSE
        IF user_role = 'para' THEN
          pool_size := array_length(para_still_trying, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := para_still_trying[post_idx];
        ELSIF user_role = 'coach' THEN
          pool_size := array_length(coach_still_trying, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := coach_still_trying[post_idx];
        ELSE
          pool_size := array_length(teacher_still_trying, 1);
          post_idx := (hashtext(NEW.id::text || i::text) % pool_size) + 1;
          IF post_idx < 1 THEN post_idx := 1; END IF;
          IF post_idx > pool_size THEN post_idx := pool_size; END IF;
          post_body := teacher_still_trying[post_idx];
        END IF;
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
