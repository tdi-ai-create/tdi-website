# Browser pass

## What this change touches

A new public page at `/for-schools/whats-inside`, the buyer facing catalogue of
the Learning Hub, plus one new link to it from the comparison table on
`/for-schools`.

## What I did

- Opened: http://localhost:3000/for-schools/whats-inside on a local dev server
  against the live Hub database.
- Saw: the navy hero with "What your staff would actually get", and the card
  headed "What schools keep asking us for" listing all eight areas, Behavior
  through AI and technology, each with a coloured square.
- Pressed: "Paras" in that hero card.
- Saw: the URL became `/for-schools/whats-inside#paras` and the page scrolled to
  "The staff who get the least support", with the note "The Cohort is built for
  exactly this group. The Blueprint carries it district wide."
- Saw: four items in that section, "PA Quick Wins Menu" carrying a TRENDING
  badge and "Autism Acceptance Month Organization Directory + School Partnership
  Guide" carrying a POPULAR badge.
- Pressed: "Everything in this section" in the paras section.
- Saw: the marker changed from plus to minus and a two column list opened,
  beginning "Professional Email Practices Quick Reference Guide TOOL" and "The
  Teacher-Para Partnership Planner TOOL".
- Pressed: "Print this page with every tool listed".
- Saw: all 8 accordions open at once and 243 rows present in the expanded lists,
  read back from the DOM as `detailsOpenAfterClick: 8, rowsNowVisible: 243`.
  243 is exactly the 275 assigned items minus the 32 shown at rest.
- Saw: after the print finished, the count of open accordions returned to 0, so
  the page is left as the reader had it.
- Opened: the same URL at a 390 by 844 viewport in Playwright.
- Saw: a single column, "Book twenty minutes" and "See what is in there" stacked
  vertically, and the areas card moved below the hero text.

Counts read from the served HTML: 8 section blocks, 32 featured items, 8 hero
card rows, 243 rows across the expanded lists. Badges rendered: 2 Most used,
3 Trending, 4 Popular, 1 New.

### The new content-sync action and the health check

- Called: `POST /api/hub/content-sync` with
  `{"action":"set_section","slug":"first-10-minutes-framework","hub_section":"first_weeks","hub_section_pin":1,"dryRun":true}`
- Saw: `"dryRun": true` with `before.hub_section_pin: null` and
  `would_set: {hub_section: "first_weeks", hub_section_pin: 1}`. Queried the
  table afterwards: 0 rows had a pin, so the dry run wrote nothing.
- Called: the same request without `dryRun`.
- Saw: `"verified": true`, and the table then had exactly 1 row with a pin.
- Called: `set_section` with `hub_section: "behaviour"`, the British spelling.
- Saw: `"hub_section must be one of: behavior, instructional_planning, paras,
  first_weeks, families, leading, teacher_load, ai_technology. Got
  \"behaviour\"."`
- Called: `set_section` with `hub_badge: "most_used"`.
- Saw: it was refused, with "Most used, Trending, Popular and New are computed
  from real usage and cannot be set by hand."
- Pinned "Friday Take-Home Folder Checklist", which was not in the top four, and
  reloaded the page.
- Saw: the first weeks section read The First 10 Minutes Framework, Friday
  Take-Home Folder Checklist, The Noise Level System, Back-to-School Overwhelm
  Reset. It had moved into second place.
- Unpinned it and reloaded.
- Saw: it dropped out of the four again. Both directions work, so the pin is
  doing the ordering rather than coinciding with it.
- Opened: `http://localhost:3000/api/cron/hub-content-health`
- Saw: "6 Quick Wins published in the last 14 days have no hub_section, so they
  are missing from /for-schools/whats-inside", naming Creative Ideas for Working
  With Rigid Seating and Creative Ideas for Construction Paper among them. The
  same query in SQL also returned 6.
- That was a real fault in my own curation, not a false positive. The exclusion
  list is written around trade and material tags and had swallowed the whole
  Creative Ideas series. Assigned those to instructional planning and ran the
  check again.
- Saw: zero whats-inside issues. The check clears when the problem is fixed, so
  it can both fail and pass.

## What I did not press

The real print dialog. `window.print` was replaced with a counter first, because
a native print dialog blocks the automation session. The counter read 1 after
the click, so the button did call print. The `afterprint` restore was then
exercised by dispatching the event and re-reading the DOM.

Nothing on this page writes, sends, or opens a document, so there was nothing
else to leave alone.

The health check email. `.env.local` carries no `RESEND_API_KEY`, only a webhook
secret, so the send branch was skipped on the first run. The second run was
started with a deliberately fake key in the shell environment, which takes
precedence over the env file. No alert reached Rae from either run.

## What I could not verify

The printed output itself. I verified that every section is expanded when print
is called and that the print stylesheet exists, but I have not seen a rendered
PDF or a sheet of paper, so the page breaks and the dropped navy background are
unproven.

Production. Vercel previews still return 500, so this pass is local only.
Verify after deploy: https://www.teachersdeserveit.com/for-schools/whats-inside

Spanish. This page does not go through `tUI()`. Neither does the rest of
`/for-schools`, which it sits under and matches, so this is consistent with the
surrounding pages rather than a decision I made for the Hub.
