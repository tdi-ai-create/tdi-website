# Browser pass

## What this change touches

The Quick Wins filter row and the Browse by Topic row on the Hub home. Working
Together was a separate pill sitting apart from the categories. It is now an
ordinary pill in the row next to All and the twelve categories, and an ordinary
chip on the home page, which is what Rae asked for after seeing the first
version live.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. Confirmed again on 27 September:
  the preview build serves the page and redirects to the Hub login rather than
  erroring, so the deployment is fine and the login is the wall. The previous
  deferred record for this feature was completed on production before this one
  was opened, so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins?collection=working-together

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/quick-wins?filter=Working%20Together
  and the pill sits second in the row, right after All, styled navy and filled
  exactly like a selected category. "Showing 21 of 289 quick wins" with the
  subtitle "Tools for the adults in the building, not the students" under it.
- Saw: 21 is correct. 18 items were on the shelf before, three of the four new
  para tools published this morning, and the fourth publishes 29 September.
  The first three cards are "Five Minutes to a Better Monday", "When It Is Not
  Working: A Para's Repair Checklist" and "The Norms Conversation Starter".
- Saw: the first load of the day served the previous build, with the old gold
  pill sitting outside the row and All still navy beside it. A cache busting
  query string brought back the new build. Worth writing down: the first look
  after a deploy can show the old page and read as a broken change.
- Pressed: "Instructional Strategies" while Working Together was selected.
- Saw: Working Together deselected, Instructional Strategies went navy, the
  count went from 21 to 32, and the subtitle disappeared. That is the trade Rae
  accepted, confirmed live rather than assumed: the shelf no longer stacks with
  a category.
- Pressed: nothing on the Hub home, because the Vibe Check modal intercepted the
  click.
- Saw: on https://www.teachersdeserveit.com/hub the Browse by Topic row now
  leads with a plain "Working Together" chip, styled the same as "Classroom
  Tools", "Leadership" and "Para" rather than the gold one it replaced.
- Saw: the legacy URL still works. ?collection=working-together resolved to the
  same shelf, "Showing 21 of 289 quick wins", so shared links did not break.

## What I did not press

The Vibe Check answers. Pressing one would have written a real wellbeing entry
against Rae's account and changed her dashboard, so it was skipped for today
instead.

## What I could not verify

- The Hub home chip by clicking it. The modal took the click, so the chip was
  read off the screen and the destination was checked by opening the URL it
  points at instead.
- The Spanish rendering. The label and subtitle go through `tUI`, and the ES
  toggle was not pressed.
- Mobile width. Only desktop was opened, and the pill row scrolls horizontally,
  so a narrow screen may cut the pill off.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0.
