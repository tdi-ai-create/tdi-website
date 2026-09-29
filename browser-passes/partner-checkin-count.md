# Browser pass

## What this change touches

The "Your Goals" block on a school's own dashboard. A goal fed by a staff
check-in now says how many people have answered, and links to the check-in while
it is open.

## What I did

- Deferred: the partner dashboard authenticates against a live Supabase session
  scoped to the production domain, so localhost renders a loading screen that
  cannot be signed into. Same reason as `partner-goals-block.md`.
- Verify after deploy: https://www.teachersdeserveit.com/partners/st-mary-catholic-school

## What I checked instead, before deferring

- `npm run typecheck` exited 0.
- Read the live data the block will render, in SQL rather than from the screen:
  the St. Mary check-in row `stmary-behavior-oct26-mj2kqr` is status open with
  `min_responses` 5, it has 0 responses, and
  `behavior_management_confidence.current_value` is null. So the line this change
  adds should read "Nobody has answered yet. Your number appears once 5 people
  have." next to a goal whose stat still reads "Target 75%".

## What I did not press

Nothing was submitted into St. Mary's check-in. The production pass reads the
dashboard and does not answer the form, because a test answer would be a real
answer in her count.

## What I could not verify

Whether the line renders for a school with no check-in at all, which is eight of
the nine partnerships. The block only renders it when a check-in row matches the
goal's `kpi_key`, so the expectation is that nothing changes for them, and that
is worth a look on a second school during the production pass.
