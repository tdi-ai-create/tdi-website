# Browser pass

## What this change touches

The live year tab. A partnership with nobody on its roster now says so itself.

## Why

Rae, 1 October 2026, on Allenwood: "we should email her a reminder but then we
can just update the design so when we have the roster, we can easily update it".

Allenwood has eleven contracted sessions, none used, a visit booked for
18 November, and a dashboard whose principal was sent the link on 29 September.
It has no roster at all, so no Hub accounts exist and every figure on the page
counts nobody.

I had written that ask by hand into Allenwood's stored year record. That was
wrong in the way this whole standard exists to prevent: the moment Sharon sends
the roster, the record would still say "Hub access is ready to switch on" until
a person remembered to go and edit it. L6.1 says state is derived from data,
never set by hand.

## What I did

- Opened: http://localhost:3000/partners/allenwood-elementary-2627
- Pressed: the "2026-2027" tab
- Saw: one block headed "Waiting on one thing from you" and "Your educator
  roster", counted at exactly **1** occurrence, so the derived block and the
  hand-written one are not both rendering. The hand-written version was removed
  from the stored record in the same change.
- Opened: http://localhost:3000/partners/glen-ellyn-d41
- Pressed: the "2026-2027" tab
- Saw: the roster block does **not** render, and "**Your next 3**" renders in its
  place.

Glen Ellyn has 9 people and Allenwood has none, and the page shows a different
thing for each without anybody choosing. That is the proof it is derived.

## What this means operationally

When Sharon's roster lands, nothing needs rewriting. The block disappears, the
activation block takes over, and the figures fill in from live Hub data. Nobody
has to remember.

## What I could not verify

Production, a separate deploy.

The transition itself. I verified the two end states on two real partnerships,
not by adding a roster to Allenwood and watching it flip.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
