# Browser pass

## What this change touches

The hero on `/for-schools/whats-inside`. Rae's words on seeing it live: "dont
love this hero section, too messy, lighten up and place clickable sections below
in button like visuals."

The eight areas were a card beside the headline. They are now a band of tiles
below the hero, and the hero carries a headline, a paragraph and two buttons and
nothing else.

Each tile repeated, in the hero, the line the section states properly further
down, which is a good part of why it read as clutter. The tiles now carry the
label alone.

## What I did

- Opened: http://localhost:3000/for-schools/whats-inside at 1440 by 900.
- Saw: the hero is one column, ending at "See what is in there". Below it, on
  white, the label "WHAT SCHOOLS KEEP ASKING US FOR" and eight pill shaped tiles:
  Behavior, Instructional planning, Paras, The first weeks, Families, Leading
  adults, Teacher load, AI and technology. Each carries a small square in its
  section colour.
- Pressed: the "Paras" tile.
- Saw: the URL became `#paras`. Measured the section position twice, because the
  first read caught the smooth scroll mid flight at 621px. Once settled it read
  24px from the top of the viewport, which is the `scroll-margin-top` on the
  block doing its job.
- Saw at 390 by 844: the headline balances onto two lines rather than orphaning
  the word "get", and the tiles wrap to three rows.
- Console after a clean load: 0 errors, 1 warning, and the warning is the
  pre-existing logo aspect ratio notice from the site header.

## What I did not press

Print. That was exercised in `whats-inside-the-hub.md`, and this change does not
touch it.

## What I could not verify

Production, because this has not been deployed yet.
Verify after deploy: https://www.teachersdeserveit.com/for-schools/whats-inside

One thing worth recording rather than hiding. While editing with the page open, a
React hydration mismatch appeared in the console inside a `details` element. A
clean reload reported 0 errors, and it arrived immediately after a Fast Refresh
rebuild, so I am treating it as a dev artifact. It is written down here so that if
it ever appears in production, nobody starts from scratch.
