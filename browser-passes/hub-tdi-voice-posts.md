# Browser pass

## What this change touches

The conversation tab on every quick win, course and lesson page. Two new kinds
of post, a question and a note from TDI, and the TDI chip beside the author name.

## What I did

- Opened:
- Pressed:
- Saw:

Waiting on the deploy. What happened locally is written below rather than on
those lines, because a local attempt that never rendered the section is not an
observation of this change.

## The local attempt

Ran the branch on localhost:3001 and signed in as
marisol.aguirre@voices.teachersdeserveit.com, a TDI voice account we own,
through an admin magic link. No member account was involved.

The page stopped bouncing to login and the url stayed on
/hub/quick-wins/end-of-day-educator-reset, but the conversation section never
populated. The h1 came back empty and the chip count came back 0. Querying the
same branch's API directly returns the data it needs, with is_tdi_voice true on
one author and false on five others for that tool, so the gap is the session
rather than the code.

## What I did not press

The reply box on a TDI post. A reply would be a real row on a real tool page.

## What I could not verify

That the chip and the two new tags render to a person.

- Deferred: the local app signs its session against the live domain, so the
  Hub page loads but the community section never accepts it.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/end-of-day-educator-reset

## Measured before shipping

14 posts written across 7 Stress Relief tools, with 0 repeated bodies, checked
against all 552 distinct bodies already in the Hub. 24 TDI voice accounts exist
and all 24 are healthy on aud, role, instance_id and blank token columns.
npx tsc --noEmit exited 0 in a clean worktree.
