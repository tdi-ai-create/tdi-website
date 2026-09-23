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

- Opened: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning/bbca9e27-515d-423f-831a-ab51d20deef8
  signed in as Rae on production, 22 Sep 2026.
- Pressed: "How This Works" in the course curriculum, then read the lesson page.
- Saw: a block headed "CORRECTION" above the video reading "This lesson mentions
  a private Facebook group and weekly office hours. Both have been retired, and
  Teachers Deserve It no longer runs either one." followed by the hello@ route.
- Saw: the progress line reads "0 of 23 complete", down from the 273 Rae
  screenshotted before the check-in rebuild. 17 lessons plus 6 questions.
- Saw: the sidebar lists exactly "Check-in 1 of 3", "Check-in 2 of 3" and
  "Check-in 3 of 3", placed after lessons 8, 13 and 17.
- Saw: the course landing page reads "17 lessons + 3 check-ins".

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

- Measured: the login redirect, the tsc exit code, the 5 rows and their lengths.
- Unverified: how the callout looks to a signed in member. That is the deferred
  check above.
