# Browser pass

## What this change touches

The Content calendar inside Paperclip. It now shows Hub Quick Wins alongside
marketing queue work on the same month grid, and the mix strip above it is
scoped to the month on screen.

## What I did

- Opened: https://paperclip-railway-template-production.up.railway.app/TEA/content-calendar
  with plugin v0.5.1, version confirmed on the Plugin Manager page first.
- Saw: the mix strip reads "CHANNEL Hub 26 Substack 2 / AUDIENCE teachers 2",
  then "28 pieces on this month, cancelled work excluded. 8 more written and
  waiting for a day."
- Saw: Thursday 10 September carries "The ELL Empathy Audit", labelled
  "Hub · live". Friday 11 September begins with "Reset the Room: Whole-Class
  Regulation After It Escalates".
- Counted off the rendered page: 26 cards reading "Hub ·", of which 10 say
  "live" and 16 say "not live yet". That matches the database exactly: 26 Quick
  Wins dated in September, 10 published, 16 not.
- Pressed: "Previous" on the month navigation. Saw "August 2026", "0 pieces on
  this month, cancelled work excluded. 8 more written and waiting for a day",
  zero Hub cards, and "No day yet (8)" still listed underneath.
- Pressed: "Next". Saw "September 2026" and the 26 Hub cards redraw.
- Pressed: "Work through all 9". Saw the navy bar read "Piece 1 of 9", with
  "Back one piece" as the reverse control. No Hub item appeared in the sitting,
  which is correct: Hub work is read only here.

## What I did not press

I did not open or decide any Hub Quick Win. They are deliberately read only on
this screen. `is_published` is the field the Hub actually reads, so a control
that flipped it would publish to educators rather than plan, and the real
decision on these sixteen is a board approval in Paperclip that wakes the agent
that raised it.

I did not approve or send back any of the nine waiting marketing pieces. Those
are real drafts and eight of them are still waiting on Rae and Kristin.

## Anything that surprised me

Two things, both caught by doing this rather than reading it.

The plugin worker silently dropped the new `hub` field. It rebuilds the plan
response field by field rather than spreading it, so a field the API adds stays
invisible until the worker is told about it. A unit test caught that one, and
the identical shape had bitten the `history` field a day earlier.

The mix strip was counting every queue item regardless of month. Pressing
"Previous" showed August reporting "10 pieces in this month" when August has
none, because only the Hub half was month-scoped. That is now fixed: the strip
counts work dated into the month on screen, and reports undated work separately
rather than folding it in or dropping it. The first draft of this browser pass
claimed August showed an empty strip "which is correct". It did not, and I had
written that before pressing the button.

## Second pass, v0.6.0: Hub cards are clickable

Rae asked why the Hub items were not clickable. They were plain divs.

- Opened the calendar on v0.6.0 and counted from the rendered page: 10 cards are
  now `<a>` elements pointing at `/hub/quick-wins/<slug>` with `target="_blank"`,
  and 16 are still flat divs carrying the title "Not published yet, so there is
  no page to open. It is waiting on a board approval."
- Saw the first three hrefs resolve to real slugs: `ell-empathy-audit`,
  `whole-room-reset-regulation`, `student-shutdown-response-card`.
- Followed one: https://www.teachersdeserveit.com/hub/quick-wins/ell-empathy-audit
  Saw the real Quick Win page render, headed "The ELL Empathy Audit", tagged
  "Instructional Strategies", "5 min", "PDF Download", with Download Tool and
  Save to Library controls. Not a not-found state.

A check I threw away. `curl` returned HTTP 200 for the real slug and also 200
for `definitely-not-a-real-slug`, and both served a shell containing the words
"Not Found", because the Hub renders client side behind a login. The status code
could not fail, so it proved nothing. The observation above is from a signed-in
browser instead.

## What I did not press

I did not press Download Tool on the live Quick Win, and I did not answer the
Vibe Check that opened over it. Both write against a real educator account.
