# Browser pass

## What this change touches

The team grid on /about. Sophia Castillo, Sales Prep, is replaced by Margot
Swanson, Publicist, photo and all.

## What I did

- Opened: http://localhost:3000/about
- Pressed: nothing. This screen has no controls, it is a grid of faces, so the
  pass is whether the right face appears under the right name.
- Saw: the card reading "Margot Swanson" above "Publicist", sitting in the
  position Sophia Castillo held, between Elena Vasquez on the row above and
  Nora Reeves beside her.
- Saw: her photograph rendered in the circular frame, a headshot of a smiling
  woman with long blonde hair against a concrete wall, matching the source file
  Rae put in Downloads. Zoomed the region to confirm the crop centres on the
  face rather than cutting it.
- Saw: "Sophia Castillo" appears nowhere on the page.
- Saw: `GET /team/margot-swanson.jpg` returned 200 and 254153 bytes.
  `GET /team/sophia-castillo.jpg` returned 404, which is correct, the file is
  deleted.

## The thing worth writing down

**The first screenshot showed no photograph for anybody**, Margot included, just
empty circles under every name. That reads exactly like a broken image path, and
a less careful pass would have reported the change as broken and gone hunting.

The images are lazy loaded. Scrolling up three ticks so the row entered the
viewport properly filled in every face at once, including hers. Nothing was
wrong. Worth remembering for the next person who screenshots this page: a blank
circle on /about means the row has not been scrolled into view yet, not that the
file is missing.

## What I did not press

Nothing on this screen sends, publishes, or writes. No controls to leave alone.

## What I could not verify

Production. This pass is against a local dev server, because the change is not
deployed yet. The page needs no authentication and reads from a TypeScript
constant rather than the database, so there is no live-data difference between
local and production here. Verify after deploy at
https://www.teachersdeserveit.com/about.

## Still open, and not mine to decide

Sophia is referenced in four other places that this change does not touch, and
they now disagree with the team page:

- `app/tdi-admin/docs/workflows/page.tsx` lists "Outreach Prep" as owned by
  "Sophia / Elena"
- `app/api/sales/outreach-queue/route.ts` and `pipeline-summary/route.ts` name
  her in comments as the agent who drafts outreach
- `lib/salesEmailTemplates.ts` names her as the drafter

Margot is a publicist, not sales prep, so she does not inherit any of that.
Rewriting those would be a statement about who owns sales outreach now, which is
Rae's call and not a side effect of swapping a photograph.
