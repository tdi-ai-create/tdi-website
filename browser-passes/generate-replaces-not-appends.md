# Browser pass

## What this change touches

The Auto-Generate button on the course admin page,
`app/tdi-admin/hub/production/courses/[id]` via `QuizQuestionBuilder`, and the
route behind it. Generating now retires the checks already on a lesson before
writing the new set, and the button asks before it replaces anything.

## Status

Completed on production 23 September, after #602 deployed. The deferral below
is kept for the record.

- Was deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers `/tdi-admin` with a login
  screen. The change could not be exercised anywhere but production, and it was
  not deployed yet, so pressing the live button that day would only have proved
  the old append behaviour.

## What I did

Signed in as Rae Hughart on production. The lesson's question ids were recorded
from the database first, so the restore afterwards is exact rather than
approximate.

- Opened: https://www.teachersdeserveit.com/tdi-admin/hub/production/courses/0369d6db-89f2-4c90-a526-d036263b6221
  on the course "How to Use Flexible Seating for Better Learning", which is
  Published, and selected the lesson "Choosing Seating by Need".
- Saw: the panel reads "ENGAGEMENT CHECKS (2)" with an amber "Regenerate"
  button. The two rows are "According to this approach to choo..." and
  "Picture the students who will be in y...". Those match the two active rows
  in `hub_quiz_questions`, ids `5ec239f8` and `4fb43abd`, sort_order 0 and 1.
- Pressed: "Regenerate"
- Saw: it did not generate. The button changed to read "Replace 2?" and an
  amber warning appeared: "This retires the 2 checks already on this lesson and
  writes a new set. Answers educators have already given are kept. Press again
  to go ahead." A "cancel" link sits beside it. This is the confirmation step
  that did not exist before.
- Pressed: "Replace 2?"
- Saw: the header changed to "Analyzing lesson content..." and then settled on
  "ENGAGEMENT CHECKS (5)". The two original rows are gone from the list,
  replaced by "A teacher works with students who ...", "Two teachers are
  redesigning their ...", "Think about the students currently i...", "This
  week, take 10 minutes to write ..." and a fifth below the fold.
- Confirmed in the database, not from the screen: the lesson went from 2 active
  and 7 inactive to 5 active and 9 inactive. Five new rows written, the two
  originals flipped to `is_active = false`, nothing deleted. Had it appended,
  the count would have been 7 active. It was 5.

## Restored afterwards

The five generated checks are unreviewed output and this is a published course,
so the lesson was put back to the reviewed set it started on: all rows on the
lesson set inactive, then ids `5ec239f8` and `4fb43abd` set active again.
Verified by reading them back, sort_order 0 and 1, both active. The generated
five remain on the row as inactive history.

## The test is reversible, and that is deliberate

Retiring sets `is_active = false` and deletes nothing, so the two original
checks can be switched back on and the generated ones switched off, returning
the lesson to the state last night's rebuild left it in. The old question ids
were recorded before pressing anything so the restore was exact rather than
approximate.

## Checked without the browser

- `npm run check:writes` exited 0. Both new writes take their error: the read of
  existing questions and the retire itself both refuse and return rather than
  carrying on, because a silent retire failure would leave the lesson serving
  two sets at once, which is the exact bug this change exists to stop.
- `npx tsc --noEmit` reports nothing in either changed file.
- The cause is measured, not assumed: every bloated lesson held an exact
  multiple of five, and the route read the highest `sort_order` then counted on
  from it. Five presses, five copies.

## What I could not verify

Whether an educator mid-lesson sees the swap cleanly, because that needs a
learner session against a lesson being regenerated underneath them. The route
keeps prior answers, and the warning says so, but I did not prove it from the
learner side.

## Claim tiers

- Measured: the gates above, the warning wording, the replace, and the 2 to 5
  count change read from the database.
- Unverified: the learner-side behaviour noted above.
