# Browser pass, funding board, 15 September 2026

## What this change touches

The funding board and the two screens either side of it. Whose work an item is,
what a grant was awarded, and whether a card should tell anyone to chase a
writer.

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding
- Saw: "Needs you 23" in the tab and 23 in the stat beneath it. Those disagreed
  before this work, 31 against 23, four pixels apart.
- Saw: a "Rae decides" column with 8 in it, holding "Washington Commanders
  Charitable Foundation" and "MGM National Harbor / Community Foundation".
- Saw: "Awarded $0" with "2 more not recorded" underneath. It read "Awarded $5K
  received" before, for a grant whose funder email says $500.
- Saw: "Still to find $87.7K", up from $82.7K, because a receipt that never
  existed is no longer subtracted from the pipeline.
- Saw: the Researching column now says "Research came back without an answer. It
  is on your list now" on Pepco/Exelon, Washington Commanders and MGM. All three
  said "Agent checking eligibility and dates" before, while the same question
  sat on Bella's own list.

- Pressed: "Write to the school" on the Pepco/Exelon card
- Saw: nothing. The first click did not navigate, because the page had not
  finished hydrating. Worth knowing: Bella will hit this.
- Pressed: it again
- Saw: the drafted email opened, addressed to teri.gordonhernandez@pgcps.org,
  subject "Heads up on the Pepco/Exelon Foundation - Energizing Student
  Potential (ESP) Mini-Grants application for Allenwood Elementary", carrying the
  line "What we need from you: confirm whether the application has been
  submitted, and forward us the confirmation email so we can close it off."
- Saw: the date rendered as "15 September" rather than 2026-09-15.

- Pressed: the Schools tab
- Saw: "Ready for You (6)" listing "Washington Commanders Charitable Foundation:
  decide whether to keep pursuing it" badged "You". That was wrong and is what
  PR #494 fixed.

- Pressed: the Funders tab
- Saw: "18 funders, none researched." Cox Charities was absent, because the
  grant had been created without a funder record.

- Pressed: the Awarded tab
- Saw: "$5K awarded across 2 grants" with Walmart Spark Good at $5K. That is the
  figure Bella reported as wrong, and it was the ask rather than the award.

## What I did not press

Send, on the drafted email. That would have emailed Teri Gordon Hernandez a real
message. Pressed Cancel and confirmed the modal closed.

Approve, on any real creator or grant. Closing somebody's live work to prove a
button renders is not a test worth running.

## What I could not verify

Whether the first-click-does-nothing behaviour is hydration or something slower.
I saw it twice and worked around it both times rather than diagnosing it.

Whether the board behaves correctly for a school with no contact on file. There
is no such school in the data today.
