# Browser pass

## What this change touches

The Quick Wins browse page and the Hub home. A new Working Together collection
pill filters to the 22 tools tagged `staff-collaboration`, pins para and teacher
tools to the top of that shelf, and a matching gold entry leads the Browse by
Topic row on the Hub home.

## What I did

- Opened: https://teachersdeserveit-git-feat-workin-598b00-raes-projects-94e0788c.vercel.app/hub/quick-wins?collection=working-together
- Pressed: nothing. The page never rendered for me. See the deferral below.

The preview deployment itself is healthy: it served the page and handed off to
the Hub login rather than erroring, which rules out the 500s previews were
throwing earlier in September. That is a fact about the deployment, not an
observation of the shelf, so it is written here rather than dressed up as one.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin. Rae signed in at www.teachersdeserveit.com, which is a different
  origin from the preview domain, so the session does not carry and the preview
  answers every Hub page with a login screen. Signing in on the preview origin
  would mean someone typing real credentials, and an assistant must not do that.
  Localhost fails the same way for the same reason.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins?collection=working-together

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/quick-wins?collection=working-together
  cold, as a full page load rather than a client side navigation, and it came up
  on the shelf: "Showing 18 of 286 quick wins" with the Working Together pill
  filled gold and "All" still the selected category beside it. That is the hard
  refresh case, and the collection survived it.
- Saw: the subtitle under the count reads "Tools for the adults in the building,
  not the students".
- Saw: 18 rather than 22 is correct and not a bug. Four of the 22 tagged items
  are the new para tools, which are scheduled to publish on 28 and 29 September
  and are not live yet. 18 published plus 4 unpublished matches the database.
- Saw: the pinning works. The first nine cards are all para or teacher tools,
  starting "Multi-Classroom Communication Log", "Para Onboarding & Orientation
  Checklist" and "Para-to-Teacher End-of-Day Handoff Note", and the coach and
  leader material begins only after them at "Parent Conference Coaching Prep".
- Saw: both items the tag query would have missed are on the shelf, "The
  Teacher-Para Partnership Planner" and "Teacher + Para Communication Kit".
- Pressed: "Instructional Strategies" in the category row while Working Together
  was still on. This was the interaction most likely to be broken.
- Saw: the count went from 18 to 2, the Working Together pill stayed gold and
  selected, and the two remaining cards were "Instructional Rounds Planning
  Guide" and "New Teacher Check-in Protocol". The collection narrowed alongside
  the category instead of being cleared by it, which is the whole point of
  making it a collection.
- Pressed: the "Working Together" chip in the Browse by Topic row on
  https://www.teachersdeserveit.com/hub
- Saw: it sits first in that row, gold outlined against the plain white chips,
  and it landed on the shelf showing "Showing 18 of 286 quick wins". Two clicks
  from the Hub home, which was the requirement.

## What I did not press

Nothing was skipped by choice. The only untested controls are the ones behind
the login, and they are named in the follow-up above so they get pressed rather
than assumed.

## What I could not verify

- The shelf at its full size. Four of the 22 tagged tools publish on 28 and 29
  September, so what was on screen was 18. The other four were checked as
  database rows, not as cards, and a row is not a card.
- The Spanish rendering. The label and subtitle go through `tUI`, which
  translates on demand rather than from a string file, and the ES toggle was not
  pressed.
- The combination with the role dropdown. The category combination was pressed
  and worked, and the role filter runs through the same filter chain, but that
  is reasoning rather than an observation.
- Whether the shelf reads well on a phone. Only desktop width was opened.
