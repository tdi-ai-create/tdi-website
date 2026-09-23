# Browser pass

## What this change touches

The conversation tab on every quick win, course and lesson page. Two new kinds
of post, a question and a note from TDI, and the TDI chip beside the author name.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts signed in as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns, so no member account was used
- Pressed: "Skip for today" on the Vibe Check popup, which covers the page with a full screen layer and swallows every click until it is dismissed
- Saw: the TDI chip rendering, twice, on the bylines "Rosalie Dunne TDI . Classroom Teacher . 11h ago" and "Everett Crane TDI . Para . 11h ago". The chip is the part of this work that had never been seen on a screen before.
- Saw: both of those cards labelled "Tried it", which is wrong. Rosalie's post is a question and Everett's is a note from TDI. Production does not carry the two new types yet, so getTypeConfig falls back to the first entry in the list.
- Saw: the filter row reading "All 6", "Tried it 1", "Adapted it 2", "Still trying 1", "Got stuck 0", "Didn't land 0". The five typed counts add to 4 against a total of 6, so the two new posts are uncounted as well as mislabelled.

This is the state before the merge. It is the reason the merge matters rather
than evidence that the change works.

## What I could not verify

The corrected labels, "Question" and "From TDI", and that neither appears in the
pulse bar. Those only exist once this branch is deployed.

- Deferred: the two new types are in the database and on this branch but not in
  production, so the corrected rendering cannot be seen until this merges.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts

## A correction worth recording

An earlier version of this file blamed the local session for the page not
rendering. That was wrong. The cause is the paywall: the 24 TDI voice accounts
hold no membership, and 275 of the 285 published tools sit above the free tier,
so those accounts see "This resource is available on a higher plan" instead of
the tool. Calm Response Scripts is one of the 10 free tools, which is why it
loaded. Tested, not assumed.

## What I did not press

The reply box on a TDI post. A reply would be a real row on a real tool page.

## Measured before shipping

14 posts across 7 Stress Relief tools, 0 repeated bodies, checked against all
552 distinct bodies already in the Hub. 24 accounts, all 24 healthy on aud,
role, instance_id and blank token columns. npx tsc --noEmit exited 0.
