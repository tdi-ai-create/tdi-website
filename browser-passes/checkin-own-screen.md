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

## What I did

- Opened:
- Pressed:
- Saw:

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
