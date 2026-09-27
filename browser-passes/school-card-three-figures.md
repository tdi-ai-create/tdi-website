# Browser pass

## What this change touches

The school cards on the Schools view. They showed one money line. They now show
three, because the card was being asked three different questions and a single
headline could not answer any two of them.

## What I did

Run locally against the live database. Signed in as Review Admin.

- Opened: http://localhost:3000/tdi-admin/funding?view=schools
- Pressed: nothing. This view reads and does not write.
- Saw, on Saunemin CCSD #438: WON "none recorded", STILL TO FIND "$15,552",
  WRITING FOR "$33,250", above "7 live paths, 1 won, 1 without an amount".
- Saw, on (RENEWAL) Allenwood Elementary: WON "none recorded", STILL TO FIND
  "$56,372.80", WRITING FOR "$25,000", above "6 live paths, 0 won".
- Saw, on St. Peter Chanel School: WON "none recorded", STILL TO FIND
  "$15,750", WRITING FOR "$19,250", above "9 live paths, 0 won".
- Saw: WON reads "none recorded" rather than "$0". Saunemin has a win whose
  amount nobody wrote down, and a zero there would read as a loss rather than a
  gap. The line above the figures still says "1 won, amount not recorded".

## What the three mean, and why they are three

- **Won** is what actually landed, summed from recorded award amounts only.
- **Still to find** is the plan value minus what landed. It is the gap.
- **Writing for** is the ask on every path still in play. It is not money and
  it is not a forecast: it is what we are currently trying for.

Writing for is deliberately not netted against the other two. Saunemin is
writing for $33,250 against a $15,552 gap, which is the real picture, and a
single blended number would hide that we are pursuing more than the plan needs.

## What I could not verify

Production, because this is not merged.

Whether "writing for" should exclude paths that are only at research. Today it
counts every live path with an ask on it. Six of Saunemin's seven carry no
amount at all, so the figure is driven by the one that does.

## Claim tiers

- Measured: every figure above, read off the screen.
- Unverified: production.
