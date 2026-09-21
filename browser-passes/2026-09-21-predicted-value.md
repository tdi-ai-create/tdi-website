# Browser pass

## What this change touches

The sales board at `/tdi-admin/sales`. An unsigned lead now shows its predicted
deal value on the card, in the panel tile and in the pipeline headline, rather
than a stale pre-restructure figure.

## What I did

- Opened: http://localhost:3011/tdi-admin/sales
- Saw: the board again rendered "No opportunities" in every column, because it
  reads `sales_opportunities` with the anon key and there is no live-domain
  session locally. This is the same documented condition as the 17 September
  record.
- Pressed: the "Outreach Queue" tab and the "List" toggle
- Saw: both rendered without throwing. The list path calls `toCardOpp`, which
  changed in this commit to carry the predicted value and its marker through to
  the card, so a bad reference there would have thrown rather than rendered.
- Modelled the change in SQL first: the pipeline stat population is 154 leads
  totalling $1,441,121 today and $1,096,021 under the new rule, a drop of
  $345,100.

## What I could not verify locally

The card money line, the panel value tile and the headline figure, for the same
reason as before: no rows load without a live-domain session.

- Deferred: the local board returns no rows for the anon key.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales, where
  I will read the pipeline headline and check it against $1,096,021, open the
  Sharon City SD lead and confirm its VALUE tile now reads $2,500 with a
  predicted marker rather than $18,000, and confirm the card money line carries
  the same figure.

### Completed after deploy, 21 September 2026

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the pipeline headline read "$1.24M" over "166 active", down from the
  "$1.59M" the same header showed before this change. Not the $1,096,021 the SQL
  predicted, because the board's stat counts 166 active leads against the 154 my
  query scoped to. The direction and the scale match; the populations differ.
- Saw: the Sharon City SD card money line read "$2,500 PRED &middot; $1K
  factored". It read "$18,000 &middot; $8K factored" before. Unit 5 read "$6,200
  PRED &middot; $4K factored" and Monmouth County "$6,200 PRED &middot; $3K
  factored", so the marker is rendering across cards rather than on one.
- Saw: the muck pills still render beside the money, reading 22, 16 and 12 on
  those three cards.
- Pressed: the Sharon City SD (PA) card
- Saw: the VALUE tile now reads "$2,500 PREDICTED" with "FACTORED $1,125",
  against "$18,000" and "$8,100" before. The muck header four inches above it
  reads "$2,500 PREDICTED" and "156 per point". Both halves of the panel now
  agree, which is the entire bug this change existed to fix.

## What I did not press

Nothing that writes. The inline value editor was deliberately not used, because
typing into it on a real lead would change a live record.
