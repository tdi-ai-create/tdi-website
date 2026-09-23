# Browser pass

## What this change touches

The Paperclip content calendar, and the route that places a brief. Every piece
in the marketing queue is now routed to Kristin, and the board shows two
different waits instead of one.

## What I did

- Opened: https://paperclip-railway-template-production.up.railway.app/TEA/content-calendar
  signed in as Rae, after deploying the plugin to the Railway volume and
  toggling it off and on.
- Saw: in "No day yet (8)", seven LinkedIn cards each carry an amber
  "Needs Kristin" badge, including "Team LinkedIn: Implementation-rate thought
  leadership" and "Rae Personal LinkedIn: Origin story, former special ed
  student to CEO".
- Saw: "The five minutes before the bell" on Substack carries a blue
  "Needs a day" badge instead, because it is already approved and only lacks a
  date. Before this change it read "approved, not out yet" and was
  indistinguishable from the seven above it.
- Saw: the two badges never appear together on one card.

## Why this mattered

`approver` was null on all nineteen items in the queue. The role map gives
"approver" to both Kristin and Rae, so the board told whoever opened it that
seven pieces were "waiting on you" and neither of them had a list that was
really theirs. Rae, 23 September: "Rae only approves content for the hub,
kristin does ALL else including voice."

## Checked without the browser

- `npx vitest run` exited 0, 36 tests, six of them new for `badgesFor`,
  including one that asserts a card never asks for a decision and a day at once.
- `npx tsc --noEmit` exited 0 in the plugin and reports nothing in the route.
- 19 existing rows backfilled to `approver = 'kristin'`, measured by the
  returned ids.

## What I did not press

Approve. Deciding a real piece is Kristin's to do, not mine, and the badge is
what was being verified rather than the decision behind it.

## Claim tiers

- Measured: everything above.
