# Browser pass

## What this change touches

The "What educators are saying" block on every quick win page, every game page,
and every course page. It is removed.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup, which blocks every click until dismissed
- Saw: the conversation section carrying only our own two posts, "Rosalie Dunne TDI . Classroom Teacher . 18h ago" tagged "Question" and "Everett Crane TDI . Para . 18h ago" tagged "From TDI", with the filter row reading "All 1" and every seeded teacher gone
- Saw: below that, a quote reading "Finally something I can use in 5 minutes between classes. That's real." attributed to "-- High school math teacher, 3 days ago". Nobody said it. It is a hardcoded string in the page, which is what this change removes.

That is what the block looks like before the change. The database was already
clean at this point, which is how the hardcoded copy became visible.

## Completed on production, 23 September 2026

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts
- Saw: no "What educators are saying" heading anywhere in the page body, and none of the invented quotes. The conversation section is now the only thing under the tool, showing "All 1" and "Question 1" with our two posts carrying the TDI chip.
- Opened: https://www.teachersdeserveit.com/hub/quick-wins/shift-kit
- Saw: h1 "The Shift Kit", two TDI chips, tags rendering "Question" and "From TDI", and no testimonial heading or invented quote.
- Opened: https://www.teachersdeserveit.com/hub/quick-wins/sustainable-teaching-reset
- Saw: h1 "Sustainable Teaching Reset Guide" and no testimonial heading or invented quote.

Checked by reading document.body.innerText for the heading and for three of the
invented quotes, rather than by looking at a screenshot.

## What I did not press

Nothing that writes.

## Checked without the browser

npx tsc --noEmit exited 0. npm run lint reports warnings only on both changed
files, all of them pre-existing unused imports, and no errors.
