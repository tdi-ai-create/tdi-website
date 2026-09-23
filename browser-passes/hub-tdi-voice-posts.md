# Browser pass

## What this change touches

The conversation tab on every quick win, course and lesson page. Two new kinds
of post, a question and a note from TDI, and the TDI chip beside the author name.

## What I did

- Opened: http://localhost:3001/hub/quick-wins/end-of-day-educator-reset
- Signed in as: marisol.aguirre@voices.teachersdeserveit.com, a TDI voice
  account we own, through an admin magic link. No member account was used.
- Saw: the page loaded without bouncing to login, url stayed
  "/hub/quick-wins/end-of-day-educator-reset", but the conversation section
  rendered nothing. h1 came back as "" and the count of TDI chips was 0.

The local server is running this branch and the API on it returns the data.
Queried directly it answers with author "Rae Hughart" and `is_tdi_voice: true`
on one post and `false` on the five others for the same tool.

## What I did not press

The reply box on a TDI post, because the reply would be a real row on a real
tool page.

## What I could not verify

That the chip and the two new tags render to a person. The local app signs a
session in against the live domain rather than localhost, so the page loads
but the community section does not populate.

- Deferred: local app authenticates against the production domain, so the
  conversation section never receives a session it accepts.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/end-of-day-educator-reset

## Measured before shipping

- 14 posts written across 7 Stress Relief tools, 0 repeated bodies, checked
  against all 552 distinct existing bodies.
- 24 TDI voice accounts exist, all 24 healthy on aud, role, instance_id and
  blank token columns.
- `npx tsc --noEmit` exited 0 in a clean worktree.
