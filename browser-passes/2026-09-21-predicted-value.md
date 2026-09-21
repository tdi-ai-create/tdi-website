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

## What I did not press

Nothing that writes. The inline value editor was deliberately not used, because
typing into it on a real lead would change a live record.
