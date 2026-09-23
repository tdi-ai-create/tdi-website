# Browser pass

## What this change touches

The Hub lesson player, `/hub/courses/[slug]/[lesson]`. A lesson with a
`correction_note` set now shows that note in a gold bordered callout above the
video, before the player rather than inside the collapsed transcript panel.

## Status

- Deferred: the lesson player sits behind a Hub member login. A local server
  answers `/hub/courses/...` with a redirect to
  `/hub/login?returnUrl=%2Fhub%2Fcourses%2Fhow-to-use-flexible-seating-for-better-learning`,
  recorded in the dev server log on port 3007. This is the same constraint
  CLAUDE.md records for `/tdi-admin`: nobody but Rae can get past it locally.
- Verify after deploy: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning
  Open the "How This Works" lesson, confirm the Correction block renders above
  the video and reads "Both have been retired", then fill in the Pressed and
  Saw lines below.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning
- Pressed: "How This Works" in the Course Curriculum list
- Saw: nothing moved. The URL stayed on ".../how-to-use-flexible-seating-for-better-learning" and the page did not change. Reached the lesson by its own URL instead,
  /hub/courses/how-to-use-flexible-seating-for-better-learning/bbca9e27-515d-423f-831a-ab51d20deef8.
  Worth someone looking at separately; it may have been hydration timing rather
  than a broken link, and I did not establish which.
- Opened: the lesson player at that URL, signed in as Rae
- Saw: a gold bordered block above the video, labelled "CORRECTION", reading "This lesson mentions a private Facebook group and weekly office hours. Both have been retired, and Teachers Deserve It no longer runs either one."
  It continues "You have not lost the support. Email hello@teachersdeserveit.com
  with anything you are stuck on and a real person will answer you." The header
  above it reads "Lesson 3 of 17 . 0:30" and the sidebar reads "0 of 23 complete
  0%". It is above the player, not inside the transcript panel.
- Saw: the player sits below that block, unstarted, showing only a play control on a black frame for a lesson the header gives as "0:30". The correction is therefore read before anything plays, which was the point of moving it.

## Checked without the browser

- `npx tsc --noEmit` exited 0.
- `correction_note` is set on exactly 5 lessons, 399 characters each, measured
  with `select length(correction_note)` after the update.
- `correction_note` is in the page's select list in
  `app/hub/courses/[slug]/[lesson]/page.tsx`, so it is actually fetched. A field
  that is never selected is precisely the 14 September bug this gate exists for.

## What I did not press

Nothing in production. The 37 quiz edits were made directly in the Learning Hub
database and are verified by query rather than by sitting a quiz as a member.

## Claim tiers

- Measured: the login redirect, the tsc exit code, the 5 rows and their lengths,
  and now the rendered callout quoted above.
- Measured, added while completing this: all 5 lessons carrying the note reach a
  real course through module_id, one of them being "How This Works" in the
  flexible seating course. Their course_id and slug columns are both null, as
  they are on all 400 lessons, so those two columns are not the link and a check
  written against them would wrongly report the notes as orphaned.
- Unverified: whether the curriculum link failing to navigate is a real fault.
