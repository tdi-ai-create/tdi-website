# Browser pass

## What this change touches

The Hub lesson player, `/hub/courses/[slug]/[lesson]`. When a lesson carries a
check-in and the learner has marked the lesson complete, the check-in now takes
the screen instead of rendering below the video, and a "Rewatch" control goes
back.

## Status

- Deferred: this cannot be checked before it is live. The Hub needs a member
  login, so localhost redirects to `/hub/login`, and CLAUDE.md records that
  Vercel previews return 500 on every route. There is nowhere to press it
  except production.
- Verify after deploy: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning/9f2a4b4e-placeholder Open "Choosing Seating by Need", the lesson carrying Check-in 1 of 3, press Mark complete, and confirm the video is replaced by the check-in with a Rewatch control rather than the question appearing below the player.

## What I did, completed against production 23 Sep 2026

- Opened: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning/201ff1f1-3b21-4886-9909-f3041096b972
  "Choosing Seating by Need", the lesson carrying Check-in 1 of 3, signed in as Rae.
- Saw first: the video playing area, controls reading "Mark complete", and the
  check-in below it headed "CHECK-IN 1 OF 3 . PART 1 OF 2". Sidebar read
  "0 of 23 complete 0%". This is the old behaviour, correctly still in place
  before the lesson is complete.
- Pressed: "Mark complete".
- Saw: the video disappeared. The screen now shows "Rewatch Choosing Seating by
  Need" at the top and directly under it the check-in, "Let's make sure this
  clicked", with the question and all four options visible without scrolling.
  Sidebar shows a green tick on "Choosing Seating by Need" and "1 of 23
  complete 4%".
- Pressed: "Rewatch Choosing Seating by Need".
- Saw: the video returned, the control now reads "Completed", and the check-in
  sits below the player again, which is the intended rewatching state.

## What I changed back

Marking complete wrote to `hub_lesson_progress` under Rae's own account. Row
`2030885a-615d-4d87-9369-ffc78fe4de53` was set back to `in_progress` with
`completed_at` null, so her course progress reads 0 of 23 as it did before.

## One thing worth someone's time

Clicking either the "Mark complete" button or a school row via a synthetic
accessibility-reference click did nothing; clicking the same pixel coordinates
worked. Seen three times tonight across the Hub course list, the funding schools
list and this button. It may be an artefact of the automation rather than a real
defect, and I did not establish which.

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
- Unverified until deploy: the swap itself and the Rewatch control.
