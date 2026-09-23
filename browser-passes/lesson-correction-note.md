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
  signed in as Rae, on production, 22 September 2026.
- Pressed: "Start Learning", then "How This Works" in the lesson sidebar.
- Saw: the Correction block renders above the video, in a gold bordered
  callout headed "CORRECTION", reading "This lesson mentions a private Facebook
  group and weekly office hours. Both have been retired, and Teachers Deserve It
  no longer runs either one." followed by "You have not lost the support. Email
  hello@teachersdeserveit.com with anything you are stuck on and a real person
  will answer you. Every Quick Win in the Hub also has a discussion underneath
  it where educators share what actually worked in their rooms."
- Saw: the header reads "Lesson 3 of 17 . 0:30" and the callout sits between the
  lesson title and the video player, not inside the transcript panel.

Filled in by a later session, 22 September. The change had been live and
unverified, and the browser pass gate was refusing every further change to these
screens until somebody looked, which is what it is for.

## A correction to this record's own assumption

This says the lesson sits behind a login nobody but Rae can pass, which is true,
and it was read as meaning the lesson could not be reached. It could. Lessons 1
to 8 of this course are open and the first check-in gate falls after lesson 8,
so "How This Works" needed no quiz and no progress was written beyond enrolling
and opening it.

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
