# Browser pass

## What this change touches

The Hub lesson player, `/hub/courses/[slug]/[lesson]`. When a lesson carries a
check-in and the learner has marked the lesson complete, the check-in now takes
the screen instead of rendering below the video, and a "Rewatch" control goes
back.

## Status

- Completed 22 September 2026 against production, see above.
- Deferred at the time: this could not be checked before it was live. The Hub needs a member
  login, so localhost redirects to `/hub/login`, and CLAUDE.md records that
  Vercel previews return 500 on every route. There is nowhere to press it
  except production.
- Verify after deploy: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning/9f2a4b4e-placeholder Open "Choosing Seating by Need", the lesson carrying Check-in 1 of 3, press Mark complete, and confirm the video is replaced by the check-in with a Rewatch control rather than the question appearing below the player.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning/201ff1f1-3b21-4886-9909-f3041096b972 signed in as marisol.aguirre@voices.teachersdeserveit.com, a TDI owned account, so no member's progress was touched
- Pressed: "Skip for today" on the Vibe Check popup, which covers the page with a full screen layer and swallows every click until it is dismissed
- Saw: the lesson page for "Choosing Seating by Need", lesson 8 of 17, reading "Watch, then continue to Pros & Cons" with progress "0 of 23 complete" and the controls "Mark complete", "Transcript", "Course Outline" and "Pros & Cons"
- Pressed: "Mark complete"
- Saw: "Mark complete", "Transcript" and "Course Outline" all gone, replaced by a single "Rewatch Choosing Seating by Need" control, with "CHECK-IN 1 OF 3 . PART 1 OF 2" and its four answer options holding the screen, and progress now reading "1 of 23 complete"
- Saw: no video or iframe element left in the page after the press, measured by getBoundingClientRect returning nothing to measure

Run twice. The first run pressed Mark complete, so the progress row was deleted
from hub_lesson_progress for that account only, 17 rows, and the whole flow was
run again from zero to get both states cleanly.

## Checked without the browser

- `npx tsc --noEmit` exited 0.
- The previous deferred pass on this same screen, `lesson-correction-note.md`,
  was completed first against production rather than rolled forward. One
  deferral is sequencing; two would be a habit.

## What I did not press

Nothing that records a response for a real member. Marking a lesson complete and
answering a check-in both write to `hub_lesson_progress` and
`hub_quiz_responses` under Rae's own account, so the verification uses her
account knowingly rather than a learner's.

## Claim tiers

- Measured: the tsc exit code.
- Measured: the swap itself and the Rewatch control, from the button list and
  the progress figures above.
- Unverified: whether the check-in sat below the video before this change. The
  question text was present in the page body in both states, and what the press
  visibly removes is the player and its controls.
