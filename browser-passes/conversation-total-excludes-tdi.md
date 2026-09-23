# Browser pass

## What this change touches

The conversation section on quick win, course and lesson pages. The count above
the bars no longer includes notes written by TDI.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup, which blocks every click until dismissed
- Saw: the filter row reading "All 6", "Tried it 1", "Adapted it 2", "Still trying 1", "Got stuck 0", "Didn't land 0", "Question 1". Six posts claimed, five accounted for by type, because the sixth is Everett Crane's "From TDI" note.
- Saw: the two new tags rendering correctly for the first time, "Question" on Rosalie Dunne's post and "From TDI" on Everett Crane's, both carrying the TDI chip. Before this morning's deploy both read "Tried it".
- Saw: the heading over the bars counts that TDI note as one of the teachers in the conversation, which is what this change removes.

## What I could not verify

The corrected count. It needs this branch deployed.

- Deferred: the count is computed server side and the fix is not in production yet.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts the heading should read one lower than the "All" chip on any tool carrying a From TDI note.

## What I did not press

Nothing that writes. The page was read, not used.
