# Browser pass

## What this change touches

The `/for-schools` page. The "Everything on this page, on paper" downloads
section is removed, along with the four offering one-pager PDFs it linked to.

## What I did

- Opened: http://localhost:3007/for-schools#downloads (local, the page is
  public so it needs no admin session)
- Saw: the page loaded at the top on the navy hero, "PD you can still defend in
  April." The `#downloads` fragment resolved to nothing and the browser did not
  jump, which is the first confirmation the section is gone.
- Scrolled: to the bottom of the page
- Saw: the FAQ ends on "What happens to our data if we don't renew?" and the
  next thing on the page is the navy finale reading "Ready to start the
  conversation?". No gap, no orphaned heading, and no downloads block between
  them.

- Checked the four PDF URLs directly:
  - `/downloads/the-pulse.pdf` returned 404
  - `/downloads/the-focus.pdf` returned 404
  - `/downloads/the-cohort.pdf` returned 404
  - `/downloads/the-blueprint.pdf` returned 404
- Checked the rendered HTML of `/for-schools`: 0 occurrences of `id="downloads"`,
  `fs-dl-grid`, or "Everything on this page, on paper", and 0 remaining links
  matching `downloads/the-*.pdf`. Page itself returned 200.

## What I did not press

Nothing was left unpressed. There are no interactive controls in this change,
because the change is a removal.

## What I could not verify

Whether anyone outside TDI already holds one of those four PDF links. Rae chose
to delete the files knowing old links would 404 rather than keep serving prices
that are now wrong.

The four unreferenced `the-*-overview.pdf` files in `public/downloads` are left
in place. They are price-stripped variants produced by
`scripts/strip-offering-prices.py` that were never linked from any page, so they
are outside the scope Rae approved.
