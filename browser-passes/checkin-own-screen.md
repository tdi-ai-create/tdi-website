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

- Opened: https://www.teachersdeserveit.com/hub/courses/how-to-use-flexible-seating-for-better-learning
  on production, signed in as Rae, 23 September 2026.
- Pressed: "Continue", then "Choosing Seating by Need" in the lesson sidebar,
  which is lesson 8 and carries Check-in 1 of 3.
- Saw: before marking complete, the check-in rendered BELOW the video, headed "CHECK-IN 1 OF 3 · PART 1 OF 2" and "Let's make sure this clicked". That is the pre-change behaviour and what this change exists to replace.
- Pressed: "Mark complete".
- Saw: the video was replaced by the check-in, with a control reading "Rewatch Choosing Seating by Need" above it, and the sidebar progress moved from "0 of 23 complete 0%" to "1 of 23 complete 4%" with a green tick on lesson 8. The header reads "Lesson 8 of 17".
- Confirmed in the database rather than from the screen: `hub_lesson_progress`
  for this lesson and user reads `status = completed`, `completed_at`
  2026-09-23 13:33:03 UTC.

Filled in by a later session. The change had been live and unverified, and the
browser pass gate was refusing every further change to these screens.

## A defect found while doing this, not fixed here

The lesson's own URL,
`/hub/courses/how-to-use-flexible-seating-for-better-learning/201ff1f1-3b21-4886-9909-f3041096b972`,
**hangs on "Loading your Hub..." indefinitely** when opened directly. Reproduced
twice, more than 45 seconds each time, with no console errors. The course page
loads normally and the same lesson opens fine when reached by clicking through
the sidebar, so this is specific to deep-linking a lesson.

That matters because this record's own "Verify after deploy" line is a direct
lesson URL, and anyone following it would conclude the page is broken. It also
affects any link we send a member that points straight at a lesson.

## What I did not press

No check-in answer was submitted. Marking the lesson complete was enough to
exercise the change, and Rae approved that write to her record in advance.
Answering would add a `hub_quiz_responses` row that nothing here needed.

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
